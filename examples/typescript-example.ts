import { ImageOptimizer } from '../src/image-optimizer';
import type { OptimizationConfig, BatchResult, OptimizationResult, OptimizedImage } from '../src/types';

/**
 * TypeScript example with full type safety
 */
class ImageProcessingService {
  private optimizer: ImageOptimizer;

  constructor(config: OptimizationConfig) {
    this.optimizer = new ImageOptimizer(config);
  }

  /**
   * Process user uploaded images
   */
  async processUpload(filePath: string): Promise<{
    urls: string[];
    savings: number;
  }> {
    const result = await this.optimizer.optimizeSingle(filePath);

    const urls = result.optimized
      .filter((img: OptimizedImage) => img.cdnUrl)
      .map((img: OptimizedImage) => img.cdnUrl!);

    return {
      urls,
      savings: result.savings.percentage,
    };
  }

  /**
   * Generate responsive image set
   */
  async generateResponsiveSet(filePath: string): Promise<{
    srcset: string;
    sizes: string;
  }> {
    const result = await this.optimizer.optimizeSingle(filePath);

    const srcset = result.responsive
      .filter((img: OptimizedImage) => img.format === 'webp')
      .map((img: OptimizedImage) => `${img.cdnUrl || img.path} ${img.width || 0}w`)
      .join(', ');

    const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

    return { srcset, sizes };
  }

  /**
   * Batch process with progress tracking
   */
  async batchProcessWithProgress(
    files: string[],
    onProgress: (processed: number, total: number) => void
  ): Promise<BatchResult> {
    const results: BatchResult = {
      results: [],
      totalSavings: { bytes: 0, percentage: 0 },
      totalProcessingTime: 0,
      filesProcessed: 0,
      errors: [],
    };

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.optimizer.optimizeSingle(files[i]);
        results.results.push(result);
        results.filesProcessed++;
        onProgress(i + 1, files.length);
      } catch (error) {
        results.errors.push({
          file: files[i],
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate totals
    const totalOriginal = results.results.reduce(
      (sum: number, r: OptimizationResult) => sum + r.original.size,
      0
    );
    const totalOptimized = results.results.reduce(
      (sum: number, r: OptimizationResult) => {
        const avg = r.optimized.reduce(
          (s: number, img: OptimizedImage) => s + img.size,
          0
        ) / r.optimized.length;
        return sum + avg;
      },
      0
    );

    results.totalSavings = {
      bytes: totalOriginal - totalOptimized,
      percentage: ((totalOriginal - totalOptimized) / totalOriginal) * 100,
    };

    return results;
  }
}

// Usage example
async function main() {
  const config: OptimizationConfig = {
    outputDir: './dist/images',
    formats: ['webp', 'avif'],
    sizes: [400, 800, 1200],
    quality: 'auto',
    cdnBaseUrl: 'https://cdn.myapp.com',
    parallel: 4,
  };

  const service = new ImageProcessingService(config);

  // Process single upload
  const uploadResult = await service.processUpload('./uploads/photo.jpg');
  console.log('CDN URLs:', uploadResult.urls);
  console.log('Savings:', uploadResult.savings.toFixed(2) + '%');

  // Generate responsive set
  const responsive = await service.generateResponsiveSet('./images/hero.jpg');
  console.log('Srcset:', responsive.srcset);

  // Batch process with progress
  const files = ['./images/1.jpg', './images/2.png', './images/3.jpg'];
  const batchResult = await service.batchProcessWithProgress(files, (processed, total) => {
    console.log(`Progress: ${processed}/${total}`);
  });

  console.log(`Processed ${batchResult.filesProcessed} files`);
  console.log(`Total savings: ${(batchResult.totalSavings.bytes / 1024).toFixed(2)} KB`);
}

main().catch(console.error);
