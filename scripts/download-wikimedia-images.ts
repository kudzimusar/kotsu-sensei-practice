import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL environment variable');
  console.error('Please set VITE_SUPABASE_URL or SUPABASE_URL in .env.local');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('You can find it in Supabase Dashboard > Settings > API > service_role key');
  console.error('\nAlternatively, run with: SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/download-wikimedia-images.ts');
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
      LicenseShortName?: { value: string };
      Artist?: { value: string };
      AttributionRequired?: { value: string };
      License?: { value: string };
    };
  }>;
}

/**
 * Fetch all images embedded on the Road_signs_in_Japan page using generator=images
 * This gets the actual road sign images shown in the gallery, not category files
 */
async function fetchPageImages(pageTitle: string): Promise<WikimediaImage[]> {
  const images: WikimediaImage[] = [];
  let continueParam: string | undefined = undefined;

  console.log(`Fetching images from page: ${pageTitle}`);
  console.log(`Using generator=images to get gallery images (not category files)\n`);

  do {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'images', // Use 'images' generator to get images on the page
      titles: pageTitle,
      gimlimit: '500', // Max images per request
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiextmetadatafilter: 'ImageDescription|ObjectName|LicenseShortName|Artist|AttributionRequired|License',
      origin: '*',
    });

    if (continueParam) {
      params.append('gimcontinue', continueParam);
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
      continueParam = data.continue?.gimcontinue;
      console.log(`  Fetched ${images.length} images so far...`);

      // Rate limiting - be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching page images:`, error);
      break;
    }
  } while (continueParam);

  console.log(`Total images found: ${images.length}`);
  return images;
}

/**
 * Extract sign code/number from title (e.g., "101", "102-A", "407-A")
 * Supports formats: "Japan road sign 101.svg" or "(101) Sign name"
 * and determine category based on sign code ranges
 */
function determineCategoryFromSignCode(title: string): string | null {
  // Try pattern with parentheses first: "(101)" or "(102-A)"
  let codeMatch = title.match(/\((\d+)(?:-([A-Z\d]+))?\)/);
  
  // If not found, try pattern without parentheses: "road sign 101" or "101-A"
  if (!codeMatch) {
    codeMatch = title.match(/road sign (\d+)(?:-([A-Z\d]+))?/i);
  }
  
  // If still not found, try any 3-digit number followed by optional variant
  if (!codeMatch) {
    codeMatch = title.match(/(\d{3})(?:-([A-Z\d]+))?/);
  }
  
  if (!codeMatch) return null;

  const code = parseInt(codeMatch[1], 10);

  // Category ranges based on Japanese road sign numbering system:
  // 101-199: Information/Guidance signs (案内標識)
  // 201-299: Warning signs (警戒標識)  
  // 301-399: Regulatory signs (規制標識)
  // 401-499: Instruction signs (指示標識)
  // 501-599: Auxiliary signs (補助標識)

  if (code >= 101 && code <= 199) {
    return 'guidance';
  }
  if (code >= 201 && code <= 299) {
    return 'warning';
  }
  if (code >= 301 && code <= 399) {
    return 'regulatory';
  }
  if (code >= 401 && code <= 499) {
    return 'indication';
  }
  if (code >= 501 && code <= 599) {
    return 'auxiliary';
  }

  return null;
}

/**
 * Extract sign name from image title
 * Format examples: "(101) 市町村 Municipality" or "(407-A) 横断歩道 Cross walk"
 */
function extractSignName(title: string, description?: string): { en: string | null; jp: string | null; code: string | null } {
  // Remove file extension and "File:" prefix
  let cleanTitle = title
    .replace(/^File:/, '')
    .replace(/\.(png|jpg|jpeg|svg|gif|webp)$/i, '')
    .trim();

  // Extract sign code - try multiple patterns
  let codeMatch = cleanTitle.match(/\((\d+(?:-[A-Z\d]+)?)\)/);
  let code: string | null = null;
  
  if (codeMatch) {
    code = codeMatch[1];
  } else {
    // Try "road sign 101" pattern
    codeMatch = cleanTitle.match(/road sign (\d+(?:-[A-Z\d]+)?)/i);
    if (codeMatch) {
      code = codeMatch[1];
    } else {
      // Try standalone 3-digit code
      codeMatch = cleanTitle.match(/(\d{3}(?:-[A-Z\d]+)?)/);
      if (codeMatch) {
        code = codeMatch[1];
      }
    }
  }

  // For filenames like "Japan road sign 101.svg", extract a cleaner name
  // Remove "Japan road sign" prefix and use code as name
  let enName: string | null = null;
  let jpName: string | null = null;
  
  // Try to extract Japanese characters from description or title
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  
  if (description) {
    // Look for Japanese text in description
    const descMatch = description.match(japanesePattern);
    if (descMatch) {
      // Extract Japanese part from description
      const descParts = description.split(/\s+/);
      const jpParts: string[] = [];
      const enParts: string[] = [];
      
      descParts.forEach(part => {
        if (japanesePattern.test(part)) {
          jpParts.push(part);
        } else if (part.length > 2 && !part.match(/^\d+$/)) {
          enParts.push(part);
        }
      });
      
      jpName = jpParts.length > 0 ? jpParts.join(' ') : null;
      enName = enParts.length > 0 ? enParts.join(' ') : null;
    }
  }
  
  // If filename is like "Japan road sign 101.svg", create a name from the code
  if (!enName && code) {
    enName = `Road Sign ${code}`;
  }
  
  // Fallback to cleaned filename without extension
  if (!enName) {
    enName = cleanTitle
      .replace(/^Japan road sign /i, '')
      .replace(/^File:/, '')
      .trim();
  }

  return {
    en: enName,
    jp: jpName,
    code: code,
  };
}

