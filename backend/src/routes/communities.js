import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { z } from 'zod'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Helper: check if user is admin or sub-admin
async function canManage(communityId, userId) {
  const member = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } }
  })
  if (!member) return false
  return member.role === 'ADMIN' || member.role === 'SUB_ADMIN'
}

async function isAdmin(communityId, userId) {
  const member = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } }
  })
  return member?.role === 'ADMIN'
}

// Validation schemas
const createCommunitySchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  rules: z.string().min(10).max(2000),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  contentRating: z.enum(['SFW', 'NSFW']),
})

// Create a community
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = createCommunitySchema.parse(req.body)

    // Check if community name is taken
    const existing = await prisma.community.findUnique({ where: { name: validatedData.name } })
    if (existing) {
      return res.status(409).json({ error: 'Community name already exists' })
    }

    const community = await prisma.community.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        rules: validatedData.rules,
        visibility: validatedData.visibility,
        contentRating: validatedData.contentRating,
        adminId: req.user.userId,
        members: {
          create: {
            userId: req.user.userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: true
      }
    })

    res.status(201).json(community)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors })
    }
    console.error('Create community error:', error)
    res.status(500).json({ error: 'Failed to create community' })
  }
})

// Get all communities
router.get('/', async (req, res) => {
  try {
    const communities = await prisma.community.findMany({
      where: { isActive: true },
      include: {
        members: {
          select: { userId: true, role: true }
        }
      }
    })

    res.json(communities)
  } catch (error) {
    console.error('Get communities error:', error)
    res.status(500).json({ error: 'Failed to fetch communities' })
  }
})

// Get my communities (communities user has joined)
router.get('/my', authenticate, async (req, res) => {
  try {
    const memberships = await prisma.communityMember.findMany({
      where: { userId: req.user.userId },
      include: {
        community: {
          include: {
            members: {
              select: { userId: true, role: true }
            }
          }
        }
      }
    })

    const myCommunities = memberships.map((m) => m.community)
    res.json(myCommunities)
  } catch (error) {
    console.error('Get my communities error:', error)
    res.status(500).json({ error: 'Failed to fetch your communities' })
  }
})

// Search communities
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const communities = await prisma.community.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } }
        ]
      },
      include: {
        members: {
          select: { userId: true, role: true }
        }
      },
      take: 20
    })

    res.json(communities)
  } catch (error) {
    console.error('Search communities error:', error)
    res.status(500).json({ error: 'Failed to search communities' })
  }
})

// Get a single community
router.get('/:id', async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          select: { userId: true, role: true }
        },
        joinRequests: {
          where: { status: 'PENDING' }
        }
      }
    })

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    res.json(community)
  } catch (error) {
    console.error('Get community error:', error)
    res.status(500).json({ error: 'Failed to fetch community' })
  }
})

// Join a community (or request to join)
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id }
    })

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    // Prevent under-18 users from joining NSFW communities
    if (community.contentRating === 'NSFW' && req.user.dateOfBirth) {
      const dob = new Date(req.user.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
      if (age < 18) {
        return res.status(403).json({ error: 'Users under 18 cannot join NSFW communities' })
      }
    }

    if (community.visibility === 'PUBLIC') {
      // Direct join
      await prisma.communityMember.create({
        data: {
          communityId: community.id,
          userId: req.user.userId,
          role: 'MEMBER'
        }
      })

      return res.json({ message: 'Joined community successfully' })
    } else {
      // Request to join
      const existingRequest = await prisma.communityJoinRequest.findUnique({
        where: {
          communityId_userId: {
            communityId: community.id,
            userId: req.user.userId
          }
        }
      })

      if (existingRequest) {
        return res.status(409).json({ error: 'Join request already exists' })
      }

      await prisma.communityJoinRequest.create({
        data: {
          communityId: community.id,
          userId: req.user.userId
        }
      })

      // Notify admin
      await prisma.notification.create({
        data: {
          userId: community.adminId,
          type: 'COMMUNITY_JOIN_REQUEST',
          referenceId: community.id,
          message: `A user requested to join ${community.name}`
        }
      })

      return res.json({ message: 'Join request sent' })
    }
  } catch (error) {
    console.error('Join community error:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Already a member' })
    }
    if (error.code === 'P2003') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' })
    }
    res.status(500).json({ error: 'Failed to join community' })
  }
})

