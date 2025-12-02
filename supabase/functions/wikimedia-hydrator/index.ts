// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User-Agent required by Wikimedia API
const WIKIMEDIA_USER_AGENT = "KotsuSensei/1.0 (https://kotsu-sensei.com; contact@kotsu-sensei.com)";

// Google AI Studio API key
const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_STUDIO_API_KEY");

/**
 * Call Gemini AI to enhance metadata
 */
async function enhanceWithGemini(objectName: string, description: string, fileName: string, categories: string[]): Promise<{
  category: string;
  englishName: string;
  japaneseName: string | null;
  expandedMeaning: string;
  driverBehavior: string;
  legalContext: string;
} | null> {
  if (!GOOGLE_AI_API_KEY) {
    console.log("⚠️ GOOGLE_AI_STUDIO_API_KEY not configured, skipping AI enhancement");
    return null;
  }

  const prompt = `You are a Japanese driving test expert. Analyze this Japanese road sign image metadata and provide comprehensive information for learners.

INPUT METADATA:
- Object Name: ${objectName || 'Unknown'}
- Image Description: ${description || 'No description available'}
- File Name: ${fileName}
- Wikimedia Categories: ${categories.join(', ') || 'None'}

INSTRUCTIONS:
1. Identify what type of Japanese road sign this is
2. Provide clear, learner-friendly information
3. If this is NOT a road sign (e.g., it's a photo of a road scene, map, or other non-sign image), still try to describe what driving-related information it shows

RESPOND IN THIS EXACT JSON FORMAT (no markdown, just raw JSON):
{
  "category": "one of: regulatory, warning, indication, guidance, auxiliary, road-markings, traffic-signals",
  "english_name": "Clear, descriptive English name (not technical jargon)",
  "japanese_name": "Japanese name if applicable, or null",
  "expanded_meaning": "2-3 sentences explaining what this sign means and its purpose. Be specific and helpful for driving test learners.",
  "driver_behavior": "What specific action should drivers take when seeing this sign? Be practical and clear.",
  "legal_context": "Any legal implications, requirements, or penalties associated with this sign. If none specific, say 'Follow the sign's instructions to comply with traffic laws.'"
}

CATEGORY GUIDELINES:
- regulatory: Signs that prohibit, restrict, or command (stop, no entry, speed limits, no parking)
- warning: Signs that warn of hazards ahead (curves, intersections, animals, slippery roads)
- indication: Signs that indicate what drivers should or may do (pedestrian crossing allowed, bike lane)
- guidance: Route information, destinations, distance markers, highway signs
- auxiliary: Additional information plates attached to other signs
- road-markings: Painted lines and symbols on the road surface
- traffic-signals: Traffic lights, signals, and their variations`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text in Gemini response");
      return null;
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const parsed = JSON.parse(jsonStr);

    return {
      category: parsed.category || 'regulatory',
      englishName: parsed.english_name || objectName || fileName,
      japaneseName: parsed.japanese_name || null,
      expandedMeaning: parsed.expanded_meaning || '',
      driverBehavior: parsed.driver_behavior || '',
      legalContext: parsed.legal_context || '',
    };
  } catch (error) {
    console.error("Error calling Gemini AI:", error);
    return null;
  }
}

/**
 * Clean HTML and extract meaningful text
 */
function cleanHtml(html: string | undefined | null): string {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<\/?[^>]+(>|$)/g, " ");
  
  // Remove font-family and other CSS noise
  text = text.replace(/font-family:[^;]+;?/gi, '');
  text = text.replace(/font-size:[^;]+;?/gi, '');
  text = text.replace(/style="[^"]*"/gi, '');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Remove common noise patterns
  text = text.replace(/\[\[([^\]]+)\]\]/g, '$1'); // Wiki links
  text = text.replace(/{{[^}]+}}/g, ''); // Wiki templates
  
  return text;
}

/**
 * Extract Wikimedia file title from filename
 */
function guessWikimediaTitle(filename: string): string {
  const name = filename.split("/").pop() || filename;
  const base = name.replace(/\.[a-z]+$/i, "");
  const normalized = base
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const ext = name.match(/\.([a-z]+)$/i)?.[1] || "svg";
  return `File:${normalized}.${ext}`;
}

/**
 * Fetch metadata from Wikimedia Commons API
 */
