import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getApprovedInstructors, type Instructor } from "@/lib/supabase/instructors";
import { ArrowLeft, Star, Globe, DollarSign } from "lucide-react";

const BookInstructor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      const data = await getApprovedInstructors();
      setInstructors(data);
    } catch (error) {
      console.error("Error loading instructors:", error);
      toast({
        title: "Error",
        description: "Failed to load instructors",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Book an Instructor</h1>
            <p className="text-muted-foreground mt-2">
              Choose from our professional driving instructors
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-6 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded" />
                </Card>
              ))}
            </div>
          ) : instructors.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No instructors available at the moment.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {instructors.map((instructor) => (
                <Card key={instructor.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{instructor.name}</h3>
                      {instructor.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">
                            {instructor.rating.toFixed(1)} ({instructor.total_sessions || 0} sessions)
                          </span>
                        </div>
                      )}
                    </div>

                    {instructor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {instructor.bio}
                      </p>
                    )}

                    <div className="space-y-2">
                      {instructor.languages && instructor.languages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {instructor.languages.join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          ¥{instructor.hourly_rate.toLocaleString()}/hour
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => toast({
                        title: "Coming Soon",
                        description: "Booking functionality will be available soon!",
                      })}
                    >
                      Book Session
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookInstructor;
