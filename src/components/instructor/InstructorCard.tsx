import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Video, Users, Languages } from "lucide-react";
import type { Instructor } from "@/lib/supabase/instructors";
import { calculateDistance, formatDistance } from "@/lib/location/distance";

interface InstructorCardProps {
  instructor: Instructor;
  userLocation?: { lat: number; lon: number } | null;
}

export function InstructorCard({ instructor, userLocation }: InstructorCardProps) {
  const navigate = useNavigate();
  
  let distance: string | null = null;
  if (userLocation && instructor.location_coordinates) {
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      instructor.location_coordinates.y,
      instructor.location_coordinates.x
    );
    distance = formatDistance(dist);
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/instructor/${instructor.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{instructor.full_name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{instructor.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({instructor.total_reviews} {instructor.total_reviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Languages className="h-4 w-4 text-muted-foreground" />
          {instructor.languages.map((lang) => (
            <Badge key={lang} variant="outline" className="capitalize text-xs">
              {lang}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {instructor.available_for_video && (
            <Badge variant="outline" className="text-xs">
              <Video className="h-3 w-3 mr-1" />
              Video
            </Badge>
          )}
          {instructor.available_for_in_person && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              In-Person
            </Badge>
          )}
          {instructor.available_for_practice_rooms && (
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Practice Rooms
            </Badge>
          )}
        </div>

        {instructor.location_prefecture && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {instructor.location_prefecture}
              {instructor.location_city && `, ${instructor.location_city}`}
              {distance && ` • ${distance} away`}
            </span>
          </div>
        )}

        {instructor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{instructor.bio}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-1">
            {instructor.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs capitalize">
                {spec.replace(/_/g, " ")}
              </Badge>
            ))}
            {instructor.specializations.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{instructor.specializations.length - 3} more
              </Badge>
            )}
          </div>
          <Button size="sm" onClick={(e) => {
            e.stopPropagation();
            navigate(`/instructor/${instructor.id}`);
          }}>
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

