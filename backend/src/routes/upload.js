import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authenticate } from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '../../uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const MAX_SIZE = 900 * 1024 * 1024 // 900MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const mime = file.mimetype
  const ext = path.extname(file.originalname).toLowerCase()

  if (mime.startsWith('image/')) return cb(null, true)

  if (mime.startsWith('video/')) {
    if (ext === '.mp4' || mime === 'video/mp4') return cb(null, true)
    return cb(new Error('Only MP4 videos are allowed'), false)
  }

  if (mime.startsWith('audio/')) {
    if (['.mp3', '.wav', '.m4a'].includes(ext)) return cb(null, true)
    return cb(new Error('Only MP3, WAV, and M4A audio files are allowed'), false)
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE }
})

const router = express.Router()

function getFileType(mime, ext) {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'document'
}

router.post('/', authenticate, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 900MB.' })
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Unexpected file field' })
        }
        return res.status(400).json({ error: err.message })
      }
      return res.status(400).json({ error: err.message })
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase()
      const fileType = getFileType(req.file.mimetype, ext)

      res.json({
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        name: req.file.originalname,
        size: req.file.size,
        type: fileType,
        ext,
        mime: req.file.mimetype
      })
    } catch (parseErr) {
      console.error('Upload response error:', parseErr)
      res.status(500).json({ error: 'Failed to process uploaded file' })
    }
  })
})

// Multiple file upload
router.post('/multiple', authenticate, (req, res) => {
  upload.array('files', 20)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 900MB.' })
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Too many files. Maximum is 20.' })
        }
        return res.status(400).json({ error: err.message })
      }
      return res.status(400).json({ error: err.message })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' })
    }

    try {
      const files = req.files.map(f => {
        const ext = path.extname(f.originalname).toLowerCase()
        return {
          url: `/uploads/${f.filename}`,
          originalName: f.originalname,
          name: f.originalname,
          size: f.size,
          type: getFileType(f.mimetype, ext),
          ext,
          mime: f.mimetype
        }
      })

      res.json({ files })
    } catch (parseErr) {
      console.error('Upload multiple response error:', parseErr)
      res.status(500).json({ error: 'Failed to process uploaded files' })
    }
  })
})

export default router
