import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * IMAGE-FIRST Flashcard Generation
 * 
 * Fetches road sign images and creates educational flashcards.
 * Uses Gemini AI to generate proper learning content when metadata is missing.
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

// Human-readable category labels
const CATEGORY_LABELS: { [key: string]: string } = {
  'regulatory': 'Regulatory Sign',
  'warning': 'Warning Sign',
  'indication': 'Indication Sign', 
  'guidance': 'Guidance Sign',
  'auxiliary': 'Auxiliary Sign',
  'road-markings': 'Road Marking',
  'traffic-signals': 'Traffic Signal',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, count = 10 } = await req.json();
    
    console.log(`🎴 Generating flashcards: category="${category}", count=${count}`);
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    
    // Map frontend category to database category
    const dbCategory = CATEGORY_DB_MAP[category] || category;
    const categoryLabel = CATEGORY_LABELS[dbCategory] || dbCategory;
    
    console.log(`📂 Database category: ${dbCategory}`);
    
    // Fetch images with metadata
    const { data: images, error: queryError } = await supabase
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
      .limit(count * 3);
    
    if (queryError) {
      console.error('Query error:', queryError);
      throw new Error(`Database query failed: ${queryError.message}`);
    }
    
    if (!images || images.length === 0) {
      throw new Error(`No images found for category: ${dbCategory}`);
    }
    
    // Shuffle and select requested count
    const shuffledImages = images
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    console.log(`📸 Selected ${shuffledImages.length} images`);
    
    // Build distractor pool from all signs in category
    const { data: allCategorySigns } = await supabase
      .from('road_sign_images')
      .select('sign_name_en')
      .or(`sign_category.eq.${dbCategory},gemini_category.eq.${dbCategory}`)
      .eq('is_verified', true)
      .not('sign_name_en', 'is', null)
      .limit(100);
    
    const distractorPool = (allCategorySigns || [])
      .map((s: { sign_name_en: string }) => s.sign_name_en)
      .filter((v: string, i: number, a: string[]) => v && a.indexOf(v) === i);
    
    console.log(`🎯 Distractor pool: ${distractorPool.length} unique names`);
    
    // Generate flashcards with AI enhancement if available
    const flashcards = [];
    
    for (let i = 0; i < shuffledImages.length; i++) {
      const image = shuffledImages[i];
      
      // Clean up sign name (remove file extensions, underscores)
      let signNameEn = image.sign_name_en || 
        image.file_name?.replace(/[-_]/g, ' ').replace(/\.(svg|png|jpg|gif)/gi, '').trim() ||
        'Road Sign';
      
      // Clean up common filename patterns to make better display names
      signNameEn = signNameEn
        .replace(/^Japan road sign /i, '')
        .replace(/^Japanese /i, '')
        .replace(/ sign$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Get explanation - use AI-enhanced if available, otherwise generate basic one
      let explanation = image.expanded_meaning || image.sign_meaning;
      let driverBehavior = image.driver_behavior;
      let legalContext = image.legal_context;
      
      // If no good explanation exists, create a basic educational one
      if (!explanation || explanation.length < 20) {
        explanation = `This ${categoryLabel.toLowerCase()} helps drivers understand road rules. When you see this sign, pay attention and follow its instruction for safe driving.`;
      }
      
      // Get category
      const signCategory = image.gemini_category || image.sign_category || dbCategory;
      
      // Generate distractors
      const otherSigns = distractorPool
        .filter((name: string) => name && name !== image.sign_name_en)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Build options
      const correctAnswer = signNameEn;
      const options = [correctAnswer, ...otherSigns]
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      
      // Ensure correct answer is in options
      if (!options.includes(correctAnswer)) {
        options[0] = correctAnswer;
      }
      
      console.log(`✅ Card ${i + 1}: "${signNameEn}"`);
      
      flashcards.push({
        // Core flashcard data
        question: "What does this road sign mean?",
        answer: correctAnswer,
        correct_answer: correctAnswer,
        explanation,
        options,
        difficulty: 'easy',
        
        // Image data
        imageUrl: image.storage_url,
        roadSignImageId: image.id,
        
        // Sign metadata
        signNameEn,
        signNameJp: image.translated_japanese || image.sign_name_jp || null,
        signNumber: image.sign_number || null,
        signCategory,
        
        // AI-enhanced content
        aiEnhanced: image.ai_enhanced || false,
        expandedMeaning: image.expanded_meaning || explanation,
        driverBehavior,
        legalContext,
        translatedJapanese: image.translated_japanese || null,
        
        // Attribution
        attributionText: image.artist_name 
          ? `Image by ${image.artist_name}${image.license_info ? ` — License: ${image.license_info}` : ''}`
          : (image.attribution_text || null),
        licenseInfo: image.license_info || null,
        wikimediaPageUrl: image.wikimedia_page_url || null,
        artistName: image.artist_name || null,
        imageSource: image.image_source || 'wikimedia_commons',
      });
    }
    
    console.log(`🎉 Generated ${flashcards.length} flashcards`);
    
    // Update usage counts (best effort, don't fail if this doesn't work)
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
        source: 'image-first',
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
