# Advanced Usage Guide

## Custom Quality Algorithm

The quality analyzer uses multiple metrics to determine optimal compression:

### Image Complexity
Measures variation between adjacent pixels using entropy-like calculations. High complexity images (photos) can handle more compression, while low complexity images (graphics) need higher quality.

### Edge Density
Detects sharp transitions in the image. Images with high edge density (text, logos) require higher quality to maintain sharpness.

### Color Variance
Analyzes color distribution across the image. Low variance (gradients, simple graphics) benefits from higher quality settings.

### Adaptive Quality Formula
```
Base Quality: 80
+ High Complexity (>0.7): -5
+ Low Complexity (<0.3): +10
+ High Edge Density (>0.6): +10
+ Low Color Variance (<0.2): +5
+ Has Alpha Channel: +3
+ Small Image (<100k pixels): +5
```

## Integration Examples

### Next.js Build Script

```javascript
// scripts/optimize-images.js
const { ImageOptimizer } = require('@optimix/image-pipeline');

async function optimizeForProduction() {
  const optimizer = new ImageOptimizer({
    outputDir: './public/optimized',
    formats: ['webp', 'avif'],
    sizes: [320, 640, 1024, 1920],
    quality: 'auto',
    cdnBaseUrl: process.env.CDN_URL,
    parallel: 8,
  });

  const result = await optimizer.optimizeDirectory('./public/images');
  
  console.log(`Optimized ${result.filesProcessed} images`);
  console.log(`Saved ${(result.totalSavings.bytes / 1024 / 1024).toFixed(2)} MB`);
}

optimizeForProduction();
```

Add to `package.json`:
```json
{
  "scripts": {
    "optimize": "node scripts/optimize-images.js",
    "build": "npm run optimize && next build"
  }
}
```

### Express.js Middleware

```javascript
const express = require('express');
const { ImageOptimizer } = require('@optimix/image-pipeline');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const optimizer = new ImageOptimizer({
  outputDir: './public/optimized',
  formats: ['webp'],
  quality: 'auto',
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await optimizer.optimizeSingle(req.file.path);
    res.json({
      url: result.optimized[0].cdnUrl,
      savings: result.savings.percentage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Webpack Plugin

```javascript
// webpack-optimix-plugin.js
const { ImageOptimizer } = require('@optimix/image-pipeline');

class OptimixPlugin {
  constructor(options) {
    this.optimizer = new ImageOptimizer(options);
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('OptimixPlugin', async (compilation, callback) => {
      const imageAssets = Object.keys(compilation.assets)
        .filter(name => /\.(jpg|jpeg|png|webp|svg)$/i.test(name));

      for (const asset of imageAssets) {
        const assetPath = compilation.assets[asset].existsAt;
        await this.optimizer.optimizeSingle(assetPath);
      }

      callback();
    });
  }
}

module.exports = OptimixPlugin;
```

### React Hook

```typescript
import { useState, useEffect } from 'react';
import { ImageOptimizer, OptimizationResult } from '@optimix/image-pipeline';

export function useOptimizedImage(src: string) {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const optimizer = new ImageOptimizer({
      outputDir: './public/optimized',
      formats: ['webp', 'avif'],
      sizes: [320, 640, 1024],
      quality: 'auto',
    });

    optimizer.optimizeSingle(src)
      .then(setResult)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [src]);

  return { result, loading, error };
}
```

## Performance Optimization

### Caching
Enable caching to skip already optimized images:
```javascript
const optimizer = new ImageOptimizer({
  outputDir: './output',
  cacheEnabled: true, // Default: true
});
```

### Parallel Processing
Adjust parallel processing limit based on your system:
```javascript
const optimizer = new ImageOptimizer({
  outputDir: './output',
  parallel: 8, // Default: 4
});
```

### Memory Management
For large batches, process in chunks:
```javascript
async function optimizeLargeBatch(files) {
  const chunkSize = 100;
  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    await optimizer.optimizeBatch(chunk);
  }
}
```

## CDN Integration

### Cloudflare
```javascript
const optimizer = new ImageOptimizer({
  outputDir: './dist',
  cdnBaseUrl: 'https://images.example.com',
  formats: ['webp', 'avif'],
});
```

### AWS CloudFront
```javascript
const optimizer = new ImageOptimizer({
  outputDir: './dist',
  cdnBaseUrl: 'https://d1234567890.cloudfront.net/images',
  formats: ['webp'],
});
```

## Format Selection Guide

### WebP
- Best browser support (95%+)
- Good compression (25-35% smaller than JPEG)
- Supports transparency
- Recommended for most use cases

### AVIF
- Excellent compression (50% smaller than JPEG)
- Growing browser support (85%+)
- Best for modern applications
- Slower encoding

### JPEG
- Universal support
- Good for photos
- No transparency
- Fallback format

### PNG
- Lossless compression
- Transparency support
- Best for graphics with text
- Larger file sizes

## Responsive Sizes Strategy

### Mobile-First
```javascript
sizes: [320, 640, 1024, 1920]
```

### Desktop-First
```javascript
sizes: [1920, 1440, 1024, 768, 480]
```

### Specific Breakpoints
```javascript
sizes: [375, 768, 1024, 1440, 2560]
```

## Quality Settings

### Auto (Recommended)
```javascript
quality: 'auto' // Intelligent analysis
```

### High Quality
```javascript
quality: 90 // Minimal compression
```

### Balanced
```javascript
quality: 80 // Good balance
```

### Maximum Compression
```javascript
quality: 60 // Smaller files, visible quality loss
```