// Leave a community
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id }
    })

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    // Check if user is a member
    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: req.user.userId
        }
      }
    })

    if (!membership) {
      return res.status(404).json({ error: 'Not a member of this community' })
    }

    // Admin cannot leave - must transfer ownership first
    if (membership.role === 'ADMIN') {
      return res.status(400).json({ error: 'Admin cannot leave directly. Please transfer ownership to a Sub-Admin first using the Transfer Ownership option.' })
    }

    // Regular member leaving
    await prisma.communityMember.delete({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: req.user.userId
        }
      }
    })

    res.json({ message: 'Left community successfully' })
  } catch (error) {
    console.error('Leave community error:', error)
    res.status(500).json({ error: 'Failed to leave community' })
  }
})

// Transfer ownership (Admin only)
router.post('/:id/transfer', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id }
    })

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    // Check if user is the admin
    if (community.adminId !== req.user.userId) {
      return res.status(403).json({ error: 'Only the admin can transfer ownership' })
    }

    const { transferTo } = req.body
    if (!transferTo) {
      return res.status(400).json({ error: 'Please provide a user to transfer ownership to' })
    }

    // Verify the transfer target is a member
    const targetMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: transferTo
        }
      }
    })

    if (!targetMember) {
      return res.status(404).json({ error: 'Transfer target is not a member of this community' })
    }

    // Verify the transfer target is a Sub-Admin
    if (targetMember.role !== 'SUB_ADMIN') {
      return res.status(400).json({ error: 'Ownership can only be transferred to a Sub-Admin. Please promote the member to Sub-Admin first.' })
    }

    // Transfer ownership: update community adminId and target's role
    await prisma.community.update({
      where: { id: community.id },
      data: { adminId: transferTo }
    })

    await prisma.communityMember.update({
      where: { id: targetMember.id },
      data: { role: 'ADMIN' }
    })

    // Update previous admin's role to SUB_ADMIN
    await prisma.communityMember.update({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: req.user.userId
        }
      },
      data: { role: 'SUB_ADMIN' }
    })

    // Emit ownership transfer event
    const io = req.app.get('io')
    if (io) {
      io.to(`community:${community.id}`).emit('community_updated', {
        id: community.id,
        adminId: transferTo
      })
    }

    res.json({ message: 'Ownership transferred successfully' })
  } catch (error) {
    console.error('Transfer ownership error:', error)
    res.status(500).json({ error: 'Failed to transfer ownership' })
  }
})

// Approve or reject a join request (Admin/Sub-Admin only)
router.patch('/:id/requests/:requestId', authenticate, async (req, res) => {
  try {
    const { status } = req.body // 'APPROVED' or 'REJECTED'
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' })
    }

    const community = await prisma.community.findUnique({
      where: { id: req.params.id }
    })

    // Check if user is admin or sub-admin
    const member = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: community.id,
          userId: req.user.userId
        }
      }
    })

    if (!member || !['ADMIN', 'SUB_ADMIN'].includes(member.role)) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const request = await prisma.communityJoinRequest.update({
      where: { id: req.params.requestId },
      data: { status, respondedAt: new Date() }
    })

    if (status === 'APPROVED') {
      await prisma.communityMember.create({
        data: {
          communityId: community.id,
          userId: request.userId,
          role: 'MEMBER'
        }
      })

      // Notify user of approval
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'COMMUNITY_JOIN_APPROVED',
          referenceId: community.id,
          message: `Your request to join ${community.name} was approved`
        }
      })
    } else {
      // Notify user of rejection
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'COMMUNITY_JOIN_REJECTED',
          referenceId: community.id,
          message: `Sorry, your request to join ${community.name} was not approved`
        }
      })
    }

    res.json({ message: `Request ${status.toLowerCase()} successfully` })
  } catch (error) {
    console.error('Process request error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
})

