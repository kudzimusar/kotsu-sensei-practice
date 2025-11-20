import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getBookingById } from "@/lib/supabase/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Video, MapPin, ArrowRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";

export default function BookingSuccess() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Card className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground">
                    Your booking has been confirmed and payment has been processed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.scheduled_date), "EEEE, MMMM d, yyyy")} at {booking.scheduled_time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {booking.session_type === 'video' ? (
                  <Video className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Session Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {booking.session_type.replace('_', ' ')} - {booking.duration_minutes} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    ¥{booking.price_yen.toLocaleString()}
                  </p>
                </div>
              </div>

              {booking.video_call_link && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium mb-2">Video Call Link</p>
                  <a
                    href={booking.video_call_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {booking.video_call_link}
                  </a>
                </div>
              )}

              {booking.meeting_location && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium mb-2">Meeting Location</p>
                  <p className="text-sm">{booking.meeting_location}</p>
                  {booking.meeting_address && (
                    <p className="text-sm text-muted-foreground mt-1">{booking.meeting_address}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/my-bookings")}
            >
              View My Bookings
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate("/book-instructor")}
            >
              Book Another Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

