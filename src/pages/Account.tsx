import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Crown, CreditCard, FileText, Calendar, X, Check, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

export default function Account() {
  const { user } = useAuth();
  const { isPremium, subscription } = usePremium();
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);

  // Fetch billing history
  const { data: billingHistory = [], isLoading: billingLoading } = useQuery({
    queryKey: ["billing-history", user?.id],
    queryFn: async (): Promise<Invoice[]> => {
      if (!user || !subscription?.stripe_customer_id) return [];

      setIsLoadingBilling(true);
      try {
        if (!subscription.stripe_customer_id) {
          console.error("No stripe_customer_id found in subscription");
          toast.error("Customer ID not found. Please contact support.");
          return [];
        }

        const { data, error } = await supabase.functions.invoke("get-billing-history", {
          body: { customer_id: subscription.stripe_customer_id },
        });

        if (error) {
          console.error("Error from billing history function:", error);
          throw error;
        }

        if (!data) {
          console.warn("No data returned from billing history function");
          return [];
        }

        return data?.invoices || [];
      } catch (error) {
        console.error("Error fetching billing history:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to load billing history: ${errorMessage}`);
        return [];
      } finally {
        setIsLoadingBilling(false);
      }
    },
    enabled: !!user && !!subscription?.stripe_customer_id,
  });

  const handleManagePaymentMethod = async () => {
    if (!subscription?.stripe_customer_id) {
      toast.error("No payment method found");
      return;
    }

    // Check if this is a test subscription
    if (subscription.stripe_customer_id.startsWith('test_customer_')) {
      toast.error("This is a test subscription. Please complete a real payment to manage your subscription.");
      return;
    }

    setIsLoadingPortal(true);
    try {
      // Include base path for GitHub Pages
      const basePath = import.meta.env.MODE === 'production' ? '/kotsu-sensei-practice' : '';
      const returnUrl = `${window.location.origin}${basePath}/account`;
      
      const { data, error } = await supabase.functions.invoke("create-customer-portal-session", {
        body: {
          customer_id: subscription.stripe_customer_id,
          return_url: returnUrl,
        },
      });

      if (error) {
        console.error("Error from portal session function:", error);
        // Check if it's a test subscription error
        if (error.message?.includes('Test subscription') || error.message?.includes('is_test')) {
          toast.error("This is a test subscription. Please complete a real payment to manage your subscription.");
          return;
        }
        throw error;
      }

      if (data?.is_test) {
        toast.error("This is a test subscription. Please complete a real payment to manage your subscription.");
        setIsLoadingPortal(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL returned from portal session:", data);
        toast.error("Failed to create portal session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      // Check if it's a test subscription error
      if (errorMessage.includes('Test subscription') || errorMessage.includes('is_test')) {
        toast.error("This is a test subscription. Please complete a real payment to manage your subscription.");
      } else {
        toast.error(`Failed to open payment management: ${errorMessage}`);
      }
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) {
      toast.error("No active subscription found");
      return;
    }

    try {
      // Open Stripe Customer Portal for cancellation
      await handleManagePaymentMethod();
      setCancelDialogOpen(false);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  const getPlanDisplayName = (planType: string) => {
    return planType.charAt(0).toUpperCase() + planType.slice(1);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency.toUpperCase() === "JPY" ? "JPY" : "USD",
      minimumFractionDigits: currency.toUpperCase() === "JPY" ? 0 : 2,
    }).format(amount / 100);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
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
              <h1 className="text-base font-bold">Account</h1>
              <p className="text-xs text-muted-foreground">
                Manage your subscription and billing
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6 p-4 pt-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card className="border-2 border-purple-200 dark:border-purple-700">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div className="flex-1">
                <CardTitle className="text-lg">Subscription</CardTitle>
                <CardDescription>Manage your premium subscription</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(subscription && (subscription.status === "active" || subscription.status === "trialing")) || (isPremium && subscription) ? (
              <>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {getPlanDisplayName(subscription.plan_type)} Plan
                      </p>
                      <Badge
                        className={`mt-1 ${
                          subscription.status === "active"
                            ? "bg-green-500"
                            : subscription.status === "trialing"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {subscription.plan_type !== "lifetime" && (
                    <div className="mt-3 space-y-2">
                      {subscription.current_period_start && (
                        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Current period: {format(new Date(subscription.current_period_start), "MMM d, yyyy")} -{" "}
                            {subscription.current_period_end
                              ? format(new Date(subscription.current_period_end), "MMM d, yyyy")
                              : "N/A"}
                          </span>
                        </div>
                      )}
                      {subscription.current_period_end && (
                        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {subscription.cancel_at_period_end
                              ? `Cancels on ${format(new Date(subscription.current_period_end), "MMM d, yyyy")}`
                              : `Renews on ${format(new Date(subscription.current_period_end), "MMM d, yyyy")}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {subscription.plan_type === "lifetime" && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                      <Check className="w-3 h-3" />
                      <span>Lifetime access - No renewal needed</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/payment")}
                  >
                    Update Plan
                  </Button>
                  {subscription.plan_type !== "lifetime" && (
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => setCancelDialogOpen(true)}
                      disabled={subscription.cancel_at_period_end}
                    >
                      {subscription.cancel_at_period_end ? "Cancellation Scheduled" : "Cancel Subscription"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-4">You don't have an active subscription</p>
                <Button
                  onClick={() => navigate("/payment")}
                  className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        {((subscription && (subscription.status === "active" || subscription.status === "trialing")) || (isPremium && subscription)) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-gray-600" />
                <div className="flex-1">
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                  <CardDescription>Manage your payment information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-xs text-muted-foreground">
                    Manage your payment methods and billing information
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleManagePaymentMethod}
                  disabled={isLoadingPortal}
                >
                  {isLoadingPortal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Payment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        {((subscription && (subscription.status === "active" || subscription.status === "trialing")) || (isPremium && subscription)) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-gray-600" />
                <div className="flex-1">
                  <CardTitle className="text-lg">Billing History</CardTitle>
                  <CardDescription>View and download your invoices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {billingLoading || isLoadingBilling ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : billingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No billing history found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {billingHistory.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {format(new Date(invoice.created * 1000), "MMM d, yyyy")}
                          </p>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "open"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {invoice.hosted_invoice_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invoice.hosted_invoice_url, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invoice.invoice_pdf, "_blank")}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your
              current billing period ({subscription?.current_period_end
                ? format(new Date(subscription.current_period_end), "MMM d, yyyy")
                : "N/A"}
              ). You can reactivate anytime before then.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

