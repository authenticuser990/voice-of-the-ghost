import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '../contexts/SocketContext'
import { useAuth } from '../contexts/AuthContext'
import { communities, upload } from '../api'
import { timeAgo, formatFileSize } from '../utils'
import CommunitySettings from '../components/CommunitySettings'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

function highlightMentions(text) {
  if (!text) return text
  const parts = text.split(/(@\w+|@everyone)/g)
  return parts.map((part, i) =>
    part.startsWith('@') ? <span key={i} className={part === '@everyone' ? 'mention mention-everyone' : 'mention'}>{part}</span> : part
  )
}

export default function CommunityChat({ communityId, onBack }) {
  const { socket } = useSocket()
  const { user } = useAuth()
  const [community, setCommunity] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [members, setMembers] = useState([])
  const [mentionQuery, setMentionQuery] = useState(null)
  const [mentionIndex, setMentionIndex] = useState(-1)
  const [showSettings, setShowSettings] = useState(false)
  const fileInput = useRef(null)
  const messagesEnd = useRef(null)
  const typingTimer = useRef(null)
  const inputRef = useRef(null)

  const loadCommunity = useCallback(async () => {
    try {
      const data = await communities.getById(communityId)
      setCommunity(data)
    } catch (err) {
      console.error('Failed to load community:', err)
    }
  }, [communityId])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }, [communityId])

  const fetchMembers = useCallback(async () => {
    try {
      const data = await communities.getMembers(communityId)
      setMembers(data)
    } catch (err) {
      console.error('Failed to fetch members:', err)
    }
  }, [communityId])

  useEffect(() => {
    if (!communityId) return
    loadCommunity()
    fetchMessages()
    fetchMembers()

    if (socket) {
      socket.emit('join_community', communityId)

      socket.on('new_message', (msg) => {
        setMessages((prev) => [...prev, msg])
      })

      socket.on('user_typing', (data) => {
        setTyping(`${data.username} is typing...`)
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTyping(''), 2000)
      })

      socket.on('user_stopped_typing', () => setTyping(''))

      socket.on('community_updated', (data) => {
        setCommunity((prev) => prev ? { ...prev, ...data } : prev)
      })
    }

    return () => {
      if (socket) {
        socket.emit('leave_community', communityId)
        socket.off('new_message')
        socket.off('user_typing')
        socket.off('user_stopped_typing')
        socket.off('community_updated')
      }
    }
  }, [communityId, socket, loadCommunity, fetchMessages, fetchMembers])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowedAudioExts = ['.mp3', '.wav', '.m4a']
    const ext = '.' + file.name.split('.').pop().toLowerCase()

    if (file.size > 900 * 1024 * 1024) {
      alert('File is too large. Maximum size is 900MB.')
      e.target.value = ''
      return
    }

    if (file.type.startsWith('image/')) {
      setSelectedFile(file)
    } else if (file.type.startsWith('video/') && ext === '.mp4') {
      setSelectedFile(file)
    } else if (file.type.startsWith('audio/') && allowedAudioExts.includes(ext)) {
      setSelectedFile(file)
    } else if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setSelectedFile(file)
    } else {
      alert('Only images (any format), MP4 videos, MP3/WAV/M4A audio, and documents are allowed.')
      e.target.value = ''
    }
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInput(val)

    // Detect @mention
    const cursorPos = e.target.selectionStart
    const beforeCursor = val.slice(0, cursorPos)
    const atMatch = beforeCursor.match(/@(\w*)$/)
    if (atMatch) {
      setMentionQuery(atMatch[1].toLowerCase())
      setMentionIndex(-1)
    } else {
      setMentionQuery(null)
    }
  }

  const insertMention = (username) => {
    const cursorPos = inputRef.current?.selectionStart || input.length
    const beforeCursor = input.slice(0, cursorPos)
    const atMatch = beforeCursor.match(/@(\w*)$/)
    if (!atMatch) return
    const start = cursorPos - atMatch[0].length
    const newVal = input.slice(0, start) + `@${username} ` + input.slice(cursorPos)
    setInput(newVal)
    setMentionQuery(null)
    inputRef.current?.focus()
  }

  const handleMentionKeyDown = (e) => {
    if (mentionQuery == null || filteredMembers.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionIndex((i) => Math.min(i + 1, filteredMembers.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Tab') {
      if (mentionIndex >= 0 && mentionIndex < filteredMembers.length) {
        e.preventDefault()
        insertMention(filteredMembers[mentionIndex].user?.username)
      }
    } else if (e.key === 'Enter' && mentionIndex >= 0 && mentionIndex < filteredMembers.length) {
      e.preventDefault()
      insertMention(filteredMembers[mentionIndex].user?.username)
      // Send message after mention insertion
      setTimeout(() => {
        const form = inputRef.current?.closest('form')
        if (form) form.requestSubmit()
      }, 0)
    }
  }

  const everyoneOption = { userId: '__everyone', user: { username: 'everyone' } }

  const filteredMembers = [
    ...(mentionQuery === '' || 'everyone'.startsWith(mentionQuery || '') ? [everyoneOption] : []),
    ...members.filter((m) =>
      m.user?.username?.toLowerCase().includes(mentionQuery || '')
    ),
  ]

  const sendMessage = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !selectedFile) || !socket) return

    let fileData = null
    if (selectedFile) {
      setUploading(true)
      try {
        const result = await upload.file(selectedFile)
        fileData = {
          fileUrl: result.url,
          fileType: result.type,
          fileName: result.originalName,
          fileSize: result.size,
          fileMime: result.mime,
        }
      } catch (err) {
        console.error('Upload error:', err)
        alert('Failed to upload file.')
        setUploading(false)
        return
      }
    }

    socket.emit('send_message', {
      communityId,
      content: input.trim(),
      ...(fileData || {}),
      ...(replyTo ? { replyToId: replyTo.id } : {}),
    })
    setInput('')
    setSelectedFile(null)
    setReplyTo(null)
    if (fileInput.current) fileInput.current.value = ''
    setUploading(false)
    setMentionQuery(null)
  }

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { communityId })
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => {
        if (socket) socket.emit('stop_typing', { communityId })
      }, 1500)
    }
  }

  function renderFile(msg) {
    if (!msg.fileUrl) return null
    const isImage = msg.fileType === 'image' || msg.fileMime?.startsWith('image/')
    const isVideo = msg.fileType === 'video' || msg.fileMime?.startsWith('video/')
    const isAudio = msg.fileType === 'audio' || msg.fileMime?.startsWith('audio/')

    if (isImage) {
      return <img src={msg.fileUrl} alt={msg.fileName || 'image'} className="chat-image" loading="lazy" />
    }
    if (isVideo) {
      return (
        <video controls className="chat-video" preload="metadata">
          <source src={msg.fileUrl} type={msg.fileMime || 'video/mp4'} />
        </video>
      )
    }
    if (isAudio) {
      return (
        <audio controls className="chat-audio" preload="metadata">
          <source src={msg.fileUrl} type={msg.fileMime || 'audio/mpeg'} />
        </audio>
      )
    }
    return (
      <a href={msg.fileUrl} className="chat-document" download={msg.fileName}>
        <span className="doc-icon">📄</span>
        <span className="doc-name">{msg.fileName || 'document'}</span>
        {msg.fileSize != null && <span className="doc-size">{formatFileSize(msg.fileSize)}</span>}
      </a>
    )
  }

  function renderReplyPreview(replyToMsg) {
    if (!replyToMsg) return null
    return (
      <div className="reply-preview">
        <span className="reply-preview-author">@{replyToMsg.sender?.username}</span>
        <span className="reply-preview-text">{replyToMsg.content}</span>
      </div>
    )
  }

  if (!community) return <div className="loading-screen">Loading community...</div>

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Communities</button>
        <div className="chat-header-info">
          <h2>{community.name}</h2>
          <span className="chat-meta">
            {community.visibility} · {community.contentRating}
          </span>
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          <SettingsIcon />
        </button>
      </header>

      <div className="messages-area">
        {messages.length === 0 ? (
          <p className="placeholder-text">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-author">
                <strong>@{msg.sender?.username}</strong>
                <span className="message-time">{timeAgo(msg.createdAt)}</span>
                <button
                  className="reply-btn"
                  onClick={() => setReplyTo(msg)}
                  title="Reply"
                >
                  ↩
                </button>
              </div>
              {msg.replyTo && renderReplyPreview(msg.replyTo)}
              {msg.content && <p className="message-content">{highlightMentions(msg.content)}</p>}
              {renderFile(msg)}
            </div>
          ))
        )}
        {typing && <div className="typing-indicator">{typing}</div>}
        <div ref={messagesEnd} />
      </div>

      <form className="chat-input-bar" onSubmit={sendMessage}>
        {replyTo && (
          <div className="reply-indicator">
            <span className="reply-indicator-label">Replying to <strong>@{replyTo.sender?.username}</strong></span>
            <button type="button" className="reply-indicator-cancel" onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        {selectedFile && (
          <div className="file-preview">
            <span className="file-preview-name">{selectedFile.name}</span>
            <button type="button" className="file-preview-remove" onClick={() => { setSelectedFile(null); if (fileInput.current) fileInput.current.value = '' }}>✕</button>
          </div>
        )}
        <div className="chat-input-row" style={{ position: 'relative' }}>
          <button type="button" className="attach-btn" onClick={() => fileInput.current?.click()} disabled={uploading}>
            📎
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => { handleMentionKeyDown(e); handleTyping() }}
            placeholder="Type a message..."
            maxLength={2000}
            disabled={uploading}
          />
          <button type="submit" disabled={(!input.trim() && !selectedFile) || uploading}>
            {uploading ? '...' : 'Send'}
          </button>
          {mentionQuery != null && filteredMembers.length > 0 && (
            <div className="mention-dropdown">
              {filteredMembers.map((m, i) => (
                <button
                  key={m.userId}
                  type="button"
                  ref={(el) => {
                    if (el && i === mentionIndex) {
                      el.scrollIntoView({ block: 'nearest' })
                    }
                  }}
                  className={`mention-option ${i === mentionIndex ? 'active' : ''}`}
                  onMouseDown={() => insertMention(m.user?.username)}
                >
                  @{m.user?.username}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </form>

      {showSettings && (
        <CommunitySettings
          community={community}
          currentUser={user}
          onClose={(action) => {
            setShowSettings(false)
            if (action === 'deleted') {
              onBack()
            } else {
              loadCommunity()
            }
          }}
          onLeave={() => {
            communities.leave(communityId).then(() => onBack())
          }}
          onUpdate={() => loadCommunity()}
        />
      )}
    </div>
  )
}
