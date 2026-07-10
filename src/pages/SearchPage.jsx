import { useState } from 'react'
import { search } from '../api'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

const CATEGORY_ICONS = {
  MENTAL_HEALTH: '🧠', FRIENDS: '🤝', LONELINESS_AND_LEFT_OUT: '💔',
  BROKEN_HEARTED: '💔', BULLIED: '😤', HARASSED: '😰',
  SELF_HARM: '🆘', JOY: '✨', OTHERS: '📝', VENT: '💨',
}

export default function SearchPage({ onBack, navigateToProfile, navigateToCommunity, navigateToPost }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim() || query.trim().length < 2) return

    setLoading(true)
    try {
      const data = await search.all(query)
      setResults(data?.results || {})
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'posts', label: 'Posts' },
    { id: 'users', label: 'Users' },
    { id: 'communities', label: 'Communities' },
  ]

  const posts = results?.posts || []
  const users = results?.users || []
  const communities = results?.communities || []
  const hasResults = posts.length > 0 || users.length > 0 || communities.length > 0

  return (
    <div className="search-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Home</button>
        <h2>Search</h2>
      </header>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, users, communities..."
            className="search-input"
            autoFocus
          />
          <button type="submit" className="search-submit-btn" disabled={loading || query.trim().length < 2}>
            {loading ? '...' : '🔍'}
          </button>
        </div>
      </form>

      {results && (
        <div className="search-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === 'all' ? ` (${posts.length + users.length + communities.length})` :
               tab.id === 'posts' ? ` (${posts.length})` :
               tab.id === 'users' ? ` (${users.length})` : ` (${communities.length})`}
            </button>
          ))}
        </div>
      )}

      <div className="search-results">
        {loading && <p className="placeholder-text">Searching...</p>}

        {!loading && results && !hasResults && (
          <p className="placeholder-text">No results found for "{query}"</p>
        )}

        {!loading && results && (activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
          <div className="search-section">
            {activeTab === 'all' && <h3>Posts</h3>}
            {posts.map((post) => (
              <div key={post.id} className="search-result-item post-result" onClick={() => navigateToPost?.(post.id)}>
                <span className="post-category-icon">{CATEGORY_ICONS[post.category] || '📄'}</span>
                <div className="search-result-content">
                  <strong>{post.title}</strong>
                  <p className="search-result-preview">{post.body.substring(0, 100)}{post.body.length > 100 ? '...' : ''}</p>
                  <span className="search-result-meta">@{post.user?.username} · {post._count?.comments || 0} comments</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results && (activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
          <div className="search-section">
            {activeTab === 'all' && <h3>Users</h3>}
            {users.map((u) => (
              <div key={u.id} className="search-result-item user-result" onClick={() => navigateToProfile?.(u.username)}>
                <div className="user-avatar-sm">{u.profile?.displayName?.[0]?.toUpperCase() || u.username[0].toUpperCase()}</div>
                <div className="search-result-content">
                  <strong>{u.profile?.displayName || u.username}</strong>
                  <p className="search-result-meta">@{u.username} · {u.role === 'SAGE' ? 'Sage' : u.role === 'HELPSEEKER' ? 'Help Seeker' : 'Both'}</p>
                  {u.profile?.bio && <p className="search-result-preview">{u.profile.bio.substring(0, 80)}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && results && (activeTab === 'all' || activeTab === 'communities') && communities.length > 0 && (
          <div className="search-section">
            {activeTab === 'all' && <h3>Communities</h3>}
            {communities.map((c) => (
              <div key={c.id} className="search-result-item community-result" onClick={() => navigateToCommunity?.(c.id)}>
                <div className="community-icon-sm">👥</div>
                <div className="search-result-content">
                  <strong>{c.name}</strong>
                  <p className="search-result-preview">{c.description?.substring(0, 100)}</p>
                  <span className="search-result-meta">{c._count?.members || 0} members · {c.visibility} · {c.contentRating}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
