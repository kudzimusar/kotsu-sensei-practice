# PWA Database Requirements Analysis

## Summary

**Answer: No new database tables or migrations are needed.** The existing Supabase tables (`quiz_progress`, `user_lecture_schedule`) already support what we need. However, **API endpoints need to be created** as Supabase Edge Functions to handle offline sync.

---

## What Changed in the Service Worker

The service worker now includes:
1. **Background Sync**: Syncs quiz results and schedule data when device comes back online
2. **Periodic Sync**: Checks for content updates and syncs progress data periodically
3. **Offline Support**: Uses IndexedDB (client-side) to store data offline, then syncs to Supabase when online

---

## Service Worker API Endpoints (Currently Missing)

The service worker calls these API endpoints that **don't exist yet**:

1. **`/kotsu-sensei-practice/api/sync-results`** (POST)
   - Purpose: Sync quiz results from IndexedDB to Supabase
   - Data: Quiz progress data
   - Table: `quiz_progress`

2. **`/kotsu-sensei-practice/api/sync-schedule`** (POST)
   - Purpose: Sync schedule data from IndexedDB to Supabase
   - Data: Lecture schedule data
   - Table: `user_lecture_schedule`

3. **`/kotsu-sensei-practice/api/check-updates`** (GET)
   - Purpose: Check if app content has been updated
   - Returns: `{ hasUpdates: boolean, updatedUrls: string[] }`
   - Optional: Can return static response for now

4. **`/kotsu-sensei-practice/api/sync-progress`** (POST)
   - Purpose: Sync overall progress data
   - Data: Progress summary
   - Optional: Can be a no-op for now

---

## Existing Database Tables (Already Sufficient)

### ✅ `quiz_progress` Table
- **Columns**: `id`, `user_id`, `guest_session_id`, `quiz_mode`, `current_question_index`, `score`, `time_limit`, `selected_questions` (jsonb), `created_at`, `updated_at`
- **RLS Policies**: ✅ Already configured
- **Supports**: Both authenticated users and guest sessions
- **Status**: ✅ Ready to use

### ✅ `user_lecture_schedule` Table
- **Columns**: `id`, `user_id`, `lecture_number`, `stage`, `scheduled_date`, `status`, `completed_at`, `created_at`, `updated_at`
- **RLS Policies**: ✅ Already configured
- **Supports**: Authenticated users only
- **Status**: ✅ Ready to use

---

## What Needs to Be Created

### 1. Supabase Edge Functions (Recommended)

Create these Edge Functions in `supabase/functions/`:

#### a. `sync-results/index.ts`
- Handles POST requests to sync quiz results
- Validates user authentication
- Inserts/updates `quiz_progress` table
- Returns success/error response

#### b. `sync-schedule/index.ts`
- Handles POST requests to sync schedule data
- Validates user authentication
- Inserts/updates `user_lecture_schedule` table
- Returns success/error response

#### c. `check-updates/index.ts` (Optional)
- Handles GET requests to check for content updates
- Can return static response: `{ hasUpdates: false, updatedUrls: [] }`
- Future: Check version numbers or timestamps

#### d. `sync-progress/index.ts` (Optional)
- Handles POST requests to sync progress data
- Can be a no-op for now (just return success)
- Future: Sync aggregated progress data

### 2. Update Service Worker Paths (If Using Edge Functions)

If using Supabase Edge Functions, update service worker to call:
- `https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/sync-results`
- `https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/sync-schedule`
- `https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/check-updates`
- `https://ndulrvfwcqyvutcviebk.supabase.co/functions/v1/sync-progress`

---

## Alternative: Update Service Worker to Use Supabase Directly

Instead of creating API endpoints, we could update the service worker to:
1. Import Supabase client (if possible in service worker)
2. Call Supabase directly from service worker
3. Skip the API endpoints entirely

**Limitations:**
- Service workers have limited access to browser APIs
- Supabase client might not work in service worker context
- Less secure (API key exposed in service worker)

**Recommendation:** Use Supabase Edge Functions for better security and separation of concerns.

---

## Implementation Priority

### High Priority (Required for Background Sync)
1. ✅ Create `sync-results` Edge Function
2. ✅ Create `sync-schedule` Edge Function

### Medium Priority (Required for Periodic Sync)
3. ✅ Create `check-updates` Edge Function (can return static response)
4. ✅ Create `sync-progress` Edge Function (can be no-op)

### Low Priority (Future Enhancements)
5. Implement version checking in `check-updates`
6. Implement progress aggregation in `sync-progress`

---

## Database Changes Required

### ✅ None

All required tables already exist:
- `quiz_progress` ✅
- `user_lecture_schedule` ✅
- `guest_sessions` ✅ (for guest users)
- `category_performance` ✅ (for progress tracking)

All required RLS policies are already configured:
- Users can only access their own data ✅
- Guest sessions are supported ✅
- Insert/update/delete policies are in place ✅

---

## Next Steps

1. **Create Supabase Edge Functions** (see implementation guide)
2. **Update Service Worker** to call Edge Functions instead of `/api/*` endpoints
3. **Test Background Sync** by going offline, making changes, then coming back online
4. **Test Periodic Sync** (requires user permission and may not work in all browsers)

---

## Notes

- **IndexedDB**: The service worker uses IndexedDB (client-side) to store pending data offline. This doesn't require any database changes.
- **Offline Support**: The offline capability fix doesn't require database changes - it only affects how the service worker serves cached content.
- **Push Notifications**: Push notifications don't require database changes, but may require VAPID keys (optional).

---

## Conclusion

**No database changes are needed.** The existing Supabase tables and RLS policies are sufficient. We just need to create the API endpoints (Supabase Edge Functions) to handle the sync operations.



