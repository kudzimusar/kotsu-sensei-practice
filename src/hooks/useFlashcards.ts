import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  explanation: string;
  driverBehavior?: string | null;
  imageUrl: string | null;
  // Sign metadata
  signName: string;
  signNameJp?: string | null;
  signNumber?: string | null;
  category?: string | null;
  // Attribution
  attribution?: string | null;
  wikimediaUrl?: string | null;
  // Metadata
  aiEnhanced?: boolean;
  legalContext?: string | null;
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
    count: number = 10
  ): Promise<Flashcard[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-flashcards', {
        body: { category, count },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to generate flashcards');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Map the backend response to our Flashcard interface
      const flashcards: Flashcard[] = (data?.flashcards || []).map((fc: any) => ({
        id: fc.id,
        question: fc.question,
        answer: fc.answer,
        explanation: fc.explanation,
        driverBehavior: fc.driverBehavior,
        imageUrl: fc.imageUrl,
        signName: fc.signName,
        signNameJp: fc.signNameJp,
        signNumber: fc.signNumber,
        category: fc.category,
        attribution: fc.attribution,
        wikimediaUrl: fc.wikimediaUrl,
        aiEnhanced: fc.aiEnhanced,
        legalContext: fc.legalContext,
      }));

      console.log(`Loaded ${flashcards.length} flashcards, ${data?.aiHydrated || 0} AI-enhanced`);
      
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
      
      if (flashcards.length === 0) {
        throw new Error('No flashcards available for this category. Try running AI hydration first.');
      }
      
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
    if (flashcard.id) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase.rpc as any)('update_flashcard_progress', {
            p_user_id: user.id,
            p_flashcard_id: flashcard.id,
            p_is_correct: isCorrect
          });
        }
      } catch (_error) {
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
