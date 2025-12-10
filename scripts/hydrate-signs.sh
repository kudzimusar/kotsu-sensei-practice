#!/bin/bash
# Periodic hydration script for road sign metadata
# Usage: ./scripts/hydrate-signs.sh [batchSize]
#
# This script calls the cleanup-and-hydrate Supabase Edge Function
# to hydrate remaining signs with metadata from Wikimedia Commons.
#
# For periodic execution, set up a cron job:
# 0 */6 * * * cd /path/to/project && ./scripts/hydrate-signs.sh 10

set -e

BATCH_SIZE=${1:-10}
PROJECT_URL="https://ndulrvfwcqyvutcviebk.supabase.co"
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdWxydmZ3Y3F5dnV0Y3ZpZWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDA1MzcsImV4cCI6MjA3NzMxNjUzN30.0dM5c4ft7UIc7Uy6GmBthgNRcfqttvNs9EiR85OTVIo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Starting periodic sign hydration..."
echo "   Project URL: $PROJECT_URL"
echo "   Batch Size: $BATCH_SIZE"
echo "   Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$PROJECT_URL/functions/v1/cleanup-and-hydrate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"hydrate\", \"batchSize\": $BATCH_SIZE}")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all but last line)
BODY=$(echo "$RESPONSE" | sed '$d')

# Check if request was successful
if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}✅ Hydration request successful (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "Response:"
  # Try to pretty-print JSON if jq is available, otherwise print as-is
  if command -v jq &> /dev/null; then
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  else
    echo "$BODY"
  fi
  echo ""
  echo -e "${GREEN}✅ Hydration completed successfully${NC}"
  exit 0
else
  echo -e "${RED}❌ Hydration request failed (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "Error response:"
  echo "$BODY"
  echo ""
  echo -e "${RED}❌ Hydration failed${NC}"
  exit 1
fi

