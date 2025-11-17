import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: "monthly" | "quarterly" | "annual" | "lifetime";
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete" | "incomplete_expired" | "unpaid";
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLimits {
  ai_questions: {
    current: number;
    limit: number;
    remaining: number;
  };
  export_pdf: {
    current: number;
    limit: number;
    remaining: number;
  };
  instructor_sessions: {
    current: number;
    limit: number;
    remaining: number;
  };
}

export const usePremium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);

  // Fetch subscription status
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }

      return data as Subscription | null;
    },
    enabled: !!user,
    staleTime: 0, // Always refetch to get latest subscription status
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Fetch premium status from profile (denormalized for quick checks)
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 0, // Always refetch to get latest premium status
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Calculate premium status
  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setTrialDaysRemaining(null);
      return;
    }

    const hasActiveSubscription = subscription?.status === "active" || subscription?.status === "trialing";
    const profilePremium = profile?.is_premium || false;
    
    setIsPremium(hasActiveSubscription || profilePremium);

    // Calculate trial days remaining
    if (subscription?.status === "trialing" && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      const now = new Date();
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      setTrialDaysRemaining(daysRemaining > 0 ? daysRemaining : 0);
    } else {
      setTrialDaysRemaining(null);
    }
  }, [user, subscription, profile]);

  // Fetch usage limits
  const { data: usageLimits, isLoading: usageLoading } = useQuery({
    queryKey: ["usage-limits", user?.id],
    queryFn: async (): Promise<UsageLimits | null> => {
      if (!user) return null;

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("subscription_usage")
        .select("feature_type, count, limit_count")
        .eq("user_id", user.id)
        .eq("usage_date", today);

      if (error) {
        console.error("Error fetching usage limits:", error);
        return null;
      }

      // Get limits from database function or set defaults
      const getLimit = async (featureType: string): Promise<number> => {
        const { data: limitData, error: limitError } = await supabase.rpc(
          "get_user_feature_limit",
          { p_user_id: user.id, p_feature_type: featureType }
        );

        if (limitError || limitData === null) {
          // Default limits
          if (isPremium) return 999999;
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

        return limitData;
      };

      const aiQuestionsUsage = data?.find((u) => u.feature_type === "ai_questions") || {
        count: 0,
        limit_count: await getLimit("ai_questions"),
      };

      const exportPdfUsage = data?.find((u) => u.feature_type === "export_pdf") || {
        count: 0,
        limit_count: await getLimit("export_pdf"),
      };

      const instructorSessionsUsage = data?.find((u) => u.feature_type === "instructor_sessions") || {
        count: 0,
        limit_count: await getLimit("instructor_sessions"),
      };

      return {
        ai_questions: {
          current: aiQuestionsUsage.count,
          limit: aiQuestionsUsage.limit_count,
          remaining: Math.max(0, aiQuestionsUsage.limit_count - aiQuestionsUsage.count),
        },
        export_pdf: {
          current: exportPdfUsage.count,
          limit: exportPdfUsage.limit_count,
          remaining: Math.max(0, exportPdfUsage.limit_count - exportPdfUsage.count),
        },
        instructor_sessions: {
          current: instructorSessionsUsage.count,
          limit: instructorSessionsUsage.limit_count,
          remaining: Math.max(0, instructorSessionsUsage.limit_count - instructorSessionsUsage.count),
        },
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  const isLoading = subscriptionLoading || usageLoading;

  return {
    isPremium,
    subscription,
    trialDaysRemaining,
    usageLimits: usageLimits || {
      ai_questions: { current: 0, limit: user ? 10 : 0, remaining: user ? 10 : 0 },
      export_pdf: { current: 0, limit: 0, remaining: 0 },
      instructor_sessions: { current: 0, limit: 0, remaining: 0 },
    },
    isLoading,
  };
};

