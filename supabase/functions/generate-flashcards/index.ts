import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * IMAGE-FIRST Flashcard Generation
 * 
 * Fetches road sign images with AI-hydrated metadata and creates educational flashcards.
 * Each flashcard has ONE sign, with proper name, meaning, and driver guidance.
 */

// Category mapping
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
    
    console.log(`🎴 Generating flashcards: category="${category}", count=${count}`);
    
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
    
    // Fetch ONLY AI-hydrated images with complete metadata
    // Priority: signs with expanded_meaning (AI-enhanced) first
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
        driver_behavior,
        legal_context,
        ai_enhanced,
        attribution_text,
        license_info,
        wikimedia_page_url,
        artist_name
      `)
      .or(`sign_category.eq.${dbCategory},gemini_category.eq.${dbCategory}`)
      .eq('is_verified', true)
      .not('expanded_meaning', 'is', null)  // Only get AI-hydrated signs
      .order('usage_count', { ascending: false, nullsFirst: false })
      .limit(count * 2);
    
    if (queryError) {
      console.error('Query error:', queryError);
      throw new Error(`Database query failed: ${queryError.message}`);
    }
    
    // If no AI-hydrated images, fall back to any verified images
    let selectedImages = images || [];
    
    if (selectedImages.length === 0) {
      console.log('⚠️ No AI-hydrated images, falling back to all verified images');
      
      const { data: fallbackImages, error: fallbackError } = await supabase
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
          driver_behavior,
          legal_context,
          ai_enhanced,
          attribution_text,
          license_info,
          wikimedia_page_url,
          artist_name
        `)
        .or(`sign_category.eq.${dbCategory},gemini_category.eq.${dbCategory}`)
        .eq('is_verified', true)
        .order('usage_count', { ascending: false, nullsFirst: false })
        .limit(count * 2);
      
      if (fallbackError) {
        throw new Error(`Fallback query failed: ${fallbackError.message}`);
      }
      
      selectedImages = fallbackImages || [];
    }
    
    if (selectedImages.length === 0) {
      throw new Error(`No images found for category: ${dbCategory}`);
    }
    
    // Shuffle and select requested count
    const shuffledImages = selectedImages
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    console.log(`📸 Selected ${shuffledImages.length} images`);
    
    // Build flashcards
    const flashcards = shuffledImages.map((image, index) => {
      // Clean sign name
      let signName = image.sign_name_en || '';
      
      if (!signName || signName.length < 2) {
        // Extract from filename as fallback
        signName = image.file_name
          .replace(/[-_]/g, ' ')
          .replace(/\.(svg|png|jpg|gif)/gi, '')
          .replace(/^japan(ese)?\s*(road\s*)?(sign\s*)?/i, '')
          .trim();
      }
      
      // Clean up common patterns
      signName = signName
        .replace(/\s+\d+(\s+and\s+\d+)?$/i, '')  // Remove trailing numbers like "328 and 506"
        .replace(/\s*\([^)]*\)/g, '')  // Remove parenthetical content
        .trim();
      
      // Capitalize first letter of each word
      signName = signName
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Get the best explanation
      const explanation = image.expanded_meaning || 
        image.sign_meaning?.replace(/<[^>]*>/g, '') ||  // Strip HTML
        `This ${dbCategory} sign provides important information for drivers.`;
      
      // Get driver behavior
      const driverBehavior = image.driver_behavior || 
        'Follow the instruction indicated by this sign for safe driving.';
      
      // Get Japanese name
      const signNameJp = image.sign_name_jp || '';
      
      // Get sign number
      const signNumber = image.sign_number || null;
      
      console.log(`✅ Card ${index + 1}: "${signName}" (${signNumber || 'no number'})`);
      
      return {
        // Core flashcard data
        id: image.id,
        question: "What does this road sign mean?",
        answer: signName,
        explanation,
        driverBehavior,
        
        // Image
        imageUrl: image.storage_url,
        
        // Sign metadata for display
        signName,
        signNameJp,
        signNumber,
        category: image.gemini_category || image.sign_category || dbCategory,
        
        // Attribution
        attribution: image.artist_name 
          ? `Image by ${image.artist_name}${image.license_info ? ` — ${image.license_info}` : ''}`
          : (image.attribution_text || 'Wikimedia Commons'),
        wikimediaUrl: image.wikimedia_page_url || null,
        
        // Metadata
        aiEnhanced: image.ai_enhanced || false,
        legalContext: image.legal_context || null,
      };
    });
    
    console.log(`🎉 Generated ${flashcards.length} flashcards`);
    
    // Update usage counts (best effort)
    try {
      for (const card of flashcards) {
        await supabase.rpc('increment_image_usage', { image_id: card.id });
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
        aiHydrated: flashcards.filter(f => f.aiEnhanced).length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
