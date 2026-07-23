import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import prisma from './utils/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      socket.userId = decoded.userId
      socket.username = decoded.username
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.username} (${socket.id})`)

    // ─── Community Chat ───
    socket.on('join_community', async (communityId) => {
      // Verify user is a member of this community
      const member = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId: socket.userId,
          },
        },
      })

      if (!member) {
        return socket.emit('error', { message: 'You are not a member of this community' })
      }

      socket.join(`community:${communityId}`)
      console.log(`${socket.username} joined community:${communityId}`)
    })

    socket.on('leave_community', (communityId) => {
      socket.leave(`community:${communityId}`)
      console.log(`${socket.username} left community:${communityId}`)
    })

    socket.on('send_message', async (data) => {
      try {
        const { communityId, content, fileUrl, fileType, fileName, fileSize, fileMime, replyToId } = data

        // Verify membership before sending
        const member = await prisma.communityMember.findUnique({
          where: {
            communityId_userId: {
              communityId,
              userId: socket.userId,
            },
          },
        })

        if (!member) {
          return socket.emit('error', { message: 'You are not a member of this community' })
        }

        const message = await prisma.message.create({
          data: {
            communityId,
            senderId: socket.userId,
            content,
            fileUrl: fileUrl || null,
            fileType: fileType || null,
            replyToId: replyToId || null,
          },
          include: {
            sender: { select: { id: true, username: true, role: true } },
            replyTo: {
              include: {
                sender: { select: { id: true, username: true, role: true } },
              },
            },
          },
        })

        io.to(`community:${communityId}`).emit('new_message', { ...message, fileName, fileSize, fileMime })
      } catch (err) {
        console.error('send_message error:', err)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // ─── Direct Messages ───
    socket.on('join_dm', (conversationId) => {
      // Verify the user is part of this DM conversation
      const [userId1, userId2] = conversationId.split(':')
      if (socket.userId !== userId1 && socket.userId !== userId2) {
        return socket.emit('error', { message: 'Not authorized for this conversation' })
      }
      socket.join(`dm:${conversationId}`)
    })

    socket.on('send_dm', async (data) => {
      try {
        const { receiverId, content } = data

        const dm = await prisma.directMessage.create({
          data: {
            senderId: socket.userId,
            receiverId,
            content,
          },
          include: {
            sender: { select: { id: true, username: true, role: true } },
            receiver: { select: { id: true, username: true, role: true } },
          },
        })

        // Send to both users' DM rooms
        const conversationId = [socket.userId, receiverId].sort().join(':')
        io.to(`dm:${conversationId}`).emit('new_dm', dm)
      } catch (err) {
        console.error('send_dm error:', err)
        socket.emit('error', { message: 'Failed to send DM' })
      }
    })

    // ─── Typing Indicators ───
    socket.on('typing', (data) => {
      const { communityId, conversationId } = data
      if (communityId) {
        socket.to(`community:${communityId}`).emit('user_typing', {
          userId: socket.userId,
          username: socket.username,
        })
      }
      if (conversationId) {
        socket.to(`dm:${conversationId}`).emit('user_typing', {
          userId: socket.userId,
          username: socket.username,
        })
      }
    })

    socket.on('stop_typing', (data) => {
      const { communityId, conversationId } = data
      if (communityId) {
        socket.to(`community:${communityId}`).emit('user_stopped_typing', {
          userId: socket.userId,
        })
      }
      if (conversationId) {
        socket.to(`dm:${conversationId}`).emit('user_stopped_typing', {
          userId: socket.userId,
        })
      }
    })

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.username}`)
    })
  })

  return io
}