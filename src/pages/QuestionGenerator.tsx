import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

export default function AdminQuestionGenerator() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [category, setCategory] = useState("traffic-rules");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState("5");
  const [language, setLanguage] = useState("en");
  const [concept, setConcept] = useState("");

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
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with back button */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-bold">AI Question Generator</h1>
            <p className="text-xs text-muted-foreground">Generate unlimited practice questions</p>
          </div>
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
            <p>4. Generated questions are instantly available for your practice sessions</p>
            <p>5. Keep generating more questions to expand your study materials endlessly!</p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
