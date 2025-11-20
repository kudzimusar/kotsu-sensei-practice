import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getPracticeRoomById, getPracticeRoomParticipants } from "@/lib/supabase/practiceRooms";
import { getInstructorById } from "@/lib/supabase/instructors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Video, MapPin, Calendar, Clock, Users, GraduationCap, ExternalLink } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { format, parseISO, isAfter } from "date-fns";

export default function PracticeRoomDetails() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: room, isLoading } = useQuery({
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
  const isParticipant = !!userParticipant;
  const isPaid = userParticipant?.payment_status === 'paid';
  const roomDateTime = room ? parseISO(`${room.scheduled_date}T${room.scheduled_time}`) : null;
  const isUpcoming = roomDateTime ? isAfter(roomDateTime, new Date()) : false;

  if (isLoading) {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-base font-bold">{room.title}</h1>
                <p className="text-xs text-muted-foreground">Practice Room Details</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={room.status === 'open' ? 'default' : room.status === 'full' ? 'destructive' : 'secondary'}>
              {room.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {isParticipant && (
              <Badge variant={isPaid ? 'default' : 'outline'}>
                {isPaid ? 'Paid' : 'Payment Pending'}
              </Badge>
            )}
          </div>

          {/* Main Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructor && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Instructor</p>
                    <p className="text-sm text-muted-foreground">{instructor.full_name}</p>
                  </div>
                </div>
              )}

              {room.description && (
                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="text-sm font-medium">
                      {roomDateTime ? format(roomDateTime, "MMM d, yyyy 'at' h:mm a") : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{room.duration_minutes} minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  {room.session_type === 'video' ? (
                    <Video className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium capitalize">{room.session_type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Participants</p>
                    <p className="text-sm font-medium">
                      {room.current_participants}/{room.max_participants}
                    </p>
                  </div>
                </div>
              </div>

              {room.session_type === 'video' && room.video_call_link && isPaid && isUpcoming && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">Video Call Link</p>
                      <p className="text-xs text-muted-foreground">Join the session when it starts</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(room.video_call_link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Call
                    </Button>
                  </div>
                </div>
              )}

              {room.session_type === 'in_person' && room.meeting_address && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Meeting Location</p>
                  <p className="text-sm text-muted-foreground">{room.meeting_address}</p>
                </div>
              )}

              {room.topic_focus.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Topics Covered</p>
                  <div className="flex flex-wrap gap-2">
                    {room.topic_focus.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          {isParticipant && !isPaid && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Required</CardTitle>
                <CardDescription>Complete payment to secure your spot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">¥{room.price_per_participant_yen.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">per participant</p>
                  </div>
                  <Button onClick={() => navigate(`/practice-room/${roomId}/payment`)}>
                    Complete Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!isParticipant && room.status === 'open' && isUpcoming && (
            <Button
              className="w-full"
              onClick={async () => {
                try {
                  const { joinPracticeRoom } = await import("@/lib/supabase/practiceRooms");
                  await joinPracticeRoom(roomId!);
                  navigate(`/practice-room/${roomId}/payment`);
                } catch (error: any) {
                  console.error("Error joining room:", error);
                  // Still navigate to payment if already a participant
                  navigate(`/practice-room/${roomId}/payment`);
                }
              }}
            >
              Join Practice Room
            </Button>
          )}
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

