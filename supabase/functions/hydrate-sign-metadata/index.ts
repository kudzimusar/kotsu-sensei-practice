import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * AI Hydration Function
 * 
 * Uses Gemini to analyze road sign images and populate:
 * - sign_name_en (clean English name)
 * - sign_name_jp (Japanese name)
 * - expanded_meaning (detailed explanation)
 * - driver_behavior (what driver should do)
 * - legal_context (relevant regulations)
 * - gemini_category (normalized category)
 */

interface SignData {
  id: string;
  storage_url: string;
  file_name: string;
  sign_meaning: string | null;
  sign_number: string | null;
}

async function analyzeSignWithGemini(
  sign: SignData,
  apiKey: string
): Promise<{
  sign_name_en: string;
  sign_name_jp: string;
  expanded_meaning: string;
  driver_behavior: string;
  legal_context: string;
  gemini_category: string;
}> {
  const prompt = `Analyze this Japanese road sign image and provide educational content for drivers studying for the Japanese driver's license exam.

Current metadata:
- File name: ${sign.file_name}
- Sign number: ${sign.sign_number || 'Unknown'}
- Raw meaning: ${sign.sign_meaning || 'None'}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "sign_name_en": "Clear, concise English name (e.g., 'Stop Sign', 'No Parking', 'Pedestrian Crossing')",
  "sign_name_jp": "Japanese name with kanji (e.g., '一時停止', '駐車禁止', '横断歩道')",
  "expanded_meaning": "2-3 sentence explanation of what this sign means and its purpose (educational, clear)",
  "driver_behavior": "What the driver must do when seeing this sign (specific actions)",
  "legal_context": "Brief mention of relevant regulations or penalties if applicable",
  "gemini_category": "One of: regulatory, warning, indication, guidance, auxiliary, road-markings, traffic-signals"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: sign.storage_url.endsWith('.svg') ? 'image/svg+xml' : 
                             sign.storage_url.endsWith('.png') ? 'image/png' : 'image/jpeg',
                  data: await fetchImageAsBase64(sign.storage_url)
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error for ${sign.id}:`, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    const result = JSON.parse(jsonStr.trim());
    
    return {
      sign_name_en: result.sign_name_en || 'Road Sign',
      sign_name_jp: result.sign_name_jp || '',
      expanded_meaning: result.expanded_meaning || '',
      driver_behavior: result.driver_behavior || '',
      legal_context: result.legal_context || '',
      gemini_category: result.gemini_category || 'regulatory',
    };
  } catch (error) {
    console.error(`Error analyzing sign ${sign.id}:`, error);
    // Return fallback values based on filename
    const cleanName = sign.file_name
      .replace(/[-_]/g, ' ')
      .replace(/\.(svg|png|jpg|gif)/gi, '')
      .replace(/^japan(ese)?\s*(road\s*)?(sign\s*)?/i, '')
      .trim();
    
    return {
      sign_name_en: cleanName || 'Road Sign',
      sign_name_jp: '',
      expanded_meaning: `This sign provides important information for drivers. Please study its meaning carefully.`,
      driver_behavior: 'Follow the instruction indicated by this sign.',
      legal_context: '',
      gemini_category: 'regulatory',
    };
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchSize = 10, category = null } = await req.json();
    
    console.log(`🔬 Starting AI hydration: batchSize=${batchSize}, category=${category}`);
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_AI_STUDIO_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }
    
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_AI_STUDIO_API_KEY not configured');
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    
    // Find signs that need hydration (missing expanded_meaning)
    let query = supabase
      .from('road_sign_images')
      .select('id, storage_url, file_name, sign_meaning, sign_number')
      .eq('is_verified', true)
      .eq('image_source', 'wikimedia_commons')
      .is('expanded_meaning', null)
      .order('usage_count', { ascending: false, nullsFirst: false })
      .limit(batchSize);
    
    if (category) {
      query = query.or(`sign_category.eq.${category},gemini_category.eq.${category}`);
    }
    
    const { data: signs, error: queryError } = await query;
    
    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }
    
    if (!signs || signs.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No signs need hydration',
          processed: 0,
          remaining: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`📸 Found ${signs.length} signs to hydrate`);
    
    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    // Process signs with rate limiting (1 per second to avoid API limits)
    for (const sign of signs) {
      try {
        console.log(`🔄 Processing: ${sign.file_name}`);
        
        const metadata = await analyzeSignWithGemini(sign, GEMINI_API_KEY);
        
        // Update the database
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
          })
          .eq('id', sign.id);
        
        if (updateError) {
          console.error(`Update error for ${sign.id}:`, updateError);
          results.errors.push(`${sign.file_name}: ${updateError.message}`);
          results.failed++;
        } else {
          console.log(`✅ Hydrated: ${metadata.sign_name_en}`);
          results.success++;
        }
        
        results.processed++;
        
        // Rate limit: wait 1 second between API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing ${sign.id}:`, error);
        results.errors.push(`${sign.file_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.failed++;
        results.processed++;
      }
    }
    
    // Get remaining count
    const { count: remaining } = await supabase
      .from('road_sign_images')
      .select('id', { count: 'exact', head: true })
      .eq('is_verified', true)
      .eq('image_source', 'wikimedia_commons')
      .is('expanded_meaning', null);
    
    console.log(`🎉 Hydration complete: ${results.success}/${results.processed} success, ${remaining || 0} remaining`);
    
    return new Response(
      JSON.stringify({
        message: `Hydrated ${results.success} signs`,
        ...results,
        remaining: remaining || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Hydration error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
