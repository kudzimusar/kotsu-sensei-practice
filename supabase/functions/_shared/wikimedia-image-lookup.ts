import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

/**
 * Find a Wikimedia Commons image from the database
 * Tries multiple matching strategies in order:
 * 1. Exact category match
 * 2. Sign name match (English or Japanese)
 * 3. Tags match
 * 
 * @param supabase - Supabase client instance
 * @param category - Sign category (regulatory, warning, indication, guidance, auxiliary, road-markings)
 * @param query - Search query (sign name or description)
 * @returns Image URL or null if not found
 */
export async function findWikimediaImage(
  supabase: any,
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
    // Extract key terms from query for better matching
    const searchQuery = query ? query.toLowerCase().trim() : '';
    // Filter out common words and keep meaningful terms (length >= 2, but prioritize longer terms)
    const queryTerms = searchQuery ? searchQuery.split(/\s+/)
      .filter(term => term.length >= 2 && !['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being'].includes(term))
      .sort((a, b) => b.length - a.length) // Prioritize longer terms first
      : [];
    
    console.log(`Looking up image for query: "${query}", category: "${category}", terms: [${queryTerms.join(', ')}]`);
    
    // If we have a query, prioritize name/tag matching over category-only matching
    if (query && queryTerms.length > 0) {
      // Strategy 1: Try exact name match with category filter (most specific)
      if (category) {
      for (const term of queryTerms) {
        const { data: exactMatch, error: exactError } = await supabase
          .from('road_sign_images')
          .select('storage_url, id, attribution_text, license_info, wikimedia_page_url, artist_name')
          .eq('image_source', 'wikimedia_commons')
          .eq('is_verified', true)
          .eq('sign_category', category)
          .or(`sign_name_en.ilike.%${term}%,sign_name_jp.ilike.%${term}%,sign_meaning.ilike.%${term}%`)
          .order('usage_count', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!exactError && exactMatch) {
          console.log(`Found Wikimedia image by name+category match: ${term} in ${category}`);
          return exactMatch;
        }
      }
      }

      // Strategy 2: Try name match without category (broader)
      for (const term of queryTerms) {
        const { data: nameMatch, error: nameError } = await supabase
          .from('road_sign_images')
          .select('storage_url, id, attribution_text, license_info, wikimedia_page_url, artist_name')
          .eq('image_source', 'wikimedia_commons')
          .eq('is_verified', true)
          .or(`sign_name_en.ilike.%${term}%,sign_name_jp.ilike.%${term}%,sign_meaning.ilike.%${term}%`)
          .order('usage_count', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!nameError && nameMatch) {
          console.log(`Found Wikimedia image by name match: ${term}`);
          return nameMatch;
        }
      }

      // Strategy 3: Try tags match with category filter
      if (category) {
        for (const term of queryTerms) {
          const { data: tagMatch, error: tagError } = await supabase
            .from('road_sign_images')
            .select('storage_url, id, attribution_text, license_info, wikimedia_page_url, artist_name')
            .eq('image_source', 'wikimedia_commons')
            .eq('is_verified', true)
            .eq('sign_category', category)
            .contains('tags', [term])
            .order('usage_count', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!tagError && tagMatch) {
            console.log(`Found Wikimedia image by tag+category match: ${term} in ${category}`);
            return tagMatch;
          }
        }
      }

      // Strategy 4: Try tags match without category
      for (const term of queryTerms) {
        const { data: tagMatch, error: tagError } = await supabase
          .from('road_sign_images')
          .select('storage_url, id, attribution_text, license_info, wikimedia_page_url, artist_name')
          .eq('image_source', 'wikimedia_commons')
          .eq('is_verified', true)
          .contains('tags', [term])
          .order('usage_count', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!tagError && tagMatch) {
          console.log(`Found Wikimedia image by tag match: ${term}`);
          return tagMatch;
        }
      }

      // Strategy 5: Try full query string match (fallback)
      if (searchQuery.length >= 3) {
        const { data: fullQueryMatch, error: fullQueryError } = await supabase
          .from('road_sign_images')
          .select('storage_url, id, attribution_text, license_info, wikimedia_page_url, artist_name')
          .eq('image_source', 'wikimedia_commons')
          .eq('is_verified', true)
          .or(`sign_name_en.ilike.%${searchQuery}%,sign_name_jp.ilike.%${searchQuery}%,sign_meaning.ilike.%${searchQuery}%`)
          .order('usage_count', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!fullQueryError && fullQueryMatch) {
          console.log(`Found Wikimedia image by full query match: ${searchQuery}`);
          return fullQueryMatch;
        }
      }
    }

    // Strategy 4: If category provided but no exact match, try broader search
    if (category) {
      const { data: broadMatch, error: broadError } = await supabase
        .from('road_sign_images')
        .select('storage_url, id, attribution_text, license_info, wikimedia_page_url, artist_name')
        .eq('image_source', 'wikimedia_commons')
        .eq('is_verified', true)
        .eq('sign_category', category)
        .order('usage_count', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!broadError && broadMatch) {
        console.log(`Found Wikimedia image by category (broad): ${category}`);
        return broadMatch;
      }
    }

    console.log(`No Wikimedia image found for category: ${category}, query: ${query}`);
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
  const categoryMap: { [key: string]: string | null } = {
    'regulatory-signs': 'regulatory',
    'warning-signs': 'warning',
    'indication-signs': 'indication',
    'guidance-signs': 'guidance',
    'auxiliary-signs': 'auxiliary',
    'road-markings': 'road-markings',
    'traffic-signals': null,
  };
  
  return categoryMap[category] || null;
}

/**
 * Increment usage count for an image
 */
export async function incrementImageUsage(
  supabase: any,
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
    
    const { error: updateError } = await (supabase as any)
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

