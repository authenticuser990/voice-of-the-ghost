import express from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Get user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    res.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// Mark a notification as read (only own notifications)
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    // Verify the notification belongs to the current user
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to modify this notification' })
    }

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    })

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark notification read error:', error)
    res.status(500).json({ error: 'Failed to update notification' })
  }
})

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true }
    })

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    res.status(500).json({ error: 'Failed to update notifications' })
  }
})

// Get unread notification count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.userId, isRead: false }
    })
    res.json({ count })
  } catch (error) {
    console.error('Unread count error:', error)
    res.status(500).json({ error: 'Failed to get unread count' })
  }
})

// Save mute settings for a community
router.post('/mute', authenticate, async (req, res) => {
  try {
    const { communityId, muteType, duration } = req.body

    const muteSetting = await prisma.muteSetting.upsert({
      where: {
        userId_communityId: {
          userId: req.user.userId,
          communityId
        }
      },
      create: {
        userId: req.user.userId,
        communityId,
        muteType,
        duration
      },
      update: {
        muteType,
        duration,
        isActive: true
      }
    })

    res.json(muteSetting)
  } catch (error) {
    console.error('Mute setting error:', error)
    res.status(500).json({ error: 'Failed to save mute setting' })
  }
})

export default router