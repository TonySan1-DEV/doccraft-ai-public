import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import * as Y from 'yjs';
import crypto from 'crypto';
import monitorRouter from './routes/monitor';
import i18nTranslateRouter from './routes/i18n.translate';
import { getSupabaseAdmin } from './lib/supabaseAdmin';
import { initMetrics } from './monitoring/metrics';

// Environment variables
const PORT = process.env.PORT || 1234;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Initialize Supabase (only if URL is provided)
let supabase: any = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  } catch (error) {
    console.warn('⚠️ Supabase initialization failed:', error);
  }
}

// Express app for health checks and API endpoints
const app = express();

// Security hardening: JSON body limit + request ID middleware
app.use(express.json({ limit: '512kb' })); // 防 abuse; harmless with flags OFF

app.use((req, _res, next) => {
  const hdr = req.header('x-request-id');
  (req as any).rid = hdr && hdr.length <= 128 ? hdr : crypto.randomUUID();
  next();
});

// CORS with origin normalization (only if FRONTEND_ORIGIN is set)
const origin = process.env.FRONTEND_ORIGIN;
app.use(
  cors({
    origin: origin ? [origin] : false, // no wildcard; keep disabled if not set
    credentials: false,
  })
);

// Initialize metrics if enabled
const metrics = initMetrics();
if (metrics) {
  // Request timing middleware
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const end = metrics.httpDuration.startTimer({
        method: req.method,
        route: 'pending', // will update on finish if router sets it
        status: 'pending',
      });

      res.on('finish', () => {
        const route =
          // @ts-ignore populated by express if route matched
          (req.route?.path as string) ||
          // Fallback: use originalUrl (high cardinality, but fine if no route)
          req.baseUrl ||
          req.originalUrl ||
          'unknown';

        const status = String(res.statusCode);
        end({ method: req.method, route, status });

        if (res.statusCode >= 400) {
          metrics.httpErrors.inc({ method: req.method, route, status });
        }
      });

      next();
    }
  );

  // /metrics endpoint (token protected)
  const token = process.env.METRICS_TOKEN ?? '';
  app.get('/metrics', async (req: express.Request, res: express.Response) => {
    const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const q = (req.query.token as string) || '';
    if (!token || (auth !== token && q !== token)) {
      return res.status(401).send('unauthorized');
    }
    res.set('Content-Type', metrics.registry.contentType);
    res.send(await metrics.registry.metrics());
  });

  console.log('📊 Metrics collection enabled');
}

// Monitor endpoint for error reporting
app.use('/api/monitor', monitorRouter);

// i18n translation endpoint
app.use(i18nTranslateRouter);

// Audio export routes (flag-gated)
import audioExportRouter from './routes/export.audio';
app.use('/api/export', audioExportRouter);

// Agentics (flag-gated)
import { makeAgenticsRunRouter } from './routes/agentics.run';
app.use('/api/agentics', makeAgenticsRunRouter());

// Health check endpoint
app.get('/health', (req, res) => {
  const rid = (req as any).rid || 'unknown';
  res.json({ status: 'ok', timestamp: new Date().toISOString(), rid });
});

// Collaboration session management
interface CollaborationSession {
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  isActive: boolean;
  joinedAt: Date;
}

const activeSessions = new Map<string, CollaborationSession[]>();

// API endpoint to get active users in a room
app.get('/api/rooms/:roomId/users', async (req, res) => {
  try {
    const { roomId } = req.params;
    const sessions = activeSessions.get(roomId) || [];

    res.json({
      roomId,
      users: sessions
        .filter(s => s.isActive)
        .map(s => ({
          id: s.userId,
          name: s.userName,
          color: s.userColor,
          joinedAt: s.joinedAt,
        })),
    });
  } catch (error) {
    console.error('Error getting room users:', error);
    res.status(500).json({ error: 'Failed to get room users' });
  }
});

