import express from 'express'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Search users only
router.get('/', async (req, res) => {
  try {
    const { q } = req.query

    if (!q || !q.trim()) {
      return res.json({ users: [] })
    }

    const query = q.trim()

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { username: { startsWith: query } },
          { profile: { displayName: { startsWith: query } } }
        ]
      },
      select: {
        id: true,
        username: true,
        role: true,
        profile: {
          select: {
            displayName: true,
            bio: true,
            profileImageUrl: true
          }
        },
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      },
      take: 20
    })

    res.json({ users })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Failed to perform search' })
  }
})

export default router
