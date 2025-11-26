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
 * Find a Wikimedia Commons image from the database using ALL available metadata columns
 * Tries multiple matching strategies in order of specificity:
 * 1. Filename matching (file_name, filename_slug, wikimedia_file_name)
 * 2. Sign number matching (326 for stop, 124 for bus, etc.)
 * 3. Sign name matching (sign_name_en, sign_name_jp)
 * 4. Category + query term matching
 * 5. wikimedia_raw JSONB search
 * 6. Tags matching
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
    const searchQuery = query ? query.toLowerCase().trim() : '';
    const queryTerms = searchQuery ? searchQuery.split(/\s+/)
      .filter(term => term.length >= 2 && !['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'japan', 'japanese', 'road', 'sign'].includes(term))
      .sort((a, b) => b.length - a.length)
      : [];
    
    // Parse sign number from query
    const { signNumber, signType } = parseSignNumber(searchQuery);
    
    console.log(`🔍 Looking up image: query="${query}", category="${category}", signNumber="${signNumber}", signType="${signType}", terms=[${queryTerms.join(', ')}]`);
    
    const baseQuery = supabase
      .from('road_sign_images')
      .select('storage_url, id, attribution_text, license_info, wikimedia_page_url, artist_name')
      .eq('image_source', 'wikimedia_commons')
      .eq('is_verified', true);
    
    // Strategy 1: Filename matching (most accurate - uses actual stored filenames)
    if (searchQuery) {
      const filenameTerms = [...queryTerms];
      if (signNumber) filenameTerms.push(signNumber);
      if (signType) filenameTerms.push(signType);
      
      for (const term of filenameTerms) {
        // Search in file_name, filename_slug, and wikimedia_file_name
        let filenameQuery = baseQuery
          .or(`file_name.ilike.%${term}%,filename_slug.ilike.%${term}%,wikimedia_file_name.ilike.%${term}%`)
          .order('usage_count', { ascending: false })
          .limit(1);
        
        if (category) {
          filenameQuery = filenameQuery.eq('sign_category', category);
        }
        
        const { data: filenameMatch, error: filenameError } = await filenameQuery.maybeSingle();
        
        if (!filenameError && filenameMatch) {
          console.log(`✅ Found by filename match: "${term}" (${filenameMatch.id})`);
          return filenameMatch;
        }
      }
    }
    
    // Strategy 2: Sign number matching (for known sign numbers like 326 for stop)
    if (signNumber) {
      let signNumberQuery = baseQuery
        .or(`file_name.ilike.%${signNumber}%,filename_slug.ilike.%${signNumber}%,wikimedia_file_name.ilike.%${signNumber}%,sign_name_en.ilike.%${signNumber}%`)
        .order('usage_count', { ascending: false })
        .limit(1);
      
      if (category) {
        signNumberQuery = signNumberQuery.eq('sign_category', category);
      }
      
      const { data: numberMatch, error: numberError } = await signNumberQuery.maybeSingle();
      
      if (!numberError && numberMatch) {
        console.log(`✅ Found by sign number: "${signNumber}" (${numberMatch.id})`);
        return numberMatch;
      }
    }
    
    // Strategy 3: Sign name matching (sign_name_en, sign_name_jp)
    if (query && queryTerms.length > 0) {
      for (const term of queryTerms) {
        let nameQuery = baseQuery
          .or(`sign_name_en.ilike.%${term}%,sign_name_jp.ilike.%${term}%`)
          .order('usage_count', { ascending: false })
          .limit(1);
        
        if (category) {
          nameQuery = nameQuery.eq('sign_category', category);
        }
        
        const { data: nameMatch, error: nameError } = await nameQuery.maybeSingle();
        
        if (!nameError && nameMatch) {
          console.log(`✅ Found by sign name: "${term}" (${nameMatch.id})`);
          return nameMatch;
        }
      }
    }
    
    // Strategy 4: Tags matching
    if (query && queryTerms.length > 0) {
      for (const term of queryTerms) {
        let tagQuery = baseQuery
          .contains('tags', [term])
          .order('usage_count', { ascending: false })
          .limit(1);
        
        if (category) {
          tagQuery = tagQuery.eq('sign_category', category);
        }
        
        const { data: tagMatch, error: tagError } = await tagQuery.maybeSingle();
        
        if (!tagError && tagMatch) {
          console.log(`✅ Found by tags: "${term}" (${tagMatch.id})`);
          return tagMatch;
        }
      }
    }
    
    // Strategy 5: Full query string search across all text fields
    if (searchQuery.length >= 3) {
      let fullQuery = baseQuery
        .or(`file_name.ilike.%${searchQuery}%,filename_slug.ilike.%${searchQuery}%,wikimedia_file_name.ilike.%${searchQuery}%,sign_name_en.ilike.%${searchQuery}%,sign_name_jp.ilike.%${searchQuery}%`)
        .order('usage_count', { ascending: false })
        .limit(1);
      
      if (category) {
        fullQuery = fullQuery.eq('sign_category', category);
      }
      
      const { data: fullMatch, error: fullError } = await fullQuery.maybeSingle();
      
      if (!fullError && fullMatch) {
        console.log(`✅ Found by full query: "${searchQuery}" (${fullMatch.id})`);
        return fullMatch;
      }
    }
    
    // Strategy 6: Category-only search (broadest, least specific)
    if (category) {
      const { data: categoryMatch, error: categoryError } = await baseQuery
        .eq('sign_category', category)
        .order('usage_count', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!categoryError && categoryMatch) {
        console.log(`⚠️ Found by category only: "${category}" (${categoryMatch.id})`);
        return categoryMatch;
      }
    }
    
    console.log(`❌ No match found for: category="${category}", query="${query}"`);
    return null;
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

