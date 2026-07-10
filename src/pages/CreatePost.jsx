import { useState, useRef, useMemo } from 'react'
import { posts, upload } from '../api'
import { useAuth } from '../contexts/AuthContext'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

const CATEGORIES = [
  { value: 'MENTAL_HEALTH', label: 'Mental Health' },
  { value: 'FRIENDS', label: 'Friends' },
  { value: 'LONELINESS_AND_LEFT_OUT', label: 'Loneliness & Left Out' },
  { value: 'BROKEN_HEARTED', label: 'Broken Hearted' },
  { value: 'BULLIED', label: 'Bullied' },
  { value: 'HARASSED', label: 'Harassed' },
  { value: 'SELF_HARM', label: 'Self Harm' },
  { value: 'JOY', label: 'Joy' },
  { value: 'OTHERS', label: 'Others' },
  { value: 'VENT', label: 'Vent' },
]

const EMOTIONS = [
  { value: 'HAPPY', emoji: '😊', label: 'Happy' },
  { value: 'CALM', emoji: '😌', label: 'Calm' },
  { value: 'SAD', emoji: '😢', label: 'Sad' },
  { value: 'DEPRESSED', emoji: '😫', label: 'Depressed' },
  { value: 'ANXIOUS', emoji: '😰', label: 'Anxious' },
  { value: 'ANGRY', emoji: '😡', label: 'Angry' },
  { value: 'FRUSTRATED', emoji: '😤', label: 'Frustrated' },
  { value: 'HOPEFUL', emoji: '🤞', label: 'Hopeful' },
  { value: 'NUMB', emoji: '😶', label: 'Numb' },
  { value: 'OVERWHELMED', emoji: '😵', label: 'Overwhelmed' },
]

const FILE_ACCEPT = {
  image: 'image/*',
  video: 'video/mp4',
  audio: 'audio/mpeg,audio/wav,audio/mp4,audio/x-m4a',
  document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.json,.xml',
}

export default function CreatePost({ onBack }) {
  const { user } = useAuth()

  const isUnder18 = useMemo(() => {
    if (!user?.dateOfBirth) return false
    const dob = new Date(user.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age < 18
  }, [user?.dateOfBirth])

  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'OTHERS',
    emotion: 'CALM',
    isVent: false,
    isAnonymous: false,
    isUncensored: false,
  })

  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCategoryChange = (value) => {
    setForm((prev) => ({
      ...prev,
      category: value,
      isVent: value === 'VENT',
    }))
  }

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError('')

    try {
      const uploaded = []
      for (const file of selectedFiles) {
        if (file.size > 900 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 900MB limit`)
        }
        const result = await upload.file(file)
        uploaded.push(result)
      }
      setFiles((prev) => [...prev, ...uploaded])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        title: form.title,
        body: form.body,
        category: form.category,
        emotion: form.emotion,
        isVent: form.isVent,
        isAnonymous: form.isAnonymous,
        isUncensored: form.isUncensored,
        images: files.filter((f) => f.type === 'image').map((f) => f.url),
        videos: files.filter((f) => f.type === 'video').map((f) => f.url),
        audioFiles: files.filter((f) => f.type === 'audio').map((f) => ({ url: f.url, name: f.name, size: f.size })),
        documents: files.filter((f) => f.type === 'document').map((f) => ({ url: f.url, name: f.name, size: f.size })),
      }

      await posts.create(payload)
      setSuccess(true)
      setTimeout(() => onBack(), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="create-post-page">
      <header className="create-post-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Back</button>
        <h1>{form.isVent ? 'Vent Anonymously' : 'Create Post'}</h1>
      </header>

      {success && (
        <div className="success-banner">
          {form.isVent ? 'Vent posted anonymously' : 'Post created!'} Redirecting...
        </div>
      )}

      <form className="create-post-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder={form.isVent ? 'What is on your mind?' : 'Give your post a title'}
            required
            maxLength={200}
          />
        </div>

        <div className="field">
          <label htmlFor="body">What would you like to share?</label>
          <textarea
            id="body"
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="Write freely — no judgment here..."
            rows={6}
            required
          />
        </div>

        <div className="field">
          <label>Attach Files (max 900MB per file)</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={Object.values(FILE_ACCEPT).join(',')}
            multiple
            style={{ display: 'none' }}
          />
          <div className="file-upload-bar">
            <button type="button" className="file-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading...' : '📎 Add Files'}
            </button>
            <span className="file-upload-hint">Images, MP4, MP3/WAV/M4A, Documents</span>
          </div>
          {files.length > 0 && (
            <div className="file-preview-list">
              {files.map((f, i) => (
                <div key={i} className="file-preview-item">
                  <span className="file-preview-icon">
                    {f.type === 'image' ? '🖼️' : f.type === 'video' ? '🎬' : f.type === 'audio' ? '🎵' : '📄'}
                  </span>
                  <span className="file-preview-name">{f.name}</span>
                  <span className="file-preview-size">{formatSize(f.size)}</span>
                  <button type="button" className="file-preview-remove" onClick={() => removeFile(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label>Category</label>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`category-chip ${form.category === cat.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>How are you feeling?</label>
          <div className="emotion-grid">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.value}
                type="button"
                className={`emotion-chip ${form.emotion === emo.value ? 'active' : ''}`}
                onClick={() => setForm((prev) => ({ ...prev, emotion: emo.value }))}
              >
                {emo.emoji} {emo.label}
              </button>
            ))}
          </div>
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={form.isAnonymous}
              onChange={handleChange}
            />
            <span>Post anonymously</span>
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isUncensored"
              checked={form.isUncensored}
              onChange={handleChange}
              disabled={isUnder18}
            />
            <span>Uncensored (NSFW) — may contain sensitive topics{isUnder18 ? ' (not available for users under 18)' : ''}</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="auth-submit" disabled={submitting || uploading}>
            {submitting ? 'Posting...' : form.isVent ? 'Vent' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
