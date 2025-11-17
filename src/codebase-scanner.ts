import { promises as fs } from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface ImageReference {
  filePath: string;
  imagePath: string;
  lineNumber: number;
  lineContent: string;
  type: 'import' | 'src' | 'url' | 'require' | 'background';
}

export interface ScanResult {
  references: ImageReference[];
  uniqueImages: Set<string>;
  fileTypes: Map<string, number>;
}

export interface CodebaseConfig {
  rootDir: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  imageExtensions?: string[];
}

/**
 * Scans codebase for image references and enables automatic conversion
 */
export class CodebaseScanner {
  private config: Required<CodebaseConfig>;

  constructor(config: CodebaseConfig) {
    this.config = {
      rootDir: config.rootDir,
      includePatterns: config.includePatterns || [
        '**/*.{js,jsx,ts,tsx,vue,svelte,html,css,scss,sass,less}',
      ],
      excludePatterns: config.excludePatterns || [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
      ],
      imageExtensions: config.imageExtensions || [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'avif',
        'svg',
      ],
    };
  }

  /**
   * Scan codebase for all image references
   */
  async scan(): Promise<ScanResult> {
    const references: ImageReference[] = [];
    const uniqueImages = new Set<string>();
    const fileTypes = new Map<string, number>();

    // Get all code files
    const files = await this.getCodeFiles();

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const fileRefs = this.extractImageReferences(file, content);

      references.push(...fileRefs);

      // Track unique images and file types
      fileRefs.forEach((ref) => {
        uniqueImages.add(ref.imagePath);
        const ext = path.extname(ref.imagePath).toLowerCase().slice(1);
        fileTypes.set(ext, (fileTypes.get(ext) || 0) + 1);
      });
    }

    return {
      references,
      uniqueImages,
      fileTypes,
    };
  }

  /**
   * Get all code files to scan
   */
  private async getCodeFiles(): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of this.config.includePatterns) {
      const files = await glob(path.join(this.config.rootDir, pattern), {
        ignore: this.config.excludePatterns,
        nodir: true,
      });
      allFiles.push(...files);
    }

    return [...new Set(allFiles)];
  }

  /**
   * Extract image references from file content
   */
  private extractImageReferences(filePath: string, content: string): ImageReference[] {
    const references: ImageReference[] = [];
    const lines = content.split('\n');
    const imageExtPattern = this.config.imageExtensions.join('|');

    // Patterns to match different types of image references
    const patterns = [
      // import/require statements
      {
        regex: new RegExp(
          `(?:import|require)\\s*\\(?['"\`]([^'"\`]+\\.(?:${imageExtPattern}))['"\`]\\)?`,
          'gi'
        ),
        type: 'import' as const,
      },
      // src attributes
      {
        regex: new RegExp(`src\\s*=\\s*['"\`]([^'"\`]+\\.(?:${imageExtPattern}))['"\`]`, 'gi'),
        type: 'src' as const,
      },
      // url() in CSS
      {
        regex: new RegExp(`url\\s*\\(['"\`]?([^'"\`\\)]+\\.(?:${imageExtPattern}))['"\`]?\\)`, 'gi'),
        type: 'url' as const,
      },
      // background/backgroundImage
      {
        regex: new RegExp(
          `background(?:Image)?\\s*:\\s*['"\`]?url\\(['"\`]?([^'"\`\\)]+\\.(?:${imageExtPattern}))`,
          'gi'
        ),
        type: 'background' as const,
      },
    ];

    lines.forEach((line, index) => {
      patterns.forEach(({ regex, type }) => {
        let match;
        const regexCopy = new RegExp(regex);
        while ((match = regexCopy.exec(line)) !== null) {
          references.push({
            filePath,
            imagePath: match[1],
            lineNumber: index + 1,
            lineContent: line.trim(),
            type,
          });
        }
      });
    });

    return references;
  }

  /**
   * Replace image references in code files
   */
  async replaceImageReference(
    reference: ImageReference,
    newImagePath: string
  ): Promise<void> {
    const content = await fs.readFile(reference.filePath, 'utf-8');
    const lines = content.split('\n');

    // Replace the image path in the specific line
    const oldLine = lines[reference.lineNumber - 1];
    const newLine = oldLine.replace(reference.imagePath, newImagePath);
    lines[reference.lineNumber - 1] = newLine;

    await fs.writeFile(reference.filePath, lines.join('\n'), 'utf-8');
  }

  /**
   * Resolve image path relative to code file
   */
  resolveImagePath(reference: ImageReference): string {
    const codeFileDir = path.dirname(reference.filePath);
    return path.resolve(codeFileDir, reference.imagePath);
  }
}
