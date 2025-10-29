import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { BookOpen, Target, TrendingUp, Clock } from "lucide-react";
import { testCategories } from "@/data/questions";

const Study = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const studyTopics = [
    { 
      title: "Road Signs & Markings", 
      progress: 65, 
      icon: "🚦",
      questions: 50,
      category: testCategories[0]
    },
    { 
      title: "Traffic Rules", 
      progress: 45, 
      icon: "📋",
      questions: 75,
      category: testCategories[1]
    },
    { 
      title: "Safety & Regulations", 
      progress: 80, 
      icon: "⚠️",
      questions: 60,
      category: testCategories[2]
    },
  ];

  const handleTopicClick = (category: string) => {
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">Study Materials</h1>
          <p className="text-sm text-muted-foreground mt-1">Master each topic step by step</p>
        </div>
      </header>

      <main className="px-5 py-6">
        {/* Stats Overview */}
        <section className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">63%</p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">185</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">12h</p>
              <p className="text-xs text-muted-foreground">Study Time</p>
            </div>
          </div>
        </section>

        {/* Study Topics */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4">Topics</h2>
          <div className="space-y-4">
            {studyTopics.map((topic) => (
              <button
                key={topic.title}
                onClick={() => handleTopicClick(topic.category)}
                className="w-full bg-white rounded-2xl shadow-md p-5 text-left transform transition hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{topic.icon}</span>
                    <div>
                      <h3 className="font-bold text-base">{topic.title}</h3>
                      <p className="text-xs text-muted-foreground">{topic.questions} questions</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    topic.progress >= 70 ? 'text-green-600' : 
                    topic.progress >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {topic.progress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      topic.progress >= 70 ? 'bg-green-500' : 
                      topic.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${topic.progress}%` }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* All Categories */}
        <section>
          <h2 className="text-lg font-bold mb-4">All Test Categories</h2>
          <div className="space-y-3">
            {testCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleTopicClick(category)}
                className="w-full bg-white rounded-xl shadow-md p-4 text-left flex justify-between items-center transform transition hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium line-clamp-1">{category}</span>
                </div>
                <span className="text-blue-600 text-xs">Practice →</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Study;
