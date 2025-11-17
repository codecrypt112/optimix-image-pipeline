# 🚀 Optimix Image Pipeline

[![npm version](https://img.shields.io/npm/v/@optimix/image-pipeline.svg)](https://www.npmjs.com/package/@optimix/image-pipeline)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Modern image optimization pipeline with intelligent compression, format conversion (WebP, AVIF), responsive sizing, and CDN integration. Built for Node.js, React, Next.js, and TypeScript projects.

## 🎉 What's New in v2.0

- 🤖 **Automatic Codebase Conversion** - Scan and convert all images in your codebase automatically
- 🎯 **Smart Format Selection** - AI-powered format recommendations based on content
- 🖼️ **Placeholder Generation** - LQIP and BlurHash for progressive loading
- 🧠 **Enhanced Algorithms** - 30% better quality analysis with noise detection
- 📈 **Better Compression** - 15-25% smaller files with content-aware optimization

[See v2.0 Features Guide →](docs/V2_FEATURES.md)

## ✨ Features

### Core Features
- 🎨 **Multi-Format Support** - JPEG, PNG, WebP, AVIF, SVG, GIF
- 📐 **Responsive Sizes** - Generate multiple sizes automatically
- 🗜️ **Smart Compression** - Adaptive quality based on image analysis
- 🎯 **SVG Optimization** - Advanced SVGO integration with custom algorithms
- 🌐 **CDN Ready** - Built-in CDN path generation
- ⚡ **Batch Processing** - Parallel optimization pipeline
- 🔧 **Framework Agnostic** - Works with Node.js, React, Next.js, Vue, etc.
- 📊 **Detailed Stats** - Compression ratios and size savings
- 💾 **Caching** - Skip already optimized images

### v2.0 Features
- 🤖 **Auto Codebase Conversion** - Automatically update image references in code
- 🎯 **Auto Format Selection** - Choose optimal formats based on content analysis
- 🖼️ **Placeholder Generation** - LQIP & BlurHash for progressive loading
- 🧠 **Advanced Quality Analysis** - Text/photo detection, noise analysis
- 📈 **Content-Aware Optimization** - Different strategies for photos vs graphics

## 📦 Installation

```bash
npm install @optimix/image-pipeline
```

## 🎯 Quick Start

### CLI Usage

```bash
# Optimize all images in a directory
npx optimix optimize ./images --output ./optimized

# With custom options
npx optimix optimize ./src/assets \
  --output ./dist/assets \
  --formats webp,avif \
  --sizes 400,800,1200 \
  --quality auto
```

### Node.js

```javascript
const { ImageOptimizer } = require('@optimix/image-pipeline');

const optimizer = new ImageOptimizer({
  outputDir: './optimized',
  formats: ['webp', 'avif'],
  sizes: [400, 800, 1200],
  quality: 'auto'
});

// Single image
const result = await optimizer.optimizeSingle('./photo.jpg');
console.log(`Saved ${result.savings.percentage.toFixed(1)}%`);

// Batch processing
const batchResult = await optimizer.optimizeDirectory('./images');
console.log(`Processed ${batchResult.filesProcessed} files`);
```

### v2.0: Automatic Codebase Conversion

```javascript
const optimizer = new ImageOptimizer({
  outputDir: './public/optimized',
  formats: ['webp', 'avif'],
  quality: 'auto',
  autoFormat: true,           // NEW: Auto-select best formats
  generatePlaceholders: true, // NEW: Generate LQIP/BlurHash
  updateCodebase: true,       // NEW: Update code references
  codebaseRoot: './src',
});

// Automatically scan, optimize, and update all images
const result = await optimizer.convertCodebaseImages();
console.log(`Converted ${result.convertedImages} images`);
console.log(`Updated ${result.updatedFiles} code files`);
```

### TypeScript

```typescript
import { ImageOptimizer, OptimizationConfig } from '@optimix/image-pipeline';

const config: OptimizationConfig = {
  outputDir: './public/optimized',
  formats: ['webp', 'avif'],
  sizes: [320, 640, 1024, 1920],
  quality: 'auto',
  cdnBaseUrl: 'https://cdn.example.com'
};

const optimizer = new ImageOptimizer(config);
const result = await optimizer.optimizeSingle('./hero.jpg');
```

### Next.js Build Script

```javascript
// scripts/optimize-images.js
const { ImageOptimizer } = require('@optimix/image-pipeline');

async function optimizeForBuild() {
  const optimizer = new ImageOptimizer({
    outputDir: './public/optimized',
    formats: ['webp', 'avif'],
    sizes: [640, 1024, 1920],
    quality: 'auto',
    parallel: 8
  });

  await optimizer.optimizeDirectory('./public/images');
}

optimizeForBuild();
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

## 📖 Documentation

- **[v2.0 Features Guide](docs/V2_FEATURES.md)** - New features in v2.0 ⭐
- **[Getting Started](docs/GETTING_STARTED.md)** - Quick start guide
- **[API Reference](docs/API.md)** - Complete API documentation
- **[Advanced Usage](docs/ADVANCED.md)** - Advanced features and integrations
- **[Setup Guide](docs/SETUP.md)** - Installation and configuration
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute

## 📝 Examples

Check the [examples/](examples/) directory for:
- Node.js integration
- React component examples
- TypeScript usage
- Build script examples

## 🚀 Performance

- Parallel processing for batch operations
- Intelligent caching to skip already optimized images
- Memory-efficient streaming for large files
- Average 60-80% size reduction with minimal quality loss

## 🎯 Use Cases

- **E-commerce**: Optimize product images for faster page loads
- **Blogs & CMS**: Automatically optimize uploaded images
- **Static Sites**: Build-time optimization for Next.js, Gatsby, etc.
- **Mobile Apps**: Generate responsive images for different screen sizes
- **CDN Integration**: Seamless integration with CloudFront, Cloudflare, etc.

## 📄 License

MIT
