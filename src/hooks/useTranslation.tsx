import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { loadTranslations, getTranslation as getTranslationUtil } from '@/lib/translations';

export const useTranslation = () => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<'en' | 'ja'>('en');

  // Load user's language preference
  const { data: settings } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_settings')
        .select('language')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Load all translations
  const { data: translations = {}, isLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: loadTranslations,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    if (settings?.language) {
      setLanguageState(settings.language as 'en' | 'ja');
    }
  }, [settings]);

  const setLanguage = async (newLanguage: 'en' | 'ja') => {
    setLanguageState(newLanguage);
    
    if (user) {
      await supabase
        .from('user_settings')
        .update({ language: newLanguage })
        .eq('user_id', user.id);
    } else {
      // Store in localStorage for guest users
      localStorage.setItem('preferred_language', newLanguage);
    }
  };

  const t = (key: string, fallback?: string): string => {
    return getTranslationUtil(key, language, translations, fallback);
  };

  return {
    t,
    language,
    setLanguage,
    isLoading,
  };
};
