import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { findWikimediaImage, mapFlashcardCategoryToDbCategory, incrementImageUsage } from "./wikimedia-image-lookup.ts";

/**
 * Enhanced image fetching function with multiple fallback strategies
 * 
 * Strategy Priority:
 * 1. Wikimedia Commons database (most reliable, verified images)
 * 2. Database verified images (other verified sources)
 * 3. Serper API (real photos from web search)
 * 4. Return null if all fail
 * 
 * @param supabase - Supabase client instance
 * @param query - Search query (sign name or description)
 * @param category - Sign category (optional)
 * @param signId - Specific sign ID to fetch (optional, highest priority)
 * @returns Image URL and metadata or null
 */
export async function fetchEnhancedImage(
  supabase: ReturnType<typeof createClient>,
  query: string,
  category?: string | null,
  signId?: string | null
): Promise<{
  imageUrl: string;
  signId?: string;
  signNameEn?: string;
  signNameJp?: string;
  signCategory?: string;
  attributionText?: string;
  licenseInfo?: string;
  wikimediaPageUrl?: string;
  artistName?: string;
  imageSource?: string;
} | null> {
  try {
    // Strategy 1: If signId provided, fetch directly from database
    if (signId) {
      const { data: sign, error } = await (supabase as any)
        .from('road_sign_images')
        .select('*')
        .eq('id', signId)
        .eq('is_verified', true)
        .single();

      if (!error && sign && sign.storage_url) {
        await incrementImageUsage(supabase, sign.id);
        return {
          imageUrl: sign.storage_url,
          signId: sign.id,
          signNameEn: sign.sign_name_en || undefined,
          signNameJp: sign.sign_name_jp || undefined,
          signCategory: sign.sign_category || undefined,
          attributionText: sign.attribution_text || undefined,
          licenseInfo: sign.license_info || undefined,
          wikimediaPageUrl: sign.wikimedia_page_url || undefined,
          artistName: sign.artist_name || undefined,
          imageSource: sign.image_source || undefined,
        };
      }
    }

    // Strategy 2: Try Wikimedia Commons database lookup
    const dbCategory = category ? mapFlashcardCategoryToDbCategory(category) : null;
    const wikimediaImage = await findWikimediaImage(supabase, dbCategory, query);
    
    if (wikimediaImage) {
      // Fetch full metadata
      const { data: fullMetadata } = await (supabase as any)
        .from('road_sign_images')
        .select('sign_name_en, sign_name_jp, sign_category, attribution_text, license_info, wikimedia_page_url, artist_name, image_source')
        .eq('id', wikimediaImage.id)
        .single();

      return {
        imageUrl: wikimediaImage.storage_url,
        signId: wikimediaImage.id,
        signNameEn: fullMetadata?.sign_name_en || undefined,
        signNameJp: fullMetadata?.sign_name_jp || undefined,
        signCategory: fullMetadata?.sign_category || undefined,
        attributionText: fullMetadata?.attribution_text || undefined,
        licenseInfo: fullMetadata?.license_info || undefined,
        wikimediaPageUrl: fullMetadata?.wikimedia_page_url || undefined,
        artistName: fullMetadata?.artist_name || undefined,
        imageSource: fullMetadata?.image_source || undefined,
      };
    }

    // Strategy 3: Try database verified images (non-Wikimedia)
    if (dbCategory) {
      const { data: verifiedImages } = await (supabase as any)
        .from('road_sign_images')
        .select('*')
        .eq('sign_category', dbCategory)
        .eq('is_verified', true)
        .neq('image_source', 'wikimedia_commons')
        .order('usage_count', { ascending: false })
        .limit(5);

      if (verifiedImages && verifiedImages.length > 0) {
        // Try to match by name similarity
        const queryLower = query.toLowerCase();
        const matched = verifiedImages.find((img: any) => 
          img.sign_name_en?.toLowerCase().includes(queryLower) ||
          img.sign_name_jp?.toLowerCase().includes(queryLower) ||
          queryLower.includes(img.sign_name_en?.toLowerCase() || '')
        );

        const selected: any = matched || verifiedImages[0];
        await incrementImageUsage(supabase, selected.id);

        return {
          imageUrl: selected.storage_url,
          signId: selected.id,
          signNameEn: selected.sign_name_en || undefined,
          signNameJp: selected.sign_name_jp || undefined,
          signCategory: selected.sign_category || undefined,
          attributionText: selected.attribution_text || undefined,
          licenseInfo: selected.license_info || undefined,
          imageSource: selected.image_source || undefined,
        };
      }
    }

    // Strategy 4: Fallback to Serper API (real photos from web)
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    
    if (SERPER_API_KEY) {
      try {
        // Build multiple search queries for better results
        const searchQueries = [
          `${query} 実物 写真 日本の道路標識`,
          `${query} 写真 日本 道路標識`,
          `${query} real photo actual sign japan`,
          `${query} japan road sign photo real`
        ];

        for (const searchQuery of searchQueries) {
          const response = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
              'X-API-KEY': SERPER_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              q: searchQuery,
              num: 5,
              safe: 'active',
              gl: 'jp',
              hl: 'ja'
            })
          });

          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          const images = data.images || [];
          
          // Filter out AI-generated and illustrations
          for (const image of images) {
            const imageUrl = image.imageUrl || image.link;
            if (!imageUrl) continue;
            
            const urlLower = imageUrl.toLowerCase();
            const titleLower = (image.title || '').toLowerCase();
            
            // Skip AI-generated or illustrations
            if (urlLower.includes('ai-generated') || 
                urlLower.includes('illustration') ||
                urlLower.includes('vector') ||
                urlLower.includes('clip-art') ||
                titleLower.includes('illustration') ||
                titleLower.includes('vector') ||
                titleLower.includes('ai-generated')) {
              continue;
            }
            
            // Prefer real photos from reliable sources
            if (urlLower.includes('wikipedia') ||
                urlLower.includes('flickr') ||
                urlLower.includes('commons.wikimedia') ||
                urlLower.includes('photo') ||
                urlLower.includes('写真') ||
                urlLower.includes('実物') ||
                titleLower.includes('photo') ||
                titleLower.includes('写真')) {
              console.log(`Using Serper API real photo for: ${query}`);
              return {
                imageUrl: imageUrl
              };
            }
          }
          
          // If no verified real photo found, use first result as fallback
          if (images.length > 0) {
            const firstImage = images[0].imageUrl || images[0].link;
            console.log(`Using Serper API image (may not be verified real photo) for: ${query}`);
            return {
              imageUrl: firstImage
            };
          }
        }
      } catch (error) {
        console.error('Error fetching image from Serper:', error);
      }
    }

    // All strategies failed
    console.log(`No image found for: ${query}`);
    return null;
  } catch (error) {
    console.error('Error in enhanced image fetcher:', error);
    return null;
  }
}

/**
 * Batch fetch images for multiple queries
 * @param supabase - Supabase client instance
 * @param queries - Array of search queries
 * @param category - Sign category (optional)
 * @returns Array of image results
 */
export async function fetchEnhancedImagesBatch(
  supabase: ReturnType<typeof createClient>,
  queries: string[],
  category?: string | null
): Promise<Array<{
  query: string;
  imageUrl: string | null;
  signId?: string;
  metadata?: any;
}>> {
  const results = await Promise.all(
    queries.map(async (query) => {
      const result = await fetchEnhancedImage(supabase, query, category);
      return {
        query,
        imageUrl: result?.imageUrl || null,
        signId: result?.signId,
        metadata: result ? {
          signNameEn: result.signNameEn,
          signNameJp: result.signNameJp,
          signCategory: result.signCategory,
          attributionText: result.attributionText,
          licenseInfo: result.licenseInfo,
          imageSource: result.imageSource
        } : undefined
      };
    })
  );

  return results;
}

