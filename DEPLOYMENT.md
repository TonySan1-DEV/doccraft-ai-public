# 🚀 DocCraft AI Production Deployment Guide

## 📋 **Prerequisites**

- Node.js 18+ and npm
- Supabase account and project
- PostgreSQL database (Supabase provides this)
- Environment variables configured

## 🔧 **1. Environment Setup**

### **Frontend Environment Variables**
Create `.env.local` in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Collaboration Server
VITE_COLLAB_SERVER_URL=ws://localhost:1234
VITE_COLLAB_API_URL=http://localhost:1234
```

### **Backend Environment Variables**
Create `.env` in the server directory:

```bash
# Server Configuration
PORT=1234
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Security
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-domain.com
```

## 🗄️ **2. Database Setup**

### **Run Database Migrations**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the schema
npm run db:migrate
```

### **Verify Database Tables**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'documents', 'document_shares', 'collaboration_sessions');
```

## 🏗️ **3. Backend Server Setup**

### **Install Server Dependencies**
```bash
# Install server dependencies
npm install express ws cors dotenv tsx @types/express @types/ws @types/cors
```

### **Build and Start Server**
```bash
# Development
npm run server:dev

# Production build
npm run server:build

# Start production server
npm run server:start
```

### **Server Configuration**
The collaboration server includes:
- ✅ **WebSocket connections** for real-time collaboration
- ✅ **HTTP API endpoints** for room management
- ✅ **Authentication** with Supabase
- ✅ **Session tracking** for active users
- ✅ **Health checks** for monitoring

## 🌐 **4. Frontend Deployment**

### **Build for Production**
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Preview the build
npm run preview
```

### **Deploy to Vercel/Netlify**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

## 🔐 **5. Authentication Setup**

### **Supabase Auth Configuration**
1. Go to your Supabase dashboard
2. Navigate to Authentication > Settings
3. Configure your site URL and redirect URLs
4. Set up email templates

### **User Registration Flow**
```typescript
// Example user registration
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
})
```

## 📊 **6. Monitoring & Analytics**

### **Health Checks**
```bash
# Check server health
curl http://localhost:1234/health

# Check room users
curl http://localhost:1234/api/rooms/room-id/users
```

### **Logging Setup**
```typescript
// Add to collaboration server
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

## 🔒 **7. Security Considerations**

### **CORS Configuration**
```typescript
// In collaboration server
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true
}))
```

### **Rate Limiting**
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use(limiter)
```

### **WebSocket Security**
```typescript
// Validate WebSocket connections
wss.on('connection', (ws, req) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    ws.close(1008, 'Unauthorized')
    return
  }
  
  // Verify JWT token with Supabase
  // ... token verification logic
})
```

## 📈 **8. Performance Optimization**

### **Database Indexes**
```sql
-- Ensure indexes are created
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaboration_sessions_room_id ON collaboration_sessions(room_id);
```

### **Caching Strategy**
```typescript
// Add Redis for session caching
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

// Cache user sessions
await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData))
```

## 🚨 **9. Troubleshooting**

### **Common Issues**

#### **WebSocket Connection Failed**
```bash
# Check if server is running
netstat -an | grep 1234

# Check firewall settings
sudo ufw allow 1234
```

#### **Database Connection Issues**
```bash
# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/profiles" \
  -H "apikey: your-anon-key"
```

#### **Collaboration Not Working**
1. Check browser console for WebSocket errors
2. Verify environment variables are set correctly
3. Ensure user is authenticated
4. Check if collaboration is enabled for user tier

### **Debug Commands**
```bash
# Check server logs
tail -f logs/collaboration-server.log

# Monitor WebSocket connections
netstat -an | grep :1234 | wc -l

# Check database connections
psql -h your-db-host -U postgres -d postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🎯 **10. Production Checklist**

- ✅ **Environment variables** configured
- ✅ **Database schema** migrated
- ✅ **Authentication** working
- ✅ **Collaboration server** running
- ✅ **Frontend** deployed
- ✅ **SSL certificates** installed
- ✅ **Monitoring** set up
- ✅ **Backup strategy** implemented
- ✅ **Error tracking** configured
- ✅ **Performance monitoring** active

## 📞 **11. Support**

For issues or questions:
- Check the troubleshooting section above
- Review server logs for errors
- Verify all environment variables are set
- Ensure database permissions are correct
- Test with a fresh browser session

---

**🎉 Your DocCraft AI collaboration system is now production-ready!** 