// Assign sub-admin (Admin only)
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const members = await prisma.communityMember.findMany({
      where: { communityId: req.params.id },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    })
    res.json(members)
  } catch (error) {
    console.error('Get members error:', error)
    res.status(500).json({ error: 'Failed to fetch members' })
  }
})

router.patch('/:id/members/:memberId/role', authenticate, async (req, res) => {
  try {
    const { role } = req.body // 'SUB_ADMIN' or 'MEMBER'
    
    if (!['SUB_ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Role must be SUB_ADMIN or MEMBER' })
    }

    const community = await prisma.community.findUnique({
      where: { id: req.params.id }
    })

    if (community.adminId !== req.user.userId) {
      return res.status(403).json({ error: 'Only the admin can change roles' })
    }

    const updatedMember = await prisma.communityMember.update({
      where: { id: req.params.memberId },
      data: { role }
    })

    res.json(updatedMember)
  } catch (error) {
    console.error('Update member role error:', error)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

// Delete community (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({ where: { id: req.params.id } })
    if (!community) return res.status(404).json({ error: 'Community not found' })
    if (community.adminId !== req.user.userId) {
      return res.status(403).json({ error: 'Only admin can delete the community' })
    }
    await prisma.message.deleteMany({ where: { communityId: req.params.id } })
    await prisma.communityMember.deleteMany({ where: { communityId: req.params.id } })
    await prisma.community.delete({ where: { id: req.params.id } })
    res.json({ message: 'Community deleted' })
  } catch (error) {
    console.error('Delete community error:', error)
    res.status(500).json({ error: 'Failed to delete community' })
  }
})

// Update community settings (Admin only)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({ where: { id: req.params.id } })
    if (!community) return res.status(404).json({ error: 'Community not found' })
    if (community.adminId !== req.user.userId) {
      return res.status(403).json({ error: 'Only admin can update community' })
    }

    const { name, description, rules, mentionSetting, visibility } = req.body
    const updated = await prisma.community.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(rules !== undefined && { rules }),
        ...(mentionSetting !== undefined && { mentionSetting }),
        ...(visibility !== undefined && { visibility })
      },
      include: { members: true }
    })

    // Emit real-time update to all members
    const io = req.app.get('io')
    if (io) {
      io.to(`community:${req.params.id}`).emit('community_updated', {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        rules: updated.rules,
        mentionSetting: updated.mentionSetting,
        visibility: updated.visibility
      })
    }

    res.json(updated)
  } catch (error) {
    console.error('Update community error:', error)
    res.status(500).json({ error: 'Failed to update community' })
  }
})

// Remove member (Admin and Sub-Admin)
router.delete('/:id/members/:memberId', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({ where: { id: req.params.id } })
    if (!community) return res.status(404).json({ error: 'Community not found' })

    const hasPermission = await canManage(req.params.id, req.user.userId)
    if (!hasPermission) {
      return res.status(403).json({ error: 'Only admin or sub-admin can remove members' })
    }

    const member = await prisma.communityMember.findFirst({
      where: { id: req.params.memberId, communityId: req.params.id }
    })
    if (!member) return res.status(404).json({ error: 'Member not found' })
    if (member.userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot remove yourself' })
    }
    // Sub-admin cannot remove admin
    if (member.role === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot remove the admin' })
    }

    await prisma.communityMember.delete({ where: { id: req.params.memberId } })
    res.json({ message: 'Member removed' })
  } catch (error) {
    console.error('Remove member error:', error)
    res.status(500).json({ error: 'Failed to remove member' })
  }
})

