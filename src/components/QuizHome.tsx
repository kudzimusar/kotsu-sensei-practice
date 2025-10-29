import { Zap, Target, FileText, Calendar, Flame, ChevronRight } from "lucide-react";
import { testCategories } from "@/data/questions";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

type QuizMode = 'quick' | 'focused' | 'full';

interface QuizHomeProps {
  onStartQuiz: (mode: QuizMode, category?: string) => void;
}

const QuizHome = ({ onStartQuiz }: QuizHomeProps) => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showModes, setShowModes] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
      setShowModes(true);
    }
  }, [searchParams]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowModes(true);
  };

  const handleModeSelect = (mode: QuizMode) => {
    onStartQuiz(mode, selectedCategory || undefined);
  };

  const handleBack = () => {
    setShowModes(false);
    setSelectedCategory(null);
  };

  if (showModes) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] px-5 py-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            ← Back to Categories
          </button>

          <h2 className="text-xl font-bold mb-2">{selectedCategory}</h2>
          <p className="text-sm text-muted-foreground mb-6">Choose Practice Mode</p>

          <div className="space-y-4">
            <button
              onClick={() => handleModeSelect('quick')}
              style={{ background: 'var(--gradient-blue)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white flex justify-between items-center transform transition hover:scale-[1.02]"
            >
              <div className="text-left">
                <h3 className="font-bold text-lg mb-1">Quick Practice</h3>
                <p className="text-white/90 text-sm">10 Questions</p>
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
                <h3 className="font-bold text-lg mb-1">Focused Study</h3>
                <p className="text-white/90 text-sm">20 Questions on specific category</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
            </button>

            <button
              onClick={() => handleModeSelect('full')}
              style={{ background: 'var(--gradient-green)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white transform transition hover:scale-[1.02]"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <h3 className="font-bold text-lg">Full Exam Simulation</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg py-2 px-3 text-sm text-white font-medium flex-1 text-center">
                  50 Qs (30 min)
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg py-2 px-3 text-sm text-white font-medium flex-1 text-center">
                  100 Qs (1 hr)
                </div>
              </div>
            </button>
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
            <h1 className="text-xl font-bold">Welcome back, Akira!</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">A</span>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 pb-24">
        {/* Main Action Cards */}
        <section className="mb-8">
          <div className="space-y-4">
            <button
              onClick={() => handleCategorySelect(testCategories[0])}
              style={{ background: 'var(--gradient-blue)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white flex justify-between items-center transform transition hover:scale-[1.02]"
            >
              <div className="text-left">
                <h3 className="font-bold text-lg mb-1">Quick Practice</h3>
                <p className="text-white/90 text-sm">10 Questions</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
            </button>

            <button
              onClick={() => handleCategorySelect(testCategories[1] || testCategories[0])}
              style={{ background: 'var(--gradient-purple)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white flex justify-between items-center transform transition hover:scale-[1.02]"
            >
              <div className="text-left">
                <h3 className="font-bold text-lg mb-1">Focused Study</h3>
                <p className="text-white/90 text-sm">20 Questions on specific category</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
            </button>

            <button
              onClick={() => handleCategorySelect(testCategories[0])}
              style={{ background: 'var(--gradient-green)' }}
              className="w-full rounded-2xl shadow-lg p-5 text-white transform transition hover:scale-[1.02]"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <h3 className="font-bold text-lg">Full Exam Simulation</h3>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg py-2 px-3 text-sm text-white font-medium flex-1 text-center">
                  50 Qs (30 min)
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg py-2 px-3 text-sm text-white font-medium flex-1 text-center">
                  100 Qs (1 hr)
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Exam Date Reminder */}
        <section className="mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-md p-4 flex items-center">
            <div className="mr-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 text-sm">Exam Date: June 15, 2023</h3>
              <p className="text-amber-700 text-xs">21 days remaining</p>
            </div>
          </div>
        </section>

        {/* Progress */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Test Ready: 75%</h2>
              <div className="flex items-center bg-amber-100 px-3 py-1.5 rounded-full">
                <Flame className="text-amber-500 mr-1.5" size={16} />
                <p className="font-medium text-amber-700 text-xs">7-Day Streak 🔥</p>
              </div>
            </div>
            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </section>

        {/* Continue Learning */}
        <section>
          <h2 className="font-bold text-xl mb-4">Continue Learning</h2>
          <div className="space-y-4">
            {testCategories.slice(0, 2).map((category, idx) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="w-full bg-white rounded-2xl shadow-md overflow-hidden text-left transform transition hover:scale-[1.02]"
              >
                <div className={`h-32 ${idx === 0 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-red-400 to-red-600'} flex items-center justify-center`}>
                  <span className="text-white text-4xl font-bold">{idx === 0 ? '🚦' : '⚠️'}</span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm line-clamp-1">{category}</h3>
                    <span className={`${idx === 0 ? 'text-blue-700' : 'text-red-700'} font-bold text-xs`}>
                      {idx === 0 ? '5/10' : '65%'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                    <div className={`h-2 ${idx === 0 ? 'bg-blue-500' : 'bg-red-500'} rounded-full`} style={{ width: idx === 0 ? '50%' : '65%' }}></div>
                  </div>
                  <div className={`${idx === 0 ? 'bg-blue-600' : 'bg-red-600'} py-2.5 px-4 rounded-lg text-white text-xs font-medium flex items-center justify-center`}>
                    <ChevronRight size={16} className="mr-1" />
                    {idx === 0 ? 'Continue Learning' : 'Practice Weak Area'}
                  </div>
                </div>
              </button>
            ))}
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