// API endpoint to join a collaboration room
app.post('/api/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userName, userColor } = req.body;

    if (!activeSessions.has(roomId)) {
      activeSessions.set(roomId, []);
    }

    const sessions = activeSessions.get(roomId)!;
    const existingSession = sessions.find(s => s.userId === userId);

    if (existingSession) {
      existingSession.isActive = true;
      existingSession.joinedAt = new Date();
    } else {
      sessions.push({
        roomId,
        userId,
        userName,
        userColor,
        isActive: true,
        joinedAt: new Date(),
      });
    }

    // Save to database (only if Supabase is available)
    if (supabase) {
      try {
        await supabase.from('collaboration_sessions').upsert({
          room_id: roomId,
          user_id: userId,
          user_name: userName,
          user_color: userColor,
          is_active: true,
          joined_at: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('⚠️ Database save failed:', error);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// API endpoint to leave a collaboration room
app.post('/api/rooms/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    const sessions = activeSessions.get(roomId);
    if (sessions) {
      const session = sessions.find(s => s.userId === userId);
      if (session) {
        session.isActive = false;
      }
    }

    // Update database (only if Supabase is available)
    if (supabase) {
      try {
        await supabase
          .from('collaboration_sessions')
          .update({ is_active: false })
          .eq('room_id', roomId)
          .eq('user_id', userId);
      } catch (error) {
        console.warn('⚠️ Database update failed:', error);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket connection handler with authentication
wss.on('connection', (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const roomId = url.searchParams.get('roomId');
  const userId = url.searchParams.get('userId');
  const userName = url.searchParams.get('userName');
  const userColor = url.searchParams.get('userColor');

  if (!roomId || !userId || !userName) {
    ws.close(1008, 'Missing required parameters');
    return;
  }

  // Join the room
  if (!activeSessions.has(roomId)) {
    activeSessions.set(roomId, []);
  }

  const sessions = activeSessions.get(roomId)!;
  const existingSession = sessions.find(s => s.userId === userId);

  if (existingSession) {
    existingSession.isActive = true;
    existingSession.joinedAt = new Date();
  } else {
    sessions.push({
      roomId,
      userId,
      userName,
      userColor: userColor || '#FF6B6B',
      isActive: true,
      joinedAt: new Date(),
    });
  }

  // Set up Yjs connection
  setupWSConnection(ws, req, { docName: roomId });

  // Handle disconnection
  ws.on('close', () => {
    const session = sessions.find(s => s.userId === userId);
    if (session) {
      session.isActive = false;
    }

    // Clean up inactive sessions
    const activeSessionsInRoom = sessions.filter(s => s.isActive);
    if (activeSessionsInRoom.length === 0) {
      activeSessions.delete(roomId);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 DocCraft AI Collaboration Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP API endpoint: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);

  // Streamlined monitor persistence bootstrap
  if (process.env.MONITORING_PERSIST_ENABLED === 'true') {
    try {
      getSupabaseAdmin(); // Verify Supabase availability
      console.log('📊 Monitor persistence enabled with Supabase');

      // Set up retention cleanup (24h fallback if pg_cron unavailable)
      const retentionDays = Math.max(
        1,
        Number(process.env.MONITORING_RETENTION_DAYS ?? '30')
      );
      const dayMs = 24 * 60 * 60 * 1000;

      setInterval(async () => {
        try {
          const admin = getSupabaseAdmin();
          await admin.rpc('purge_old_monitor_events', {
            retention_days: retentionDays,
          });
          console.log(
            `🧹 Purged monitor events older than ${retentionDays} days`
          );
        } catch (err) {
          console.warn(
            '⚠️ Monitor purge failed:',
            err instanceof Error ? err.message : 'Unknown error'
          );
        }
      }, dayMs).unref?.();

      console.log(
        `🔄 Monitor retention purge scheduled every 24h (${retentionDays} days retention)`
      );
    } catch (err) {
      console.warn('⚠️ Monitor persistence disabled: Supabase not available');
    }
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down collaboration server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down collaboration server...');
  server.close();
  process.exit(0);
});
