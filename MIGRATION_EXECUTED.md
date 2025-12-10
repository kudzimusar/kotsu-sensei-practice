# ✅ SQL Migration - Execution Status

## Migration File Created

The migration has been created in the migrations directory:
- **File**: `supabase/migrations/20251210100301_fix_subscription_constraint.sql`

## SQL Content

```sql
-- Fix subscription unique constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_status_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_user 
ON public.subscriptions(user_id) 
WHERE status IN ('active', 'trialing');
```

## Execution Methods

### Option 1: Supabase Dashboard (Recommended - Immediate)
1. Go to: https://supabase.com/dashboard/project/ndulrvfwcqyvutcviebk/sql/new
2. Copy the SQL above
3. Paste and click **Run**
4. ✅ Done!

### Option 2: Supabase CLI (After fixing migration history)
```bash
# First, sync migration history
supabase db pull

# Then push the migration
supabase db push
```

## What This Migration Does

1. **Drops** the old constraint `subscriptions_user_id_status_key` that allowed multiple subscriptions with the same status
2. **Creates** a partial unique index that ensures only ONE active or trialing subscription per user
3. **Allows** users to have multiple subscriptions with different statuses (e.g., one canceled, one active)

## Verification

After execution, verify the constraint is in place:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'subscriptions' 
AND indexname = 'idx_subscriptions_one_active_per_user';
```

---

**Status**: Migration file ready - Execute via Supabase Dashboard for immediate effect

