import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Circle,
  GraduationCap,
  ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import { curriculumLectures, howToTakeLectures, lectureTimetable } from "@/data/lectureData";
import signBicycle from "@/assets/sign-bicycle.png";
import signIntersection from "@/assets/sign-intersection.png";
import signPriority from "@/assets/sign-priority.png";
import signSpeed50 from "@/assets/sign-speed-50.png";
import signNoEntry from "@/assets/sign-no-entry.png";
import signPedestrian from "@/assets/sign-pedestrian.png";
import { useAuth } from "@/hooks/useAuth";
import { getUserCurriculum, updateLectureSchedule, getCurriculumProgress, initializeCurriculumForUser } from "@/lib/supabase/curriculum";
import { getAllLessonMaterials, type LessonMaterial } from "@/lib/supabase/lessonMaterials";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TextbookSelector } from "@/components/TextbookSelector";
import { TextbookContent } from "@/components/TextbookContent";
import { ShopAndEarn } from "@/components/ShopAndEarn";

const Lectures = () => {
  const { user } = useAuth();
  const [selectedTextbook, setSelectedTextbook] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [lessonMaterials, setLessonMaterials] = useState<LessonMaterial[]>([]);
  const [progress, setProgress] = useState({ total: 26, completed: 0, scheduled: 0, notStarted: 26, percentComplete: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedLectures, setExpandedLectures] = useState<Set<number>>(new Set());

  const signImages: { [key: string]: string } = {
    "Bicycle": signBicycle,
    "Intersection": signIntersection,
    "Priority Road": signPriority,
    "Expressway": signSpeed50,
    "Road": signNoEntry,
    "Sidewalk": signPedestrian,
  };

  useEffect(() => {
    if (user) {
      loadCurriculum();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadCurriculum = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let data = await getUserCurriculum(user.id);
      
      if (!data || data.length === 0) {
        await initializeCurriculumForUser(user.id);
        data = await getUserCurriculum(user.id);
      }
      
      if (!data || data.length === 0) {
        throw new Error("Failed to initialize curriculum");
      }
      
      setCurriculum(data);
      
      const materials = await getAllLessonMaterials();
      setLessonMaterials(materials);
      
      const progressData = await getCurriculumProgress(user.id);
      setProgress(progressData);
    } catch (error: any) {
      console.error("Error loading curriculum:", error);
      toast.error(error?.message || "Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (lectureNumber: number, date: Date | undefined) => {
    if (!user || !date) return;

    try {
      const updated = await updateLectureSchedule(user.id, lectureNumber, {
        scheduled_date: format(date, "yyyy-MM-dd"),
        status: "scheduled",
      });
      
      setCurriculum(prev => prev.map(lec => 
        lec.lecture_number === lectureNumber ? { ...lec, ...updated } : lec
      ));
      
      const progressData = await getCurriculumProgress(user.id);
      setProgress(progressData);
      
      toast.success("Lecture scheduled!");
    } catch (error) {
      console.error("Error scheduling lecture:", error);
      toast.error("Failed to schedule lecture");
    }
  };

  const handleStatusToggle = async (lectureNumber: number, currentStatus: string) => {
    if (!user) return;

    const statusCycle = {
      not_started: "scheduled",
      scheduled: "completed",
      completed: "not_started",
    } as const;

    try {
      const updated = await updateLectureSchedule(user.id, lectureNumber, {
        status: statusCycle[currentStatus as keyof typeof statusCycle] as any,
      });
      
      setCurriculum(prev => prev.map(lec => 
        lec.lecture_number === lectureNumber ? { ...lec, ...updated } : lec
      ));
      
      const progressData = await getCurriculumProgress(user.id);
      setProgress(progressData);
      
      toast.success("Status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const toggleLectureExpanded = (lectureNumber: number) => {
    setExpandedLectures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lectureNumber)) {
        newSet.delete(lectureNumber);
      } else {
        newSet.add(lectureNumber);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      not_started: { label: "Not Started", className: "bg-muted text-muted-foreground hover:bg-muted" },
      scheduled: { label: "Scheduled", className: "bg-blue-500 text-white hover:bg-blue-600" },
      completed: { label: "Completed", className: "bg-green-500 text-white hover:bg-green-600" },
    };
    const variant = variants[status as keyof typeof variants] || variants.not_started;
    return <Badge className={cn(variant.className, "cursor-pointer transition-colors")}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Lectures & Study Materials
          </h1>
          <p className="text-lg text-muted-foreground">Your complete guide to Japanese driving education</p>
        </div>

        <Tabs defaultValue="textbook" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="textbook" className="text-lg">
              <BookOpen className="h-5 w-5 mr-2" />
              Textbooks
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="text-lg">
              <GraduationCap className="h-5 w-5 mr-2" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="shop" className="text-lg">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shop & Earn
            </TabsTrigger>
          </TabsList>

          {/* Textbook Tab */}
          <TabsContent value="textbook">
            {!selectedTextbook ? (
              <TextbookSelector onSelectTextbook={setSelectedTextbook} />
            ) : (
              <TextbookContent 
                textbookId={selectedTextbook} 
                onBack={() => setSelectedTextbook(null)} 
              />
            )}
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            {!user ? (
              <Card className="p-12 text-center border-2">
                <GraduationCap className="h-20 w-20 mx-auto mb-6 text-primary" />
                <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Please sign in to access your curriculum tracker
                </p>
              </Card>
            ) : loading ? (
              <Card className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold">Loading Curriculum...</h2>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Progress Overview</CardTitle>
                    <CardDescription>Track your lecture completion</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold">Overall Progress</span>
                        <span className="text-sm font-bold text-green-600">{progress.completed}/{progress.total} lectures</span>
                      </div>
                      <Progress value={progress.percentComplete} className="h-4 mb-3" />
                      <p className="text-center text-3xl font-bold text-green-600">
                        {progress.percentComplete}%
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/40 text-center">
                        <p className="text-3xl font-bold text-green-600">{progress.completed}</p>
                        <p className="text-xs font-semibold mt-1">Completed</p>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-center">
                        <p className="text-3xl font-bold text-blue-600">{progress.scheduled}</p>
                        <p className="text-xs font-semibold mt-1">Scheduled</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/40 text-center">
                        <p className="text-3xl font-bold text-muted-foreground">{progress.notStarted}</p>
                        <p className="text-xs font-semibold mt-1">Not Started</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lecture Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lecture Schedule</CardTitle>
                    <CardDescription>Manage your 26 classroom lectures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {curriculum.map((lecture) => {
                        const material = lessonMaterials.find(m => m.lecture_number === lecture.lecture_number);
                        const isExpanded = expandedLectures.has(lecture.lecture_number);
                        
                        return (
                          <div key={lecture.id} className="p-4 rounded-lg border-2 hover:border-primary transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-base px-3">
                                  Lecture {lecture.lecture_number}
                                </Badge>
                                <h3 className="font-semibold">{lecture.stage}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <CalendarIcon className="h-4 w-4 mr-2" />
                                      {lecture.scheduled_date ? format(new Date(lecture.scheduled_date), "PP") : "Schedule"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <Calendar
                                      mode="single"
                                      selected={lecture.scheduled_date ? new Date(lecture.scheduled_date) : undefined}
                                      onSelect={(date) => handleDateSelect(lecture.lecture_number, date)}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <div onClick={() => handleStatusToggle(lecture.lecture_number, lecture.status)}>
                                  {getStatusBadge(lecture.status)}
                                </div>
                              </div>
                            </div>
                            
                            {material && (
                              <div className="mt-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleLectureExpanded(lecture.lecture_number)}
                                >
                                  {isExpanded ? "Hide" : "Show"} Materials
                                </Button>
                                
                                {isExpanded && (
                                  <div className="mt-3 p-4 bg-muted/50 rounded-lg space-y-3">
                                    {material.textbook_references && material.textbook_references.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold mb-2">Textbook References:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                          {material.textbook_references.map((ref, idx) => (
                                            <li key={idx} className="text-sm">{ref}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {material.key_concepts && material.key_concepts.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold mb-2">Key Concepts:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                          {material.key_concepts.map((concept, idx) => (
                                            <li key={idx} className="text-sm">{concept}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Shop & Earn Tab */}
          <TabsContent value="shop">
            <ShopAndEarn />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Lectures;
