# Wikimedia Metadata Hydration Testing Guide

## Overview

The Wikimedia hydration pipeline fetches official metadata from Wikimedia Commons API and populates the `road_sign_images` table with:
- Official sign numbers (from structured data)
- Japanese and English names
- License and attribution info
- Categories and tags
- Revision tracking

## Manual Testing

### 1. Check Current Status

```sql
SELECT * FROM public.get_hydration_status();
```

Expected output:
```
total_images: 550
hydrated_count: 0 (initially)
unhydrated_count: 550 (initially)
hydration_percentage: 0.00
```

### 2. Trigger Hydration (Manual)

#### Option A: Using curl

```bash
curl -X GET \
  "https://YOUR_PROJECT.supabase.co/functions/v1/wikimedia-hydrator?mode=hydrate&limit=10" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

#### Option B: Using the test script

```bash
export SUPABASE_SERVICE_ROLE_KEY=your_key_here
./scripts/test-hydration.sh 10
```

#### Option C: Via Supabase Dashboard

1. Go to Edge Functions > wikimedia-hydrator
2. Click "Invoke"
3. Set query params: `mode=hydrate&limit=10`
4. Click "Invoke Function"

### 3. Verify Hydration Results

After running hydration, check:

```sql
-- Check hydration progress
SELECT * FROM public.get_hydration_status();

-- Check hydrated images
SELECT id, file_name, wikimedia_file_name, sign_number, sign_name_en, sign_name_jp, metadata_hydrated
FROM road_sign_images
WHERE metadata_hydrated = true
LIMIT 10;

-- Check for specific sign (e.g., steep ascent 212-3)
SELECT id, file_name, sign_number, sign_name_en, sign_name_jp
FROM road_sign_images
WHERE sign_number = '212-3'
OR file_name ILIKE '%212-3%'
LIMIT 5;
```

### 4. Test Search After Hydration

```sql
-- Test deterministic search via RPC
SELECT id, file_name, sign_number, sign_name_en, sign_name_jp, score
FROM search_road_signs('steep ascent')
LIMIT 5;

-- Expected: Should return images with sign_number = '212-3' or filename containing '212-3'
```

## Automated Hydration

### Setting Up Cron Jobs (Future)

Once pg_cron is properly configured with authentication:

```sql
-- Hourly hydration (new images)
SELECT cron.schedule(
  'wikimedia-hydrate-hourly',
  '0 * * * *',
  $$
  -- Call Edge Function via HTTP
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/wikimedia-hydrator',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('mode', 'hydrate', 'limit', 50)
  );
  $$
);

-- Daily rehydration (check for updates)
SELECT cron.schedule(
  'wikimedia-rehydrate-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/wikimedia-hydrator',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('mode', 'rehydrate', 'limit', 100)
  );
  $$
);
```

## Troubleshooting

### No metadata found for images

If hydration returns many failures:
1. Check Wikimedia file names match actual files
2. Verify images exist on Wikimedia Commons
3. Check Edge Function logs for errors

### Sign numbers not extracted

If `sign_number` remains NULL after hydration:
1. Check `extmetadata` column for structured data
2. Verify Wikimedia pages have P5544 (RoadSignCode) property
3. Some images may need manual mapping

### Search still returning wrong results

After hydration:
1. Verify `sign_number_map` has correct mappings
2. Check `deterministic-sign-search.ts` logic
3. Ensure `metadata_hydrated = true` for relevant images

## Expected Results

After full hydration (all 550 images):
- `hydration_percentage` should be ~100%
- Most images should have `sign_number` populated
- `sign_name_en` and `sign_name_jp` should be populated
- Search queries like "steep ascent" should return correct images (212-3)

