import BottomNav from "@/components/BottomNav";
import StudyCalendar from "@/components/StudyCalendar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { testCategories } from "@/data/questions";
import { BookOpen, Target, TrendingUp, Calendar, GraduationCap, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { getAllPerformance } from "@/lib/supabase/performance";
import { getTestHistory } from "@/lib/supabase/tests";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { TTSButton } from "@/components/ui/tts-button";

const Study = () => {
  const today = new Date();
  const { user, guestId, isGuest } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'materials';

  // Handle tab changes and update URL
  const handleTabChange = (newTab: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', newTab);
    setSearchParams(newParams, { replace: true });
  };

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

  const totalQuestions = performance.reduce((sum, p) => sum + p.total, 0);
  const avgScore = performance.length > 0
    ? Math.round(performance.reduce((sum, p) => sum + (p.percentage || 0), 0) / performance.length)
    : 0;
  
  const calculateStreak = () => {
    if (testHistory.length === 0 && performance.length === 0) return 0;
    
    // Get all unique activity dates from test history and performance
    const activityDates = new Set<string>();
    
    // Add test dates
    testHistory.forEach(test => {
      const date = format(new Date(test.date), 'yyyy-MM-dd');
      activityDates.add(date);
    });
    
    // Add performance update dates (category_performance has updated_at)
    performance.forEach(perf => {
      if (perf.updated_at) {
        const date = format(new Date(perf.updated_at), 'yyyy-MM-dd');
        activityDates.add(date);
      }
    });
    
    if (activityDates.size === 0) return 0;
    
    // Sort dates in descending order
    const sortedDates = Array.from(activityDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    // Calculate consecutive days from today
    let streak = 0;
    const todayStr = format(today, 'yyyy-MM-dd');
    let checkDate = new Date(todayStr);
    
    for (const dateStr of sortedDates) {
      const activityDate = new Date(dateStr);
      const checkDateStr = format(checkDate, 'yyyy-MM-dd');
      
      if (dateStr === checkDateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (activityDate < checkDate) {
        // Gap found, break the streak
        break;
      }
    }
    
    return streak;
  };
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-base font-bold">Study Materials</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </header>

      <main className="px-5 py-6">
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="materials">
              <BookOpen className="w-4 h-4 mr-2" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Study Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-8">
            {/* Study Progress Overview */}
            <section>
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-sm">Your Progress</h2>
                      <TTSButton 
                        text={`Your progress: ${totalQuestions} questions studied, ${avgScore}% average score, ${calculateStreak()} day streak. Keep up the great work!`}
                        size="sm" 
                        variant="ghost" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{totalQuestions}</p>
                    <p className="text-[10px] text-muted-foreground">Questions Studied</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{avgScore}%</p>
                    <p className="text-[10px] text-muted-foreground">Average Score</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{calculateStreak()}</p>
                    <p className="text-[10px] text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Digital Textbooks */}
            <section>
              <Link to="/lectures?tab=textbook">
                <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:shadow-lg transition-shadow cursor-pointer border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <BookOpen className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Digital Textbooks</h3>
                        <p className="text-xs text-muted-foreground">Access official driving textbooks</p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold text-xs">Open →</span>
                  </div>
                </Card>
              </Link>
            </section>

            {/* Lectures & Curriculum */}
            <section>
              <Link to="/lectures?tab=curriculum">
                <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <GraduationCap className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Lectures & Curriculum</h3>
                        <p className="text-xs text-muted-foreground">Track classroom lectures & study materials</p>
                      </div>
                    </div>
                    <span className="text-primary font-bold text-xs">Open →</span>
                  </div>
                </Card>
              </Link>
            </section>

            {/* Flashcards */}
            <section>
              <Link to="/flashcards">
                <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-500/5 hover:shadow-lg transition-shadow cursor-pointer border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <CreditCard className="text-orange-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Flashcards</h3>
                        <p className="text-xs text-muted-foreground">Practice road signs & markings with visual cards</p>
                      </div>
                    </div>
                    <span className="text-orange-600 font-bold text-xs">Open →</span>
                  </div>
                </Card>
              </Link>
            </section>

            {/* Book Instructor */}
            <section>
              <Link to="/book-instructor">
                <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:shadow-lg transition-shadow cursor-pointer border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <GraduationCap className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Book an Instructor</h3>
                        <p className="text-xs text-muted-foreground">Get personalized lessons from certified instructors</p>
                      </div>
                    </div>
                    <span className="text-blue-600 font-bold text-xs">Open →</span>
                  </div>
                </Card>
              </Link>
            </section>

            {/* Study by Category */}
            <section>
              <h2 className="font-bold text-base mb-4">Study by Category</h2>
              <div className="space-y-3">
                {testCategories.map((category, idx) => (
                  <Link
                    key={category}
                    to={`/?category=${encodeURIComponent(category)}`}
                    className="block"
                  >
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            idx % 3 === 0 ? 'bg-blue-100' : idx % 3 === 1 ? 'bg-purple-100' : 'bg-green-100'
                          }`}>
                            <Target className={`w-5 h-5 ${
                              idx % 3 === 0 ? 'text-blue-600' : idx % 3 === 1 ? 'text-purple-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm line-clamp-1">{category}</h3>
                              <div onClick={(e) => e.stopPropagation()}>
                                <TTSButton 
                                  text={`Study ${category}. Practice questions in this category.`}
                                  size="sm" 
                                  variant="ghost" 
                                />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 50) + 10} questions
                            </p>
                          </div>
                        </div>
                        <span className="text-blue-600 font-bold text-xs">Practice →</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <div className="w-full overflow-hidden">
              <StudyCalendar />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Study;
