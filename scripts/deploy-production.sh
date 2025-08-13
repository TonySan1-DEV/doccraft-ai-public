#!/bin/bash
# scripts/deploy-production.sh

set -e

# Configuration
NAMESPACE="production"
IMAGE_TAG="3.0.0"
CLUSTER_NAME="doccraft-ai-prod"

echo "🚀 Starting DocCraft-AI Production Deployment"

# Pre-deployment validation
echo "📋 Running pre-deployment checks..."

# Validate environment variables
if [[ -z "$SUPABASE_URL" || -z "$OPENAI_API_KEY" ]]; then
  echo "❌ Missing required environment variables"
  exit 1
fi

# Run tests
echo "🧪 Running production test suite..."
npm run test:production
if [ $? -ne 0 ]; then
  echo "❌ Tests failed, aborting deployment"
  exit 1
fi

# Build and push Docker image
echo "🐳 Building production Docker image..."
docker build -t doccraft-ai:${IMAGE_TAG} -f Dockerfile.production .
docker tag doccraft-ai:${IMAGE_TAG} your-registry/doccraft-ai:${IMAGE_TAG}
docker push your-registry/doccraft-ai:${IMAGE_TAG}

# Update Kubernetes secrets
echo "🔐 Updating Kubernetes secrets..."
kubectl create secret generic doccraft-secrets \
  --from-literal=supabase-url="$SUPABASE_URL" \
  --from-literal=supabase-service-role-key="$SUPABASE_SERVICE_ROLE_KEY" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic ai-secrets \
  --from-literal=openai-api-key="$OPENAI_API_KEY" \
  --from-literal=anthropic-api-key="$ANTHROPIC_API_KEY" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy monitoring stack
echo "📊 Deploying monitoring stack..."
kubectl apply -f k8s/monitoring/

# Deploy application
echo "🎯 Deploying DocCraft-AI application..."
kubectl apply -f k8s/production/

# Wait for rollout to complete
echo "⏳ Waiting for deployment to complete..."
kubectl rollout status deployment/doccraft-ai-app -n $NAMESPACE --timeout=600s

# Verify deployment
echo "✅ Verifying deployment health..."

# Check pod status
kubectl get pods -n $NAMESPACE -l app=doccraft-ai

# Run health checks
kubectl exec -n $NAMESPACE deployment/doccraft-ai-app -- curl -f http://localhost:8000/health

# Verify monitoring
echo "📈 Verifying monitoring setup..."
kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090 &
PROMETHEUS_PID=$!
sleep 5
curl -f http://localhost:9090/-/healthy || echo "⚠️ Prometheus health check failed"
kill $PROMETHEUS_PID

echo "🎉 Deployment completed successfully!"
echo "📊 Access Grafana dashboard at: https://grafana.your-domain.com"
echo "🔍 Access application at: https://app.your-domain.com"
