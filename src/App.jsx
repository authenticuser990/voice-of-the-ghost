import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { notifications } from './api'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import CreatePost from './pages/CreatePost'
import DMs from './pages/DMs'
import Communities from './pages/Communities'
import CommunityChat from './pages/CommunityChat'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import ContentPolicy from './pages/ContentPolicy'
import Disclaimer from './pages/Disclaimer'
import AdminDashboard from './pages/AdminDashboard'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import PostDetail from './pages/PostDetail'
import './App.css'

const HomeIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
)

const DMIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
)

const CommunityIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
)

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
)

const BellIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
)

function AppContent() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('home')
  const [communityId, setCommunityId] = useState(null)
  const [profileUsername, setProfileUsername] = useState(null)
  const [postId, setPostId] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      try {
        const data = await notifications.getUnreadCount()
        setUnreadCount(data.count)
      } catch {}
    }, 15000)
    loadUnreadCount()
    return () => clearInterval(interval)
  }, [user])

  const loadUnreadCount = async () => {
    try {
      const data = await notifications.getUnreadCount()
      setUnreadCount(data.count)
    } catch {}
  }

  if (loading) return <div className="loading-screen">Loading...</div>
  if (!user) return <AuthPage />

  const navigate = (p) => {
    setPage(p)
    setCommunityId(null)
    setProfileUsername(null)
    setPostId(null)
  }

  const enterCommunity = (id) => {
    setCommunityId(id)
    setPage('community-chat')
  }

  const viewPost = (id) => {
    setPostId(id)
    setPage('view-post')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const viewProfile = (username) => {
    setProfileUsername(username)
    setPage('profile')
  }

  const viewCommunityFromSearch = (communityId) => {
    enterCommunity(communityId)
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'dms', label: 'Messages', icon: DMIcon },
    { id: 'communities', label: 'Communities', icon: CommunityIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: BellIcon,
      badge: unreadCount,
    },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  const renderPage = () => {
    switch (page) {
      case 'create-post':
        return <CreatePost onBack={() => navigate('home')} />
      case 'vent':
        return <CreatePost onBack={() => navigate('home')} />
      case 'dms':
        return <DMs onBack={() => navigate('home')} />
      case 'communities':
        return <Communities onBack={() => navigate('home')} onEnterCommunity={enterCommunity} />
      case 'community-chat':
        return <CommunityChat communityId={communityId} onBack={() => navigate('communities')} />
      case 'notifications':
        return <Notifications onBack={() => navigate('home')} onNavigateToPost={viewPost} />
      case 'settings':
        return <Settings onBack={() => navigate('home')} onNavigate={navigate} />
      case 'privacy':
        return <Privacy onBack={() => navigate('settings')} />
      case 'terms':
        return <Terms onBack={() => navigate('settings')} />
      case 'content-policy':
        return <ContentPolicy onBack={() => navigate('settings')} />
      case 'disclaimer':
        return <Disclaimer onBack={() => navigate('settings')} />
      case 'admin':
        return <AdminDashboard onBack={() => navigate('settings')} />
      case 'profile':
        return <ProfilePage onBack={() => navigate('home')} username={profileUsername} onViewPost={viewPost} onViewProfile={viewProfile} />
      case 'view-post':
        return <PostDetail postId={postId} onBack={() => navigate('home')} />
      case 'search':
        return (
          <SearchPage
            onBack={() => navigate('home')}
            navigateToProfile={viewProfile}
            navigateToCommunity={viewCommunityFromSearch}
            navigateToPost={viewPost}
          />
        )
      default:
        return (
          <HomePage
            onCreatePost={() => navigate('create-post')}
            onVent={() => navigate('vent')}
            onViewPost={viewPost}
          />
        )
    }
  }

  return (
    <div className="app-layout">
      <div className="app-content" onClick={loadUnreadCount}>
        {renderPage()}
      </div>

      {page !== 'community-chat' && page !== 'view-post' && (
        <nav className="bottom-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-btn ${page === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <span className="nav-icon">
                  <Icon />
                  {item.badge > 0 && (
                    <span className="nav-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                  )}
                </span>
                <span className="nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
