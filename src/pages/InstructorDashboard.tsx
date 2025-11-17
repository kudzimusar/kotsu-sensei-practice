import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getInstructorByUserId, getInstructorPricing, getInstructorAvailability, setInstructorPricing, setInstructorAvailability } from "@/lib/supabase/instructors";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Calendar, DollarSign, Star, Users, Settings, Clock, Video, MapPin, X } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { format, parseISO, isAfter } from "date-fns";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DURATIONS = [30, 60, 90] as const;

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: instructor, isLoading: instructorLoading } = useQuery({
    queryKey: ["instructor-dashboard", user?.id],
    queryFn: () => getInstructorByUserId(user!.id),
    enabled: !!user,
  });

  const { data: pricing = [] } = useQuery({
    queryKey: ["instructor-pricing", instructor?.id],
    queryFn: () => getInstructorPricing(instructor!.id),
    enabled: !!instructor,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ["instructor-availability", instructor?.id],
    queryFn: () => getInstructorAvailability(instructor!.id),
    enabled: !!instructor,
  });

  // Get instructor bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ["instructor-bookings", instructor?.id],
    queryFn: async () => {
      if (!instructor) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('instructor_id', instructor.id)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!instructor,
  });

  const upcomingBookings = bookings.filter((b: any) => {
    const bookingDateTime = parseISO(`${b.scheduled_date}T${b.scheduled_time}`);
    return isAfter(bookingDateTime, new Date()) && b.status !== 'cancelled';
  });

  if (instructorLoading) {
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
          <h2 className="text-2xl font-bold mb-2">Not an Instructor</h2>
          <p className="text-muted-foreground mb-4">You need to register as an instructor first.</p>
          <Button onClick={() => navigate("/become-instructor")}>
            Become an Instructor
          </Button>
        </div>
      </div>
    );
  }

  if (instructor.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Application Pending</h2>
          <p className="text-muted-foreground mb-4">
            Your instructor application is {instructor.status}. 
            {instructor.status === 'pending' && ' Please wait for admin approval.'}
            {instructor.status === 'rejected' && instructor.rejection_reason && (
              <span> Reason: {instructor.rejection_reason}</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold">Instructor Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your bookings, availability, and earnings</p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{upcomingBookings.length}</div>
                    <p className="text-sm text-muted-foreground">Sessions scheduled</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-3xl font-bold">{instructor.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{instructor.total_reviews} reviews</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{bookings.length}</div>
                    <p className="text-sm text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" onClick={() => setActiveTab("bookings")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Bookings
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("availability")}>
                      <Clock className="h-4 w-4 mr-2" />
                      Set Availability
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("pricing")}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Update Pricing
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/instructor/" + instructor.id)}>
                      <Settings className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <BookingsTab bookings={bookings} upcomingBookings={upcomingBookings} />
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability">
              <AvailabilityTab 
                instructorId={instructor.id} 
                availability={availability}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ["instructor-availability"] })}
              />
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <PricingTab 
                instructorId={instructor.id}
                pricing={pricing}
                instructor={instructor}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ["instructor-pricing"] })}
              />
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <ReviewsTab instructorId={instructor.id} />
            </TabsContent>
          </Tabs>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

