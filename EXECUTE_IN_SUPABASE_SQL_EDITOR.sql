-- ============================================
-- FIX SUBSCRIPTION UNIQUE CONSTRAINT
-- Execute this in Supabase SQL Editor
-- ============================================

-- Drop the existing unique constraint that allows multiple subscriptions with same status
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_status_key;

-- Create a partial unique index to ensure only one active/trialing subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_user 
ON public.subscriptions(user_id) 
WHERE status IN ('active', 'trialing');

-- This ensures:
-- ✅ Users can only have ONE active or trialing subscription at a time
-- ✅ Users can still have multiple subscriptions with different statuses (e.g., one canceled, one active)
-- ✅ Prevents duplicate active subscriptions

