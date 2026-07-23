import { useState, useEffect, useMemo, useCallback } from 'react'
import { communities } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import CommunityCard from '../components/CommunityCard'
import CommunityTabs from '../components/CommunityTabs'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)

const categories = [
  { id: 'all', label: 'All' },
  { id: 'MENTAL_HEALTH', label: 'Mental Health' },
  { id: 'FRIENDS', label: 'Friends' },
  { id: 'LONELINESS_AND_LEFT_OUT', label: 'Loneliness' },
  { id: 'BROKEN_HEARTED', label: 'Heartbreak' },
  { id: 'BULLIED', label: 'Bullied' },
  { id: 'SELF_HARM', label: 'Self Harm' },
  { id: 'JOY', label: 'Joy' },
  { id: 'OTHERS', label: 'Others' },
]

export default function Communities({ onBack, onEnterCommunity }) {
  const { user } = useAuth()
  const { socket } = useSocket()

  const isUnder18 = useMemo(() => {
    if (!user?.dateOfBirth) return false
    const dob = new Date(user.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age < 18
  }, [user?.dateOfBirth])

  const [allCommunities, setAllCommunities] = useState([])
  const [myCommunities, setMyCommunities] = useState([])
  const [activeTab, setActiveTab] = useState('explore')
  const [showCreate, setShowCreate] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [form, setForm] = useState({
    name: '', description: '', rules: '', visibility: 'PUBLIC', contentRating: 'SFW',
  })
  const [error, setError] = useState('')
  const [joinStatus, setJoinStatus] = useState({})
  const [joinError, setJoinError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isUnder18) {
      setForm((prev) => ({ ...prev, contentRating: 'SFW' }))
    }
  }, [isUnder18])

  const loadCommunities = useCallback(async () => {
    setLoading(true)
    try {
      const data = await communities.getAll()
      setAllCommunities(data)

      const myIds = new Set()
      data.forEach((c) => {
        if (c.members?.some((m) => m.userId === user?.id)) {
          myIds.add(c.id)
        }
      })
      setMyCommunities(data.filter((c) => myIds.has(c.id)))
    } catch (err) {
      console.error('Failed to load communities:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadCommunities()
  }, [loadCommunities])

  // Listen for real-time community updates
  useEffect(() => {
    if (!socket) return

    socket.on('community_updated', (data) => {
      setAllCommunities((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
      )
      setMyCommunities((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
      )
    })

    return () => {
      socket.off('community_updated')
    }
  }, [socket])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await communities.create(form)
      setShowCreate(false)
      setForm({ name: '', description: '', rules: '', visibility: 'PUBLIC', contentRating: 'SFW' })
      loadCommunities()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleJoin = async (id) => {
    setJoinStatus((prev) => ({ ...prev, [id]: 'joining' }))
    setJoinError('')
    try {
      const res = await communities.join(id)
      setJoinStatus((prev) => ({ ...prev, [id]: res.message || 'Joined!' }))
      loadCommunities()
    } catch (err) {
      setJoinStatus((prev) => ({ ...prev, [id]: 'error' }))
      setJoinError(err.message || 'Failed to join community')
      setTimeout(() => setJoinError(''), 5000)
    }
  }

  const isMember = (community) => {
    return community.members?.some((m) => m.userId === user?.id)
  }

  const isAdmin = (community) => {
    return community.members?.some((m) => m.userId === user?.id && m.role === 'ADMIN')
  }

  const filteredExplore = useMemo(() => {
    let filtered = allCommunities

    if (activeCategory !== 'all') {
      filtered = filtered.filter((c) => {
        const desc = (c.description || '').toLowerCase()
        const name = (c.name || '').toLowerCase()
        return desc.includes(activeCategory.toLowerCase().replace(/_/g, ' ')) ||
               name.includes(activeCategory.toLowerCase().replace(/_/g, ' '))
      })
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      )
    }

    return filtered
  }, [allCommunities, activeCategory, searchQuery])

  const filteredMy = useMemo(() => {
    if (!searchQuery) return myCommunities
    const q = searchQuery.toLowerCase()
    return myCommunities.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    )
  }, [myCommunities, searchQuery])

  const displayList = activeTab === 'my' ? filteredMy : filteredExplore

  return (
    <div className="communities-page-v2">
      <header className="communities-header-v2">
        <div className="header-top">
          <button className="back-btn-v2" onClick={onBack}>
            <ArrowLeft />
          </button>
          <h1 className="header-title">Communities</h1>
          <button
            className="create-btn-v2"
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? <CloseIcon /> : '+'}
          </button>
        </div>

        <div className="search-bar-v2">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <CloseIcon />
            </button>
          )}
        </div>
      </header>

      {showCreate && (
        <div className="create-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="create-modal-v2" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Community</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>
                <CloseIcon />
              </button>
            </div>

            <form className="create-form-v2" onSubmit={handleCreate}>
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label>Community Name</label>
                <input
                  type="text"
                  placeholder="e.g., Anxiety Support Group"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What's this community about?"
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Rules</label>
                <textarea
                  placeholder="Community guidelines..."
                  required
                  rows={3}
                  value={form.rules}
                  onChange={(e) => setForm({ ...form, rules: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Visibility</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label>Content Rating</label>
                  <select
                    value={form.contentRating}
                    onChange={(e) => setForm({ ...form, contentRating: e.target.value })}
                    disabled={isUnder18}
                  >
                    <option value="SFW">SFW</option>
                    <option value="NSFW">NSFW (Uncensored)</option>
                  </select>
                  {isUnder18 && (
                    <small className="nsfw-note-v2">Not available for users under 18</small>
                  )}
                </div>
              </div>

              <button type="submit" className="submit-btn-v2">
                Create Community
              </button>
            </form>
          </div>
        </div>
      )}

      <CommunityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        myCount={myCommunities.length}
        exploreCount={allCommunities.length}
      />

      {activeTab === 'explore' && (
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {joinError && (
        <div className="join-error-banner">
          {joinError}
        </div>
      )}

      <div className="communities-list-v2">
        {loading ? (
          <div className="communities-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-avatar" />
                <div className="skeleton-content">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-line long" />
                </div>
              </div>
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'my' ? '🏠' : '🔍'}
            </div>
            <h3>{activeTab === 'my' ? 'No communities yet' : 'No communities found'}</h3>
            <p>
              {activeTab === 'my'
                ? 'Join a community to start connecting with others.'
                : searchQuery
                  ? 'Try a different search term.'
                  : 'Be the first to create a community!'}
            </p>
          </div>
        ) : (
          displayList.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              onJoin={handleJoin}
              onEnter={onEnterCommunity}
              isMember={isMember(c)}
              isAdmin={isAdmin(c)}
              joinStatus={joinStatus[c.id]}
              onUpdateRules={loadCommunities}
            />
          ))
        )}
      </div>
    </div>
  )
}
