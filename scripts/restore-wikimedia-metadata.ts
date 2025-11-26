import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';

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
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Wikimedia Commons API base URL
const WIKIMEDIA_API_URL = 'https://commons.wikimedia.org/w/api.php';

// Map Wikimedia Commons categories to app categories
const CATEGORY_MAP: { [key: string]: string } = {
  'Information signs': 'guidance',
  'Warning signs': 'warning',
  'Regulatory signs': 'regulatory',
  'Instruction signs': 'indication',
  'Auxiliary signs': 'auxiliary',
  'Road markings': 'road-markings',
  'Warning signs of Japan': 'warning',
  'Regulatory road signs of Japan': 'regulatory',
  'Mandatory signs of Japan': 'regulatory',
  'Guide signs of Japan': 'guidance',
  'Direction signs': 'guidance',
  'Prohibition signs': 'regulatory',
};

interface StorageFile {
  name: string;
  path: string;
  size: number;
  updated_at: string;
  publicUrl: string;
}

interface WikimediaFileMetadata {
  title: string; // e.g., "File:Japan_road_sign_R1-1.svg"
  pageid: number;
  categories: string[];
  imageinfo: Array<{
    url: string;
    descriptionurl: string;
    size: number;
    width: number;
    height: number;
    sha1?: string;
    extmetadata?: {
      ImageDescription?: { value: string };
      ObjectName?: { value: string };
      LicenseShortName?: { value: string };
      License?: { value: string };
      Artist?: { value: string };
      AttributionRequired?: { value: string };
    };
  }>;
}

interface MatchResult {
  storageFile: StorageFile;
  wikimediaMetadata: WikimediaFileMetadata;
  matchStrategy: 'filename' | 'size' | 'hash' | 'wikimedia_filename';
  confidence: number;
}

interface Report {
  storageFilesScanned: number;
  wikimediaEntriesFetched: number;
  matchedByFilename: number;
  matchedBySize: number;
  matchedByHash: number;
  matchedByWikimediaFilename: number;
  recordsUpdated: number;
  recordsCreated: number;
  unmatchedStorage: StorageFile[];
  unmatchedWikimedia: WikimediaFileMetadata[];
  errors: Array<{ file: string; error: string }>;
}

/**
 * Normalize filename for comparison
 */
function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/^file:/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extract sign name from Wikimedia metadata
 */
function extractSignNameFromMetadata(
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

  // Try to extract from objectName or description
  const source = objectName || description || '';
  
  // Look for Japanese text (hiragana, katakana, kanji)
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  const hasJapanese = japanesePattern.test(source);

  if (hasJapanese && description) {
    // Split by common separators and extract Japanese/English parts
    const parts = description.split(/[()（）,，\n]/);
    for (const part of parts) {
      if (japanesePattern.test(part.trim()) && !jpName) {
        jpName = part.trim();
      } else if (!japanesePattern.test(part.trim()) && part.trim().length > 2 && !enName) {
        enName = part.trim();
      }
    }
  }

  // Fallback to objectName if no English name found
  if (!enName && objectName) {
    enName = objectName;
  }

  // Fallback to cleaned title
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
function determineCategoryFromCategories(categories: string[]): string | null {
  const categoryLower = categories.map(c => c.toLowerCase());
  
  for (const [wikimediaCategory, appCategory] of Object.entries(CATEGORY_MAP)) {
    if (categoryLower.some(c => c.includes(wikimediaCategory.toLowerCase()))) {
      return appCategory;
    }
  }

  // Fallback logic
  if (categoryLower.some(c => c.includes('warning'))) return 'warning';
  if (categoryLower.some(c => c.includes('regulatory') || c.includes('prohibition') || c.includes('mandatory'))) return 'regulatory';
  if (categoryLower.some(c => c.includes('guide') || c.includes('direction') || c.includes('information'))) return 'guidance';
  if (categoryLower.some(c => c.includes('instruction') || c.includes('indication'))) return 'indication';
  if (categoryLower.some(c => c.includes('auxiliary') || c.includes('supplementary'))) return 'auxiliary';

  return null;
}

/**
 * Build attribution text
 */
function buildAttributionText(
  artist?: string,
  license?: string,
  pageUrl?: string
): string {
  let attribution = 'Image from Wikimedia Commons';
  
  if (artist) {
    attribution = `Image by ${artist} via Wikimedia Commons`;
  }
  
  if (license && license !== 'Unknown') {
    attribution += ` — License: ${license}`;
  }
  
  if (pageUrl) {
    attribution += ` — Source: ${pageUrl}`;
  }

  return attribution;
}

/**
 * Compute SHA1 hash of image buffer
 */
function computeSHA1(buffer: Buffer): string {
  return createHash('sha1').update(buffer).digest('hex');
}

/**
 * List all files from Supabase Storage
 */
async function listStorageFiles(): Promise<StorageFile[]> {
  console.log('📂 Listing files from Supabase Storage...');
  
  const { data: files, error } = await supabase.storage
    .from('road-sign-images')
    .list('wikimedia-commons', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) {
    console.error('Error listing storage files:', error);
    throw error;
  }

  console.log(`✅ Found ${files?.length || 0} files in storage`);

  const storageFiles: StorageFile[] = [];
  for (const file of files || []) {
    if (file.name && !file.name.endsWith('/')) {
      const { data: urlData } = supabase.storage
        .from('road-sign-images')
        .getPublicUrl(`wikimedia-commons/${file.name}`);
      
      storageFiles.push({
        name: file.name,
        path: `wikimedia-commons/${file.name}`,
        size: file.metadata?.size || 0,
        updated_at: file.updated_at || '',
        publicUrl: urlData.publicUrl,
      });
    }
  }

  return storageFiles;
}

/**
 * Fetch all Wikimedia files from category
 */
async function fetchWikimediaFilesList(): Promise<string[]> {
  console.log('📥 Fetching Wikimedia Commons file list...');
  
  const files: string[] = [];
  let continueParam: string | undefined = undefined;

  do {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'categorymembers',
      cmtitle: 'Category:Road_signs_of_Japan',
      cmlimit: '500',
      cmnamespace: '6', // File namespace
      origin: '*',
    });

    if (continueParam) {
      params.append('cmcontinue', continueParam);
    }

    const response = await fetch(`${WIKIMEDIA_API_URL}?${params.toString()}`);
    const data = await response.json();

    if (data.query?.categorymembers) {
      for (const member of data.query.categorymembers) {
        if (member.title && member.title.startsWith('File:')) {
          files.push(member.title);
        }
      }
    }

    continueParam = data.continue?.cmcontinue;
    console.log(`  Fetched ${files.length} file titles so far...`);
  } while (continueParam);

  console.log(`✅ Found ${files.length} Wikimedia files`);
  return files;
}

