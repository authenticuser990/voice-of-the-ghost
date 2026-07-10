import express from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Block a user
router.post('/:userId', authenticate, async (req, res) => {
  try {
    const targetId = req.params.userId

    if (targetId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot block yourself' })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetId } })
    if (!targetUser) return res.status(404).json({ error: 'User not found' })

    // Check if already blocked
    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: req.user.userId, blockedId: targetId } }
    })

    if (existing) {
      return res.status(409).json({ error: 'User is already blocked' })
    }

    await prisma.block.create({
      data: { blockerId: req.user.userId, blockedId: targetId }
    })

    res.json({ message: 'User blocked' })
  } catch (error) {
    console.error('Block error:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'User is already blocked' })
    }
    res.status(500).json({ error: 'Failed to block user' })
  }
})

// Unblock a user
router.delete('/:userId', authenticate, async (req, res) => {
  try {
    const targetId = req.params.userId

    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: req.user.userId, blockedId: targetId } }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Block not found' })
    }

    await prisma.block.delete({
      where: { blockerId_blockedId: { blockerId: req.user.userId, blockedId: targetId } }
    })

    res.json({ message: 'User unblocked' })
  } catch (error) {
    console.error('Unblock error:', error)
    res.status(500).json({ error: 'Failed to unblock user' })
  }
})

// Get blocked users
router.get('/', authenticate, async (req, res) => {
  try {
    const blocks = await prisma.block.findMany({
      where: { blockerId: req.user.userId },
      include: {
        blocked: { select: { id: true, username: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(blocks)
  } catch (error) {
    console.error('Get blocks error:', error)
    res.status(500).json({ error: 'Failed to fetch blocked users' })
  }
})

// Check if user is blocked by or has blocked another user
router.get('/check/:userId', authenticate, async (req, res) => {
  try {
    const targetId = req.params.userId

    const [blockedByMe, blockedMe] = await Promise.all([
      prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: req.user.userId, blockedId: targetId } }
      }),
      prisma.block.findUnique({
        where: { blockerId_blockedId: { blockerId: targetId, blockedId: req.user.userId } }
      })
    ])

    res.json({
      blockedByMe: !!blockedByMe,
      blockedMe: !!blockedMe,
    })
  } catch (error) {
    console.error('Check block error:', error)
    res.status(500).json({ error: 'Failed to check block status' })
  }
})

export default router