/**
 * Extract tags from title and description
 */
function extractTags(title: string, description?: string, code?: string | null): string[] {
  const tags: Set<string> = new Set();
  
  // Add sign code if available
  if (code) {
    tags.add(code);
    tags.add(`sign-${code}`);
  }
  
  // Add words from title
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  titleWords.forEach(word => tags.add(word));

  // Add category based on code
  const category = determineCategoryFromSignCode(title);
  if (category) {
    tags.add(category);
  }

  // Add common terms
  tags.add('road-sign');
  tags.add('japan');
  tags.add('japanese');
  tags.add('traffic-sign');

  return Array.from(tags);
}

/**
 * Determine category from image metadata
 */
function determineCategory(title: string, description?: string): string | null {
  // First try to determine from sign code
  const categoryFromCode = determineCategoryFromSignCode(title);
  if (categoryFromCode) {
    return categoryFromCode;
  }

  // Fallback to keyword matching
  const lowerTitle = title.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  const allText = `${lowerTitle} ${lowerDesc}`;

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
    const license = imageInfo.extmetadata?.LicenseShortName?.value || 
                   imageInfo.extmetadata?.License?.value || 'Unknown';
    const artist = imageInfo.extmetadata?.Artist?.value || '';
    const attributionRequired = imageInfo.extmetadata?.AttributionRequired?.value || '';

    // Skip non-image files (PDFs, etc.)
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
    const hasImageExtension = imageExtensions.some(ext => 
      title.toLowerCase().endsWith(ext)
    );
    
    if (!hasImageExtension) {
      console.log(`  Skipping ${title} (not an image file)`);
      return true; // Not an error, just skip
    }

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
    const signData = extractSignName(title, description);
    const category = determineCategory(title, description) || 'regulatory';
    const tags = extractTags(title, description, signData.code);

    // Download image
    console.log(`  Downloading: ${title}`);
    const imageBuffer = await downloadImage(imageUrl);
    if (!imageBuffer) {
      console.error(`  Failed to download: ${title}`);
      return false;
    }

    // Determine MIME type from URL
    let mimeType = 'image/png';
    if (imageUrl.endsWith('.svg')) mimeType = 'image/svg+xml';
    else if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) mimeType = 'image/jpeg';
    else if (imageUrl.endsWith('.gif')) mimeType = 'image/gif';
    else if (imageUrl.endsWith('.webp')) mimeType = 'image/webp';

    // Upload to Supabase
    const fileName = title.replace(/^File:/, '').replace(/\s+/g, '-');
    const uploadResult = await uploadToSupabase(imageBuffer, fileName, mimeType);
    
    if (!uploadResult) {
      console.error(`  Failed to upload: ${title}`);
      return false;
    }

    // Build attribution text
    let attributionText = 'Image from Wikimedia Commons';
    if (artist) {
      attributionText = `Image by ${artist} via Wikimedia Commons`;
    }
    if (license && license !== 'Unknown') {
      attributionText += ` - License: ${license}`;
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
        sign_name_en: signData.en,
        sign_name_jp: signData.jp,
        sign_category: category,
        sign_meaning: description || objectName || null,
        tags: tags,
        is_verified: true,
        image_source: 'wikimedia_commons',
        wikimedia_file_name: title,
        wikimedia_page_url: pageUrl,
        license_info: license,
        attribution_text: attributionText,
        artist_name: artist || null,
        usage_count: 0,
      });

    if (dbError) {
      console.error(`  Database error for ${title}:`, dbError);
      return false;
    }

    console.log(`  ✓ Stored: ${title} (${category}) - License: ${license}`);
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
  console.log('Using generator=images to fetch images from the gallery page\n');

  // Fetch images from the page (not category)
  const pageTitle = 'Road_signs_in_Japan';
  const images = await fetchPageImages(pageTitle);

  if (images.length === 0) {
    console.log('No images found. Exiting.');
    return;
  }

  console.log(`\nProcessing ${images.length} images...\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Process images in batches
  const batchSize = 5;
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(img => processImage(img)));
    
    results.forEach((result, idx) => {
      if (result === true) {
        const img = batch[idx];
        // Check if it was skipped (not an image file or already exists)
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
        const hasImageExtension = imageExtensions.some(ext => 
          img.title.toLowerCase().endsWith(ext)
        );
        if (!hasImageExtension || img.title.includes('.pdf')) {
          skippedCount++;
        } else {
          successCount++;
        }
      } else {
        errorCount++;
      }
    });

    console.log(`\nProgress: ${Math.min(i + batchSize, images.length)}/${images.length} processed`);
    console.log(`  Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}\n`);

    // Rate limiting between batches
    if (i + batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n=== Download Complete ===');
  console.log(`Total images found: ${images.length}`);
  console.log(`Successfully stored: ${successCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run the script
main().catch(console.error);