/**
 * Fetch detailed metadata for a Wikimedia file
 */
async function fetchWikimediaMetadata(
  fileTitle: string
): Promise<WikimediaFileMetadata | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: fileTitle,
    prop: 'imageinfo|categories',
    iiprop: 'url|size|sha1|extmetadata|dimensions',
    iiextmetadatafilter: 'ImageDescription|ObjectName|LicenseShortName|License|Artist|AttributionRequired',
    cllimit: '50',
    origin: '*',
  });

  try {
    const response = await fetch(`${WIKIMEDIA_API_URL}?${params.toString()}`);
    const data = await response.json();

    const pages = data.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page || page.missing) return null;

    // Extract categories
    const categories: string[] = [];
    if (page.categories) {
      for (const cat of page.categories) {
        if (cat.title) {
          categories.push(cat.title.replace(/^Category:/, ''));
        }
      }
    }

    return {
      title: page.title,
      pageid: page.pageid,
      categories,
      imageinfo: page.imageinfo || [],
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${fileTitle}:`, error);
    return null;
  }
}

/**
 * Match storage files to Wikimedia metadata
 */
async function matchFiles(
  storageFiles: StorageFile[],
  wikimediaFiles: string[]
): Promise<MatchResult[]> {
  console.log('🔍 Matching storage files to Wikimedia metadata...');
  
  const matches: MatchResult[] = [];
  const matchedStoragePaths = new Set<string>();
  const matchedWikimediaTitles = new Set<string>();

  // Strategy 1: Match by existing wikimedia_file_name in database
  console.log('  Strategy 1: Checking existing wikimedia_file_name in database...');
  for (const storageFile of storageFiles) {
    const { data: existing } = await supabase
      .from('road_sign_images')
      .select('wikimedia_file_name')
      .eq('storage_path', storageFile.path)
      .maybeSingle();

    if (existing?.wikimedia_file_name) {
      const metadata = await fetchWikimediaMetadata(existing.wikimedia_file_name);
      if (metadata) {
        matches.push({
          storageFile,
          wikimediaMetadata: metadata,
          matchStrategy: 'wikimedia_filename',
          confidence: 1.0,
        });
        matchedStoragePaths.add(storageFile.path);
        matchedWikimediaTitles.add(metadata.title);
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Strategy 2: Match by normalized filename
  console.log('  Strategy 2: Matching by normalized filenames...');
  for (const storageFile of storageFiles) {
    if (matchedStoragePaths.has(storageFile.path)) continue;

    const normalizedStorage = normalizeFilename(storageFile.name);
    
    for (const wikimediaTitle of wikimediaFiles) {
      if (matchedWikimediaTitles.has(wikimediaTitle)) continue;

      const normalizedWikimedia = normalizeFilename(wikimediaTitle);
      
      if (normalizedStorage === normalizedWikimedia || 
          normalizedStorage.includes(normalizedWikimedia) ||
          normalizedWikimedia.includes(normalizedStorage)) {
        const metadata = await fetchWikimediaMetadata(wikimediaTitle);
        if (metadata) {
          matches.push({
            storageFile,
            wikimediaMetadata: metadata,
            matchStrategy: 'filename',
            confidence: 0.9,
          });
          matchedStoragePaths.add(storageFile.path);
          matchedWikimediaTitles.add(wikimediaTitle);
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          break;
        }
      }
    }
  }

  // Strategy 3: Match by file size
  console.log('  Strategy 3: Matching by file size...');
  const wikimediaMetadataCache = new Map<string, WikimediaFileMetadata>();
  
  for (const storageFile of storageFiles) {
    if (matchedStoragePaths.has(storageFile.path)) continue;
    if (storageFile.size === 0) continue;

    for (const wikimediaTitle of wikimediaFiles) {
      if (matchedWikimediaTitles.has(wikimediaTitle)) continue;

      let metadata = wikimediaMetadataCache.get(wikimediaTitle);
      if (!metadata) {
        metadata = await fetchWikimediaMetadata(wikimediaTitle);
      if (metadata) {
        wikimediaMetadataCache.set(wikimediaTitle, metadata);
        // Rate limiting to avoid overwhelming API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (metadata && metadata.imageinfo[0]?.size === storageFile.size) {
        matches.push({
          storageFile,
          wikimediaMetadata: metadata,
          matchStrategy: 'size',
          confidence: 0.7,
        });
        matchedStoragePaths.add(storageFile.path);
        matchedWikimediaTitles.add(wikimediaTitle);
        break;
      }
    }
  }

  // Strategy 4: Match by SHA1 hash (most accurate but slower)
  console.log('  Strategy 4: Matching by SHA1 hash (this may take a while)...');
  const hashMatches: MatchResult[] = [];
  
  // Build hash map from Wikimedia metadata first (only fetch metadata once)
  const wikimediaHashMap = new Map<string, WikimediaFileMetadata>();
  
  for (const wikimediaTitle of wikimediaFiles) {
    if (matchedWikimediaTitles.has(wikimediaTitle)) continue;
    
    let metadata = wikimediaMetadataCache.get(wikimediaTitle);
    if (!metadata) {
      metadata = await fetchWikimediaMetadata(wikimediaTitle);
      if (metadata) {
        wikimediaMetadataCache.set(wikimediaTitle, metadata);
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (metadata?.imageinfo[0]?.sha1) {
      wikimediaHashMap.set(metadata.imageinfo[0].sha1, metadata);
    }
  }

  // Now match storage files by hash
  for (const storageFile of storageFiles) {
    if (matchedStoragePaths.has(storageFile.path)) continue;

    // Download file to compute hash
    try {
      const response = await fetch(storageFile.publicUrl);
      if (!response.ok) continue;
      
      const buffer = Buffer.from(await response.arrayBuffer());
      const hash = computeSHA1(buffer);

      const metadata = wikimediaHashMap.get(hash);
      if (metadata && !matchedWikimediaTitles.has(metadata.title)) {
        hashMatches.push({
          storageFile,
          wikimediaMetadata: metadata,
          matchStrategy: 'hash',
          confidence: 1.0,
        });
        matchedStoragePaths.add(storageFile.path);
        matchedWikimediaTitles.add(metadata.title);
      }
    } catch (error) {
      console.error(`Error computing hash for ${storageFile.name}:`, error);
    }
  }

  matches.push(...hashMatches);

  console.log(`✅ Matched ${matches.length} files`);
  return matches;
}

/**
 * Update or create database records
 */
async function updateDatabase(matches: MatchResult[]): Promise<Report> {
  const report: Report = {
    storageFilesScanned: 0,
    wikimediaEntriesFetched: 0,
    matchedByFilename: 0,
    matchedBySize: 0,
    matchedByHash: 0,
    matchedByWikimediaFilename: 0,
    recordsUpdated: 0,
    recordsCreated: 0,
    unmatchedStorage: [],
    unmatchedWikimedia: [],
    errors: [],
  };

  console.log('💾 Updating database records...');

  for (const match of matches) {
    try {
      const { storageFile, wikimediaMetadata, matchStrategy } = match;
      const imageInfo = wikimediaMetadata.imageinfo[0];
      
      // Extract metadata
      const signData = extractSignNameFromMetadata(
        wikimediaMetadata.title,
        imageInfo?.extmetadata?.ImageDescription?.value,
        imageInfo?.extmetadata?.ObjectName?.value
      );
      
      const category = determineCategoryFromCategories(wikimediaMetadata.categories) || 'regulatory';
      const license = imageInfo?.extmetadata?.LicenseShortName?.value || 
                     imageInfo?.extmetadata?.License?.value || 'Unknown';
      const artist = imageInfo?.extmetadata?.Artist?.value || null;
      const attribution = buildAttributionText(
        artist,
        license,
        imageInfo?.descriptionurl
      );

      // Check if record exists
      const { data: existing } = await supabase
        .from('road_sign_images')
        .select('id')
        .eq('storage_path', storageFile.path)
        .maybeSingle();

      const recordData: any = {
        storage_type: 'supabase',
        storage_path: storageFile.path,
        storage_url: storageFile.publicUrl,
        file_name: storageFile.name,
        file_size: imageInfo?.size || storageFile.size,
        sign_name_en: signData.en,
        sign_name_jp: signData.jp,
        sign_category: category,
        sign_meaning: imageInfo?.extmetadata?.ImageDescription?.value || null,
        is_verified: true,
        image_source: 'wikimedia_commons',
        wikimedia_file_name: wikimediaMetadata.title,
        wikimedia_page_url: imageInfo?.descriptionurl || null,
        license_info: license,
        attribution_text: attribution,
        artist_name: artist,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('road_sign_images')
          .update(recordData)
          .eq('id', existing.id);

        if (error) {
          report.errors.push({ file: storageFile.name, error: error.message });
        } else {
          report.recordsUpdated++;
          if (matchStrategy === 'filename') report.matchedByFilename++;
          else if (matchStrategy === 'size') report.matchedBySize++;
          else if (matchStrategy === 'hash') report.matchedByHash++;
          else if (matchStrategy === 'wikimedia_filename') report.matchedByWikimediaFilename++;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('road_sign_images')
          .insert(recordData);

        if (error) {
          report.errors.push({ file: storageFile.name, error: error.message });
        } else {
          report.recordsCreated++;
          if (matchStrategy === 'filename') report.matchedByFilename++;
          else if (matchStrategy === 'size') report.matchedBySize++;
          else if (matchStrategy === 'hash') report.matchedByHash++;
        }
      }
    } catch (error) {
      report.errors.push({
        file: match.storageFile.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return report;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Wikimedia metadata restoration...\n');

  try {
    // Step 1: List storage files
    const storageFiles = await listStorageFiles();
    
    // Step 2: Fetch Wikimedia file list
    const wikimediaFiles = await fetchWikimediaFilesList();
    
    // Step 3: Match files
    const matches = await matchFiles(storageFiles, wikimediaFiles);
    
    // Step 4: Update database
    const report = await updateDatabase(matches);
    
    // Step 5: Generate report
    report.storageFilesScanned = storageFiles.length;
    report.wikimediaEntriesFetched = wikimediaFiles.length;
    report.unmatchedStorage = storageFiles.filter(
      sf => !matches.some(m => m.storageFile.path === sf.path)
    );
    report.unmatchedWikimedia = []; // Could be populated if needed

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESTORATION REPORT');
    console.log('='.repeat(60));
    console.log(`Storage files scanned: ${report.storageFilesScanned}`);
    console.log(`Wikimedia entries fetched: ${report.wikimediaEntriesFetched}`);
    console.log(`\nMatches:`);
    console.log(`  📝 By filename: ${report.matchedByFilename}`);
    console.log(`  📏 By size: ${report.matchedBySize}`);
    console.log(`  🔐 By hash: ${report.matchedByHash}`);
    console.log(`  🗂️  By existing DB record: ${report.matchedByWikimediaFilename}`);
    console.log(`\nDatabase:`);
    console.log(`  ✏️  Records updated: ${report.recordsUpdated}`);
    console.log(`  ➕ Records created: ${report.recordsCreated}`);
    console.log(`  ❌ Errors: ${report.errors.length}`);
    console.log(`  ⚠️  Unmatched storage files: ${report.unmatchedStorage.length}`);
    
    if (report.errors.length > 0) {
      console.log(`\nErrors:`);
      report.errors.forEach(err => {
        console.log(`  - ${err.file}: ${err.error}`);
      });
    }

    if (report.unmatchedStorage.length > 0) {
      console.log(`\nUnmatched storage files (first 10):`);
      report.unmatchedStorage.slice(0, 10).forEach(file => {
        console.log(`  - ${file.name}`);
      });
    }

    // Save report to file
    const reportFile = join(process.cwd(), 'wikimedia-restoration-report.json');
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Full report saved to: ${reportFile}`);

    console.log('\n✅ Metadata restoration complete!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

