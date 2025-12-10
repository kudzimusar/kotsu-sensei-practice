#!/bin/bash
# Script to investigate hydration errors
# This queries the database to see which signs are failing and why

set -e

PROJECT_URL="https://ndulrvfwcqyvutcviebk.supabase.co"
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdWxydmZ3Y3F5dnV0Y3ZpZWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDA1MzcsImV4cCI6MjA3NzMxNjUzN30.0dM5c4ft7UIc7Uy6GmBthgNRcfqttvNs9EiR85OTVIo"

echo "🔍 Investigating hydration errors..."
echo ""

# Query to get unhydrated signs with details
QUERY=$(cat <<'EOF'
SELECT 
  id,
  file_name,
  sign_number,
  sign_name_en,
  sign_category,
  ai_enhanced,
  metadata_hydrated,
  is_verified,
  image_source
FROM road_sign_images
WHERE is_verified = true 
  AND ai_enhanced = false
ORDER BY file_name
LIMIT 100;
EOF
)

# Use Supabase REST API to query
RESPONSE=$(curl -s -X POST \
  "$PROJECT_URL/rest/v1/rpc/exec_sql" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "apikey: $AUTH_TOKEN" \
  -d "{\"query\": \"$QUERY\"}" 2>/dev/null || echo "[]")

echo "📊 Unhydrated Signs Analysis:"
echo ""

# Try to parse and display results
if command -v jq &> /dev/null; then
  echo "$RESPONSE" | jq -r '
    if type == "array" and length > 0 then
      "Total unhydrated signs: \(length)\n",
      "Sample signs:\n",
      (.[0:10] | .[] | "  - \(.file_name // "unknown") | Sign: \(.sign_number // "N/A") | Category: \(.sign_category // "N/A")")
    else
      "No data returned or API error"
    end
  ' 2>/dev/null || echo "Could not parse response"
else
  echo "$RESPONSE"
fi

echo ""
echo "💡 To get more details, check the Supabase dashboard or run SQL queries directly."
echo ""
echo "Suggested SQL query:"
echo "SELECT id, file_name, sign_number, sign_name_en, sign_category, ai_enhanced"
echo "FROM road_sign_images"
echo "WHERE is_verified = true AND ai_enhanced = false"
echo "ORDER BY file_name"
echo "LIMIT 60;"

