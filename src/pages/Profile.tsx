import BottomNav from "@/components/BottomNav";
import { User, Calendar, Target, Trophy, Settings, Bell, HelpCircle, LogOut, Info, FileText, Shield, BookOpen, Car, Clock, QrCode, Crown, CreditCard, GraduationCap, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format, differenceInDays, parseISO, isAfter } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/supabase/profiles";
import { getAllPerformance } from "@/lib/supabase/performance";
import { getTestHistory } from "@/lib/supabase/tests";
import { getMonthSchedule, autoCompletePastEvents } from "@/lib/supabase/drivingSchedule";
import { getUserCurriculum, getCurriculumProgress, autoCompletePastLectures } from "@/lib/supabase/curriculum";
import { useQuery } from "@tanstack/react-query";
import { SettingsDialog } from "@/components/SettingsDialog";
import { GoalsDialog } from "@/components/GoalsDialog";
import { SupportDialog } from "@/components/SupportDialog";
import StudyCalendar from "@/components/StudyCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { isPremium, subscription, isLoading: premiumLoading } = usePremium();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // Auto-complete past events and lectures when user loads the page
  useEffect(() => {
    if (user) {
      autoCompletePastEvents().catch(console.error);
      autoCompletePastLectures().catch(console.error);
    }
  }, [user?.id]);

  // Refresh subscription status when page is focused or mounted (in case payment just completed)
  useEffect(() => {
    if (user) {
      // Immediately check subscription on mount (direct database query)
      const checkSubscription = async () => {
        try {
          const { data: subscriptionData, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .in("status", ["active", "trialing"])
            .order("created_at", { ascending: false })
            .maybeSingle();
          
          if (!subError && subscriptionData) {
            // Force update to cache immediately
            queryClient.setQueryData(["subscription", user.id], subscriptionData);
            queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
            queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
            queryClient.refetchQueries({ queryKey: ["subscription", user.id] });
            queryClient.refetchQueries({ queryKey: ["profile", user.id] });
          } else {
            // No subscription found, still invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
            queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
            queryClient.refetchQueries({ queryKey: ["subscription", user.id] });
            queryClient.refetchQueries({ queryKey: ["profile", user.id] });
          }
        } catch (error) {
          console.error("Error checking subscription on mount:", error);
          // Still invalidate on error
          queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        }
      };
      
      checkSubscription();
      
      const handleFocus = () => {
        queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        queryClient.refetchQueries({ queryKey: ["subscription", user.id] });
        queryClient.refetchQueries({ queryKey: ["profile", user.id] });
      };
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [user?.id, queryClient]);

  // Force check and update premium status on mount
  useEffect(() => {
    if (user) {
      const forceUpdatePremiumStatus = async () => {
        try {
          console.log("🔄 Auto-checking premium status on mount for user:", user.id);
          
          // 1. Check if subscription exists
          const { data: subscriptionData, error: subError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .in("status", ["active", "trialing"])
            .order("created_at", { ascending: false })
            .maybeSingle();
          
          console.log("🔍 Auto-check subscription:", { subscriptionData, subError });
          
          if (!subError && subscriptionData) {
            // 2. Check current profile status first
            const { data: currentProfile } = await supabase
              .from("profiles")
              .select("is_premium")
              .eq("id", user.id)
              .maybeSingle();
            
            console.log("🔍 Current profile before update:", currentProfile);
            
            // 3. Force update is_premium flag directly
            const { data: updatedProfile, error: updateError } = await supabase
              .from("profiles")
              .update({ is_premium: true })
              .eq("id", user.id)
              .select()
              .single();
            
            if (updateError) {
              console.error("❌ Error updating is_premium:", updateError);
            } else {
              console.log("✅ Force-updated is_premium to true:", updatedProfile);
              
              // 4. Verify the update
              const { data: verifiedProfile } = await supabase
                .from("profiles")
                .select("is_premium")
                .eq("id", user.id)
                .maybeSingle();
              
              console.log("✅ Verified profile after auto-update:", verifiedProfile);
            }
            
            // 5. Force update React Query cache with new reference
            queryClient.setQueryData(["subscription", user.id], {
              ...subscriptionData,
              _updatedAt: Date.now(),
            });
            
            queryClient.setQueryData(["profile", user.id], {
              is_premium: true,
              _updatedAt: Date.now(),
            });
            
            // 6. Force refetch
            await queryClient.refetchQueries({ queryKey: ["subscription", user.id] });
            await queryClient.refetchQueries({ queryKey: ["profile", user.id] });
          } else if (!subError && !subscriptionData) {
            console.log("⚠️ No subscription found - setting is_premium to false");
            
            // No subscription found - ensure is_premium is false
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ is_premium: false })
              .eq("id", user.id);
            
            if (!updateError) {
              queryClient.setQueryData(["profile", user.id], {
                is_premium: false,
                _updatedAt: Date.now(),
              });
              await queryClient.refetchQueries({ queryKey: ["profile", user.id] });
            }
          } else if (subError) {
            console.error("❌ Error checking subscription on mount:", subError);
          }
        } catch (error) {
          console.error("❌ Error in forceUpdatePremiumStatus:", error);
        }
      };
      
      // Run immediately on mount
      forceUpdatePremiumStatus();
    }
  }, [user?.id, queryClient]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      // Always fetch fresh data including is_premium
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: performance = [], isLoading: performanceLoading } = useQuery({
    queryKey: ["performance", user?.id],
    queryFn: () => getAllPerformance(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: testHistory = [], isLoading: testHistoryLoading } = useQuery({
    queryKey: ["testHistory", user?.id],
    queryFn: () => getTestHistory(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch driving schedule data for the schedule card
  const currentDate = new Date();
  const { data: scheduleEvents = [], isLoading: scheduleLoading } = useQuery({
    queryKey: ["scheduleEvents", user?.id, currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: () => getMonthSchedule(user!.id, currentDate.getFullYear(), currentDate.getMonth() + 1),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch curriculum progress (26 lectures)
  const { data: curriculumProgress, isLoading: curriculumLoading } = useQuery({
    queryKey: ["curriculumProgress", user?.id],
    queryFn: () => getCurriculumProgress(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Instructor features are currently disabled
  // const { data: instructor } = useQuery({
  //   queryKey: ["instructor-profile", user?.id],
  //   queryFn: () => getInstructorByUserId(user!.id),
  //   enabled: !!user,
  // });


  const isLoading = profileLoading || performanceLoading || testHistoryLoading || scheduleLoading || curriculumLoading;

  const examDate = profile?.exam_date ? new Date(profile.exam_date) : undefined;
  const daysRemaining = examDate ? differenceInDays(examDate, new Date()) : null;

  const totalQuestions = performance.reduce((sum, p) => sum + p.total, 0);
  const questionsCompleted = totalQuestions;
  const testsPassed = testHistory.filter(t => t.passed).length;

  // Calculate driving schedule statistics for the schedule card
  const totalScheduledEvents = scheduleEvents.length;
  const completedEvents = scheduleEvents.filter(e => e.status === 'completed').length;
  const upcomingEvents = scheduleEvents.filter(e => 
    e.status === 'scheduled' && isAfter(parseISO(e.date), new Date())
  );
  const nextEvent = upcomingEvents.sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  )[0];
  
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

  // Get curriculum progress (26 lectures from user_lecture_schedule)
  const totalLessons = curriculumProgress?.total || 26;
  const lessonsCompleted = curriculumProgress?.completed || 0;
  const lessonsScheduled = curriculumProgress?.scheduled || 0;
  const lessonsNotStarted = curriculumProgress?.notStarted || 26;

  const userStats = {
    name: profile?.full_name || user?.email?.split('@')[0] || "User",
    totalQuestions: performance.reduce((sum, p) => sum + p.total, 0) || 0,
    questionsCompleted,
    testsPassed,
    currentStreak: calculateStreak(),
    totalLessons,
    lessonsCompleted,
    lessonsScheduled,
    lessonsNotStarted,
  };

  const menuItems = [
    { icon: GraduationCap, label: "Book Instructor", description: "Get personalized lessons", onClick: () => navigate('/book-instructor'), highlight: true },
    { icon: Users, label: "Practice Rooms", description: "Join group study sessions", onClick: () => navigate('/practice-rooms'), highlight: true },
    { icon: BookOpen, label: "My Bookings", description: "View your sessions", onClick: () => navigate('/my-bookings') },
    // Instructor dashboard removed - instructor features not yet implemented
    { icon: CreditCard, label: "Account", description: "Subscription & billing", onClick: () => navigate('/account'), highlight: isPremium },
    { icon: Settings, label: "Settings", description: "App preferences", onClick: () => setSettingsOpen(true) },
    { icon: Bell, label: "Notifications", description: "Manage alerts", onClick: () => setNotificationsOpen(true) },
    { icon: Target, label: "Study Goals", description: "Set daily targets", onClick: () => setGoalsOpen(true) },
    { icon: Calendar, label: "Schedule", description: "Plan your study time", onClick: () => setScheduleOpen(true) },
    { icon: HelpCircle, label: "Help & Support", description: "Get assistance", onClick: () => setSupportOpen(true) },
    { icon: Info, label: "About", description: "About this app", onClick: () => navigate('/about') },
    { icon: FileText, label: "Terms of Service", description: "Read our terms", onClick: () => navigate('/terms-of-service') },
    { icon: Shield, label: "Privacy Policy", description: "Your data protection", onClick: () => navigate('/privacy-policy') },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-base font-bold">Profile</h1>
        </div>
      </header>

      {isLoading ? (
        <main className="px-5 py-6">
          {/* Loading Skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="h-20 bg-gray-200 rounded-xl mb-4"></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            <div className="h-32 bg-white rounded-2xl shadow-md"></div>
            <div className="h-24 bg-white rounded-2xl shadow-md"></div>
          </div>
        </main>
      ) : (
        <main className="px-5 py-6">
        {/* User Card */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">{userStats.name[0]}</span>
              </div>
              <div>
                <h2 className="text-base font-bold">{userStats.name}</h2>
                <p className="text-xs text-muted-foreground">Driving Test Candidate</p>
              </div>
            </div>

            {/* Subscription Status */}
            <div className={`mb-4 rounded-xl p-3 border ${
              isPremium 
                ? "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-700" 
                : "bg-gray-50 border-gray-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {premiumLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full bg-gray-300 animate-pulse"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-500">Loading...</p>
                        <p className="text-[10px] text-gray-400">Checking subscription</p>
                      </div>
                    </>
                  ) : isPremium && subscription ? (
                    <>
                      <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          Premium {subscription.plan_type ? subscription.plan_type.charAt(0).toUpperCase() + subscription.plan_type.slice(1) : "Member"}
                        </p>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400">
                          {subscription.plan_type === "lifetime" 
                            ? "Lifetime access" 
                            : subscription.status === "trialing" && subscription.trial_end
                            ? `Trial ends ${format(new Date(subscription.trial_end), "MMM d, yyyy")}`
                            : subscription.current_period_end
                            ? `Renews ${format(new Date(subscription.current_period_end), "MMM d, yyyy")}`
                            : "Active"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-600">Free Plan</p>
                        <p className="text-[10px] text-gray-500">Upgrade for unlimited features</p>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant={isPremium ? "outline" : "default"}
                  size="sm"
                  className={`text-xs h-7 ${
                    isPremium 
                      ? "border-purple-300 text-purple-700 hover:bg-purple-100" 
                      : "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
                  }`}
                  onClick={() => {
                    if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
                      navigate("/account");
                    } else {
                      navigate("/payment");
                    }
                  }}
                >
                  {subscription && (subscription.status === "active" || subscription.status === "trialing") ? "Manage" : "Upgrade"}
                </Button>
              </div>
            </div>

            {/* QR Code Share Button - WhatsApp Business Style */}
            <button
              onClick={() => navigate('/share-referral')}
              className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-primary/10 hover:bg-primary/15 text-primary rounded-xl transition-colors"
            >
              <QrCode className="w-5 h-5" />
              <span className="font-semibold text-sm">Share & Earn Commission</span>
            </button>

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

        {/* Driving Schedule Overview */}
        {totalScheduledEvents > 0 && (
          <section className="mb-6">
            <button onClick={() => navigate('/lectures')} className="w-full text-left">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-5 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-blue-900">Driving Schedule</h3>
                      <p className="text-xs text-blue-600">{upcomingEvents.length} upcoming events</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white text-xs">
                    {completedEvents}/{totalScheduledEvents}
                  </Badge>
                </div>

                {nextEvent && (
                  <div className="bg-white/60 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-900">Next Event</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-blue-900">{nextEvent.custom_label || nextEvent.event_type}</p>
                        <p className="text-xs text-blue-700">
                          {format(parseISO(nextEvent.date), 'MMM d, yyyy')} at {nextEvent.time_slot.split('-')[0]}
                        </p>
                      </div>
                      {nextEvent.event_type === 'theory' && (
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      )}
                      {nextEvent.event_type === 'driving' && (
                        <Car className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-blue-700">
                  <span>View full schedule</span>
                  <span className="text-blue-600 font-bold">→</span>
                </div>
              </Card>
            </button>
          </section>
        )}

        {/* Progress Overview */}
        <section className="mb-6">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="font-bold text-sm mb-3">Overall Progress</h3>
            
            {/* Schedule Progress */}
            {totalLessons > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Schedule Completion</span>
                  <span className="font-bold">
                    {lessonsCompleted}/{totalLessons} lessons
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full mb-2">
                  <div 
                    className="h-3 bg-green-500 rounded-full"
                    style={{ width: `${(lessonsCompleted / totalLessons) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="text-center">
                    <span className="font-bold text-green-600">{lessonsCompleted}</span>
                    <span className="text-muted-foreground"> Completed</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-blue-600">{lessonsScheduled}</span>
                    <span className="text-muted-foreground"> Scheduled</span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-gray-600">{lessonsNotStarted}</span>
                    <span className="text-muted-foreground"> Not Started</span>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Progress */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Practice Questions</span>
                <span className="font-bold">
                  {userStats.questionsCompleted} completed
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full">
                <div 
                  className="h-3 bg-blue-500 rounded-full"
                  style={{ width: `${Math.min((userStats.questionsCompleted / 500) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Target: 500 questions for exam readiness
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
                  (item as any).highlight ? 'border-2 border-purple-200 bg-purple-50' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  (item as any).highlight ? 'bg-purple-100' : 'bg-gray-50'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    (item as any).highlight ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${(item as any).highlight ? 'text-purple-700' : ''}`}>
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
      )}

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
