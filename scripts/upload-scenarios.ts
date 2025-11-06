import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const SUPABASE_URL = 'https://ndulrvfwcqyvutcviebk.supabase.co';
// You'll need to use your service role key for uploads
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Usage: SUPABASE_SERVICE_ROLE_KEY=your_key npm run upload-scenarios');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function uploadScenarios() {
  const scenariosDir = './scenarios';  // Create this folder with your images
  const tests = ['test1', 'test2', 'test3'];
  
  let totalUploaded = 0;
  let totalFailed = 0;
  
  for (const test of tests) {
    const testDir = join(scenariosDir, test);
    
    try {
      const files = await readdir(testDir);
      console.log(`\n📁 Processing ${test}: ${files.length} files found`);
      
      for (const file of files) {
        if (!file.match(/\.(png|jpg|jpeg|webp)$/i)) {
          console.log(`⏭️  Skipping ${file} (not an image)`);
          continue;
        }
        
        const filePath = join(testDir, file);
        const fileBuffer = await readFile(filePath);
        const storagePath = `${test}/${file}`;
        
        const { error } = await supabase.storage
          .from('driving-scenarios')
          .upload(storagePath, fileBuffer, {
            contentType: `image/${file.split('.').pop()?.toLowerCase()}`,
            upsert: true
          });
        
        if (error) {
          console.error(`❌ Failed to upload ${storagePath}:`, error.message);
          totalFailed++;
        } else {
          console.log(`✅ Uploaded ${storagePath}`);
          totalUploaded++;
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${test}:`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Uploaded: ${totalUploaded}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
}

// Run the script
console.log('🚀 Starting scenario image upload...');
console.log('Make sure you have created a ./scenarios folder with subfolders: test1, test2, test3');
uploadScenarios()
  .then(() => {
    console.log('\n✨ Upload process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Upload process failed:', error);
    process.exit(1);
  });
