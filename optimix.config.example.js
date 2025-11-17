/**
 * Optimix Configuration Example
 * 
 * Copy this file to your project root as optimix.config.js
 * and customize the settings for your needs.
 */

module.exports = {
  // Output directory for optimized images
  outputDir: './public/optimized',

  // Target formats to generate
  formats: ['webp', 'avif'],

  // Responsive sizes (widths in pixels)
  sizes: [320, 640, 1024, 1920],

  // Quality setting: number (1-100) or 'auto' for intelligent detection
  quality: 'auto',

  // CDN base URL (optional)
  cdnBaseUrl: process.env.CDN_URL || '',

  // Preserve original files
  preserveOriginal: false,

  // Parallel processing limit
  parallel: 4,

  // Enable caching
  cacheEnabled: true,
};

// Example configurations for different use cases:

// E-commerce product images
const ecommerceConfig = {
  outputDir: './public/products',
  formats: ['webp', 'avif'],
  sizes: [400, 800, 1200],
  quality: 85,
  cdnBaseUrl: 'https://cdn.mystore.com/products',
};

// Blog/CMS images
const blogConfig = {
  outputDir: './public/blog',
  formats: ['webp'],
  sizes: [640, 1024, 1920],
  quality: 'auto',
  parallel: 8,
};

// Mobile app assets
const mobileConfig = {
  outputDir: './assets/images',
  formats: ['webp', 'avif'],
  sizes: [375, 768, 1024],
  quality: 80,
};

// High-quality portfolio
const portfolioConfig = {
  outputDir: './public/portfolio',
  formats: ['webp', 'avif'],
  sizes: [1024, 1920, 2560],
  quality: 90,
};
