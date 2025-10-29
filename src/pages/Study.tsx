import BottomNav from "@/components/BottomNav";
import StudyCalendar from "@/components/StudyCalendar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { testCategories } from "@/data/questions";
import { BookOpen, Target, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Study = () => {
  const today = new Date();
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-xl font-bold">Study Materials</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </header>

      <main className="px-5 py-6">
        <Tabs defaultValue="materials" className="w-full">
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
                  <div>
                    <h2 className="font-bold text-lg">Your Progress</h2>
                    <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">127</p>
                    <p className="text-xs text-muted-foreground">Questions Studied</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">78%</p>
                    <p className="text-xs text-muted-foreground">Average Score</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">7</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* Study by Category */}
            <section>
              <h2 className="font-bold text-xl mb-4">Study by Category</h2>
              <div className="space-y-3">
                {testCategories.map((category, idx) => (
                  <Link
                    key={category}
                    to={`/?category=${encodeURIComponent(category)}`}
                    className="block"
                  >
                    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            idx % 3 === 0 ? 'bg-blue-100' : idx % 3 === 1 ? 'bg-purple-100' : 'bg-green-100'
                          }`}>
                            <Target className={`w-5 h-5 ${
                              idx % 3 === 0 ? 'text-blue-600' : idx % 3 === 1 ? 'text-purple-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm line-clamp-1">{category}</h3>
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

          <TabsContent value="calendar">
            <StudyCalendar />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Study;
