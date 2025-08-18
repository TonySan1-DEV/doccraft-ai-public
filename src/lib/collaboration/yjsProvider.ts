import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Awareness } from 'y-protocols/awareness';
import { AuditLogger } from '../audit/auditLogger';
import { MCPContext, AuditDetails } from '../../types/domain';

interface YjsProviderOptions {
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  mcpContext: MCPContext;
}

interface CollabProvider {
  provider: WebsocketProvider;
  ydoc: Y.Doc;
}

// Global provider registry
const providers = new Map<string, CollabProvider>();

export function getCollabProvider(docId: string): CollabProvider {
  return providers.get(docId)!;
}

export function disconnectProvider(docId: string): void {
  const provider = providers.get(docId);
  if (provider) {
    provider.provider.disconnect();
    providers.delete(docId);
  }
}

export function getActiveProviders(): string[] {
  return Array.from(providers.keys());
}

export class YjsProvider {
  private doc: Y.Doc;
  private provider: WebsocketProvider | null = null;
  private options: YjsProviderOptions;

  constructor(options: YjsProviderOptions) {
    this.options = options;
    this.doc = new Y.Doc();
  }

  async connect(): Promise<void> {
    try {
      const wsUrl =
        process.env.NEXT_PUBLIC_COLLABORATION_WS_URL || 'ws://localhost:1234';
      const roomId = this.options.roomId;
      const userName = this.options.userName;
      const userColor = this.options.userColor;

      const awareness = new Awareness(this.doc);

      awareness.setLocalState({
        name: userName,
        color: userColor,
      });

      this.provider = new WebsocketProvider(wsUrl, roomId, this.doc, {
        connect: true,
        awareness,
      });

      // Store provider in registry
      providers.set(roomId, {
        provider: this.provider,
        ydoc: this.doc,
      });

      // Log collaboration join event
      await AuditLogger.logAuditEvent({
        userId: this.options.userId,
        action: 'collaboration_join',
        resource: 'collaboration',
        details: {
          resourceId: roomId,
          resourceType: 'collaboration_room',
          parameters: {
            roomId,
            userName,
            userColor,
            wsUrl: wsUrl,
          },
        } as AuditDetails,
        mcpContext: this.options.mcpContext,
      });

      // Handle connection events
      this.provider.on('status', ({ status }: { status: string }) => {
        if (status === 'connected') {
        } else if (status === 'disconnected') {
        }
      });

      // Handle sync events
      this.provider.on('sync', (isSynced: boolean) => {});
    } catch (error) {
      console.error('Error connecting to Yjs provider:', error);

      // Log collaboration connection failure
      await AuditLogger.logAuditEvent({
        userId: this.options.userId,
        action: 'collaboration_connect_failed',
        resource: 'collaboration',
        details: {
          resourceId: this.options.roomId,
          resourceType: 'collaboration_room',
          error: {
            code: 'CONNECTION_FAILED',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
        } as AuditDetails,
        mcpContext: this.options.mcpContext,
      });

      throw error;
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
            resourceId: this.options.roomId,
            resourceType: 'collaboration_room',
            parameters: {
              roomId: this.options.roomId,
              userName: this.options.userName,
            },
          } as AuditDetails,
          mcpContext: this.options.mcpContext,
        });

        this.provider.disconnect();
        this.provider = null;
      }
    } catch (error) {
      console.error('Error disconnecting from Yjs provider:', error);
    }
  }

  getDocument(): Y.Doc {
    return this.doc;
  }

  getProvider(): WebsocketProvider | null {
    return this.provider;
  }

  isConnected(): boolean {
    return this.provider?.wsconnected || false;
  }

  getRoomId(): string {
    return this.options.roomId;
  }

  getUserId(): string {
    return this.options.userId;
  }

  getUserName(): string {
    return this.options.userName;
  }

  getUserColor(): string {
    return this.options.userColor;
  }
}
