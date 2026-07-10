import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { posts } from '../api'
import PostCard from '../components/PostCard'

export default function HomePage({ onCreatePost, onVent, onViewPost }) {
  const { user, logout } = useAuth()

  const isUnder18 = useMemo(() => {
    if (!user?.dateOfBirth) return false
    const dob = new Date(user.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    return age < 18
  }, [user?.dateOfBirth])
  const [feed, setFeed] = useState([])
  const [feedTab, setFeedTab] = useState('posts')
  const [loading, setLoading] = useState(true)

  const loadFeed = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (feedTab === 'vent') {
        params.isVent = 'true'
      }
      if (feedTab === 'following') {
        params.following = 'true'
      }
      const showUncensored = isUnder18 ? false : localStorage.getItem('votg_show_uncensored') !== 'false'
      params.showUncensored = showUncensored ? 'true' : 'false'
      
      const data = await posts.getAll(params)
      setFeed(data)
    } catch (err) {
      console.error('Failed to load feed:', err)
    } finally {
      setLoading(false)
    }
  }, [feedTab, isUnder18])

  useEffect(() => {
    loadFeed()
  }, [loadFeed])

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Voice of the Ghost</h1>
        <div className="user-info">
          <span className="role-badge" data-role={user?.role}>
            {user?.role === 'SAGE' ? 'Sage' : user?.role === 'HELPSEEKER' ? 'Help Seeker' : 'Both'}
          </span>
          <span className="username">@{user?.username}</span>
          <button className="logout-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="home-main">
        <section className="welcome">
          <h2>Welcome back{user?.username ? `, ${user.username}` : ''}</h2>
          <p>Your safe space to share, listen, and heal.</p>
        </section>

        <section className="quick-actions">
          <button className="action-card" onClick={onCreatePost}>
            <h3>📝 Create Post</h3>
            <p>Share what you are going through</p>
          </button>
          <button className="action-card vent" onClick={onVent}>
            <h3>💨 Need to Vent?</h3>
            <p>Anonymous, uncensored, judgment-free</p>
          </button>
        </section>

        <section className="feed-section">
          <div className="feed-tabs">
            <button
              className={`feed-tab ${feedTab === 'posts' ? 'active' : ''}`}
              onClick={() => setFeedTab('posts')}
            >
              Posts
            </button>
            <button
              className={`feed-tab ${feedTab === 'following' ? 'active' : ''}`}
              onClick={() => setFeedTab('following')}
            >
              Following
            </button>
            <button
              className={`feed-tab ${feedTab === 'vent' ? 'active' : ''}`}
              onClick={() => setFeedTab('vent')}
            >
              Vent
            </button>
          </div>

          <div className="feed">
            {loading ? (
              <p className="placeholder-text">Loading...</p>
            ) : feed.length === 0 ? (
              <p className="placeholder-text">
                {feedTab === 'vent'
                  ? 'No vents yet. Need to let something out?'
                  : feedTab === 'following'
                  ? 'No posts from people you follow. Follow some users to see their posts here!'
                  : 'No posts yet. Be the first to share!'}
              </p>
            ) : (
              feed.map((post) => (
                <PostCard key={post.id} post={post} compact onClick={() => onViewPost?.(post.id)} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
