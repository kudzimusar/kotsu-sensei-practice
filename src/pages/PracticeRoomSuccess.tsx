import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getPracticeRoomById } from "@/lib/supabase/practiceRooms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function PracticeRoomSuccess() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: room } = useQuery({
    queryKey: ["practice-room", roomId],
    queryFn: () => getPracticeRoomById(roomId!),
    enabled: !!roomId,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-center min-h-screen">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                You've successfully joined the practice room
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {room && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">{room.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Check your email for confirmation details
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/practice-rooms")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Rooms
                </Button>
                {roomId && (
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/practice-room/${roomId}`)}
                  >
                    View Details
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

