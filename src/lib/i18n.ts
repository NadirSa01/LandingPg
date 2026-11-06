/**
 * Language helpers.
 *  - Arabic (default) lives at "/", French at "/fr/", English at "/en/".
 *  - Components call  useT(Astro.url)  to get the current language + its texts.
 */
import ar from '../config/translations/ar';
import fr from '../config/translations/fr';
import en from '../config/translations/en';
import { site } from '../config/product';

export const translations = { ar, fr, en };
export type Lang = keyof typeof translations;
export const defaultLang: Lang = 'ar';

/** Languages switched on in product.ts → site.languages */
export const activeLangs: Lang[] = site.languages.filter((l): l is Lang => l in translations);
/** Languages that have their own folder (/fr/, /en/) */
export const prefixedLangs: Lang[] = activeLangs.filter((l) => l !== defaultLang);

/** Reads the language from the URL: "/fr/merci" → "fr", "/" → "ar" */
export function getLang(url: URL): Lang {
  const first = url.pathname.split('/')[1] as Lang;
  return prefixedLangs.includes(first) ? first : defaultLang;
}

/** Page path without the language: "/fr/merci" → "/merci" */
export function basePath(url: URL): string {
  const parts = url.pathname.split('/');
  if (prefixedLangs.includes(parts[1] as Lang)) parts.splice(1, 1);
  const path = parts.join('/');
  return path === '' ? '/' : path;
}

/** Address of a page in a language: ("fr", "/merci") → "/fr/merci" */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

/** Replaces {name} in a text: fill('{n} pairs', { n: 2 }) → '2 pairs' */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

/** Current language + its texts. Usage in a component:  const { lang, t } = useT(Astro.url); */
export function useT(url: URL) {
  const lang = getLang(url);
  return { lang, t: translations[lang] };
}

/** Color name in a language */
export function colorLabel(color: { label: Record<string, string> }, lang: Lang): string {
  return color.label[lang] ?? color.label[defaultLang];
}
