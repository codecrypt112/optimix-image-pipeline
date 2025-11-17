#!/usr/bin/env node

/**
 * Quick start example - Run this after installing the package
 * 
 * Usage:
 *   node examples/quick-start.js
 */

const { ImageOptimizer } = require('@optimix/image-pipeline');
const fs = require('fs');
const path = require('path');

async function quickStart() {
  console.log('🚀 Optimix Image Pipeline - Quick Start\n');

  // Create test directory if it doesn't exist
  const testDir = './test-images';
  const outputDir = './optimized-output';

  if (!fs.existsSync(testDir)) {
    console.log('📁 Creating test-images directory...');
    console.log('   Please add some images to ./test-images/ and run this script again.\n');
    fs.mkdirSync(testDir, { recursive: true });
    return;
  }

  // Check if there are any images
  const files = fs.readdirSync(testDir);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('⚠️  No images found in ./test-images/');
    console.log('   Please add some images and run this script again.\n');
    return;
  }

  console.log(`📸 Found ${imageFiles.length} image(s) to optimize\n`);

  // Example 1: Basic optimization
  console.log('Example 1: Basic WebP conversion');
  console.log('─'.repeat(50));
  const basicOptimizer = new ImageOptimizer({
    outputDir: path.join(outputDir, 'basic'),
    formats: ['webp'],
    quality: 'auto',
  });

  const basicResult = await basicOptimizer.optimizeSingle(path.join(testDir, imageFiles[0]));
  console.log(`✓ Original: ${formatBytes(basicResult.original.size)}`);
  console.log(`✓ Optimized: ${formatBytes(basicResult.optimized[0].size)}`);
  console.log(`✓ Saved: ${formatBytes(basicResult.savings.bytes)} (${basicResult.savings.percentage.toFixed(1)}%)\n`);

  // Example 2: Multiple formats
  console.log('Example 2: Multiple formats (WebP + AVIF)');
  console.log('─'.repeat(50));
  const multiFormatOptimizer = new ImageOptimizer({
    outputDir: path.join(outputDir, 'multi-format'),
    formats: ['webp', 'avif'],
    quality: 'auto',
  });

  const multiResult = await multiFormatOptimizer.optimizeSingle(path.join(testDir, imageFiles[0]));
  console.log(`✓ Generated ${multiResult.optimized.length} formats:`);
  multiResult.optimized.forEach(img => {
    console.log(`  - ${img.format.toUpperCase()}: ${formatBytes(img.size)}`);
  });
  console.log();

  // Example 3: Responsive sizes
  console.log('Example 3: Responsive sizes');
  console.log('─'.repeat(50));
  const responsiveOptimizer = new ImageOptimizer({
    outputDir: path.join(outputDir, 'responsive'),
    formats: ['webp'],
    sizes: [400, 800, 1200],
    quality: 'auto',
  });

  const responsiveResult = await responsiveOptimizer.optimizeSingle(path.join(testDir, imageFiles[0]));
  console.log(`✓ Generated ${responsiveResult.responsive.length} responsive versions:`);
  responsiveResult.responsive.forEach(img => {
    console.log(`  - ${img.width}w: ${formatBytes(img.size)}`);
  });
  console.log();

  // Example 4: Batch processing
  if (imageFiles.length > 1) {
    console.log('Example 4: Batch processing');
    console.log('─'.repeat(50));
    const batchOptimizer = new ImageOptimizer({
      outputDir: path.join(outputDir, 'batch'),
      formats: ['webp'],
      quality: 'auto',
      parallel: 4,
    });

    const batchResult = await batchOptimizer.optimizeDirectory(testDir);
    console.log(`✓ Processed: ${batchResult.filesProcessed} files`);
    console.log(`✓ Total savings: ${formatBytes(batchResult.totalSavings.bytes)} (${batchResult.totalSavings.percentage.toFixed(1)}%)`);
    console.log(`✓ Processing time: ${(batchResult.totalProcessingTime / 1000).toFixed(2)}s\n`);
  }

  console.log('🎉 All examples completed!');
  console.log(`📂 Check the output in: ${outputDir}\n`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

quickStart().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
