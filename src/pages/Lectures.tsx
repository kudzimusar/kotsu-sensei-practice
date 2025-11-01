import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft, ExternalLink, Calendar, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { lectures, howToTakeLectures, lectureTimetable, terminology, threeElements } from "@/data/lectureData";
import { Input } from "@/components/ui/input";

interface LectureProgress {
  lectureNumber: number;
  status: "not-started" | "scheduled" | "completed";
  date?: string;
}

const Lectures = () => {
  const [lectureProgress, setLectureProgress] = useState<LectureProgress[]>(() => {
    const saved = localStorage.getItem("lectureSchedule");
    return saved ? JSON.parse(saved) : lectures.map(l => ({ lectureNumber: l.number, status: "not-started" }));
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  const saveLectureProgress = (progress: LectureProgress[]) => {
    setLectureProgress(progress);
    localStorage.setItem("lectureSchedule", JSON.stringify(progress));
  };

  const updateLectureStatus = (lectureNumber: number, status: LectureProgress["status"]) => {
    const updated = lectureProgress.map(lp =>
      lp.lectureNumber === lectureNumber ? { ...lp, status } : lp
    );
    saveLectureProgress(updated);
  };

  const updateLectureDate = (lectureNumber: number, date: Date) => {
    const updated = lectureProgress.map(lp =>
      lp.lectureNumber === lectureNumber 
        ? { ...lp, date: format(date, "yyyy-MM-dd"), status: "scheduled" as const }
        : lp
    );
    saveLectureProgress(updated);
  };

  const getLectureProgress = (lectureNumber: number) => {
    return lectureProgress.find(lp => lp.lectureNumber === lectureNumber) || 
      { lectureNumber, status: "not-started" };
  };

  const completedCount = lectureProgress.filter(lp => lp.status === "completed").length;
  const progressPercentage = (completedCount / lectures.length) * 100;

  const firstStageLectures = lectures.filter(l => l.stage === "First Stage");
  const secondStageLectures = lectures.filter(l => l.stage === "Second Stage");

  const filteredTerminology = terminology.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trackAffiliateClick = () => {
    const clicks = parseInt(localStorage.getItem("affiliateClicks") || "0");
    localStorage.setItem("affiliateClicks", (clicks + 1).toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/study">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Lectures & Textbook</h1>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>Track your classroom lecture completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedCount} of {lectures.length} lectures completed</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="textbook">Textbook</TabsTrigger>
            <TabsTrigger value="guide">How to Take</TabsTrigger>
          </TabsList>

          {/* Curriculum Tracker */}
          <TabsContent value="curriculum" className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="first-stage">
                <AccordionTrigger className="text-lg font-semibold">
                  First Stage (Lectures 1-10)
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-4">
                  {firstStageLectures.map((lecture) => {
                    const progress = getLectureProgress(lecture.number);
                    return (
                      <Card key={lecture.number}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-lg">Lecture {lecture.number}</h3>
                                  <Badge variant={
                                    progress.status === "completed" ? "default" :
                                    progress.status === "scheduled" ? "secondary" : "outline"
                                  }>
                                    {progress.status === "completed" ? "Completed" :
                                     progress.status === "scheduled" ? "Scheduled" : "Not Started"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">Pages: {lecture.pages}</p>
                                <p className="text-sm">{lecture.subject}</p>
                                {lecture.note && (
                                  <p className="text-xs text-muted-foreground mt-2 italic">Note: {lecture.note}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 flex-wrap">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {progress.date ? format(new Date(progress.date), "MMM dd, yyyy") : "Set Date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent
                                    mode="single"
                                    selected={progress.date ? new Date(progress.date) : undefined}
                                    onSelect={(date) => date && updateLectureDate(lecture.number, date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>

                              <Button
                                variant={progress.status === "completed" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateLectureStatus(
                                  lecture.number,
                                  progress.status === "completed" ? "not-started" : "completed"
                                )}
                                className="gap-2"
                              >
                                {progress.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                {progress.status === "completed" ? "Completed" : "Mark Complete"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="second-stage">
                <AccordionTrigger className="text-lg font-semibold">
                  Second Stage (Lectures 11-26)
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-4">
                  {secondStageLectures.map((lecture) => {
                    const progress = getLectureProgress(lecture.number);
                    return (
                      <Card key={lecture.number}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-lg">Lecture {lecture.number}</h3>
                                  <Badge variant={
                                    progress.status === "completed" ? "default" :
                                    progress.status === "scheduled" ? "secondary" : "outline"
                                  }>
                                    {progress.status === "completed" ? "Completed" :
                                     progress.status === "scheduled" ? "Scheduled" : "Not Started"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">Pages: {lecture.pages}</p>
                                <p className="text-sm">{lecture.subject}</p>
                                {lecture.note && (
                                  <p className="text-xs text-muted-foreground mt-2 italic">Note: {lecture.note}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 flex-wrap">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {progress.date ? format(new Date(progress.date), "MMM dd, yyyy") : "Set Date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent
                                    mode="single"
                                    selected={progress.date ? new Date(progress.date) : undefined}
                                    onSelect={(date) => date && updateLectureDate(lecture.number, date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>

                              <Button
                                variant={progress.status === "completed" ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateLectureStatus(
                                  lecture.number,
                                  progress.status === "completed" ? "not-started" : "completed"
                                )}
                                className="gap-2"
                              >
                                {progress.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                {progress.status === "completed" ? "Completed" : "Mark Complete"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Textbook */}
          <TabsContent value="textbook" className="space-y-6">
            {/* Three Elements */}
            <Card>
              <CardHeader>
                <CardTitle>{threeElements.title}</CardTitle>
                <CardDescription>{threeElements.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {threeElements.elements.map((element, index) => (
                    <Card
                      key={element.name}
                      className={`cursor-pointer transition-all ${
                        selectedElement === index ? "ring-2 ring-primary shadow-lg" : ""
                      }`}
                      onClick={() => setSelectedElement(selectedElement === index ? null : index)}
                    >
                      <CardHeader>
                        <div className="text-4xl mb-2">{element.icon}</div>
                        <CardTitle className="text-lg">{element.name}</CardTitle>
                        <CardDescription className="text-xs">{element.description}</CardDescription>
                      </CardHeader>
                      {selectedElement === index && (
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            {element.examples.map((example, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-primary">•</span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">{threeElements.feedback}</p>
              </CardContent>
            </Card>

            {/* Terminology Glossary */}
            <Card>
              <CardHeader>
                <CardTitle>Terminology Glossary</CardTitle>
                <CardDescription>Search and learn key driving terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search terminology..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredTerminology.map((item, index) => (
                    <AccordionItem key={index} value={`term-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.term}</span>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">{item.definition}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Get the Book */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>Get the Full Textbook</CardTitle>
                <CardDescription>
                  Purchase the complete "Rules of the Road" textbook for comprehensive study
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    asChild
                    onClick={trackAffiliateClick}
                  >
                    <a
                      href="https://www.amazon.co.jp/s?k=Rules+of+the+Road+Textbook"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buy on Amazon Japan
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href="https://www.npa.go.jp/policies/application/license_renewal/pdf/english.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Free Preview (PDF)
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  * Full textbook available for purchase; free preview provides basic rules and signage only.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* How to Take */}
          <TabsContent value="guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Take Classroom Lectures</CardTitle>
                <CardDescription>Important information about the lecture system</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {howToTakeLectures.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-primary font-bold">{index + 1}.</span>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lecture Timetable
                </CardTitle>
                <CardDescription>Available lecture times throughout the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {lectureTimetable.map((schedule) => (
                    <div
                      key={schedule.day}
                      className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                    >
                      <span className="font-medium">{schedule.day}</span>
                      <span className="text-sm text-muted-foreground">{schedule.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Lectures;
