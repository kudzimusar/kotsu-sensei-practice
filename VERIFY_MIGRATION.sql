-- Verify the migration was successful
-- Run this in Supabase SQL Editor to confirm the index exists

SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'subscriptions' 
AND indexname = 'idx_subscriptions_one_active_per_user';

-- Expected result: Should show the index definition
-- If you see a row, the migration was successful! ✅

