import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

/**
 * Parse query to extract sign numbers and types
 * Maps common queries to Japanese road sign numbers
 */
function parseSignNumber(query: string): { signNumber?: string; signType?: string } {
  const lowerQuery = query.toLowerCase();
  
  // Japanese road sign number mappings
  const signMappings: { [key: string]: { number: string; type: string } } = {
    'stop': { number: '326', type: 'stop' },
    'stop sign': { number: '326', type: 'stop' },
    '止まれ': { number: '326', type: 'stop' },
    'tomare': { number: '326', type: 'stop' },
    'bus': { number: '124', type: 'bus' },
    'バス': { number: '124', type: 'bus' },
    'speed limit': { number: '209', type: 'speed' },
    'no entry': { number: '331', type: 'no-entry' },
    '進入禁止': { number: '331', type: 'no-entry' },
    'no parking': { number: '318', type: 'no-parking' },
    '駐車禁止': { number: '318', type: 'no-parking' },
  };
  
  // Check for direct matches
  for (const [key, value] of Object.entries(signMappings)) {
    if (lowerQuery.includes(key)) {
      return { signNumber: value.number, signType: value.type };
    }
  }
  
  // Extract numbers from query (e.g., "326", "124-A")
  const numberMatch = lowerQuery.match(/\b(\d{3}(?:[-_]\w+)?)\b/);
  if (numberMatch) {
    return { signNumber: numberMatch[1].replace(/[-_]/g, '_'), signType: undefined };
  }
  
  return {};
}

/**
 * Find a Wikimedia Commons image from the database using the refined 6-tier search algorithm
 * 
 * The algorithm uses a comprehensive multi-layer approach:
 * Tier 1: Exact sign_code match (most accurate) - e.g., "326" for stop sign
 * Tier 2: Filename match (cleanest metadata) - file_name, filename_slug, wikimedia_file_name
 * Tier 3: Keyword Synonym Match - English + Japanese + romaji names
 * Tier 4: Tags Match - tags array automatically extracted
 * Tier 5: Category Match - regulatory, warning, prohibitory, markings, expressway, etc.
 * Tier 6: Vector / Semantic Search Fallback - embedding search across everything
 * 
 * @param supabase - Supabase client instance
 * @param category - Sign category (regulatory, warning, indication, guidance, auxiliary, road-markings)
 * @param query - Search query (sign name or description)
 * @returns Image URL or null if not found
 */
export async function findWikimediaImage(
  supabase: ReturnType<typeof createClient>,
  category?: string | null,
  query?: string | null
): Promise<{ 
  storage_url: string; 
  id: string;
  attribution_text?: string;
  license_info?: string;
  wikimedia_page_url?: string;
  artist_name?: string;
} | null> {
  try {
    // Build search query - include category if provided
    let searchQuery = query || '';
    
    // If category is provided, prepend it to help with category detection in the function
    if (category && searchQuery) {
      searchQuery = `${category} ${searchQuery}`;
    } else if (category) {
      searchQuery = category;
    }
    
    if (!searchQuery || !searchQuery.trim()) {
      console.log(`⚠️ Empty search query provided`);
      return null;
    }
    
    console.log(`🔍 Using 6-tier search algorithm: query="${query}", category="${category}", combined="${searchQuery}"`);
    
    // Use the new comprehensive search_road_signs RPC function
    // This function implements all 6 tiers of matching with intelligent scoring
    const { data: results, error: searchError } = await supabase
      .rpc('search_road_signs', { q: searchQuery });
    
    if (searchError) {
      console.error(`❌ Error calling search_road_signs RPC:`, searchError);
      return null;
    }
    
    if (!results || results.length === 0) {
      console.log(`❌ No match found for: category="${category}", query="${query}"`);
      return null;
    }
    
    // Get the top result (highest score)
    const topResult = results[0];
    console.log(`✅ Found match using 6-tier algorithm: score=${topResult.score}, id=${topResult.id}, file_name=${topResult.file_name}`);
    
    // Increment usage count for the selected image
    if (topResult.id) {
      await incrementImageUsage(supabase, topResult.id);
    }
    
    return {
      storage_url: topResult.storage_url,
      id: topResult.id,
      attribution_text: topResult.attribution_text || undefined,
      license_info: topResult.license_info || undefined,
      wikimedia_page_url: topResult.wikimedia_page_url || undefined,
      artist_name: topResult.artist_name || undefined,
    };
  } catch (error) {
    console.error('Error finding Wikimedia image:', error);
    return null;
  }
}

/**
 * Map flashcard category to database category
 */
export function mapFlashcardCategoryToDbCategory(category: string): string | null {
  const categoryMap: { [key: string]: string } = {
    'regulatory-signs': 'regulatory',
    'warning-signs': 'warning',
    'indication-signs': 'indication',
    'guidance-signs': 'guidance',
    'auxiliary-signs': 'auxiliary',
    'road-markings': 'road-markings',
    'traffic-signals': null, // No matching category in database yet
  };
  
  return categoryMap[category] || null;
}

/**
 * Increment usage count for an image
 */
export async function incrementImageUsage(
  supabase: ReturnType<typeof createClient>,
  imageId: string
): Promise<void> {
  try {
    // Try RPC first
    const { error: rpcError } = await supabase.rpc('increment_image_usage', { image_id: imageId });
    if (!rpcError) {
      return; // Success
    }
  } catch (error) {
    // RPC doesn't exist or failed, continue to direct update
  }
  
  // Fallback: Update directly using SQL increment
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('road_sign_images')
      .select('usage_count')
      .eq('id', imageId)
      .single();
    
    if (fetchError || !currentData) {
      console.error('Error fetching current usage count:', fetchError);
      return;
    }
    
    const { error: updateError } = await supabase
      .from('road_sign_images')
      .update({ usage_count: (currentData.usage_count || 0) + 1 })
      .eq('id', imageId);
    
    if (updateError) {
      console.error('Error incrementing image usage:', updateError);
    }
  } catch (error) {
    console.error('Error in incrementImageUsage fallback:', error);
  }
}