async function fetchWikimediaMetadata(title: string): Promise<any | null> {
  const url = "https://commons.wikimedia.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    prop: "imageinfo|categories",
    titles: title,
    iiprop: "url|mime|size|metadata|extmetadata|commonmetadata|sha1",
    cllimit: "50",
    redirects: "1",
    format: "json",
  });

  try {
    const res = await fetch(`${url}?${params.toString()}`, {
      headers: { "User-Agent": WIKIMEDIA_USER_AGENT },
    });

    if (!res.ok) {
      console.error(`Wikimedia API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    const pages = data?.query?.pages;
    
    if (!pages || Object.keys(pages).length === 0) {
      return null;
    }

    const redirects = data?.query?.redirects || [];
    let actualTitle = title;
    for (const redirect of redirects) {
      if (redirect.from === title) {
        actualTitle = redirect.to;
        break;
      }
    }

    const page = Object.values(pages)[0] as any;
    
    if (page.missing || !page.imageinfo || page.imageinfo.length === 0) {
      return null;
    }

    // Extract categories
    const categories = (page.categories || []).map((c: any) => 
      c.title.replace(/^Category:/, '')
    );

    return {
      pageid: page.pageid,
      revision_id: page.lastrevid,
      title: page.title,
      actualTitle: actualTitle,
      imageinfo: page.imageinfo[0],
      categories,
    };
  } catch (error) {
    console.error(`Error fetching Wikimedia metadata for ${title}:`, error);
    return null;
  }
}

/**
 * Process and enhance metadata with Gemini AI
 */
async function processMetadata(api: any, enableAI: boolean = true) {
  const ii = api.imageinfo;
  const ext = ii.extmetadata || {};

  // Extract raw metadata
  const objectName = cleanHtml(ext.ObjectName?.value);
  const description = cleanHtml(ext.ImageDescription?.value);
  const artist = cleanHtml(ext.Artist?.value);
  
  // License info
  const license = {
    short: ext.LicenseShortName?.value ?? null,
    url: ext.LicenseUrl?.value ?? null,
    name: ext.License?.value ?? null,
  };

  // Basic metadata
  const basicMetadata = {
    pageid: api.pageid,
    revision_id: api.revision_id,
    title: api.title,
    actualTitle: api.actualTitle,
    url: ii.url,
    descriptionurl: ii.descriptionurl || null,
    mime: ii.mime || null,
    sha1: ii.sha1 || null,
    extmetadata: ext,
    commonmetadata: ii.commonmetadata ?? {},
    exif: ii.metadata ?? [],
    license,
    artist,
    categories: api.categories || [],
    objectName,
    description,
  };

  // Enhance with Gemini AI if enabled
  let aiEnhancement = null;
  if (enableAI) {
    console.log(`🤖 Enhancing with Gemini AI...`);
    aiEnhancement = await enhanceWithGemini(
      objectName,
      description,
      api.title,
      api.categories || []
    );
  }

  return {
    ...basicMetadata,
    aiEnhancement,
  };
}

/**
 * Save enhanced metadata to Supabase
 */
async function saveMetadata(
  imageId: string,
  metadata: any,
  originalFileName: string
): Promise<void> {
  const updateData: any = {
    metadata_hydrated: true,
    metadata_hydrated_at: new Date().toISOString(),
    wikimedia_pageid: metadata.pageid,
    revision_id: metadata.revision_id,
    extmetadata: metadata.extmetadata,
    commonmetadata: metadata.commonmetadata,
    exif_metadata: metadata.exif,
    sha1: metadata.sha1,
  };

  // Update wikimedia_file_name
  if (metadata.actualTitle) {
    updateData.wikimedia_file_name = metadata.actualTitle;
  }

  // Update license and attribution
  if (metadata.license?.url || metadata.license?.short) {
    updateData.license_info = metadata.license.short || metadata.license.name || null;
  }
  if (metadata.artist) {
    updateData.artist_name = metadata.artist;
    updateData.attribution_text = `Image by ${metadata.artist}`;
    if (metadata.license?.short) {
      updateData.attribution_text += ` — License: ${metadata.license.short}`;
    }
  }
  if (metadata.descriptionurl) {
    updateData.wikimedia_page_url = metadata.descriptionurl;
  }

  // Apply AI enhancements if available
  if (metadata.aiEnhancement) {
    const ai = metadata.aiEnhancement;
    
    updateData.ai_enhanced = true;
    updateData.ai_enhanced_at = new Date().toISOString();
    
    // AI-enhanced fields
    updateData.sign_name_en = ai.englishName;
    updateData.gemini_category = ai.category;
    updateData.expanded_meaning = ai.expandedMeaning;
    updateData.driver_behavior = ai.driverBehavior;
    updateData.legal_context = ai.legalContext;
    
    if (ai.japaneseName) {
      updateData.sign_name_jp = ai.japaneseName;
      updateData.translated_japanese = ai.japaneseName;
    }
    
    // Also update sign_category to match AI inference
    updateData.sign_category = ai.category;
  } else {
    // Fallback to raw metadata
    if (metadata.objectName) {
      updateData.sign_name_en = metadata.objectName;
    }
  }

  const { error } = await supabase
    .from("road_sign_images")
    .update(updateData)
    .eq("id", imageId);

  if (error) {
    console.error(`Error saving metadata for ${imageId}:`, error);
    throw error;
  }
}

/**
 * Main hydration worker - processes unhydrated images with AI enhancement
 */
async function hydrateUnhydratedImages(limit = 20, enableAI = true): Promise<{
  processed: number;
  succeeded: number;
  aiEnhanced: number;
  failed: number;
}> {
  console.log(`🔍 Fetching unhydrated images (AI: ${enableAI ? 'enabled' : 'disabled'})...`);
  
  const { data: images, error: fetchError } = await supabase
    .from("road_sign_images")
    .select("id, file_name, wikimedia_file_name, metadata_hydrated, ai_enhanced")
    .eq("image_source", "wikimedia_commons")
    .eq("is_verified", true)
    .or(`metadata_hydrated.is.null,metadata_hydrated.eq.false,ai_enhanced.is.null,ai_enhanced.eq.false`)
    .limit(limit);

  if (fetchError) {
    console.error("Error fetching images:", fetchError);
    throw fetchError;
  }

  if (!images || images.length === 0) {
    console.log("✅ No unhydrated images found");
    return { processed: 0, succeeded: 0, aiEnhanced: 0, failed: 0 };
  }

  console.log(`📦 Found ${images.length} images to process`);

  let succeeded = 0;
  let aiEnhanced = 0;
  let failed = 0;

  for (const img of images) {
    try {
      let title = img.wikimedia_file_name;
      
      if (!title || !title.startsWith("File:")) {
        title = guessWikimediaTitle(img.file_name);
        console.log(`📝 Guessed title: ${title}`);
      }

      if (!title.startsWith("File:")) {
        title = `File:${title}`;
      }

      console.log(`🔍 Processing: ${title}`);

      const raw = await fetchWikimediaMetadata(title);

      if (!raw) {
        console.log(`⚠️ No metadata for: ${title}`);
        failed++;
        continue;
      }

      // Process with AI enhancement
      const processed = await processMetadata(raw, enableAI);

      // Save to database
      await saveMetadata(img.id, processed, img.file_name);

      if (processed.aiEnhancement) {
        console.log(`✅ AI-Enhanced: ${img.id} → ${processed.aiEnhancement.englishName}`);
        aiEnhanced++;
      } else {
        console.log(`✅ Hydrated (no AI): ${img.id}`);
      }
      succeeded++;

      // Rate limiting: Gemini has rate limits
      await new Promise(resolve => setTimeout(resolve, enableAI ? 500 : 200));

    } catch (error) {
      console.error(`❌ Error processing ${img.id}:`, error);
      failed++;
    }
  }

  return {
    processed: images.length,
    succeeded,
    aiEnhanced,
    failed,
  };
}

/**
 * Re-enhance images that have metadata but not AI enhancement
 */
async function enhanceExistingImages(limit = 20): Promise<{
  processed: number;
  enhanced: number;
  failed: number;
}> {
  console.log("🔍 Fetching images needing AI enhancement...");

  const { data: images, error: fetchError } = await supabase
    .from("road_sign_images")
    .select("id, file_name, wikimedia_file_name, extmetadata")
    .eq("image_source", "wikimedia_commons")
    .eq("is_verified", true)
    .eq("metadata_hydrated", true)
    .or("ai_enhanced.is.null,ai_enhanced.eq.false")
    .limit(limit);

  if (fetchError || !images || images.length === 0) {
    return { processed: 0, enhanced: 0, failed: 0 };
  }

  console.log(`📦 Found ${images.length} images to enhance`);

  let enhanced = 0;
  let failed = 0;

  for (const img of images) {
    try {
      const ext = img.extmetadata || {};
      const objectName = cleanHtml(ext.ObjectName?.value);
      const description = cleanHtml(ext.ImageDescription?.value);

      // Get categories from extmetadata
      let categories: string[] = [];
      if (ext.Categories?.value) {
        categories = ext.Categories.value.split('|').map((c: string) => c.trim());
      }

      console.log(`🤖 Enhancing: ${img.file_name}`);

      const aiEnhancement = await enhanceWithGemini(
        objectName,
        description,
        img.wikimedia_file_name || img.file_name,
        categories
      );

      if (aiEnhancement) {
        const { error } = await supabase
          .from("road_sign_images")
          .update({
            ai_enhanced: true,
            ai_enhanced_at: new Date().toISOString(),
            sign_name_en: aiEnhancement.englishName,
            sign_name_jp: aiEnhancement.japaneseName,
            translated_japanese: aiEnhancement.japaneseName,
            gemini_category: aiEnhancement.category,
            sign_category: aiEnhancement.category,
            expanded_meaning: aiEnhancement.expandedMeaning,
            driver_behavior: aiEnhancement.driverBehavior,
            legal_context: aiEnhancement.legalContext,
          })
          .eq("id", img.id);

        if (error) throw error;

        console.log(`✅ Enhanced: ${aiEnhancement.englishName}`);
        enhanced++;
      } else {
        failed++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Error enhancing ${img.id}:`, error);
      failed++;
    }
  }

  return {
    processed: images.length,
    enhanced,
    failed,
  };
}

// Main handler
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "hydrate";
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const enableAI = url.searchParams.get("ai") !== "false";

    console.log(`🚀 Starting hydration: mode=${mode}, limit=${limit}, ai=${enableAI}`);

    let result;

    switch (mode) {
      case "enhance":
        // Only AI-enhance already hydrated images
        result = await enhanceExistingImages(limit);
        break;
      case "hydrate":
      default:
        // Full hydration with AI
        result = await hydrateUnhydratedImages(limit, enableAI);
        break;
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        enableAI,
        ...result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Hydration error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
