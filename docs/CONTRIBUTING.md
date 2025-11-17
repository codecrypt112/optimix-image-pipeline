# Contributing to Optimix Image Pipeline

Thanks for your interest in contributing!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run examples: `node examples/nodejs-example.js`

## Project Structure

```
src/
├── image-optimizer.ts    # Main optimizer class
├── quality-analyzer.ts   # Intelligent quality detection
├── svg-optimizer.ts      # SVG-specific optimizations
├── types.ts              # TypeScript type definitions
├── cli.ts                # Command-line interface
└── index.ts              # Public API exports

examples/
├── nodejs-example.js     # Node.js usage examples
├── react-example.tsx     # React integration
└── typescript-example.ts # TypeScript examples
```

## Key Features

### Quality Analyzer
The quality analyzer uses custom algorithms to determine optimal compression:
- Image complexity analysis (entropy-based)
- Edge density detection
- Color variance calculation
- Adaptive quality based on image characteristics

### SVG Optimizer
Advanced SVG optimization with:
- SVGO integration
- Path data rounding
- Transform optimization
- Color minification

### Image Optimizer
Main optimization pipeline supporting:
- Multiple format conversion (WebP, AVIF, JPEG, PNG)
- Responsive size generation
- Parallel batch processing
- CDN URL generation
- Intelligent caching

## Testing

Add test images to `test-images/` directory and run:
```bash
node examples/nodejs-example.js
```

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a PR with clear description

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Keep functions focused and small
