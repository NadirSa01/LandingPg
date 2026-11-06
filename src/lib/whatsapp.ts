import { site } from '../config/product';

/** Builds a wa.me link with a pre-filled message */
export function whatsappLink(message: string): string {
  const number = site.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** true when a value from product.ts is still a "[placeholder]" */
export const isPlaceholder = (value: string) => !value || value.trim().startsWith('[');
