import sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { QualityAnalyzer } from './quality-analyzer';
import { SVGOptimizer } from './svg-optimizer';
import { AdvancedOptimizer } from './advanced-optimizer';
import { CodebaseScanner } from './codebase-scanner';
import {
  OptimizationConfig,
  OptimizationResult,
  BatchResult,
  ImageMetadata,
  OptimizedImage,
  ImageFormat,
  CodebaseConversionResult,
} from './types';

export class ImageOptimizer {
  private config: Required<OptimizationConfig>;
  private qualityAnalyzer: QualityAnalyzer;
  private svgOptimizer: SVGOptimizer;
  private advancedOptimizer: AdvancedOptimizer;
  private cache: Map<string, OptimizationResult>;

  constructor(config: OptimizationConfig) {
    this.config = {
      outputDir: config.outputDir,
      formats: config.formats || ['webp'],
      sizes: config.sizes || [],
      quality: config.quality ?? 'auto',
      cdnBaseUrl: config.cdnBaseUrl || '',
      preserveOriginal: config.preserveOriginal ?? false,
      parallel: config.parallel || 4,
      cacheEnabled: config.cacheEnabled ?? true,
      autoFormat: config.autoFormat ?? false,
      generatePlaceholders: config.generatePlaceholders ?? false,
      placeholderType: config.placeholderType || 'lqip',
      updateCodebase: config.updateCodebase ?? false,
      codebaseRoot: config.codebaseRoot || process.cwd(),
    };

    this.qualityAnalyzer = new QualityAnalyzer();
    this.svgOptimizer = new SVGOptimizer();
    this.advancedOptimizer = new AdvancedOptimizer();
    this.cache = new Map();
  }

  /**
   * Optimize a single image
   */
  async optimizeSingle(inputPath: string): Promise<OptimizationResult> {
    const startTime = Date.now();
    const absolutePath = path.resolve(inputPath);

    // Check cache
    if (this.config.cacheEnabled && this.cache.has(absolutePath)) {
      return this.cache.get(absolutePath)!;
    }

    const stats = await fs.stat(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();

    // Handle SVG separately
    if (ext === '.svg') {
      return this.optimizeSVG(absolutePath, stats.size, startTime);
    }

    // Get image metadata
    const metadata = await this.getImageMetadata(absolutePath, stats.size);

    // V2: Use advanced optimizer for better quality analysis
    let quality: number;
    let formats = this.config.formats;

    if (this.config.quality === 'auto') {
      const analysis = await this.advancedOptimizer.analyzeAdvanced(absolutePath, metadata);
      quality = analysis.recommendedQuality;

      // V2: Auto-format selection
      if (this.config.autoFormat) {
        formats = analysis.recommendedFormats;
      }
    } else {
      quality = this.config.quality;
    }

    const optimized: OptimizedImage[] = [];
    const responsive: OptimizedImage[] = [];

    // Generate optimized versions in different formats
    for (const format of formats) {
      if (format === 'svg') continue;

      const outputPath = this.generateOutputPath(absolutePath, format);
      const result = await this.convertAndOptimize(absolutePath, outputPath, format, quality, metadata.width);

      // V2: Generate placeholders
      if (this.config.generatePlaceholders) {
        if (this.config.placeholderType === 'lqip' || this.config.placeholderType === 'both') {
          result.placeholder = await this.advancedOptimizer.generatePlaceholder(absolutePath);
        }
        if (this.config.placeholderType === 'blurhash' || this.config.placeholderType === 'both') {
          const blurHash = await this.advancedOptimizer.generateBlurHash(absolutePath);
          result.blurHash = blurHash.hash;
        }
      }

      optimized.push(result);
    }

    // Generate responsive sizes
    if (this.config.sizes.length > 0) {
      for (const size of this.config.sizes) {
        if (size >= metadata.width) continue;

        for (const format of this.config.formats) {
          if (format === 'svg') continue;

          const outputPath = this.generateOutputPath(absolutePath, format, size);
          const result = await this.convertAndOptimize(absolutePath, outputPath, format, quality, size);

          responsive.push(result);
        }
      }
    }

    // Calculate savings
    const totalOptimizedSize = optimized.reduce((sum, img) => sum + img.size, 0);
    const avgOptimizedSize = totalOptimizedSize / optimized.length;
    const savings = {
      bytes: metadata.size - avgOptimizedSize,
      percentage: ((metadata.size - avgOptimizedSize) / metadata.size) * 100,
    };

    const result: OptimizationResult = {
      original: {
        path: absolutePath,
        size: metadata.size,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
      },
      optimized,
      responsive,
      savings,
      processingTime: Date.now() - startTime,
    };

    if (this.config.cacheEnabled) {
      this.cache.set(absolutePath, result);
    }

    return result;
  }

  /**
   * Optimize SVG file
   */
  private async optimizeSVG(inputPath: string, originalSize: number, startTime: number): Promise<OptimizationResult> {
    const outputPath = path.join(this.config.outputDir, path.basename(inputPath));
    const { optimizedSize } = await this.svgOptimizer.optimizeWithCustomAlgorithms(inputPath, outputPath);

    const optimized: OptimizedImage = {
      path: outputPath,
      size: optimizedSize,
      format: 'svg',
      cdnUrl: this.config.cdnBaseUrl ? `${this.config.cdnBaseUrl}/${path.basename(outputPath)}` : undefined,
    };

    return {
      original: {
        path: inputPath,
        size: originalSize,
        format: 'svg',
        width: 0,
        height: 0,
      },
      optimized: [optimized],
      responsive: [],
      savings: {
        bytes: originalSize - optimizedSize,
        percentage: ((originalSize - optimizedSize) / originalSize) * 100,
      },
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Convert and optimize image
   */
  private async convertAndOptimize(
    inputPath: string,
    outputPath: string,
    format: ImageFormat,
    quality: number,
    width?: number
  ): Promise<OptimizedImage> {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    let pipeline = sharp(inputPath);

    // Resize if width specified
    if (width) {
      pipeline = pipeline.resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({
          quality,
          effort: 6,
          smartSubsample: true,
        });
        break;
      case 'avif':
        pipeline = pipeline.avif({
          quality,
          effort: 6,
          chromaSubsampling: '4:2:0',
        });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality,
          progressive: true,
          mozjpeg: true,
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9,
          adaptiveFiltering: true,
        });
        break;
    }

    const info = await pipeline.toFile(outputPath);
    const stats = await fs.stat(outputPath);

    return {
      path: outputPath,
      size: stats.size,
      format,
      width: info.width,
      height: info.height,
      cdnUrl: this.config.cdnBaseUrl
        ? `${this.config.cdnBaseUrl}/${path.relative(this.config.outputDir, outputPath)}`
        : undefined,
    };
  }

  /**
   * Get image metadata
   */
  private async getImageMetadata(imagePath: string, fileSize: number): Promise<ImageMetadata> {
    const metadata = await sharp(imagePath).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: fileSize,
      hasAlpha: metadata.hasAlpha || false,
      isAnimated: metadata.pages ? metadata.pages > 1 : false,
    };
  }

