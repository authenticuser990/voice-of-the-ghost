import express from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../utils/prisma.js'

const router = express.Router()

const REPORT_REASONS = ['HARASSMENT', 'NSFW_MISLABEL', 'HATE_SPEECH', 'SPAM', 'ILLEGAL_CONTENT', 'THREATS', 'SELF_HARM', 'OTHER']

// Create a report
router.post('/', authenticate, async (req, res) => {
  try {
    const { contentId, contentType, reason, description } = req.body

    if (!contentId || !contentType || !reason) {
      return res.status(400).json({ error: 'contentId, contentType, and reason are required' })
    }

    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({ error: `Invalid reason. Must be one of: ${REPORT_REASONS.join(', ')}` })
    }

    if (!['POST', 'COMMENT', 'COMMUNITY'].includes(contentType)) {
      return res.status(400).json({ error: 'contentType must be POST, COMMENT, or COMMUNITY' })
    }

    // Verify the content exists
    if (contentType === 'POST') {
      const exists = await prisma.post.findUnique({ where: { id: contentId } })
      if (!exists) return res.status(404).json({ error: 'Post not found' })
    } else if (contentType === 'COMMENT') {
      const exists = await prisma.postComment.findUnique({ where: { id: contentId } })
      if (!exists) return res.status(404).json({ error: 'Comment not found' })
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.userId,
        contentId,
        contentType,
        reason,
        description: description || null,
      }
    })

    res.status(201).json(report)
  } catch (error) {
    console.error('Report error:', error)
    res.status(500).json({ error: 'Failed to submit report' })
  }
})

// Admin: Get all reports (requires admin role)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'SAGE' && req.user.role !== 'BOTH') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { status, limit = 50, offset = 0 } = req.query

    const where = {}
    if (status) where.status = status

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, username: true } },
        reviewer: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    })

    const total = await prisma.report.count({ where })

    res.json({ reports, total })
  } catch (error) {
    console.error('Get reports error:', error)
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

// Admin: Resolve a report
router.patch('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'SAGE' && req.user.role !== 'BOTH') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const { status } = req.body
    if (!['DISMISSED', 'ACTION_TAKEN'].includes(status)) {
      return res.status(400).json({ error: 'Status must be DISMISSED or ACTION_TAKEN' })
    }

    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        status,
        reviewedById: req.user.userId,
        reviewedAt: new Date(),
      }
    })

    // Log the action
    await prisma.moderationLog.create({
      data: {
        adminId: req.user.userId,
        action: status === 'DISMISSED' ? 'DISMISS_REPORT' : 'ACTION_TAKEN',
        targetId: report.id,
        targetType: 'REPORT',
        details: JSON.stringify({ reportId: report.id, contentType: report.contentType, reason: report.reason }),
      }
    })

    res.json(report)
  } catch (error) {
    console.error('Resolve report error:', error)
    res.status(500).json({ error: 'Failed to resolve report' })
  }
})

export default router
