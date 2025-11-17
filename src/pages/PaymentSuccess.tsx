import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

export default function PaymentSuccess() {
  const { user } = useAuth();
  const { isPremium, isLoading } = usePremium();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Verify payment was successful
    if (sessionId) {
      // Payment verification is handled by webhook
      // Just wait a bit for webhook to process
      setTimeout(() => {
        setIsVerifying(false);
        if (isPremium) {
          toast.success("Welcome to Premium! 🎉");
        }
      }, 2000);
    } else {
      setIsVerifying(false);
    }
  }, [user, sessionId, isPremium, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto space-y-6 p-4 pt-12">
        <Card className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              {isVerifying ? (
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  {isVerifying ? "Processing Payment..." : "Payment Successful!"}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isVerifying ? (
              <p className="text-muted-foreground">
                Please wait while we confirm your subscription...
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Crown className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-semibold">Welcome to Premium!</p>
                      <p className="text-sm text-muted-foreground">
                        Your subscription is now active. Enjoy all premium features!
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>Generate unlimited AI questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>Access personalized study plans</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>One-on-one instructor sessions (Coming soon)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>Export and print study materials</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => navigate("/")}
                  >
                    Start Learning
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/profile")}
                  >
                    View Subscription
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

