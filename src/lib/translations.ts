import { supabase } from "@/integrations/supabase/client";

interface Translation {
  key: string;
  en: string;
  ja: string | null;
  category: string;
}

let translationsCache: Record<string, Translation> | null = null;

export const loadTranslations = async (): Promise<Record<string, Translation>> => {
  if (translationsCache) {
    return translationsCache;
  }

  const { data, error } = await supabase
    .from('translations')
    .select('*');

  if (error) {
    console.error('Error loading translations:', error);
    return {};
  }

  translationsCache = data.reduce((acc, translation) => {
    acc[translation.key] = translation;
    return acc;
  }, {} as Record<string, Translation>);

  return translationsCache;
};

export const getTranslation = (
  key: string, 
  language: 'en' | 'ja', 
  translations: Record<string, Translation>,
  fallback?: string
): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return fallback || key;
  }

  const value = language === 'ja' ? translation.ja : translation.en;
  return value || translation.en || fallback || key;
};

export const clearTranslationsCache = () => {
  translationsCache = null;
};
