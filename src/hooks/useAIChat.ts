import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageFile } from '@/components/ui/image-upload';

// Get Supabase URL and key for direct fetch calls
const SUPABASE_URL = "https://ndulrvfwcqyvutcviebk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdWxydmZ3Y3F5dnV0Y3ZpZWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDA1MzcsImV4cCI6MjA3NzMxNjUzN30.0dM5c4ft7UIc7Uy6GmBthgNRcfqttvNs9EiR85OTVIo";

export interface ChatSection {
  heading: string;
  imageQuery: string;
  content: string;
  summary?: string;
  image?: string;
}

export interface RoadSignImage {
  id: string;
  storage_url: string;
  sign_name_en?: string;
  sign_name_jp?: string;
  sign_category?: string;
  ai_explanation?: string;
  ai_confidence?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content?: string;
  sections?: ChatSection[];
  images?: RoadSignImage[];
  timestamp: Date;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string, images?: ImageFile[]) => {
    if (!userMessage.trim() && (!images || images.length === 0)) return;

    // Analyze images first if provided
    let analyzedImages: RoadSignImage[] = [];
    if (images && images.length > 0) {
      setIsLoading(true);
      try {
        const analysisPromises = images.map(async (imageFile) => {
          // Convert file to base64
          const arrayBuffer = await imageFile.file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64 = btoa(String.fromCharCode(...uint8Array));
          
          // Create FormData for the edge function (it expects FormData)
          const formData = new FormData();
          formData.append('image', imageFile.file);
          formData.append('imageBase64', base64);
          formData.append('mimeType', imageFile.file.type);
          
          // Get auth token for the request
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            toast.error('Please sign in to upload images');
            return null;
          }
          
          // Use fetch directly since supabase.functions.invoke doesn't handle FormData well
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/analyze-road-sign`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': SUPABASE_ANON_KEY,
              },
              body: formData,
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to analyze image' }));
            throw new Error(errorData.error || 'Failed to analyze image');
          }
          
          const data = await response.json();

          if (data?.error) {
            console.error('Image analysis error:', data.error);
            toast.error(`Failed to analyze image: ${imageFile.file.name}`);
            return null;
          }

          return data?.image as RoadSignImage | null;
        });

        const results = await Promise.all(analysisPromises);
        analyzedImages = results.filter((img): img is RoadSignImage => img !== null);
        
        if (analyzedImages.length === 0 && images.length > 0) {
          toast.error('Failed to analyze images. Please try again.');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error analyzing images:', error);
        toast.error('Failed to analyze images. Please try again.');
        setIsLoading(false);
        return;
      }
    }

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage.trim() || undefined,
      images: analyzedImages.length > 0 ? analyzedImages : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare messages for API (include history for context)
      const messagesToSend = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
        images: msg.images,
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: messagesToSend },
      });

      if (error) {
        console.error('AI Chat error:', error);
        throw error;
      }

      // Handle structured or plain response
      if (data?.sections) {
        // Structured response with sections
        const aiMessage: ChatMessage = {
          role: 'assistant',
          sections: data.sections,
          images: data.images,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else if (data?.message) {
        // Plain text response (backward compatibility)
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          images: data.images,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get AI response. Please try again.');
      
      // Remove the user message if the request failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};
