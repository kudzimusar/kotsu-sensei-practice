import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Crown, AlertCircle, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { checkAndIncrementUsage } from "@/lib/subscription/usageTracker";
import { Paywall } from "@/components/Paywall";

interface AIQuestion {
  id: string;
  question: string;
  answer: boolean;
  explanation: string;
  test_category: string;
  difficulty_level: string;
  language: string;
  figure_url: string | null;
  created_at: string;
}

interface QuestionPractice {
  question: AIQuestion;
  userAnswer: boolean | null;
  showExplanation: boolean;
}

export function AIQuestionGenerator() {
  const { user } = useAuth();
  const { isPremium, usageLimits, isLoading: premiumLoading } = usePremium();
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState("traffic-rules");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState("5");
  const [concept, setConcept] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<QuestionPractice[]>([]);
  const [practiceMode, setPracticeMode] = useState(false);

  const { data: aiQuestions = [], refetch } = useQuery({
    queryKey: ["ai-questions", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_questions')
        .select('*')
        .eq('status', 'approved')
        .eq('test_category', category)
        .eq('language', 'en')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as AIQuestion[];
    }
  });

  const handleGenerate = async () => {
    if (!concept.trim()) {
      toast.error("Please enter a concept to generate questions about");
      return;
    }

    if (!user) {
      toast.error("Please sign in to generate questions");
      return;
    }

    const questionCount = parseInt(count);
    
    if (!isPremium) {
      const usageCheck = await checkAndIncrementUsage(user.id, "ai_questions", questionCount);
      
      if (!usageCheck.allowed) {
        toast.error(`You've reached your daily limit of ${usageCheck.limit} questions. Upgrade to Premium for unlimited questions!`);
        setShowPaywall(true);
        return;
      }
    }

    setIsGenerating(true);
    
    const timeoutId = setTimeout(() => {
      setIsGenerating(false);
      toast.error("Request timed out. Please try again.");
    }, 60000);

    try {
      if (isPremium) {
        await checkAndIncrementUsage(user.id, "ai_questions", questionCount);
      }

      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          category,
          difficulty,
          count: questionCount,
          language: 'en',
          concept: concept.trim()
        }
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate questions');
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'No data returned from API');
      }

      toast.success(`Successfully generated ${data.count} questions!`);
      
      if (data.questions && data.questions.length > 0) {
        const practiceSetup: QuestionPractice[] = data.questions.map((q: AIQuestion) => ({
          question: q,
          userAnswer: null,
          showExplanation: false
        }));
        setPracticeQuestions(practiceSetup);
        setPracticeMode(true);
      }
      
      setConcept("");
      refetch();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error generating questions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (index: number, answer: boolean) => {
    setPracticeQuestions(prev => prev.map((pq, i) => 
      i === index ? { ...pq, userAnswer: answer, showExplanation: true } : pq
    ));
  };

  const resetPractice = () => {
    setPracticeQuestions([]);
    setPracticeMode(false);
  };

  const getScore = () => {
    const answered = practiceQuestions.filter(pq => pq.userAnswer !== null);
    const correct = answered.filter(pq => pq.userAnswer === pq.question.answer);
    return { answered: answered.length, correct: correct.length, total: practiceQuestions.length };
  };

  if (practiceMode && practiceQuestions.length > 0) {
    const score = getScore();
    const allAnswered = score.answered === score.total;

    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold">{score.correct} / {score.total}</p>
            </div>
            <Button variant="outline" size="sm" onClick={resetPractice}>
              <RotateCcw className="w-4 h-4 mr-1" />
              New Questions
            </Button>
          </div>
          {allAnswered && (
            <p className="text-sm font-medium mt-2">
              {score.correct === score.total ? "🎉 Perfect score!" : 
               score.correct >= score.total * 0.7 ? "👍 Great job!" : 
               "Keep practicing!"}
            </p>
          )}
        </div>

        <div className="flex-1 p-4 space-y-6">
          {practiceQuestions.map((pq, index) => (
            <div 
              key={pq.question.id} 
              className={`pb-6 border-b last:border-b-0 ${
                pq.showExplanation 
                  ? pq.userAnswer === pq.question.answer 
                    ? "bg-green-50/30 dark:bg-green-900/10 -mx-4 px-4 py-4 rounded-lg" 
                    : "bg-red-50/30 dark:bg-red-900/10 -mx-4 px-4 py-4 rounded-lg"
                  : ""
              }`}
            >
              <p className="font-medium text-base leading-relaxed mb-4">
                {index + 1}. {pq.question.question}
              </p>
              
              {pq.question.figure_url && (
                <div className="flex justify-center my-4">
                  <img
                    src={pq.question.figure_url}
                    alt="Traffic sign"
                    className="max-h-[40vh] w-auto object-contain rounded-lg"
                  />
                </div>
              )}

              {!pq.showExplanation ? (
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 bg-green-50 hover:bg-green-100 border-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:border-green-700"
                    onClick={() => handleAnswer(index, true)}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                    True
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 bg-red-50 hover:bg-red-100 border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:border-red-700"
                    onClick={() => handleAnswer(index, false)}
                  >
                    <XCircle className="w-5 h-5 mr-2 text-red-600" />
                    False
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {pq.userAnswer === pq.question.answer ? (
                      <Badge className="bg-green-600 text-white">✓ Correct!</Badge>
                    ) : (
                      <Badge variant="destructive">✗ Incorrect</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Correct answer: <strong>{pq.question.answer ? "True" : "False"}</strong>
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Explanation:</p>
                    <p className="text-sm leading-relaxed">{pq.question.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {user && !premiumLoading && (
        <div className={`p-3 rounded-lg ${isPremium ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800" : "bg-muted"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPremium ? (
                <>
                  <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-sm">Premium: Unlimited</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-sm">{usageLimits.ai_questions.remaining} questions left today</span>
                </>
              )}
            </div>
            {!isPremium && (
              <Badge variant="outline" className="text-xs">
                {usageLimits.ai_questions.current} / {usageLimits.ai_questions.limit}
              </Badge>
            )}
          </div>
        </div>
      )}

      {showPaywall && (
        <Paywall feature="ai_questions" usageLimits={usageLimits} />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generate Questions</h3>
          {isPremium && (
            <Badge className="bg-purple-600">
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="concept">Topic / Concept *</Label>
          <Textarea
            id="concept"
            placeholder="e.g., Right-of-way rules at unmarked intersections"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="traffic-rules">Traffic Rules</SelectItem>
                <SelectItem value="road-signs">Road Signs</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="permit">Permit Test</SelectItem>
                <SelectItem value="license">License Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Count</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !concept.trim() || !user || (showPaywall && !isPremium)}
          className="w-full h-12"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating... (may take up to 30s)
            </>
          ) : !user ? (
            "Sign In to Generate"
          ) : (
            "Generate Questions"
          )}
        </Button>
      </div>

      {aiQuestions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Previous Questions ({aiQuestions.length})</h3>
          <div className="space-y-3">
            {aiQuestions.slice(0, 5).map((q) => (
              <div key={q.id} className="flex items-start gap-2 py-2 border-b last:border-b-0">
                {q.answer ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <p className="text-sm leading-relaxed">{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
