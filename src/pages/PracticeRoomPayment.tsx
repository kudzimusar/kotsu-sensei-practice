import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getPracticeRoomById, getPracticeRoomParticipants } from "@/lib/supabase/practiceRooms";
import { getInstructorById } from "@/lib/supabase/instructors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CreditCard, Wallet, Store, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";

export default function PracticeRoomPayment() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");
  const [isLoading, setIsLoading] = useState(false);

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ["practice-room", roomId],
    queryFn: () => getPracticeRoomById(roomId!),
    enabled: !!roomId,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["practice-room-participants", roomId],
    queryFn: () => getPracticeRoomParticipants(roomId!),
    enabled: !!roomId,
  });

  const { data: instructor } = useQuery({
    queryKey: ["instructor", room?.instructor_id],
    queryFn: () => getInstructorById(room!.instructor_id),
    enabled: !!room?.instructor_id,
  });

  const userParticipant = participants.find(p => p.user_id === user?.id);
  const isPaid = userParticipant?.payment_status === 'paid';

  useEffect(() => {
    if (isPaid) {
      toast({
        title: "Already paid",
        description: "You've already paid for this practice room.",
      });
      navigate(`/practice-room/${roomId}`);
    }
  }, [isPaid, roomId, navigate, toast]);

  const handleCheckout = async () => {
    if (!room || !user || !userParticipant) {
      toast({
        title: "Error",
        description: "Room or user information missing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = window.location.origin;
      const basePath = import.meta.env.MODE === 'production' ? '/kotsu-sensei-practice' : '';
      const successUrl = `${baseUrl}${basePath}/practice-room/${roomId}/success`;
      const cancelUrl = `${baseUrl}${basePath}/practice-room/${roomId}/payment`;

      const { data, error } = await supabase.functions.invoke("create-practice-room-payment", {
        body: {
          practice_room_id: roomId,
          participant_id: userParticipant.id,
          payment_method: selectedPaymentMethod,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      });

      if (error) {
        if (error.message?.includes("payment_method") || error.message?.includes("not available")) {
          toast({
            title: "Payment method unavailable",
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

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Practice room not found</h2>
          <Button onClick={() => navigate("/practice-rooms")}>Browse Rooms</Button>
        </div>
      </div>
    );
  }

  const roomDateTime = parseISO(`${room.scheduled_date}T${room.scheduled_time}`);
  const spotsRemaining = room.max_participants - room.current_participants;

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
                  Secure payment for practice room
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Room Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{room.title}</CardTitle>
              {instructor && (
                <CardDescription>with {instructor.full_name}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Date & Time</span>
                <span className="text-sm">
                  {format(roomDateTime, "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Duration</span>
                <span className="text-sm">{room.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Type</span>
                <span className="text-sm capitalize">{room.session_type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Participants</span>
                <span className="text-sm flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {room.current_participants}/{room.max_participants} ({spotsRemaining} spots left)
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <span className="text-base font-bold">Your Payment</span>
                <span className="text-2xl font-bold text-blue-600">
                  ¥{room.price_per_participant_yen.toLocaleString()}
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
                Pay ¥{room.price_per_participant_yen.toLocaleString()}
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

