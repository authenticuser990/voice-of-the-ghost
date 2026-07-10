import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import http from 'http'

// Load environment variables
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

// Validate JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set in .env file. Server cannot start.')
  process.exit(1)
}

// Import routes
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import communityRoutes from './routes/communities.js'
import dmRoutes from './routes/dms.js'
import notificationRoutes from './routes/notifications.js'
import profileRoutes from './routes/profiles.js'
import authRoutes from './routes/auth.js'
import searchRoutes from './routes/search.js'
import uploadRoutes from './routes/upload.js'
import reportRoutes from './routes/reports.js'
import moderationRoutes from './routes/moderation.js'
import blockRoutes from './routes/blocks.js'

// Import Socket.io setup
import { setupSocket } from './socket.js'

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, '../uploads')))

// Security Middleware
app.use(helmet())
app.use(cors())

// General rate limiting (15 minutes window, max 100 requests per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
})
app.use(generalLimiter)

// Stricter rate limiting for auth routes (5 minutes, max 10 attempts)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
})

// Body Parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request Logging (Basic)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Voice of the Ghost API is running' })
})

// API Routes — auth routes get stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/communities', communityRoutes)
app.use('/api/dms', dmRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/moderation', moderationRoutes)
app.use('/api/blocks', blockRoutes)

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start Server with Socket.io
server.listen(PORT, () => {
  console.log(`🚀 VotG Backend is running at http://localhost:${PORT}`)
})

// Attach Socket.io and store on app for route access
const io = setupSocket(server)
app.set('io', io)

export default app