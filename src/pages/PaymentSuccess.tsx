import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Crown, Loader2, Calendar, CreditCard, ArrowRight, Download, Share2, Sparkles, Clock, Gift, TrendingUp, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { format, addDays, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

interface SessionDetails {
  session_id: string;
  plan_type: string;
  amount: number | null;
  currency: string;
  status: string;
  trial_start: string | null;
  trial_end: string | null;
  next_payment_date: string | null;
  subscription_id: string | null;
  customer_id: string | null;
  created: number;
  mode: string;
}

export default function PaymentSuccess() {
  const { user } = useAuth();
  const { isPremium, subscription, isLoading: premiumLoading } = usePremium();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Plan details mapping
  const planDetails: Record<string, { name: string; price: number; period: string; features: string[] }> = {
    monthly: {
      name: "Monthly",
      price: 980,
      period: "per month",
      features: [
        "Unlimited AI-generated questions",
        "Personalized study plans",
        "Advanced progress analytics",
        "Export & print study guides",
        "Ad-free experience",
        "Priority support",
      ],
    },
    quarterly: {
      name: "Quarterly",
      price: 1500,
      period: "per 3 months",
      features: [
        "Everything in Monthly",
        "23% savings",
        "Better value",
      ],
    },
    annual: {
      name: "Annual",
      price: 8800,
      period: "per year",
      features: [
        "Everything in Monthly",
        "25% savings",
        "Best value",
        "Free textbook included",
      ],
    },
    lifetime: {
      name: "9-Month Access",
      price: 2400,
      period: "one-time payment",
      features: [
        "Everything in Quarterly",
        "9 months access (standard license period)",
        "One-time payment",
        "No recurring charges",
      ],
    },
  };

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!user || !sessionId) return;

      // Poll for subscription to be created (webhook might take a few seconds)
      const pollForSubscription = async (attempts = 0): Promise<void> => {
        if (attempts > 10) {
          // After 10 attempts (5 seconds), give up and just invalidate
          console.log("Polling timeout, invalidating queries");
          queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          setIsVerifying(false);
          toast.success("Payment successful! 🎉");
          return;
        }

        try {
          // Check if subscription exists in database
          const { data: subscriptionData, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .in("status", ["active", "trialing"])
            .order("created_at", { ascending: false })
            .maybeSingle();

          if (!subError && subscriptionData) {
            // Subscription found! Invalidate and refresh
            console.log("Subscription found, refreshing UI");
            queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
            queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
            queryClient.refetchQueries({ queryKey: ["subscription", user.id] });
            queryClient.refetchQueries({ queryKey: ["profile", user.id] });
            
            // Also fetch session details
            const { data: sessionData } = await supabase.functions.invoke("get-checkout-session", {
              body: { session_id: sessionId },
            });
            if (sessionData) {
              setSessionDetails(sessionData);
            }
            
            setIsVerifying(false);
            toast.success("Welcome to Premium! 🎉");
            return;
          }

          // Subscription not found yet, wait and retry
          setTimeout(() => {
            pollForSubscription(attempts + 1);
          }, 500);
        } catch (error) {
          console.error("Error polling for subscription:", error);
          // On error, just invalidate and continue
          queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          setIsVerifying(false);
          toast.success("Payment successful! 🎉");
        }
      };

      // Start polling
      pollForSubscription();
    };

    if (user && sessionId) {
      // Wait a bit for webhook to process
      setTimeout(() => {
        fetchSessionDetails();
      }, 2000);
    } else if (!user) {
      navigate("/auth");
    } else {
      setIsVerifying(false);
    }
  }, [user, sessionId, navigate]);

  // Auto-redirect countdown
  useEffect(() => {
    if (!isVerifying && autoRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isVerifying && autoRedirect && countdown === 0) {
      navigate("/");
    }
  }, [isVerifying, autoRedirect, countdown, navigate]);

  // Cancel auto-redirect
  const handleCancelRedirect = () => {
    setAutoRedirect(false);
    setCountdown(0);
  };

  const planType = sessionDetails?.plan_type || subscription?.plan_type || "monthly";
  const plan = planDetails[planType] || planDetails.monthly;
  const trialEnd = sessionDetails?.trial_end 
    ? parseISO(sessionDetails.trial_end) 
    : subscription?.trial_end 
      ? parseISO(subscription.trial_end) 
      : null;
  const nextPaymentDate = sessionDetails?.next_payment_date
    ? parseISO(sessionDetails.next_payment_date)
    : subscription?.current_period_end
      ? parseISO(subscription.current_period_end)
      : null;

  const isTrialActive = trialEnd && new Date() < trialEnd;
  const daysRemaining = trialEnd ? Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      <div className="max-w-3xl mx-auto space-y-6 p-4 pt-8">
        {/* Success Header */}
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-700 dark:bg-green-900/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              {isVerifying ? (
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
              ) : (
                <div className="relative">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                  <div className="absolute inset-0 animate-ping">
                    <CheckCircle2 className="h-10 w-10 text-green-400 opacity-20" />
                  </div>
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl">
                  {isVerifying ? "Processing Payment..." : "Payment Successful! 🎉"}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {isVerifying 
                    ? "Please wait while we confirm your subscription..." 
                    : "Your premium subscription is now active!"}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {!isVerifying && (
          <>
            {/* Subscription Details Card */}
            <Card className="border-purple-200 bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 text-purple-600" />
                    <div>
                      <CardTitle className="text-xl">Premium {plan.name} Plan</CardTitle>
                      <p className="text-sm text-muted-foreground">Active Subscription</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trial Period */}
                {isTrialActive && trialEnd && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-3">
                      <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          7-Day Free Trial Active
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                          You have <strong>{daysRemaining} days</strong> remaining in your free trial.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                          <Calendar className="h-4 w-4" />
                          <span>Trial ends: {format(trialEnd, "MMMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          No charge during trial. Cancel anytime before {format(trialEnd, "MMM d")} to avoid charges.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-muted-foreground">Amount</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {planType === "lifetime" 
                        ? `¥${plan.price.toLocaleString()}` 
                        : `¥${plan.price.toLocaleString()}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{plan.period}</p>
                  </div>

                  {nextPaymentDate && planType !== "lifetime" && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {isTrialActive ? "First Charge" : "Next Payment"}
                        </span>
                      </div>
                      <p className="text-lg font-semibold">
                        {format(nextPaymentDate, "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isTrialActive 
                          ? `After trial ends` 
                          : `Automatic renewal`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Plan Features */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Options */}
            {planType !== "lifetime" && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                    <CardTitle className="text-lg">Save More with Annual Plan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Switch to Annual plan and save 25%! Get 12 months for the price of 10.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                    onClick={() => navigate("/payment?plan=annual")}
                  >
                    Upgrade to Annual Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Additional Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                  onClick={() => navigate("/")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Learning Now
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/account")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Manage Subscription
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Download receipt functionality
                      toast.info("Receipt download coming soon!");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: "I just upgraded to Premium!",
                          text: "Check out Kōtsū Sensei Premium for unlimited practice questions!",
                          url: window.location.origin,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.origin);
                        toast.success("Link copied to clipboard!");
                      }
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Need Help?
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Questions about your subscription? We're here to help!
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        onClick={() => navigate("/profile")}
                      >
                        Contact Support
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => navigate("/account")}
                      >
                        View Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-redirect Notice */}
            {autoRedirect && countdown > 0 && (
              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <p className="text-sm text-muted-foreground">
                        Redirecting to app in <strong>{countdown}</strong> seconds...
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelRedirect}
                    >
                      Stay Here
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
