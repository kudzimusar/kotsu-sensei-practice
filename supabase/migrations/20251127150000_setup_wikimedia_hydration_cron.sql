-- ============================================
-- SETUP WIKIMEDIA METADATA HYDRATION CRON JOBS
-- Sets up scheduled jobs to hydrate and rehydrate metadata
-- ============================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Note: To call the Edge Function from pg_cron, we need to use pg_net with authentication.
-- The Edge Function uses SUPABASE_SERVICE_ROLE_KEY internally, but external calls
-- need to authenticate. For now, we'll document the manual invocation method.

-- Manual invocation instructions:
-- Use curl or similar tool to call:
-- curl -X GET "https://YOUR_PROJECT.supabase.co/functions/v1/wikimedia-hydrator?mode=hydrate&limit=50" \
--   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

-- For automated scheduling via Supabase Dashboard:
-- 1. Go to Database > Cron Jobs
-- 2. Create a new cron job
-- 3. Use pg_net.http_post() or similar to call the function
-- 4. Store service role key securely (use Supabase Vault)

-- Helper function to check hydration status (useful for monitoring)
CREATE OR REPLACE FUNCTION public.get_hydration_status()
RETURNS TABLE(
  total_images BIGINT,
  hydrated_count BIGINT,
  unhydrated_count BIGINT,
  hydration_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*)::BIGINT AS total,
      COUNT(*) FILTER (WHERE metadata_hydrated = true)::BIGINT AS hydrated,
      COUNT(*) FILTER (WHERE metadata_hydrated = false OR metadata_hydrated IS NULL)::BIGINT AS unhydrated
    FROM road_sign_images
    WHERE image_source = 'wikimedia_commons' AND is_verified = true
  )
  SELECT 
    stats.total,
    stats.hydrated,
    stats.unhydrated,
    CASE 
      WHEN stats.total > 0 THEN ROUND((stats.hydrated::NUMERIC / stats.total::NUMERIC * 100)::NUMERIC, 2)
      ELSE 0::NUMERIC
    END AS hydration_percentage
  FROM stats;
END;
$$;

COMMENT ON FUNCTION public.get_hydration_status IS 'Returns hydration status statistics for monitoring purposes';

-- Example: Query hydration status
-- SELECT * FROM public.get_hydration_status();

