import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * IMAGE-FIRST Flashcard Generation with AI-Enhanced Metadata
 * 
 * Uses verified database metadata enhanced by Gemini AI as the source of truth.
 * Flashcards display rich content including:
 * - AI-translated Japanese names
 * - Expanded meanings for learners
 * - Driver behavior guidance
 * - Legal context
 */

// Category to database mapping
const CATEGORY_DB_MAP: { [key: string]: string } = {
  'regulatory-signs': 'regulatory',
  'warning-signs': 'warning',
  'indication-signs': 'indication',
  'guidance-signs': 'guidance',
  'auxiliary-signs': 'auxiliary',
  'road-markings': 'road-markings',
  'traffic-signals': 'traffic-signals',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, count = 10 } = await req.json();
    
    console.log(`🎴 Generating AI-enhanced flashcards: category="${category}", count=${count}`);
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    
    // Map frontend category to database category
    const dbCategory = CATEGORY_DB_MAP[category] || category;
    
    console.log(`📂 Database category: ${dbCategory}`);
    
    // STEP 1: Fetch AI-enhanced images with complete metadata
    // Priority: images with expanded_meaning (AI-enhanced)
    const { data: enhancedImages } = await supabase
      .from('road_sign_images')
      .select(`
        id,
        storage_url,
        file_name,
        sign_number,
        sign_name_en,
        sign_name_jp,
        sign_meaning,
        sign_category,
        gemini_category,
        expanded_meaning,
        translated_japanese,
        driver_behavior,
        legal_context,
        ai_enhanced,
        attribution_text,
        license_info,
        wikimedia_page_url,
        artist_name,
        image_source
      `)
      .or(`sign_category.eq.${dbCategory},gemini_category.eq.${dbCategory}`)
      .eq('is_verified', true)
      .eq('ai_enhanced', true)
      .not('expanded_meaning', 'is', null)
      .order('usage_count', { ascending: false, nullsFirst: false })
      .limit(count * 2);
    
    // deno-lint-ignore no-explicit-any
    let images: any[] = enhancedImages || [];
    
    // Fallback: get any verified images if no AI-enhanced ones
    if (images.length < count) {
      console.log(`⚠️ Only ${images.length} AI-enhanced images, fetching fallback...`);
      
      const { data: fallbackImages } = await supabase
        .from('road_sign_images')
        .select(`
          id,
          storage_url,
          file_name,
          sign_number,
          sign_name_en,
          sign_name_jp,
          sign_meaning,
          sign_category,
          gemini_category,
          expanded_meaning,
          translated_japanese,
          driver_behavior,
          legal_context,
          ai_enhanced,
          attribution_text,
          license_info,
          wikimedia_page_url,
          artist_name,
          image_source
        `)
        .or(`sign_category.eq.${dbCategory},gemini_category.eq.${dbCategory}`)
        .eq('is_verified', true)
        .not('sign_name_en', 'is', null)
        .order('usage_count', { ascending: false, nullsFirst: false })
        .limit(count * 2);
      
      if (fallbackImages && fallbackImages.length > 0) {
        // Merge, avoiding duplicates
        // deno-lint-ignore no-explicit-any
        const existingIds = new Set(images.map((i: any) => i.id));
        // deno-lint-ignore no-explicit-any
        const newImages = fallbackImages.filter((i: any) => !existingIds.has(i.id));
        images = [...images, ...newImages];
      }
    }
    
    if (images.length === 0) {
      throw new Error(`No images found for category: ${dbCategory}`);
    }
    
    // Shuffle and select requested count
    const shuffledImages = images
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    // deno-lint-ignore no-explicit-any
    console.log(`📸 Selected ${shuffledImages.length} images (${shuffledImages.filter((i: any) => i.ai_enhanced).length} AI-enhanced)`);
    
    // STEP 2: Fetch distractors from same category
    const { data: allCategorySigns } = await supabase
      .from('road_sign_images')
      .select('sign_name_en')
      .or(`sign_category.eq.${dbCategory},gemini_category.eq.${dbCategory}`)
      .eq('is_verified', true)
      .not('sign_name_en', 'is', null)
      .limit(100);
    
    const distractorPool = (allCategorySigns || [])
      // deno-lint-ignore no-explicit-any
      .map((s: any) => s.sign_name_en)
      .filter((v: string, i: number, a: string[]) => v && a.indexOf(v) === i);
    
    console.log(`🎯 Distractor pool: ${distractorPool.length} unique names`);
    
    // STEP 3: Build flashcards with AI-enhanced content
    // deno-lint-ignore no-explicit-any
    const flashcards = shuffledImages.map((image: any, index: number) => {
      // Get the best available name
      const signNameEn = image.sign_name_en || 
        image.file_name?.replace(/[-_]/g, ' ').replace(/\.(svg|png|jpg)/gi, '').trim() ||
        'Road Sign';
      
      // Get Japanese name with translation
      const signNameJp = image.translated_japanese || image.sign_name_jp || null;
      
      // Get AI-enhanced explanation or fallback
      const explanation = image.expanded_meaning || 
        image.sign_meaning || 
        `This is a ${image.gemini_category || image.sign_category || 'road'} sign. Study this sign for your driving test.`;
      
      // Get driver behavior guidance
      const driverBehavior = image.driver_behavior || null;
      
      // Get legal context
      const legalContext = image.legal_context || null;
      
      // Get category (prefer AI-inferred)
      const signCategory = image.gemini_category || image.sign_category || dbCategory;
      
      // Generate question
      const question = "What does this road sign indicate?";
      
      // Correct answer from database
      const correctAnswer = signNameEn;
      
      // Generate distractors (wrong answers)
      const otherSigns = distractorPool
        .filter((name: string) => name && name !== signNameEn)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Build options array
      const options = [correctAnswer, ...otherSigns]
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
        .sort(() => Math.random() - 0.5);
      
      // Ensure correct answer is in options
      if (!options.includes(correctAnswer)) {
        options[0] = correctAnswer;
      }
      
      console.log(`✅ Card ${index + 1}: "${signNameEn}" (AI: ${image.ai_enhanced ? 'yes' : 'no'})`);
      
      return {
        // Core flashcard data
        question,
        answer: correctAnswer,
        correct_answer: correctAnswer,
        explanation,
        options: options.slice(0, 4),
        difficulty: 'easy',
        
        // Image data
        imageUrl: image.storage_url,
        imageQuery: signNameEn,
        roadSignImageId: image.id,
        
        // Sign metadata
        signNameEn,
        signNameJp,
        signNumber: image.sign_number || null,
        signCategory,
        
        // AI-enhanced content
        aiEnhanced: image.ai_enhanced || false,
        expandedMeaning: image.expanded_meaning || null,
        driverBehavior,
        legalContext,
        translatedJapanese: image.translated_japanese || null,
        
        // Attribution
        attributionText: image.attribution_text || null,
        licenseInfo: image.license_info || null,
        wikimediaPageUrl: image.wikimedia_page_url || null,
        artistName: image.artist_name || null,
        imageSource: image.image_source || null,
      };
    });
    
    console.log(`🎉 Generated ${flashcards.length} flashcards`);
    
    // Update usage counts (best effort)
    try {
      for (const card of flashcards) {
        if (card.roadSignImageId) {
          await supabase.rpc('increment_image_usage', { image_id: card.roadSignImageId });
        }
      }
    } catch (_e) {
      console.log('Note: Could not update usage counts');
    }
    
    return new Response(
      JSON.stringify({
        flashcards,
        count: flashcards.length,
        category,
        dbCategory,
        // deno-lint-ignore no-explicit-any
        aiEnhancedCount: flashcards.filter((f: any) => f.aiEnhanced).length,
        source: 'image-first-ai-enhanced',
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("❌ Error generating flashcards:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        flashcards: [],
        count: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
