import { ReactNode } from "react";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { Paywall } from "./Paywall";
import { Loader2 } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  feature: "ai_questions" | "export_pdf" | "instructor_sessions" | "advanced_analytics" | "personalized_plans";
  showPaywall?: boolean;
  fallback?: ReactNode;
}

export const PremiumGate = ({
  children,
  feature,
  showPaywall = true,
  fallback,
}: PremiumGateProps) => {
  const { user } = useAuth();
  const { isPremium, isLoading, usageLimits } = usePremium();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user is not logged in, show auth prompt
  if (!user) {
    return (
      <div className="space-y-4">
        {fallback || (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-sm text-muted-foreground">
              Please sign in to access this feature.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Check feature-specific access
  let hasAccess = false;
  let limitReached = false;

  switch (feature) {
    case "ai_questions":
      hasAccess = isPremium || usageLimits.ai_questions.remaining > 0;
      limitReached = !isPremium && usageLimits.ai_questions.remaining === 0;
      break;
    case "export_pdf":
      hasAccess = isPremium;
      limitReached = !isPremium;
      break;
    case "instructor_sessions":
      hasAccess = isPremium;
      limitReached = !isPremium;
      break;
    case "advanced_analytics":
      hasAccess = isPremium;
      limitReached = !isPremium;
      break;
    case "personalized_plans":
      hasAccess = isPremium;
      limitReached = !isPremium;
      break;
    default:
      hasAccess = isPremium;
      limitReached = !isPremium;
  }

  // If user has access, show children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If limit reached or not premium, show paywall or fallback
  if (limitReached && showPaywall) {
    return <Paywall feature={feature} usageLimits={usageLimits} />;
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: show upgrade prompt
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 text-center dark:border-purple-800 dark:bg-purple-900/20">
      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
        Premium Feature
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Upgrade to Premium to unlock this feature.
      </p>
    </div>
  );
};

