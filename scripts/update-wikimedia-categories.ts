import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Extract sign code from filename and determine category
 */
function determineCategoryFromCode(filename: string): string | null {
  // Try pattern with parentheses: "(101)"
  let codeMatch = filename.match(/\((\d+)(?:-([A-Z\d]+))?\)/);
  
  // If not found, try pattern without parentheses: "road sign 101"
  if (!codeMatch) {
    codeMatch = filename.match(/road sign (\d+)(?:-([A-Z\d]+))?/i);
  }
  
  // If still not found, try any 3-digit number
  if (!codeMatch) {
    codeMatch = filename.match(/(\d{3})(?:-([A-Z\d]+))?/);
  }
  
  if (!codeMatch) return null;

  const code = parseInt(codeMatch[1], 10);

  // Japanese road sign numbering system
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

async function main() {
  console.log('Updating categories for Wikimedia Commons images...\n');

  // Fetch all Wikimedia Commons images
  const { data: images, error: fetchError } = await supabase
    .from('road_sign_images')
    .select('id, wikimedia_file_name, sign_category')
    .eq('image_source', 'wikimedia_commons');

  if (fetchError) {
    console.error('Error fetching images:', fetchError);
    return;
  }

  console.log(`Found ${images?.length || 0} images to update\n`);

  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (const image of images || []) {
    const newCategory = determineCategoryFromCode(image.wikimedia_file_name);
    
    if (!newCategory) {
      unchanged++;
      continue;
    }

    if (newCategory === image.sign_category) {
      unchanged++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('road_sign_images')
      .update({ sign_category: newCategory })
      .eq('id', image.id);

    if (updateError) {
      console.error(`Error updating ${image.wikimedia_file_name}:`, updateError);
      errors++;
    } else {
      console.log(`  Updated: ${image.wikimedia_file_name} -> ${newCategory}`);
      updated++;
    }
  }

  console.log('\n=== Update Complete ===');
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);


