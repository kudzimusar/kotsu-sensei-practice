#!/bin/bash
# Test script to manually trigger Wikimedia hydration
# Usage: ./scripts/test-hydration.sh [limit]

set -e

LIMIT=${1:-10}
PROJECT_URL="${SUPABASE_URL:-https://ndulrvfwcqyvutcviebk.supabase.co}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SERVICE_KEY" ]; then
  echo "Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
  echo "Please set it before running this script:"
  echo "  export SUPABASE_SERVICE_ROLE_KEY=your_key_here"
  exit 1
fi

echo "🚀 Triggering Wikimedia hydration..."
echo "   Project URL: $PROJECT_URL"
echo "   Limit: $LIMIT"
echo ""

RESPONSE=$(curl -s -X GET \
  "$PROJECT_URL/functions/v1/wikimedia-hydrator?mode=hydrate&limit=$LIMIT" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""


