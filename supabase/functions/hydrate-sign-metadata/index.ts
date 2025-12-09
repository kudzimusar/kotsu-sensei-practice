import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * TEXT-BASED Sign Metadata Hydrator
 * 
 * Uses Gemini to analyze sign metadata (filename, sign_meaning, sign_number)
 * and generate rich educational content WITHOUT requiring image analysis.
 * This works for SVG files which Gemini vision cannot process.
 */

interface SignData {
  id: string;
  file_name: string;
  sign_meaning: string | null;
  sign_number: string | null;
  sign_name_en: string | null;
  sign_category: string | null;
}

interface HydratedMetadata {
  sign_name_en: string;
  sign_name_jp: string;
  expanded_meaning: string;
  driver_behavior: string;
  legal_context: string;
  gemini_category: string;
}

async function analyzeSignWithGemini(sign: SignData, apiKey: string): Promise<HydratedMetadata> {
  // Clean up raw HTML from sign_meaning
  const cleanMeaning = sign.sign_meaning 
    ? sign.sign_meaning.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : '';
  
  // Extract useful info from filename
  const cleanFilename = sign.file_name
    .replace(/\.(svg|png|jpg|gif)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const prompt = `You are an expert on Japanese road signs and traffic regulations. Analyze this road sign and provide educational content for driving test students.

SIGN INFORMATION:
- Filename: ${cleanFilename}
- Sign Number: ${sign.sign_number || 'Unknown'}
- Existing Description: ${cleanMeaning || 'None'}
- Current Category: ${sign.sign_category || 'Unknown'}

IMPORTANT CONTEXT FOR JAPANESE ROAD SIGNS:
- Sign numbers 300-399 are typically regulatory signs
- Sign 330 = Stop (一時停止/止まれ)
- Sign 326 = One Way (一方通行)
- Sign 302 = No Entry (車両進入禁止)
- Sign 323 = Maximum Speed
- Sign 316/317 = No Parking
- Sign 329 = Yield (徐行)
- Signs 400+ are often guidance/indication signs
- Expressway route signs (E1, E88, etc.) are guidance signs
- Road surface markings are their own category

Based on this information, provide a JSON response:
{
  "sign_name_en": "Clear English name for the sign",
  "sign_name_jp": "Japanese name with kanji if applicable",
  "expanded_meaning": "2-3 sentence educational explanation of what this sign means",
  "driver_behavior": "What specific action the driver must take",
  "legal_context": "Relevant penalties or regulations, or N/A",
  "gemini_category": "One of: regulatory, warning, indication, guidance, auxiliary, road-markings, traffic-signals"
}

Category rules:
- "regulatory": Stop, speed limits, no parking, no entry, one-way, etc.
- "warning": Curves, intersections, animals, slippery road, etc.
- "indication": Pedestrian crossing, hospital, parking zone, etc.
- "guidance": Direction signs, expressway route signs, distance markers
- "auxiliary": Supplementary plates (time limits, vehicle types)
- "road-markings": Paint on road surface (lanes, arrows, text)
- "traffic-signals": Traffic lights

Respond ONLY with valid JSON, no markdown or explanation.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API error for ${sign.id}:`, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error('No content in Gemini response');
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = textContent.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  }
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  const parsed = JSON.parse(jsonStr);
  return {
    sign_name_en: parsed.sign_name_en || cleanFilename,
    sign_name_jp: parsed.sign_name_jp || '',
    expanded_meaning: parsed.expanded_meaning || 'This sign provides important information for drivers.',
    driver_behavior: parsed.driver_behavior || 'Follow the instruction indicated by this sign.',
    legal_context: parsed.legal_context || 'N/A',
    gemini_category: parsed.gemini_category || sign.sign_category || 'regulatory',
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 20, forceRehydrate = false } = await req.json().catch(() => ({}));

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY or GOOGLE_AI_STUDIO_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Reset the incorrectly hydrated signs first (those with generic fallback text)
    if (forceRehydrate) {
      const { error: resetError } = await supabase
        .from('road_sign_images')
        .update({ ai_enhanced: false })
        .eq('expanded_meaning', 'This sign provides important information for drivers. Please study its meaning carefully.');
      
      if (resetError) {
        console.warn('Could not reset generic entries:', resetError.message);
      }
    }

    // Get count of remaining unhydrated signs
    const { count: remainingCount } = await supabase
      .from('road_sign_images')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)
      .eq('ai_enhanced', false);

    console.log(`📊 ${remainingCount} signs remaining to hydrate`);

    // Fetch batch of unhydrated signs
    const { data: signs, error: fetchError } = await supabase
      .from('road_sign_images')
      .select('id, file_name, sign_meaning, sign_number, sign_name_en, sign_category')
      .eq('is_verified', true)
      .eq('ai_enhanced', false)
      .limit(batchSize);

    if (fetchError) {
      throw new Error(`Failed to fetch signs: ${fetchError.message}`);
    }

    if (!signs || signs.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'All signs have been hydrated!', 
          processed: 0,
          remaining: 0,
          complete: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Processing batch of ${signs.length} signs...`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const sign of signs) {
      try {
        console.log(`🔄 Processing: ${sign.file_name}`);
        
        const metadata = await analyzeSignWithGemini(sign, GEMINI_API_KEY);

        // Update database
        const { error: updateError } = await supabase
          .from('road_sign_images')
          .update({
            sign_name_en: metadata.sign_name_en,
            sign_name_jp: metadata.sign_name_jp,
            expanded_meaning: metadata.expanded_meaning,
            driver_behavior: metadata.driver_behavior,
            legal_context: metadata.legal_context,
            gemini_category: metadata.gemini_category,
            ai_enhanced: true,
            ai_enhanced_at: new Date().toISOString(),
            flashcard_ready: true,
          })
          .eq('id', sign.id);

        if (updateError) {
          console.error(`Update error for ${sign.id}:`, updateError);
          errors.push(`${sign.file_name}: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Hydrated: ${metadata.sign_name_en} → ${metadata.gemini_category}`);
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${sign.file_name}:`, msg);
        errors.push(`${sign.file_name}: ${msg}`);
        errorCount++;
      }
    }

    // Get updated remaining count
    const { count: newRemainingCount } = await supabase
      .from('road_sign_images')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)
      .eq('ai_enhanced', false);

    return new Response(
      JSON.stringify({
        message: `Hydrated ${successCount} signs, ${errorCount} errors`,
        processed: signs.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 5),
        remaining: newRemainingCount || 0,
        complete: (newRemainingCount || 0) === 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Hydration error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
