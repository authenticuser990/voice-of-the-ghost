import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { blocks, users } from '../api'

export default function BlockButton({ username, onBlockChange }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [userId, setUserId] = useState(null)
  const [confirmBlock, setConfirmBlock] = useState(false)

  useEffect(() => {
    if (!username || !user) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await users.getByUsername(username)
        if (cancelled) return
        const id = data?.id
        if (!id) return
        setUserId(id)
        const check = await blocks.check(id)
        if (!cancelled) setBlocked(check?.blocked || false)
      } catch {
        // not found or error
      }
    })()
    return () => { cancelled = true }
  }, [username, user])

  const handleBlock = async () => {
    if (!userId) return
    setLoading(true)
    try {
      if (blocked) {
        await blocks.unblock(userId)
        setBlocked(false)
      } else {
        await blocks.block(userId)
        setBlocked(true)
      }
      setConfirmBlock(false)
      onBlockChange?.(!blocked)
    } catch (err) {
      console.error('Block error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !userId || user.username === username) return null

  return (
    <>
      {blocked ? (
        <button className="btn-outline-sm" onClick={handleBlock} disabled={loading}>
          {loading ? '...' : 'Unblock'}
        </button>
      ) : (
        <button className="btn-danger-sm" onClick={() => setConfirmBlock(true)} disabled={loading}>
          {loading ? '...' : 'Block'}
        </button>
      )}
      {confirmBlock && (
        <div className="modal-overlay" onClick={() => setConfirmBlock(false)}>
          <div className="modal-card" style={{ maxWidth: 360, padding: 'var(--space-5)' }} onClick={(e) => e.stopPropagation()}>
            <p style={{ marginBottom: 'var(--space-4)', fontWeight: 600 }}>Block @{username}?</p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              They won&apos;t be able to see your posts or interact with you.
            </p>
            <div className="modal-actions">
              <button className="btn-outline-sm" onClick={() => setConfirmBlock(false)}>Cancel</button>
              <button className="btn-danger-sm" onClick={handleBlock}>Block</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
