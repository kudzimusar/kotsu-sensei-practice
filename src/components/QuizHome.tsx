import { Zap, Target, FileText, Calendar as CalendarIcon, Flame, ChevronRight, MapPin, Clock, User, CalendarDays, Bell, BookOpen, Video, AlertTriangle } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

type QuizMode = 'quick' | 'focused' | 'permit' | 'license';

interface QuizHomeProps {
  onStartQuiz: (mode: QuizMode, category?: string, weakAreas?: boolean) => void;
  onContinueLearning?: () => void;
}

const QuizHome = ({ onStartQuiz, onContinueLearning }: QuizHomeProps) => {
  const { user, guestId, isGuest } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-[#F5F7FA] pt-14">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 bg-white z-10 shadow-sm">
        <div className="flex justify-end items-center px-6 py-3">
          <div className="flex items-center space-x-3">
            <button className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {isGuest ? '👤' : (profile?.full_name?.charAt(0) || 'U')}
              </span>
            </div>
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

        {/* Progress Section */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Test Ready: {testReadiness}%</h2>
              {currentStreak > 0 && (
                <div className="flex items-center bg-amber-100 px-3 py-1.5 rounded-full">
                  <Flame className="text-amber-500 mr-1.5" size={16} />
                  <p className="font-medium text-amber-700 text-xs">{currentStreak}-Day Streak 🔥</p>
                </div>
              )}
            </div>
            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${testReadiness}%` }}></div>
            </div>
            {examDate && daysRemaining !== null && daysRemaining >= 0 && (
              <div className="flex items-center mt-4">
                <CalendarIcon className="text-blue-600 mr-2" size={16} />
                <span className="text-sm text-blue-800 font-medium">
                  Your exam is in {daysRemaining} days - {format(examDate, 'MMMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Practice Options Card */}
        <section className="mb-6">
          <h2 className="font-bold text-lg mb-3">Practice Options</h2>
          <div className="bg-white rounded-2xl shadow-md p-4">
            {/* Top Grid: Quick Practice & Focused Study */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => handleQuickStart('quick')}
                style={{ background: 'var(--gradient-blue)' }}
                className="rounded-xl p-4 text-white transform transition active:scale-[0.98]"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Zap className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-base mb-1">Quick Practice</h3>
                <p className="text-xs text-white/90">10 random questions</p>
              </button>
              
              <button
                onClick={() => handleQuickStart('focused')}
                style={{ background: 'var(--gradient-purple)' }}
                className="rounded-xl p-4 text-white transform transition active:scale-[0.98]"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="font-bold text-base mb-1">Focused Study</h3>
                <p className="text-xs text-white/90">20 specific questions</p>
              </button>
            </div>
            
            {/* Full Exam Simulation */}
            <div
              style={{ background: 'var(--gradient-green)' }}
              className="rounded-xl p-4 text-white"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold text-base">Full Exam Simulation</h3>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
              </div>
              <div className="flex justify-between gap-2 mt-2">
                <button
                  onClick={() => handleQuickStart('permit')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg py-2 px-3 text-xs text-white font-medium flex-1 backdrop-blur-sm transition active:scale-[0.98]"
                >
                  50 Qs (30 min)
                </button>
                <button
                  onClick={() => handleQuickStart('license')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg py-2 px-3 text-xs text-white font-medium flex-1 backdrop-blur-sm transition active:scale-[0.98]"
                >
                  100 Qs (1 hr)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Study Tools Section */}
        <section className="mb-6">
          <h2 className="font-bold text-lg mb-3">Study Tools</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/study')}
              className="bg-white rounded-xl shadow p-3 transform transition active:scale-[0.98]"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <BookOpen className="text-indigo-600" size={20} />
              </div>
              <h3 className="font-medium text-xs">Digital Textbooks</h3>
            </button>
            
            <button
              onClick={() => navigate('/lectures')}
              className="bg-white rounded-xl shadow p-3 transform transition active:scale-[0.98]"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <Video className="text-amber-600" size={20} />
              </div>
              <h3 className="font-medium text-xs">Lectures</h3>
            </button>
            
            <button
              onClick={() => navigate('/planner')}
              className="bg-white rounded-xl shadow p-3 transform transition active:scale-[0.98]"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CalendarDays className="text-emerald-600" size={20} />
              </div>
              <h3 className="font-medium text-xs">Driving Schedule</h3>
            </button>
          </div>
        </section>

        {/* Learning Progress Section */}
        <section className="mb-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Continue Learning */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <BookOpen className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">Continue Learning</h3>
                    <div className="flex items-center">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full mr-2">
                        <div className="w-1/2 h-1.5 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">15/30</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleContinueLearning}
                  className="bg-blue-600 hover:bg-blue-700 py-1.5 px-3 rounded-lg text-white text-xs font-medium ml-2"
                >
                  Continue
                </Button>
              </div>
            </div>
            
            {/* Practice Weak Areas */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <AlertTriangle className="text-red-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">Practice Weak Areas</h3>
                    <div className="flex items-center">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full mr-2">
                        <div className="w-[65%] h-1.5 bg-red-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-500">65% Correct</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleWeakAreas}
                  className="bg-red-600 hover:bg-red-700 py-1.5 px-3 rounded-lg text-white text-xs font-medium ml-2"
                >
                  Practice
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Planner Preview */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Upcoming Schedule</h2>
            <button
              onClick={() => navigate('/planner')}
              className="text-blue-600 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-4">
            {upcomingEvent ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <p className="text-xs text-gray-500">
                      {isToday(parseISO(upcomingEvent.date)) ? 'Today' : format(parseISO(upcomingEvent.date), 'MMM d')}
                    </p>
                  </div>
                  <div className="flex items-center border-l-2 border-blue-500 pl-3 ml-1 py-1">
                    <div className="mr-3 w-10 text-xs text-gray-500">
                      {upcomingEvent.time || '9:00'}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs font-medium">
                      {upcomingEvent.title}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No upcoming events</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/planner')}
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  Add Event
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default QuizHome;
