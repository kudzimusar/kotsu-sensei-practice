import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Crown, Check, Sparkles, ArrowLeft, CreditCard, Wallet, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

type PlanType = "monthly" | "quarterly" | "annual" | "lifetime";

interface Plan {
  type: PlanType;
  name: string;
  price: number;
  priceDisplay: string;
  period: string;
  savings?: string;
  popular?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    type: "monthly",
    name: "Monthly",
    price: 980,
    priceDisplay: "¥980",
    period: "per month",
    features: [
      "Unlimited AI-generated questions",
      "Personalized study plans",
      "Advanced progress analytics",
      "One-on-one instructor sessions (Coming soon)",
      "Export & print study guides",
      "Ad-free experience",
      "Priority support",
    ],
  },
  {
    type: "quarterly",
    name: "Quarterly",
    price: 1500,
    priceDisplay: "¥1,500",
    period: "per 3 months",
    savings: "Save 23%",
    popular: true,
    features: [
      "Everything in Monthly",
      "23% savings",
      "Better value",
    ],
  },
  {
    type: "annual",
    name: "Annual",
    price: 8800,
    priceDisplay: "¥8,800",
    period: "per year",
    savings: "Save 25%",
    features: [
      "Everything in Monthly",
      "25% savings",
      "Best value",
      "Free textbook included",
    ],
  },
  {
    type: "lifetime",
    name: "9-Month Access",
    price: 2400,
    priceDisplay: "¥2,400",
    period: "one-time payment (9 months)",
    savings: "Best Value",
    features: [
      "Everything in Quarterly",
      "9 months access (standard license period)",
      "One-time payment",
      "No recurring charges",
    ],
  },
];

