const { ImageOptimizer } = require('@optimix/image-pipeline');

async function demonstrateV2Features() {
  console.log('=== Optimix v2.0 Features Demo ===\n');

  // 1. Auto-format selection
  console.log('1. Auto-format selection based on image content:');
  const autoFormatOptimizer = new ImageOptimizer({
    outputDir: './output/auto-format',
    quality: 'auto',
    autoFormat: true, // V2: Automatically choose best formats
  });

  const result1 = await autoFormatOptimizer.optimizeSingle('./images/photo.jpg');
  console.log(`   Recommended formats: ${result1.optimized.map(img => img.format).join(', ')}`);

  // 2. Placeholder generation
  console.log('\n2. Generate image placeholders (LQIP & BlurHash):');
  const placeholderOptimizer = new ImageOptimizer({
    outputDir: './output/placeholders',
    formats: ['webp'],
    quality: 85,
    generatePlaceholders: true, // V2: Generate placeholders
    placeholderType: 'both', // V2: Both LQIP and BlurHash
  });

  const result2 = await placeholderOptimizer.optimizeSingle('./images/hero.jpg');
  console.log(`   LQIP: ${result2.optimized[0].placeholder?.substring(0, 50)}...`);
  console.log(`   BlurHash: ${result2.optimized[0].blurHash}`);

  // 3. Advanced quality analysis
  console.log('\n3. Advanced quality analysis:');
  const { AdvancedOptimizer } = require('@optimix/image-pipeline');
  const advancedOptimizer = new AdvancedOptimizer();
  
  const sharp = require('sharp');
  const metadata = await sharp('./images/screenshot.png').metadata();
  const analysis = await advancedOptimizer.analyzeAdvanced('./images/screenshot.png', {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: 0,
    hasAlpha: metadata.hasAlpha,
  });

  console.log(`   Text likelihood: ${(analysis.textLikelihood * 100).toFixed(1)}%`);
  console.log(`   Photo likelihood: ${(analysis.photoLikelihood * 100).toFixed(1)}%`);
  console.log(`   Recommended quality: ${analysis.recommendedQuality}`);
  console.log(`   Recommended formats: ${analysis.recommendedFormats.join(', ')}`);

  // 4. Codebase conversion (automatic image replacement)
  console.log('\n4. Automatic codebase image conversion:');
  const codebaseOptimizer = new ImageOptimizer({
    outputDir: './public/optimized',
    formats: ['webp', 'avif'],
    quality: 'auto',
    autoFormat: true,
    updateCodebase: true, // V2: Update image references in code
    codebaseRoot: './src', // V2: Root directory to scan
  });

  const conversionResult = await codebaseOptimizer.convertCodebaseImages();
  console.log(`   Scanned files: ${conversionResult.scannedFiles}`);
  console.log(`   Image references found: ${conversionResult.imageReferences}`);
  console.log(`   Unique images: ${conversionResult.uniqueImages}`);
  console.log(`   Converted images: ${conversionResult.convertedImages}`);
  console.log(`   Updated code files: ${conversionResult.updatedFiles}`);

  // 5. Combined v2 features
  console.log('\n5. All v2 features combined:');
  const fullOptimizer = new ImageOptimizer({
    outputDir: './output/full',
    quality: 'auto',
    autoFormat: true,
    generatePlaceholders: true,
    placeholderType: 'lqip',
    sizes: [320, 640, 1024, 1920],
    parallel: 4,
    cacheEnabled: true,
  });

  const result5 = await fullOptimizer.optimizeBatch([
    './images/photo1.jpg',
    './images/photo2.jpg',
    './images/logo.png',
  ]);

  console.log(`   Processed: ${result5.filesProcessed} files`);
  console.log(`   Total savings: ${(result5.totalSavings.bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Percentage saved: ${result5.totalSavings.percentage.toFixed(2)}%`);
  console.log(`   Processing time: ${result5.totalProcessingTime}ms`);
}

// Run demo
demonstrateV2Features().catch(console.error);
