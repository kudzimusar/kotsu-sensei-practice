#!/usr/bin/env node

// Live monitoring script for Wikimedia download progress
// Uses direct Supabase queries for better reliability

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

dotenv.config({ path: join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function clearScreen() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

function formatTime(date) {
  return date.toLocaleTimeString();
}

async function getDatabaseStats() {
  try {
    // Total count
    const { count: total } = await supabase
      .from('road_sign_images')
      .select('*', { count: 'exact', head: true })
      .eq('image_source', 'wikimedia_commons');

    // Recent uploads (last minute)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count: recent } = await supabase
      .from('road_sign_images')
      .select('*', { count: 'exact', head: true })
      .eq('image_source', 'wikimedia_commons')
      .gte('updated_at', oneMinuteAgo);

    // Category breakdown
    const { data: allImages } = await supabase
      .from('road_sign_images')
      .select('sign_category')
      .eq('image_source', 'wikimedia_commons');

    const categoryCounts = {};
    allImages?.forEach(img => {
      const cat = img.sign_category || 'unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return {
      total: total || 0,
      recent: recent || 0,
      categories: categoryCounts,
    };
  } catch (error) {
    return { total: 0, recent: 0, categories: {}, error: error.message };
  }
}

function checkProcessRunning() {
  try {
    const { execSync } = await import('child_process');
    const result = execSync('ps aux | grep -c "[d]ownload-all-categories"', { encoding: 'utf-8' });
    const mainCount = parseInt(result.trim()) || 0;
    const childResult = execSync('ps aux | grep -c "[c]lean-wikimedia-download"', { encoding: 'utf-8' });
    const childCount = parseInt(childResult.trim()) || 0;
    return { running: mainCount > 0, mainCount, childCount };
  } catch {
    return { running: false, mainCount: 0, childCount: 0 };
  }
}

function getLatestLog() {
  const logPath = join(process.cwd(), 'all-categories-download-full.log');
  if (!existsSync(logPath)) return [];
  
  try {
    const log = readFileSync(logPath, 'utf-8');
    return log.split('\n').filter(Boolean).slice(-8);
  } catch {
    return [];
  }
}

function getReportStatus() {
  const reportPath = join(process.cwd(), 'all-categories-download-report.json');
  if (!existsSync(reportPath)) return null;
  
  try {
    const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
    const results = report.results || [];
    const totals = report.totals || {};
    const completed = results.filter(r => r.success).length;
    const totalCategories = report.categories?.length || 0;
    
    return {
      completed,
      totalCategories,
      filesFound: totals.filesFound || 0,
      uploaded: totals.uploaded || 0,
      skipped: totals.skipped || 0,
      created: totals.created || 0,
      updated: totals.updated || 0,
      errors: totals.errors || 0,
    };
  } catch {
    return null;
  }
}

async function displayProgress() {
  clearScreen();
  
  console.log('🔄 LIVE DOWNLOAD PROGRESS MONITOR');
  console.log('==================================');
  console.log(`⏰ ${formatTime(new Date())}`);
  console.log('');
  
  // Process status
  const processStatus = checkProcessRunning();
  if (processStatus.running) {
    console.log('✅ Process Status: RUNNING');
    console.log(`   Main processes: ${processStatus.mainCount}`);
    console.log(`   Child processes: ${processStatus.childCount}`);
  } else {
    console.log('❌ Process Status: NOT RUNNING');
  }
  
  console.log('');
  console.log('📊 Database Statistics:');
  
  // Database stats
  const dbStats = await getDatabaseStats();
  console.log(`   Total images: ${dbStats.total}`);
  console.log(`   Uploaded in last minute: ${dbStats.recent}`);
  
  console.log('');
  console.log('📋 Categories in Database:');
  if (Object.keys(dbStats.categories).length > 0) {
    Object.entries(dbStats.categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });
  } else {
    console.log('   Loading...');
  }
  
  console.log('');
  console.log('📝 Latest Log Activity:');
  const logLines = getLatestLog();
  if (logLines.length > 0) {
    logLines.slice(-5).forEach(line => {
      console.log(`   ${line}`);
    });
  } else {
    console.log('   Waiting for log entries...');
  }
  
  console.log('');
  console.log('📊 Report Status:');
  const reportStatus = getReportStatus();
  if (reportStatus) {
    console.log(`   Categories completed: ${reportStatus.completed}/${reportStatus.totalCategories}`);
    console.log(`   Files found: ${reportStatus.filesFound}`);
    console.log(`   Files uploaded: ${reportStatus.uploaded}`);
    console.log(`   Files skipped: ${reportStatus.skipped}`);
    console.log(`   Created: ${reportStatus.created} | Updated: ${reportStatus.updated}`);
    console.log(`   Errors: ${reportStatus.errors}`);
  } else {
    console.log('   Report file not available yet');
  }
  
  console.log('');
  console.log('Press Ctrl+C to stop | Refreshing in 3 seconds...');
}

// Main loop
console.log('Starting live monitor...\n');
setInterval(displayProgress, 3000);
displayProgress(); // Initial display

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitoring stopped. Download may still be running.');
  process.exit(0);
});

