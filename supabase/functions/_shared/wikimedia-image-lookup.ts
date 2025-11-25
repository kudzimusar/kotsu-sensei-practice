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
  supabase: ReturnType<typeof createClient>,
  category?: string | null,
  query?: string | null
): Promise<{ storage_url: string; id: string } | null> {
  try {
    // Extract key terms from query for better matching
    const searchQuery = query ? query.toLowerCase().trim() : '';
    const queryTerms = searchQuery ? searchQuery.split(/\s+/).filter(term => term.length >= 3) : [];
    
    // If we have a query, prioritize name/tag matching over category-only matching
    if (query && queryTerms.length > 0) {
      // Strategy 1: Try exact name match with category filter (most specific)
      if (category) {
        for (const term of queryTerms) {
          const { data: exactMatch, error: exactError } = await supabase
            .from('road_sign_images')
            .select('storage_url, id')
            .eq('image_source', 'wikimedia_commons')
            .eq('is_verified', true)
            .eq('sign_category', category)
            .or(`sign_name_en.ilike.%${term}%,sign_name_jp.ilike.%${term}%`)
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
          .select('storage_url, id')
          .eq('image_source', 'wikimedia_commons')
          .eq('is_verified', true)
          .or(`sign_name_en.ilike.%${term}%,sign_name_jp.ilike.%${term}%`)
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
            .select('storage_url, id')
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
          .select('storage_url, id')
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
    }

    // Strategy 4: If category provided but no exact match, try broader search
    if (category) {
      const { data: broadMatch, error: broadError } = await supabase
        .from('road_sign_images')
        .select('storage_url, id')
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
  const categoryMap: { [key: string]: string } = {
    'regulatory-signs': 'regulatory',
    'warning-signs': 'warning',
    'indication-signs': 'indication',
    'guidance-signs': 'guidance',
    'auxiliary-signs': 'auxiliary',
    'road-markings': 'road-markings',
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
    await supabase.rpc('increment_image_usage', { image_id: imageId });
  } catch (error) {
    // If RPC doesn't exist, update directly
    const { error: updateError } = await supabase
      .from('road_sign_images')
      .update({ usage_count: supabase.raw('usage_count + 1') })
      .eq('id', imageId);
    
    if (updateError) {
      console.error('Error incrementing image usage:', updateError);
    }
  }
}

