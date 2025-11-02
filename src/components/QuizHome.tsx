import { Zap, Target, FileText, Calendar as CalendarIcon, Flame, ChevronRight, MapPin, Clock, User } from "lucide-react";
import { testCategories } from "@/data/questions";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, parseISO, isPast, isToday } from "date-fns";
import { loadProgress, getWeakCategories } from "@/lib/progressTracking";
import { useAuth } from "@/hooks/useAuth";
import { getEvents } from "@/lib/supabase/events";
import { getAllPerformance } from "@/lib/supabase/performance";
import { getUpcomingEvent } from "@/lib/supabase/drivingSchedule";
import { getTestHistory } from "@/lib/supabase/tests";
import { getProfile } from "@/lib/supabase/profiles";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type QuizMode = 'quick' | 'focused' | 'permit' | 'license';

interface QuizHomeProps {
  onStartQuiz: (mode: QuizMode, category?: string, weakAreas?: boolean) => void;
  onContinueLearning?: () => void;
}

const QuizHome = ({ onStartQuiz, onContinueLearning }: QuizHomeProps) => {
  const { user, guestId, isGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModes, setShowModes] = useState(false);
  const [examDate, setExamDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem('examDate');
    return saved ? new Date(saved) : undefined;
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: () => getEvents(user!.id),
    enabled: !!user,
  });

  const { data: performance = [] } = useQuery({
    queryKey: ["performance", user?.id],
    queryFn: () => getAllPerformance(user!.id),
    enabled: !!user,
  });

  const { data: testHistory = [] } = useQuery({
    queryKey: ["testHistory", user?.id, guestId],
    queryFn: () => getTestHistory(user?.id || null, guestId),
    enabled: !!user || !!guestId,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  const { data: upcomingDrivingEvent } = useQuery({
    queryKey: ["upcomingDrivingEvent", user?.id],
    queryFn: () => getUpcomingEvent(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Get next upcoming event (combine calendar and driving schedule)
  const upcomingCalendarEvent = events
    .filter(e => !isPast(parseISO(e.date)) || isToday(parseISO(e.date)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0];

  const upcomingEvent = (() => {
    if (!upcomingCalendarEvent && !upcomingDrivingEvent) return null;
    if (!upcomingCalendarEvent) return {
      ...upcomingDrivingEvent!,
      title: upcomingDrivingEvent!.custom_label || (upcomingDrivingEvent!.event_type === 'theory' ? `学科${upcomingDrivingEvent!.lecture_number}` : upcomingDrivingEvent!.event_type),
      time: upcomingDrivingEvent!.time_slot.split('-')[0],
      description: upcomingDrivingEvent!.notes || '',
      isDrivingSchedule: true
    };
    if (!upcomingDrivingEvent) return upcomingCalendarEvent;
    
    const calendarDate = parseISO(upcomingCalendarEvent.date);
    const drivingDate = parseISO(upcomingDrivingEvent.date);
    
    if (drivingDate < calendarDate) {
      return {
        ...upcomingDrivingEvent,
        title: upcomingDrivingEvent.custom_label || (upcomingDrivingEvent.event_type === 'theory' ? `学科${upcomingDrivingEvent.lecture_number}` : upcomingDrivingEvent.event_type),
        time: upcomingDrivingEvent.time_slot.split('-')[0],
        description: upcomingDrivingEvent.notes || '',
        isDrivingSchedule: true
      };
    }
    return upcomingCalendarEvent;
  })();

  // Calculate test readiness based on performance
  const testReadiness = performance.length > 0
    ? Math.round(performance.reduce((sum, p) => sum + (p.percentage || 0), 0) / performance.length)
    : 0;

  // Calculate streak
  const calculateStreak = () => {
    if (testHistory.length === 0 && performance.length === 0) return 0;
    
    const activityDates = new Set<string>();
    
    testHistory.forEach(test => {
      const date = format(new Date(test.date), 'yyyy-MM-dd');
      activityDates.add(date);
    });
    
    performance.forEach(perf => {
      if (perf.updated_at) {
        const date = format(new Date(perf.updated_at), 'yyyy-MM-dd');
        activityDates.add(date);
      }
    });
    
    if (activityDates.size === 0) return 0;
    
    const sortedDates = Array.from(activityDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    let streak = 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let checkDate = new Date(todayStr);
    
    for (const dateStr of sortedDates) {
      const activityDate = new Date(dateStr);
      const checkDateStr = format(checkDate, 'yyyy-MM-dd');
      
      if (dateStr === checkDateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (activityDate < checkDate) {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
      setShowModes(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (examDate) {
      localStorage.setItem('examDate', examDate.toISOString());
    }
  }, [examDate]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowModes(true);
  };

  const handleModeSelect = (mode: QuizMode) => {
    onStartQuiz(mode, selectedCategory || undefined);
  };

  const handleQuickStart = (mode: QuizMode) => {
    // Start quiz immediately with random category
    const randomCategory = testCategories[Math.floor(Math.random() * testCategories.length)];
    onStartQuiz(mode, randomCategory);
  };

  const handleBack = () => {
    setShowModes(false);
    setSelectedCategory(null);
  };

  const handleContinueLearning = () => {
    const progress = loadProgress();
    if (progress && onContinueLearning) {
      onContinueLearning();
    } else {
      // No saved progress, start a quick practice
      handleQuickStart('quick');
    }
  };

  const handleWeakAreas = () => {
    const weakCategories = getWeakCategories();
    if (weakCategories.length > 0) {
      // Start focused study on weak areas
      onStartQuiz('focused', undefined, true);
    } else {
      // No weak areas detected, start regular focused study
      handleQuickStart('focused');
    }
  };

  const daysRemaining = examDate ? differenceInDays(examDate, new Date()) : null;

  if (showModes) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] px-5 py-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 text-xs text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            ← Back to Categories
          </button>

          <h2 className="text-base font-bold mb-2">{selectedCategory}</h2>
          <p className="text-xs text-muted-foreground mb-6">Choose Practice Mode</p>

          <div className="space-y-4">
            <button
              onClick={() => handleModeSelect('quick')}
              style={{ background: 'var(--gradient-blue)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white flex justify-between items-center transform transition hover:scale-[1.02]"
            >
              <div className="text-left">
                <h3 className="font-bold text-sm mb-1">Quick Practice</h3>
                <p className="text-white/90 text-xs">10 Questions</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
            </button>

            <button
              onClick={() => handleModeSelect('focused')}
              style={{ background: 'var(--gradient-purple)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white flex justify-between items-center transform transition hover:scale-[1.02]"
            >
              <div className="text-left">
                <h3 className="font-bold text-sm mb-1">Focused Study</h3>
                <p className="text-white/90 text-xs">20 Questions on specific category</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
            </button>

            <div
              style={{ background: 'var(--gradient-green)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <h3 className="font-bold text-sm">Full Exam Simulation</h3>
                  <p className="text-white/90 text-[10px]">Timed practice tests</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleModeSelect('permit')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2.5 px-3 text-xs text-white font-medium flex-1 text-center transition"
                >
                  <div className="font-bold mb-0.5">Learner's Permit</div>
                  <div className="text-white/80">50 Qs (30 min)</div>
                </button>
                <button
                  onClick={() => handleModeSelect('license')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2.5 px-3 text-xs text-white font-medium flex-1 text-center transition"
                >
                  <div className="font-bold mb-0.5">Driver's License</div>
                  <div className="text-white/80">100 Qs (1 hr)</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-base font-bold">
              {isGuest 
                ? "Welcome, Guest!" 
                : `Welcome back, ${profile?.gender === 'male' ? 'Mr' : profile?.gender === 'female' ? 'Miss' : ''} ${profile?.full_name?.split(' ').pop() || 'User'}!`
              }
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {isGuest ? '👤' : (profile?.full_name?.charAt(0) || 'U')}
            </span>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 pb-24">
        {/* Guest Banner */}
        {isGuest && (
          <section className="mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-blue-900 mb-1">
                    Try Before You Sign Up!
                  </h3>
                  <p className="text-xs text-blue-700 mb-3">
                    You're using guest mode. Sign up to save your progress, track results, and access premium features. Guest data expires in 7 days.
                  </p>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Create Free Account
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}
        {/* Main Action Cards */}
        <section className="mb-8">
          <div className="space-y-4">
            <button
              onClick={() => handleQuickStart('quick')}
              style={{ background: 'var(--gradient-blue)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white flex justify-between items-center transform transition hover:scale-[1.02]"
            >
              <div className="text-left">
                <h3 className="font-bold text-sm mb-1">Quick Practice</h3>
                <p className="text-white/90 text-xs">10 Questions • Random topics</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
            </button>

            <button
              onClick={() => handleQuickStart('focused')}
              style={{ background: 'var(--gradient-purple)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white flex justify-between items-center transform transition hover:scale-[1.02]"
            >
              <div className="text-left">
                <h3 className="font-bold text-sm mb-1">Focused Study</h3>
                <p className="text-white/90 text-xs">20 Questions • Mixed difficulty</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
            </button>

            <div
              style={{ background: 'var(--gradient-green)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <h3 className="font-bold text-sm">Full Exam Simulation</h3>
                  <p className="text-white/90 text-[10px]">Timed practice tests</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickStart('permit')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2.5 px-3 text-xs text-white font-medium flex-1 text-center transition"
                >
                  <div className="font-bold mb-0.5">Learner's Permit</div>
                  <div className="text-white/80">50 Qs (30 min)</div>
                </button>
                <button
                  onClick={() => handleQuickStart('license')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2.5 px-3 text-xs text-white font-medium flex-1 text-center transition"
                >
                  <div className="font-bold mb-0.5">Driver's License</div>
                  <div className="text-white/80">100 Qs (1 hr)</div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Event */}
        {upcomingEvent && (
          <section className="mb-8">
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="text-indigo-600" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-indigo-600 text-white text-[10px]">
                      {format(parseISO(upcomingEvent.date), 'MMM d, yyyy')}
                    </Badge>
                    {isToday(parseISO(upcomingEvent.date)) && (
                      <Badge className="bg-green-600 text-white text-[10px]">Today</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-indigo-900 text-sm mb-1">
                    {upcomingEvent.title}
                  </h3>
                  <div className="space-y-1 text-xs text-indigo-700">
                    {upcomingEvent.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{upcomingEvent.time}</span>
                      </div>
                    )}
                    {upcomingEvent.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{upcomingEvent.location}</span>
                      </div>
                    )}
                    {upcomingEvent.instructor && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{upcomingEvent.instructor}</span>
                      </div>
                    )}
                    {upcomingEvent.description && (
                      <p className="mt-2 text-[10px] opacity-80">{upcomingEvent.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Exam Date Reminder */}
        <section className="mb-8">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full bg-amber-50 border border-amber-200 rounded-2xl shadow-md p-4 flex items-center text-left hover:bg-amber-100 transition">
                <div className="mr-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="text-amber-600" size={24} />
                </div>
                <div className="flex-1">
                  {examDate ? (
                    <>
                      <h3 className="font-bold text-amber-800 text-xs">
                        Exam Date: {format(examDate, 'MMMM d, yyyy')}
                      </h3>
                      <p className="text-amber-700 text-[10px]">
                        {daysRemaining !== null && daysRemaining >= 0 
                          ? `${daysRemaining} days remaining` 
                          : daysRemaining !== null && daysRemaining < 0
                          ? `${Math.abs(daysRemaining)} days overdue`
                          : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-amber-800 text-xs">Set Your Exam Date</h3>
                      <p className="text-amber-700 text-[10px]">Click to choose a date</p>
                    </>
                  )}
                </div>
                <ChevronRight className="text-amber-600" size={20} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={examDate}
                onSelect={setExamDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </section>

        {/* Progress */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-sm">Test Ready: {testReadiness}%</h2>
              {currentStreak > 0 && (
                <div className="flex items-center bg-amber-100 px-3 py-1.5 rounded-full">
                  <Flame className="text-amber-500 mr-1.5" size={14} />
                  <p className="font-medium text-amber-700 text-[10px]">{currentStreak}-Day Streak 🔥</p>
                </div>
              )}
            </div>
            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${testReadiness}%` }}></div>
            </div>
          </div>
        </section>

        {/* Continue Learning & Weak Areas */}
        <section>
          <h2 className="font-bold text-base mb-4">Continue Learning</h2>
          <div className="space-y-4">
            <button
              onClick={handleContinueLearning}
              className="w-full bg-white rounded-2xl shadow-md overflow-hidden text-left transform transition hover:scale-[1.02]"
            >
              <div className="h-32 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">🚦</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Continue Where You Left Off</h3>
                  <span className="text-blue-700 font-bold text-xs">Resume</span>
                </div>
                <p className="text-muted-foreground text-xs mb-3">Pick up your last practice session</p>
                <div className="bg-blue-600 py-2.5 px-4 rounded-lg text-white text-xs font-medium flex items-center justify-center">
                  <ChevronRight size={16} className="mr-1" />
                  Continue Learning
                </div>
              </div>
            </button>

            <button
              onClick={handleWeakAreas}
              className="w-full bg-white rounded-2xl shadow-md overflow-hidden text-left transform transition hover:scale-[1.02]"
            >
              <div className="h-32 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">⚠️</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm">Practice Weak Areas</h3>
                  <span className="text-red-700 font-bold text-xs">Focus</span>
                </div>
                <p className="text-muted-foreground text-xs mb-3">Work on categories where you need improvement</p>
                <div className="bg-red-600 py-2.5 px-4 rounded-lg text-white text-xs font-medium flex items-center justify-center">
                  <ChevronRight size={16} className="mr-1" />
                  Practice Weak Areas
                </div>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-3">
          <div className="flex flex-col items-center text-blue-600">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-xs">Study</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Tests</span>
          </div>
          <div className="flex flex-col items-center text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </nav>

      <BottomNav />
    </div>
  );
};

export default QuizHome;
