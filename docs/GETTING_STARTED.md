# Getting Started with Optimix

This guide will help you get up and running with Optimix Image Pipeline in minutes.

## Installation

```bash
npm install @optimix/image-pipeline
```

## Your First Optimization

### 1. Create a test directory

```bash
mkdir test-images
# Add some .jpg, .png, or .svg files to test-images/
```

### 2. Create a simple script

Create `optimize.js`:

```javascript
const { ImageOptimizer } = require('@optimix/image-pipeline');

async function optimize() {
  const optimizer = new ImageOptimizer({
    outputDir: './optimized',
    formats: ['webp'],
    quality: 'auto'
  });

  const result = await optimizer.optimizeDirectory('./test-images');
  
  console.log(`✓ Optimized ${result.filesProcessed} images`);
  console.log(`✓ Saved ${(result.totalSavings.bytes / 1024).toFixed(2)} KB`);
}

optimize();
```

### 3. Run it

```bash
node optimize.js
```

Check the `./optimized` directory for your optimized images!

## Common Use Cases

### E-commerce Product Images

```javascript
const optimizer = new ImageOptimizer({
  outputDir: './public/products',
  formats: ['webp', 'avif'],
  sizes: [400, 800, 1200],
  quality: 85,
  cdnBaseUrl: 'https://cdn.mystore.com/products'
});

await optimizer.optimizeDirectory('./raw-products');
```

### Blog Images

```javascript
const optimizer = new ImageOptimizer({
  outputDir: './public/blog',
  formats: ['webp'],
  sizes: [640, 1024, 1920],
  quality: 'auto',
  parallel: 8
});

await optimizer.optimizeDirectory('./blog-images');
```

### Next.js Integration

Create `scripts/optimize-images.js`:

```javascript
const { ImageOptimizer } = require('@optimix/image-pipeline');

async function optimizeForBuild() {
  const optimizer = new ImageOptimizer({
    outputDir: './public/optimized',
    formats: ['webp', 'avif'],
    sizes: [640, 1024, 1920],
    quality: 'auto',
    parallel: 8
  });

  const result = await optimizer.optimizeDirectory('./public/images');
  
  console.log(`Optimized ${result.filesProcessed} images`);
  console.log(`Saved ${(result.totalSavings.bytes / 1024 / 1024).toFixed(2)} MB`);
}

optimizeForBuild();
```

Update `package.json`:

```json
{
  "scripts": {
    "optimize": "node scripts/optimize-images.js",
    "build": "npm run optimize && next build"
  }
}
```

### Express.js Upload Handler

```javascript
const express = require('express');
const multer = require('multer');
const { ImageOptimizer } = require('@optimix/image-pipeline');

const app = express();
const upload = multer({ dest: 'uploads/' });

const optimizer = new ImageOptimizer({
  outputDir: './public/optimized',
  formats: ['webp'],
  quality: 'auto'
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await optimizer.optimizeSingle(req.file.path);
    res.json({
      url: result.optimized[0].path,
      savings: result.savings.percentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## CLI Usage

### Basic Commands

```bash
# Optimize a directory
npx optimix optimize ./images --output ./optimized

# Optimize with multiple formats
npx optimix optimize ./images -f webp,avif

# Generate responsive sizes
npx optimix optimize ./images -s 400,800,1200

# With CDN URLs
npx optimix optimize ./images -c https://cdn.example.com

# All options
npx optimix optimize ./src/assets \
  --output ./dist/assets \
  --formats webp,avif \
  --sizes 320,640,1024,1920 \
  --quality auto \
  --cdn https://cdn.example.com \
  --parallel 8
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputDir` | string | required | Output directory for optimized images |
| `formats` | array | `['webp']` | Output formats: webp, avif, jpeg, png |
| `sizes` | array | `[]` | Responsive widths to generate |
| `quality` | number\|'auto' | `'auto'` | Quality (1-100) or auto-detect |
| `cdnBaseUrl` | string | `''` | CDN base URL for generating URLs |
| `preserveOriginal` | boolean | `false` | Keep original files |
| `parallel` | number | `4` | Parallel processing limit |
| `cacheEnabled` | boolean | `true` | Enable result caching |

## Understanding Quality Settings

### Auto Quality (Recommended)

```javascript
quality: 'auto'
```

The optimizer analyzes each image and determines optimal quality based on:
- Image complexity (photos vs graphics)
- Edge density (text, logos)
- Color variance
- Alpha channels
- Image dimensions

### Manual Quality

```javascript
quality: 90  // High quality, larger files
quality: 80  // Balanced (recommended for manual)
quality: 60  // Maximum compression, visible quality loss
```

## Format Selection Guide

### WebP
- **Best for**: General use, wide browser support (95%+)
- **Compression**: 25-35% smaller than JPEG
- **Supports**: Transparency, animation
- **Use when**: You need maximum compatibility

### AVIF
- **Best for**: Modern applications
- **Compression**: 50% smaller than JPEG
- **Supports**: Transparency, HDR
- **Use when**: Targeting modern browsers (85%+ support)

### JPEG
- **Best for**: Photos, fallback format
- **Compression**: Standard baseline
- **Supports**: Progressive loading
- **Use when**: Universal compatibility required

### PNG
- **Best for**: Graphics with text, transparency
- **Compression**: Lossless
- **Supports**: Transparency
- **Use when**: Quality is critical

## Responsive Sizes Strategy

### Mobile-First Approach
```javascript
sizes: [320, 640, 1024, 1920]
```
Covers: Mobile, Tablet, Desktop, Large Desktop

### Desktop-First Approach
```javascript
sizes: [1920, 1440, 1024, 768, 480]
```
Covers: 4K, Desktop, Laptop, Tablet, Mobile

### Specific Breakpoints
```javascript
sizes: [375, 768, 1024, 1440, 2560]
```
Matches common device widths

## Next Steps

- Read the [API Reference](API.md) for detailed documentation
- Check [Advanced Usage](ADVANCED.md) for complex scenarios
- See [examples/](../examples/) for integration examples
- Learn about [Contributing](CONTRIBUTING.md)

## Troubleshooting

### Sharp Installation Issues

If you encounter issues with sharp:

```bash
npm install --platform=linux --arch=x64 sharp
# or for macOS
npm install --platform=darwin --arch=arm64 sharp
```

### Memory Issues with Large Batches

Process in smaller chunks:

```javascript
const files = await glob('./images/**/*.jpg');
const chunkSize = 50;

for (let i = 0; i < files.length; i += chunkSize) {
  const chunk = files.slice(i, i + chunkSize);
  await optimizer.optimizeBatch(chunk);
}
```

### Permission Errors

Use npx instead of global install:

```bash
npx @optimix/image-pipeline optimize ./images
```

## Support

- 📖 [Documentation](API.md)
- 🐛 [Report Issues](https://github.com/yourusername/optimix-image-pipeline/issues)
- 💬 [Discussions](https://github.com/yourusername/optimix-image-pipeline/discussions)
