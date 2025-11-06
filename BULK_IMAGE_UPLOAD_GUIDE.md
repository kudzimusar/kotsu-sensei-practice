# Bulk Image Upload & Management Guide

## Overview
This guide explains how to bulk upload images and link them to questions in the database.

## Two Approaches for Images

### 1. **Static Assets (Public Folder)** - For signs and small assets
- Place images in `public/assets/` folder
- Reference in database: `/assets/image-name.png`
- ✅ Pros: Simple, no external dependencies
- ❌ Cons: Increases bundle size, limited to build-time assets

### 2. **Supabase Storage** - For scenario images and bulk uploads
- Upload to `driving-scenarios` bucket
- Reference in database: Stored as `image_storage_path`, auto-generates `image_url`
- ✅ Pros: Scalable, CDN delivery, dynamic uploads
- ❌ Cons: Requires Supabase setup

---

## Bulk Upload Process for Supabase Storage

### Step 1: Prepare Your Images

Create folder structure:
```
scenarios/
├── test1/
│   ├── scenario-001.jpg
│   ├── scenario-002.jpg
│   └── ...
├── test2/
│   ├── scenario-001.jpg
│   └── ...
└── test3/
    ├── scenario-001.jpg
    └── ...
```

**Image Requirements:**
- Formats: PNG, JPG, JPEG, WEBP
- Recommended size: 800-1200px width
- Max file size: 5MB per image

### Step 2: Run Upload Script

```bash
# Get your Supabase Service Role Key from:
# https://supabase.com/dashboard/project/ndulrvfwcqyvutcviebk/settings/api

SUPABASE_SERVICE_ROLE_KEY=your_key npm run upload-scenarios
```

The script will:
- Upload all images to the `driving-scenarios` bucket
- Organize by test category (test1/, test2/, test3/)
- Generate public URLs for each image

### Step 3: Link Images to Questions

There are **3 ways** to link images to questions:

#### Option A: Manual Database Update
```sql
UPDATE questions 
SET 
  image_type = 'scenario',
  image_storage_path = 'test1/scenario-001.jpg'
WHERE id = 123;
```
The `image_url` will be auto-generated from `image_storage_path`.

#### Option B: Bulk Insert with CSV/JSON
```javascript
// Create a mapping file: question-image-mapping.json
[
  { "question_id": 1, "image_path": "test1/scenario-001.jpg" },
  { "question_id": 2, "image_path": "test1/scenario-002.jpg" }
]

// Then run bulk update script
```

#### Option C: AI-Assisted Matching (Future Enhancement)
Use AI to:
1. Analyze image content
2. Match to question text
3. Auto-assign `image_storage_path`

---

## Current Workflow (Recommended)

### For Traffic Signs (Static Assets)
1. Images already exist in `src/assets/`
2. Copy to `public/assets/` for database questions:
```bash
cp src/assets/sign-*.png public/assets/
```
3. Update questions with path `/assets/sign-name.png`

### For Scenario Images (Supabase Storage)
1. Prepare images in `scenarios/` folder structure
2. Upload using the script
3. Create a spreadsheet mapping:
   - Column A: Question ID or question text
   - Column B: Image filename (e.g., `test1/scenario-001.jpg`)
4. Import the mapping to update questions

---

## Database Schema Reference

```sql
-- Questions table structure
id                  bigint (PK)
test_category       text
question_text       text
answer             boolean
explanation        text
image_type         text ('sign' | 'scenario' | 'none')
image_path         text (for static: '/assets/sign.png')
image_storage_path text (for Supabase: 'test1/scenario.jpg')
image_url          text (auto-generated from storage_path or path)
tags               text[]
difficulty         text
```

### Image Priority Logic
1. If `image_storage_path` exists → Generate Supabase Storage URL
2. Else if `image_path` exists → Use static path
3. Else → No image

---

## Next Steps

1. **Move static sign images to public folder**
2. **Prepare scenario images** in folder structure
3. **Run upload script** with service role key
4. **Create question-image mapping** spreadsheet
5. **Bulk update questions** with image paths

---

## Troubleshooting

### Images showing "Failed to load"
- Check image path is correct
- Verify bucket is public (it is by default)
- Check browser console for 404 errors

### Upload script fails
- Verify service role key is correct
- Check image file sizes < 5MB
- Ensure bucket exists and has correct permissions

### Images not appearing in app
- Clear browser cache
- Check question has `image_type` set
- Verify `image_url` is populated correctly
