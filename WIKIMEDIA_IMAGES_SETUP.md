# Wikimedia Commons Image Integration Setup Guide

This guide explains how to set up and use the Wikimedia Commons image integration for Japanese road signs in the Kotsu Sensei app.

## Overview

The app now uses high-quality, reliable images from Wikimedia Commons as the primary source for road sign images in:
- **Flashcards**: Practice sessions with road sign flashcards
- **AI Tutor**: Visual explanations when users ask about road signs
- **General Questions**: Questions that require visual aids

The system automatically falls back to Serper API (for flashcards/AI Tutor) or AI-generated images (for questions) if a Wikimedia Commons image is not found.

## Architecture

### Image Sources (Priority Order)

1. **Wikimedia Commons** (Primary)
   - Downloaded once and stored in Supabase
   - Categorized and tagged for easy lookup
   - High quality and reliable

2. **Serper API** (Fallback for flashcards/AI Tutor)
   - Used when Wikimedia image not found
   - Searches Google Images

3. **AI-Generated Images** (Fallback for questions)
   - Generated on-demand using Gemini
   - Used when Wikimedia image not found

### Database Schema

The `road_sign_images` table has been extended with:
- `image_source`: 'wikimedia_commons', 'serper', or 'user_upload'
- `wikimedia_file_name`: Original Wikimedia filename
- `wikimedia_page_url`: Link to original Wikimedia page

### Image Matching Logic

When a feature needs an image, the system tries:

1. **Category Match**: Exact match by `sign_category`
2. **Name Match**: Search by `sign_name_en` or `sign_name_jp` (ILIKE)
3. **Tags Match**: Search in `tags` array
4. **Fallback**: Use Serper API or AI generation

## Setup Instructions

### 1. Run Database Migration

The migration adds the necessary columns to `road_sign_images`:

```bash
# Migration file: supabase/migrations/20251125171211_wikimedia_images.sql
# This should run automatically when deploying, or run manually in Supabase SQL Editor
```

### 2. Download Wikimedia Commons Images

Run the download script to fetch and store all images:

```bash
# Install dependencies if needed
npm install

# Set environment variables in .env.local
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the download script
npx tsx scripts/download-wikimedia-images.ts
```

**What the script does:**
- Fetches all images from "Category:Road_signs_in_Japan" on Wikimedia Commons
- Downloads each image
- Uploads to Supabase storage bucket `road-sign-images`
- Extracts metadata (sign names, categories, tags)
- Stores in `road_sign_images` table with `image_source='wikimedia_commons'`

**Expected output:**
```
Starting Wikimedia Commons image download...
Fetching images from category: Road_signs_in_Japan
  Fetched 50 images so far...
  Fetched 100 images so far...
Total images found: 185

Processing 185 images...
  ✓ Stored: File:Stop_sign_Japan.svg (regulatory)
  ✓ Stored: File:Speed_limit_50_Japan.png (regulatory)
  ...

=== Download Complete ===
Total images: 185
Successfully stored: 180
Errors: 5
```

### 3. Verify Images Were Downloaded

Check the database:

```sql
-- Count Wikimedia Commons images
SELECT COUNT(*) 
FROM road_sign_images 
WHERE image_source = 'wikimedia_commons';

-- View by category
SELECT sign_category, COUNT(*) 
FROM road_sign_images 
WHERE image_source = 'wikimedia_commons'
GROUP BY sign_category;

-- Check a few examples
SELECT sign_name_en, sign_name_jp, sign_category, storage_url
FROM road_sign_images 
WHERE image_source = 'wikimedia_commons'
LIMIT 10;
```

### 4. Test the Integration

#### Test Flashcards

1. Go to the Flashcards page
2. Select a category (e.g., "Regulatory Signs")
3. Start a session
4. Check browser console/logs - you should see:
   ```
   Found 15 images for category regulatory-signs (15 from Wikimedia Commons)
   Using Wikimedia Commons image for: stop sign japan
   ```

#### Test AI Tutor

