import sharp from 'sharp';
import { ImageMetadata } from './types';

/**
 * Intelligent quality analyzer that determines optimal compression quality
 * based on image characteristics
 */
export class QualityAnalyzer {
  /**
   * Analyze image and determine optimal quality setting
   */
  async analyzeOptimalQuality(imagePath: string, metadata: ImageMetadata): Promise<number> {
    const buffer = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
    
    // Calculate image complexity metrics
    const complexity = this.calculateComplexity(buffer.data, buffer.info);
    const edgeDensity = this.calculateEdgeDensity(buffer.data, buffer.info);
    const colorVariance = this.calculateColorVariance(buffer.data, buffer.info);
    
    // Base quality on image characteristics
    let quality = 80;
    
    // High complexity images (photos) can handle more compression
    if (complexity > 0.7) {
      quality = 75;
    }
    
    // Low complexity images (graphics, screenshots) need higher quality
    if (complexity < 0.3) {
      quality = 90;
    }
    
    // Images with sharp edges (text, logos) need higher quality
    if (edgeDensity > 0.6) {
      quality = Math.min(quality + 10, 95);
    }
    
    // Low color variance (gradients, simple graphics) benefit from higher quality
    if (colorVariance < 0.2) {
      quality = Math.min(quality + 5, 92);
    }
    
    // Alpha channel images need slightly higher quality
    if (metadata.hasAlpha) {
      quality = Math.min(quality + 3, 95);
    }
    
    // Smaller images should maintain higher quality
    const pixels = metadata.width * metadata.height;
    if (pixels < 100000) { // Less than ~316x316
      quality = Math.min(quality + 5, 95);
    }
    
    return Math.round(quality);
  }
  
  /**
   * Calculate image complexity using entropy-like measure
   */
  private calculateComplexity(data: Buffer, info: { width: number; height: number; channels: number }): number {
    const { width, height, channels } = info;
    const pixelCount = width * height;
    const sampleSize = Math.min(10000, pixelCount);
    const step = Math.floor(pixelCount / sampleSize);
    
    let totalVariation = 0;
    
    for (let i = 0; i < sampleSize - 1; i++) {
      const idx1 = i * step * channels;
      const idx2 = (i + 1) * step * channels;
      
      let pixelDiff = 0;
      for (let c = 0; c < Math.min(3, channels); c++) {
        pixelDiff += Math.abs(data[idx1 + c] - data[idx2 + c]);
      }
      totalVariation += pixelDiff;
    }
    
    const avgVariation = totalVariation / (sampleSize * 255 * 3);
    return Math.min(avgVariation, 1);
  }
  
  /**
   * Calculate edge density using simple gradient detection
   */
  private calculateEdgeDensity(data: Buffer, info: { width: number; height: number; channels: number }): number {
    const { width, height, channels } = info;
    const threshold = 30;
    let edgePixels = 0;
    const sampleRows = Math.min(50, height - 1);
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
    
    return edgePixels / (sampleRows * width);
  }
  
  /**
   * Calculate color variance across the image
   */
  private calculateColorVariance(data: Buffer, info: { width: number; height: number; channels: number }): number {
    const { width, height, channels } = info;
    const pixelCount = width * height;
    const sampleSize = Math.min(5000, pixelCount);
    const step = Math.floor(pixelCount / sampleSize);
    
    const means = [0, 0, 0];
    
    // Calculate means
    for (let i = 0; i < sampleSize; i++) {
      const idx = i * step * channels;
      for (let c = 0; c < Math.min(3, channels); c++) {
        means[c] += data[idx + c];
      }
    }
    
    means.forEach((_, i) => means[i] /= sampleSize);
    
    // Calculate variance
    let variance = 0;
    for (let i = 0; i < sampleSize; i++) {
      const idx = i * step * channels;
      for (let c = 0; c < Math.min(3, channels); c++) {
        const diff = data[idx + c] - means[c];
        variance += diff * diff;
      }
    }
    
    variance = variance / (sampleSize * 3);
    const stdDev = Math.sqrt(variance);
    
    return Math.min(stdDev / 255, 1);
  }
}
