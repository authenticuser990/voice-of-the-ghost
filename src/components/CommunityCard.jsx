import { useState } from 'react'
import Markdown from 'react-markdown'

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const PeopleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)

function getGradient(name) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f5576c 0%, #ff6a88 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

export default function CommunityCard({ community, onJoin, onEnter, isMember, isAdmin, joinStatus, onUpdateRules }) {
  const [hovered, setHovered] = useState(false)
  const [showEditRules, setShowEditRules] = useState(false)
  const [rules, setRules] = useState(community?.rules || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { name, description, visibility, contentRating, members } = community
  const memberCount = members?.length || 0
  const initial = name?.[0]?.toUpperCase() || '?'

  const handleSaveRules = async (e) => {
    e.stopPropagation()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/communities/${community.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('votg_token')}`
        },
        body: JSON.stringify({ rules })
      })
      if (!res.ok) throw new Error('Failed to update')
      setShowEditRules(false)
      onUpdateRules?.()
    } catch (err) {
      setError('Failed to update rules')
    } finally {
      setSaving(false)
    }
  }

  const openEditRules = (e) => {
    e.stopPropagation()
    setRules(community?.rules || '')
    setShowEditRules(true)
  }

  return (
    <>
      <div
        className={`community-card-v2 ${hovered ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onEnter(community.id)}
      >
        <div className="community-card-left">
          <div
            className="community-avatar-v2"
            style={{ background: getGradient(name) }}
          >
            {initial}
          </div>
        </div>

        <div className="community-card-center">
          <div className="community-card-header">
            <h3 className="community-name-v2">{name}</h3>
            {visibility === 'PRIVATE' && (
              <span className="visibility-badge private">
                <LockIcon />
              </span>
            )}
          </div>

          <div className="community-meta">
            <span className="meta-item">
              <PeopleIcon />
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
            <span className="meta-dot">·</span>
            <span className={`content-rating-badge ${contentRating.toLowerCase()}`}>
              {contentRating}
            </span>
          </div>

          {description && (
            <p className="community-desc-v2">{description}</p>
          )}
        </div>

        <div className="community-card-right">
          {isMember ? (
            <div className="card-actions">
              {isAdmin && (
                <button
                  className="community-action-btn edit"
                  onClick={openEditRules}
                  title="Edit Rules"
                >
                  <EditIcon />
                </button>
              )}
              <button
                className="community-action-btn joined"
                onClick={(e) => {
                  e.stopPropagation()
                  onEnter(community.id)
                }}
              >
                <span>Open</span>
                <ArrowIcon />
              </button>
            </div>
          ) : (
            <button
              className={`community-action-btn ${joinStatus === 'joining' ? 'joining' : ''} ${joinStatus === 'Joined!' ? 'success' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onJoin(community.id)
              }}
              disabled={joinStatus === 'joining' || joinStatus === 'Joined!'}
            >
              {joinStatus === 'joining' ? (
                <span className="btn-loading" />
              ) : joinStatus === 'Joined!' ? (
                <><CheckIcon /> Joined</>
              ) : (
                'Join'
              )}
            </button>
          )}
        </div>
      </div>

      {showEditRules && (
        <div className="edit-rules-overlay" onClick={() => setShowEditRules(false)}>
          <div className="edit-rules-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-rules-header">
              <h3>Edit Rules - {name}</h3>
              <button className="edit-rules-close" onClick={() => setShowEditRules(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="edit-rules-body">
              <p className="edit-rules-hint">Markdown supported: **bold**, *italic*, - lists, # headings</p>
              <textarea
                className="edit-rules-textarea"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={8}
                maxLength={2000}
                placeholder={"# Community Rules\n\n- Be kind and respectful\n- No hate speech\n- Help others when you can"}
              />
              {rules && (
                <div className="edit-rules-preview">
                  <label className="settings-label">Preview</label>
                  <div className="rules-content markdown-body">
                    <Markdown>{rules}</Markdown>
                  </div>
                </div>
              )}
              {error && <div className="edit-rules-error">{error}</div>}
            </div>
            <div className="edit-rules-footer">
              <button className="edit-rules-cancel" onClick={() => setShowEditRules(false)}>
                Cancel
              </button>
              <button className="edit-rules-save" onClick={handleSaveRules} disabled={saving}>
                {saving ? 'Saving...' : 'Save Rules'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
