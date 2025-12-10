import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Database Cleanup & Smart Hydration
 * 
 * 1. Deletes useless expressway/exit/route signs from database
 * 2. Hydrates remaining useful signs with Gemini AI
 */

// Japanese Road Sign Knowledge Base
const SIGN_DATABASE: Record<string, { en: string; jp: string; category: string; meaning: string; behavior: string; legal: string }> = {
  '302': { en: 'No Entry', jp: '車両進入禁止', category: 'regulatory', meaning: 'Vehicles are prohibited from entering this road from this direction.', behavior: 'Do not enter. Turn around or take an alternate route.', legal: 'Violation: Fine up to ¥70,000 or 3 months imprisonment. 2 penalty points.' },
  '303': { en: 'No Vehicles', jp: '車両通行止め', category: 'regulatory', meaning: 'All vehicles are prohibited from passing through this road.', behavior: 'Do not proceed. This road is closed to all vehicle traffic.', legal: 'Violation: Fine up to ¥70,000. 2 penalty points.' },
  '310': { en: 'No Trucks', jp: '大型貨物自動車等通行止め', category: 'regulatory', meaning: 'Large trucks and freight vehicles are prohibited.', behavior: 'Large trucks must use an alternate route.', legal: 'Violation for trucks: Fine and penalty points.' },
  '311': { en: 'No Specific Vehicles', jp: '特定車両通行止め', category: 'regulatory', meaning: 'Specific types of vehicles shown are prohibited.', behavior: 'Check the sign for prohibited vehicle types.', legal: 'Violation: Fine up to ¥70,000.' },
  '314': { en: 'No Passing', jp: '追越し禁止', category: 'regulatory', meaning: 'Overtaking or passing other vehicles is prohibited.', behavior: 'Stay behind the vehicle in front. Do not attempt to pass.', legal: 'Violation: Fine up to ¥90,000. 2 penalty points.' },
  '316': { en: 'No Parking', jp: '駐車禁止', category: 'regulatory', meaning: 'Parking is prohibited. Brief stopping to load/unload may be permitted.', behavior: 'Do not park your vehicle here. Brief stops may be allowed.', legal: 'Violation: Fine ¥15,000. Towing possible.' },
  '317': { en: 'No Stopping', jp: '駐停車禁止', category: 'regulatory', meaning: 'Both parking and stopping are prohibited at all times.', behavior: 'Do not stop your vehicle for any reason.', legal: 'Violation: Fine ¥18,000. Immediate towing.' },
  '318': { en: 'Time-Limited Parking', jp: '時間制限駐車区間', category: 'regulatory', meaning: 'Parking is allowed for a limited time only (usually shown on sign).', behavior: 'Check the time limit. Move vehicle before time expires.', legal: 'Exceeding time limit: Fine ¥15,000.' },
  '319': { en: 'Parking Area', jp: '駐車可', category: 'indication', meaning: 'Parking is permitted in this area.', behavior: 'You may park here following local regulations.', legal: 'Follow any time restrictions shown.' },
  '320': { en: 'Slow Down', jp: '徐行', category: 'regulatory', meaning: 'Reduce speed and proceed with caution.', behavior: 'Slow down to a speed where you can stop immediately if needed.', legal: 'Typically under 10 km/h. Violation may result in penalty points.' },
  '323': { en: 'Maximum Speed Limit', jp: '最高速度', category: 'regulatory', meaning: 'The maximum speed allowed on this road (number shown on sign).', behavior: 'Do not exceed the speed shown. Adjust for conditions.', legal: 'Speeding fines vary by amount over limit. Points: 1-12.' },
  '326': { en: 'One-Way', jp: '一方通行', category: 'regulatory', meaning: 'Traffic flows in one direction only as indicated by the arrow.', behavior: 'Drive only in the direction of the arrow. Do not enter from wrong end.', legal: 'Wrong-way driving: Serious violation with heavy penalties.' },
  '327': { en: 'Designated Direction Only', jp: '指定方向外進行禁止', category: 'regulatory', meaning: 'You must proceed only in the direction(s) shown by the arrow(s).', behavior: 'Follow the arrow direction. Other directions are prohibited.', legal: 'Violation: Fine up to ¥70,000. 2 penalty points.' },
  '328': { en: 'No U-Turn', jp: '転回禁止', category: 'regulatory', meaning: 'U-turns are not permitted at this location.', behavior: 'Continue forward. Find another legal place to turn around.', legal: 'Violation: Fine up to ¥70,000. 1 penalty point.' },
  '329': { en: 'Yield', jp: '徐行', category: 'regulatory', meaning: 'Slow down and yield to other traffic. Be prepared to stop.', behavior: 'Reduce speed significantly. Give way to crossing traffic.', legal: 'Failure to yield: Fine and penalty points.' },
  '330': { en: 'Stop', jp: '一時停止 / 止まれ', category: 'regulatory', meaning: 'Come to a complete stop. Check for traffic before proceeding.', behavior: 'Stop completely. Look left, right, left again. Proceed when safe.', legal: 'Failure to stop: Fine ¥7,000. 2 penalty points.' },
  '331': { en: 'Yield to Pedestrians', jp: '歩行者専用', category: 'regulatory', meaning: 'This area or crossing is for pedestrians. Vehicles must yield.', behavior: 'Always stop for pedestrians. Wait until crossing is clear.', legal: 'Failing to yield to pedestrians: Serious violation.' },
  
  // Warning signs (200 series)
  '201': { en: 'Cross Road Ahead', jp: '十形道路交差点あり', category: 'warning', meaning: 'A cross intersection is ahead. Prepare for crossing traffic.', behavior: 'Slow down and watch for vehicles from side roads.', legal: 'Be prepared to yield as required.' },
  '202': { en: 'Priority Road Intersection', jp: '優先道路交差点', category: 'warning', meaning: 'Intersection with a priority road ahead.', behavior: 'Prepare to yield to traffic on the priority road.', legal: 'Failure to yield on priority road: Fine and points.' },
  '203': { en: 'T-Junction', jp: 'T形道路交差点あり', category: 'warning', meaning: 'A T-shaped intersection is ahead.', behavior: 'Slow down and check for traffic at the junction.', legal: 'Follow right-of-way rules.' },
  '204': { en: 'Y-Junction', jp: 'Y形道路交差点あり', category: 'warning', meaning: 'A Y-shaped junction is ahead.', behavior: 'Choose your lane early and watch for merging traffic.', legal: 'Signal early and merge safely.' },
  '205': { en: 'Roundabout Ahead', jp: 'ロータリーあり', category: 'warning', meaning: 'A roundabout/rotary is ahead.', behavior: 'Slow down. Yield to traffic already in the roundabout.', legal: 'Yield to vehicles on your left in the circle.' },
  '206': { en: 'Railway Crossing', jp: '踏切あり', category: 'warning', meaning: 'A railway crossing is ahead. Trains may be passing.', behavior: 'Slow down. Stop if signals are active. Never cross when gates are down.', legal: 'Crossing with gates down: Serious criminal offense.' },
  '207': { en: 'School Zone', jp: '学校、幼稚園、保育所等あり', category: 'warning', meaning: 'School or kindergarten nearby. Children may be crossing.', behavior: 'Reduce speed. Watch carefully for children.', legal: 'Speed limits may be reduced. Extra vigilance required.' },
  '208': { en: 'Curve Ahead', jp: '右（左）方屈曲あり', category: 'warning', meaning: 'A curve or bend in the road is ahead.', behavior: 'Reduce speed before entering the curve. Stay in your lane.', legal: 'Adjust speed for safe curve navigation.' },
  '209': { en: 'Winding Road', jp: '右（左）方屈折あり', category: 'warning', meaning: 'Multiple curves ahead. Road winds in the direction shown.', behavior: 'Reduce speed and be prepared for changing directions.', legal: 'Maintain safe speed through curves.' },
  '211': { en: 'Steep Hill Ahead', jp: '上り急勾配あり', category: 'warning', meaning: 'A steep uphill or downhill grade is ahead.', behavior: 'Use appropriate gear. Control speed on descents.', legal: 'Use engine braking on long descents.' },
  '212': { en: 'Slippery Road', jp: 'すべりやすい', category: 'warning', meaning: 'Road surface may be slippery, especially when wet.', behavior: 'Reduce speed. Avoid sudden braking or steering.', legal: 'Adjust driving for conditions.' },
  '214': { en: 'Falling Rocks', jp: '落石のおそれあり', category: 'warning', meaning: 'Rocks may fall onto the roadway in this area.', behavior: 'Watch for debris. Do not stop in marked zones.', legal: 'Pass through quickly when safe.' },
  '215': { en: 'Road Narrows', jp: '幅員減少', category: 'warning', meaning: 'The road becomes narrower ahead.', behavior: 'Prepare to merge. Yield to oncoming traffic if needed.', legal: 'May need to wait for clearance.' },

  // Indication signs (400 series)  
  '406': { en: 'Pedestrian Crossing', jp: '横断歩道', category: 'indication', meaning: 'A pedestrian crossing is at this location.', behavior: 'Watch for pedestrians. Stop and yield to anyone crossing.', legal: 'Failure to yield to pedestrians: Fine ¥9,000. 2 points.' },
  '407': { en: 'Pedestrian and Bicycle Crossing', jp: '自転車横断帯', category: 'indication', meaning: 'Crossing for both pedestrians and bicycles.', behavior: 'Yield to both pedestrians and cyclists at the crossing.', legal: 'Same penalties as pedestrian crossing violations.' },
  '408': { en: 'Safety Zone', jp: '安全地帯', category: 'indication', meaning: 'A protected area for pedestrians, often at tram stops.', behavior: 'Do not drive into the safety zone. Yield to pedestrians.', legal: 'Never enter safety zones with vehicle.' },

  // Auxiliary signs (500 series)
  '501': { en: 'Distance Plate', jp: '距離・区域', category: 'auxiliary', meaning: 'Shows the distance over which a regulation applies.', behavior: 'The main sign applies for the distance shown.', legal: 'Regulation active for indicated distance.' },
  '502': { en: 'Direction Plate', jp: '日・時間', category: 'auxiliary', meaning: 'Shows days or times when regulation applies.', behavior: 'Check times carefully. Regulation may not always apply.', legal: 'Violation only during indicated times.' },
  '503': { en: 'Vehicle Type', jp: '車両の種類', category: 'auxiliary', meaning: 'Indicates which vehicle types the sign applies to.', behavior: 'Check if your vehicle type is affected by the regulation.', legal: 'Different vehicles may have different rules.' },
  '507': { en: 'Beginning/End', jp: '始まり/終わり', category: 'auxiliary', meaning: 'Marks the beginning or end of a regulated zone.', behavior: 'Note where regulations start and end.', legal: 'Zone-specific rules apply within marked area.' },
  '508': { en: 'Time Restriction', jp: '時間制限', category: 'auxiliary', meaning: 'Specifies time periods when main sign regulation applies.', behavior: 'Check hours. Regulation may only apply at certain times.', legal: 'Outside hours, main regulation may not apply.' },
};

