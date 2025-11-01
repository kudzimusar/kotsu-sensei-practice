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
  ArrowLeft,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { 
  textbookChapters, 
  curriculumLectures, 
  howToTakeLectures, 
  lectureTimetable, 
  terminology, 
  threeElements 
} from "@/data/lectureData";
import bookCover from "@/assets/book-cover.jpg";
import signBicycle from "@/assets/sign-bicycle.png";
import signIntersection from "@/assets/sign-intersection.png";
import signStop from "@/assets/sign-stop.png";
import signSpeed50 from "@/assets/sign-speed-50.png";
import signNoEntry from "@/assets/sign-no-entry.png";
import signPedestrian from "@/assets/sign-pedestrian.png";
import signNoParking from "@/assets/sign-no-parking.png";
import signRailway from "@/assets/sign-railway.png";
import signPriority from "@/assets/sign-priority.png";
import { useAuth } from "@/hooks/useAuth";
import { getUserCurriculum, updateLectureSchedule, getCurriculumProgress, initializeCurriculumForUser } from "@/lib/supabase/curriculum";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Lectures = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"main" | "textbook" | "curriculum">("main");
  const [searchTerm, setSearchTerm] = useState("");
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [progress, setProgress] = useState({ total: 26, completed: 0, scheduled: 0, notStarted: 26, percentComplete: 0 });
  const [loading, setLoading] = useState(true);

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
  }, [user]);

  const loadCurriculum = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let data = await getUserCurriculum(user.id);
      
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
      not_started: { label: "Not Started", className: "bg-muted text-muted-foreground hover:bg-muted" },
      scheduled: { label: "Scheduled", className: "bg-blue-500 text-white hover:bg-blue-600" },
      completed: { label: "Completed", className: "bg-green-500 text-white hover:bg-green-600" },
    };
    const variant = variants[status as keyof typeof variants] || variants.not_started;
    return <Badge className={cn(variant.className, "cursor-pointer transition-colors")}>{variant.label}</Badge>;
  };

  const filteredTerminology = terminology.filter(
    (term) =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main View
  if (view === "main") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Lectures & Study Materials
            </h1>
            <p className="text-lg text-muted-foreground">Your complete guide to Japanese driving education</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Textbook Card */}
            <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer group"
              onClick={() => setView("textbook")}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                    <BookOpen className="h-10 w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl group-hover:text-blue-600 transition-colors">
                      Driving Textbook
                    </CardTitle>
                    <CardDescription className="text-base">Rules of the Road - Complete Guide</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <img 
                  src={bookCover} 
                  alt="Rules of the Road Textbook" 
                  className="w-full h-56 object-cover rounded-xl mb-4 shadow-lg group-hover:scale-[1.02] transition-transform"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>18 Comprehensive Chapters</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Organized by Learning Steps</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>Three Elements of Driving</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md" size="lg">
                  Open Textbook <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Curriculum Tracker Card */}
            <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-400 cursor-pointer group"
              onClick={() => setView("curriculum")}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                    <GraduationCap className="h-10 w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl group-hover:text-green-600 transition-colors">
                      Curriculum Tracker
                    </CardTitle>
                    <CardDescription className="text-base">Schedule & Track Your Progress</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                {user ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold">Overall Progress</span>
                        <span className="text-sm font-bold text-green-600">{progress.completed}/{progress.total} lectures</span>
                      </div>
                      <Progress value={progress.percentComplete} className="h-4 mb-3" />
                      <p className="text-center text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {progress.percentComplete}%
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-2 border-green-200">
                        <p className="text-3xl font-bold text-green-600">{progress.completed}</p>
                        <p className="text-xs font-semibold text-green-700 mt-1">Completed</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/40 dark:to-sky-900/40 border-2 border-blue-200">
                        <p className="text-3xl font-bold text-blue-600">{progress.scheduled}</p>
                        <p className="text-xs font-semibold text-blue-700 mt-1">Scheduled</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800/40 dark:to-slate-800/40 border-2 border-gray-200">
                        <p className="text-3xl font-bold text-muted-foreground">{progress.notStarted}</p>
                        <p className="text-xs font-semibold text-muted-foreground mt-1">Not Started</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground font-medium">
                      Sign in to track your curriculum progress
                    </p>
                  </div>
                )}
                <Button className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md" size="lg">
                  Manage Curriculum <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Textbook Section */}
          <Card className="mt-8 border-4 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg">
                    <BookMarked className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Get the Full Textbook</h3>
                    <p className="text-base text-amber-700 dark:text-amber-300">Purchase the complete Rules of the Road guide</p>
                  </div>
                </div>
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg">
                  <a 
                    href="https://www.amazon.co.jp/s?k=Rules+of+the+Road+Textbook" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Buy on Amazon <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Free PDF Preview */}
          <Card className="mt-6 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Free PDF Preview</h3>
                    <p className="text-sm text-muted-foreground">View basic rules and signage guide (NPA)</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="lg" className="border-blue-300">
                  <a 
                    href="https://www.npa.go.jp/policies/application/license_renewal/pdf/english.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View PDF <ExternalLink className="ml-2 h-4 w-4" />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => setView("main")} 
            className="mb-6 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Overview
          </Button>

          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Driving Textbook
            </h1>
            <p className="text-lg text-muted-foreground">Rules of the Road - Complete Reference Guide</p>
          </div>

          {/* Table of Contents */}
          <Card className="mb-8 border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Table of Contents
              </CardTitle>
              <CardDescription className="text-base">18 chapters organized by learning steps</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="first-step" className="border-2 border-blue-100 rounded-lg px-4 mb-4">
                  <AccordionTrigger className="text-xl font-bold text-blue-700 hover:text-blue-800">
                    First Step (Chapters 1-14)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-4">
                      {textbookChapters.filter(ch => ch.step === "First Step").map((chapter) => (
                        <div key={`${chapter.step}-${chapter.chapter}`} className="p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                          <div className="flex items-start gap-4">
                            <Badge variant="outline" className="mt-1 text-base px-3 py-1 border-blue-300">
                              Ch. {chapter.chapter}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-bold text-lg text-blue-900 dark:text-blue-100">{chapter.title}</p>
                              {chapter.pages && (
                                <p className="text-sm text-muted-foreground mb-2">Pages: {chapter.pages}</p>
                              )}
                              <ul className="space-y-1 mt-2">
                                {chapter.subsections.map((sub, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>{sub}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="second-step" className="border-2 border-purple-100 rounded-lg px-4">
                  <AccordionTrigger className="text-xl font-bold text-purple-700 hover:text-purple-800">
                    Second Step (Chapters 1-18)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-4">
                      {textbookChapters.filter(ch => ch.step === "Second Step").map((chapter) => (
                        <div key={`${chapter.step}-${chapter.chapter}`} className="p-4 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all">
                          <div className="flex items-start gap-4">
                            <Badge variant="outline" className="mt-1 text-base px-3 py-1 border-purple-300">
                              Ch. {chapter.chapter}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-bold text-lg text-purple-900 dark:text-purple-100">{chapter.title}</p>
                              {chapter.pages && (
                                <p className="text-sm text-muted-foreground mb-2">Pages: {chapter.pages}</p>
                              )}
                              <ul className="space-y-1 mt-2">
                                {chapter.subsections.map((sub, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-purple-500 mt-0.5">•</span>
                                    <span>{sub}</span>
                                  </li>
                                ))}
                              </ul>
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
          <Card className="mb-8 border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Search className="h-6 w-6 text-green-600" />
                Meaning of Major Terminologies
              </CardTitle>
              <CardDescription className="text-base">Essential traffic and driving terms</CardDescription>
              <div className="mt-4">
                <Input
                  placeholder="Search terminology..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md h-12 text-base"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {["Road", "Vehicle", "Signs", "Driving"].map((category) => (
                  <AccordionItem key={category} value={category} className="border-2 border-green-100 rounded-lg px-4 mb-4">
                    <AccordionTrigger className="text-lg font-bold text-green-700 hover:text-green-800">
                      {category} Terms
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-4">
                        {filteredTerminology
                          .filter((t) => t.category === category)
                          .map((term, idx) => (
                            <div key={idx} className="p-4 rounded-xl border-2 border-green-100 hover:border-green-300 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
                              <div className="flex items-start gap-4">
                                {signImages[term.term] && (
                                  <img src={signImages[term.term]} alt={term.term} className="h-16 w-16 object-contain rounded-lg shadow-md" />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-green-700">{term.term}</h4>
                                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{term.definition}</p>
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
          <Card className="border-2 border-amber-200">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
              <CardTitle className="text-2xl">{threeElements.title}</CardTitle>
              <CardDescription className="text-base">{threeElements.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {threeElements.elements.map((element, idx) => (
                  <div key={idx} className="p-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10 hover:shadow-xl transition-all">
                    <div className="text-5xl mb-4 text-center">{element.icon}</div>
                    <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2 text-center">
                      {element.name}
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-4 text-center font-semibold">
                      {element.description}
                    </p>
                    <ul className="space-y-2">
                      {element.examples.map((ex, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5 font-bold">→</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300">
                <p className="text-center text-base font-medium text-amber-900 dark:text-amber-100">
                  <strong>Feedback Loop:</strong> {threeElements.feedback}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Curriculum View
  if (view === "curriculum") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => setView("main")} 
            className="mb-6 hover:bg-green-100 dark:hover:bg-green-900/20"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Overview
          </Button>

          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Curriculum Tracker
            </h1>
            <p className="text-lg text-muted-foreground">Schedule and track your classroom lecture progress</p>
          </div>

          {!user ? (
            <Card className="p-12 text-center border-2 border-green-200">
              <GraduationCap className="h-20 w-20 mx-auto mb-6 text-green-500" />
              <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Please sign in to access your curriculum tracker and schedule lectures
              </p>
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Sign In
              </Button>
            </Card>
          ) : (
            <>
              {/* Progress Overview */}
              <Card className="mb-8 border-2 border-green-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">Your Progress</h2>
                  <p className="text-green-100">Track your journey through all 26 lectures</p>
                </div>
                <CardContent className="pt-8 pb-8">
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200">
                      <div className="flex justify-between mb-4">
                        <span className="text-lg font-bold">Overall Completion</span>
                        <span className="text-lg font-bold text-green-600">{progress.completed} / {progress.total} lectures</span>
                      </div>
                      <Progress value={progress.percentComplete} className="h-6 mb-4" />
                      <p className="text-center text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {progress.percentComplete}% Complete
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-6 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-4 border-green-300 text-center">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                        <p className="text-4xl font-bold text-green-600 mb-2">{progress.completed}</p>
                        <p className="text-sm font-bold text-green-700">Completed</p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 dark:from-blue-900/40 dark:to-sky-900/40 border-4 border-blue-300 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                        <p className="text-4xl font-bold text-blue-600 mb-2">{progress.scheduled}</p>
                        <p className="text-sm font-bold text-blue-700">Scheduled</p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800/40 dark:to-slate-800/40 border-4 border-gray-300 text-center">
                        <Circle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-4xl font-bold text-muted-foreground mb-2">{progress.notStarted}</p>
                        <p className="text-sm font-bold text-muted-foreground">Not Started</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How to Take Classroom Lectures */}
              <Card className="mb-8 border-2 border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <FileText className="h-6 w-6 text-amber-600" />
                    How to Take Classroom Lectures
                  </CardTitle>
                  <CardDescription className="text-base">Important guidelines for completing your curriculum</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {howToTakeLectures.map((instruction, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200">
                        <Badge className="mt-0.5 bg-amber-500 text-white">{idx + 1}</Badge>
                        <p className="text-sm leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-2 border-blue-200">
                    <h3 className="text-lg font-bold mb-4 text-blue-900 dark:text-blue-100">📅 Lecture Timetable</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {lectureTimetable.map((slot, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white dark:bg-gray-900 border-2 border-blue-200 text-center">
                          <p className="font-bold text-blue-700">{slot.day}</p>
                          <p className="text-sm text-muted-foreground">{slot.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contents of Classroom Lectures */}
              <Card className="border-2 border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                    Contents of Classroom Lectures
                  </CardTitle>
                  <CardDescription className="text-base">All 26 lectures organized by stages</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full" defaultValue="first-stage">
                    {/* First Stage */}
                    <AccordionItem value="first-stage" className="border-2 border-green-100 rounded-lg px-4 mb-6">
                      <AccordionTrigger className="text-xl font-bold text-green-700 hover:text-green-800">
                        First Stage (Lectures 1-10)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {curriculum.filter(l => l.stage === "First Stage").map((lecture) => {
                            const curriculumInfo = curriculumLectures.find(cl => cl.number === lecture.lecture_number);
                            return (
                              <div key={lecture.id} className="p-5 rounded-xl border-2 border-green-200 hover:border-green-400 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-lg px-4 py-2 border-green-400 font-bold">
                                      Lecture {lecture.lecture_number}
                                    </Badge>
                                    {lecture.scheduled_date && (
                                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                        📅 {format(new Date(lecture.scheduled_date), "MMM d, yyyy")}
                                      </Badge>
                                    )}
                                  </div>
                                  <div 
                                    onClick={() => handleStatusToggle(lecture.lecture_number, lecture.status)}
                                  >
                                    {getStatusBadge(lecture.status)}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <h3 className="font-bold text-lg text-green-900 dark:text-green-100 mb-1">
                                    {curriculumInfo?.subject}
                                  </h3>
                                  {curriculumInfo?.pages && (
                                    <p className="text-sm text-muted-foreground">Pages: {curriculumInfo.pages}</p>
                                  )}
                                  {curriculumInfo?.note && (
                                    <p className="text-sm text-amber-600 mt-1 flex items-start gap-1">
                                      <span>⚠️</span>
                                      <span>{curriculumInfo.note}</span>
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex-1">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Schedule Date
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={lecture.scheduled_date ? new Date(lecture.scheduled_date) : undefined}
                                        onSelect={(date) => handleDateSelect(lecture.lecture_number, date)}
                                        initialFocus
                                        className="pointer-events-auto"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Second Stage */}
                    <AccordionItem value="second-stage" className="border-2 border-purple-100 rounded-lg px-4">
                      <AccordionTrigger className="text-xl font-bold text-purple-700 hover:text-purple-800">
                        Second Stage (Lectures 11-26)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {curriculum.filter(l => l.stage === "Second Stage").map((lecture) => {
                            const curriculumInfo = curriculumLectures.find(cl => cl.number === lecture.lecture_number);
                            return (
                              <div key={lecture.id} className="p-5 rounded-xl border-2 border-purple-200 hover:border-purple-400 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-lg px-4 py-2 border-purple-400 font-bold">
                                      Lecture {lecture.lecture_number}
                                    </Badge>
                                    {lecture.scheduled_date && (
                                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                        📅 {format(new Date(lecture.scheduled_date), "MMM d, yyyy")}
                                      </Badge>
                                    )}
                                  </div>
                                  <div 
                                    onClick={() => handleStatusToggle(lecture.lecture_number, lecture.status)}
                                  >
                                    {getStatusBadge(lecture.status)}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100 mb-1">
                                    {curriculumInfo?.subject}
                                  </h3>
                                  {curriculumInfo?.pages && (
                                    <p className="text-sm text-muted-foreground">Pages: {curriculumInfo.pages}</p>
                                  )}
                                  {curriculumInfo?.note && (
                                    <p className="text-sm text-amber-600 mt-1 flex items-start gap-1">
                                      <span>⚠️</span>
                                      <span>{curriculumInfo.note}</span>
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex-1">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Schedule Date
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={lecture.scheduled_date ? new Date(lecture.scheduled_date) : undefined}
                                        onSelect={(date) => handleDateSelect(lecture.lecture_number, date)}
                                        initialFocus
                                        className="pointer-events-auto"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Lectures;
