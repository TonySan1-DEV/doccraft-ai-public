import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import * as Y from 'yjs'

// Environment variables
const PORT = process.env.PORT || 1234
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Express app for health checks and API endpoints
const app = express()
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Collaboration session management
interface CollaborationSession {
  roomId: string
  userId: string
  userName: string
  userColor: string
  isActive: boolean
  joinedAt: Date
}

const activeSessions = new Map<string, CollaborationSession[]>()

// API endpoint to get active users in a room
app.get('/api/rooms/:roomId/users', async (req, res) => {
  try {
    const { roomId } = req.params
    const sessions = activeSessions.get(roomId) || []
    
    res.json({
      roomId,
      users: sessions.filter(s => s.isActive).map(s => ({
        id: s.userId,
        name: s.userName,
        color: s.userColor,
        joinedAt: s.joinedAt
      }))
    })
  } catch (error) {
    console.error('Error getting room users:', error)
    res.status(500).json({ error: 'Failed to get room users' })
  }
})

// API endpoint to join a collaboration room
app.post('/api/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params
    const { userId, userName, userColor } = req.body

    if (!activeSessions.has(roomId)) {
      activeSessions.set(roomId, [])
    }

    const sessions = activeSessions.get(roomId)!
    const existingSession = sessions.find(s => s.userId === userId)

    if (existingSession) {
      existingSession.isActive = true
      existingSession.joinedAt = new Date()
    } else {
      sessions.push({
        roomId,
        userId,
        userName,
        userColor,
        isActive: true,
        joinedAt: new Date()
      })
    }

    // Save to database
    await supabase
      .from('collaboration_sessions')
      .upsert({
        room_id: roomId,
        user_id: userId,
        user_name: userName,
        user_color: userColor,
        is_active: true,
        joined_at: new Date().toISOString()
      })

    res.json({ success: true })
  } catch (error) {
    console.error('Error joining room:', error)
    res.status(500).json({ error: 'Failed to join room' })
  }
})

// API endpoint to leave a collaboration room
app.post('/api/rooms/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params
    const { userId } = req.body

    const sessions = activeSessions.get(roomId)
    if (sessions) {
      const session = sessions.find(s => s.userId === userId)
      if (session) {
        session.isActive = false
      }
    }

    // Update database
    await supabase
      .from('collaboration_sessions')
      .update({ is_active: false })
      .eq('room_id', roomId)
      .eq('user_id', userId)

    res.json({ success: true })
  } catch (error) {
    console.error('Error leaving room:', error)
    res.status(500).json({ error: 'Failed to leave room' })
  }
})

// Create HTTP server
const server = createServer(app)

// Create WebSocket server
const wss = new WebSocketServer({ server })

// WebSocket connection handler with authentication
wss.on('connection', (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`)
  const roomId = url.searchParams.get('roomId')
  const userId = url.searchParams.get('userId')
  const userName = url.searchParams.get('userName')
  const userColor = url.searchParams.get('userColor')

  if (!roomId || !userId || !userName) {
    ws.close(1008, 'Missing required parameters')
    return
  }

  // Join the room
  if (!activeSessions.has(roomId)) {
    activeSessions.set(roomId, [])
  }

  const sessions = activeSessions.get(roomId)!
  const existingSession = sessions.find(s => s.userId === userId)

  if (existingSession) {
    existingSession.isActive = true
    existingSession.joinedAt = new Date()
  } else {
    sessions.push({
      roomId,
      userId,
      userName,
      userColor: userColor || '#FF6B6B',
      isActive: true,
      joinedAt: new Date()
    })
  }

  // Set up Yjs connection
  setupWSConnection(ws, req, { docName: roomId })

  // Handle disconnection
  ws.on('close', () => {
    const session = sessions.find(s => s.userId === userId)
    if (session) {
      session.isActive = false
    }

    // Clean up inactive sessions
    const activeSessionsInRoom = sessions.filter(s => s.isActive)
    if (activeSessionsInRoom.length === 0) {
      activeSessions.delete(roomId)
    }
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 DocCraft AI Collaboration Server running on port ${PORT}`)
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`)
  console.log(`🌐 HTTP API endpoint: http://localhost:${PORT}`)
  console.log(`💚 Health check: http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down collaboration server...')
  server.close()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down collaboration server...')
  server.close()
  process.exit(0)
}) 