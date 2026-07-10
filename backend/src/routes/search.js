import express from 'express'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Search across posts, users, and communities
router.get('/', async (req, res) => {
  try {
    const { q, type, showUncensored } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' })
    }

    const query = q.trim()
    const results = {}

    // Search posts
    if (!type || type === 'posts') {
      results.posts = await prisma.post.findMany({
        where: {
          isDeleted: false,
          ...(showUncensored === 'false' && { isUncensored: false }),
          OR: [
            { title: { contains: query } },
            { body: { contains: query } }
          ]
        },
        include: {
          user: { select: { id: true, username: true, role: true } },
          _count: { select: { comments: true, reactions: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    }

    // Search users
    if (!type || type === 'users') {
      results.users = await prisma.user.findMany({
        where: {
          isActive: true,
          OR: [
            { username: { contains: query } },
            { profile: { displayName: { contains: query } } }
          ]
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          profile: {
            select: {
              displayName: true,
              bio: true,
              profileImageUrl: true
            }
          }
        },
        take: 20
      })
    }

    // Search communities
    if (!type || type === 'communities') {
      results.communities = await prisma.community.findMany({
        where: {
          isActive: true,
          ...(showUncensored === 'false' && { contentRating: 'SFW' }),
          OR: [
            { name: { contains: query } },
            { description: { contains: query } }
          ]
        },
        include: {
          _count: { select: { members: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    }

    res.json({ query, results })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Failed to perform search' })
  }
})

export default router
