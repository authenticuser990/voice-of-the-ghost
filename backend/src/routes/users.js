import express from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Get all users (public)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        role: true,
        profile: {
          select: { displayName: true, bio: true, profileImageUrl: true }
        }
      },
      take: 50
    })

    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get a single user by username
router.get('/:username', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            displayName: true,
            bio: true,
            location: true,
            gender: true,
            personality: true,
            profileImageUrl: true,
            dateOfBirth: true,
            isVisible: true,
            interests: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Follow a user
router.post('/:username/follow', authenticate, async (req, res) => {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { username: req.params.username }
    })

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (targetUser.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: targetUser.id
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      })
      return res.json({ message: 'Unfollowed successfully' })
    }

    const follower = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { username: true }
    })

    await prisma.follow.create({
      data: {
        followerId: req.user.userId,
        followingId: targetUser.id
      }
    })

    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'FOLLOW',
        referenceId: req.user.userId,
        message: `${follower.username} started following you`
      }
    })

    res.json({ message: 'Followed successfully' })
  } catch (error) {
    console.error('Follow error:', error)
    res.status(500).json({ error: 'Failed to follow user' })
  }
})

export default router