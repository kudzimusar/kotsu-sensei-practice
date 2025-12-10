-- Fix subscription unique constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_status_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_user 
ON public.subscriptions(user_id) 
WHERE status IN ('active', 'trialing');
