import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { z } from 'zod'
import prisma from '../utils/prisma.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Validation schema for creating a post
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  category: z.enum([
    'MENTAL_HEALTH', 'FRIENDS', 'LONELINESS_AND_LEFT_OUT', 
    'BROKEN_HEARTED', 'BULLIED', 'HARASSED', 'SELF_HARM', 
    'JOY', 'OTHERS', 'VENT'
  ]),
  emotion: z.enum([
    'HAPPY', 'CALM', 'SAD', 'DEPRESSED', 'ANXIOUS', 
    'ANGRY', 'FRUSTRATED', 'HOPEFUL', 'NUMB', 'OVERWHELMED'
  ]),
  isVent: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
  isUncensored: z.boolean().optional()
})

// Validation schema for updating a post
const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  category: z.enum([
    'MENTAL_HEALTH', 'FRIENDS', 'LONELINESS_AND_LEFT_OUT', 
    'BROKEN_HEARTED', 'BULLIED', 'HARASSED', 'SELF_HARM', 
    'JOY', 'OTHERS', 'VENT'
  ]).optional(),
  emotion: z.enum([
    'HAPPY', 'CALM', 'SAD', 'DEPRESSED', 'ANXIOUS', 
    'ANGRY', 'FRUSTRATED', 'HOPEFUL', 'NUMB', 'OVERWHELMED'
  ]).optional(),
  isVent: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
  isUncensored: z.boolean().optional()
})

// Validation schema for comments
const commentSchema = z.object({
  body: z.string().max(5000).optional(),
  gifUrl: z.string().url().optional(),
}).refine(data => data.body || data.gifUrl, {
  message: 'Comment must have text or a GIF'
})

// Create a new post
router.post('/', authenticate, async (req, res) => {
  try {
    const { images, videos, audioFiles, documents, ...postData } = req.body
    const validatedData = createPostSchema.parse(postData)

    // Reject NSFW posts for users under 18
    if (validatedData.isUncensored && req.user.dateOfBirth) {
      const dob = new Date(req.user.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
      if (age < 18) {
        return res.status(403).json({ error: 'Users under 18 cannot post uncensored content' })
      }
    }
    
    const post = await prisma.post.create({
      data: {
        userId: req.user.userId,
        title: validatedData.title,
        body: validatedData.body,
        category: validatedData.category,
        emotion: validatedData.emotion,
        isVent: validatedData.isVent || false,
        isAnonymous: validatedData.isAnonymous || false,
        isUncensored: validatedData.isUncensored || false,
        images: images?.length ? {
          create: images.map(url => ({ url }))
        } : undefined,
        videos: videos?.length ? {
          create: videos.map(url => ({ url }))
        } : undefined,
        audioFiles: audioFiles?.length ? {
          create: audioFiles.map(f => ({
            url: f.url,
            name: f.name || 'audio',
            size: f.size || 0
          }))
        } : undefined,
        documents: documents?.length ? {
          create: documents.map(f => ({
            url: f.url,
            name: f.name || 'document',
            size: f.size || 0
          }))
        } : undefined
      },
      include: {
        user: {
          select: { id: true, username: true, role: true }
        },
        images: true,
        videos: true,
        audioFiles: true,
        documents: true
      }
    })

    res.status(201).json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Create post error:', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// Get all posts (with filtering options)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      emotion, 
      isVent, 
      limit = 20, 
      offset = 0,
      showUncensored = false,
      following 
    } = req.query

    const where = {
      isDeleted: false,
      ...(category && { category }),
      ...(emotion && { emotion }),
      ...(isVent !== undefined && { isVent: isVent === 'true' }),
    }

    let currentUser = null
    const token = req.headers.authorization?.split(' ')[1]
    if (token) {
      try {
        currentUser = jwt.verify(token, process.env.JWT_SECRET)
      } catch {
        // ignore invalid token unless following === 'true'
      }
    }

    // If user is under 18, always hide NSFW posts
    if (currentUser?.dateOfBirth) {
      const dob = new Date(currentUser.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
      if (age < 18) {
        where.isUncensored = false
      } else if (showUncensored === 'false') {
        where.isUncensored = false
      }
    } else if (showUncensored === 'false') {
      where.isUncensored = false
    }

    if (following === 'true') {
      if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required for following feed' })
      }

      const follows = await prisma.follow.findMany({
        where: { followerId: currentUser.userId },
        select: { followingId: true }
      })

      const followingIds = follows.map(f => f.followingId)

      if (followingIds.length === 0) {
        return res.json([])
      }

      where.userId = { in: followingIds }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, role: true }
        },
        images: true,
        videos: true,
        audioFiles: true,
        documents: true,
        comments: {
          where: { isDeleted: false },
          include: { user: { select: { id: true, username: true } } },
          orderBy: { createdAt: 'asc' },
          take: 5
        },
        reactions: {
          include: { user: { select: { id: true, username: true } } }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    })

    res.json(posts)
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ error: 'Failed to fetch posts' })
  }
})