async function hydrateSignWithGemini(
  sign: { id: string; file_name: string; sign_number: string | null; sign_meaning: string | null },
  apiKey: string
): Promise<{
  sign_name_en: string;
  sign_name_jp: string;
  expanded_meaning: string;
  driver_behavior: string;
  legal_context: string;
  gemini_category: string;
  sign_number: string | null;
}> {
  // First check if we have this sign in our knowledge base
  const signNum = sign.sign_number?.replace(/[^0-9]/g, '') || '';
  const knownSign = SIGN_DATABASE[signNum];
  
  if (knownSign) {
    console.log(`✅ Using knowledge base for sign ${signNum}: ${knownSign.en}`);
    return {
      sign_name_en: knownSign.en,
      sign_name_jp: knownSign.jp,
      expanded_meaning: knownSign.meaning,
      driver_behavior: knownSign.behavior,
      legal_context: knownSign.legal,
      gemini_category: knownSign.category,
      sign_number: signNum,
    };
  }

  // Extract sign number from filename if not in database
  const filenameMatch = sign.file_name.match(/(?:sign[_\s]*)?(\d{3})(?:[_\s-]|$)/i);
  const extractedNum = filenameMatch?.[1] || '';
  const extractedKnown = SIGN_DATABASE[extractedNum];
  
  if (extractedKnown) {
    console.log(`✅ Using knowledge base for extracted sign ${extractedNum}: ${extractedKnown.en}`);
    return {
      sign_name_en: extractedKnown.en,
      sign_name_jp: extractedKnown.jp,
      expanded_meaning: extractedKnown.meaning,
      driver_behavior: extractedKnown.behavior,
      legal_context: extractedKnown.legal,
      gemini_category: extractedKnown.category,
      sign_number: extractedNum,
    };
  }

  // For unknown signs, use Gemini AI
  const cleanFilename = sign.file_name
    .replace(/\.(svg|png|jpg|gif)$/i, '')
    .replace(/[-_]/g, ' ')
    .trim();

  const prompt = `Analyze this Japanese road sign based on filename and provide accurate educational content.

FILENAME: ${cleanFilename}
SIGN NUMBER: ${sign.sign_number || 'Unknown'}
EXISTING INFO: ${sign.sign_meaning?.replace(/<[^>]*>/g, '') || 'None'}

Provide JSON with:
{
  "sign_name_en": "Clear English name",
  "sign_name_jp": "Japanese name with kanji",
  "expanded_meaning": "Educational explanation (2-3 sentences)",
  "driver_behavior": "What driver must do",
  "legal_context": "Penalties if applicable, or 'N/A'",
  "gemini_category": "regulatory|warning|indication|guidance|auxiliary|road-markings|traffic-signals"
}

Japanese road sign number ranges:
- 300-399: Regulatory (stop, speed, no parking, one-way)
- 200-299: Warning (curves, intersections, school zones)
- 400-499: Indication (crossings, safety zones)
- 100-199: Guidance (direction, route info)
- 500-599: Auxiliary (time/distance plates)

Return ONLY valid JSON.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  let text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Clean JSON
  if (text.includes('```')) {
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }

  const parsed = JSON.parse(text);
  return {
    sign_name_en: parsed.sign_name_en || cleanFilename,
    sign_name_jp: parsed.sign_name_jp || '',
    expanded_meaning: parsed.expanded_meaning || 'Important traffic sign. Study its meaning.',
    driver_behavior: parsed.driver_behavior || 'Follow the sign\'s instruction.',
    legal_context: parsed.legal_context || 'N/A',
    gemini_category: parsed.gemini_category || 'regulatory',
    sign_number: extractedNum || sign.sign_number,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'hydrate', batchSize = 15 } = await req.json().catch(() => ({}));

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_AI_STUDIO_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ACTION: cleanup - Delete useless expressway/exit signs
    if (action === 'cleanup') {
      console.log('🧹 Starting database cleanup...');
      
      const { data: junkSigns, error: fetchError } = await supabase
        .from('road_sign_images')
        .select('id, file_name')
        .or(`file_name.ilike.%exit%,file_name.ilike.%_exp%,file_name.ilike.%expwy%,file_name.ilike.%_e1%,file_name.ilike.%_e2%,file_name.ilike.%_e3%,file_name.ilike.%_e4%,file_name.ilike.%route_sign%,file_name.ilike.%_e5%,file_name.ilike.%_e6%,file_name.ilike.%_e7%,file_name.ilike.%_e8%,file_name.ilike.%_e9%`)
        .eq('is_verified', true);

      if (fetchError) throw fetchError;

      const junkIds = (junkSigns || []).map(s => s.id);
      console.log(`Found ${junkIds.length} junk signs to delete`);

      if (junkIds.length > 0) {
        // Delete in batches
        for (let i = 0; i < junkIds.length; i += 100) {
          const batch = junkIds.slice(i, i + 100);
          const { error: deleteError } = await supabase
            .from('road_sign_images')
            .delete()
            .in('id', batch);
          
          if (deleteError) {
            console.error('Delete error:', deleteError);
          } else {
            console.log(`Deleted batch ${i/100 + 1}: ${batch.length} records`);
          }
        }
      }

      // Get remaining count
      const { count } = await supabase
        .from('road_sign_images')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      return new Response(
        JSON.stringify({
          action: 'cleanup',
          deleted: junkIds.length,
          remaining: count || 0,
          message: `Deleted ${junkIds.length} junk signs. ${count} useful signs remain.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: hydrate - Add AI-enhanced metadata to remaining signs
    if (action === 'hydrate') {
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      // Get unhydrated signs
      const { data: signs, error: fetchError } = await supabase
        .from('road_sign_images')
        .select('id, file_name, sign_number, sign_meaning, sign_name_en, sign_category')
        .eq('is_verified', true)
        .eq('ai_enhanced', false)
        .limit(batchSize);

      if (fetchError) throw fetchError;

      if (!signs || signs.length === 0) {
        const { count } = await supabase
          .from('road_sign_images')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', true)
          .eq('ai_enhanced', true);

        return new Response(
          JSON.stringify({
            action: 'hydrate',
            message: 'All signs hydrated!',
            processed: 0,
            total_hydrated: count || 0,
            complete: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`🔄 Hydrating ${signs.length} signs...`);

      let success = 0;
      let errors = 0;

      for (const sign of signs) {
        try {
          const metadata = await hydrateSignWithGemini(sign, GEMINI_API_KEY);

          const { error: updateError } = await supabase
            .from('road_sign_images')
            .update({
              sign_name_en: metadata.sign_name_en,
              sign_name_jp: metadata.sign_name_jp,
              sign_number: metadata.sign_number || sign.sign_number,
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
            console.error(`Update failed for ${sign.file_name}:`, updateError);
            errors++;
          } else {
            console.log(`✅ ${metadata.sign_name_en} (${metadata.gemini_category})`);
            success++;
          }

          await new Promise(r => setTimeout(r, 200));
        } catch (err) {
          console.error(`Failed: ${sign.file_name}`, err);
          errors++;
        }
      }

      // Get remaining count
      const { count: remaining } = await supabase
        .from('road_sign_images')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true)
        .eq('ai_enhanced', false);

      return new Response(
        JSON.stringify({
          action: 'hydrate',
          processed: signs.length,
          success,
          errors,
          remaining: remaining || 0,
          complete: (remaining || 0) === 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: status - Get current status
    const { data: stats } = await supabase
      .from('road_sign_images')
      .select('gemini_category, ai_enhanced')
      .eq('is_verified', true);

    const categories: Record<string, number> = {};
    let hydrated = 0;
    let total = 0;

    for (const s of stats || []) {
      total++;
      if (s.ai_enhanced) hydrated++;
      const cat = s.gemini_category || 'unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    }

    return new Response(
      JSON.stringify({
        action: 'status',
        total,
        hydrated,
        unhydrated: total - hydrated,
        categories,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
