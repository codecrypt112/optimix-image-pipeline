import { optimize, Config } from 'svgo';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Advanced SVG optimization with custom algorithms
 */
export class SVGOptimizer {
  private config: Config = {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            cleanupIds: {
              minify: true,
              preserve: [],
            },
          },
        },
      },
      'removeDimensions',
      'removeScriptElement',
      'removeStyleElement',
      {
        name: 'removeAttrs',
        params: {
          attrs: ['data-*', 'class'],
        },
      },
    ],
  };

  async optimize(inputPath: string, outputPath: string): Promise<{ originalSize: number; optimizedSize: number }> {
    const svgContent = await fs.readFile(inputPath, 'utf-8');
    const originalSize = Buffer.byteLength(svgContent, 'utf-8');

    const result = optimize(svgContent, {
      ...this.config,
      path: inputPath,
    });

    const optimizedContent = result.data;
    const optimizedSize = Buffer.byteLength(optimizedContent, 'utf-8');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, optimizedContent, 'utf-8');

    return { originalSize, optimizedSize };
  }

  /**
   * Additional SVG-specific optimizations
   */
  async optimizeWithCustomAlgorithms(inputPath: string, outputPath: string): Promise<{ originalSize: number; optimizedSize: number }> {
    let svgContent = await fs.readFile(inputPath, 'utf-8');
    const originalSize = Buffer.byteLength(svgContent, 'utf-8');

    // Apply SVGO first
    const svgoResult = optimize(svgContent, {
      ...this.config,
      path: inputPath,
    });

    svgContent = svgoResult.data;

    // Custom optimizations
    svgContent = this.roundPathData(svgContent);
    svgContent = this.optimizeTransforms(svgContent);
    svgContent = this.minifyColors(svgContent);

    const optimizedSize = Buffer.byteLength(svgContent, 'utf-8');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, svgContent, 'utf-8');

    return { originalSize, optimizedSize };
  }

  /**
   * Round path data to reduce precision
   */
  private roundPathData(svg: string): string {
    return svg.replace(/d="([^"]*)"/g, (match, pathData) => {
      const rounded = pathData.replace(/(\d+\.\d{3,})/g, (num: string) => {
        return parseFloat(num).toFixed(2);
      });
      return `d="${rounded}"`;
    });
  }

  /**
   * Optimize transform attributes
   */
  private optimizeTransforms(svg: string): string {
    return svg.replace(/transform="([^"]*)"/g, (match, transform) => {
      const optimized = transform.replace(/(\d+\.\d{3,})/g, (num: string) => {
        return parseFloat(num).toFixed(2);
      });
      return `transform="${optimized}"`;
    });
  }

  /**
   * Minify color values
   */
  private minifyColors(svg: string): string {
    // Convert rgb() to hex
    svg = svg.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
      const hex = ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b))
        .toString(16)
        .slice(1);
      return `#${hex}`;
    });

    // Shorten hex colors where possible
    svg = svg.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');

    return svg;
  }
}
