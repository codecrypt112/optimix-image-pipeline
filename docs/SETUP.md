# Setup Guide

## Installation

### For Users

Install the package in your project:

```bash
npm install @optimix/image-pipeline
```

### For Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/optimix-image-pipeline.git
cd optimix-image-pipeline
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Test the CLI:
```bash
node dist/cli.js optimize ./test-images --output ./output
```

## Quick Test

1. Create a test directory with some images:
```bash
mkdir test-images
# Add some .jpg, .png, or .svg files to test-images/
```

2. Run the quick start example:
```bash
node examples/quick-start.js
```

3. Check the output in `./optimized-output/`

## Usage in Your Project

### Node.js
```javascript
const { ImageOptimizer } = require('@optimix/image-pipeline');

const optimizer = new ImageOptimizer({
  outputDir: './optimized',
  formats: ['webp', 'avif'],
  quality: 'auto'
});

await optimizer.optimizeDirectory('./images');
```

### TypeScript
```typescript
import { ImageOptimizer, OptimizationConfig } from '@optimix/image-pipeline';

const config: OptimizationConfig = {
  outputDir: './optimized',
  formats: ['webp', 'avif'],
  quality: 'auto'
};

const optimizer = new ImageOptimizer(config);
await optimizer.optimizeDirectory('./images');
```

### CLI
```bash
# Basic usage
npx optimix optimize ./images --output ./optimized

# With options
npx optimix optimize ./src/assets \
  --output ./dist/assets \
  --formats webp,avif \
  --sizes 400,800,1200 \
  --quality auto
```

## Dependencies

The package requires:
- Node.js >= 16.0.0
- sharp (for image processing)
- svgo (for SVG optimization)

These are automatically installed when you install the package.

## Troubleshooting

### Sharp Installation Issues

If you encounter issues with sharp installation:

```bash
npm install --platform=linux --arch=x64 sharp
# or for macOS
npm install --platform=darwin --arch=arm64 sharp
```

### Permission Issues

If you get permission errors:

```bash
sudo npm install -g @optimix/image-pipeline
```

Or use without sudo:

```bash
npx @optimix/image-pipeline optimize ./images
```

## Next Steps

- Read the [README.md](README.md) for basic usage
- Check [ADVANCED.md](ADVANCED.md) for advanced features
- See [examples/](examples/) for integration examples
- Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
