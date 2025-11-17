#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ImageOptimizer } from './image-optimizer';
import { OptimizationConfig, ImageFormat } from './types';
import * as path from 'path';

const program = new Command();

program
  .name('optimix')
  .description('Modern image optimization pipeline')
  .version('1.0.0');

program
  .command('optimize')
  .description('Optimize images in a directory')
  .argument('<input>', 'Input directory or file')
  .option('-o, --output <dir>', 'Output directory', './optimized')
  .option('-f, --formats <formats>', 'Output formats (comma-separated)', 'webp')
  .option('-s, --sizes <sizes>', 'Responsive sizes (comma-separated)', '')
  .option('-q, --quality <quality>', 'Quality (1-100 or "auto")', 'auto')
  .option('-c, --cdn <url>', 'CDN base URL', '')
  .option('-p, --parallel <number>', 'Parallel processing limit', '4')
  .action(async (input: string, options) => {
    const spinner = ora('Initializing optimizer...').start();

    try {
      const formats = options.formats.split(',').map((f: string) => f.trim()) as ImageFormat[];
      const sizes = options.sizes ? options.sizes.split(',').map((s: string) => parseInt(s.trim())) : [];
      const quality = options.quality === 'auto' ? 'auto' : parseInt(options.quality);

      const config: OptimizationConfig = {
        outputDir: path.resolve(options.output),
        formats,
        sizes,
        quality,
        cdnBaseUrl: options.cdn,
        parallel: parseInt(options.parallel),
      };

      const optimizer = new ImageOptimizer(config);

      spinner.text = 'Scanning for images...';

      const inputPath = path.resolve(input);
      const stats = await import('fs').then((fs) => fs.promises.stat(inputPath));

      let result;

      if (stats.isDirectory()) {
        spinner.text = 'Optimizing images...';
        result = await optimizer.optimizeDirectory(inputPath);

        spinner.succeed(chalk.green('✓ Optimization complete!'));

        console.log('\n' + chalk.bold('Results:'));
        console.log(chalk.cyan(`  Files processed: ${result.filesProcessed}`));
        console.log(chalk.cyan(`  Total savings: ${formatBytes(result.totalSavings.bytes)} (${result.totalSavings.percentage.toFixed(2)}%)`));
        console.log(chalk.cyan(`  Processing time: ${(result.totalProcessingTime / 1000).toFixed(2)}s`));

        if (result.errors.length > 0) {
          console.log('\n' + chalk.yellow('Errors:'));
          result.errors.forEach((err) => {
            console.log(chalk.red(`  ${err.file}: ${err.error}`));
          });
        }

        console.log('\n' + chalk.bold('Sample results:'));
        result.results.slice(0, 5).forEach((r) => {
          console.log(chalk.gray(`  ${path.basename(r.original.path)}: ${formatBytes(r.savings.bytes)} saved (${r.savings.percentage.toFixed(1)}%)`));
        });

        if (result.results.length > 5) {
          console.log(chalk.gray(`  ... and ${result.results.length - 5} more`));
        }
      } else {
        spinner.text = 'Optimizing image...';
        const singleResult = await optimizer.optimizeSingle(inputPath);

        spinner.succeed(chalk.green('✓ Optimization complete!'));

        console.log('\n' + chalk.bold('Result:'));
        console.log(chalk.cyan(`  Original: ${formatBytes(singleResult.original.size)}`));
        console.log(chalk.cyan(`  Optimized: ${singleResult.optimized.length} version(s)`));
        console.log(chalk.cyan(`  Savings: ${formatBytes(singleResult.savings.bytes)} (${singleResult.savings.percentage.toFixed(2)}%)`));
        console.log(chalk.cyan(`  Processing time: ${(singleResult.processingTime / 1000).toFixed(2)}s`));

        console.log('\n' + chalk.bold('Output files:'));
        singleResult.optimized.forEach((img) => {
          console.log(chalk.gray(`  ${img.path} (${formatBytes(img.size)})`));
        });

        if (singleResult.responsive.length > 0) {
          console.log('\n' + chalk.bold('Responsive versions:'));
          singleResult.responsive.forEach((img) => {
            console.log(chalk.gray(`  ${img.path} (${img.width}w, ${formatBytes(img.size)})`));
          });
        }
      }

      console.log('\n' + chalk.green(`Output directory: ${config.outputDir}`));
    } catch (error) {
      spinner.fail(chalk.red('Optimization failed'));
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
