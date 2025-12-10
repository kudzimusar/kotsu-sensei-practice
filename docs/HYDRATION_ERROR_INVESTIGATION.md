# Hydration Error Investigation

## Summary

After running multiple hydration batches, we've identified that some signs consistently fail to hydrate. This document explains the likely causes and potential solutions.

## Current Status

**Latest Batch Results:**
- **Processed:** 73 signs
- **Successful:** 13 signs hydrated
- **Errors:** 60 signs
- **Remaining:** 60 signs still need hydration

**Overall Progress:**
- Total hydrated across all batches: **64 signs**
- Remaining unhydrated: **60 signs**

## Error Analysis

Based on the `cleanup-and-hydrate` function code, errors can occur at three points:

### 1. Gemini API Failures

**Location:** `hydrateSignWithGemini()` function (lines 138-172)

**Possible Causes:**
- **Rate Limiting:** Gemini API has rate limits that may be exceeded during batch processing
- **API Errors:** HTTP errors (4xx/5xx) from Gemini API
- **Invalid Responses:** Gemini returns non-JSON or malformed responses
- **Timeout:** API requests timing out

**Error Handling:**
```typescript
if (!response.ok) {
  throw new Error(`Gemini API error: ${response.status}`);
}
```

**Signs Affected:**
- Signs not in the knowledge base (SIGN_DATABASE)
- Signs with unclear or ambiguous filenames
- Signs that Gemini cannot properly analyze

### 2. Database Update Failures

**Location:** Database update operation (lines 287-301)

**Possible Causes:**
- **Constraint Violations:** Data doesn't meet database constraints
- **RLS Policy Issues:** Row-level security policies blocking updates
- **Connection Issues:** Database connection problems
- **Invalid Data Types:** Type mismatches in update data

**Error Handling:**
```typescript
if (updateError) {
  console.error(`Update failed for ${sign.file_name}:`, updateError);
  errors++;
}
```

### 3. General Processing Errors

**Location:** Try-catch block (lines 283-315)

**Possible Causes:**
- **JSON Parsing Errors:** Gemini returns invalid JSON
- **Missing Required Fields:** Required metadata fields are null/undefined
- **Network Issues:** Intermittent network failures
- **Timeout Issues:** Operations taking too long

**Error Handling:**
```typescript
catch (err) {
  console.error(`Failed: ${sign.file_name}`, err);
  errors++;
}
```

## Likely Root Causes

### 1. Signs Not in Knowledge Base

The function first checks a hardcoded `SIGN_DATABASE` (lines 13-58). Signs not in this database must be processed by Gemini AI, which can fail if:
- The filename doesn't contain recognizable sign numbers
- Gemini cannot identify the sign type
- The sign is too ambiguous or unclear

### 2. Gemini API Rate Limits

The function includes a 200ms delay between requests (line 311), but:
- Batch processing of 60+ signs may still hit rate limits
- Gemini API may have daily/hourly quotas
- Concurrent requests from other sources may contribute

### 3. Ambiguous or Invalid Filenames

Signs with unclear filenames may cause:
- Failed sign number extraction (line 90)
- Gemini to return generic or incorrect information
- Processing to fail entirely

### 4. Database Constraints

Some signs may fail due to:
- Required fields being null
- Data type mismatches
- Foreign key constraints
- Unique constraint violations

## Investigation Steps

### Step 1: Check Supabase Logs

View the Edge Function logs in Supabase Dashboard:
1. Go to Edge Functions > cleanup-and-hydrate
2. Check the "Logs" tab
3. Look for specific error messages for failed signs

### Step 2: Query Failed Signs

Run this SQL query in Supabase SQL Editor:

```sql
-- Get unhydrated signs with details
SELECT 
  id,
  file_name,
  sign_number,
  sign_name_en,
  sign_category,
  ai_enhanced,
  metadata_hydrated,
  is_verified,
  image_source,
  created_at
FROM road_sign_images
WHERE is_verified = true 
  AND ai_enhanced = false
ORDER BY file_name
LIMIT 60;
```

