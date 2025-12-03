import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Fetch AI-generated questions
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
    
    // Check usage limits before generating
    if (!isPremium) {
      const usageCheck = await checkAndIncrementUsage(user.id, "ai_questions", questionCount);
      
      if (!usageCheck.allowed) {
        toast.error(`You've reached your daily limit of ${usageCheck.limit} questions. Upgrade to Premium for unlimited questions!`);
        setShowPaywall(true);
        return;
      }
    }

    setIsGenerating(true);
    try {
      // Track usage for premium users too (for analytics)
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

      if (error) throw error;

      toast.success(`Successfully generated ${data.count} questions!`);
      
      // Set up practice mode with new questions
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

  // Practice Mode View
  if (practiceMode && practiceQuestions.length > 0) {
    const score = getScore();
    const allAnswered = score.answered === score.total;

    return (
      <div className="space-y-4 p-4">
        {/* Score Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{score.correct} / {score.total}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetPractice}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  New Questions
                </Button>
              </div>
            </div>
            {allAnswered && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium">
                  {score.correct === score.total ? "🎉 Perfect score!" : 
                   score.correct >= score.total * 0.7 ? "👍 Great job!" : 
                   "Keep practicing!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {practiceQuestions.map((pq, index) => (
            <Card key={pq.question.id} className={pq.showExplanation ? (
              pq.userAnswer === pq.question.answer ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/50"
            ) : ""}>
              <CardContent className="pt-4 space-y-3">
                <p className="font-medium">{index + 1}. {pq.question.question}</p>
                
                {pq.question.figure_url && (
                  <div className="flex justify-center p-3 bg-muted/50 rounded-lg">
                    <img
                      src={pq.question.figure_url}
                      alt="Traffic sign"
                      className="max-w-[150px] max-h-[150px] object-contain"
                    />
                  </div>
                )}

                {!pq.showExplanation ? (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 bg-green-50 hover:bg-green-100 border-green-300"
                      onClick={() => handleAnswer(index, true)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      True
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-red-50 hover:bg-red-100 border-red-300"
                      onClick={() => handleAnswer(index, false)}
                    >
                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      False
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {pq.userAnswer === pq.question.answer ? (
                        <Badge className="bg-green-600">Correct!</Badge>
                      ) : (
                        <Badge variant="destructive">Incorrect</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Answer: <strong>{pq.question.answer ? "True" : "False"}</strong>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {pq.question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Generator Form View
  return (
    <div className="space-y-4 p-4">
      {/* Usage Status Banner */}
      {user && !premiumLoading && (
        <Card className={isPremium ? "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20" : ""}>
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>
      )}

      {/* Paywall */}
      {showPaywall && (
        <Paywall feature="ai_questions" usageLimits={usageLimits} />
      )}

      {/* Generator Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Generate Questions</CardTitle>
            {isPremium && (
              <Badge className="bg-purple-600">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concept" className="text-sm">Topic / Concept *</Label>
            <Textarea
              id="concept"
              placeholder="e.g., Right-of-way rules at unmarked intersections"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs">
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
                <SelectTrigger className="h-9 text-xs">
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
                className="h-9 text-xs"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !concept.trim() || !user || (showPaywall && !isPremium)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : !user ? (
              "Sign In to Generate"
            ) : (
              "Generate Questions"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Questions */}
      {aiQuestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Previous Questions ({aiQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {aiQuestions.slice(0, 5).map((q) => (
                <div key={q.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-start gap-2">
                    {q.answer ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm">{q.question}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
