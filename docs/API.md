# API Documentation

## Table of Contents
- [ImageOptimizer](#imageoptimizer)
- [QualityAnalyzer](#qualityanalyzer)
- [SVGOptimizer](#svgoptimizer)
- [Types](#types)

---

## ImageOptimizer

Main class for image optimization operations.

### Constructor

```typescript
new ImageOptimizer(config: OptimizationConfig)
```

#### Parameters

- `config.outputDir` (string, required): Output directory for optimized images
- `config.formats` (ImageFormat[], optional): Output formats. Default: `['webp']`
- `config.sizes` (number[], optional): Responsive sizes to generate. Default: `[]`
- `config.quality` (number | 'auto', optional): Quality setting (1-100) or 'auto'. Default: `'auto'`
- `config.cdnBaseUrl` (string, optional): CDN base URL for generating URLs. Default: `''`
- `config.preserveOriginal` (boolean, optional): Keep original files. Default: `false`
- `config.parallel` (number, optional): Parallel processing limit. Default: `4`
- `config.cacheEnabled` (boolean, optional): Enable result caching. Default: `true`

### Methods

#### optimizeSingle()

Optimize a single image file.

```typescript
async optimizeSingle(inputPath: string): Promise<OptimizationResult>
```

**Parameters:**
- `inputPath`: Path to the image file

**Returns:** Promise resolving to OptimizationResult

**Example:**
```javascript
const result = await optimizer.optimizeSingle('./photo.jpg');
console.log(`Saved ${result.savings.percentage}%`);
```

#### optimizeDirectory()

Optimize all images in a directory.

```typescript
async optimizeDirectory(inputDir: string): Promise<BatchResult>
```

**Parameters:**
- `inputDir`: Path to directory containing images

**Returns:** Promise resolving to BatchResult

**Example:**
```javascript
const result = await optimizer.optimizeDirectory('./images');
console.log(`Processed ${result.filesProcessed} files`);
```

#### optimizeBatch()

Optimize a specific list of files.

```typescript
async optimizeBatch(files: string[]): Promise<BatchResult>
```

**Parameters:**
- `files`: Array of file paths

**Returns:** Promise resolving to BatchResult

**Example:**
```javascript
const files = ['./img1.jpg', './img2.png'];
const result = await optimizer.optimizeBatch(files);
```

---

## QualityAnalyzer

Intelligent quality analysis for optimal compression.

### Constructor

```typescript
new QualityAnalyzer()
```

### Methods

#### analyzeOptimalQuality()

Analyze image and determine optimal quality setting.

```typescript
async analyzeOptimalQuality(
  imagePath: string, 
  metadata: ImageMetadata
): Promise<number>
```

**Parameters:**
- `imagePath`: Path to the image
- `metadata`: Image metadata object

**Returns:** Promise resolving to quality value (1-100)

**Algorithm:**
- Calculates image complexity using entropy
- Detects edge density for sharpness requirements
- Analyzes color variance
- Adjusts for alpha channels and image size
- Returns optimized quality value

---

## SVGOptimizer

Advanced SVG optimization with custom algorithms.

### Constructor

```typescript
new SVGOptimizer()
```

### Methods

#### optimize()

Basic SVG optimization using SVGO.

```typescript
async optimize(
  inputPath: string, 
  outputPath: string
): Promise<{ originalSize: number; optimizedSize: number }>
```

#### optimizeWithCustomAlgorithms()

Advanced optimization with custom algorithms.

```typescript
async optimizeWithCustomAlgorithms(
  inputPath: string, 
  outputPath: string
): Promise<{ originalSize: number; optimizedSize: number }>
```

**Custom Optimizations:**
- Path data rounding (reduces precision)
- Transform optimization
- Color minification (RGB to hex, hex shortening)

---

## Types

### OptimizationConfig

```typescript
interface OptimizationConfig {
  outputDir: string;
  formats?: ImageFormat[];
  sizes?: number[];
  quality?: number | 'auto';
  cdnBaseUrl?: string;
  preserveOriginal?: boolean;
  parallel?: number;
  cacheEnabled?: boolean;
}
```

### ImageFormat

```typescript
type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'svg' | 'gif';
```

### OptimizationResult

```typescript
interface OptimizationResult {
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
```

### OptimizedImage

```typescript
interface OptimizedImage {
  path: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
  cdnUrl?: string;
}
```

### BatchResult

```typescript
interface BatchResult {
  results: OptimizationResult[];
  totalSavings: {
    bytes: number;
    percentage: number;
  };
  totalProcessingTime: number;
  filesProcessed: number;
  errors: Array<{ file: string; error: string }>;
}
```

### ImageMetadata

```typescript
interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  isAnimated?: boolean;
}
```

---

## CLI Commands

### optimize

Optimize images from command line.

```bash
optimix optimize <input> [options]
```

**Arguments:**
- `<input>`: Input directory or file path

**Options:**
- `-o, --output <dir>`: Output directory (default: "./optimized")
- `-f, --formats <formats>`: Comma-separated formats (default: "webp")
- `-s, --sizes <sizes>`: Comma-separated responsive sizes
- `-q, --quality <quality>`: Quality 1-100 or "auto" (default: "auto")
- `-c, --cdn <url>`: CDN base URL
- `-p, --parallel <number>`: Parallel limit (default: "4")

**Examples:**

```bash
# Basic optimization
optimix optimize ./images

# Multiple formats
optimix optimize ./images -f webp,avif

# Responsive sizes
optimix optimize ./images -s 400,800,1200

# With CDN
optimix optimize ./images -c https://cdn.example.com

# All options
optimix optimize ./src/assets \
  -o ./dist/assets \
  -f webp,avif \
  -s 320,640,1024,1920 \
  -q auto \
  -c https://cdn.example.com \
  -p 8
```

---

## Error Handling

All async methods can throw errors. Always use try-catch:

```javascript
try {
  const result = await optimizer.optimizeSingle('./image.jpg');
} catch (error) {
  console.error('Optimization failed:', error.message);
}
```

For batch operations, errors are collected in the result:

```javascript
const result = await optimizer.optimizeDirectory('./images');
if (result.errors.length > 0) {
  result.errors.forEach(err => {
    console.error(`${err.file}: ${err.error}`);
  });
}
```

---

## Performance Tips

1. **Use parallel processing**: Adjust `parallel` option based on CPU cores
2. **Enable caching**: Keep `cacheEnabled: true` for repeated operations
3. **Choose formats wisely**: WebP for compatibility, AVIF for size
4. **Limit responsive sizes**: Only generate sizes you actually use
5. **Use 'auto' quality**: Let the analyzer determine optimal settings
