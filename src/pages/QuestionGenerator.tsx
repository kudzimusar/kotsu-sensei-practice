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
import { Loader2, CheckCircle2, XCircle, Crown, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
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

export default function AdminQuestionGenerator() {
  const { user } = useAuth();
  const { isPremium, usageLimits, isLoading: premiumLoading } = usePremium();
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState("traffic-rules");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState("5");
  const [concept, setConcept] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);

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
      setConcept("");
      refetch(); // Refresh the questions list
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <h1 className="text-base font-bold">AI Question Generator</h1>
          <p className="text-xs text-muted-foreground">Generate unlimited practice questions</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-6 p-4 pt-6">
        {/* Usage Status Banner */}
        {user && !premiumLoading && (
          <Card className={isPremium ? "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <>
                      <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium">Premium: Unlimited Questions</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="font-medium">Free Tier: {usageLimits.ai_questions.remaining} questions remaining today</span>
                    </>
                  )}
                </div>
                {!isPremium && (
                  <Badge variant="outline" className="text-xs">
                    {usageLimits.ai_questions.current} / {usageLimits.ai_questions.limit}
                  </Badge>
                )}
              </div>
              {!isPremium && usageLimits.ai_questions.remaining === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  You've reached your daily limit. Upgrade to Premium for unlimited questions!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paywall */}
        {showPaywall && (
          <Paywall feature="ai_questions" usageLimits={usageLimits} />
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generation Settings</CardTitle>
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
              <Label htmlFor="concept">Concept / Topic *</Label>
              <Textarea
                id="concept"
                placeholder="e.g., Right-of-way rules at unmarked intersections"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Describe the driving rule or concept you want to generate questions about
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Test Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
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

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                />
              </div>

            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !concept.trim() || !user || (showPaywall && !isPremium)}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : !user ? (
                "Sign In to Generate"
              ) : showPaywall && !isPremium ? (
                "Upgrade to Generate More"
              ) : (
                "Generate Questions"
              )}
            </Button>
            
            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                Sign in to generate AI questions
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Enter a specific driving concept or rule you want to practice</p>
            <p>2. Select category, difficulty level, and language</p>
            <p>3. AI generates unique questions based on official Japanese driving rules</p>
            <p>4. Generated questions appear below and are instantly available for practice</p>
            <p>5. Keep generating more questions to expand your study materials endlessly!</p>
          </CardContent>
        </Card>

        {/* Generated Questions Display */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions ({aiQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {aiQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No questions generated yet. Create your first batch above!
              </p>
            ) : (
              <div className="space-y-4">
                {aiQuestions.map((q) => (
                  <div key={q.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      {q.answer ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{q.question}</p>
                        {q.figure_url && (
                          <div className="my-3 flex justify-center">
                            <div className="p-2 bg-muted rounded-lg border">
                              <img
                                src={q.figure_url}
                                alt="Generated traffic sign or scenario"
                                className="max-w-[120px] max-h-[120px] object-contain"
                              />
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">{q.explanation}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {q.difficulty_level}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {new Date(q.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
