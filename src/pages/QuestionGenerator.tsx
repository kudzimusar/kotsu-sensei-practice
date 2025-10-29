import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState("traffic-rules");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState("5");
  const [language, setLanguage] = useState("en");
  const [concept, setConcept] = useState("");

  // Fetch AI-generated questions
  const { data: aiQuestions = [], refetch } = useQuery({
    queryKey: ["ai-questions", category, language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_questions')
        .select('*')
        .eq('status', 'approved')
        .eq('test_category', category)
        .eq('language', language)
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

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          category,
          difficulty,
          count: parseInt(count),
          language,
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

        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
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

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !concept.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Questions"
              )}
            </Button>
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
