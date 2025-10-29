import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminQuestionGenerator() {
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div>
          <h1 className="text-3xl font-bold">AI Question Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate new practice questions using AI
          </p>
        </div>

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
            <p>1. Enter a specific driving concept or rule</p>
            <p>2. Select category, difficulty, and language</p>
            <p>3. AI generates questions based on official Japanese driving rules</p>
            <p>4. Generated questions are saved with "pending" status</p>
            <p>5. Review and approve questions before they appear to users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
