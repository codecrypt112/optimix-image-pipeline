const { ImageOptimizer } = require('@optimix/image-pipeline');
const path = require('path');

async function main() {
  // Basic usage
  const optimizer = new ImageOptimizer({
    outputDir: './output',
    formats: ['webp', 'avif'],
    quality: 'auto',
  });

  // Optimize single image
  console.log('Optimizing single image...');
  const result = await optimizer.optimizeSingle('./images/photo.jpg');
  console.log(`Saved ${result.savings.bytes} bytes (${result.savings.percentage.toFixed(2)}%)`);

  // Optimize with responsive sizes
  const responsiveOptimizer = new ImageOptimizer({
    outputDir: './output/responsive',
    formats: ['webp'],
    sizes: [320, 640, 1024, 1920],
    quality: 85,
  });

  console.log('\nOptimizing with responsive sizes...');
  const responsiveResult = await responsiveOptimizer.optimizeSingle('./images/hero.jpg');
  console.log(`Generated ${responsiveResult.responsive.length} responsive versions`);

  // Batch optimization
  const batchOptimizer = new ImageOptimizer({
    outputDir: './output/batch',
    formats: ['webp', 'avif'],
    quality: 'auto',
    parallel: 4,
  });

  console.log('\nBatch optimizing directory...');
  const batchResult = await batchOptimizer.optimizeDirectory('./images');
  console.log(`Processed ${batchResult.filesProcessed} files`);
  console.log(`Total savings: ${batchResult.totalSavings.bytes} bytes`);

  // CDN integration
  const cdnOptimizer = new ImageOptimizer({
    outputDir: './output/cdn',
    formats: ['webp'],
    cdnBaseUrl: 'https://cdn.example.com/images',
    quality: 80,
  });

  console.log('\nOptimizing with CDN URLs...');
  const cdnResult = await cdnOptimizer.optimizeSingle('./images/logo.png');
  console.log('CDN URLs:');
  cdnResult.optimized.forEach((img) => {
    console.log(`  ${img.cdnUrl}`);
  });
}

main().catch(console.error);
