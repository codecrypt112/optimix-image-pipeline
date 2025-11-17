#!/bin/bash

# Build script for Optimix Image Pipeline

set -e

echo "🚀 Building Optimix Image Pipeline..."

# Clean previous build
echo "📦 Cleaning previous build..."
rm -rf dist

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc

# Make CLI executable
echo "⚡ Making CLI executable..."
chmod +x dist/cli.js

# Show build info
echo ""
echo "✅ Build complete!"
echo ""
echo "📊 Build Statistics:"
echo "   Source files: $(find src -name '*.ts' | wc -l)"
echo "   Output files: $(find dist -name '*.js' | wc -l)"
echo "   Type definitions: $(find dist -name '*.d.ts' | wc -l)"
echo ""
echo "📦 Package size:"
du -sh dist
echo ""
echo "🎉 Ready to publish!"
