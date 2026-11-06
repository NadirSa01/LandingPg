/**
 * Price helpers — used by the page (build time) AND the order form (browser),
 * so the total shown everywhere is always the same.
 */
import { product } from '../config/product';

/** % discount between oldPrice and price, rounded. Ex: 265 → 199 = 25 */
export const discountPercent = Math.round((1 - product.price / product.oldPrice) * 100);

/**
 * Total price for N pairs.
 * Every `bundle.pairs` pairs cost `bundle.totalPrice`, the remaining pairs cost the normal price.
 * Ex (bundle 2 = 349, price 199): 1 → 199 · 2 → 349 · 3 → 548 · 4 → 698 · 5 → 897
 */
export function totalFor(pairs: number): number {
  const { pairs: size, totalPrice } = product.bundle;
  const bundles = Math.floor(pairs / size);
  const rest = pairs % size;
  return bundles * totalPrice + rest * product.price;
}

/** How much the customer saves compared to buying each pair at the normal price */
export function savingFor(pairs: number): number {
  return pairs * product.price - totalFor(pairs);
}

/** Saving of one bundle, for the Offer section */
export const bundleSaving = product.bundle.pairs * product.price - product.bundle.totalPrice;
