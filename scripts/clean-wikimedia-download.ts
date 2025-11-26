import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { createHash } from 'crypto';
import { writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const WIKIMEDIA_CATEGORY = process.env.WIKIMEDIA_CATEGORY || 'SVG_road_signs_in_Japan';
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'road-sign-images';
const SUPABASE_PREFIX = process.env.SUPABASE_PREFIX || 'wikimedia-commons/';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '6');
const DRY_RUN = process.env.DRY_RUN === 'true';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const WIKIMEDIA_API_URL = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'KotsuSensei/1.0 (Clean Wikimedia Download; https://github.com/kudzimusar/kotsu-sensei-practice)';

// ============================================================================
// INTERFACES
// ============================================================================

interface WikimediaFileMetadata {
  title: string; // e.g., "File:Japanese_Road_sign_(Direction_and_Lane_A).svg"
  pageid: number;
  url: string;
  size: number;
  width: number;
  height: number;
  sha1: string;
  mime: string;
  descriptionurl: string;
  extmetadata?: {
    ImageDescription?: { value: string };
    ObjectName?: { value: string };
    LicenseShortName?: { value: string };
    License?: { value: string };
    Artist?: { value: string };
    AttributionRequired?: { value: string };
  };
  categories?: string[];
}

interface ProcessedFile {
  wikimediaTitle: string;
  canonicalFilename: string;
  storagePath: string;
  storageUrl: string;
  metadata: WikimediaFileMetadata;
  dbRecord: any;
}

interface Report {
  totalWikimediaFilesFound: number;
  processedCount: number;
  uploadedCount: number;
  skippedCount: number;
  dbCreated: number;
  dbUpdated: number;
  failures: Array<{ file: string; error: string; retryHint?: string }>;
  startTime: string;
  endTime?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Canonicalize filename - convert Wikimedia title to safe storage filename
 */
function canonicalName(title: string): string {
  // Remove "File:" prefix
  let base = title.replace(/^File:/i, '');
  
  // Extract extension
  const extMatch = base.match(/\.([^.]+)$/);
  const extension = extMatch ? extMatch[1].toLowerCase() : '';
  const nameWithoutExt = base.replace(/\.[^.]+$/, '');
  
  // Clean up the name
  return nameWithoutExt
    .toLowerCase()
    .replace(/[（）()]/g, '')          // Remove parentheses characters
    .replace(/[^a-z0-9]+/gi, '_')     // Non-alphanumeric -> underscore
    .replace(/_+/g, '_')               // Multiple underscores -> single
    .replace(/^_|_$/g, '')             // Remove leading/trailing underscores
    + (extension ? `.${extension}` : '');
}

/**
 * Extract English and Japanese names from metadata
 */
function extractSignNames(
  title: string,
  description?: string,
  objectName?: string
): { en: string | null; jp: string | null; code: string | null } {
  let enName: string | null = null;
  let jpName: string | null = null;
  let code: string | null = null;

  // Extract sign code from filename (e.g., "Japan_road_sign_R1-1.svg" -> "R1-1")
  const codeMatch = title.match(/(?:Japan|Japanese)[_\s]+road[_\s]+sign[_\s]+([A-Z]?\d+[-_]?\d*)/i);
  if (codeMatch) {
    code = codeMatch[1];
  }

  const source = objectName || description || '';
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  
  if (japanesePattern.test(source) && description) {
    const parts = description.split(/[()（）,，\n]/);
    for (const part of parts) {
      if (japanesePattern.test(part.trim()) && !jpName) {
        jpName = part.trim();
      } else if (!japanesePattern.test(part.trim()) && part.trim().length > 2 && !enName) {
        enName = part.trim();
      }
    }
  }

  if (!enName && objectName) {
    enName = objectName;
  }

  if (!enName) {
    enName = title
      .replace(/^File:/, '')
      .replace(/\.(svg|png|jpg|jpeg)$/i, '')
      .replace(/_/g, ' ')
      .trim();
  }

  return { en: enName || null, jp: jpName || null, code };
}

/**
 * Determine category from Wikimedia categories
 */
function determineCategory(categories: string[]): string {
  const categoryLower = categories.map(c => c.toLowerCase());
  
  if (categoryLower.some(c => c.includes('warning'))) return 'warning';
  if (categoryLower.some(c => c.includes('regulatory') || c.includes('prohibition') || c.includes('mandatory'))) return 'regulatory';
  if (categoryLower.some(c => c.includes('guide') || c.includes('direction') || c.includes('information'))) return 'guidance';
  if (categoryLower.some(c => c.includes('instruction') || c.includes('indication'))) return 'indication';
  if (categoryLower.some(c => c.includes('auxiliary') || c.includes('supplementary'))) return 'auxiliary';
  if (categoryLower.some(c => c.includes('road-marking') || c.includes('road marking'))) return 'road-markings';
  
  return 'regulatory'; // default
}

/**
 * Build attribution text
 */
function buildAttributionText(
  artist?: string,
  license?: string,
  pageUrl?: string
): string {
  // Strip HTML tags from artist name for cleaner attribution
  const cleanArtist = artist ? artist.replace(/<[^>]+>/g, '').trim() : null;
  
  let attribution = 'Image from Wikimedia Commons';
  
  if (cleanArtist) {
    attribution = `Image by ${cleanArtist} via Wikimedia Commons`;
  }
  
  if (license && license !== 'Unknown' && license !== 'pd') {
    attribution += ` — License: ${license}`;
  }
  
  if (pageUrl) {
    attribution += ` — Source: ${pageUrl}`;
  }

  return attribution;
}

/**
 * Compute SHA1 hash
 */
function computeSHA1(buffer: Buffer): string {
  return createHash('sha1').update(buffer).digest('hex');
}

// ============================================================================
// WIKIMEDIA API FUNCTIONS
// ============================================================================

/**
 * Fetch all file titles from a Wikimedia category
 */
async function fetchCategoryFiles(categoryTitle: string): Promise<string[]> {
  console.log(`📥 Fetching files from category: Category:${categoryTitle}`);
  
  const files: string[] = [];
  let continueParam: string | undefined = undefined;

  do {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'categorymembers',
      gcmtitle: `Category:${categoryTitle}`,
      gcmtype: 'file',
      gcmlimit: '500',
      prop: 'title',
      origin: '*',
    });

