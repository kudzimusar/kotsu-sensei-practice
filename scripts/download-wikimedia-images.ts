import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Map Wikimedia Commons categories to app categories
const CATEGORY_MAP: { [key: string]: string } = {
  'Information signs': 'guidance',
  'Warning signs': 'warning',
  'Regulatory signs': 'regulatory',
  'Instruction signs': 'indication',
  'Auxiliary signs': 'auxiliary',
  'Road markings': 'road-markings',
};

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
      gcmlimit: '500', // Max per request
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

      // Check for continuation
      continueParam = data.continue?.gcmcontinue;
      console.log(`  Fetched ${images.length} images so far...`);

      // Rate limiting - be respectful
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
  // Remove file extension and common prefixes
  let cleanTitle = title
    .replace(/^File:/, '')
    .replace(/\.(png|jpg|jpeg|svg|gif)$/i, '')
    .trim();

  // Try to extract Japanese and English names
  // Common pattern: "English (Japanese)" or "Japanese - English"
  const jpMatch = cleanTitle.match(/[（(]([^）)]+)[）)]/);
  const jpName = jpMatch ? jpMatch[1].trim() : null;

  // Remove Japanese part to get English
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
  
  // Add words from title
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  titleWords.forEach(word => tags.add(word));

  // Add common sign-related terms
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

  // Check category strings
  const allText = `${lowerTitle} ${lowerDesc} ${lowerCats.join(' ')}`;

  // Map based on keywords
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
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error downloading image:`, error);
    return null;
  }
}

/**
 * Upload image to Supabase storage
 */
async function uploadToSupabase(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ path: string; url: string } | null> {
  try {
    const storagePath = `wikimedia-commons/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('road-sign-images')
      .upload(storagePath, imageBuffer, {
        contentType: mimeType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`Error uploading to Supabase:`, error);
      return null;
    }

    // Get public URL
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
async function processImage(image: WikimediaImage): Promise<boolean> {
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
      .single();

    if (existing) {
      console.log(`  Skipping ${title} (already exists)`);
      return true;
    }

    // Extract metadata
    const signNames = extractSignName(title, description);
    const tags = extractTags(title, description);
    const category = determineCategory(title, description, image.categories) || 'regulatory'; // Default to regulatory

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
    const uploadResult = await uploadToSupabase(imageBuffer, fileName, mimeType);
    
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

/**
 * Main function
 */
async function main() {
  console.log('Starting Wikimedia Commons image download...\n');

  // Fetch images from the main category
  const categoryTitle = 'Road_signs_in_Japan';
  const images = await fetchCategoryImages(categoryTitle);

  if (images.length === 0) {
    console.log('No images found. Exiting.');
    return;
  }

  console.log(`\nProcessing ${images.length} images...\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process images in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(img => processImage(img)));
    
    results.forEach(success => {
      if (success) successCount++;
      else errorCount++;
    });

    // Progress update
    console.log(`\nProgress: ${Math.min(i + batchSize, images.length)}/${images.length} processed`);
    console.log(`  Success: ${successCount}, Errors: ${errorCount}\n`);

    // Rate limiting between batches
    if (i + batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n=== Download Complete ===');
  console.log(`Total images: ${images.length}`);
  console.log(`Successfully stored: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run the script
main().catch(console.error);