  /**
   * Generate output path
   */
  private generateOutputPath(inputPath: string, format: ImageFormat, width?: number): string {
    const basename = path.basename(inputPath, path.extname(inputPath));
    const suffix = width ? `-${width}w` : '';
    const filename = `${basename}${suffix}.${format}`;

    return path.join(this.config.outputDir, filename);
  }

  /**
   * Optimize directory
   */
  async optimizeDirectory(inputDir: string): Promise<BatchResult> {
    const pattern = path.join(inputDir, '**/*.{jpg,jpeg,png,webp,gif,svg}');
    const files = await glob(pattern, { nodir: true });

    return this.optimizeBatch(files);
  }

  /**
   * Optimize batch of files
   */
  async optimizeBatch(files: string[]): Promise<BatchResult> {
    const startTime = Date.now();
    const results: OptimizationResult[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    // Process in parallel batches
    for (let i = 0; i < files.length; i += this.config.parallel) {
      const batch = files.slice(i, i + this.config.parallel);
      const batchResults = await Promise.allSettled(batch.map((file) => this.optimizeSingle(file)));

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            file: batch[index],
            error: result.reason.message,
          });
        }
      });
    }

    // Calculate total savings
    const totalOriginalSize = results.reduce((sum, r) => sum + r.original.size, 0);
    const totalOptimizedSize = results.reduce((sum, r) => {
      const avgSize = r.optimized.reduce((s, img) => s + img.size, 0) / r.optimized.length;
      return sum + avgSize;
    }, 0);

    return {
      results,
      totalSavings: {
        bytes: totalOriginalSize - totalOptimizedSize,
        percentage: totalOriginalSize > 0 ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100 : 0,
      },
      totalProcessingTime: Date.now() - startTime,
      filesProcessed: results.length,
      errors,
    };
  }

  /**
   * V2: Scan and convert images in codebase automatically
   */
  async convertCodebaseImages(): Promise<CodebaseConversionResult> {
    if (!this.config.updateCodebase) {
      throw new Error('updateCodebase must be enabled in config');
    }

    const scanner = new CodebaseScanner({
      rootDir: this.config.codebaseRoot,
    });

    // Scan for image references
    const scanResult = await scanner.scan();
    const errors: Array<{ file: string; error: string }> = [];
    const convertedImages = new Set<string>();
    const updatedFiles = new Set<string>();

    // Process each unique image
    for (const imagePath of scanResult.uniqueImages) {
      try {
        // Find references to this image
        const refs = scanResult.references.filter((ref) => ref.imagePath === imagePath);
        if (refs.length === 0) continue;

        // Resolve absolute path
        const absolutePath = scanner.resolveImagePath(refs[0]);

        // Check if image exists
        try {
          await fs.access(absolutePath);
        } catch {
          continue; // Skip if image doesn't exist
        }

        // Optimize the image
        const result = await this.optimizeSingle(absolutePath);

        // Use the first optimized version
        if (result.optimized.length > 0) {
          const optimizedImage = result.optimized[0];
          const relativePath = path.relative(this.config.codebaseRoot, optimizedImage.path);

          // Update all references
          for (const ref of refs) {
            try {
              const codeFileDir = path.dirname(ref.filePath);
              const newRelativePath = path.relative(codeFileDir, optimizedImage.path);
              await scanner.replaceImageReference(ref, newRelativePath);
              updatedFiles.add(ref.filePath);
            } catch (error: any) {
              errors.push({
                file: ref.filePath,
                error: error.message,
              });
            }
          }

          convertedImages.add(imagePath);
        }
      } catch (error: any) {
        errors.push({
          file: imagePath,
          error: error.message,
        });
      }
    }

    return {
      scannedFiles: scanResult.references.length,
      imageReferences: scanResult.references.length,
      uniqueImages: scanResult.uniqueImages.size,
      convertedImages: convertedImages.size,
      updatedFiles: updatedFiles.size,
      errors,
    };
  }
}
