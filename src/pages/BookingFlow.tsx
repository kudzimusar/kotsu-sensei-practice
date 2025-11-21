import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getInstructorById, getInstructorPricing } from "@/lib/supabase/instructors";
import { createBooking, getAvailableTimeSlots, type CreateBookingData } from "@/lib/supabase/bookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, CheckCircle2, Video, MapPin, Clock, FileText, CreditCard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { format, addDays, isBefore, isAfter, startOfToday } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function BookingFlow() {
  const { id: instructorId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState<'video' | 'in_person'>(
    (searchParams.get('type') as 'video' | 'in_person') || 'video'
  );
  const [duration, setDuration] = useState<30 | 60 | 90>(
    parseInt(searchParams.get('duration') || '60') as 30 | 60 | 90
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [studentNotes, setStudentNotes] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: instructor, isLoading: instructorLoading } = useQuery({
    queryKey: ["instructor", instructorId],
    queryFn: () => getInstructorById(instructorId!),
    enabled: !!instructorId,
  });

  const { data: pricing = [], isLoading: pricingLoading } = useQuery({
    queryKey: ["instructor-pricing", instructorId, sessionType],
    queryFn: () => getInstructorPricing(instructorId!),
    enabled: !!instructorId && !!instructor,
  });

  const selectedPricing = pricing.find(
    p => p.duration_minutes === duration && 
         p.session_type === sessionType && 
         p.booking_type === 'one_on_one'
  );

  const { data: availableTimeSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["available-slots", instructorId, selectedDate, sessionType, duration],
    queryFn: () => getAvailableTimeSlots(
      instructorId!,
      format(selectedDate!, 'yyyy-MM-dd'),
      sessionType,
      duration
    ),
    enabled: !!instructorId && !!selectedDate && !!instructor,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingData) => createBooking(data),
    onSuccess: (booking) => {
      toast({
        title: "Booking created",
        description: "Your booking has been created. Proceeding to payment...",
      });
      // Navigate to payment page
      navigate(`/booking/${booking.id}/payment`);
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Reset time when date or duration changes
    setSelectedTime("");
  }, [selectedDate, duration]);

  // Debug logging for pricing
  useEffect(() => {
    if (pricing.length > 0) {
      console.log('📊 Pricing loaded:', pricing);
      console.log('📊 Session type:', sessionType);
      console.log('📊 Duration:', duration);
      console.log('📊 Selected pricing:', selectedPricing);
    } else if (!pricingLoading && instructorId) {
      console.warn('⚠️ No pricing found for instructor:', instructorId);
    }
  }, [pricing, sessionType, duration, selectedPricing, pricingLoading, instructorId]);

  if (instructorLoading || pricingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Instructor not found</h2>
          <Button onClick={() => navigate("/book-instructor")}>Browse Instructors</Button>
        </div>
      </div>
    );
  }

  // Ensure instructor is approved before allowing booking
  if (instructor.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2">Instructor Not Available</h2>
          <p className="text-muted-foreground mb-4">
            This instructor is not currently accepting bookings. Status: {instructor.status}
          </p>
          <Button onClick={() => navigate("/book-instructor")}>Browse Other Instructors</Button>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (step === 1) {
      if (!sessionType) {
        toast({ title: "Please select a session type", variant: "destructive" });
        return;
      }
      if (!selectedPricing) {
        toast({ title: "No pricing available for selected options", variant: "destructive" });
        return;
      }
    } else if (step === 2) {
      if (!selectedDate) {
        toast({ title: "Please select a date", variant: "destructive" });
        return;
      }
      if (!selectedTime) {
        toast({ title: "Please select a time", variant: "destructive" });
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!selectedPricing || !selectedDate || !selectedTime) {
      toast({ title: "Please complete all required fields", variant: "destructive" });
      return;
    }

    createBookingMutation.mutate({
      instructor_id: instructor.id,
      session_type: sessionType,
      duration_minutes: duration,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      scheduled_time: selectedTime,
      price_yen: selectedPricing.price_yen,
      student_notes: studentNotes || undefined,
      timezone: 'Asia/Tokyo',
    });
  };

  const disabledDates = (date: Date) => {
    return isBefore(date, startOfToday());
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
                <h1 className="text-base font-bold">Book Session</h1>
                <p className="text-xs text-muted-foreground">
                  Step {step} of 4
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    step >= num
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {step > num ? <CheckCircle2 className="h-4 w-4" /> : num}
                </div>
                {num < 4 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2",
                      step > num ? "bg-blue-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Instructor Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{instructor.full_name}</CardTitle>
              <CardDescription>
                {instructor.bio || "Certified driving instructor"}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Select Session Type & Duration"}
                {step === 2 && "Select Date & Time"}
                {step === 3 && "Add Notes (Optional)"}
                {step === 4 && "Review & Confirm"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Session Type & Duration */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Session Type</Label>
                    <RadioGroup value={sessionType} onValueChange={(v) => setSessionType(v as any)}>
                      <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="video" id="video" />
                        <Label htmlFor="video" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Video Call</p>
                              <p className="text-sm text-muted-foreground">
                                Online session via video call
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                      {instructor.available_for_in_person && (
                        <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                          <RadioGroupItem value="in_person" id="in_person" />
                          <Label htmlFor="in_person" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5" />
                              <div>
                                <p className="font-medium">In-Person</p>
                                <p className="text-sm text-muted-foreground">
                                  Meet at a location
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      )}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block">Duration</Label>
                    <RadioGroup value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v) as 30 | 60 | 90)}>
                      {[30, 60, 90].map((mins) => {
                        const price = pricing.find(
                          p => p.duration_minutes === mins && 
                               p.session_type === sessionType && 
                               p.booking_type === 'one_on_one'
                        );
                        return (
                          <div key={mins} className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                            <RadioGroupItem value={mins.toString()} id={`duration-${mins}`} />
                            <Label htmlFor={`duration-${mins}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{mins} minutes</p>
                                </div>
                                {price && (
                                  <p className="font-bold text-lg">¥{price.price_yen.toLocaleString()}</p>
                                )}
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                    {!selectedPricing && sessionType && (
                      <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          No pricing available for {sessionType.replace('_', ' ')} {duration}-minute sessions. 
                          Please contact the instructor or select a different duration.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Select Date</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setCalendarOpen(false);
                            setSelectedTime(""); // Reset time when date changes
                          }}
                          disabled={disabledDates}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Select Time</Label>
                      {slotsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <span className="ml-2 text-sm text-muted-foreground">Loading available times...</span>
                        </div>
                      ) : availableTimeSlots.length === 0 ? (
                        <Card className="p-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                          <div className="text-center space-y-2">
                            <Clock className="h-8 w-8 mx-auto text-yellow-600 dark:text-yellow-400" />
                            <p className="font-medium text-yellow-900 dark:text-yellow-100">
                              No available time slots for this date.
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              Please select another date or contact the instructor.
                            </p>
                          </div>
                        </Card>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Available time slots for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableTimeSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                onClick={() => setSelectedTime(time)}
                                className={cn(
                                  "h-12 font-medium transition-all",
                                  selectedTime === time && "ring-2 ring-primary ring-offset-2"
                                )}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Notes */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any topics you'd like to focus on, questions you have, or special requests..."
                      value={studentNotes}
                      onChange={(e) => setStudentNotes(e.target.value)}
                      rows={6}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Let the instructor know what you'd like to cover in this session.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && selectedPricing && selectedDate && selectedTime && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Instructor</span>
                      <span className="text-sm">{instructor.full_name}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Session Type</span>
                      <Badge variant="outline" className="capitalize">
                        {sessionType === 'video' ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                        {sessionType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Duration</span>
                      <span className="text-sm">{duration} minutes</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Date & Time</span>
                      <span className="text-sm">
                        {format(selectedDate, "MMM d, yyyy")} at {selectedTime}
                      </span>
                    </div>
                    {studentNotes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium block mb-1">Notes</span>
                        <p className="text-sm text-muted-foreground">{studentNotes}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <span className="text-base font-bold">Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ¥{selectedPricing.price_yen.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm">
                      <strong>Payment:</strong> You will be redirected to complete payment after confirming this booking.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || createBookingMutation.isPending}
                >
                  Back
                </Button>
                {step < 4 ? (
                  <Button onClick={handleNext} disabled={createBookingMutation.isPending}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={createBookingMutation.isPending || !selectedPricing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Confirm & Pay
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