function BookingsTab({ bookings, upcomingBookings }: { bookings: any[], upcomingBookings: any[] }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Upcoming Bookings</h3>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No upcoming bookings.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">
                          {format(parseISO(`${booking.scheduled_date}T${booking.scheduled_time}`), "MMM d, yyyy 'at' h:mm a")}
                        </h4>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{booking.duration_minutes} minutes</span>
                        <span className="capitalize">{booking.session_type.replace('_', ' ')}</span>
                        <span>¥{booking.price_yen.toLocaleString()}</span>
                      </div>
                      {booking.student_notes && (
                        <p className="text-sm mt-2 text-muted-foreground">{booking.student_notes}</p>
                      )}
                    </div>
                    {booking.video_call_link && (
                      <Button size="sm" variant="outline" onClick={() => window.open(booking.video_call_link, '_blank')}>
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AvailabilityTab({ instructorId, availability, onUpdate }: { 
  instructorId: string; 
  availability: any[];
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<Record<number, any[]>>({});

  useEffect(() => {
    // Initialize weekly schedule from availability
    const schedule: Record<number, any[]> = {};
    for (let i = 0; i < 7; i++) {
      schedule[i] = availability.filter(a => a.day_of_week === i);
    }
    setWeeklySchedule(schedule);
  }, [availability]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const allAvailability: any[] = [];
      Object.entries(weeklySchedule).forEach(([day, slots]) => {
        slots.forEach((slot: any) => {
          allAvailability.push({
            day_of_week: parseInt(day),
            start_time: slot.start_time,
            end_time: slot.end_time,
            session_type: slot.session_type,
            booking_type: slot.booking_type || 'one_on_one',
            is_active: true,
          });
        });
      });

      await setInstructorAvailability(instructorId, allAvailability);
      toast({ title: "Availability updated", description: "Your availability has been saved." });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
        <CardDescription>Set your available hours for each day of the week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS_OF_WEEK.map((day, dayIndex) => (
          <div key={day} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="font-semibold">{day}</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const current = weeklySchedule[dayIndex] || [];
                  setWeeklySchedule({
                    ...weeklySchedule,
                    [dayIndex]: [...current, { start_time: '09:00', end_time: '17:00', session_type: 'video', booking_type: 'one_on_one' }],
                  });
                }}
              >
                Add Slot
              </Button>
            </div>
            <div className="space-y-2">
              {(weeklySchedule[dayIndex] || []).map((slot: any, slotIndex: number) => (
                <div key={slotIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) => {
                      const updated = [...(weeklySchedule[dayIndex] || [])];
                      updated[slotIndex].start_time = e.target.value;
                      setWeeklySchedule({ ...weeklySchedule, [dayIndex]: updated });
                    }}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) => {
                      const updated = [...(weeklySchedule[dayIndex] || [])];
                      updated[slotIndex].end_time = e.target.value;
                      setWeeklySchedule({ ...weeklySchedule, [dayIndex]: updated });
                    }}
                    className="w-32"
                  />
                  <Select
                    value={slot.session_type}
                    onValueChange={(v) => {
                      const updated = [...(weeklySchedule[dayIndex] || [])];
                      updated[slotIndex].session_type = v;
                      setWeeklySchedule({ ...weeklySchedule, [dayIndex]: updated });
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="in_person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const updated = (weeklySchedule[dayIndex] || []).filter((_: any, i: number) => i !== slotIndex);
                      setWeeklySchedule({ ...weeklySchedule, [dayIndex]: updated });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Availability"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function PricingTab({ instructorId, pricing, instructor, onUpdate }: {
  instructorId: string;
  pricing: any[];
  instructor: any;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [pricingData, setPricingData] = useState<Record<string, any>>({});

  useEffect(() => {
    const data: Record<string, any> = {};
    ['video', 'in_person'].forEach((type) => {
      DURATIONS.forEach((duration) => {
        const key = `${type}_${duration}`;
        const existing = pricing.find(p => p.session_type === type && p.duration_minutes === duration && p.booking_type === 'one_on_one');
        data[key] = {
          session_type: type,
          duration_minutes: duration,
          booking_type: 'one_on_one',
          price_yen: existing?.price_yen || 0,
          is_active: existing?.is_active !== false,
        };
      });
    });
    setPricingData(data);
  }, [pricing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const allPricing = Object.values(pricingData)
        .filter((p: any) => p.price_yen > 0 && p.is_active)
        .map((p: any) => ({
          duration_minutes: p.duration_minutes,
          session_type: p.session_type,
          booking_type: p.booking_type,
          price_yen: p.price_yen,
          is_active: true,
        }));

      await setInstructorPricing(instructorId, allPricing);
      toast({ title: "Pricing updated", description: "Your pricing has been saved." });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Pricing</CardTitle>
        <CardDescription>Set your prices for different session types and durations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {['video', 'in_person'].map((type) => {
          if (type === 'in_person' && !instructor.available_for_in_person) return null;
          return (
            <div key={type}>
              <h3 className="font-semibold mb-3 capitalize">{type.replace('_', ' ')} Sessions</h3>
              <div className="space-y-3">
                {DURATIONS.map((duration) => {
                  const key = `${type}_${duration}`;
                  const price = pricingData[key] || { price_yen: 0, is_active: false };
                  return (
                    <div key={duration} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label>{duration} minutes</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">¥</span>
                        <Input
                          type="number"
                          value={price.price_yen || ''}
                          onChange={(e) => {
                            setPricingData({
                              ...pricingData,
                              [key]: { ...price, price_yen: parseInt(e.target.value) || 0 },
                            });
                          }}
                          className="w-32"
                          min="0"
                        />
                      </div>
                      <Checkbox
                        checked={price.is_active}
                        onCheckedChange={(checked) => {
                          setPricingData({
                            ...pricingData,
                            [key]: { ...price, is_active: !!checked },
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Pricing"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function ReviewsTab({ instructorId }: { instructorId: string }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ["instructor-reviews", instructorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instructor_reviews')
        .select('*')
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!instructorId,
  });

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No reviews yet.</p>
          </CardContent>
        </Card>
      ) : (
        reviews.map((review: any) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(review.created_at), "MMM d, yyyy")}
                </span>
              </div>
              {review.comment && <p className="text-sm mt-2">{review.comment}</p>}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