export default function Payment() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, subscription } = usePremium();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("quarterly");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");
  const [isLoading, setIsLoading] = useState(false);

  // Handle canceled payment redirect
  useEffect(() => {
    const canceled = searchParams.get("canceled");
    if (canceled === "true") {
      toast.info("Payment was canceled. You can try again anytime.");
      // Remove the canceled parameter from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Reset payment method if switching to/from lifetime plan
  useEffect(() => {
    if (selectedPlan === "lifetime" && selectedPaymentMethod === "konbini") {
      // Konbini is allowed for lifetime
    } else if (selectedPlan !== "lifetime" && selectedPaymentMethod === "konbini") {
      // Konbini not available for subscriptions, switch to card
      setSelectedPaymentMethod("card");
    }
  }, [selectedPlan, selectedPaymentMethod]);

  // Get feature from location state (if coming from paywall)
  const feature = location.state?.feature;

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    
    // ProtectedRoute already handles authentication check
    // Only show message if user already has premium
    if (user && isPremium && subscription) {
      // Check if subscription is active (not just trialing)
      if (subscription.status === "active") {
        toast.info("You already have an active premium subscription! Redirecting to account page...", {
          duration: 3000,
        });
        // Redirect to account page after a short delay
        setTimeout(() => {
          navigate("/account");
        }, 2000);
      }
    }
  }, [user, isPremium, subscription, authLoading, navigate]);

  const handleCheckout = async (planType: PlanType) => {
    // ProtectedRoute ensures user is logged in, but double-check for safety
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth", { state: { from: "/payment" } });
      return;
    }

    setIsLoading(true);

    try {
      // Get current URL for success/cancel redirects
      // ALWAYS include base path in production for GitHub Pages
      const baseUrl = window.location.origin;
      const basePath = '/kotsu-sensei-practice';
      
      // In production, always use base path (GitHub Pages requirement)
      // In development, use root path
      const pathPrefix = import.meta.env.MODE === 'production' ? basePath : '';
      
      // Construct URLs - always include base path in production
      const successUrl = `${baseUrl}${pathPrefix}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}${pathPrefix}/payment?canceled=true`;
      
      console.log('Checkout URLs:', { 
        successUrl, 
        cancelUrl, 
        pathPrefix, 
        baseUrl,
        mode: import.meta.env.MODE
      });

      // Call Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          plan_type: planType,
          payment_method: selectedPaymentMethod,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      });

      if (error) {
        // Better error handling for payment method issues
        if (error.message?.includes("payment_method") || error.message?.includes("not available")) {
          toast.error(`${selectedPaymentMethod === "paypal" ? "PayPal" : selectedPaymentMethod === "paypay" ? "PayPay" : "Konbini"} is not available. Please try card payment.`, {
            duration: 5000,
          });
          // Auto-fallback to card
          setSelectedPaymentMethod("card");
          setIsLoading(false);
          return;
        }
        
        // Handle existing subscription error
        if (error.message?.includes("already have an active subscription") || error.message?.includes("existing subscription")) {
          toast.error("You already have an active subscription. Please manage it from your account page.", {
            duration: 6000,
          });
          navigate("/account");
          setIsLoading(false);
          return;
        }
        
        throw error;
      }

      // Check if fallback was used
      if (data?.fallbackUsed && data?.paymentMethod !== selectedPaymentMethod) {
        toast.warning(
          `${selectedPaymentMethod === "paypal" ? "PayPal" : selectedPaymentMethod === "paypay" ? "PayPay" : "Konbini"} is not available for your account. Using card payment instead.`,
          { duration: 5000 }
        );
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data?.sessionId) {
        // If we get session ID, we might need to redirect manually
        toast.error("Failed to get checkout URL. Please try again.");
        setIsLoading(false);
      } else {
        toast.error("Unexpected response from payment server. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to start checkout. Please try again or contact support.";
      
      toast.error(errorMessage, {
        duration: 6000,
      });
      setIsLoading(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.type === selectedPlan);

  // Show loading state while auth is loading
  // ProtectedRoute will handle redirect if user is not logged in
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ProtectedRoute ensures user is logged in, but show nothing if somehow not
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold">Upgrade to Premium</h1>
              <p className="text-xs text-muted-foreground">
                Choose the plan that's right for you
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8 p-4 pt-6">
        {/* Current Subscription Status */}
        {isPremium && subscription && (
          <Card className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">You have an active Premium subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Plan: {subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1)}
                    {subscription.current_period_end && (
                      <> • Renews {new Date(subscription.current_period_end).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.type}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.type
                  ? "border-purple-500 border-2 shadow-lg"
                  : "hover:border-purple-300"
              } ${plan.popular ? "ring-2 ring-purple-300" : ""}`}
              onClick={() => setSelectedPlan(plan.type)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.popular && (
                    <Badge className="bg-purple-600">Popular</Badge>
                  )}
                </div>
                {plan.savings && (
                  <Badge variant="outline" className="mt-2 w-fit">
                    {plan.savings}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.priceDisplay}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.period}
                    </p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Plan Summary */}
        {selectedPlanData && (
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-700 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <CardTitle className="text-2xl">
                    {selectedPlanData.name} Plan
                  </CardTitle>
                  <CardDescription>
                    {selectedPlanData.priceDisplay} {selectedPlanData.period}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* All Premium Features */}
              <div>
                <h3 className="font-semibold mb-3">All Premium Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plans[0].features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <h3 className="font-semibold mb-3">Choose Payment Method</h3>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                  className="space-y-3"
                >
                  <div className={`flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}>
                    <RadioGroupItem value="card" id="card" disabled={isLoading} />
                    <Label htmlFor="card" className={`flex-1 ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-xs text-muted-foreground">
                            Visa, Mastercard, JCB, American Express
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}>
                    <RadioGroupItem value="paypal" id="paypal" disabled={isLoading} />
                    <Label htmlFor="paypal" className={`flex-1 ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">PayPal</p>
                          <p className="text-xs text-muted-foreground">
                            Pay with your PayPal account
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}>
                    <RadioGroupItem value="paypay" id="paypay" disabled={isLoading} />
                    <Label htmlFor="paypay" className={`flex-1 ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">PayPay</p>
                          <p className="text-xs text-muted-foreground">
                            Popular mobile payment in Japan
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className={`flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent ${
                    selectedPlan !== "lifetime" || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}>
                    <RadioGroupItem 
                      value="konbini" 
                      id="konbini" 
                      disabled={selectedPlan !== "lifetime" || isLoading}
                    />
                    <Label htmlFor="konbini" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Convenience Store (Konbini)</p>
                          <p className="text-xs text-muted-foreground">
                            7-Eleven, FamilyMart, Lawson, etc.
                            {selectedPlan !== "lifetime" && " (Lifetime plan only)"}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                onClick={() => handleCheckout(selectedPlan)}
                disabled={isLoading || (isPremium && subscription?.status === "active")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isPremium && subscription?.status === "active" ? (
                  "Already Subscribed"
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Subscribe to {selectedPlanData.name} Plan
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <p className="text-center text-xs text-muted-foreground">
                  Secure payment powered by Stripe. Cancel anytime.
                  {selectedPlanData.type !== "lifetime" && " 7-day free trial included."}
                </p>
                {selectedPlanData.type !== "lifetime" && (
                  <p className="text-center text-xs text-muted-foreground">
                    You can cancel during the 7-day free trial without being charged. After the trial, you'll be charged {selectedPlanData.priceDisplay} {selectedPlanData.period === "per month" ? "monthly" : selectedPlanData.period === "per 3 months" ? "every 3 months" : "annually"}.
                  </p>
                )}
                {selectedPaymentMethod === "konbini" && (
                  <p className="text-center text-xs text-muted-foreground">
                    You'll receive a payment slip to pay at a convenience store.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accepted Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, PayPal, and Japanese convenience store payments (Konbini).
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

