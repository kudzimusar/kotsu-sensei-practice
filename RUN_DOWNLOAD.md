# Running the Wikimedia Commons Image Download

## ✅ Setup Complete

- Database migration applied ✓
- All code committed and pushed ✓
- Edge Function created ✓

## Current Status

- **Total images in database**: 5
- **Wikimedia Commons images**: 0 (need to download)

## How to Download Images

### Option 1: Use Edge Function (Recommended - No Service Role Key Needed)

The Edge Function has automatic access to the service role key.

1. **Deploy the Edge Function** (if not already deployed):
   ```bash
   supabase functions deploy download-wikimedia-images
   ```

2. **Call the function** to download images:
   ```bash
   curl -X POST "https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/download-wikimedia-images" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"limit": 50, "offset": 0}'
   ```

   Start with a small limit (50) to test, then increase.

3. **Download all images** (process in batches):
   ```bash
   # First batch
   curl -X POST "https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/download-wikimedia-images" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"limit": 50, "offset": 0}'
   
   # Second batch
   curl -X POST "https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/download-wikimedia-images" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"limit": 50, "offset": 50}'
   
   # Continue until all images are downloaded
   ```

### Option 2: Use Local Script (Requires Service Role Key)

1. **Get your service role key**:
   - Go to: https://supabase.com/dashboard/project/ndulrvfwcqyvutcviebk/settings/api
   - Copy the `service_role` key (secret)

2. **Add to .env.local**:
   ```bash
   echo 'SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here' >> .env.local
   ```

3. **Run the script**:
   ```bash
   npx tsx scripts/download-wikimedia-images.ts
   ```

## Verify Download

After downloading, verify images were stored:

```sql
-- Check count
SELECT COUNT(*) 
FROM road_sign_images 
WHERE image_source = 'wikimedia_commons';

-- View by category
SELECT sign_category, COUNT(*) 
FROM road_sign_images 
WHERE image_source = 'wikimedia_commons'
GROUP BY sign_category;

-- See some examples
SELECT sign_name_en, sign_name_jp, sign_category, storage_url
FROM road_sign_images 
WHERE image_source = 'wikimedia_commons'
LIMIT 10;
```

## Expected Results

- **Total images from Wikimedia**: ~180-200 road sign images
- **Categories**: regulatory, warning, indication, guidance, auxiliary, road-markings
- **Storage**: All images stored in `road-sign-images` bucket
- **Database**: All metadata stored in `road_sign_images` table

## Testing

Once images are downloaded, test the features:

1. **Flashcards**: Select a category and start a session - should use Wikimedia images
2. **AI Tutor**: Ask "What does a stop sign look like in Japan?" - should show Wikimedia image
3. **General Questions**: Generate questions with images - should prioritize Wikimedia images

## Troubleshooting

### Edge Function not found
- Deploy it: `supabase functions deploy download-wikimedia-images`

### Rate limiting
- Wikimedia Commons API has rate limits
- The script includes delays between requests
- If you hit limits, wait a few minutes and continue

### Storage errors
- Verify `road-sign-images` bucket exists
- Check RLS policies allow service role access
- Verify storage quota

### No images found
- Check Wikimedia Commons API is accessible
- Verify category name is correct: "Road_signs_in_Japan"
- Check network connectivity



