import BottomNav from "@/components/BottomNav";
import { User, Calendar, Target, Trophy, Settings, Bell, HelpCircle, LogOut, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { getProfile } from "@/lib/supabase/profiles";
import { getAllPerformance } from "@/lib/supabase/performance";
import { getTestHistory } from "@/lib/supabase/tests";
import { useQuery } from "@tanstack/react-query";
import { SettingsDialog } from "@/components/SettingsDialog";
import { GoalsDialog } from "@/components/GoalsDialog";
import { SupportDialog } from "@/components/SupportDialog";
import StudyCalendar from "@/components/StudyCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      console.log('Admin check:', { data, error, userId: user.id });
      const hasAdminRole = data?.some(role => role.role === 'admin' || role.role === 'moderator');
      setIsAdmin(hasAdminRole);
    };
    checkAdminStatus();
  }, [user]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  const { data: performance = [] } = useQuery({
    queryKey: ["performance", user?.id],
    queryFn: () => getAllPerformance(user!.id),
    enabled: !!user,
  });

  const { data: testHistory = [] } = useQuery({
    queryKey: ["testHistory", user?.id],
    queryFn: () => getTestHistory(user!.id),
    enabled: !!user,
  });

  const examDate = profile?.exam_date ? new Date(profile.exam_date) : undefined;
  const daysRemaining = examDate ? differenceInDays(examDate, new Date()) : null;

  const totalQuestions = performance.reduce((sum, p) => sum + p.total, 0);
  const questionsCompleted = totalQuestions;
  const testsPassed = testHistory.filter(t => t.passed).length;
  
  // Calculate current streak
  const calculateStreak = () => {
    if (testHistory.length === 0) return 0;
    let streak = 0;
    for (const test of testHistory) {
      if (test.passed) streak++;
      else break;
    }
    return streak;
  };

  const userStats = {
    name: profile?.full_name || user?.email?.split('@')[0] || "User",
    totalQuestions: 387, // Total available questions
    questionsCompleted,
    testsPassed,
    currentStreak: calculateStreak(),
  };

  const menuItems = [
    { icon: Settings, label: "Settings", description: "App preferences", onClick: () => setSettingsOpen(true) },
    { icon: Bell, label: "Notifications", description: "Manage alerts", onClick: () => setNotificationsOpen(true) },
    { icon: Target, label: "Study Goals", description: "Set daily targets", onClick: () => setGoalsOpen(true) },
    { icon: Calendar, label: "Schedule", description: "Plan your study time", onClick: () => setScheduleOpen(true) },
    { icon: HelpCircle, label: "Help & Support", description: "Get assistance", onClick: () => setSupportOpen(true) },
    ...(isAdmin ? [{ 
      icon: Sparkles, 
      label: "AI Question Generator", 
      description: "Generate new questions with AI", 
      onClick: () => navigate('/admin/generate'),
      isAdmin: true 
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-base font-bold">Profile</h1>
        </div>
      </header>

      <main className="px-5 py-6">
        {/* User Card */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">{userStats.name[0]}</span>
              </div>
              <div>
                <h2 className="text-base font-bold">{userStats.name}</h2>
                <p className="text-xs text-muted-foreground">Driving Test Candidate</p>
              </div>
            </div>

            {/* Exam Date */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-amber-600" />
                <div>
                  {examDate ? (
                    <>
                      <p className="font-bold text-amber-800 text-xs">
                        Exam: {format(examDate, 'MMMM d, yyyy')}
                      </p>
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
                      <p className="font-bold text-amber-800 text-xs">No exam date set</p>
                      <p className="text-amber-700 text-[10px]">Set your exam date on the home screen</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Trophy className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-bold">{userStats.testsPassed}</p>
                <p className="text-[10px] text-muted-foreground">Tests Passed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Target className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-bold">{userStats.questionsCompleted}</p>
                <p className="text-[10px] text-muted-foreground">Questions Done</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-amber-500 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
                </svg>
                <p className="text-sm font-bold">{userStats.currentStreak}</p>
                <p className="text-[10px] text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Overview */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="font-bold text-sm mb-3">Overall Progress</h3>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Questions Completed</span>
                <span className="font-bold">
                  {userStats.questionsCompleted}/{userStats.totalQuestions}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full">
                <div 
                  className="h-3 bg-blue-500 rounded-full"
                  style={{ width: `${(userStats.questionsCompleted / userStats.totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {Math.round((userStats.questionsCompleted / userStats.totalQuestions) * 100)}% complete
            </p>
          </div>
        </section>

        {/* Menu Items */}
        <section>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left transform transition hover:scale-[1.01] ${
                  (item as any).isAdmin ? 'border-2 border-purple-200 bg-purple-50' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  (item as any).isAdmin ? 'bg-purple-100' : 'bg-gray-50'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    (item as any).isAdmin ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${(item as any).isAdmin ? 'text-purple-700' : ''}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            <button 
              onClick={signOut}
              className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left border border-red-200 transform transition hover:scale-[1.01]"
            >
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-red-600">Sign Out</p>
                <p className="text-xs text-red-400">Log out of your account</p>
              </div>
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
      
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <SettingsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <GoalsDialog open={goalsOpen} onOpenChange={setGoalsOpen} />
      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Study Schedule</DialogTitle>
          </DialogHeader>
          <StudyCalendar />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
