import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Star } from "lucide-react";
import bookCover from "@/assets/book-cover.jpg";

interface Textbook {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: number;
  amazonLink: string;
  isPrimary?: boolean;
}

const textbooks: Textbook[] = [
  {
    id: "rules-of-the-road",
    title: "Rules of the Road",
    description: "Official driving textbook covering all essential regulations and safety principles",
    coverImage: bookCover,
    chapters: 18,
    amazonLink: "https://www.amazon.co.jp/s?k=Rules+of+the+Road+Textbook",
    isPrimary: true,
  },
  // Add more textbooks here as needed
];

interface TextbookSelectorProps {
  onSelectTextbook: (textbookId: string) => void;
}

export const TextbookSelector = ({ onSelectTextbook }: TextbookSelectorProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-4 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Select Your Textbook
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">Choose a textbook to view its contents and materials</p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {textbooks.map((textbook) => (
          <Card 
            key={textbook.id}
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
            onClick={() => onSelectTextbook(textbook.id)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                <img 
                  src={textbook.coverImage} 
                  alt={textbook.title}
                  className="w-full md:w-48 h-48 sm:h-64 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-start sm:items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold">{textbook.title}</h3>
                      {textbook.isPrimary && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground leading-snug">{textbook.description}</p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      <span className="font-medium">{textbook.chapters} Chapters</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button 
                      size="default" 
                      className="flex-1 text-sm sm:text-base h-9 sm:h-11"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTextbook(textbook.id);
                      }}
                    >
                      View Content <BookOpen className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button 
                      size="default" 
                      variant="outline"
                      className="flex-1 text-sm sm:text-base h-9 sm:h-11"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={textbook.amazonLink} target="_blank" rel="noopener noreferrer">
                        Buy on Amazon <ExternalLink className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
