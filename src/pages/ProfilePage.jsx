import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { profiles, posts as postsApi, users, auth as authApi } from '../api'
import PostCard from '../components/PostCard'
import BlockButton from '../components/BlockButton'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function ProfilePage({ onBack, username, onViewPost, onViewProfile }) {
  const { user, updateUser } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [myPosts, setMyPosts] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: '', bio: '', location: '', interests: '', dateOfBirth: '', isVisible: true })
  const [saving, setSaving] = useState(false)
  const [followState, setFollowState] = useState(null)
  const [followLoading, setFollowLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [showList, setShowList] = useState(null)

  const isOwnProfile = !username || username === user?.username

  const loadMyProfile = useCallback(async () => {
    try {
      const data = await profiles.getMe()
      setProfileData(data)
      setLoadError(null)
      const p = data.profile || {}
      setForm({
        displayName: p.displayName || '',
        bio: p.bio || '',
        location: p.location || '',
        interests: (p.interests || []).map((i) => i.name).join(', '),
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        isVisible: p.isVisible !== false,
      })
    } catch (err) {
      console.error('Load profile error:', err)
      setLoadError(`Failed to load profile: ${err.message}`)
    }
  }, [])

  const loadUserProfile = useCallback(async () => {
    if (!username) return
    try {
      const data = await users.getByUsername(username)
      setProfileData(data)
      setLoadError(null)
      setForm({
        displayName: data.profile?.displayName || '',
        bio: data.profile?.bio || '',
        location: data.profile?.location || '',
        interests: (data.profile?.interests || []).map((i) => i.name).join(', '),
        dateOfBirth: data.profile?.dateOfBirth ? data.profile.dateOfBirth.split('T')[0] : '',
        isVisible: data.profile?.isVisible !== false,
      })
    } catch (err) {
      console.error('Load user profile error:', err)
      setLoadError(`Failed to load profile: ${err.message}`)
    }
  }, [username])

  const loadFollowData = useCallback(async (targetUsername) => {
    if (!targetUsername) return
    try {
      const [fList, fwList] = await Promise.all([
        users.getFollowers(targetUsername),
        users.getFollowing(targetUsername),
      ])
      setFollowers(fList)
      setFollowing(fwList)
    } catch (err) {
      console.error('Load followers/following error:', err)
    }
    try {
      const fStatus = await users.getFollowStatus(targetUsername)
      setFollowState(fStatus.isFollowing ? 'unfollow' : 'follow')
    } catch {
      setFollowState('follow')
    }
  }, [])

  const loadMyPosts = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await postsApi.getAll({ limit: 50, userId: user.id })
      setMyPosts(data.filter((p) => !p.isDeleted))
    } catch (err) {
      console.error('Load posts error:', err)
    }
  }, [user?.id])

  const loadUserPosts = useCallback(async (targetUserId) => {
    if (!targetUserId) return
    try {
      const data = await postsApi.getAll({ limit: 50, userId: targetUserId })
      setMyPosts(data.filter((p) => !p.isDeleted))
    } catch (err) {
      console.error('Load user posts error:', err)
    }
  }, [])

  // Load profile on mount or when username/isOwnProfile/user changes
  useEffect(() => {
    if (isOwnProfile) {
      loadMyProfile()
      if (user?.id) loadMyPosts()
      loadFollowData(user?.username)
    } else {
      loadUserProfile()
      loadFollowData(username)
    }
  }, [isOwnProfile, username, user?.id, user?.username])

  // Load user posts once profileData is available
  useEffect(() => {
    if (profileData && !isOwnProfile) {
      loadUserPosts(profileData.id)
    }
  }, [profileData, isOwnProfile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await profiles.update({
        displayName: form.displayName || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        isVisible: form.isVisible,
        interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean),
      })
      updateUser({ dateOfBirth: form.dateOfBirth || null })
      await authApi.refreshToken().then((res) => {
        localStorage.setItem('votg_token', res.token)
      }).catch(() => {})
      setEditing(false)
      loadMyProfile()
    } catch (err) {
      console.error('Save profile error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleFollow = async () => {
    setFollowLoading(true)
    try {
      const result = await users.follow(username)
      setFollowState(result.message === 'Followed successfully' ? 'unfollow' : 'follow')
    } catch (err) {
      console.error('Follow error:', err)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleRemoveFollower = async (targetUsername) => {
    try {
      await users.removeFollower(targetUsername)
      setFollowers((prev) => prev.filter((u) => u.username !== targetUsername))
    } catch (err) {
      console.error('Remove follower error:', err)
    }
  }

  if (loadError) {
    return (
      <div className="loading-screen">
        <p>{loadError}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="auth-submit" onClick={() => { setLoadError(null); window.location.reload() }}>
            Retry
          </button>
          {loadError.includes('Session expired') && (
            <button className="auth-submit secondary" onClick={() => { localStorage.removeItem('votg_token'); localStorage.removeItem('votg_user'); window.location.reload() }}>
              Log in again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!profileData) return <div className="loading-screen">Loading...</div>

  const displayProfile = isOwnProfile ? (profileData.profile || {}) : (profileData.profile || {})
  const displayUser = isOwnProfile ? user : profileData

  const calcAge = (dob) => {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const showAge = isOwnProfile || displayProfile.isVisible !== false
  const age = calcAge(displayProfile.dateOfBirth)

  return (
    <div className="profile-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Home</button>
        <h2>{isOwnProfile ? 'My Profile' : `@${username}`}</h2>
        {isOwnProfile && (
          <button className="new-chat-btn" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </header>

      {editing && isOwnProfile ? (
        <form className="profile-edit-form" onSubmit={handleSave}>
          <label>
            Display Name
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Your display name" />
          </label>
          <label>
            Bio
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell people about yourself" rows={3} />
          </label>
          <label>
            Location
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, country" />
          </label>
          <label>
            Date of Birth
            <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
          </label>
          <label className="checkbox-label" style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} />
            <span>Public profile (age visible to everyone)</span>
          </label>
          <label>
            Interests (comma separated)
            <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} placeholder="Music, reading, meditation" />
          </label>
          <button type="submit" className="auth-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      ) : (
        <div className="profile-display">
          <div className="profile-avatar-lg">
            {displayProfile.displayName?.[0]?.toUpperCase() || displayUser?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <h2>{displayProfile.displayName || displayUser?.username}</h2>
          <p className="profile-username">@{displayUser?.username}</p>
          <span className="role-badge" data-role={displayUser?.role}>
            {displayUser?.role === 'SAGE' ? 'Sage' : displayUser?.role === 'HELPSEEKER' ? 'Help Seeker' : 'Both'}
          </span>
          {!isOwnProfile && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className={`follow-btn ${followState === 'unfollow' ? 'following' : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? '...' : followState === 'unfollow' ? 'Following' : 'Follow'}
              </button>
              <BlockButton username={username} />
            </div>
          )}
          {age !== null && showAge && <p className="profile-age">🎂 {age} years old</p>}
          {displayProfile.bio && <p className="profile-bio">{displayProfile.bio}</p>}
          {displayProfile.location && <p className="profile-location">📍 {displayProfile.location}</p>}
          {(displayProfile.interests || []).length > 0 && (
            <div className="profile-interests">
              {displayProfile.interests.map((i) => (
                <span key={i.id} className="interest-tag">{i.name}</span>
              ))}
            </div>
          )}

          <div className="profile-stats">
            <button className="stat-btn" onClick={() => setShowList('followers')}>
              <strong>{followers.length}</strong> Followers
            </button>
            <button className="stat-btn" onClick={() => setShowList('following')}>
              <strong>{following.length}</strong> Following
            </button>
          </div>
        </div>
      )}

      {showList && (
        <div className="modal-overlay" onClick={() => setShowList(null)}>
          <div className="modal-card follow-list-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showList === 'followers' ? 'Followers' : 'Following'}</h3>
              <button className="modal-close" onClick={() => setShowList(null)}>✕</button>
            </div>
            <div className="follow-list">
              {(showList === 'followers' ? followers : following).length === 0 ? (
                <p className="placeholder-text">No {showList} yet.</p>
              ) : (
                (showList === 'followers' ? followers : following).map((u) => (
                  <div key={u.id} className="follow-list-item">
                    <a
                      className="follow-list-user"
                      href={`/profile/${u.username}`}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                          e.preventDefault()
                          setShowList(null)
                          onViewProfile?.(u.username)
                        }
                      }}
                    >
                      <div className="follow-list-avatar">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div className="follow-list-info">
                        <strong>@{u.username}</strong>
                        <span className="role-badge-small" data-role={u.role}>
                          {u.role === 'SAGE' ? 'Sage' : u.role === 'HELPSEEKER' ? 'Help Seeker' : 'Both'}
                        </span>
                      </div>
                    </a>
                    {isOwnProfile && showList === 'followers' && (
                      <button className="follow-action-btn remove" onClick={() => handleRemoveFollower(u.username)}>
                        Remove
                      </button>
                    )}
                    {isOwnProfile && showList === 'following' && (
                      <button
                        className="follow-action-btn unfollow"
                        onClick={async () => {
                          try {
                            const result = await users.follow(u.username)
                            if (result.message === 'Unfollowed successfully') {
                              setFollowing((prev) => prev.filter((x) => x.username !== u.username))
                            }
                          } catch (err) {
                            console.error('Unfollow error:', err)
                          }
                        }}
                      >
                        Unfollow
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="profile-posts-section">
        <h3>{isOwnProfile ? 'My Posts' : `${username}'s Posts`} ({myPosts.length})</h3>
        <div className="feed">
          {myPosts.length === 0 ? (
            <p className="placeholder-text">No posts yet.</p>
          ) : (
            myPosts.map((post) => (
              <PostCard key={post.id} post={post} compact onClick={() => onViewPost?.(post.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
