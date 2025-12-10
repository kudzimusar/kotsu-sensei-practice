#!/bin/bash

echo "🔄 LIVE DOWNLOAD PROGRESS MONITOR"
echo "=================================="
echo ""

while true; do
  clear
  echo "🔄 LIVE DOWNLOAD PROGRESS MONITOR"
  echo "=================================="
  echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
  
  # Check if process is running
  if ps aux | grep -q "[d]ownload-all-categories"; then
    echo "✅ Process Status: RUNNING"
    echo "   PIDs: $(ps aux | grep '[d]ownload-all-categories' | awk '{print $2}' | tr '\n' ' ')"
  else
    echo "❌ Process Status: NOT RUNNING (may have completed)"
  fi
  
  echo ""
  echo "📊 Database Statistics:"
  
  # Check database count
  TOTAL=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM road_sign_images WHERE image_source = 'wikimedia_commons';" 2>/dev/null | tr -d ' ' || echo "N/A")
  echo "   Total images: $TOTAL"
  
  # Check recent uploads
  RECENT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM road_sign_images WHERE image_source = 'wikimedia_commons' AND updated_at > NOW() - INTERVAL '1 minute';" 2>/dev/null | tr -d ' ' || echo "N/A")
  echo "   Uploaded in last minute: $RECENT"
  
  echo ""
  echo "📝 Latest Log Activity (last 10 lines):"
  if [ -f all-categories-download-full.log ]; then
    tail -10 all-categories-download-full.log | sed 's/^/   /'
  else
    echo "   Log file not found"
  fi
  
  echo ""
  echo "📋 Current Report Status:"
  if [ -f all-categories-download-report.json ]; then
    echo "   Report file exists (checking details...)"
    cat all-categories-download-report.json 2>/dev/null | python3 -c "
import sys, json
try:
    r = json.load(sys.stdin)
    results = r.get('results', [])
    totals = r.get('totals', {})
    print(f'   Categories completed: {len(results)}')
    print(f'   Files found: {totals.get(\"filesFound\", 0)}')
    print(f'   Files uploaded: {totals.get(\"uploaded\", 0)}')
except:
    print('   Parsing report...')
" 2>/dev/null || echo "   Report file exists but may be incomplete"
  else
    echo "   Report file not created yet"
  fi
  
  echo ""
  echo "Press Ctrl+C to stop monitoring"
  echo "Refreshing in 3 seconds..."
  sleep 3
done


