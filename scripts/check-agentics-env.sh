#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Checking Agentics environment variables..."

# Check required vars
if [[ -z "${FEATURE_AGENTICS:-}" ]]; then
  echo "❌ FEATURE_AGENTICS not set"
  exit 1
fi

if [[ -z "${SUPABASE_URL:-}" ]]; then
  echo "❌ SUPABASE_URL not set"
  exit 1
fi

if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not set"
  exit 1
fi

if [[ -z "${AGENTICS_MAINT_TOKEN:-}" ]]; then
  echo "❌ AGENTICS_MAINT_TOKEN not set"
  exit 1
fi

echo "✅ All required environment variables are set"
echo "   FEATURE_AGENTICS: $FEATURE_AGENTICS"
echo "   SUPABASE_URL: ${SUPABASE_URL:0:30}..."
echo "   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo "   AGENTICS_MAINT_TOKEN: ${AGENTICS_MAINT_TOKEN:0:20}..."
