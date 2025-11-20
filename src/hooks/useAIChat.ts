import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatSection {
  heading: string;
  imageQuery: string;
  content: string;
  summary?: string;
  image?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content?: string;
  sections?: ChatSection[];
  timestamp: Date;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare messages for API (include history for context)
      const messagesToSend = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { messages: messagesToSend },
      });

      if (error) {
        console.error('AI Chat invoke error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        const errorMessage = error.message || 'Unknown error occurred';
        throw new Error(errorMessage);
      }

      // Check if response contains an error
      if (data?.error) {
        console.error('AI Chat returned error in response:', data.error);
        console.error('Full error response:', JSON.stringify(data, null, 2));
        throw new Error(data.error);
      }

      // Handle structured or plain response
      if (data?.sections) {
        // Structured response with sections
        const aiMessage: ChatMessage = {
          role: 'assistant',
          sections: data.sections,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else if (data?.message) {
        // Plain text response (backward compatibility)
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('No response from AI - unexpected response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to get AI response: ${errorMessage}`);
      
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
