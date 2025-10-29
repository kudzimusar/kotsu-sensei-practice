import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import TestSelectionDialog from "@/components/TestSelectionDialog";
import { Clock, CheckCircle, XCircle, Trophy } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { getTestHistory, getTestStats } from "@/lib/supabase/tests";
import { useQuery } from "@tanstack/react-query";

const Tests = () => {
  const navigate = useNavigate();
  const { user, guestId } = useAuth();
  const [showTestDialog, setShowTestDialog] = useState(false);

  const { data: testHistory = [] } = useQuery({
    queryKey: ["testHistory", user?.id, guestId],
    queryFn: () => getTestHistory(user?.id || null, guestId),
    enabled: !!user || !!guestId,
  });

  const { data: stats } = useQuery({
    queryKey: ["testStats", user?.id, guestId],
    queryFn: () => getTestStats(user?.id || null, guestId),
    enabled: !!user || !!guestId,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getTestTypeName = (type: string) => {
    switch (type) {
      case 'permit':
        return "Learner's Permit Test";
      case 'license':
        return "Driver's License Test";
      case 'quick':
        return "Quick Practice";
      case 'focused':
        return "Focused Study";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">Test History</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your progress and performance</p>
        </div>
      </header>

      <main className="px-5 py-6">
        {/* Stats Cards */}
        <section className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <p className="text-xs text-muted-foreground">Total Tests</p>
              </div>
              <p className="text-2xl font-bold">{stats?.totalTests || 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </div>
              <p className="text-2xl font-bold">{stats?.passRate || 0}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-blue-500" />
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
              <p className="text-2xl font-bold">{stats?.avgScore || 0}%</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
              <p className="text-2xl font-bold">{stats?.bestStreak || 0}</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <button
            onClick={() => setShowTestDialog(true)}
            style={{ background: 'var(--gradient-blue)' }}
            className="w-full rounded-2xl shadow-lg p-5 text-white text-left"
          >
            <h3 className="font-bold text-lg mb-1">Start New Test</h3>
            <p className="text-white/90 text-sm">Full exam simulation - timed tests</p>
          </button>
        </section>

        {/* Test History */}
        <section>
          <h2 className="text-lg font-bold mb-4">Recent Tests</h2>
          {testHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tests completed yet. Start your first test!
            </p>
          ) : (
            <div className="space-y-3">
              {testHistory.map((test) => (
                <div
                  key={test.id}
                  className="bg-white rounded-xl shadow-md p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-sm">{getTestTypeName(test.test_type)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(test.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  {test.passed ? (
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">Passed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full">
                      <XCircle className="w-3 h-3" />
                      <span className="text-xs font-medium">Failed</span>
                    </div>
                  )}
                </div>
                
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">
                        {test.score}/{test.total_questions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((test.score / test.total_questions) * 100)}% correct
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{formatTime(test.time_taken)}</span>
                    </div>
                  </div>

                  <div className="mt-3 w-full h-2 bg-gray-100 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${test.passed ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${(test.score / test.total_questions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <TestSelectionDialog open={showTestDialog} onOpenChange={setShowTestDialog} />
      <BottomNav />
    </div>
  );
};

export default Tests;
