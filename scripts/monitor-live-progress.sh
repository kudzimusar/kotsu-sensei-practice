#!/bin/bash

# Live monitoring script for Wikimedia download progress
# Updates every 3 seconds

clear
echo "🔄 LIVE DOWNLOAD PROGRESS MONITOR"
echo "=================================="
echo "Press Ctrl+C to stop monitoring"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

while true; do
  # Clear screen and move cursor to top
  printf "\033[H\033[J"
  
  echo "🔄 LIVE DOWNLOAD PROGRESS MONITOR"
  echo "=================================="
  echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
  
  # Check if process is running
  if ps aux | grep -q "[d]ownload-all-categories"; then
    echo -e "${GREEN}✅ Process Status: RUNNING${NC}"
    PROCESS_COUNT=$(ps aux | grep -c "[d]ownload-all-categories")
    CHILD_COUNT=$(ps aux | grep -c "[c]lean-wikimedia-download")
    echo "   Main processes: $PROCESS_COUNT"
    echo "   Child processes: $CHILD_COUNT"
  else
    echo -e "${RED}❌ Process Status: NOT RUNNING${NC}"
  fi
  
  echo ""
  echo "📊 Database Statistics:"
  
  # Get database stats using Node script (more reliable than direct psql)
  DB_STATS=$(node -e "
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );
    Promise.all([
      supabase.from('road_sign_images').select('*', { count: 'exact', head: true }).eq('image_source', 'wikimedia_commons'),
      supabase.from('road_sign_images').select('sign_category').eq('image_source', 'wikimedia_commons').gte('updated_at', new Date(Date.now() - 60000).toISOString()),
    ]).then(([total, recent]) => {
      const totalCount = total.count || 0;
      const recentCount = recent.data?.length || 0;
      console.log(JSON.stringify({ total: totalCount, recent: recentCount }));
    }).catch(() => console.log(JSON.stringify({ total: 'error', recent: 0 })));
  " 2>/dev/null || echo '{"total":"N/A","recent":0}')
  
  TOTAL=$(echo "$DB_STATS" | grep -o '"total":[0-9]*' | grep -o '[0-9]*' || echo "N/A")
  RECENT=$(echo "$DB_STATS" | grep -o '"recent":[0-9]*' | grep -o '[0-9]*' || echo "0")
  
  echo "   Total images: $TOTAL"
  echo "   Uploaded in last minute: ${RECENT}"
  
  # Get category breakdown
  echo ""
  echo "📋 Categories in Database:"
  CATEGORIES=$(node -e "
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );
    supabase.from('road_sign_images')
      .select('sign_category')
      .eq('image_source', 'wikimedia_commons')
      .then(({ data }) => {
        const counts = {};
        data?.forEach(item => {
          counts[item.sign_category] = (counts[item.sign_category] || 0) + 1;
        });
        console.log(JSON.stringify(counts));
      }).catch(() => console.log('{}'));
  " 2>/dev/null || echo '{}')
  
  echo "$CATEGORIES" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for cat, count in sorted(data.items(), key=lambda x: x[1], reverse=True):
        print(f'   {cat}: {count}')
except:
    print('   Loading...')
" 2>/dev/null || echo "   Loading..."
  
  echo ""
  echo "📝 Latest Log Activity:"
  if [ -f all-categories-download-full.log ]; then
    LOG_LINES=$(tail -8 all-categories-download-full.log 2>/dev/null | tail -5)
    if [ -n "$LOG_LINES" ]; then
      echo "$LOG_LINES" | sed 's/^/   /'
    else
      echo "   Waiting for log entries..."
    fi
  else
    echo "   Log file not found"
  fi
  
  echo ""
  echo "📊 Report File:"
  if [ -f all-categories-download-report.json ]; then
    REPORT_INFO=$(cat all-categories-download-report.json 2>/dev/null | python3 -c "
import sys, json
try:
    r = json.load(sys.stdin)
    results = r.get('results', [])
    totals = r.get('totals', {})
    completed = len([r for r in results if r.get('success')])
    print(f'   Categories completed: {completed}/{len(r.get(\"categories\", []))}')
    print(f'   Files found: {totals.get(\"filesFound\", 0)}')
    print(f'   Files uploaded: {totals.get(\"uploaded\", 0)}')
except:
    pass
" 2>/dev/null)
    if [ -n "$REPORT_INFO" ]; then
      echo "$REPORT_INFO"
    else
      echo "   Report exists (parsing...)"
    fi
  else
    echo "   Report file not created yet"
  fi
  
  echo ""
  echo "Press Ctrl+C to stop | Refreshing in 3 seconds..."
  sleep 3
done


