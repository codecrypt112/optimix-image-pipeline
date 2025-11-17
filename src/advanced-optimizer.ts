import sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ImageMetadata, ImageFormat } from './types';

export interface AdvancedQualityMetrics {
  complexity: number;
  edgeDensity: number;
  colorVariance: number;
  noiseLevel: number;
  textLikelihood: number;
  photoLikelihood: number;
  recommendedQuality: number;
  recommendedFormats: ImageFormat[];
}

/**
 * Advanced optimization algorithms for v2
 */
export class AdvancedOptimizer {
  /**
   * Analyze image with enhanced algorithms
   */
  async analyzeAdvanced(imagePath: string, metadata: ImageMetadata): Promise<AdvancedQualityMetrics> {
    const buffer = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });

    const complexity = this.calculateComplexity(buffer.data, buffer.info);
    const edgeDensity = this.calculateEdgeDensity(buffer.data, buffer.info);
    const colorVariance = this.calculateColorVariance(buffer.data, buffer.info);
    const noiseLevel = this.calculateNoiseLevel(buffer.data, buffer.info);
    const textLikelihood = this.detectTextLikelihood(buffer.data, buffer.info, edgeDensity);
    const photoLikelihood = this.detectPhotoLikelihood(complexity, colorVariance, noiseLevel);

    const recommendedQuality = this.calculateOptimalQuality({
      complexity,
      edgeDensity,
      colorVariance,
      noiseLevel,
      textLikelihood,
      photoLikelihood,
      metadata,
    });

    const recommendedFormats = this.recommendFormats({
      textLikelihood,
      photoLikelihood,
      hasAlpha: metadata.hasAlpha,
      isAnimated: metadata.isAnimated,
    });

    return {
      complexity,
      edgeDensity,
      colorVariance,
      noiseLevel,
      textLikelihood,
      photoLikelihood,
      recommendedQuality,
      recommendedFormats,
    };
  }

  /**
   * Enhanced complexity calculation with frequency analysis
   */
  private calculateComplexity(data: Buffer, info: { width: number; height: number; channels: number }): number {
    const { width, height, channels } = info;
    const pixelCount = width * height;
    const sampleSize = Math.min(20000, pixelCount);
    const step = Math.floor(pixelCount / sampleSize);

    let totalVariation = 0;
    let highFreqCount = 0;

    for (let i = 0; i < sampleSize - 1; i++) {
      const idx1 = i * step * channels;
      const idx2 = (i + 1) * step * channels;

      let pixelDiff = 0;
      for (let c = 0; c < Math.min(3, channels); c++) {
        const diff = Math.abs(data[idx1 + c] - data[idx2 + c]);
        pixelDiff += diff;
        if (diff > 50) highFreqCount++;
      }
      totalVariation += pixelDiff;
    }

    const avgVariation = totalVariation / (sampleSize * 255 * 3);
    const highFreqRatio = highFreqCount / (sampleSize * 3);

    return Math.min((avgVariation + highFreqRatio) / 2, 1);
  }

  /**
   * Enhanced edge density with directional analysis
   */
  private calculateEdgeDensity(data: Buffer, info: { width: number; height: number; channels: number }): number {
    const { width, height, channels } = info;
    const threshold = 25;
    let edgePixels = 0;
    const sampleRows = Math.min(100, height - 1);
    const rowStep = Math.floor(height / sampleRows);

    for (let row = 0; row < sampleRows; row++) {
      const y = row * rowStep;
      for (let x = 0; x < width - 1; x++) {
        const idx1 = (y * width + x) * channels;
        const idx2 = (y * width + x + 1) * channels;

        let diff = 0;
        for (let c = 0; c < Math.min(3, channels); c++) {
          diff += Math.abs(data[idx1 + c] - data[idx2 + c]);
        }

        if (diff > threshold) {
          edgePixels++;
        }
      }
    }

    return Math.min(edgePixels / (sampleRows * width), 1);
  }

  /**
   * Color variance with histogram analysis
   */
  private calculateColorVariance(data: Buffer, info: { width: number; height: number; channels: number }): number {
    const { width, height, channels } = info;
    const pixelCount = width * height;
    const sampleSize = Math.min(10000, pixelCount);
    const step = Math.floor(pixelCount / sampleSize);

    const histogram = new Array(256).fill(0);

    for (let i = 0; i < sampleSize; i++) {
      const idx = i * step * channels;
      const gray = Math.floor(
        (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      );
      histogram[gray]++;
    }

    const mean = histogram.reduce((sum, count, value) => sum + count * value, 0) / sampleSize;
    const variance = histogram.reduce((sum, count, value) => {
      const diff = value - mean;
      return sum + count * diff * diff;
    }, 0) / sampleSize;

    return Math.min(Math.sqrt(variance) / 128, 1);
  }

  /**
   * Detect noise level in image
   */
  private calculateNoiseLevel(data: Buffer, info: { width: number; height: number; channels: number }): number {
    const { width, height, channels } = info;
    const sampleSize = Math.min(5000, width * height);
    const step = Math.floor((width * height) / sampleSize);

    let noiseSum = 0;

    for (let i = 1; i < sampleSize - 1; i++) {
      const idx = i * step * channels;
      const prevIdx = (i - 1) * step * channels;
      const nextIdx = (i + 1) * step * channels;

      for (let c = 0; c < Math.min(3, channels); c++) {
        const current = data[idx + c];
        const prev = data[prevIdx + c];
        const next = data[nextIdx + c];
        const expected = (prev + next) / 2;
        noiseSum += Math.abs(current - expected);
      }
    }

    return Math.min(noiseSum / (sampleSize * 255 * 3), 1);
  }

  /**
   * Detect likelihood of text/graphics in image
   */
  private detectTextLikelihood(
    data: Buffer,
    info: { width: number; height: number; channels: number },
    edgeDensity: number
  ): number {
    // Text typically has high edge density and low color variance
    const { width, height, channels } = info;
    const pixelCount = width * height;
    const sampleSize = Math.min(5000, pixelCount);
    const step = Math.floor(pixelCount / sampleSize);

    let highContrastRegions = 0;

    for (let i = 0; i < sampleSize; i++) {
      const idx = i * step * channels;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      // Text tends to be very dark or very light
      if (gray < 50 || gray > 205) {
        highContrastRegions++;
      }
    }

    const contrastRatio = highContrastRegions / sampleSize;
    return Math.min((edgeDensity * 0.6 + contrastRatio * 0.4), 1);
  }

  /**
   * Detect likelihood of photo content
   */
  private detectPhotoLikelihood(complexity: number, colorVariance: number, noiseLevel: number): number {
    // Photos typically have high complexity, high color variance, and some noise
    return Math.min((complexity * 0.5 + colorVariance * 0.3 + noiseLevel * 0.2), 1);
  }

  /**
   * Calculate optimal quality based on all metrics
   */
  private calculateOptimalQuality(params: {
    complexity: number;
    edgeDensity: number;
    colorVariance: number;
    noiseLevel: number;
    textLikelihood: number;
    photoLikelihood: number;
    metadata: ImageMetadata;
  }): number {
    let quality = 80;

    // Text/graphics need higher quality
    if (params.textLikelihood > 0.6) {
      quality = 92;
    } else if (params.textLikelihood > 0.4) {
      quality = 88;
    }

    // Photos can handle more compression
    if (params.photoLikelihood > 0.7) {
      quality = Math.min(quality, 78);
    }

    // High complexity allows more compression
    if (params.complexity > 0.7 && params.textLikelihood < 0.3) {
      quality -= 5;
    }

    // Sharp edges need quality preservation
    if (params.edgeDensity > 0.6) {
      quality += 8;
    }

    // Low color variance needs quality
    if (params.colorVariance < 0.2) {
      quality += 5;
    }

    // Noisy images can hide compression artifacts
    if (params.noiseLevel > 0.3) {
      quality -= 3;
    }

    // Alpha channel needs quality
    if (params.metadata.hasAlpha) {
      quality += 3;
    }

    // Small images need higher quality
    const pixels = params.metadata.width * params.metadata.height;
    if (pixels < 100000) {
      quality += 5;
    } else if (pixels > 2000000) {
      quality -= 3;
    }

    return Math.max(65, Math.min(95, Math.round(quality)));
  }

  /**
   * Recommend optimal formats based on image characteristics
   */
  private recommendFormats(params: {
    textLikelihood: number;
    photoLikelihood: number;
    hasAlpha: boolean;
    isAnimated?: boolean;
  }): ImageFormat[] {
    const formats: ImageFormat[] = [];

    if (params.isAnimated) {
      formats.push('webp', 'gif');
      return formats;
    }

    // Text/graphics: PNG or WebP
    if (params.textLikelihood > 0.6) {
      if (params.hasAlpha) {
        formats.push('webp', 'png');
      } else {
        formats.push('webp', 'png');
      }
    }
    // Photos: WebP, AVIF, JPEG
    else if (params.photoLikelihood > 0.6) {
      formats.push('avif', 'webp', 'jpeg');
    }
    // Mixed content: WebP is versatile
    else {
      formats.push('webp');
      if (params.hasAlpha) {
        formats.push('png');
      } else {
        formats.push('jpeg');
      }
    }

    return formats;
  }

  /**
   * Generate low-quality image placeholder (LQIP)
   */
  async generatePlaceholder(imagePath: string, width: number = 20): Promise<string> {
    const buffer = await sharp(imagePath)
      .resize(width, null, { fit: 'inside' })
      .jpeg({ quality: 40 })
      .toBuffer();

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  }

  /**
   * Generate BlurHash placeholder
   */
  async generateBlurHash(imagePath: string): Promise<{ width: number; height: number; hash: string }> {
    // Simplified blur hash - in production, use blurhash library
    const metadata = await sharp(imagePath).metadata();
    const buffer = await sharp(imagePath)
      .resize(32, 32, { fit: 'fill' })
      .raw()
      .toBuffer();

    // Simple hash representation (use actual blurhash library in production)
    const hash = buffer.toString('base64').substring(0, 32);

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      hash,
    };
  }
}
