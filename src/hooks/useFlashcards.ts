import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Flashcard {
  imageQuery?: string;
  question: string;
  answer: string; // Legacy support
  correct_answer?: string; // New field
  options?: string[]; // Multiple choice options
  explanation: string;
  imageUrl: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  // Metadata from Wikimedia Commons (optional)
  roadSignImageId?: string;
  signNameEn?: string | null;
  signNameJp?: string | null;
  signCategory?: string | null;
  attributionText?: string | null;
  licenseInfo?: string | null;
  wikimediaPageUrl?: string | null;
  artistName?: string | null;
  imageSource?: string | null;
  // AI-enhanced fields
  aiEnhanced?: boolean;
  expandedMeaning?: string | null;
  driverBehavior?: string | null;
  legalContext?: string | null;
  translatedJapanese?: string | null;
  signNumber?: string | null;
}

export interface FlashcardSession {
  flashcards: Flashcard[];
  currentIndex: number;
  correctCount: number;
  incorrectCount: number;
  responses: FlashcardResponse[];
}

export interface FlashcardResponse {
  flashcardIndex: number;
  userAnswer: string;
  isCorrect: boolean;
  responseTime: number;
}

export const useFlashcards = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<FlashcardSession | null>(null);

  const generateFlashcards = async (
    category: string, 
    count: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'easy',
    useDeckGenerator: boolean = false
  ): Promise<Flashcard[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use new deck generator if requested, otherwise use legacy generator
      const functionName = useDeckGenerator ? 'generate-flashcard-deck' : 'generate-flashcards';
      
      // Get user ID for adaptive learning
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error: functionError } = await supabase.functions.invoke(functionName, {
        body: { 
          category, 
          count,
          difficulty,
          userId: user?.id || null,
          adaptive: false // Can enable adaptive learning later
        },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to generate flashcards');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Normalize flashcard data - ensure correct_answer and options are set
      const flashcards = (data?.flashcards || []).map((fc: any) => ({
        ...fc,
        correct_answer: fc.correct_answer || fc.answer,
        options: fc.options || [fc.answer],
        answer: fc.answer || fc.correct_answer, // Legacy support
      }));

      return flashcards;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (category: string, count: number = 10) => {
    try {
      const flashcards = await generateFlashcards(category, count);
      
      const newSession: FlashcardSession = {
        flashcards,
        currentIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
        responses: [],
      };

      setSession(newSession);
      return newSession;
    } catch (err) {
      console.error('Error starting session:', err);
      throw err;
    }
  };

  const submitAnswer = async (
    flashcardIndex: number,
    userAnswer: string,
    isCorrect: boolean,
    responseTime: number
  ) => {
    if (!session) return;

    const response: FlashcardResponse = {
      flashcardIndex,
      userAnswer,
      isCorrect,
      responseTime,
    };

    // Record progress in database if flashcard has an ID
    const flashcard = session.flashcards[flashcardIndex];
    if (flashcard.roadSignImageId) {
      try {
        // Get the flashcard ID from database
        const { data: flashcardData } = await supabase
          .from('road_sign_flashcards')
          .select('id')
          .eq('road_sign_image_id', flashcard.roadSignImageId)
          .single();

        if (flashcardData?.id) {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Record progress using RPC function
            await (supabase.rpc as any)('update_flashcard_progress', {
              p_user_id: user.id,
              p_flashcard_id: flashcardData.id,
              p_is_correct: isCorrect
            });
          }
        }
      } catch (error) {
        console.error('Error recording flashcard progress:', error);
        // Continue even if progress recording fails
      }
    }

    const updatedResponses = [...session.responses, response];
    const updatedSession: FlashcardSession = {
      ...session,
      currentIndex: session.currentIndex + 1,
      correctCount: isCorrect ? session.correctCount + 1 : session.correctCount,
      incorrectCount: !isCorrect ? session.incorrectCount + 1 : session.incorrectCount,
      responses: updatedResponses,
    };

    setSession(updatedSession);
    return updatedSession;
  };

  const goToNext = () => {
    if (!session) return;
    if (session.currentIndex < session.flashcards.length - 1) {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1,
      });
    }
  };

  const goToPrevious = () => {
    if (!session) return;
    if (session.currentIndex > 0) {
      setSession({
        ...session,
        currentIndex: session.currentIndex - 1,
      });
    }
  };

  const goToCard = (index: number) => {
    if (!session) return;
    if (index >= 0 && index < session.flashcards.length) {
      setSession({
        ...session,
        currentIndex: index,
      });
    }
  };

  const resetSession = () => {
    setSession(null);
    setError(null);
  };

  const isComplete = () => {
    if (!session) return false;
    return session.currentIndex >= session.flashcards.length;
  };

  const getCurrentFlashcard = (): Flashcard | null => {
    if (!session || session.currentIndex >= session.flashcards.length) {
      return null;
    }
    return session.flashcards[session.currentIndex];
  };

  const getIncorrectFlashcards = (): Flashcard[] => {
    if (!session) return [];
    return session.responses
      .filter(r => !r.isCorrect)
      .map(r => session.flashcards[r.flashcardIndex]);
  };

  return {
    isLoading,
    error,
    session,
    startSession,
    submitAnswer,
    goToNext,
    goToPrevious,
    goToCard,
    resetSession,
    isComplete,
    getCurrentFlashcard,
    getIncorrectFlashcards,
  };
};



