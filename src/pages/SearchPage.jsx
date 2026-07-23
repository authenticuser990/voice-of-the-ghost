import { useState, useEffect, useRef } from 'react'
import { search } from '../api'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function SearchPage({ onBack, navigateToProfile }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await search.users(query)
        setResults(data?.users || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="search-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Home</button>
        <h2>Search Users</h2>
      </header>

      <div className="search-form">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a username..."
            className="search-input"
          />
          {loading && <span className="search-spinner" />}
        </div>
      </div>

      <div className="search-results">
        {!loading && query.trim() && results.length === 0 && (
          <p className="placeholder-text">No users found</p>
        )}

        {results.map((u) => (
          <div
            key={u.id}
            className="search-result-item user-result"
            onClick={() => navigateToProfile?.(u.username)}
          >
            <div className="user-avatar-sm">
              {u.profile?.displayName?.[0]?.toUpperCase() || u.username[0].toUpperCase()}
            </div>
            <div className="search-result-content">
              <strong>{u.profile?.displayName || u.username}</strong>
              <p className="search-result-meta">
                @{u.username} · {u.role === 'SAGE' ? 'Sage' : u.role === 'HELPSEEKER' ? 'Help Seeker' : 'Both'}
              </p>
              <p className="search-result-stats">
                <span>{u._count?.followers || 0} followers</span>
                <span className="stat-dot">·</span>
                <span>{u._count?.following || 0} following</span>
              </p>
              {u.profile?.bio && <p className="search-result-preview">{u.profile.bio.substring(0, 80)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
