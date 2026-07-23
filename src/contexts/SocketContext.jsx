import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  const connect = () => {
    const token = localStorage.getItem('votg_token')
    if (!token) {
      if (socketRef.current) socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
      return
    }

    if (socketRef.current) socketRef.current.disconnect()

    const s = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', () => {})

    socketRef.current = s
    setSocket(s)
  }

  useEffect(() => {
    connect()

    const handleStorage = (e) => {
      if (e.key === 'votg_token') connect()
    }
    const handleTokenChange = () => connect()
    window.addEventListener('storage', handleStorage)
    window.addEventListener('votg_token_changed', handleTokenChange)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('votg_token_changed', handleTokenChange)
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

// eslint-disable-next-line react/only-export-components
export function useSocket() {
  return useContext(SocketContext)
}