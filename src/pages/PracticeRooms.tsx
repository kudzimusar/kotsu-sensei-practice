import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getAvailablePracticeRooms, getUserPracticeRooms } from "@/lib/supabase/practiceRooms";
import { getInstructorById } from "@/lib/supabase/instructors";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Video, MapPin, Calendar, Clock, Search, GraduationCap } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { format, parseISO, isAfter } from "date-fns";
import type { PracticeRoom } from "@/lib/supabase/practiceRooms";

export default function PracticeRooms() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    session_type: "" as "" | "video" | "in_person",
    language: "" as "" | "english" | "japanese" | "both",
  });

  const { data: availableRooms = [], isLoading } = useQuery({
    queryKey: ["practice-rooms", filters],
    queryFn: () => getAvailablePracticeRooms({
      session_type: filters.session_type || undefined,
      language: filters.language || undefined,
    }),
  });

  const { data: myRooms = [] } = useQuery({
    queryKey: ["my-practice-rooms", user?.id],
    queryFn: () => getUserPracticeRooms(),
    enabled: !!user,
  });

  const filteredRooms = availableRooms.filter((room) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        room.title.toLowerCase().includes(term) ||
        room.description?.toLowerCase().includes(term) ||
        room.topic_focus.some(t => t.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold">Practice Rooms</h1>
                <p className="text-sm text-muted-foreground">
                  Join group study sessions with other students
                </p>
              </div>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search practice rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="browse">Browse Rooms ({filteredRooms.length})</TabsTrigger>
              <TabsTrigger value="my-rooms">My Rooms ({myRooms.length})</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-3">
              <Select
                value={filters.session_type}
                onValueChange={(v) => setFilters({ ...filters, session_type: v as any })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in_person">In-Person</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.language}
                onValueChange={(v) => setFilters({ ...filters, language: v as any })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Languages</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Browse Tab */}
            <TabsContent value="browse">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredRooms.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No practice rooms available.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRooms.map((room) => (
                    <PracticeRoomCard
                      key={room.id}
                      room={room}
                      onJoin={() => {}}
                      isJoining={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Rooms Tab */}
            <TabsContent value="my-rooms">
              {myRooms.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">You haven't joined any practice rooms yet.</p>
                    <Button className="mt-4" onClick={() => setActiveTab("browse")}>
                      Browse Rooms
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRooms.map((room) => (
                    <PracticeRoomCard
                      key={room.id}
                      room={room}
                      onJoin={() => {}}
                      isJoining={false}
                      isJoined={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}

interface PracticeRoomCardProps {
  room: PracticeRoom;
  onJoin: () => void;
  isJoining: boolean;
  isJoined?: boolean;
}

function PracticeRoomCard({ room, onJoin, isJoining, isJoined }: PracticeRoomCardProps) {
  const navigate = useNavigate();
  const { data: instructor } = useQuery({
    queryKey: ["instructor", room.instructor_id],
    queryFn: () => getInstructorById(room.instructor_id),
    enabled: !!room.instructor_id,
  });

  const roomDateTime = parseISO(`${room.scheduled_date}T${room.scheduled_time}`);
  const isUpcoming = isAfter(roomDateTime, new Date());
  const spotsRemaining = room.max_participants - room.current_participants;
  const isFull = room.current_participants >= room.max_participants;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{room.title}</CardTitle>
            {instructor && (
              <CardDescription>
                with {instructor.full_name}
              </CardDescription>
            )}
          </div>
          <Badge variant={isFull ? "destructive" : "default"}>
            {isFull ? "Full" : `${spotsRemaining} spots left`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {room.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(roomDateTime, "MMM d, yyyy 'at' h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{room.duration_minutes} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            {room.session_type === 'video' ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="capitalize">{room.session_type.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{room.current_participants}/{room.max_participants} participants</span>
          </div>
        </div>

        {room.topic_focus.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.topic_focus.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-lg font-bold">¥{room.price_per_participant_yen.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per student</p>
          </div>
          {isJoined ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/practice-room/${room.id}`)}
            >
              View Details
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate(`/practice-room/${room.id}`)}
              disabled={isFull || !isUpcoming}
            >
              {isFull ? "Full" : "View Details"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

