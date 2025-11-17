import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInstructorById, getInstructorPricing, getInstructorAvailability } from "@/lib/supabase/instructors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Star, Calendar, Video, MapPin, Users, Languages, Award } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { format } from "date-fns";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function InstructorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: instructor, isLoading: instructorLoading } = useQuery({
    queryKey: ["instructor", id],
    queryFn: () => getInstructorById(id!),
    enabled: !!id,
  });

  const { data: pricing = [], isLoading: pricingLoading } = useQuery({
    queryKey: ["instructor-pricing", id],
    queryFn: () => getInstructorPricing(id!),
    enabled: !!id && !!instructor,
  });

  const { data: availability = [], isLoading: availabilityLoading } = useQuery({
    queryKey: ["instructor-availability", id],
    queryFn: () => getInstructorAvailability(id!),
    enabled: !!id && !!instructor,
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
          <h2 className="text-2xl font-bold mb-2">Instructor not found</h2>
          <p className="text-muted-foreground mb-4">This instructor profile does not exist or is not available.</p>
          <Button onClick={() => navigate("/book-instructor")}>Browse Instructors</Button>
        </div>
      </div>
    );
  }

  const videoPricing = pricing.filter(p => p.session_type === 'video' && p.booking_type === 'one_on_one');
  const inPersonPricing = pricing.filter(p => p.session_type === 'in_person' && p.booking_type === 'one_on_one');
  const practiceRoomPricing = pricing.filter(p => p.booking_type === 'practice_room');

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base font-bold">Instructor Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Instructor Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{instructor.full_name}</CardTitle>
                <div className="flex items-center gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{instructor.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({instructor.total_reviews} {instructor.total_reviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{instructor.years_experience} years experience</span>
                  </div>
                </div>
                <CardDescription className="text-base">{instructor.bio || "No bio available."}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {instructor.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="capitalize">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Specializations</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {instructor.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="capitalize">
                      {spec.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Available For</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {instructor.available_for_video && (
                    <Badge variant="outline">Video Sessions</Badge>
                  )}
                  {instructor.available_for_in_person && (
                    <Badge variant="outline">In-Person Sessions</Badge>
                  )}
                  {instructor.available_for_practice_rooms && (
                    <Badge variant="outline">
                      Practice Rooms (Max {instructor.max_practice_room_size} students)
                    </Badge>
                  )}
                </div>
              </div>

              {instructor.location_prefecture && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Location</span>
                  </div>
                  <p className="text-sm">
                    {instructor.location_prefecture}
                    {instructor.location_city && `, ${instructor.location_city}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tables */}
        {!pricingLoading && pricing.length > 0 && (
          <div className="space-y-4">
            {videoPricing.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Session Pricing (1-on-1)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Duration</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videoPricing.map((price) => (
                          <tr key={price.id} className="border-b">
                            <td className="p-2">{price.duration_minutes} minutes</td>
                            <td className="p-2 text-right font-semibold">¥{price.price_yen.toLocaleString()}</td>
                            <td className="p-2 text-right">
                              <Button
                                size="sm"
                                onClick={() => navigate(`/book-instructor/${id}?type=video&duration=${price.duration_minutes}`)}
                              >
                                Book
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {inPersonPricing.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    In-Person Session Pricing (1-on-1)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Duration</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inPersonPricing.map((price) => (
                          <tr key={price.id} className="border-b">
                            <td className="p-2">{price.duration_minutes} minutes</td>
                            <td className="p-2 text-right font-semibold">¥{price.price_yen.toLocaleString()}</td>
                            <td className="p-2 text-right">
                              <Button
                                size="sm"
                                onClick={() => navigate(`/book-instructor/${id}?type=in_person&duration=${price.duration_minutes}`)}
                              >
                                Book
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {practiceRoomPricing.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Practice Room Pricing (Group Sessions)
                  </CardTitle>
                  <CardDescription>
                    Join group study sessions with other students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Duration</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-right p-2">Price per Student</th>
                          <th className="text-right p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {practiceRoomPricing.map((price) => (
                          <tr key={price.id} className="border-b">
                            <td className="p-2">{price.duration_minutes} minutes</td>
                            <td className="p-2 capitalize">{price.session_type.replace('_', ' ')}</td>
                            <td className="p-2 text-right font-semibold">¥{price.price_yen.toLocaleString()}</td>
                            <td className="p-2 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/practice-rooms?instructor=${id}`)}
                              >
                                View Rooms
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Availability */}
        {!availabilityLoading && availability.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const dayAvailability = availability.filter(a => a.day_of_week === dayIndex);
                  if (dayAvailability.length === 0) return null;
                  
                  return (
                    <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
                      <div className="w-24 font-medium">{day}</div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {dayAvailability.map((avail) => (
                          <Badge key={avail.id} variant="outline">
                            {avail.start_time} - {avail.end_time} ({avail.session_type})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>
              {instructor.total_reviews === 0
                ? "No reviews yet. Be the first to review this instructor!"
                : `${instructor.total_reviews} ${instructor.total_reviews === 1 ? 'review' : 'reviews'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instructor.total_reviews === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                This instructor hasn't received any reviews yet.
              </p>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Reviews feature coming soon. Average rating: {instructor.rating.toFixed(1)}/5.0
              </p>
            )}
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div className="sticky bottom-20 bg-background border-t pt-4 pb-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate(`/book-instructor/${id}`)}
          >
            Book a Session
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

