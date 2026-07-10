import { useState, useEffect } from 'react'
import { notifications } from '../api'
import { timeAgo } from '../utils'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

const NOTIFICATION_ICONS = {
  COMMUNITY_JOIN_REQUEST: '🙋',
  COMMUNITY_JOIN_APPROVED: '✅',
  COMMUNITY_JOIN_REJECTED: '❌',
  DM_RECEIVED: '💬',
  MENTION: '@',
  EVERYONE_MENTION: '📢',
  FOLLOW: '👤',
  POST_COMMENT: '💭',
  POST_LIKE: '❤️',
  SYSTEM_ANNOUNCEMENT: '📣',
}

export default function Notifications({ onBack, onNavigateToPost }) {
  const [list, setList] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const [data, unread] = await Promise.all([
        notifications.getAll(),
        notifications.getUnreadCount(),
      ])
      setList(data)
      setUnreadCount(unread.count)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  const markAllRead = async () => {
    try {
      await notifications.markAllRead()
      setList((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const markAsRead = async (n) => {
    if (!n.isRead) {
      try {
        await notifications.markRead(n.id)
      } catch {}
    }

    if (onNavigateToPost && (n.type === 'POST_COMMENT' || n.type === 'POST_LIKE') && n.referenceId) {
      onNavigateToPost(n.referenceId)
    }
  }

  const getNotificationLink = (n) => {
    switch (n.type) {
      case 'POST_COMMENT':
      case 'POST_LIKE':
        return { hint: 'Click to view post', icon: '📄' }
      case 'DM_RECEIVED':
        return { hint: 'Click to read DM', icon: '💬' }
      case 'FOLLOW':
        return { hint: 'View profile', icon: '👤' }
      case 'COMMUNITY_JOIN_APPROVED':
      case 'COMMUNITY_JOIN_REJECTED':
      case 'COMMUNITY_JOIN_REQUEST':
        return { hint: 'Check community', icon: '👥' }
      default:
        return { hint: '', icon: '' }
    }
  }

  return (
    <div className="notifications-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Back</button>
        <h2>Notifications</h2>
        {unreadCount > 0 && (
          <button className="new-chat-btn" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </header>

      <div className="notifications-list">
        {list.length === 0 ? (
          <p className="placeholder-text">No notifications yet</p>
        ) : (
          list.map((n) => {
            const link = getNotificationLink(n)
            return (
              <div
                key={n.id}
                className={`notification-item ${!n.isRead ? 'unread' : ''} ${link.hint ? 'clickable' : ''}`}
                onClick={() => markAsRead(n)}
              >
                <span className="notification-icon">
                  {NOTIFICATION_ICONS[n.type] || '🔔'}
                </span>
                <div className="notification-content">
                  <p className="notification-message">{n.message}</p>
                  <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  {link.hint && <span className="notification-hint">{link.hint}</span>}
                </div>
                {!n.isRead && <span className="unread-dot" />}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
