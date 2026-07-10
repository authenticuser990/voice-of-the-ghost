import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { settings, profiles } from '../api'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

const THEME_KEY = 'votg_theme'

export default function Settings({ onBack, onNavigate }) {
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

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'dark'
  })
  const [showUncensored, setShowUncensored] = useState(() => {
    const val = localStorage.getItem('votg_show_uncensored')
    return val === null ? true : val === 'true'
  })
  const [profileData, setProfileData] = useState(null)
  const [privacyUpdating, setPrivacyUpdating] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [activeSection, setActiveSection] = useState('general')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    const val = isUnder18 ? false : showUncensored
    localStorage.setItem('votg_show_uncensored', val ? 'true' : 'false')
  }, [showUncensored, isUnder18])

  useEffect(() => {
    if (!user) return
    profiles.getMe().then((res) => {
      setProfileData(res.profile || null)
    }).catch(() => {})
  }, [user])

  const handlePrivacyToggle = async () => {
    setPrivacyUpdating(true)
    try {
      const next = !(profileData?.isVisible ?? true)
      await profiles.update({ isVisible: next })
      setProfileData((prev) => prev ? { ...prev, isVisible: next } : { isVisible: next })
    } catch (err) {
      console.error('Privacy toggle error:', err)
    } finally {
      setPrivacyUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('')
    try {
      await settings.deleteAccount(deleteInput)
      logout()
    } catch (err) {
      setDeleteError(err.message)
    }
  }

  return (
    <div className="settings-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Home</button>
        <h2>Settings</h2>
      </header>

      <div className="settings-content">
        <div className="settings-tabs">
          {['general', 'content', 'account', 'about'].map((s) => (
            <button
              key={s}
              className={`settings-tab ${activeSection === s ? 'active' : ''}`}
              onClick={() => setActiveSection(s)}
            >
              {s === 'general' ? 'General' : s === 'content' ? 'Content' : s === 'account' ? 'Account' : 'About'}
            </button>
          ))}
        </div>

        {activeSection === 'general' && (
          <div className="settings-section">
            <h3>Appearance</h3>
            <label className="settings-toggle">
              <span>Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="toggle-track" />
            </label>

            <h3>Notifications</h3>
            <label className="settings-toggle">
              <span>Show Post Notifications</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-track" />
            </label>
            <label className="settings-toggle">
              <span>Show Community Notifications</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-track" />
            </label>
            <label className="settings-toggle">
              <span>Show Following Post Notifications</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-track" />
            </label>
          </div>
        )}

        {activeSection === 'content' && (
          <div className="settings-section">
            <h3>Content Filters</h3>
            <label className="settings-toggle">
              <span>Show Uncensored (NSFW) Content</span>
              <input
                type="checkbox"
                checked={isUnder18 ? false : showUncensored}
                onChange={(e) => setShowUncensored(e.target.checked)}
                disabled={isUnder18}
              />
              <span className="toggle-track" />
            </label>
            <p className="settings-hint">
              {isUnder18
                ? 'NSFW content is not available for users under 18.'
                : 'When enabled, uncensored posts and NSFW communities will be visible in your feed.'}
            </p>
          </div>
        )}

        {activeSection === 'account' && (
          <div className="settings-section">
            <h3>Account</h3>
            <div className="settings-info">
              <div><strong>Username:</strong> {user?.username}</div>
              <div><strong>Role:</strong> {user?.role}</div>
            </div>

            <label className="settings-toggle">
              <span>Private Account</span>
              <input
                type="checkbox"
                checked={!(profileData?.isVisible ?? true)}
                onChange={handlePrivacyToggle}
                disabled={privacyUpdating}
              />
              <span className="toggle-track" />
            </label>
            <p className="settings-hint">
              When your account is private, other users won't be able to see your profile or posts.
            </p>

            <div className="danger-zone">
              <h3 className="danger-title">Danger Zone</h3>
              <p className="settings-hint danger-hint">
                This will permanently delete your account, all posts, messages, and communities. 
                This action cannot be undone.
              </p>
              {deleteError && <div className="auth-error">{deleteError}</div>}
              <div className="delete-form">
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder='Type "delete" to confirm'
                />
                <button
                  className="delete-btn"
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== 'delete'}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="settings-section">
            <h3>Voice of the Ghost</h3>
            <p className="settings-hint">
              Version 1.0.0 — A judgment-free platform for emotional support and community.
            </p>
            <div className="about-links">
              <button className="link-btn" onClick={() => onNavigate('terms')}>
                Terms of Service
              </button>
              <button className="link-btn" onClick={() => onNavigate('privacy')}>
                Privacy Policy
              </button>
              <button className="link-btn" onClick={() => onNavigate('content-policy')}>
                Content Policy (NSFW Rules)
              </button>
              <button className="link-btn" onClick={() => onNavigate('disclaimer')}>
                Disclaimer & Crisis Resources
              </button>
              {(user?.role === 'SAGE' || user?.role === 'BOTH') && (
                <button className="link-btn" onClick={() => onNavigate('admin')}>
                  ⚙️ Admin Dashboard
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
