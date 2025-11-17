export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'svg' | 'gif';
export type QualityMode = number | 'auto';

export interface OptimizationConfig {
  outputDir: string;
  formats?: ImageFormat[];
  sizes?: number[];
  quality?: QualityMode;
  cdnBaseUrl?: string;
  preserveOriginal?: boolean;
  parallel?: number;
  cacheEnabled?: boolean;
  // V2 features
  autoFormat?: boolean;
  generatePlaceholders?: boolean;
  placeholderType?: 'lqip' | 'blurhash' | 'both';
  updateCodebase?: boolean;
  codebaseRoot?: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  isAnimated?: boolean;
}

export interface OptimizedImage {
  path: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
  cdnUrl?: string;
  placeholder?: string;
  blurHash?: string;
}

export interface OptimizationResult {
  original: {
    path: string;
    size: number;
    format: string;
    width: number;
    height: number;
  };
  optimized: OptimizedImage[];
  responsive: OptimizedImage[];
  savings: {
    bytes: number;
    percentage: number;
  };
  processingTime: number;
}

export interface BatchResult {
  results: OptimizationResult[];
  totalSavings: {
    bytes: number;
    percentage: number;
  };
  totalProcessingTime: number;
  filesProcessed: number;
  errors: Array<{ file: string; error: string }>;
  codebaseUpdates?: number;
}

export interface CodebaseConversionResult {
  scannedFiles: number;
  imageReferences: number;
  uniqueImages: number;
  convertedImages: number;
  updatedFiles: number;
  errors: Array<{ file: string; error: string }>;
}
