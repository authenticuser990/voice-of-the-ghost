import { useState } from 'react'
import { reports } from '../api'

const REPORT_REASONS = [
  { value: 'HARASSMENT', label: 'Harassment or bullying' },
  { value: 'NSFW_MISLABEL', label: 'NSFW content not properly labeled' },
  { value: 'HATE_SPEECH', label: 'Hate speech or discrimination' },
  { value: 'SPAM', label: 'Spam or misleading content' },
  { value: 'ILLEGAL_CONTENT', label: 'Illegal content' },
  { value: 'THREATS', label: 'Threats or violence' },
  { value: 'SELF_HARM', label: 'Encouraging self-harm or suicide' },
  { value: 'OTHER', label: 'Other (describe below)' },
]

export default function ReportModal({ contentId, contentType, onClose }) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) return
    setSubmitting(true)
    setError('')
    try {
      await reports.create({ contentId, contentType, reason, description: description.trim() || undefined })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <span className="modal-success-icon">✓</span>
            <h3>Report Submitted</h3>
            <p>Thank you. Our moderation team will review this content.</p>
            <button className="auth-submit" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Report Content</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          {error && <div className="auth-error">{error}</div>}

          <label>Reason for reporting</label>
          <div className="report-reason-list">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`report-reason-chip ${reason === r.value ? 'active' : ''}`}
                onClick={() => setReason(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <label>Additional details (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide any additional context..."
            rows={3}
          />

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="auth-submit" disabled={!reason || submitting}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
