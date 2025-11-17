import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getUserBookings, cancelBooking, getBookingById } from "@/lib/supabase/bookings";
import { getInstructorById } from "@/lib/supabase/instructors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Video, MapPin, X, Eye, MessageSquare, ExternalLink, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import type { Booking } from "@/lib/supabase/bookings";

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ["user-bookings", user?.id],
    queryFn: () => getUserBookings(),
    enabled: !!user,
  });

  const upcomingBookings = allBookings.filter((booking) => {
    const bookingDateTime = parseISO(`${booking.scheduled_date}T${booking.scheduled_time}`);
    return (
      isAfter(bookingDateTime, new Date()) &&
      booking.status !== "cancelled" &&
      booking.status !== "completed"
    );
  });

  const pastBookings = allBookings.filter((booking) => {
    const bookingDateTime = parseISO(`${booking.scheduled_date}T${booking.scheduled_time}`);
    return (
      isBefore(bookingDateTime, new Date()) ||
      booking.status === "completed"
    );
  });

  const cancelledBookings = allBookings.filter((booking) => booking.status === "cancelled");

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled.",
      });
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      setCancellationReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    },
  });

  const handleCancel = () => {
    if (!selectedBooking) return;
    cancelMutation.mutate({
      bookingId: selectedBooking.id,
      reason: cancellationReason.trim() || undefined,
    });
  };

  const getStatusBadge = (booking: Booking) => {
    switch (booking.status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="destructive" className="bg-orange-500">No Show</Badge>;
      default:
        return <Badge>{booking.status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: Booking['payment_status']) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Payment Pending</Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Refunded</Badge>;
      case "failed":
        return <Badge variant="destructive">Payment Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const displayBookings = activeTab === "upcoming" 
    ? upcomingBookings 
    : activeTab === "past" 
    ? pastBookings 
    : cancelledBookings;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold">My Bookings</h1>
            <p className="text-sm text-muted-foreground">Manage your instructor sessions</p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({cancelledBookings.length})
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : displayBookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "upcoming" && "No upcoming bookings."}
                    {activeTab === "past" && "No past bookings."}
                    {activeTab === "cancelled" && "No cancelled bookings."}
                  </p>
                  {activeTab === "upcoming" && (
                    <Button onClick={() => navigate("/book-instructor")}>
                      Book an Instructor
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onView={() => navigate(`/booking/${booking.id}`)}
                    onCancel={() => {
                      setSelectedBooking(booking);
                      setCancelDialogOpen(true);
                    }}
                    getStatusBadge={getStatusBadge}
                    getPaymentStatusBadge={getPaymentStatusBadge}
                  />
                ))}
              </div>
            )}
          </Tabs>
        </div>

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? You may be eligible for a refund based on the cancellation policy.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cancel-reason">Cancellation Reason (Optional)</Label>
                <Textarea
                  id="cancel-reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Let us know why you're cancelling..."
                  rows={3}
                />
              </div>
              {selectedBooking && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Cancellation Policy:</strong>
                    <br />
                    • 24+ hours before: Full refund
                    <br />
                    • 12-24 hours before: 50% refund
                    <br />
                    • Less than 12 hours: No refund
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Booking"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

interface BookingCardProps {
  booking: Booking;
  onView: () => void;
  onCancel: () => void;
  getStatusBadge: (booking: Booking) => React.ReactNode;
  getPaymentStatusBadge: (status: Booking['payment_status']) => React.ReactNode;
}

function BookingCard({ booking, onView, onCancel, getStatusBadge, getPaymentStatusBadge }: BookingCardProps) {
  const navigate = useNavigate();
  const { data: instructor } = useQuery({
    queryKey: ["instructor", booking.instructor_id],
    queryFn: () => getInstructorById(booking.instructor_id),
    enabled: !!booking.instructor_id,
  });

  const bookingDateTime = parseISO(`${booking.scheduled_date}T${booking.scheduled_time}`);
  const isUpcoming = booking.status === "confirmed" || booking.status === "pending";
  const canCancel = isUpcoming && isAfter(bookingDateTime, new Date());
  const canReview = booking.status === "completed" && booking.payment_status === "paid";
  const canJoinCall = booking.status === "confirmed" && booking.video_call_link && isUpcoming;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">
                {instructor?.full_name || "Instructor"}
              </CardTitle>
              {getStatusBadge(booking)}
              {getPaymentStatusBadge(booking.payment_status)}
            </div>
            <CardDescription>
              <div className="flex items-center gap-4 flex-wrap mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(bookingDateTime, "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{booking.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  {booking.session_type === 'video' ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span className="capitalize">{booking.session_type.replace('_', ' ')}</span>
                </div>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">¥{booking.price_yen.toLocaleString()}</p>
            {booking.payment_status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => window.location.href = `/booking/${booking.id}/payment`}
              >
                Complete Payment
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {canJoinCall && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(booking.video_call_link, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Call
              </Button>
            )}
            {canReview && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/booking/${booking.id}/review`)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Review
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigate(`/booking/${booking.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

