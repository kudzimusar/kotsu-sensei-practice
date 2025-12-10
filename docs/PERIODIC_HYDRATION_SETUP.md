# Periodic Sign Hydration Setup Guide

## Overview

This guide explains how to set up periodic execution of the sign hydration process. The hydration script calls the `cleanup-and-hydrate` Supabase Edge Function to populate road sign metadata from Wikimedia Commons.

## Quick Start

### Manual Execution

Run the hydration script manually using npm:

```bash
# Use default batch size (10)
npm run hydrate

# Or specify a custom batch size
bash scripts/hydrate-signs.sh 20
```

### What It Does

The script:
- Calls the `cleanup-and-hydrate` Supabase Edge Function
- Processes a batch of unhydrated signs (default: 10)
- Fetches metadata from Wikimedia Commons API
- Populates sign numbers, names, and other metadata
- Returns status and results

## Setting Up Periodic Execution

### Option 1: Cron Job (Recommended for Linux/macOS)

Cron jobs are the most reliable way to run periodic tasks on Unix-like systems.

#### Step 1: Open Crontab

```bash
crontab -e
```

#### Step 2: Add Cron Job

Add one of the following entries based on your desired frequency:

**Every 6 hours:**
```cron
0 */6 * * * cd /Users/shadreckmusarurwa/Project\ AI/kotsu-sensei-practice && ./scripts/hydrate-signs.sh 10 >> /tmp/hydrate-signs.log 2>&1
```

**Every 12 hours:**
```cron
0 */12 * * * cd /Users/shadreckmusarurwa/Project\ AI/kotsu-sensei-practice && ./scripts/hydrate-signs.sh 10 >> /tmp/hydrate-signs.log 2>&1
```

**Daily at 2 AM:**
```cron
0 2 * * * cd /Users/shadreckmusarurwa/Project\ AI/kotsu-sensei-practice && ./scripts/hydrate-signs.sh 10 >> /tmp/hydrate-signs.log 2>&1
```

**Every hour:**
```cron
0 * * * * cd /Users/shadreckmusarurwa/Project\ AI/kotsu-sensei-practice && ./scripts/hydrate-signs.sh 10 >> /tmp/hydrate-signs.log 2>&1
```

#### Step 3: Verify Cron Job

```bash
# List your cron jobs
crontab -l

# Check logs
tail -f /tmp/hydrate-signs.log
```

#### Cron Schedule Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Option 2: Launchd (macOS)

For macOS, you can use Launch Agents instead of cron.

#### Step 1: Create Plist File

Create `~/Library/LaunchAgents/com.kotsu-sensei.hydrate-signs.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kotsu-sensei.hydrate-signs</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/shadreckmusarurwa/Project AI/kotsu-sensei-practice/scripts/hydrate-signs.sh</string>
        <string>10</string>
    </array>
    <key>StartInterval</key>
    <integer>21600</integer>
    <key>StandardOutPath</key>
    <string>/tmp/hydrate-signs.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/hydrate-signs-error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
```

#### Step 2: Load the Launch Agent

```bash
launchctl load ~/Library/LaunchAgents/com.kotsu-sensei.hydrate-signs.plist
```

#### Step 3: Verify It's Running

```bash
launchctl list | grep hydrate-signs
```

### Option 3: GitHub Actions (Cloud-based)

For cloud-based periodic execution, you can use GitHub Actions.

#### Step 1: Create Workflow File

Create `.github/workflows/hydrate-signs.yml`:

```yaml
name: Hydrate Signs

on:
  schedule:
    # Run every 6 hours
    - cron: '0 */6 * * *'
  workflow_dispatch: # Allow manual triggering

jobs:
  hydrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Hydration
        run: |
          chmod +x scripts/hydrate-signs.sh
          ./scripts/hydrate-signs.sh 10
        env:
          # Note: You may need to store the auth token as a GitHub secret
          # and pass it as an environment variable if the script is updated
          # to use environment variables instead of hardcoded values
```

