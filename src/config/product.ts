/**
 * ============================================================================
 *  PRODUCT + SITE SETTINGS (shared by all languages)
 * ============================================================================
 *  - Prices, colors, sizes, photos, links, pixels → this file
 *  - All TEXTS (Arabic / French / English)     → src/config/translations/
 *
 *  Values between [brackets] are placeholders: replace them before going live.
 * ============================================================================
 */

/* ------------------------------------------------------------------ SITE -- */
export const site = {
  brand: 'STRADA',
  // WhatsApp number in international format, digits only (no +, no spaces). Ex: 212612345678
  whatsapp: '212610056556',
  instagram: '[https://instagram.com/...]',
  // URL of your Google Apps Script web app (see README, step 4)
  scriptUrl: 'https://script.google.com/macros/s/AKfycbwzFVlWRfGdcjnuKkUXfdqjg764rg9rO_D9vGemCGz01AAgXjIDH0D2AADJSdsplKALrQ/exec',
  // Language of the colors and cities written in the Google Sheet (same for every order,
  // whatever language the customer used): 'ar', 'fr' or 'en'
  sheetLang: 'fr' as 'ar' | 'fr' | 'en',
  // Google Analytics 4 "Measurement ID" (starts with G-). Leave the [placeholder] to disable it.
  ga4Id: 'G-QXTY978E3G',
  // Pixel IDs (leave the [placeholder] to disable a pixel)
  metaPixelId: '2136756943868626',
  tiktokPixelId: 'DBNGBABC77U0V3P0S0MG',
  currency: 'MAD',
  ogImage: '/og-image.jpg', // file in /public (1200x630)
  /**
   * REAL customer reviews only (never invent them). The section is hidden while this list is empty.
   * Write each review as the customer wrote it (any language). Example:
   *   { text: 'Mzyana bzaf w mrihin', name: 'Salma B.', city: 'Casablanca' },
   */
  reviews: [] as { text: string; name: string; city?: string }[],
  /**
   * Languages of the site. Arabic is the main one (address "/").
   * French = "/fr/", English = "/en/". Remove 'fr' or 'en' to switch a language off.
   */
  languages: ['ar', 'fr', 'en'],
};

/* --------------------------------------------------------------- PRODUCT -- */
export const product = {
  price: 199, // MAD — price of 1 pair
  oldPrice: 265, // MAD — shown struck through (265 → 199 = -25%)
  bundle: { pairs: 2, totalPrice: 349 }, // every 2 pairs = 349 MAD (instead of 398)
  maxPairs: 5, // max pairs in one order

  /**
   * Icons of the 4 benefit cards (Lucide names, see src/components/Benefits.astro).
   * The titles/texts are in the translation files, in the same order.
   */
  benefitIcons: ['footprints', 'sparkles', 'shield', 'truck'],

  /**
   * Colors. Images are file names inside  src/assets/products/
   * (put your photos there — they are automatically optimized to AVIF/WebP).
   * The FIRST image of each color is used in the hero.
   * label = color name in each language.
   */
  colors: [
    {
      id: 'black',
      label: { ar: 'أسود', fr: 'Noir', en: 'Black' },
      hex: '#1a1a1a',
      images: ['black-1.webp', 'black-2.webp', 'black-3.webp'],
      sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    },
    {
      id: 'beige',
      label: { ar: 'بيج', fr: 'Beige', en: 'Beige' },
      hex: '#d9bc9c',
      images: ['beige-1.webp', 'beige-2.webp', 'beige-3.webp'],
      sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    },
    {
      id: 'brown',
      label: { ar: 'قهوي', fr: 'Marron', en: 'Brown' },
      hex: '#8f5628',
      images: ['brown-1.webp', 'brown-2.webp', 'brown-3.webp'],
      sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    },
  ],

  // EU size → foot length in cm (placeholder values — adjust)
  sizeGuide: [
    { eu: 36, cm: 23 },
    { eu: 37, cm: 23.5 },
    { eu: 38, cm: 24.5 },
    { eu: 39, cm: 25 },
    { eu: 40, cm: 26 },
    { eu: 41, cm: 26.5 },
    { eu: 42, cm: 27.5 },
    { eu: 43, cm: 28 },
    { eu: 44, cm: 29 },
    { eu: 45, cm: 29.5 },
  ],
};
