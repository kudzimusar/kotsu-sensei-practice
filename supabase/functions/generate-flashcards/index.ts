import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Generate Flashcards from AI-Hydrated Road Signs
 * 
 * Creates varied, educational flashcards with different question types.
 * Only uses signs that have been properly hydrated with AI metadata.
 */

const CATEGORY_MAP: Record<string, string> = {
  'regulatory-signs': 'regulatory',
  'warning-signs': 'warning',
  'indication-signs': 'indication',
  'guidance-signs': 'guidance',
  'auxiliary-signs': 'auxiliary',
  'road-markings': 'road-markings',
  'traffic-signals': 'traffic-signals',
};

// Question templates for variety
const QUESTION_TYPES = [
  { type: 'meaning', question: 'What does this road sign mean?' },
  { type: 'action', question: 'What must you do when you see this sign?' },
  { type: 'category', question: 'What type of road sign is this?' },
  { type: 'japanese', question: 'What is this sign called in Japanese?' },
  { type: 'penalty', question: 'What happens if you ignore this sign?' },
];

function getQuestionForSign(
  sign: {
    sign_name_en: string;
    sign_name_jp: string | null;
    expanded_meaning: string | null;
    driver_behavior: string | null;
    legal_context: string | null;
    gemini_category: string | null;
    sign_category: string | null;
  },
  questionIndex: number
): { question: string; answer: string } {
  const type = QUESTION_TYPES[questionIndex % QUESTION_TYPES.length];
  const category = sign.gemini_category || sign.sign_category || 'regulatory';
  
  switch (type.type) {
    case 'meaning':
      return {
        question: type.question,
        answer: sign.sign_name_en || 'Unknown Sign',
      };
    
    case 'action':
      return {
        question: type.question,
        answer: sign.driver_behavior || sign.expanded_meaning || sign.sign_name_en || 'Follow the sign instructions',
      };
    
    case 'category':
      const categoryNames: Record<string, string> = {
        'regulatory': 'Regulatory Sign (規制標識)',
        'warning': 'Warning Sign (警戒標識)',
        'indication': 'Indication Sign (指示標識)',
        'guidance': 'Guidance Sign (案内標識)',
        'auxiliary': 'Auxiliary Sign (補助標識)',
        'road-markings': 'Road Marking (道路標示)',
        'traffic-signals': 'Traffic Signal (信号機)',
      };
      return {
        question: type.question,
        answer: categoryNames[category] || 'Traffic Sign',
      };
    
    case 'japanese':
      return {
        question: type.question,
        answer: sign.sign_name_jp || sign.sign_name_en || 'Unknown',
      };
    
    case 'penalty':
      if (sign.legal_context && sign.legal_context !== 'N/A') {
        return {
          question: type.question,
          answer: sign.legal_context,
        };
      }
      // Fall back to meaning if no legal context
      return {
        question: 'What does this road sign mean?',
        answer: sign.sign_name_en || 'Unknown Sign',
      };
    
    default:
      return {
        question: 'What does this road sign mean?',
        answer: sign.sign_name_en || 'Unknown Sign',
      };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, count = 10 } = await req.json();
    
    console.log(`🎴 Generating ${count} flashcards for category: ${category}`);
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    
    const dbCategory = CATEGORY_MAP[category] || category;
    
    // First try: Get AI-hydrated signs with complete metadata
    let { data: images, error } = await supabase
      .from('road_sign_images')
      .select(`
        id, storage_url, file_name, sign_number,
        sign_name_en, sign_name_jp, sign_meaning,
        sign_category, gemini_category,
        expanded_meaning, driver_behavior, legal_context,
        ai_enhanced, attribution_text, license_info,
        wikimedia_page_url, artist_name
      `)
      .eq('is_verified', true)
      .eq('ai_enhanced', true)
      .or(`gemini_category.eq.${dbCategory},sign_category.eq.${dbCategory}`)
      .not('expanded_meaning', 'is', null)
      .order('usage_count', { ascending: false, nullsFirst: false })
      .limit(count * 3);

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    // If no hydrated signs, try any verified signs in category
    if (!images || images.length === 0) {
      console.log('⚠️ No hydrated signs, trying all verified signs...');
      
      const fallback = await supabase
        .from('road_sign_images')
        .select(`
          id, storage_url, file_name, sign_number,
          sign_name_en, sign_name_jp, sign_meaning,
          sign_category, gemini_category,
          expanded_meaning, driver_behavior, legal_context,
          ai_enhanced, attribution_text, license_info,
          wikimedia_page_url, artist_name
        `)
        .eq('is_verified', true)
        .or(`gemini_category.eq.${dbCategory},sign_category.eq.${dbCategory}`)
        .limit(count * 3);

      images = fallback.data || [];
    }

    // If still nothing, get any verified signs
    if (images.length === 0) {
      console.log('⚠️ No category signs, getting any verified signs...');
      
      const anyFallback = await supabase
        .from('road_sign_images')
        .select(`
          id, storage_url, file_name, sign_number,
          sign_name_en, sign_name_jp, sign_meaning,
          sign_category, gemini_category,
          expanded_meaning, driver_behavior, legal_context,
          ai_enhanced, attribution_text, license_info,
          wikimedia_page_url, artist_name
        `)
        .eq('is_verified', true)
        .eq('ai_enhanced', true)
        .limit(count * 3);

      images = anyFallback.data || [];
    }

    if (images.length === 0) {
      throw new Error(`No flashcards available. Please run hydration first.`);
    }

    // Shuffle and limit
    const shuffled = images.sort(() => Math.random() - 0.5).slice(0, count);
    
    console.log(`📸 Building ${shuffled.length} flashcards`);

    // Build flashcards with varied questions
    const flashcards = shuffled.map((image, index) => {
      const qa = getQuestionForSign(image, index);
      
      // Get explanation
      const explanation = image.expanded_meaning || 
        image.sign_meaning?.replace(/<[^>]*>/g, '') ||
        `This is a ${image.gemini_category || 'traffic'} sign that drivers must observe.`;

      console.log(`✅ Card ${index + 1}: ${image.sign_name_en || image.file_name}`);

      return {
        id: image.id,
        question: qa.question,
        answer: qa.answer,
        explanation,
        driverBehavior: image.driver_behavior || null,
        imageUrl: image.storage_url,
        signName: image.sign_name_en || image.file_name?.replace(/[-_]/g, ' ').replace(/\.\w+$/, '') || 'Traffic Sign',
        signNameJp: image.sign_name_jp || null,
        signNumber: image.sign_number || null,
        category: image.gemini_category || image.sign_category || dbCategory,
        attribution: image.artist_name 
          ? `Image by ${image.artist_name}` 
          : (image.attribution_text || 'Wikimedia Commons'),
        wikimediaUrl: image.wikimedia_page_url || null,
        aiEnhanced: image.ai_enhanced || false,
        legalContext: image.legal_context || null,
      };
    });

    // Update usage counts (best effort)
    try {
      for (const card of flashcards) {
        await supabase.rpc('increment_image_usage', { image_id: card.id });
      }
    } catch (_e) {
      // Ignore usage count errors
    }

    console.log(`🎉 Generated ${flashcards.length} flashcards`);

    return new Response(
      JSON.stringify({
        flashcards,
        count: flashcards.length,
        category,
        dbCategory,
        aiHydrated: flashcards.filter(f => f.aiEnhanced).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        flashcards: [],
        count: 0,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