// Get a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, username: true, role: true }
        },
        images: true,
        videos: true,
        audioFiles: true,
        documents: true,
        comments: {
          where: { isDeleted: false },
          include: { user: { select: { id: true, username: true } } },
          orderBy: { createdAt: 'asc' }
        },
        reactions: {
          include: { user: { select: { id: true, username: true } } }
        },
        _count: { select: { comments: true } }
      }
    })

    if (!post || post.isDeleted) {
      return res.status(404).json({ error: 'Post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error('Get post error:', error)
    res.status(500).json({ error: 'Failed to fetch post' })
  }
})

// Update a post
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const validatedData = updatePostSchema.parse(req.body)

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: req.params.id }
    })

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (existingPost.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this post' })
    }

    const updatedPost = await prisma.post.update({
      where: { id: req.params.id },
      data: validatedData
    })

    res.json(updatedPost)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Update post error:', error)
    res.status(500).json({ error: 'Failed to update post' })
  }
})

// Delete a post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existingPost = await prisma.post.findUnique({
      where: { id: req.params.id }
    })

    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (existingPost.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' })
    }

    // Soft delete
    await prisma.post.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    })

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// ─── Comments ───

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.postComment.findMany({
      where: { postId: req.params.id, isDeleted: false },
      include: { user: { select: { id: true, username: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Create a comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const validatedData = commentSchema.parse(req.body)

    const comment = await prisma.postComment.create({
      data: {
        postId: req.params.id,
        userId: req.user.userId,
        body: validatedData.body || '',
        gifUrl: validatedData.gifUrl
      },
      include: { user: { select: { id: true, username: true, role: true } } }
    })

    // Count comments for the post
    const commentCount = await prisma.postComment.count({
      where: { postId: req.params.id, isDeleted: false }
    })

    // Create notification for the post author (if not commenting on own post)
    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (post && post.userId !== req.user.userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'POST_COMMENT',
          referenceId: req.params.id,
          message: `${req.user.username} commented on your post`
        }
      })
    }

    res.status(201).json({ comment, commentCount })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Create comment error:', error)
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

// Delete a comment
router.delete('/:postId/comments/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await prisma.postComment.findUnique({
      where: { id: req.params.commentId }
    })
    if (!comment) return res.status(404).json({ error: 'Comment not found' })
    if (comment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.postComment.update({
      where: { id: req.params.commentId },
      data: { isDeleted: true }
    })

    res.json({ message: 'Comment deleted' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

// ─── Reactions (Emoji) ───

// Toggle reaction on a post
router.post('/:id/react', authenticate, async (req, res) => {
  try {
    const { emoji } = req.body
    if (!emoji || typeof emoji !== 'string') {
      return res.status(400).json({ error: 'Emoji is required' })
    }

    const existing = await prisma.postReaction.findUnique({
      where: {
        postId_userId_emoji: {
          postId: req.params.id,
          userId: req.user.userId,
          emoji
        }
      }
    })

    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } })
      const reactionCount = await prisma.postReaction.count({
        where: { postId: req.params.id, emoji }
      })
      return res.json({ message: 'Reaction removed', emoji, active: false, count: reactionCount })
    }

    await prisma.postReaction.create({
      data: {
        postId: req.params.id,
        userId: req.user.userId,
        emoji
      }
    })

    const reactionCount = await prisma.postReaction.count({
      where: { postId: req.params.id, emoji }
    })

    // Create notification for the post author (if not reacting to own post)
    const post = await prisma.post.findUnique({ where: { id: req.params.id } })
    if (post && post.userId !== req.user.userId) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'POST_LIKE',
          referenceId: req.params.id,
          message: `${req.user.username} reacted ${emoji} to your post`
        }
      })
    }

    res.json({ message: 'Reaction added', emoji, active: true, count: reactionCount })
  } catch (error) {
    console.error('React error:', error)
    res.status(500).json({ error: 'Failed to react' })
  }
})

export default router