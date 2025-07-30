import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { AuditLogger } from '../audit/auditLogger'

interface YjsProviderOptions {
  roomId: string
  userId: string
  userName: string
  userColor: string
  mcpContext: {
    tier: string
    role: string
    allowedActions: string[]
  }
}

interface CollabProvider {
  provider: WebsocketProvider
  ydoc: Y.Doc
}

// In-memory store for active providers to prevent multiple connections
const activeProviders = new Map<string, CollabProvider>()

export function getCollabProvider(docId: string): CollabProvider {
  // Return existing provider if already connected
  if (activeProviders.has(docId)) {
    return activeProviders.get(docId)!
  }

  // Create new Y.Doc for this document
  const ydoc = new Y.Doc()

  // Create WebSocket provider for real-time collaboration
  // Using a local WebSocket server for development
  const provider = new WebsocketProvider(
    'ws://localhost:1234', // Development WebSocket server
    `builder-doc-${docId}`, // Room name based on document ID
    ydoc
  )

  // Store the provider for reuse
  const collabProvider: CollabProvider = { provider, ydoc }
  activeProviders.set(docId, collabProvider)
  
  // Clean up provider when document is closed
  provider.on('connection-close', () => {
    activeProviders.delete(docId)
  })

  return collabProvider
}

export function disconnectProvider(docId: string): void {
  const provider = activeProviders.get(docId)
  if (provider) {
    provider.provider.destroy()
    activeProviders.delete(docId)
  }
}

export function getActiveProviders(): string[] {
  return Array.from(activeProviders.keys())
}

export class YjsProvider {
  private doc: Y.Doc
  private provider: WebsocketProvider | null = null
  private options: YjsProviderOptions

  constructor(options: YjsProviderOptions) {
    this.options = options
    this.doc = new Y.Doc()
  }

  async connect(): Promise<void> {
    try {
      const wsUrl = import.meta.env.VITE_COLLAB_SERVER_URL || 'ws://localhost:1234'
      const roomId = this.options.roomId
      const userId = this.options.userId
      const userName = this.options.userName
      const userColor = this.options.userColor

      // Create WebSocket provider with user info
      const wsUrlWithParams = `${wsUrl}?roomId=${roomId}&userId=${userId}&userName=${encodeURIComponent(userName)}&userColor=${encodeURIComponent(userColor)}`
      
      this.provider = new WebsocketProvider(wsUrlWithParams, roomId, this.doc, {
        connect: true
      })

      // Log collaboration join event
      await AuditLogger.logAuditEvent({
        userId: this.options.userId,
        action: 'collaboration_join',
        resource: 'collaboration',
        details: {
          roomId,
          userName,
          userColor,
          wsUrl: wsUrl
        },
        mcpContext: this.options.mcpContext
      })

      // Handle connection events
      this.provider.on('status', ({ status }: { status: string }) => {
        console.log('Yjs connection status:', status)
        
        if (status === 'connected') {
          console.log('✅ Connected to collaboration server')
        } else if (status === 'disconnected') {
          console.log('❌ Disconnected from collaboration server')
        }
      })

      // Handle sync events
      this.provider.on('sync', (isSynced: boolean) => {
        console.log('Yjs sync status:', isSynced ? 'synced' : 'syncing')
      })

    } catch (error) {
      console.error('Error connecting to Yjs provider:', error)
      
      // Log collaboration connection failure
      await AuditLogger.logAuditEvent({
        userId: this.options.userId,
        action: 'collaboration_connect_failed',
        resource: 'collaboration',
        details: {
          roomId: this.options.roomId,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        mcpContext: this.options.mcpContext
      })
      
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.provider) {
        // Log collaboration leave event
        await AuditLogger.logAuditEvent({
          userId: this.options.userId,
          action: 'collaboration_leave',
          resource: 'collaboration',
          details: {
            roomId: this.options.roomId,
            userName: this.options.userName
          },
          mcpContext: this.options.mcpContext
        })

        this.provider.disconnect()
        this.provider = null
        console.log('✅ Disconnected from collaboration server')
      }
    } catch (error) {
      console.error('Error disconnecting from Yjs provider:', error)
    }
  }

  getDocument(): Y.Doc {
    return this.doc
  }

  getProvider(): WebsocketProvider | null {
    return this.provider
  }

  isConnected(): boolean {
    return this.provider?.wsconnected || false
  }

  getRoomId(): string {
    return this.options.roomId
  }

  getUserId(): string {
    return this.options.userId
  }

  getUserName(): string {
    return this.options.userName
  }

  getUserColor(): string {
    return this.options.userColor
  }
} 