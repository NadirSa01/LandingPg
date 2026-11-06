/**
 * Order form validation (Zod). Error messages come from the translation files.
 */
import { z } from 'zod';
import { product } from '../config/product';
import type { Translation } from '../config/translations/ar';

type Errors = Translation['errors'];

/**
 * Normalizes a Moroccan mobile number to 0XXXXXXXXX.
 * Accepts: 06XXXXXXXX · 07XXXXXXXX · +2126XXXXXXXX · +2127XXXXXXXX · 002126… · 2126…
 */
export function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-.()]/g, '');
  if (p.startsWith('+212')) p = '0' + p.slice(4);
  else if (p.startsWith('00212')) p = '0' + p.slice(5);
  else if (p.startsWith('212') && p.length === 12) p = '0' + p.slice(3);
  return p;
}

const colorIds = product.colors.map((c) => c.id);

/** Builds the form schema with the error messages of one language */
export function makeOrderSchema(e: Errors) {
  const lineSchema = z
    .object({
      color: z.string().refine((c) => colorIds.includes(c), { error: e.color }),
      size: z.number({ error: e.size }).nullable(),
    })
    .refine((l) => l.size !== null, { error: e.size, path: ['size'] })
    .refine(
      (l) => l.size === null || !!product.colors.find((c) => c.id === l.color)?.sizes.includes(l.size),
      { error: e.sizeUnavailable, path: ['size'] },
    );

  return z.object({
    name: z.string().trim().min(3, { error: e.name }),
    phone: z
      .string()
      .trim()
      .min(1, { error: e.phoneRequired })
      .transform(normalizePhone)
      .refine((p) => /^0[67]\d{8}$/.test(p), { error: e.phoneInvalid }),
    city: z.string().trim().min(2, { error: e.city }),
    cityOther: z.string().trim(),
    address: z.string().trim().min(5, { error: e.address }),
    note: z.string().trim().max(500, { error: e.noteTooLong }),
    lines: z
      .array(lineSchema)
      .min(1, { error: e.minPairs })
      .max(product.maxPairs, { error: e.maxPairs.replace('{n}', String(product.maxPairs)) }),
  });
}

export type OrderSchema = ReturnType<typeof makeOrderSchema>;
export type OrderInput = z.input<OrderSchema>;
export type Order = z.output<OrderSchema>;

/**
 * Validates and returns { data } or { errors: { "name": "...", "lines.0.size": "..." } }
 * otherCity = the "Other city" option of the current language.
 */
export function validateOrder(input: OrderInput, schema: OrderSchema, e: Errors, otherCity: string) {
  const result = schema.safeParse(input);
  const errors: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path.join('.');
      if (!errors[key]) errors[key] = issue.message;
    }
  }
  // "Other city" chosen → the city name becomes required
  if (input.city.trim() === otherCity && input.cityOther.trim().length < 2) {
    errors.cityOther = e.cityOther;
  }
  if (!result.success || Object.keys(errors).length) return { data: null, errors };
  return { data: result.data, errors };
}
