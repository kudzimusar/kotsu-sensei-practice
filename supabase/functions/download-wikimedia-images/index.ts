import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { corsHeaders } from "../_shared/cors.ts";

// Wikimedia Commons API base URL
const WIKIMEDIA_API_URL = 'https://commons.wikimedia.org/w/api.php';

interface WikimediaImage {
  title: string;
  imageinfo: Array<{
    url: string;
    descriptionurl: string;
    extmetadata?: {
      ImageDescription?: { value: string };
      ObjectName?: { value: string };
    };
  }>;
  categories?: string[];
}

/**
 * Fetch all images from a Wikimedia Commons category
 */
async function fetchCategoryImages(categoryTitle: string): Promise<WikimediaImage[]> {
  const images: WikimediaImage[] = [];
  let continueParam: string | undefined = undefined;

  console.log(`Fetching images from category: ${categoryTitle}`);

  do {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'categorymembers',
      gcmtitle: `Category:${categoryTitle}`,
      gcmtype: 'file',
      gcmlimit: '500',
      prop: 'imageinfo|categories',
      iiprop: 'url|extmetadata',
      iiextmetadatafilter: 'ImageDescription|ObjectName',
      cllimit: '50',
      origin: '*',
    });

    if (continueParam) {
      params.append('gcmcontinue', continueParam);
    }

    try {
      const response = await fetch(`${WIKIMEDIA_API_URL}?${params.toString()}`);
      const data = await response.json();

      if (data.query?.pages) {
        const pageIds = Object.keys(data.query.pages);
        for (const pageId of pageIds) {
          const page = data.query.pages[pageId];
          if (page.imageinfo && page.imageinfo.length > 0) {
            images.push(page);
          }
        }
      }

      continueParam = data.continue?.gcmcontinue;
      console.log(`  Fetched ${images.length} images so far...`);

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching category ${categoryTitle}:`, error);
      break;
    }
  } while (continueParam);

  console.log(`Total images found: ${images.length}`);
  return images;
}

/**
 * Extract sign name from image title or description
 */
function extractSignName(title: string, description?: string): { en: string | null; jp: string | null } {
  let cleanTitle = title
    .replace(/^File:/, '')
    .replace(/\.(png|jpg|jpeg|svg|gif)$/i, '')
    .trim();

  const jpMatch = cleanTitle.match(/[（(]([^）)]+)[）)]/);
  const jpName = jpMatch ? jpMatch[1].trim() : null;

  const enName = cleanTitle
    .replace(/[（(][^）)]+[）)]/g, '')
    .replace(/[-–—].*$/, '')
    .trim() || null;

  return {
    en: enName || cleanTitle,
    jp: jpName || null,
  };
}

/**
 * Extract tags from title and description
 */
function extractTags(title: string, description?: string): string[] {
  const tags: Set<string> = new Set();
  
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  titleWords.forEach(word => tags.add(word));

  const commonTerms = ['sign', 'road', 'traffic', 'japan', 'japanese', 'regulatory', 'warning', 'indication', 'guidance', 'auxiliary'];
  commonTerms.forEach(term => tags.add(term));

  return Array.from(tags);
}

/**
 * Determine category from image metadata
 */
function determineCategory(title: string, description?: string, categories?: string[]): string | null {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  const lowerCats = (categories || []).map(c => c.toLowerCase());

  const allText = `${lowerTitle} ${lowerDesc} ${lowerCats.join(' ')}`;

  if (allText.includes('information') || allText.includes('guidance') || allText.includes('案内')) {
    return 'guidance';
  }
  if (allText.includes('warning') || allText.includes('caution') || allText.includes('警戒')) {
    return 'warning';
  }
  if (allText.includes('regulatory') || allText.includes('prohibition') || allText.includes('規制')) {
    return 'regulatory';
  }
  if (allText.includes('instruction') || allText.includes('indication') || allText.includes('指示')) {
    return 'indication';
  }
  if (allText.includes('auxiliary') || allText.includes('supplementary') || allText.includes('補助')) {
    return 'auxiliary';
  }
  if (allText.includes('marking') || allText.includes('road marking') || allText.includes('道路標示')) {
    return 'road-markings';
  }

  return null;
}

/**
 * Download image from URL
 */
async function downloadImage(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error(`Error downloading image:`, error);
    return null;
  }
}

/**
 * Upload image to Supabase storage
 */
async function uploadToSupabase(
  supabase: ReturnType<typeof createClient>,
  imageBuffer: Uint8Array,
  fileName: string,
  mimeType: string
): Promise<{ path: string; url: string } | null> {
  try {
    const storagePath = `wikimedia-commons/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('road-sign-images')
      .upload(storagePath, imageBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading to Supabase:`, error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('road-sign-images')
      .getPublicUrl(storagePath);

    return {
      path: storagePath,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error(`Error uploading image:`, error);
    return null;
  }
}

/**
 * Process and store a single image
 */
async function processImage(
  supabase: ReturnType<typeof createClient>,
  image: WikimediaImage
): Promise<boolean> {
  try {
    const title = image.title;
    const imageInfo = image.imageinfo[0];
    const imageUrl = imageInfo.url;
    const pageUrl = imageInfo.descriptionurl;
    const description = imageInfo.extmetadata?.ImageDescription?.value || '';
    const objectName = imageInfo.extmetadata?.ObjectName?.value || '';

    // Check if image already exists
    const { data: existing } = await supabase
      .from('road_sign_images')
      .select('id')
      .eq('wikimedia_file_name', title)
      .maybeSingle();

    if (existing) {
      console.log(`  Skipping ${title} (already exists)`);
      return true;
    }

    // Extract metadata
    const signNames = extractSignName(title, description);
    const tags = extractTags(title, description);
    const category = determineCategory(title, description, image.categories) || 'regulatory';

    // Download image
    console.log(`  Downloading: ${title}`);
    const imageBuffer = await downloadImage(imageUrl);
    if (!imageBuffer) {
      console.error(`  Failed to download: ${title}`);
      return false;
    }

    // Determine MIME type from URL
    const mimeType = imageUrl.match(/\.(png|jpg|jpeg|svg|gif)$/i)?.[0] 
      ? (imageUrl.endsWith('.svg') ? 'image/svg+xml' : 
         imageUrl.endsWith('.png') ? 'image/png' : 
         imageUrl.endsWith('.gif') ? 'image/gif' : 'image/jpeg')
      : 'image/png';

    // Upload to Supabase
    const fileName = title.replace(/^File:/, '').replace(/\s+/g, '-');
    const uploadResult = await uploadToSupabase(supabase, imageBuffer, fileName, mimeType);
    
    if (!uploadResult) {
      console.error(`  Failed to upload: ${title}`);
      return false;
    }

    // Store in database
    const { error: dbError } = await supabase
      .from('road_sign_images')
      .insert({
        storage_type: 'supabase',
        storage_path: uploadResult.path,
        storage_url: uploadResult.url,
        file_name: fileName,
        file_size: imageBuffer.length,
        mime_type: mimeType,
        sign_name_en: signNames.en,
        sign_name_jp: signNames.jp,
        sign_category: category,
        sign_meaning: description || objectName || null,
        tags: tags,
        is_verified: true,
        image_source: 'wikimedia_commons',
        wikimedia_file_name: title,
        wikimedia_page_url: pageUrl,
        usage_count: 0,
      });

    if (dbError) {
      console.error(`  Database error for ${title}:`, dbError);
      return false;
    }

    console.log(`  ✓ Stored: ${title} (${category})`);
    return true;
  } catch (error) {
    console.error(`  Error processing image:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { limit = 10, offset = 0 } = await req.json().catch(() => ({}));

    console.log('Starting Wikimedia Commons image download...\n');

    // Fetch images from the main category
    const categoryTitle = 'Road_signs_in_Japan';
    const images = await fetchCategoryImages(categoryTitle);

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images found', total: 0, processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process images in batches
    const batchSize = 5;
    const startIndex = offset || 0;
    const endIndex = limit ? Math.min(startIndex + limit, images.length) : images.length;
    const imagesToProcess = images.slice(startIndex, endIndex);

    console.log(`\nProcessing ${imagesToProcess.length} images (${startIndex + 1}-${endIndex} of ${images.length})...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < imagesToProcess.length; i += batchSize) {
      const batch = imagesToProcess.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(img => processImage(supabase, img)));
      
      results.forEach(success => {
        if (success) successCount++;
        else errorCount++;
      });

      console.log(`\nProgress: ${Math.min(i + batchSize, imagesToProcess.length)}/${imagesToProcess.length} processed`);
      console.log(`  Success: ${successCount}, Errors: ${errorCount}\n`);

      if (i + batchSize < imagesToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: images.length,
        processed: imagesToProcess.length,
        successCount,
        errorCount,
        message: `Processed ${imagesToProcess.length} images (${successCount} successful, ${errorCount} errors)`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in download-wikimedia-images function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


