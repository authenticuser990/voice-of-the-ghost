import express from 'express'
import { authenticate } from '../middleware/auth.js'
import prisma from '../utils/prisma.js'

const router = express.Router()

// Get current user's profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        profile: {
          include: { interests: true }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update profile
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { displayName, bio, location, gender, personality, interests, dateOfBirth, isVisible } = req.body

    // If DOB is being updated to under-18, force role to HELPSEEKER
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const monthDiff = today.getMonth() - dob.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
      if (age < 18) {
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { role: 'HELPSEEKER' }
        })
      }
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user.userId },
      data: {
        displayName,
        bio,
        location,
        gender,
        personality: personality ? JSON.stringify(personality) : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        isVisible: typeof isVisible === 'boolean' ? isVisible : undefined
      }
    })

    // Handle interests update if provided
    if (Array.isArray(interests)) {
      // Remove existing interests
      await prisma.interest.deleteMany({
        where: { profileId: updatedProfile.id }
      })
      // Create new interests
      for (const name of interests) {
        if (name.trim()) {
          await prisma.interest.create({
            data: {
              profileId: updatedProfile.id,
              name: name.trim()
            }
          })
        }
      }
    }

    // Fetch updated profile with interests
    const fullProfile = await prisma.profile.findUnique({
      where: { id: updatedProfile.id },
      include: { interests: true }
    })

    res.json(fullProfile)
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router