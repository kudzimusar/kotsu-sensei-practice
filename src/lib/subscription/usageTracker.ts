import { supabase } from "@/integrations/supabase/client";

export type FeatureType = "ai_questions" | "export_pdf" | "instructor_sessions";

export interface UsageCheckResult {
  allowed: boolean;
  current_count: number;
  limit: number;
  remaining: number;
}

/**
 * Check if user can use a feature and increment usage count atomically
 * Uses the database function to ensure thread-safe operations
 */
export async function checkAndIncrementUsage(
  userId: string,
  featureType: FeatureType,
  incrementBy: number = 1
): Promise<UsageCheckResult> {
  const { data, error } = await supabase.rpc("check_and_increment_usage", {
    p_user_id: userId,
    p_feature_type: featureType,
    p_increment_by: incrementBy,
  });

  if (error) {
    console.error("Error checking usage:", error);
    throw error;
  }

  return data as UsageCheckResult;
}

/**
 * Get current usage for a feature without incrementing
 */
export async function getCurrentUsage(
  userId: string,
  featureType: FeatureType
): Promise<{ current: number; limit: number; remaining: number }> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("subscription_usage")
    .select("count, limit_count")
    .eq("user_id", userId)
    .eq("feature_type", featureType)
    .eq("usage_date", today)
    .maybeSingle();

  if (error) {
    console.error("Error fetching usage:", error);
    throw error;
  }

  const current = data?.count || 0;
  const limit = data?.limit_count || 10; // Default free tier limit

  return {
    current,
    limit,
    remaining: Math.max(0, limit - current),
  };
}

/**
 * Get user's feature limit (checks premium status)
 */
export async function getUserFeatureLimit(
  userId: string,
  featureType: FeatureType
): Promise<number> {
  const { data, error } = await supabase.rpc("get_user_feature_limit", {
    p_user_id: userId,
    p_feature_type: featureType,
  });

  if (error) {
    console.error("Error getting feature limit:", error);
    // Return default limits
    switch (featureType) {
      case "ai_questions":
        return 10;
      case "export_pdf":
      case "instructor_sessions":
        return 0;
      default:
        return 0;
    }
  }

  return data || 0;
}

/**
 * Initialize usage tracking for a user (called when user signs up or becomes premium)
 */
export async function initializeUsageTracking(userId: string): Promise<void> {
  const features: FeatureType[] = ["ai_questions", "export_pdf", "instructor_sessions"];

  // Get limits for each feature
  const limits = await Promise.all(
    features.map(async (feature) => ({
      feature,
      limit: await getUserFeatureLimit(userId, feature),
    }))
  );

  const today = new Date().toISOString().split("T")[0];

  // Insert or update usage records
  for (const { feature, limit } of limits) {
    await supabase
      .from("subscription_usage")
      .upsert(
        {
          user_id: userId,
          feature_type: feature,
          usage_date: today,
          count: 0,
          limit_count: limit,
        },
        {
          onConflict: "user_id,feature_type,usage_date",
        }
      );
  }
}

/**
 * Reset daily usage (called by cron job or manually)
 * Note: This is typically handled by the database function, but can be called manually
 */
export async function resetDailyUsage(): Promise<void> {
  const { error } = await supabase.rpc("reset_daily_usage");

  if (error) {
    console.error("Error resetting daily usage:", error);
    throw error;
  }
}

