import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { dms, users } from '../api'
import { timeAgo } from '../utils'

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
)

export default function DMs({ onBack }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [showNew, setShowNew] = useState(false)
  const messagesEnd = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!socket || !activeChat) return
    const conversationId = [user.id, activeChat.id].sort().join(':')
    socket.emit('join_dm', conversationId)

    socket.on('new_dm', (dm) => {
      if (
        (dm.senderId === user.id && dm.receiverId === activeChat.id) ||
        (dm.senderId === activeChat.id && dm.receiverId === user.id)
      ) {
        setMessages((prev) => [...prev, dm])
      }
    })

    return () => {
      socket.off('new_dm')
    }
  }, [socket, activeChat, user.id])

  const loadConversations = async () => {
    try {
      const data = await dms.getConversations()
      setConversations(data)
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }

  const loadMessages = async (chatUser) => {
    try {
      const data = await dms.getMessages(chatUser.username)
      setMessages(data)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const startChat = (chatUser) => {
    setActiveChat(chatUser)
    loadMessages(chatUser)
  }

  const startNewChat = async () => {
    if (!newUsername.trim()) return
    try {
      const userData = await users.getByUsername(newUsername.trim())
      setActiveChat(userData)
      setMessages([])
      setNewUsername('')
      setShowNew(false)
    } catch {
      alert('User not found')
    }
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim() || !socket || !activeChat) return

    socket.emit('send_dm', {
      receiverId: activeChat.id,
      content: input.trim(),
    })
    setInput('')
  }

  if (activeChat) {
    return (
      <div className="chat-page">
        <header className="chat-header">
          <button className="back-btn" onClick={() => { setActiveChat(null); loadConversations() }}><ArrowLeft /> DMs</button>
          <h2>@{activeChat.username}</h2>
        </header>

        <div className="messages-area">
          {messages.length === 0 ? (
            <p className="placeholder-text">Start a conversation with @{activeChat.username}</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.senderId === user.id ? 'own' : ''}`}>
                <div className="message-author">
                  <strong>@{msg.sender?.username}</strong>
                  <span className="message-time">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className="message-content">{msg.content}</p>
              </div>
            ))
          )}
          <div ref={messagesEnd} />
        </div>

        <form className="chat-input-bar" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message @${activeChat.username}...`}
            maxLength={2000}
          />
          <button type="submit" disabled={!input.trim()}>Send</button>
        </form>
      </div>
    )
  }

  return (
    <div className="dms-page">
      <header className="chat-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft /> Home</button>
        <h2>Messages</h2>
        <button className="new-chat-btn" onClick={() => setShowNew(!showNew)}>
          + New
        </button>
      </header>

      {showNew && (
        <div className="new-chat-form">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter username..."
            onKeyDown={(e) => e.key === 'Enter' && startNewChat()}
          />
          <button onClick={startNewChat}>Start</button>
        </div>
      )}

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <p className="placeholder-text">No conversations yet. Start one!</p>
        ) : (
          conversations.map((conv, i) => (
            <button key={i} className="conversation-item" onClick={() => startChat(conv.user)}>
              <div className="conversation-avatar">
                {conv.user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="conversation-info">
                <span className="conversation-name">@{conv.user?.username}</span>
                <span className="conversation-preview">{conv.lastMessage}</span>
              </div>
              <span className="conversation-time">{timeAgo(conv.lastMessageAt)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
