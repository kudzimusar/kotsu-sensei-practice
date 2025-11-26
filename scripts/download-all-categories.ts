import { spawn } from 'child_process';
import { join } from 'path';
import { writeFileSync } from 'fs';

// Master list of categories - using correct "Diagrams_of_*" category names
// These are the actual categories that contain road sign images on Wikimedia Commons
// We accept all image formats (SVG, PNG, JPG, etc.) but exclude documents (PDF, DOC, etc.)
const CATEGORIES = process.env.TEST_SINGLE_CATEGORY
  ? [process.env.TEST_SINGLE_CATEGORY]
  : [
      'SVG_road_signs_in_Japan',                              // Main SVG collection
      'Diagrams_of_regulatory_road_signs_of_Japan',           // Regulatory signs
      'Diagrams_of_information_road_signs_of_Japan',          // Information/guide signs
      'Diagrams_of_instruction_road_signs_of_Japan',          // Instruction signs
      'Diagrams_of_warning_road_signs_of_Japan',              // Warning signs
      'Diagrams_of_mandatory_road_signs_of_Japan',            // Mandatory signs
      'Diagrams_of_prohibitory_road_signs_of_Japan',          // Prohibitory signs
      'Diagrams_of_priority_road_signs_of_Japan',             // Priority signs
      'Diagrams_of_guide_road_signs_in_Japan',                // Guide signs
      'Symbols_of_road_signs_of_Japan',                       // Road sign symbols
      'Diagrams_of_road_markings_of_Japan',                   // Road markings
      'Diagrams_of_additional_road_signs_of_Japan',           // Additional signs
      'Diagrams_of_expressway_exit_signs_of_Japan',           // Expressway signs (225 files!)
      'Diagrams_of_traffic_signals_of_Japan',                 // Traffic signals (29 files)
    ];

const DRY_RUN = process.env.DRY_RUN === 'true';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '6');

interface CategoryResult {
  category: string;
  success: boolean;
  filesFound: number;
  uploaded: number;
  skipped: number;
  created: number;
  updated: number;
  errors: number;
  errorMessage?: string;
}

async function runCategory(category: string): Promise<CategoryResult> {
  return new Promise((resolve) => {
    console.log('\n' + '='.repeat(70));
    console.log(`📥 Processing category: ${category}`);
    console.log('='.repeat(70));

    const env = {
      ...process.env,
      WIKIMEDIA_CATEGORY: category,
      DRY_RUN: DRY_RUN ? 'true' : undefined,
      CONCURRENCY: CONCURRENCY.toString(),
    };

    // Remove undefined values
    Object.keys(env).forEach(key => {
      if (env[key as keyof typeof env] === undefined) {
        delete env[key as keyof typeof env];
      }
    });

    const scriptPath = join(process.cwd(), 'scripts', 'clean-wikimedia-download.ts');
    const child = spawn('npx', ['tsx', scriptPath], {
      env,
      stdio: ['inherit', 'pipe', 'pipe'], // Pipe stdout/stderr to capture output
      shell: false, // Don't use shell to avoid path issues
      cwd: process.cwd(),
    });

    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.stderr?.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      // Parse results from output (look for report summary)
      const filesFoundMatch = output.match(/Total Wikimedia files found: (\d+)/);
      const uploadedMatch = output.match(/✅ Uploaded: (\d+)/);
      const skippedMatch = output.match(/⏭️  Skipped: (\d+)/);
      const createdMatch = output.match(/➕ Database created: (\d+)/);
      const updatedMatch = output.match(/✏️  Database updated: (\d+)/);
      const errorsMatch = output.match(/❌ Failures: (\d+)/);

      const result: CategoryResult = {
        category,
        success: code === 0,
        filesFound: filesFoundMatch ? parseInt(filesFoundMatch[1]) : 0,
        uploaded: uploadedMatch ? parseInt(uploadedMatch[1]) : 0,
        skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
        created: createdMatch ? parseInt(createdMatch[1]) : 0,
        updated: updatedMatch ? parseInt(updatedMatch[1]) : 0,
        errors: errorsMatch ? parseInt(errorsMatch[1]) : 0,
      };

      if (code !== 0) {
        result.errorMessage = `Process exited with code ${code}`;
      }

      resolve(result);
    });

    child.on('error', (error) => {
      resolve({
        category,
        success: false,
        filesFound: 0,
        uploaded: 0,
        skipped: 0,
        created: 0,
        updated: 0,
        errors: 0,
        errorMessage: error.message,
      });
    });
  });
}

async function main() {
  console.log('🚀 Starting download from ALL Wikimedia categories...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No files will be uploaded or database updated\n');
  }

  console.log(`📋 Categories to process: ${CATEGORIES.length}`);
  CATEGORIES.forEach((cat, i) => {
    console.log(`  ${i + 1}. ${cat}`);
  });
  console.log('');

  const results: CategoryResult[] = [];
  const startTime = Date.now();

  // Process categories sequentially to avoid overwhelming the API
  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
    const result = await runCategory(category);
    results.push(result);

    // Show progress
    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Progress: ${i + 1}/${CATEGORIES.length} categories completed (${successCount} successful)`);

    // Small delay between categories to be respectful to the API
    if (i < CATEGORIES.length - 1) {
      console.log('⏳ Waiting 2 seconds before next category...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Final summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL SUMMARY - ALL CATEGORIES');
  console.log('='.repeat(70));

  const totals = results.reduce(
    (acc, r) => ({
      filesFound: acc.filesFound + r.filesFound,
      uploaded: acc.uploaded + r.uploaded,
      skipped: acc.skipped + r.skipped,
      created: acc.created + r.created,
      updated: acc.updated + r.updated,
      errors: acc.errors + r.errors,
      successful: acc.successful + (r.success ? 1 : 0),
    }),
    { filesFound: 0, uploaded: 0, skipped: 0, created: 0, updated: 0, errors: 0, successful: 0 }
  );

  console.log(`\nCategories processed: ${CATEGORIES.length}`);
  console.log(`✅ Successful: ${totals.successful}`);
  console.log(`❌ Failed: ${CATEGORIES.length - totals.successful}`);
  console.log(`\nTotal files found: ${totals.filesFound}`);
  console.log(`✅ Uploaded: ${totals.uploaded}`);
  console.log(`⏭️  Skipped: ${totals.skipped}`);
  console.log(`➕ Database created: ${totals.created}`);
  console.log(`✏️  Database updated: ${totals.updated}`);
  console.log(`❌ Errors: ${totals.errors}`);
  console.log(`\n⏱️  Total duration: ${duration} minutes`);

  // Category-by-category breakdown
  console.log(`\n📋 Per-category breakdown:`);
  results.forEach((result, i) => {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${i + 1}. ${status} ${result.category}`);
    console.log(`     Found: ${result.filesFound}, Uploaded: ${result.uploaded}, Skipped: ${result.skipped}`);
    if (result.errorMessage) {
      console.log(`     Error: ${result.errorMessage}`);
    }
  });

  // Save summary report
  const reportPath = join(process.cwd(), 'all-categories-download-report.json');
  const report = {
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    durationMinutes: parseFloat(duration),
    dryRun: DRY_RUN,
    categories: CATEGORIES,
    results,
    totals,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Full report saved to: ${reportPath}`);

  console.log('\n✅ All categories download complete!');

  // Exit with error code if any category failed
  if (totals.successful < CATEGORIES.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