// Add member to community (Admin and Sub-Admin)
router.post('/:id/members', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({ where: { id: req.params.id } })
    if (!community) return res.status(404).json({ error: 'Community not found' })

    const hasPermission = await canManage(req.params.id, req.user.userId)
    if (!hasPermission) {
      return res.status(403).json({ error: 'Only admin or sub-admin can add members' })
    }

    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId is required' })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const existing = await prisma.communityMember.findFirst({
      where: { communityId: req.params.id, userId }
    })
    if (existing) return res.status(400).json({ error: 'User is already a member' })

    const member = await prisma.communityMember.create({
      data: {
        communityId: req.params.id,
        userId,
        role: 'MEMBER'
      }
    })

    res.json(member)
  } catch (error) {
    console.error('Add member error:', error)
    res.status(500).json({ error: 'Failed to add member' })
  }
})

// Search users for adding to community (Admin and Sub-Admin)
router.get('/:id/search-users', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({ where: { id: req.params.id } })
    if (!community) return res.status(404).json({ error: 'Community not found' })

    const hasPermission = await canManage(req.params.id, req.user.userId)
    if (!hasPermission) {
      return res.status(403).json({ error: 'Only admin or sub-admin can search users' })
    }

    const { q } = req.query
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' })
    }

    const existingMemberIds = await prisma.communityMember.findMany({
      where: { communityId: req.params.id },
      select: { userId: true }
    }).then(members => members.map(m => m.userId))

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { notIn: existingMemberIds },
        OR: [
          { username: { contains: q.trim() } },
          { profile: { displayName: { contains: q.trim() } } }
        ]
      },
      select: {
        id: true,
        username: true,
        profile: {
          select: { displayName: true }
        }
      },
      take: 10
    })

    res.json(users)
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ error: 'Failed to search users' })
  }
})

// Get current user's followers for adding to community
router.get('/:id/followers', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({ where: { id: req.params.id } })
    if (!community) return res.status(404).json({ error: 'Community not found' })

    const existingMemberIds = await prisma.communityMember.findMany({
      where: { communityId: req.params.id },
      select: { userId: true }
    }).then(members => members.map(m => m.userId))

    const followers = await prisma.follow.findMany({
      where: { followingId: req.user.userId },
      select: {
        follower: {
          where: { id: { notIn: existingMemberIds } },
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true } }
          }
        }
      }
    })

    const followerList = followers.map(f => f.follower).filter(Boolean)
    res.json(followerList)
  } catch (error) {
    console.error('Get followers error:', error)
    res.status(500).json({ error: 'Failed to fetch followers' })
  }
})

// Generate invite link (Admin and Sub-Admin)
router.post('/:id/invite', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findUnique({ where: { id: req.params.id } })
    if (!community) return res.status(404).json({ error: 'Community not found' })

    const hasPermission = await canManage(req.params.id, req.user.userId)
    if (!hasPermission) {
      return res.status(403).json({ error: 'Only admin or sub-admin can generate invite links' })
    }

    const inviteCode = Math.random().toString(36).substring(2, 10)
    const inviteLink = `${req.protocol}://${req.get('host')}/invite/${inviteCode}`

    await prisma.community.update({
      where: { id: req.params.id },
      data: { inviteCode }
    })

    res.json({ inviteLink, inviteCode })
  } catch (error) {
    console.error('Generate invite error:', error)
    res.status(500).json({ error: 'Failed to generate invite link' })
  }
})

// Join via invite link
router.post('/invite/:code', authenticate, async (req, res) => {
  try {
    const community = await prisma.community.findFirst({
      where: { inviteCode: req.params.code }
    })
    if (!community) return res.status(404).json({ error: 'Invalid invite link' })

    const existing = await prisma.communityMember.findFirst({
      where: { communityId: community.id, userId: req.user.userId }
    })
    if (existing) return res.json({ communityId: community.id, message: 'Already a member' })

    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId: req.user.userId,
        role: 'MEMBER'
      }
    })

    res.json({ communityId: community.id, message: 'Joined community' })
  } catch (error) {
    console.error('Join via invite error:', error)
    res.status(500).json({ error: 'Failed to join via invite' })
  }
})

// Get community messages
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { communityId: req.params.id, isDeleted: false },
      include: {
        sender: { select: { id: true, username: true, role: true } },
        replyTo: {
          include: {
            sender: { select: { id: true, username: true, role: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100
    })

    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router