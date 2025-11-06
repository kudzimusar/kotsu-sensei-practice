import { useEffect } from 'react';

interface QuestionWithImage {
  image_url?: string;
  figure?: string;
}

export function useImagePreload<T extends QuestionWithImage>(
  questions: T[], 
  currentIndex: number,
  preloadCount: number = 3
) {
  useEffect(() => {
    // Preload next N images
    for (let i = 1; i <= preloadCount; i++) {
      const nextQuestion = questions[currentIndex + i];
      if (!nextQuestion) continue;
      
      const imageUrl = nextQuestion.image_url || nextQuestion.figure;
      if (imageUrl) {
        const img = new Image();
        img.src = imageUrl;
      }
    }
  }, [currentIndex, questions, preloadCount]);
}
