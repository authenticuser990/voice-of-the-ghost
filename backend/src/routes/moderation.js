import express from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../utils/prisma.js'

const router = express.Router()

function isAdmin(role) {
  return role === 'SAGE' || role === 'BOTH'
}

function logAction(adminId, action, targetId, targetType, details) {
  return prisma.moderationLog.create({
    data: { adminId, action, targetId, targetType, details: details ? JSON.stringify(details) : null }
  })
}

// ─── Delete a post ───
router.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    await prisma.post.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    })

    await logAction(req.user.userId, 'DELETE_POST', req.params.id, 'POST', {
      postTitle: post.title,
      postAuthorId: post.userId,
    })

    res.json({ message: 'Post deleted' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// ─── Delete a comment ───
router.delete('/comments/:id', authenticate, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const comment = await prisma.postComment.findUnique({ where: { id: req.params.id } })
    if (!comment) return res.status(404).json({ error: 'Comment not found' })

    await prisma.postComment.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    })

    await logAction(req.user.userId, 'DELETE_COMMENT', req.params.id, 'COMMENT', {
      commentAuthorId: comment.userId,
      postId: comment.postId,
    })

    res.json({ message: 'Comment deleted' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

// ─── Ban a user ───
router.post('/bans', authenticate, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { userId, reason, banType, duration } = req.body

    if (!userId || !reason || !banType) {
      return res.status(400).json({ error: 'userId, reason, and banType are required' })
    }

    if (!['TEMPORARY', 'PERMANENT'].includes(banType)) {
      return res.status(400).json({ error: 'banType must be TEMPORARY or PERMANENT' })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return res.status(404).json({ error: 'User not found' })

    // Deactivate existing active bans
    await prisma.ban.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    })

    let expiresAt = null
    if (banType === 'TEMPORARY' && duration) {
      expiresAt = new Date(Date.now() + duration * 60000)
    }

    const ban = await prisma.ban.create({
      data: {
        userId,
        adminId: req.user.userId,
        reason,
        banType,
        duration: banType === 'TEMPORARY' ? duration : null,
        expiresAt,
      }
    })

    await logAction(req.user.userId, 'BAN_USER', userId, 'USER', {
      banType,
      reason,
      banId: ban.id,
    })

    // Add a strike record
    const userStrikes = await prisma.ban.count({ where: { userId } })
    const strikeMessage = userStrikes >= 3
      ? 'User banned — 3 strikes reached. Further violations may result in permanent ban.'
      : `Ban applied (strike ${userStrikes}/3)`

    res.json({ message: strikeMessage, ban, strikes: userStrikes })
  } catch (error) {
    console.error('Ban error:', error)
    res.status(500).json({ error: 'Failed to ban user' })
  }
})

// ─── Lift a ban ───
router.patch('/bans/:id/lift', authenticate, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const ban = await prisma.ban.findUnique({ where: { id: req.params.id } })
    if (!ban) return res.status(404).json({ error: 'Ban not found' })
    if (!ban.isActive) return res.status(400).json({ error: 'Ban is already inactive' })

    await prisma.ban.update({
      where: { id: req.params.id },
      data: { isActive: false, liftedAt: new Date(), liftedById: req.user.userId }
    })

    await logAction(req.user.userId, 'LIFT_BAN', req.params.id, 'BAN', {
      userId: ban.userId,
      originalReason: ban.reason,
    })

    res.json({ message: 'Ban lifted' })
  } catch (error) {
    console.error('Lift ban error:', error)
    res.status(500).json({ error: 'Failed to lift ban' })
  }
})

// ─── Get user's ban/strike status ───
router.get('/bans/:userId', authenticate, async (req, res) => {
  try {
    if (!isAdmin(req.user.role) && req.user.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const activeBan = await prisma.ban.findFirst({
      where: { userId: req.params.userId, isActive: true }
    })

    const strikes = await prisma.ban.count({ where: { userId: req.params.userId } })
    const totalBans = await prisma.ban.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      isBanned: !!activeBan,
      activeBan,
      strikes,
      totalBans,
    })
  } catch (error) {
    console.error('Get ban status error:', error)
    res.status(500).json({ error: 'Failed to get ban status' })
  }
})

// ─── Check if current user is banned (used as middleware) ───
router.get('/check', authenticate, async (req, res) => {
  try {
    const activeBan = await prisma.ban.findFirst({
      where: { userId: req.user.userId, isActive: true }
    })

    if (activeBan) {
      const isExpired = activeBan.expiresAt && new Date(activeBan.expiresAt) < new Date()
      if (isExpired) {
        await prisma.ban.update({
          where: { id: activeBan.id },
          data: { isActive: false, liftedAt: new Date() }
        })
        return res.json({ isBanned: false })
      }
      return res.json({ isBanned: true, ban: activeBan })
    }

    res.json({ isBanned: false })
  } catch (error) {
    console.error('Ban check error:', error)
    res.status(500).json({ error: 'Failed to check ban status' })
  }
})

// ─── Mark a post as NSFW ───
router.patch('/posts/:id/nsfw', authenticate, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: { isUncensored: true }
    })

    await logAction(req.user.userId, 'MARK_NSFW', req.params.id, 'POST', {
      postTitle: post.title,
      postAuthorId: post.userId,
    })

    res.json({ message: 'Post marked as NSFW', post: updated })
  } catch (error) {
    console.error('Mark NSFW error:', error)
    res.status(500).json({ error: 'Failed to mark post as NSFW' })
  }
})

// ─── Get moderation logs ───
router.get('/logs', authenticate, async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { limit = 100, offset = 0 } = req.query

    const logs = await prisma.moderationLog.findMany({
      include: {
        admin: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    })

    const total = await prisma.moderationLog.count()

    res.json({ logs, total })
  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({ error: 'Failed to fetch moderation logs' })
  }
})

export default router
