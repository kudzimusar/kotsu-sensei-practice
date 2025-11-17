import { ReactNode } from "react";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { Paywall } from "./Paywall";
import { Loader2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const navigate = useNavigate();

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

  // Default: show upgrade prompt with lock icon
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 text-center dark:border-purple-800 dark:bg-purple-900/20">
      <Lock className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
        Premium Feature
      </p>
      <p className="mt-2 text-sm text-muted-foreground mb-4">
        Upgrade to Premium to unlock this feature.
      </p>
      <Button
        onClick={() => navigate("/payment")}
        className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
        size="sm"
      >
        Upgrade to Premium
      </Button>
    </div>
  );
};

// Lock icon component for inline use
export const PremiumLockIcon = ({ feature, className = "" }: { feature?: string; className?: string }) => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  if (isPremium) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => navigate("/payment")}
            className={`inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors ${className}`}
          >
            <Lock className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upgrade to unlock this feature</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

