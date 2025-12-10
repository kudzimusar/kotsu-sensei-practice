-- Fix subscription unique constraint
-- The current UNIQUE(user_id, status) allows multiple subscriptions with same status
-- We want to ensure only one active/trialing subscription per user

-- Drop the existing unique constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_status_key;

-- Create a partial unique index to ensure only one active/trialing subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_user 
ON public.subscriptions(user_id) 
WHERE status IN ('active', 'trialing');

-- Note: Users can still have multiple subscriptions with different statuses
-- (e.g., one canceled and one active), but only one active/trialing at a time

