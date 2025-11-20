import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getBookingById } from "@/lib/supabase/bookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CreditCard, Wallet, Store, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function BookingPayment() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");
  const [isLoading, setIsLoading] = useState(false);

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (booking && booking.payment_status === 'paid') {
      toast({
        title: "Already paid",
        description: "This booking has already been paid.",
      });
      navigate(`/booking/${bookingId}`);
    }
  }, [booking, bookingId, navigate, toast]);

  const handleCheckout = async () => {
    if (!booking || !user) {
      toast({
        title: "Error",
        description: "Booking or user information missing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = window.location.origin;
      const basePath = import.meta.env.MODE === 'production' ? '/kotsu-sensei-practice' : '';
      const successUrl = `${baseUrl}${basePath}/booking/${bookingId}/success`;
      const cancelUrl = `${baseUrl}${basePath}/booking/${bookingId}/payment`;

      const { data, error } = await supabase.functions.invoke("create-booking-payment", {
        body: {
          booking_id: bookingId,
          payment_method: selectedPaymentMethod,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      });

      if (error) {
        if (error.message?.includes("payment_method") || error.message?.includes("not available")) {
          toast({
            title: "Error",
            description: `${selectedPaymentMethod === "paypal" ? "PayPal" : selectedPaymentMethod === "paypay" ? "PayPay" : "Konbini"} is not available. Please try card payment.`,
            variant: "destructive",
          });
          setSelectedPaymentMethod("card");
          setIsLoading(false);
          return;
        }
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to get checkout URL. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
          <Button onClick={() => navigate("/my-bookings")}>View My Bookings</Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-base font-bold">Complete Payment</h1>
                <p className="text-xs text-muted-foreground">
                  Secure payment for your booking
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Session</span>
                <span className="text-sm capitalize">{booking.session_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Duration</span>
                <span className="text-sm">{booking.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Date & Time</span>
                <span className="text-sm">
                  {format(new Date(booking.scheduled_date), "MMM d, yyyy")} at {booking.scheduled_time}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ¥{booking.price_yen.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Payment Method</CardTitle>
              <CardDescription>Select how you'd like to pay</CardDescription>
            </CardHeader>
            <CardContent>
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
                  isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}>
                  <RadioGroupItem value="konbini" id="konbini" disabled={isLoading} />
                  <Label htmlFor="konbini" className={`flex-1 ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Convenience Store (Konbini)</p>
                        <p className="text-xs text-muted-foreground">
                          7-Eleven, FamilyMart, Lawson, etc.
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* CTA Button */}
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ¥{booking.price_yen.toLocaleString()}
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Stripe. Your payment information is encrypted and secure.
          </p>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

