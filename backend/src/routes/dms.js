import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { z } from 'zod'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Validation schema for sending a DM
const sendDMSchema = z.object({
  receiverUsername: z.string().min(1),
  content: z.string().min(1).max(2000),
})

// Send a direct message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverUsername, content } = sendDMSchema.parse(req.body)

    const receiver = await prisma.user.findUnique({
      where: { username: receiverUsername }
    })

    if (!receiver) {
      return res.status(404).json({ error: 'Recipient not found' })
    }

    if (receiver.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot message yourself' })
    }

    const dm = await prisma.directMessage.create({
      data: {
        senderId: req.user.userId,
        receiverId: receiver.id,
        content
      },
      include: {
        sender: { select: { username: true, role: true } },
        receiver: { select: { username: true, role: true } }
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: receiver.id,
        type: 'DM_RECEIVED',
        referenceId: dm.id,
        message: `${req.user.username} sent you a message`
      }
    })

    res.status(201).json(dm)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Send DM error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Get conversations (list of users you've DMed) — with correct ordering
router.get('/conversations', authenticate, async (req, res) => {
  try {
    // Get all DMs involving the current user, ordered by most recent first
    const allDMs = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.userId },
          { receiverId: req.user.userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, role: true } },
        receiver: { select: { id: true, username: true, role: true } }
      }
    })

    // Deduplicate by conversation partner, keeping only the most recent message per conversation
    const conversationMap = new Map()

    for (const dm of allDMs) {
      const partnerId = dm.senderId === req.user.userId ? dm.receiverId : dm.senderId
      const partner = dm.senderId === req.user.userId ? dm.receiver : dm.sender

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          user: partner,
          lastMessage: dm.content,
          lastMessageAt: dm.createdAt
        })
      }
    }

    // Sort by most recent message first
    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    )

    res.json(conversations)
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ error: 'Failed to get conversations' })
  }
})

// Get messages between two users
router.get('/:username', authenticate, async (req, res) => {
  try {
    const otherUser = await prisma.user.findUnique({
      where: { username: req.params.username }
    })

    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: req.user.userId, receiverId: otherUser.id },
          { senderId: otherUser.id, receiverId: req.user.userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { username: true, role: true } }
      }
    })

    // Mark messages as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: otherUser.id,
        receiverId: req.user.userId,
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    })

    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router