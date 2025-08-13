# DocCraft AI Production Deployment

This directory contains the production deployment configuration for DocCraft AI, featuring a streamlined architecture optimized for Kubernetes deployment with comprehensive monitoring.

## 🏗️ Architecture Overview

The production deployment uses a **hybrid approach**:

- **Docker Compose**: For local development, testing, and simplified deployments
- **Kubernetes**: For production orchestration with auto-scaling and advanced monitoring

### Docker Compose Services

- `doccraft-ai-frontend`: React frontend application
- `doccraft-ai-backend`: Node.js backend API
- `redis`: Redis cache and session store
- `postgres`: PostgreSQL database with initialization
- `prometheus`: Metrics collection and storage
- `grafana`: Monitoring dashboards and visualization

### Kubernetes Deployment

- **Single Application Pod**: Combined frontend and backend in one container
- **Auto-scaling**: Horizontal Pod Autoscaler (HPA) with CPU/memory metrics
- **Monitoring Stack**: Prometheus, Grafana, AlertManager, Node Exporter
- **Production Namespace**: Isolated `production` namespace with security policies

## 📁 File Structure

```
deploy/production/
├── docker-compose.yml          # Docker Compose for local/production
├── Dockerfile.production       # Multi-stage production Dockerfile
├── init.sql                    # PostgreSQL database initialization
├── nginx.conf                  # Nginx reverse proxy configuration
├── nginx-frontend.conf         # Frontend-specific Nginx config
├── redis-sentinel.conf         # Redis Sentinel configuration
├── env.production.template.new # Environment variables template
└── README.md                   # This file

k8s/
├── production/
│   └── doccraft-ai-deployment.yml  # Main application deployment
└── monitoring/
    └── monitoring-stack.yml         # Monitoring infrastructure

monitoring/
├── prometheus.yml              # Prometheus configuration
├── alerts.yml                  # Alert rules
└── grafana/
    ├── dashboards/             # Grafana dashboard configs
    └── datasources/            # Grafana datasource configs

scripts/
└── deploy-production.sh        # Automated deployment script
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy and configure environment variables
cp env.production.template.new .env.production
# Edit .env.production with your production values
```

### 2. Docker Compose Deployment

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Kubernetes Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

## 🔧 Configuration

### Environment Variables

Key environment variables for production:

```bash
# Application
NODE_ENV=production
API_URL=https://api.your-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Database
POSTGRES_DB=doccraft
POSTGRES_USER=doccraft
POSTGRES_PASSWORD=secure-password

# Redis
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret

# Monitoring
GRAFANA_PASSWORD=admin
```

### Database Initialization

The `init.sql` file automatically creates:

- User management tables
- AI request tracking
- Document storage
- Audit logging
- Performance metrics
- Proper indexes and constraints

## 📊 Monitoring & Observability

### Metrics Endpoints

- **Application Metrics**: `/metrics` (Prometheus format)
- **Node.js Metrics**: `/metrics/nodejs`
- **AI Performance**: `/metrics/ai-performance`
- **Security Metrics**: `/metrics/security`

### Alerting Rules

- **High Response Time**: >5s 95th percentile
- **High Error Rate**: >1% error rate
- **Service Down**: Service unavailable
- **Low Cache Hit Rate**: <80% cache efficiency
- **Security Threats**: High threat level detection

### Access Points

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Application**: http://localhost:3000 (frontend), http://localhost:8000 (API)

## 🔒 Security Features

### Network Policies

- Restricted pod-to-pod communication
- Monitoring namespace access only
- External traffic through Ingress

### Security Headers

- HSTS enforcement
- XSS protection
- Content Security Policy
- Referrer Policy

### Authentication

- JWT-based session management
- Secure cookie handling
- Rate limiting (100 req/min)

## 📈 Scaling & Performance

### Auto-scaling Configuration

- **Minimum Replicas**: 3
- **Maximum Replicas**: 10
- **CPU Threshold**: 70% utilization
- **Memory Threshold**: 80% utilization

### Resource Limits

- **CPU**: 500m request, 1000m limit
- **Memory**: 1Gi request, 2Gi limit
- **Cache Volume**: 1Gi temporary storage

### Performance Optimizations

- Multi-stage Docker builds
- Gzip compression
- Static file caching
- Database connection pooling
- Redis caching layer

## 🗄️ Database Management

### PostgreSQL Features

- UUID primary keys
- JSONB for flexible metadata
- Automatic timestamp updates
- Proper indexing strategy
- Audit logging

### Backup Strategy

- Automated daily backups
- Point-in-time recovery capability
- Cross-region replication (if configured)

## 📝 Logging

### Log Aggregation

- Structured JSON logging
- Centralized log collection
- Log retention policies
- Error tracking and alerting

### Audit Trail

- User action logging
- API request tracking
- Security event monitoring
- Compliance reporting

## 🚨 Troubleshooting

### Common Issues

1. **Service Health Checks Failing**

   ```bash
   # Check container logs
   docker-compose logs [service-name]

   # Verify health endpoints
   curl http://localhost:8000/health
   curl http://localhost:3000/health
   ```

2. **Database Connection Issues**

   ```bash
   # Check PostgreSQL status
   docker-compose exec postgres pg_isready

   # Verify environment variables
   docker-compose exec backend env | grep POSTGRES
   ```

3. **Monitoring Not Working**

   ```bash
   # Check Prometheus targets
   curl http://localhost:9090/api/v1/targets

   # Verify Grafana datasource
   # Check Grafana UI at http://localhost:3001
   ```

### Health Check Endpoints

- **Frontend**: `GET /health`
- **Backend**: `GET /health`
- **Database**: PostgreSQL connection test
- **Redis**: Redis ping test
- **Prometheus**: `GET /-/healthy`

## 🔄 Updates & Maintenance

### Rolling Updates

- Zero-downtime deployments
- Health check validation
- Automatic rollback on failure
- Blue-green deployment support

### Maintenance Mode

- Graceful service degradation
- User notification system
- Scheduled maintenance windows
- Emergency maintenance procedures

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Production Best Practices](https://kubernetes.io/docs/setup/best-practices/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [PostgreSQL Production Tuning](https://www.postgresql.org/docs/current/runtime-config.html)

## 🤝 Support

For production deployment support:

1. Check the troubleshooting section above
2. Review application logs and monitoring dashboards
3. Consult the project documentation
4. Contact the development team

---

**Note**: This deployment configuration is designed for production use. Always test in a staging environment first and ensure all security measures are properly configured for your specific requirements.