    if (continueParam) {
      params.append('gcmcontinue', continueParam);
    }

    const url = `${WIKIMEDIA_API_URL}?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
      });

      if (!response.ok) {
        console.error(`  ❌ API request failed: ${response.status}`);
        break;
      }

      const data = await response.json();

      if (data.error) {
        console.error(`  ❌ API error: ${data.error.code} - ${data.error.info}`);
        break;
      }

      if (data.query?.pages) {
        const pageIds = Object.keys(data.query.pages);
        for (const pageId of pageIds) {
          const page = data.query.pages[pageId];
          if (page.title && page.title.startsWith('File:')) {
            // Accept all image formats, but exclude documents (PDF, DOC, etc.)
            const ext = page.title.toLowerCase().split('.').pop();
            const imageExtensions = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'];
            const excludedExtensions = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'];
            
            if (ext && imageExtensions.includes(ext) && !excludedExtensions.includes(ext)) {
              files.push(page.title);
            }
          }
        }
        console.log(`  ✅ Found ${files.length} image files so far...`);
      }

      continueParam = data.continue?.gcmcontinue;
      
      if (continueParam) {
        await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
      }
    } catch (error) {
      console.error(`  ❌ Error fetching category:`, error);
      break;
    }
  } while (continueParam);

  console.log(`✅ Total files found: ${files.length}\n`);
  return files;
}

/**
 * Fetch detailed metadata for a batch of files (40-50 at once)
 */
async function fetchMetadataBatch(fileTitles: string[]): Promise<Map<string, WikimediaFileMetadata>> {
  const metadataMap = new Map<string, WikimediaFileMetadata>();

  // Batch titles (API limit is ~50 titles per request)
  const batchSize = 50;
  for (let i = 0; i < fileTitles.length; i += batchSize) {
    const batch = fileTitles.slice(i, i + batchSize);
    const titles = batch.join('|');

    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles,
      prop: 'imageinfo|categories|info',
      iiprop: 'url|size|sha1|extmetadata|dimensions|mime',
      iiextmetadatafilter: 'ImageDescription|ObjectName|LicenseShortName|License|Artist|AttributionRequired',
      cllimit: 'max',
      origin: '*',
    });

    const url = `${WIKIMEDIA_API_URL}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
      });

      if (!response.ok) {
        console.error(`  ⚠️  Batch ${Math.floor(i / batchSize) + 1} failed: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.query?.pages) {
        for (const page of Object.values(data.query.pages) as any[]) {
          if (page.missing || !page.imageinfo || !page.imageinfo[0]) {
            continue;
          }

          const imageInfo = page.imageinfo[0];
          const categories: string[] = [];
          if (page.categories) {
            for (const cat of page.categories) {
              if (cat.title) {
                categories.push(cat.title.replace(/^Category:/, ''));
              }
            }
          }

          metadataMap.set(page.title, {
            title: page.title,
            pageid: page.pageid,
            url: imageInfo.url,
            size: imageInfo.size,
            width: imageInfo.width,
            height: imageInfo.height,
            sha1: imageInfo.sha1,
            mime: imageInfo.mime,
            descriptionurl: imageInfo.descriptionurl,
            extmetadata: imageInfo.extmetadata,
            categories,
          });
        }
      }

      // Rate limiting between batches
      if (i + batchSize < fileTitles.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(`  ⚠️  Error fetching batch ${Math.floor(i / batchSize) + 1}:`, error);
    }
  }

  return metadataMap;
}

// ============================================================================
// SUPABASE FUNCTIONS
// ============================================================================

/**
 * Download file and upload to Supabase
 */
async function downloadAndUpload(
  metadata: WikimediaFileMetadata,
  canonicalFilename: string
): Promise<{ success: boolean; storageUrl?: string; error?: string }> {
  if (DRY_RUN) {
    return { success: true, storageUrl: `[DRY RUN] ${SUPABASE_PREFIX}${canonicalFilename}` };
  }

  try {
    // Download file
    const response = await fetch(metadata.url, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) {
      return { success: false, error: `Download failed: ${response.status}` };
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Optional: Verify SHA1
    if (metadata.sha1) {
      const localHash = computeSHA1(buffer);
      if (localHash !== metadata.sha1) {
        return { success: false, error: `SHA1 mismatch: expected ${metadata.sha1}, got ${localHash}` };
      }
    }

    // Upload to Supabase
    const storagePath = `${SUPABASE_PREFIX}${canonicalFilename}`;
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: metadata.mime || 'image/svg+xml',
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(storagePath);

    return { success: true, storageUrl: urlData.publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upsert database record
 */
async function upsertDatabaseRecord(
  metadata: WikimediaFileMetadata,
  canonicalFilename: string,
  storageUrl: string
): Promise<{ success: boolean; created: boolean; error?: string }> {
  if (DRY_RUN) {
    return { success: true, created: false };
  }

  try {
    const signNames = extractSignNames(
      metadata.title,
      metadata.extmetadata?.ImageDescription?.value,
      metadata.extmetadata?.ObjectName?.value
    );

    const category = determineCategory(metadata.categories || []);
    const license = metadata.extmetadata?.LicenseShortName?.value ||
                   metadata.extmetadata?.License?.value ||
                   'Unknown';

    const artist = metadata.extmetadata?.Artist?.value || null;
    const attribution = buildAttributionText(
      artist,
      license,
      metadata.descriptionurl
    );

    const payload: any = {
      wikimedia_file_name: metadata.title,
      wikimedia_page_url: metadata.descriptionurl,
      filename_slug: canonicalFilename,
      storage_type: 'supabase',
      storage_path: `${SUPABASE_PREFIX}${canonicalFilename}`,
      storage_url: storageUrl,
      file_name: canonicalFilename,
      file_size: metadata.size,
      mime_type: metadata.mime || 'image/svg+xml',
      sign_name_en: signNames.en,
      sign_name_jp: signNames.jp,
      sign_category: category,
      sign_meaning: metadata.extmetadata?.ImageDescription?.value || null,
      license_info: license,
      artist_name: artist,
      attribution_text: attribution,
      sha1: metadata.sha1,
      wikimedia_raw: metadata as any,
      image_source: 'wikimedia_commons',
      is_verified: true,
      updated_at: new Date().toISOString(),
    };

    // Check if record exists
    const { data: existing } = await supabase
      .from('road_sign_images')
      .select('id')
      .eq('wikimedia_file_name', metadata.title)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabase
        .from('road_sign_images')
        .update(payload)
        .eq('id', existing.id);

      if (error) {
        return { success: false, created: false, error: error.message };
      }
      return { success: true, created: false };
    } else {
      // Insert
      const { error } = await supabase
        .from('road_sign_images')
        .insert(payload);

      if (error) {
        return { success: false, created: false, error: error.message };
      }
      return { success: true, created: true };
    }
  } catch (error) {
    return {
      success: false,
      created: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// MAIN PROCESSING
// ============================================================================

async function processFile(
  fileTitle: string,
  metadata: WikimediaFileMetadata,
  processedFiles: Set<string>
): Promise<{ success: boolean; skipped: boolean; created: boolean; error?: string }> {
  // Skip if already processed
  if (processedFiles.has(fileTitle)) {
    return { success: true, skipped: true, created: false };
  }

  const canonicalFilename = canonicalName(fileTitle);
  console.log(`  Processing: ${canonicalFilename}`);

  // Check if already in DB
  if (!DRY_RUN) {
    const { data: existing } = await supabase
      .from('road_sign_images')
      .select('id, wikimedia_file_name')
      .or(`wikimedia_file_name.eq.${fileTitle},filename_slug.eq.${canonicalFilename}`)
      .maybeSingle();

    if (existing) {
      processedFiles.add(fileTitle);
      console.log(`    ⏭️  Already exists, skipping`);
      return { success: true, skipped: true, created: false };
    }
  }

  // Download and upload
  const uploadResult = await downloadAndUpload(metadata, canonicalFilename);
  if (!uploadResult.success) {
    return { success: false, skipped: false, created: false, error: uploadResult.error };
  }

  // Upsert DB record
  const dbResult = await upsertDatabaseRecord(metadata, canonicalFilename, uploadResult.storageUrl!);
  if (!dbResult.success) {
    return { success: false, skipped: false, created: false, error: dbResult.error };
  }

  processedFiles.add(fileTitle);
  console.log(`    ✅ ${dbResult.created ? 'Created' : 'Updated'}`);
  
  return { success: true, skipped: false, created: dbResult.created };
}

/**
 * Process files with concurrency control
 */
async function processFilesBatch(
  files: Array<{ title: string; metadata: WikimediaFileMetadata }>,
  processedFiles: Set<string>
): Promise<{ uploaded: number; skipped: number; created: number; updated: number; errors: Array<{ file: string; error: string }> }> {
  let uploaded = 0;
  let skipped = 0;
  let created = 0;
  let updated = 0;
  const errors: Array<{ file: string; error: string }> = [];

  // Process in concurrent batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    
    const results = await Promise.all(
      batch.map(({ title, metadata }) => processFile(title, metadata, processedFiles))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const file = batch[j];

      if (result.success) {
        if (result.skipped) {
          skipped++;
        } else {
          uploaded++;
          if (result.created) {
            created++;
          } else {
            updated++;
          }
        }
      } else {
        errors.push({
          file: file.title,
          error: result.error || 'Unknown error',
        });
      }
    }

    // Progress update
    console.log(`\n  Progress: ${Math.min(i + CONCURRENCY, files.length)}/${files.length} processed`);
    console.log(`    ✅ Uploaded: ${uploaded}, ⏭️  Skipped: ${skipped}, ➕ Created: ${created}, ✏️  Updated: ${updated}, ❌ Errors: ${errors.length}\n`);

    // Rate limiting between batches
    if (i + CONCURRENCY < files.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { uploaded, skipped, created, updated, errors };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  const report: Report = {
    totalWikimediaFilesFound: 0,
    processedCount: 0,
    uploadedCount: 0,
    skippedCount: 0,
    dbCreated: 0,
    dbUpdated: 0,
    failures: [],
    startTime: new Date().toISOString(),
  };

  console.log('🚀 Starting clean Wikimedia Commons download...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be uploaded or database updated\n');
  }

  try {
    // Step 1: Fetch all file titles from category
    const fileTitles = await fetchCategoryFiles(WIKIMEDIA_CATEGORY);
    
    if (fileTitles.length === 0) {
      console.error('❌ No files found in category');
      process.exit(1);
    }

    report.totalWikimediaFilesFound = fileTitles.length;

    // Step 2: Fetch metadata for all files (in batches)
    console.log('📥 Fetching metadata for all files...');
    const metadataMap = await fetchMetadataBatch(fileTitles);
    console.log(`✅ Retrieved metadata for ${metadataMap.size} files\n`);

    // Step 3: Filter out files without metadata and non-image files
    const filesToProcess = Array.from(metadataMap.entries())
      .filter(([title, metadata]) => {
        // Accept all image formats, exclude documents
        const ext = title.toLowerCase().split('.').pop();
        const imageExtensions = ['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'];
        const excludedExtensions = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'];
        
        if (!ext || excludedExtensions.includes(ext)) {
          return false;
        }
        if (!imageExtensions.includes(ext)) {
          return false;
        }
        // Must have required metadata
        return metadata.url && metadata.sha1;
      })
      .map(([title, metadata]) => ({ title, metadata }));

    console.log(`📋 Processing ${filesToProcess.length} files with complete metadata\n`);

    // Step 4: Process files (with concurrency control)
    const processedFiles = new Set<string>();
    const results = await processFilesBatch(filesToProcess, processedFiles);

    // Update report
    report.processedCount = filesToProcess.length;
    report.uploadedCount = results.uploaded;
    report.skippedCount = results.skipped;
    report.dbCreated = results.created;
    report.dbUpdated = results.updated;
    report.failures = results.errors;
    report.endTime = new Date().toISOString();

    // Step 5: Generate report
    console.log('\n' + '='.repeat(60));
    console.log('📊 DOWNLOAD REPORT');
    console.log('='.repeat(60));
    console.log(`Total Wikimedia files found: ${report.totalWikimediaFilesFound}`);
    console.log(`Files with complete metadata: ${metadataMap.size}`);
    console.log(`Files processed: ${report.processedCount}`);
    console.log(`✅ Uploaded: ${report.uploadedCount}`);
    console.log(`⏭️  Skipped: ${report.skippedCount}`);
    console.log(`➕ Database created: ${report.dbCreated}`);
    console.log(`✏️  Database updated: ${report.dbUpdated}`);
    console.log(`❌ Failures: ${report.failures.length}`);

    if (report.failures.length > 0) {
      console.log(`\nFailures (first 10):`);
      report.failures.slice(0, 10).forEach(f => {
        console.log(`  - ${f.file}: ${f.error}`);
      });
    }

    // Save report to file
    const reportFile = join(process.cwd(), 'clean-download-report.json');
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Full report saved to: ${reportFile}`);

    console.log('\n✅ Clean download complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    report.endTime = new Date().toISOString();
    const reportFile = join(process.cwd(), 'clean-download-report.json');
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    process.exit(1);
  }
}

// Run
main().catch(console.error);

