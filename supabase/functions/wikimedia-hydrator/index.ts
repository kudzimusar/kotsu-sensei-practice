// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// User-Agent required by Wikimedia API
const WIKIMEDIA_USER_AGENT = "KotsuSensei/1.0 (https://kotsu-sensei.com; contact@kotsu-sensei.com)";

/**
 * Extract Wikimedia file title from filename
 * Attempts to guess the Wikimedia title from Supabase filename
 */
function guessWikimediaTitle(filename: string): string {
  // Remove path, keep just filename
  const name = filename.split("/").pop() || filename;
  
  // Remove extension
  const base = name.replace(/\.[a-z]+$/i, "");
  
  // Convert underscores/hyphens to spaces, then capitalize each word
  const normalized = base
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  
  // Get extension
  const ext = name.match(/\.([a-z]+)$/i)?.[1] || "svg";
  
  return `File:${normalized}.${ext}`;
}

/**
 * Fetch metadata from Wikimedia Commons API
 */
async function fetchWikimediaMetadata(
  title: string
): Promise<any | null> {
  const url = "https://commons.wikimedia.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    prop: "imageinfo",
    titles: title,
    iiprop: "url|mime|size|metadata|extmetadata|commonmetadata|sha1",
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
      console.log(`No pages found for title: ${title}`);
      return null;
    }

    // Handle redirects
    const redirects = data?.query?.redirects || [];
    let actualTitle = title;
    for (const redirect of redirects) {
      if (redirect.from === title) {
        actualTitle = redirect.to;
        break;
      }
    }

    const page = Object.values(pages)[0] as any;
    
    // Check for missing/invalid page
    if (page.missing || !page.imageinfo || page.imageinfo.length === 0) {
      console.log(`Page missing or no imageinfo for: ${title} (resolved: ${actualTitle})`);
      return null;
    }

    return {
      pageid: page.pageid,
      revision_id: page.lastrevid,
      title: page.title,
      actualTitle: actualTitle,
      imageinfo: page.imageinfo[0],
    };
  } catch (error) {
    console.error(`Error fetching Wikimedia metadata for ${title}:`, error);
    return null;
  }
}

/**
 * Normalize metadata from Wikimedia API response
 */
function normalizeMetadata(api: any) {
  const ii = api.imageinfo;

  // Extract license info
  const license = {
    short: ii.extmetadata?.LicenseShortName?.value ?? null,
    url: ii.extmetadata?.LicenseUrl?.value ?? null,
    name: ii.extmetadata?.License?.value ?? null,
  };

  // Extract artist (remove HTML tags)
  const artist = ii.extmetadata?.Artist?.value
    ? ii.extmetadata.Artist.value.replace(/<\/?[^>]+(>|$)/g, "").trim()
    : null;

  // Extract categories from extmetadata
  const categories: string[] = [];
  if (ii.extmetadata?.Categories?.value) {
    try {
      const cats = typeof ii.extmetadata.Categories.value === 'string'
        ? JSON.parse(ii.extmetadata.Categories.value)
        : ii.extmetadata.Categories.value;
      if (Array.isArray(cats)) {
        categories.push(...cats);
      }
    } catch {
      // If not JSON, treat as comma-separated string
      categories.push(...ii.extmetadata.Categories.value.split(',').map((c: string) => c.trim()));
    }
  }

  // Extract sign number from extmetadata if available (P5544 property)
  let extractedSignNumber: string | null = null;
  if (ii.extmetadata?.RoadSignCode?.value) {
    extractedSignNumber = ii.extmetadata.RoadSignCode.value;
  }

  // Extract Japanese name (P2569)
  let japaneseName: string | null = null;
  if (ii.extmetadata?.JapaneseName?.value) {
    japaneseName = ii.extmetadata.JapaneseName.value.replace(/<\/?[^>]+(>|$)/g, "").trim();
  }

  // Extract English name/title
  let englishName: string | null = null;
  if (ii.extmetadata?.ObjectName?.value) {
    englishName = ii.extmetadata.ObjectName.value.replace(/<\/?[^>]+(>|$)/g, "").trim();
  } else if (ii.extmetadata?.ImageDescription?.value) {
    // Fallback to description
    const desc = ii.extmetadata.ImageDescription.value.replace(/<\/?[^>]+(>|$)/g, "").trim();
    // Extract first sentence or meaningful part
    englishName = desc.split(/[.!?]/)[0] || desc.substring(0, 100);
  }

  return {
    pageid: api.pageid,
    revision_id: api.revision_id,
    title: api.title,
    actualTitle: api.actualTitle,
    url: ii.url,
    descriptionurl: ii.descriptionurl || null,
    width: ii.width || null,
    height: ii.height || null,
    mime: ii.mime || null,
    sha1: ii.sha1 || null,
    size: ii.size || null,
    extmetadata: ii.extmetadata ?? {},
    commonmetadata: ii.commonmetadata ?? {},
    exif: ii.metadata ?? [],
    license,
    artist,
    categories,
    extractedSignNumber,
    japaneseName,
    englishName,
  };
}

