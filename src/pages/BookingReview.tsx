import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getBookingById } from "@/lib/supabase/bookings";
import { getInstructorById } from "@/lib/supabase/instructors";
import { getReviewByBookingId, createReview, updateReview } from "@/lib/supabase/reviews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowLeft, Star, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";

export default function BookingReview() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [languageQuality, setLanguageQuality] = useState(5);
  const [teachingQuality, setTeachingQuality] = useState(5);
  const [punctuality, setPunctuality] = useState(5);

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  const { data: instructor } = useQuery({
    queryKey: ["instructor", booking?.instructor_id],
    queryFn: () => getInstructorById(booking!.instructor_id),
    enabled: !!booking?.instructor_id,
  });

  const { data: existingReview } = useQuery({
    queryKey: ["review", bookingId],
    queryFn: () => getReviewByBookingId(bookingId!),
    enabled: !!bookingId,
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!booking || !instructor) throw new Error("Missing booking or instructor data");
      
      if (existingReview) {
        return updateReview(existingReview.id, {
          rating,
          comment: comment || undefined,
          language_quality: languageQuality,
          teaching_quality: teachingQuality,
          punctuality,
        });
      } else {
        return createReview({
          booking_id: booking.id,
          instructor_id: instructor.id,
          rating,
          comment: comment || undefined,
          language_quality: languageQuality,
          teaching_quality: teachingQuality,
          punctuality,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
      queryClient.invalidateQueries({ queryKey: ["instructor", instructor?.id] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      navigate("/my-bookings");
    },
    onError: (error: any) => {
      toast({
        title: "Review failed",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      });
    },
  });

  if (bookingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!booking || !instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Booking not found</h2>
          <Button onClick={() => navigate("/my-bookings")}>View My Bookings</Button>
        </div>
      </div>
    );
  }

  if (booking.status !== "completed" && booking.payment_status !== "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Cannot review this booking</h2>
          <p className="text-muted-foreground mb-4">
            You can only review completed and paid bookings.
          </p>
          <Button onClick={() => navigate("/my-bookings")}>View My Bookings</Button>
        </div>
      </div>
    );
  }

  // Pre-fill if editing existing review
  if (existingReview && rating === 5 && !comment) {
    setRating(existingReview.rating);
    setComment(existingReview.comment || "");
    setLanguageQuality(existingReview.language_quality || 5);
    setTeachingQuality(existingReview.teaching_quality || 5);
    setPunctuality(existingReview.punctuality || 5);
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
                <h1 className="text-base font-bold">Review Instructor</h1>
                <p className="text-xs text-muted-foreground">
                  Share your experience with {instructor.full_name}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Rating</CardTitle>
              <CardDescription>How would you rate your experience?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={rating.toString()} onValueChange={(v) => setRating(parseInt(v))}>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex flex-col items-center">
                      <RadioGroupItem value={num.toString()} id={`rating-${num}`} className="peer hidden" />
                      <Label
                        htmlFor={`rating-${num}`}
                        className="cursor-pointer peer-data-[state=checked]:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-12 w-12 ${
                            num <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 5 && "Excellent"}
                  {rating === 4 && "Very Good"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </p>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Ratings</CardTitle>
              <CardDescription>Rate specific aspects of the session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Language Quality</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      variant={num <= languageQuality ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLanguageQuality(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Teaching Quality</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      variant={num <= teachingQuality ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTeachingQuality(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Punctuality</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Button
                      key={num}
                      variant={num <= punctuality ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPunctuality(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Share your thoughts (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like about the session? Any suggestions for improvement?"
                rows={6}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/my-bookings")}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => reviewMutation.mutate()}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

