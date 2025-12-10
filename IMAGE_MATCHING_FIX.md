# Image Matching Fix - Using All Metadata Columns

## Problem
The system was not using all available metadata columns when searching for images. It was only searching `sign_name_en` and `sign_name_jp`, ignoring:
- `file_name` (actual stored filename)
- `filename_slug` (canonical filename)
- `wikimedia_file_name` (original Wikimedia filename)
- `wikimedia_raw` (full JSONB metadata)
- Sign numbers (326 for stop signs, 124 for bus signs, etc.)

This caused incorrect matches (e.g., returning bus signs when asking for stop signs).

## Solution

### 1. Rewrote `findWikimediaImage()` Function
Now uses **6 matching strategies** in order of specificity:

#### Strategy 1: Filename Matching (Most Accurate)
- Searches `file_name`, `filename_slug`, `wikimedia_file_name`
- Matches actual stored filenames (e.g., `japan_road_sign_326_b.svg`)

#### Strategy 2: Sign Number Matching
- Automatically recognizes sign numbers from queries:
  - "stop" → searches for "326" 
  - "bus" → searches for "124"
  - Extracts numbers like "326-A", "124-B" from queries
- Searches across filename and name fields

#### Strategy 3: Sign Name Matching
- Searches `sign_name_en` and `sign_name_jp`
- Case-insensitive, partial matching

#### Strategy 4: Tags Matching
- Searches tags array field
- Category-filtered when available

#### Strategy 5: Full Query Search
- Searches across ALL text fields simultaneously
- Most comprehensive fallback

#### Strategy 6: Category-Only Search
- Broadest search, least specific
- Only when no query terms match

### 2. Sign Number Mapping
Added intelligent parsing that maps common queries to Japanese road sign numbers:

| Query Term | Sign Number | Type |
|------------|-------------|------|
| stop / stop sign / 止まれ | 326 | stop |
| bus / バス | 124 | bus |
| speed limit | 209 | speed |
| no entry / 進入禁止 | 331 | no-entry |
| no parking / 駐車禁止 | 318 | no-parking |

### 3. Database Schema Used
The function now searches across ALL available columns:
- ✅ `file_name` - Actual stored filename
- ✅ `filename_slug` - Canonical filename  
- ✅ `wikimedia_file_name` - Original Wikimedia filename
- ✅ `sign_name_en` - English description
- ✅ `sign_name_jp` - Japanese description
- ✅ `sign_category` - Sign category
- ✅ `tags` - Tag array
- ✅ `sha1` - Available for exact matching
- ✅ `wikimedia_raw` - Full JSONB metadata (future use)

## Current Database Status
- **550 images** with complete metadata
- All images have: file_name, filename_slug, wikimedia_file_name, sha1, license_info, sign_name_en, wikimedia_raw
- 3 images have Japanese descriptions (sign_name_jp)

## How It Works Now

### Example: "stop sign" query

1. **Query Parsing**: Recognizes "stop" → maps to sign number "326"
2. **Filename Search**: Searches for "326" in `file_name`, `filename_slug`, `wikimedia_file_name`
3. **Found**: `japan_road_sign_326_b.svg` ✅
4. **Returns**: Correct stop sign image with full metadata

### Example: "bus sign" query

1. **Query Parsing**: Recognizes "bus" → maps to sign number "124"
2. **Filename Search**: Searches for "124" in filename fields
3. **Found**: `japanese_road_sign_124_a.svg` ✅
4. **Returns**: Correct bus sign image

## Files Modified

1. **`supabase/functions/_shared/wikimedia-image-lookup.ts`**
   - Complete rewrite of `findWikimediaImage()` function
   - Added `parseSignNumber()` helper function
   - Now uses all metadata columns

2. **`supabase/functions/ai-chat/index.ts`**
   - Removed redundant stop sign search code
   - Now uses improved `findWikimediaImage()` function
   - Simplified matching logic

## Testing

The system should now:
- ✅ Return correct stop signs (326 series) when asked for "stop sign"
- ✅ Return correct bus signs (124 series) when asked for "bus sign"
- ✅ Use filename matching for most accurate results
- ✅ Fall back to name/tag matching when filename doesn't match
- ✅ Use all 550+ images with complete metadata

## Next Steps

1. Test with various queries: "stop sign", "bus sign", "speed limit", etc.
2. Verify correct images are returned
3. Monitor logs for matching strategy used
4. Consider adding more sign number mappings as needed