1. Ask a question like "What does a stop sign look like in Japan?"
2. The response should include a Wikimedia Commons image
3. Check logs for: `Using Wikimedia Commons image for: stop sign japan road`

#### Test General Questions

1. Generate questions with image requirements
2. Check that Wikimedia images are used when available
3. Fallback to AI generation if not found

## How It Works

### Flashcard Generation

1. User selects category and count
2. System queries `road_sign_images` by category (prioritizing Wikimedia Commons)
3. If found, uses those images
4. If not enough, generates flashcards with queries
5. For each query, tries Wikimedia Commons lookup first
6. Falls back to Serper API if not found

### AI Tutor

1. User asks about a road sign
2. AI generates response with `imageQuery` fields
3. For each `imageQuery`, system:
   - Extracts category from query
   - Searches Wikimedia Commons database
   - Falls back to Serper API if not found

### Question Generation

1. AI generates questions with `needs_image: true`
2. For each question with `image_description`:
   - Extracts category from description
   - Searches Wikimedia Commons database
   - Falls back to AI image generation if not found

## Troubleshooting

### No Images Found

**Problem**: Script downloads 0 images

**Solutions**:
- Check internet connection
- Verify Wikimedia Commons API is accessible
- Check Supabase credentials
- Review error logs in console

### Images Not Matching

**Problem**: Wrong images shown for queries

**Solutions**:
- Check if images are properly categorized in database
- Verify sign names are extracted correctly
- Review tags array for searchable terms
- Manually update categories if needed:

```sql
UPDATE road_sign_images 
SET sign_category = 'regulatory'
WHERE sign_name_en ILIKE '%stop%'
AND image_source = 'wikimedia_commons';
```

### Storage Issues

**Problem**: Images not uploading to Supabase storage

**Solutions**:
- Verify storage bucket `road-sign-images` exists
- Check RLS policies allow service role access
- Verify file size limits
- Check storage quota

### Performance Issues

**Problem**: Slow image lookup

**Solutions**:
- Verify indexes are created (migration should handle this)
- Check query performance:

```sql
EXPLAIN ANALYZE
SELECT storage_url, id
FROM road_sign_images
WHERE image_source = 'wikimedia_commons'
AND sign_category = 'regulatory'
AND is_verified = true
ORDER BY usage_count DESC
LIMIT 1;
```

## Maintenance

### Updating Images

To re-download or update images:

1. Delete existing Wikimedia images (optional):
```sql
DELETE FROM road_sign_images 
WHERE image_source = 'wikimedia_commons';
```

2. Re-run download script

### Adding New Categories

If new sign categories are added to Wikimedia Commons:

1. Update category mapping in `scripts/download-wikimedia-images.ts`
2. Re-run download script
3. Update `mapFlashcardCategoryToDbCategory()` in `wikimedia-image-lookup.ts` if needed

### Monitoring Usage

Track which images are most used:

```sql
SELECT 
  sign_name_en,
  sign_category,
  usage_count,
  storage_url
FROM road_sign_images
WHERE image_source = 'wikimedia_commons'
ORDER BY usage_count DESC
LIMIT 20;
```

## Files Modified

- `supabase/migrations/20251125171211_wikimedia_images.sql` - Database schema
- `supabase/functions/_shared/wikimedia-image-lookup.ts` - Helper functions
- `scripts/download-wikimedia-images.ts` - Download script
- `supabase/functions/generate-flashcards/index.ts` - Flashcard image lookup
- `supabase/functions/ai-chat/index.ts` - AI Tutor image lookup
- `supabase/functions/generate-questions/index.ts` - Question image lookup

## License Compliance

All images from Wikimedia Commons are properly licensed (typically Creative Commons). The system stores:
- Original Wikimedia filename
- Link to original Wikimedia page
- Proper attribution metadata

Users can access original pages via `wikimedia_page_url` for full license information.

## Support

For issues or questions:
1. Check logs in Supabase Edge Functions
2. Review database queries for errors
3. Verify environment variables are set correctly
4. Check Wikimedia Commons API status



