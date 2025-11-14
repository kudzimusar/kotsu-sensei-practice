import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  Search, 
  Lightbulb, 
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  FileText,
  BookMarked
} from "lucide-react";
import { textbookChapters, terminology, threeElements } from "@/data/lectureData";
import bookCover from "@/assets/book-cover.jpg";
import { TTSButton } from "@/components/ui/tts-button";

interface TextbookContentProps {
  textbookId: string;
  onBack: () => void;
}

export const TextbookContent = ({ textbookId, onBack }: TextbookContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTerminology = terminology.filter(
    (term) =>
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTerminology = filteredTerminology.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, typeof terminology>);

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        size="lg"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Textbooks
      </Button>

      <div className="text-center mb-6">
        <img 
          src={bookCover} 
          alt="Rules of the Road" 
          className="w-48 h-64 object-cover rounded-xl shadow-lg mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Rules of the Road
        </h2>
        <p className="text-muted-foreground">Complete Japanese Driving Education Guide</p>
      </div>

      {/* Purchase Section */}
      <Card className="border-4 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookMarked className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="text-xl font-bold">Get the Full Textbook</h3>
                <p className="text-sm text-muted-foreground">Purchase on Amazon</p>
              </div>
            </div>
            <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600">
              <a href="https://www.amazon.co.jp/s?k=Rules+of+the+Road+Textbook" target="_blank" rel="noopener noreferrer">
                Buy on Amazon <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Free PDF Preview */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold">Free PDF Preview</h3>
                <p className="text-sm text-muted-foreground">Basic rules and signage guide (NPA)</p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-blue-300">
              <a href="https://www.npa.go.jp/policies/application/license_renewal/pdf/english.pdf" target="_blank" rel="noopener noreferrer">
                View PDF <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="toc" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="toc">
            <BookOpen className="h-4 w-4 mr-2" />
            Table of Contents
          </TabsTrigger>
          <TabsTrigger value="terminology">
            <Lightbulb className="h-4 w-4 mr-2" />
            Terminology
          </TabsTrigger>
          <TabsTrigger value="elements">
            <MessageSquare className="h-4 w-4 mr-2" />
            Three Elements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table of Contents</CardTitle>
              <CardDescription>18 chapters organized by learning steps</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {textbookChapters.map((chapter) => (
                  <AccordionItem key={chapter.chapter} value={`chapter-${chapter.chapter}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Badge variant="outline" className="shrink-0">Ch {chapter.chapter}</Badge>
                        <div>
                          <div className="font-semibold">{chapter.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {chapter.step} • Pages {chapter.pages}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {chapter.subsections && chapter.subsections.length > 0 && (
                        <ul className="space-y-2 pl-6">
                          {chapter.subsections.map((subsection, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{subsection}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meaning of Major Terminologies</CardTitle>
              <CardDescription>Essential definitions for driving education</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search terminology..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {Object.entries(groupedTerminology).map(([category, terms]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 text-primary">{category}</h3>
                  <div className="space-y-3">
                    {terms.map((term, idx) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <h4 className="font-semibold text-base flex-1">{term.term}</h4>
                          <TTSButton 
                            text={`${term.term}: ${term.definition}`}
                            size="sm" 
                            variant="ghost" 
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Three Elements of Driving</CardTitle>
              <CardDescription>{threeElements.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {threeElements.elements.map((element, idx) => (
                <div key={idx} className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <h3 className="text-xl font-bold">{element.name}</h3>
                      <TTSButton 
                        text={`${element.name}: ${element.description}`}
                        size="sm" 
                        variant="ghost" 
                      />
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{element.description}</p>
                  <div className="space-y-2">
                    {element.examples.map((example, exIdx) => (
                      <div key={exIdx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200">
                <h3 className="text-lg font-bold mb-3">The Feedback Loop</h3>
                <p className="text-muted-foreground">{threeElements.feedback}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
