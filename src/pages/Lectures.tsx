import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  Search,
  ArrowRight,
  BookMarked,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { lectures, howToTakeLectures, lectureTimetable, terminology, threeElements } from "@/data/lectureData";
import bookCover from "@/assets/book-cover.jpg";
import signBicycle from "@/assets/sign-bicycle.png";
import signIntersection from "@/assets/sign-intersection.png";
import signStop from "@/assets/sign-stop.png";
import signSpeed50 from "@/assets/sign-speed-50.png";
import signNoEntry from "@/assets/sign-no-entry.png";
import signPedestrian from "@/assets/sign-pedestrian.png";
import { useAuth } from "@/hooks/useAuth";
import { getUserCurriculum, updateLectureSchedule, getCurriculumProgress, initializeCurriculumForUser } from "@/lib/supabase/curriculum";
import { toast } from "sonner";

const Lectures = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"main" | "textbook" | "curriculum">("main");
  const [searchTerm, setSearchTerm] = useState("");
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [progress, setProgress] = useState({ total: 26, completed: 0, scheduled: 0, notStarted: 26, percentComplete: 0 });
  const [loading, setLoading] = useState(true);

  // Sign images for terminology
  const signImages: { [key: string]: string } = {
    "Bicycle": signBicycle,
    "Intersection": signIntersection,
    "Priority Road": signStop,
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
  }, [user]);

  const loadCurriculum = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let data = await getUserCurriculum(user.id);
      
      // If no curriculum exists, initialize it
      if (!data || data.length === 0) {
        await initializeCurriculumForUser(user.id);
        data = await getUserCurriculum(user.id);
      }
      
      setCurriculum(data);
      const progressData = await getCurriculumProgress(user.id);
      setProgress(progressData);
    } catch (error) {
      console.error("Error loading curriculum:", error);
      toast.error("Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (lectureNumber: number, date: Date | undefined) => {
    if (!user || !date) return;

    try {
      await updateLectureSchedule(user.id, lectureNumber, {
        scheduled_date: format(date, "yyyy-MM-dd"),
        status: "scheduled",
      });
      await loadCurriculum();
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
      await updateLectureSchedule(user.id, lectureNumber, {
        status: statusCycle[currentStatus as keyof typeof statusCycle] as any,
      });
      await loadCurriculum();
      toast.success("Status updated!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
      scheduled: { label: "Scheduled", className: "bg-blue-500 text-white" },
      completed: { label: "Completed", className: "bg-green-500 text-white" },
    };
    const variant = variants[status as keyof typeof variants] || variants.not_started;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const filteredTerminology = terminology.filter(
    (term) =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main View
  if (view === "main") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lectures & Study Materials
            </h1>
            <p className="text-muted-foreground">Your complete guide to Japanese driving education</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Textbook Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group"
              onClick={() => setView("textbook")}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      Driving Textbook
                    </CardTitle>
                    <CardDescription>Rules of the Road - Complete Guide</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <img 
                  src={bookCover} 
                  alt="Rules of the Road Textbook" 
                  className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
                />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>26 Comprehensive Chapters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>50+ Traffic Terminology</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Three Elements of Driving</span>
                  </div>
                </div>
                <Button className="w-full mt-4 group-hover:bg-primary" variant="outline">
                  Open Textbook <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Curriculum Tracker Card */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group"
              onClick={() => setView("curriculum")}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      Curriculum Tracker
                    </CardTitle>
                    <CardDescription>Schedule & Track Your Progress</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">{progress.completed}/{progress.total} lectures</span>
                      </div>
                      <Progress value={progress.percentComplete} className="h-3" />
                      <p className="text-center mt-2 text-2xl font-bold text-primary">{progress.percentComplete}%</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-2xl font-bold text-green-600">{progress.completed}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-2xl font-bold text-blue-600">{progress.scheduled}</p>
                        <p className="text-xs text-muted-foreground">Scheduled</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-2xl font-bold text-muted-foreground">{progress.notStarted}</p>
                        <p className="text-xs text-muted-foreground">Not Started</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Sign in to track your curriculum progress
                  </p>
                )}
                <Button className="w-full mt-4 group-hover:bg-primary" variant="outline">
                  Manage Curriculum <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Textbook Section */}
          <Card className="mt-6 border-2 border-dashed border-primary/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BookMarked className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Get the Full Textbook</h3>
                    <p className="text-sm text-muted-foreground">Purchase the complete Rules of the Road guide</p>
                  </div>
                </div>
                <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                  <a 
                    href="https://www.amazon.co.jp/s?k=Rules+of+the+Road+Textbook" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Buy on Amazon <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Textbook View
  if (view === "textbook") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button variant="ghost" onClick={() => setView("main")} className="mb-4">
            ← Back to Overview
          </Button>

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Driving Textbook
            </h1>
            <p className="text-muted-foreground">Rules of the Road - Complete Reference Guide</p>
          </div>

          {/* Table of Contents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Table of Contents
              </CardTitle>
              <CardDescription>All 26 chapters organized by learning stages</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="first-stage">
                  <AccordionTrigger className="text-lg font-semibold">
                    First Stage (Lectures 1-10)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {lectures.filter(l => l.stage === "First Stage").map((lecture) => (
                        <div key={lecture.number} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">{lecture.number}</Badge>
                            <div className="flex-1">
                              <p className="font-medium">{lecture.subject}</p>
                              <p className="text-sm text-muted-foreground">Pages: {lecture.pages}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="second-stage">
                  <AccordionTrigger className="text-lg font-semibold">
                    Second Stage (Lectures 11-26)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {lectures.filter(l => l.stage === "Second Stage").map((lecture) => (
                        <div key={lecture.number} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">{lecture.number}</Badge>
                            <div className="flex-1">
                              <p className="font-medium">{lecture.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {lecture.pages ? `Pages: ${lecture.pages}` : "Emergency First Aid textbook"}
                              </p>
                              {lecture.note && (
                                <p className="text-xs text-amber-600 mt-1">⚠️ {lecture.note}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Terminology Glossary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Major Terminology Glossary
              </CardTitle>
              <CardDescription>50+ essential traffic and driving terms</CardDescription>
              <div className="mt-4">
                <Input
                  placeholder="Search terminology..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {["Road", "Vehicle", "Signs", "Driving"].map((category) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-lg font-semibold">
                      {category} Terms
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {filteredTerminology
                          .filter((t) => t.category === category)
                          .map((term, idx) => (
                            <div key={idx} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                              <div className="flex items-start gap-3">
                                {signImages[term.term] && (
                                  <img src={signImages[term.term]} alt={term.term} className="h-12 w-12 object-contain" />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-primary">{term.term}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{term.definition}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Three Elements of Driving */}
          <Card>
            <CardHeader>
              <CardTitle>{threeElements.title}</CardTitle>
              <CardDescription>{threeElements.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {threeElements.elements.map((element, idx) => (
                  <Card key={idx} className="border-2 hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="text-4xl mb-2">{element.icon}</div>
                      <CardTitle className="text-xl">{element.name}</CardTitle>
                      <CardDescription>{element.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {element.examples.map((example, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Circle className="h-3 w-3 mt-1 fill-primary text-primary" />
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Feedback Loop:</strong> {threeElements.feedback}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Free Preview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Free Preview - NPA Traffic Rules Guide</CardTitle>
              <CardDescription>Basic rules and signage from National Police Agency</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                src="https://www.npa.go.jp/policies/application/license_renewal/pdf/english.pdf"
                className="w-full h-[600px] rounded-lg border"
                title="NPA Traffic Rules Guide"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Full textbook available for purchase. This is a preview only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Curriculum View
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => setView("main")} className="mb-4">
            ← Back to Overview
          </Button>
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Sign in to Track Your Progress</h2>
              <p className="text-muted-foreground mb-6">
                Create an account to schedule lectures and track your curriculum progress
              </p>
              <Button onClick={() => window.location.href = "/auth"}>
                Sign In / Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => setView("main")} className="mb-4">
          ← Back to Overview
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Curriculum Tracker
          </h1>
          <p className="text-muted-foreground">Schedule and track your classroom lectures</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-lg font-semibold">Overall Progress</span>
                  <span className="text-lg font-bold text-primary">{progress.percentComplete}%</span>
                </div>
                <Progress value={progress.percentComplete} className="h-4" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <p className="text-3xl font-bold text-green-600">{progress.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <p className="text-3xl font-bold text-blue-600">{progress.scheduled}</p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
                <div className="p-4 rounded-lg bg-muted border">
                  <p className="text-3xl font-bold text-muted-foreground">{progress.notStarted}</p>
                  <p className="text-sm text-muted-foreground">Not Started</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Take Lectures */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              How to Take Classroom Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="guidelines">
                <AccordionTrigger>Important Guidelines</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {howToTakeLectures.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-1 text-primary" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timetable">
                <AccordionTrigger>Weekly Timetable</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {lectureTimetable.map((slot, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-card">
                        <p className="font-semibold">{slot.day}</p>
                        <p className="text-sm text-muted-foreground">{slot.time}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Lecture Schedule */}
        <Accordion type="multiple" defaultValue={["first-stage", "second-stage"]} className="space-y-4">
          {/* First Stage */}
          <Card>
            <AccordionItem value="first-stage" className="border-none">
              <CardHeader>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <CardTitle>First Stage</CardTitle>
                      <CardDescription>Lectures 1-10</CardDescription>
                    </div>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-3">
                  {loading ? (
                    <p className="text-center text-muted-foreground">Loading...</p>
                  ) : (
                    curriculum
                      .filter((l) => l.stage === "First Stage")
                      .map((item) => {
                        const lectureInfo = lectures.find((l) => l.number === item.lecture_number);
                        return (
                          <div key={item.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">Lecture {item.lecture_number}</Badge>
                                  {getStatusBadge(item.status)}
                                </div>
                                <h4 className="font-semibold">{lectureInfo?.subject}</h4>
                                <p className="text-sm text-muted-foreground">Pages: {lectureInfo?.pages}</p>
                                {item.scheduled_date && (
                                  <p className="text-sm text-primary mt-1">
                                    📅 {format(new Date(item.scheduled_date), "PPP")}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <CalendarIcon className="h-4 w-4 mr-2" />
                                      {item.scheduled_date ? "Reschedule" : "Schedule"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={item.scheduled_date ? new Date(item.scheduled_date) : undefined}
                                      onSelect={(date) => handleDateSelect(item.lecture_number, date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusToggle(item.lecture_number, item.status)}
                                >
                                  Toggle Status
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>

          {/* Second Stage */}
          <Card>
            <AccordionItem value="second-stage" className="border-none">
              <CardHeader>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <CardTitle>Second Stage</CardTitle>
                      <CardDescription>Lectures 11-26</CardDescription>
                    </div>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-3">
                  {loading ? (
                    <p className="text-center text-muted-foreground">Loading...</p>
                  ) : (
                    curriculum
                      .filter((l) => l.stage === "Second Stage")
                      .map((item) => {
                        const lectureInfo = lectures.find((l) => l.number === item.lecture_number);
                        return (
                          <div key={item.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">Lecture {item.lecture_number}</Badge>
                                  {getStatusBadge(item.status)}
                                </div>
                                <h4 className="font-semibold">{lectureInfo?.subject}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {lectureInfo?.pages ? `Pages: ${lectureInfo.pages}` : "Emergency First Aid textbook"}
                                </p>
                                {lectureInfo?.note && (
                                  <p className="text-xs text-amber-600 mt-1">⚠️ {lectureInfo.note}</p>
                                )}
                                {item.scheduled_date && (
                                  <p className="text-sm text-primary mt-1">
                                    📅 {format(new Date(item.scheduled_date), "PPP")}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <CalendarIcon className="h-4 w-4 mr-2" />
                                      {item.scheduled_date ? "Reschedule" : "Schedule"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={item.scheduled_date ? new Date(item.scheduled_date) : undefined}
                                      onSelect={(date) => handleDateSelect(item.lecture_number, date)}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusToggle(item.lecture_number, item.status)}
                                >
                                  Toggle Status
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>
        </Accordion>
      </div>
    </div>
  );
};

export default Lectures;
