/**
 * Resolves image file names from product.ts (ex: "black-1.webp")
 * to the real files in src/assets/products/, so Astro can optimize them.
 */
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/products/*.{webp,jpg,jpeg,png,avif}',
  { eager: true },
);

export function productImage(fileName: string): ImageMetadata {
  const file = files[`/src/assets/products/${fileName}`];
  if (!file) {
    throw new Error(
      `Image "${fileName}" not found. Put it in src/assets/products/ or fix its name in src/config/product.ts`,
    );
  }
  return file.default;
}
