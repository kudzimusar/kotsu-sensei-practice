import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BUCKET_NAME = 'road-sign-images';
const FOLDER_PATH = 'wikimedia-commons';

async function listAllFiles(folder: string): Promise<string[]> {
  console.log(`📂 Listing all files in ${BUCKET_NAME}/${folder}...`);
  
  const allFiles: string[] = [];
  let hasMore = true;
  let offset = 0;
  const limit = 1000;

  while (hasMore) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('Error listing files:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const file of data) {
      if (file.name && !file.name.endsWith('/')) {
        allFiles.push(`${folder}/${file.name}`);
      }
    }

    console.log(`  Found ${allFiles.length} files so far...`);
    
    if (data.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return allFiles;
}

async function deleteFiles(filePaths: string[]): Promise<{ deleted: number; failed: number; errors: string[] }> {
  console.log(`\n🗑️  Deleting ${filePaths.length} files...`);
  
  let deleted = 0;
  let failed = 0;
  const errors: string[] = [];

  // Delete in batches of 100 (Supabase limit)
  const batchSize = 100;
  for (let i = 0; i < filePaths.length; i += batchSize) {
    const batch = filePaths.slice(i, i + batchSize);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(batch);

    if (error) {
      console.error(`  ❌ Error deleting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      failed += batch.length;
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    } else {
      const deletedCount = data?.length || 0;
      deleted += deletedCount;
      failed += (batch.length - deletedCount);
      console.log(`  ✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${deletedCount}/${batch.length} files`);
    }
  }

  return { deleted, failed, errors };
}

async function cleanupDatabase(): Promise<number> {
  console.log('\n🗑️  Cleaning up database records...');
  
  const { data, error } = await supabase
    .from('road_sign_images')
    .delete()
    .eq('image_source', 'wikimedia_commons')
    .select();

  if (error) {
    console.error('  ❌ Error deleting database records:', error.message);
    return 0;
  }

  const deletedCount = data?.length || 0;
  console.log(`  ✅ Deleted ${deletedCount} database records`);
  return deletedCount;
}

async function main() {
  console.log('🧹 Starting cleanup of Wikimedia Commons storage...\n');

  try {
    // Step 1: List all files
    const files = await listAllFiles(FOLDER_PATH);
    
    if (files.length === 0) {
      console.log('✅ No files found to delete. Storage is already clean.');
      return;
    }

    console.log(`\n📊 Found ${files.length} files to delete`);

    // Step 2: Delete files
    const result = await deleteFiles(files);

    // Step 3: Clean up database records
    const dbDeleted = await cleanupDatabase();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP REPORT');
    console.log('='.repeat(60));
    console.log(`Files deleted: ${result.deleted}/${files.length}`);
    console.log(`Files failed: ${result.failed}`);
    console.log(`Database records deleted: ${dbDeleted}`);
    
    if (result.errors.length > 0) {
      console.log(`\nErrors:`);
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Cleanup complete! Storage is now ready for fresh download.');

  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
main().catch(console.error);


