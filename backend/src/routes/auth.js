import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import express from 'express'
import prisma from '../utils/prisma.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric with underscores only'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SAGE', 'HELPSEEKER', 'BOTH']),
  dateOfBirth: z.string().refine((val) => {
    const d = new Date(val)
    return !isNaN(d.getTime()) && d < new Date()
  }, 'Must be a valid date in the past')
})

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
})

// Register new user
router.post('/register', async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body)

    // Force HELPSEEKER for users under 18
    const dob = new Date(validatedData.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
    if (age < 18) validatedData.role = 'HELPSEEKER'

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email }
        ]
      }
    })

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        passwordHash: passwordHash,
        role: validatedData.role,
        profile: {
          create: {
            displayName: validatedData.username,
            dateOfBirth: new Date(validatedData.dateOfBirth)
          }
        }
      },
      include: {
        profile: {
          select: { dateOfBirth: true }
        }
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        username: newUser.username, 
        role: newUser.role,
        dateOfBirth: newUser.profile?.dateOfBirth?.toISOString() || null
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        dateOfBirth: newUser.profile?.dateOfBirth || null
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      })
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error during registration' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body)

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: {
          select: { dateOfBirth: true }
        }
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        dateOfBirth: user.profile?.dateOfBirth?.toISOString() || null
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        dateOfBirth: user.profile?.dateOfBirth || null
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      })
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error during login' })
  }
})

// Delete account
router.delete('/account', authenticate, async (req, res) => {
  try {
    const { confirmation } = req.body
    if (confirmation !== 'delete') {
      return res.status(400).json({ error: 'Type "delete" to confirm account deletion' })
    }

    await prisma.user.delete({ where: { id: req.user.userId } })
    res.json({ message: 'Account permanently deleted' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

// Refresh JWT token (used after profile update like dateOfBirth)
router.post('/refresh-token', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { profile: { select: { dateOfBirth: true } } }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        dateOfBirth: user.profile?.dateOfBirth?.toISOString() || null
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({ token })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
})

export default router