#### Step 2: Add Secrets (if needed)

If you update the script to use environment variables:
1. Go to Repository Settings > Secrets
2. Add `SUPABASE_AUTH_TOKEN` secret
3. Update the workflow to use `${{ secrets.SUPABASE_AUTH_TOKEN }}`

### Option 4: Supabase pg_cron (Database-level)

If you have `pg_cron` extension enabled in Supabase, you can schedule it at the database level.

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule hourly hydration
SELECT cron.schedule(
  'hydrate-signs-hourly',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/cleanup-and-hydrate',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdWxydmZ3Y3F5dnV0Y3ZpZWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDA1MzcsImV4cCI6MjA3NzMxNjUzN30.0dM5c4ft7UIc7Uy6GmBthgNRcfqttvNs9EiR85OTVIo',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('action', 'hydrate', 'batchSize', 10)
  );
  $$
);
```

**Note:** This requires the `pg_net` extension and proper configuration in Supabase.

## Monitoring

### Check Execution Logs

```bash
# View recent logs
tail -f /tmp/hydrate-signs.log

# Search for errors
grep -i error /tmp/hydrate-signs.log

# Count successful runs
grep -c "✅ Hydration completed successfully" /tmp/hydrate-signs.log
```

### Check Hydration Status

Query the database to see hydration progress:

```sql
-- Check overall hydration status
SELECT * FROM public.get_hydration_status();

-- Count unhydrated signs
SELECT COUNT(*) as unhydrated_count
FROM road_sign_images
WHERE metadata_hydrated = false OR metadata_hydrated IS NULL;

-- View recently hydrated signs
SELECT id, file_name, sign_number, sign_name_en, sign_name_jp, metadata_hydrated
FROM road_sign_images
WHERE metadata_hydrated = true
ORDER BY updated_at DESC
LIMIT 10;
```

## Troubleshooting

### Script Fails with Permission Denied

```bash
# Make script executable
chmod +x scripts/hydrate-signs.sh
```

### Cron Job Not Running

1. Check cron service is running:
   ```bash
   # macOS
   sudo launchctl list | grep cron
   
   # Linux
   sudo systemctl status cron
   ```

2. Check cron logs:
   ```bash
   # macOS
   log show --predicate 'process == "cron"' --last 1h
   
   # Linux
   grep CRON /var/log/syslog
   ```

3. Verify path in cron job is correct (use absolute paths)

### HTTP 401 Unauthorized

- Verify the auth token is still valid
- Check if the token has expired
- Ensure the token has proper permissions

### No Signs Being Hydrated

- Check if there are unhydrated signs:
  ```sql
  SELECT COUNT(*) FROM road_sign_images WHERE metadata_hydrated = false;
  ```
- Verify the batch size is appropriate
- Check Edge Function logs in Supabase dashboard

## Best Practices

1. **Start Small**: Begin with a small batch size (10) and increase gradually
2. **Monitor Initially**: Watch logs for the first few runs to ensure everything works
3. **Adjust Frequency**: Based on your sign volume, adjust the frequency:
   - High volume: Every 1-3 hours
   - Medium volume: Every 6-12 hours
   - Low volume: Daily
4. **Error Handling**: The script includes error handling, but monitor logs regularly
5. **Token Security**: Consider moving the auth token to an environment variable for better security

## Security Considerations

⚠️ **Important**: The current script has the auth token hardcoded. For production:

1. Move the token to an environment variable
2. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
3. Use service role key with minimal required permissions
4. Rotate tokens periodically

Example with environment variable:

```bash
# In hydrate-signs.sh, replace hardcoded token with:
AUTH_TOKEN="${SUPABASE_AUTH_TOKEN:-default_token_here}"
```

Then set the environment variable:
```bash
export SUPABASE_AUTH_TOKEN="your_token_here"
```

## Related Documentation

- [Hydration Testing Guide](./HYDRATION_TESTING.md)
- [Wikimedia Metadata Hydration](./WIKIMEDIA_METADATA_HYDRATION.md)

