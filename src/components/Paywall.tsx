import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X, Sparkles } from "lucide-react";
import { usePremium, UsageLimits } from "@/hooks/usePremium";

interface PaywallProps {
  feature: "ai_questions" | "export_pdf" | "instructor_sessions" | "advanced_analytics" | "personalized_plans";
  usageLimits?: UsageLimits;
  title?: string;
  description?: string;
}

export const Paywall = ({ feature, usageLimits, title, description }: PaywallProps) => {
  const navigate = useNavigate();
  const { isPremium, trialDaysRemaining } = usePremium();

  const featureInfo = {
    ai_questions: {
      title: "Unlimited AI-Generated Questions",
      description: "You've used all 10 free AI questions today. Upgrade to Premium for unlimited practice questions!",
      freeLimit: "10 questions/day",
      premiumBenefit: "Unlimited questions",
    },
    export_pdf: {
      title: "Export & Print Study Guides",
      description: "Export your study materials as PDFs and print them for offline studying.",
      freeLimit: "Not available",
      premiumBenefit: "Unlimited PDF exports",
    },
    instructor_sessions: {
      title: "One-on-One Instructor Sessions",
      description: "Book personalized sessions with certified driving instructors to get expert guidance.",
      freeLimit: "Not available",
      premiumBenefit: "Book sessions anytime",
    },
    advanced_analytics: {
      title: "Advanced Progress Analytics",
      description: "Get detailed insights into your performance with advanced analytics and predictions.",
      freeLimit: "Basic stats only",
      premiumBenefit: "Advanced analytics & predictions",
    },
    personalized_plans: {
      title: "Personalized Study Plans",
      description: "Get AI-generated study plans tailored to your exam date and weak areas.",
      freeLimit: "Not available",
      premiumBenefit: "AI-powered study plans",
    },
  };

  const info = featureInfo[feature];
  const displayTitle = title || info.title;
  const displayDescription = description || info.description;

  const handleUpgrade = () => {
    navigate("/payment", { state: { feature } });
  };

  return (
    <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <div>
            <CardTitle className="text-2xl">{displayTitle}</CardTitle>
            <CardDescription>{displayDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Status */}
        {usageLimits && feature === "ai_questions" && (
          <div className="rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Daily Usage</span>
              <span className="text-sm text-muted-foreground">
                {usageLimits.ai_questions.current} / {usageLimits.ai_questions.limit} questions
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{
                  width: `${Math.min(100, (usageLimits.ai_questions.current / usageLimits.ai_questions.limit) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {usageLimits.ai_questions.remaining === 0
                ? "You've reached your daily limit"
                : `${usageLimits.ai_questions.remaining} questions remaining today`}
            </p>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Free vs Premium</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border bg-white p-3 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-500" />
                <span className="text-sm">Free Tier</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {info.freeLimit}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-purple-300 bg-purple-50 p-3 dark:border-purple-700 dark:bg-purple-900/20">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Premium</span>
              </div>
              <Badge className="bg-purple-600 text-xs">{info.premiumBenefit}</Badge>
            </div>
          </div>
        </div>

        {/* Premium Features List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">All Premium Features</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>Unlimited AI-generated questions</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>Personalized study plans</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>Advanced progress analytics</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>One-on-one instructor sessions</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>Export & print study guides</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>Ad-free experience</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>Priority support</span>
            </li>
          </ul>
        </div>

        {/* Pricing */}
        <div className="rounded-lg border-2 border-dashed border-purple-300 bg-white p-4 dark:border-purple-700 dark:bg-gray-800">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">¥980</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          {trialDaysRemaining !== null && trialDaysRemaining > 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {trialDaysRemaining} days left in your trial
            </p>
          )}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Or save 25% with annual plan
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
            onClick={handleUpgrade}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/premium")}
          >
            Learn More About Premium
          </Button>
        </div>

        {/* Social Proof */}
        <p className="text-center text-xs text-muted-foreground">
          Join 10,000+ premium learners preparing for their Japan driving test
        </p>
      </CardContent>
    </Card>
  );
};