### Step 3: Analyze Filename Patterns

Check if failed signs have common filename patterns:

```sql
-- Group by filename patterns
SELECT 
  CASE 
    WHEN file_name ILIKE '%exit%' THEN 'exit'
    WHEN file_name ILIKE '%route%' THEN 'route'
    WHEN file_name ILIKE '%exp%' THEN 'expressway'
    WHEN file_name ~ '[0-9]{3}' THEN 'has_number'
    ELSE 'other'
  END as pattern,
  COUNT(*) as count
FROM road_sign_images
WHERE is_verified = true AND ai_enhanced = false
GROUP BY pattern
ORDER BY count DESC;
```

### Step 4: Check for Missing Metadata

```sql
-- Signs with missing critical fields
SELECT 
  id,
  file_name,
  sign_number,
  sign_name_en,
  sign_category
FROM road_sign_images
WHERE is_verified = true 
  AND ai_enhanced = false
  AND (sign_number IS NULL OR sign_name_en IS NULL)
LIMIT 20;
```

## Recommended Solutions

### Solution 1: Increase Rate Limiting Delay

Modify the delay between requests in `cleanup-and-hydrate/index.ts`:

```typescript
// Current: 200ms
await new Promise(r => setTimeout(r, 200));

// Recommended: 500-1000ms for better rate limit handling
await new Promise(r => setTimeout(r, 500));
```

### Solution 2: Add Retry Logic

Implement exponential backoff for failed requests:

```typescript
async function hydrateWithRetry(sign, apiKey, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await hydrateSignWithGemini(sign, apiKey);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### Solution 3: Expand Knowledge Base

Add more signs to the `SIGN_DATABASE` to reduce reliance on Gemini API:

1. Identify common failed signs
2. Research their official sign numbers and names
3. Add them to the knowledge base

### Solution 4: Manual Review Queue

Create a system to flag signs for manual review:

```sql
-- Add a column for manual review
ALTER TABLE road_sign_images 
ADD COLUMN needs_manual_review BOOLEAN DEFAULT false;

-- Flag signs that failed multiple times
UPDATE road_sign_images
SET needs_manual_review = true
WHERE ai_enhanced = false 
  AND is_verified = true
  AND created_at < NOW() - INTERVAL '7 days';
```

### Solution 5: Batch Size Reduction

Process smaller batches to avoid rate limits:

```bash
# Instead of 60, process 10-15 at a time
./scripts/hydrate-signs.sh 10
```

### Solution 6: Enhanced Error Logging

Add detailed error logging to identify specific failure points:

```typescript
catch (err) {
  const errorDetails = {
    sign_id: sign.id,
    file_name: sign.file_name,
    sign_number: sign.sign_number,
    error_type: err.constructor.name,
    error_message: err.message,
    error_stack: err.stack,
    timestamp: new Date().toISOString()
  };
  
  // Log to database or external service
  console.error('Hydration error:', JSON.stringify(errorDetails));
  errors++;
}
```

## Next Steps

1. **Immediate:** Check Supabase Edge Function logs for specific error messages
2. **Short-term:** Reduce batch size to 10-15 and retry with longer delays
3. **Medium-term:** Implement retry logic and enhanced error logging
4. **Long-term:** Expand knowledge base and create manual review process

## Monitoring

Track hydration progress:

```sql
-- Daily hydration status
SELECT 
  DATE(ai_enhanced_at) as date,
  COUNT(*) as hydrated_count
FROM road_sign_images
WHERE ai_enhanced = true
  AND ai_enhanced_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(ai_enhanced_at)
ORDER BY date DESC;
```

## Related Documentation

- [Periodic Hydration Setup](./PERIODIC_HYDRATION_SETUP.md)
- [Hydration Testing Guide](./HYDRATION_TESTING.md)
- [Wikimedia Metadata Hydration](./WIKIMEDIA_METADATA_HYDRATION.md)