/**
 * Save normalized metadata to Supabase
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
  };

  // Update wikimedia_file_name if we have the actual title
  if (metadata.actualTitle && metadata.actualTitle !== `File:${originalFileName}`) {
    updateData.wikimedia_file_name = metadata.actualTitle;
  } else if (!updateData.wikimedia_file_name) {
    updateData.wikimedia_file_name = metadata.title || `File:${originalFileName}`;
  }

  // Update license and attribution if available
  if (metadata.license?.url || metadata.license?.short) {
    updateData.license_info = metadata.license.short || metadata.license.name || null;
  }
  if (metadata.artist) {
    updateData.artist_name = metadata.artist;
  }
  if (metadata.descriptionurl) {
    updateData.wikimedia_page_url = metadata.descriptionurl;
  }

  // Update sign number if extracted from metadata
  if (metadata.extractedSignNumber) {
    updateData.sign_number = metadata.extractedSignNumber;
  }

  // Update names if available
  if (metadata.japaneseName) {
    updateData.sign_name_jp = metadata.japaneseName;
  }
  if (metadata.englishName) {
    updateData.sign_name_en = metadata.englishName;
  }

  // Update attribution text
  if (metadata.artist) {
    updateData.attribution_text = `Image by ${metadata.artist}`;
    if (metadata.license?.url) {
      updateData.attribution_text += ` via Wikimedia Commons — License: ${metadata.license.short || metadata.license.name || 'CC'}`;
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
 * Main hydration worker - processes unhydrated images
 */
async function hydrateUnhydratedImages(limit = 50): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  console.log("🔍 Fetching unhydrated images...");
  
  const { data: images, error: fetchError } = await supabase
    .from("road_sign_images")
    .select("id, file_name, wikimedia_file_name, metadata_hydrated")
    .eq("image_source", "wikimedia_commons")
    .eq("is_verified", true)
    .or(`metadata_hydrated.is.null,metadata_hydrated.eq.false`)
    .limit(limit);

  if (fetchError) {
    console.error("Error fetching images:", fetchError);
    throw fetchError;
  }

  if (!images || images.length === 0) {
    console.log("✅ No unhydrated images found");
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  console.log(`📦 Found ${images.length} unhydrated images`);

  let succeeded = 0;
  let failed = 0;

  for (const img of images) {
    try {
      // Determine Wikimedia title
      let title = img.wikimedia_file_name;
      
      if (!title || !title.startsWith("File:")) {
        // Guess from filename
        title = guessWikimediaTitle(img.file_name);
        console.log(`📝 Guessed Wikimedia title: ${title} from ${img.file_name}`);
      }

      // Ensure it starts with "File:"
      if (!title.startsWith("File:")) {
        title = `File:${title}`;
      }

      console.log(`🔍 Fetching metadata for: ${title}`);

      // Fetch from Wikimedia API
      const raw = await fetchWikimediaMetadata(title);

      if (!raw) {
        console.log(`⚠️ No metadata found for: ${title}`);
        failed++;
        continue;
      }

      // Normalize metadata
      const normalized = normalizeMetadata(raw);

      // Save to Supabase
      await saveMetadata(img.id, normalized, img.file_name);

      console.log(`✅ Hydrated: ${img.id} (${title})`);
      succeeded++;

      // Rate limiting: wait 200ms between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`❌ Error hydrating ${img.id}:`, error);
      failed++;
    }
  }

  return {
    processed: images.length,
    succeeded,
    failed,
  };
}

/**
 * Rehydrate images with outdated metadata
 */
async function rehydrateUpdatedImages(limit = 50): Promise<{
  processed: number;
  updated: number;
  failed: number;
}> {
  console.log("🔍 Checking for outdated metadata...");

  const { data: images, error: fetchError } = await supabase
    .from("road_sign_images")
    .select("id, file_name, wikimedia_file_name, revision_id")
    .eq("image_source", "wikimedia_commons")
    .eq("is_verified", true)
    .not("wikimedia_file_name", "is", null)
    .not("revision_id", "is", null)
    .limit(limit);

  if (fetchError || !images || images.length === 0) {
    return { processed: 0, updated: 0, failed: 0 };
  }

  console.log(`📦 Checking ${images.length} images for updates`);

  let updated = 0;
  let failed = 0;

  for (const img of images) {
    try {
      const title = img.wikimedia_file_name!;
      const live = await fetchWikimediaMetadata(title);

      if (!live) {
        continue;
      }

      // Check if revision changed
      if (live.revision_id !== img.revision_id) {
        console.log(`🔄 Update detected: ${title} (rev ${img.revision_id} → ${live.revision_id})`);
        
        const normalized = normalizeMetadata(live);
        await saveMetadata(img.id, normalized, img.file_name);
        
        updated++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`❌ Error rehydrating ${img.id}:`, error);
      failed++;
    }
  }

  return {
    processed: images.length,
    updated,
    failed,
  };
}

// Main handler
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "hydrate";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    console.log(`🚀 Starting hydration pipeline: mode=${mode}, limit=${limit}`);

    let result;

    if (mode === "rehydrate") {
      result = await rehydrateUpdatedImages(limit);
    } else {
      result = await hydrateUnhydratedImages(limit);
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        ...result,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Hydration pipeline error:", error);
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

