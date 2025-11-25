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
    // Strategy 1: Try exact category match first (most reliable)
    if (category) {
      const { data: categoryMatch, error: categoryError } = await supabase
        .from('road_sign_images')
        .select('storage_url, id')
        .eq('image_source', 'wikimedia_commons')
        .eq('sign_category', category)
        .eq('is_verified', true)
        .order('usage_count', { ascending: false })
        .limit(1)
        .single();

      if (!categoryError && categoryMatch) {
        console.log(`Found Wikimedia image by category: ${category}`);
        return categoryMatch;
      }
    }

    // Strategy 2: Try sign name match (English or Japanese)
    if (query) {
      const searchQuery = query.toLowerCase().trim();
      
      // Try English name match
      const { data: nameMatch, error: nameError } = await supabase
        .from('road_sign_images')
        .select('storage_url, id')
        .eq('image_source', 'wikimedia_commons')
        .eq('is_verified', true)
        .or(`sign_name_en.ilike.%${searchQuery}%,sign_name_jp.ilike.%${searchQuery}%`)
        .order('usage_count', { ascending: false })
        .limit(1)
        .single();

      if (!nameError && nameMatch) {
        console.log(`Found Wikimedia image by name: ${query}`);
        return nameMatch;
      }

      // Strategy 3: Try tags match (array contains or ILIKE)
      // Extract key terms from query (e.g., "stop sign" -> ["stop", "sign"])
      const queryTerms = searchQuery.split(/\s+/).filter(term => term.length > 2);
      
      if (queryTerms.length > 0) {
        // Build a query that checks if any tag contains any of the query terms
        const tagConditions = queryTerms.map(term => `tags.cs.{${term}}`).join(',');
        
        const { data: tagMatch, error: tagError } = await supabase
          .from('road_sign_images')
          .select('storage_url, id')
          .eq('image_source', 'wikimedia_commons')
          .eq('is_verified', true)
          .or(tagConditions)
          .order('usage_count', { ascending: false })
          .limit(1)
          .single();

        if (!tagError && tagMatch) {
          console.log(`Found Wikimedia image by tags: ${query}`);
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

