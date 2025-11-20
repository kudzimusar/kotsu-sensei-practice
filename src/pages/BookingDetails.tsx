import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getBookingById, cancelBooking } from "@/lib/supabase/bookings";
import { getInstructorById } from "@/lib/supabase/instructors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, Video, MapPin, Clock, DollarSign, X, ExternalLink, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { format, parseISO, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export default function BookingDetails() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  const { data: instructor } = useQuery({
    queryKey: ["instructor", booking?.instructor_id],
    queryFn: () => getInstructorById(booking!.instructor_id),
    enabled: !!booking?.instructor_id,
  });

  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => cancelBooking(bookingId!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled.",
      });
      navigate("/my-bookings");
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    },
  });

  const createVideoSessionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-video-session", {
        body: { booking_id: bookingId, provider: "zoom" },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking"] });
      toast({
        title: "Video link generated",
        description: "The video call link has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create video link",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
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

  const bookingDateTime = parseISO(`${booking.scheduled_date}T${booking.scheduled_time}`);
  const isUpcoming = isAfter(bookingDateTime, new Date()) && booking.status !== 'cancelled';
  const canCancel = isUpcoming && (booking.status === 'confirmed' || booking.status === 'pending');
  const canReview = booking.status === 'completed' && booking.payment_status === 'paid';
  const canJoinCall = booking.status === 'confirmed' && booking.video_call_link && isUpcoming;
  const needsPayment = booking.payment_status === 'pending';

  const getStatusBadge = () => {
    switch (booking.status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{booking.status}</Badge>;
    }
  };

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
                <h1 className="text-base font-bold">Booking Details</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  {getStatusBadge()}
                </div>
                {needsPayment && (
                  <Button
                    onClick={() => navigate(`/booking/${booking.id}/payment`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Complete Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructor Info */}
          {instructor && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{instructor.full_name}</p>
                    <p className="text-sm text-muted-foreground">{instructor.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/instructor/${instructor.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(bookingDateTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{booking.duration_minutes} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {booking.session_type === 'video' ? (
                  <Video className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Session Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {booking.session_type.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm text-muted-foreground">¥{booking.price_yen.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Call Link */}
          {booking.session_type === 'video' && (
            <Card>
              <CardHeader>
                <CardTitle>Video Call</CardTitle>
              </CardHeader>
              <CardContent>
                {booking.video_call_link ? (
                  <div className="space-y-3">
                    <a
                      href={booking.video_call_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {booking.video_call_link}
                    </a>
                    {canJoinCall && (
                      <Button
                        className="w-full"
                        onClick={() => window.open(booking.video_call_link, '_blank')}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Join Video Call
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Video call link will be generated when the session is confirmed.
                    </p>
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        onClick={() => createVideoSessionMutation.mutate()}
                        disabled={createVideoSessionMutation.isPending}
                      >
                        {createVideoSessionMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Video Link"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Meeting Location (In-Person) */}
          {booking.session_type === 'in_person' && booking.meeting_location && (
            <Card>
              <CardHeader>
                <CardTitle>Meeting Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{booking.meeting_location}</p>
                {booking.meeting_address && (
                  <p className="text-sm text-muted-foreground mt-1">{booking.meeting_address}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {booking.student_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Your Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{booking.student_notes}</p>
              </CardContent>
            </Card>
          )}

          {booking.instructor_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{booking.instructor_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {canReview && (
              <Button
                className="flex-1"
                onClick={() => navigate(`/booking/${booking.id}/review`)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Write Review
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => cancelMutation.mutate(undefined)}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

