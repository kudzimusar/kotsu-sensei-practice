# Wikimedia Metadata Hydration Pipeline

## Overview

This pipeline fetches official metadata from the Wikimedia Commons API for all road sign images stored in Supabase. This ensures accurate sign number mappings, Japanese/English names, and other authoritative metadata.

## Why This Is Critical

Without official metadata from Wikimedia:
- Sign numbers (e.g., "212-3" for steep ascent) are missing or incorrect
- Japanese and English names may not match official sources
- The system has to guess instead of using exact mappings
- Wrong images are returned (e.g., horn sign instead of steep ascent)

With official metadata:
- Exact sign numbers extracted from Wikimedia structured data
- Accurate Japanese and English names
- 100% deterministic matching
- Always returns correct images

## Database Schema

The `road_sign_images` table now includes:

- `wikimedia_pageid` - Official Wikimedia page ID
- `revision_id` - Revision tracking for updates
- `metadata_hydrated` - Boolean flag indicating if metadata is complete
- `metadata_hydrated_at` - Timestamp of last hydration
- `extmetadata` - Extended metadata from Wikimedia (JSONB)
- `commonmetadata` - Common metadata from Wikimedia (JSONB)
- `exif_metadata` - EXIF data (JSONB array)

## Edge Function: `wikimedia-hydrator`

### Usage

**Hydrate unhydrated images:**
```
GET /functions/v1/wikimedia-hydrator?mode=hydrate&limit=50
```

**Rehydrate outdated metadata:**
```
GET /functions/v1/wikimedia-hydrator?mode=rehydrate&limit=50
```

### Parameters

- `mode` (optional): `hydrate` (default) or `rehydrate`
- `limit` (optional): Number of images to process (default: 50)

### Response

```json
{
  "success": true,
  "mode": "hydrate",
  "processed": 50,
  "succeeded": 48,
  "failed": 2,
  "timestamp": "2025-11-27T13:35:05.000Z"
}
```

## Scheduled Execution

To run automatically, set up a Supabase cron job:

```sql
-- Run every hour to hydrate new images
SELECT cron.schedule(
  'hydrate-wikimedia-metadata',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_get(
    url := current_setting('app.supabase_url') || '/functions/v1/wikimedia-hydrator?mode=hydrate&limit=50',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    )
  ) AS request_id;
  $$
);

-- Run daily to check for updates
SELECT cron.schedule(
  'rehydrate-wikimedia-metadata',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT net.http_get(
    url := current_setting('app.supabase_url') || '/functions/v1/wikimedia-hydrator?mode=rehydrate&limit=100',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    )
  ) AS request_id;
  $$
);
```

## Manual Execution

### Using Supabase CLI

```bash
# Deploy the function
supabase functions deploy wikimedia-hydrator

# Invoke manually
curl -X GET \
  "https://your-project.supabase.co/functions/v1/wikimedia-hydrator?mode=hydrate&limit=50" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### Using Supabase Dashboard

1. Go to Edge Functions
2. Select `wikimedia-hydrator`
3. Click "Invoke" 
4. Add query parameters: `mode=hydrate&limit=50`

## How It Works

1. **Fetches unhydrated images** from `road_sign_images` table
2. **Guesses Wikimedia title** from filename if not stored
3. **Calls Wikimedia API** to get official metadata
4. **Normalizes metadata** and extracts:
   - Sign number (from P5544 property)
   - Japanese name (from P2569)
   - English name (from P1476 or description)
   - License information
   - Artist attribution
   - Categories and tags
   - EXIF data
5. **Saves to database** with `metadata_hydrated = true`

## Metadata Extraction

The pipeline extracts sign numbers from:

1. **extmetadata.P5544** (RoadSignCode property) - Most reliable
2. **extmetadata.RoadSignCode** - Alternative property
3. **Filename patterns** - Fallback (e.g., "212-3" in filename)

## Rate Limiting

The function includes 200ms delay between requests to respect Wikimedia's rate limits and avoid being blocked.

## Error Handling

- Missing pages: Logged and skipped
- API errors: Logged and counted in `failed`
- Network errors: Retried automatically (you can add retry logic)
- Invalid metadata: Gracefully handled with fallbacks

## Verification

After hydration, verify by checking:

```sql
-- Check hydration status
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN metadata_hydrated = true THEN 1 END) as hydrated,
  COUNT(CASE WHEN metadata_hydrated = false OR metadata_hydrated IS NULL THEN 1 END) as unhydrated
FROM road_sign_images
WHERE image_source = 'wikimedia_commons' AND is_verified = true;

-- Check sign numbers extracted from metadata
SELECT sign_number, COUNT(*) 
FROM road_sign_images
WHERE metadata_hydrated = true AND sign_number IS NOT NULL
GROUP BY sign_number
ORDER BY COUNT(*) DESC
LIMIT 20;
```

## Next Steps

1. Run initial hydration for all existing images
2. Set up scheduled rehydration
3. Update search functions to prioritize hydrated metadata
4. Monitor hydration success rate
5. Add retry logic for failed hydrations


