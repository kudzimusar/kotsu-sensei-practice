import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

/**
 * DETERMINISTIC SIGN NUMBER EXTRACTION
 * This function extracts sign numbers from user queries using EXACT matching
 * Priority: sign_number_map table > regex extraction > null
 */
export async function extractSignNumber(
  supabase: ReturnType<typeof createClient>,
  query: string
): Promise<string | null> {
  if (!query || !query.trim()) {
    return null;
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Layer 1: Check sign_number_map table FIRST (most reliable)
  // This uses the database mappings we created
  try {
    const { data: mapping, error } = await (supabase as any)
      .from('sign_number_map')
      .select('sign_number')
      .eq('keyword', normalizedQuery)
      .limit(1)
      .single();

    if (!error && mapping?.sign_number) {
      console.log(`✅ Exact mapping found: "${normalizedQuery}" → "${mapping.sign_number}"`);
      return mapping.sign_number;
    }

    // Try individual terms if whole query didn't match
    const terms = normalizedQuery.split(/\s+/).filter(t => t.length >= 2);
    for (const term of terms) {
      const { data: termMapping, error: termError } = await (supabase as any)
        .from('sign_number_map')
        .select('sign_number')
        .eq('keyword', term)
        .limit(1)
        .single();

      if (!termError && termMapping?.sign_number) {
        console.log(`✅ Term mapping found: "${term}" → "${termMapping.sign_number}"`);
        return termMapping.sign_number;
      }
    }
  } catch (error) {
    console.error('Error checking sign_number_map:', error);
  }

  // Layer 1b: Try to find sign number in official metadata (extmetadata P5544)
  // This uses the hydrated official metadata from Wikimedia API
  try {
    const { data: metadataMatch, error: metadataError } = await (supabase as any)
      .from('road_sign_images')
      .select('sign_number, extmetadata')
      .eq('image_source', 'wikimedia_commons')
      .eq('is_verified', true)
      .eq('metadata_hydrated', true)
      .or(`sign_name_en.ilike.%${normalizedQuery}%,sign_name_jp.ilike.%${normalizedQuery}%`)
      .limit(5);

    if (!metadataError && metadataMatch && metadataMatch.length > 0) {
      // Check if any result has sign_number populated from metadata
      const withSignNumber = metadataMatch.find((m: any) => m.sign_number);
      if (withSignNumber?.sign_number) {
        console.log(`✅ Sign number found in hydrated metadata: "${withSignNumber.sign_number}"`);
        return withSignNumber.sign_number;
      }
    }
  } catch (error) {
    console.error('Error checking hydrated metadata:', error);
  }

  // Layer 2: Extract sign number from query using regex (e.g., "212-3", "326", "124-A")
  const numberMatch = normalizedQuery.match(/\b(\d{3}(?:[-_]?\d+)?(?:-[A-Z])?)\b/);
  if (numberMatch) {
    const extractedNumber = numberMatch[1].replace(/_/g, '-');
    console.log(`✅ Regex extracted sign number: "${extractedNumber}"`);
    return extractedNumber;
  }

  return null;
}

/**
 * DETERMINISTIC EXACT SIGN NUMBER SEARCH
 * This function searches using EXACT sign number matching ONLY
 * Returns null if no exact match found - NO FUZZY SEARCH
 */
export async function findExactSignByNumber(
  supabase: ReturnType<typeof createClient>,
  signNumber: string
): Promise<{
  storage_url: string;
  id: string;
  file_name: string;
  sign_name_en?: string;
  sign_name_jp?: string;
  attribution_text?: string;
  license_info?: string;
  wikimedia_page_url?: string;
  artist_name?: string;
} | null> {
  if (!signNumber) {
    return null;
  }

  console.log(`🔍 EXACT search for sign number: "${signNumber}"`);

  // Normalize sign number formats (handle both "212-3" and "212_3")
  const normalizedNumber = signNumber.replace(/_/g, '-');
  const altFormat = signNumber.replace(/-/g, '_');

  // EXACT MATCH ONLY - no fuzzy search
  // Try exact sign_number match first
  let { data: results, error } = await (supabase as any)
    .from('road_sign_images')
    .select('id, storage_url, file_name, filename_slug, wikimedia_file_name, sign_number, sign_name_en, sign_name_jp, attribution_text, license_info, wikimedia_page_url, artist_name')
    .eq('image_source', 'wikimedia_commons')
    .eq('is_verified', true)
    .eq('sign_number', normalizedNumber)
    .limit(10);

  // If no exact sign_number match, try filename matches
  if ((!results || results.length === 0) && !error) {
    const { data: filenameResults, error: filenameError } = await (supabase as any)
      .from('road_sign_images')
      .select('id, storage_url, file_name, filename_slug, wikimedia_file_name, sign_number, sign_name_en, sign_name_jp, attribution_text, license_info, wikimedia_page_url, artist_name')
      .eq('image_source', 'wikimedia_commons')
      .eq('is_verified', true)
      .or(`file_name.ilike.%${normalizedNumber}%,file_name.ilike.%${altFormat}%,filename_slug.ilike.%${normalizedNumber}%,filename_slug.ilike.%${altFormat}%,wikimedia_file_name.ilike.%${normalizedNumber}%,wikimedia_file_name.ilike.%${altFormat}%`)
      .limit(10);
    
    results = filenameResults;
    error = filenameError;
  }

  if (error) {
    console.error('Error in exact sign search:', error);
    return null;
  }

  if (!results || results.length === 0) {
    console.log(`❌ No exact match found for sign number: "${signNumber}"`);
    return null;
  }

  // Prioritize: exact sign_number match > filename match > wikimedia filename match
  let bestMatch: any = results.find((r: any) => r.sign_number === normalizedNumber || r.sign_number === altFormat);
  if (!bestMatch) {
    bestMatch = results.find((r: any) => 
      r.file_name?.includes(normalizedNumber) || 
      r.file_name?.includes(altFormat) ||
      r.filename_slug?.includes(normalizedNumber) ||
      r.filename_slug?.includes(altFormat)
    );
  }
  if (!bestMatch) {
    bestMatch = results[0]; // Fallback to first result
  }

  // DEPRIORITIZE composite files (files with "and" or "&")
  if (bestMatch.file_name?.toLowerCase().includes(' and ') || 
      bestMatch.file_name?.toLowerCase().includes(' & ')) {
    // Look for a non-composite file
    const nonComposite = results.find((r: any) => 
      !r.file_name?.toLowerCase().includes(' and ') &&
      !r.file_name?.toLowerCase().includes(' & ') &&
      (r.sign_number === normalizedNumber || 
       r.file_name?.includes(normalizedNumber) || 
       r.file_name?.includes(altFormat))
    );
    if (nonComposite) {
      bestMatch = nonComposite;
    }
  }

  console.log(`✅ EXACT match found: ${bestMatch.file_name} (sign_number: ${bestMatch.sign_number || 'N/A'})`);

  return {
    storage_url: bestMatch.storage_url || '',
    id: bestMatch.id,
    file_name: bestMatch.file_name || '',
    sign_name_en: bestMatch.sign_name_en || undefined,
    sign_name_jp: bestMatch.sign_name_jp || undefined,
    attribution_text: bestMatch.attribution_text || undefined,
    license_info: bestMatch.license_info || undefined,
    wikimedia_page_url: bestMatch.wikimedia_page_url || undefined,
    artist_name: bestMatch.artist_name || undefined,
  };
}

/**
 * DETERMINISTIC 7-LAYER SEARCH ENGINE
 * This is the main search function that enforces exact matching first
 */
export async function deterministicSignSearch(
  supabase: ReturnType<typeof createClient>,
  query: string,
  category?: string | null
): Promise<{
  storage_url: string;
  id: string;
  file_name: string;
  sign_name_en?: string;
  sign_name_jp?: string;
  attribution_text?: string;
  license_info?: string;
  wikimedia_page_url?: string;
  artist_name?: string;
} | null> {
  console.log(`🔍 DETERMINISTIC search started for: "${query}"`);

  // LAYER 1: Extract sign number FIRST (MANDATORY)
  const signNumber = await extractSignNumber(supabase, query);
  
  if (signNumber) {
    console.log(`🎯 Sign number extracted: "${signNumber}" - Using EXACT match only`);
    
    // LAYER 2: EXACT sign number match (guaranteed accuracy)
    const exactMatch = await findExactSignByNumber(supabase, signNumber);
    if (exactMatch) {
      console.log(`✅ Layer 1 SUCCESS: Exact sign number match`);
      return exactMatch;
    }
  }

  // LAYER 3: Exact English name match (only if no sign number found)
  if (!signNumber) {
    console.log(`🔍 Layer 3: Trying exact English name match`);
    const { data: englishMatches, error: englishError } = await (supabase as any)
      .from('road_sign_images')
      .select('id, storage_url, file_name, filename_slug, wikimedia_file_name, sign_name_en, sign_name_jp, attribution_text, license_info, wikimedia_page_url, artist_name')
      .eq('image_source', 'wikimedia_commons')
      .eq('is_verified', true)
      .ilike('sign_name_en', `%${query}%`)
      .limit(5);

    if (!englishError && englishMatches && englishMatches.length > 0) {
      const match: any = englishMatches[0];
      console.log(`✅ Layer 3 SUCCESS: English name match`);
      return {
        storage_url: match.storage_url || '',
        id: match.id,
        file_name: match.file_name || '',
        sign_name_en: match.sign_name_en || undefined,
        sign_name_jp: match.sign_name_jp || undefined,
        attribution_text: match.attribution_text || undefined,
        license_info: match.license_info || undefined,
        wikimedia_page_url: match.wikimedia_page_url || undefined,
        artist_name: match.artist_name || undefined,
      };
    }
  }

  // LAYER 4: Exact Japanese name match
  if (!signNumber) {
    console.log(`🔍 Layer 4: Trying exact Japanese name match`);
    const { data: japaneseMatches, error: japaneseError } = await (supabase as any)
      .from('road_sign_images')
      .select('id, storage_url, file_name, filename_slug, wikimedia_file_name, sign_name_en, sign_name_jp, attribution_text, license_info, wikimedia_page_url, artist_name')
      .eq('image_source', 'wikimedia_commons')
      .eq('is_verified', true)
      .ilike('sign_name_jp', `%${query}%`)
      .limit(5);

    if (!japaneseError && japaneseMatches && japaneseMatches.length > 0) {
      const match: any = japaneseMatches[0];
      console.log(`✅ Layer 4 SUCCESS: Japanese name match`);
      return {
        storage_url: match.storage_url || '',
        id: match.id,
        file_name: match.file_name || '',
        sign_name_en: match.sign_name_en || undefined,
        sign_name_jp: match.sign_name_jp || undefined,
        attribution_text: match.attribution_text || undefined,
        license_info: match.license_info || undefined,
        wikimedia_page_url: match.wikimedia_page_url || undefined,
        artist_name: match.artist_name || undefined,
      };
    }
  }

  // LAYER 5: Search sign_meaning field (NEW - uses Wikimedia metadata)
  if (!signNumber) {
    console.log(`🔍 Layer 5: Trying sign_meaning search`);
    const { data: meaningMatches, error: meaningError } = await (supabase as any)
      .from('road_sign_images')
      .select('id, storage_url, file_name, filename_slug, wikimedia_file_name, sign_name_en, sign_name_jp, sign_meaning, attribution_text, license_info, wikimedia_page_url, artist_name')
      .eq('image_source', 'wikimedia_commons')
      .eq('is_verified', true)
      .ilike('sign_meaning', `%${query}%`)
      .limit(5);

    if (!meaningError && meaningMatches && meaningMatches.length > 0) {
      const match: any = meaningMatches[0];
      console.log(`✅ Layer 5 SUCCESS: sign_meaning match - "${match.sign_meaning?.substring(0, 50)}..."`);
      return {
        storage_url: match.storage_url || '',
        id: match.id,
        file_name: match.file_name || '',
        sign_name_en: match.sign_name_en || undefined,
        sign_name_jp: match.sign_name_jp || undefined,
        attribution_text: match.attribution_text || undefined,
        license_info: match.license_info || undefined,
        wikimedia_page_url: match.wikimedia_page_url || undefined,
        artist_name: match.artist_name || undefined,
      };
    }
  }

  // LAYER 6: Use improved RPC search (only as last resort for non-number queries)
  // This still has fuzzy matching but is better than nothing
  if (!signNumber) {
    console.log(`🔍 Layer 6: Falling back to RPC search (fuzzy - should rarely happen)`);
    try {
      const { data: rpcResults, error: rpcError } = await (supabase as any)
        .rpc('search_road_signs', { raw_q: query.toLowerCase().trim() });

      if (!rpcError && rpcResults && rpcResults.length > 0) {
        const topResult: any = rpcResults[0];
        console.log(`⚠️ Layer 6 RESULT (fuzzy): ${topResult.file_name}`);
        return {
          storage_url: topResult.storage_url || '',
          id: topResult.id,
          file_name: topResult.file_name || '',
          sign_name_en: topResult.sign_name_en || undefined,
          sign_name_jp: topResult.sign_name_jp || undefined,
          attribution_text: topResult.attribution_text || undefined,
          license_info: topResult.license_info || undefined,
          wikimedia_page_url: topResult.wikimedia_page_url || undefined,
          artist_name: topResult.artist_name || undefined,
        };
      }
    } catch (error) {
      console.error('Error in RPC fallback:', error);
    }
  }

  console.log(`❌ No match found using deterministic search`);
  return null;
}

