/**
 * ============================================================================
 *  Browser-side logic (Alpine.js)
 * ============================================================================
 *  - $store.shop.color  → selected color (hero, gallery, final CTA, form summary)
 *  - $store.ui.formVisible / heroCtaVisible → what is on screen
 *                            (shows/hides the sticky bar, moves the WhatsApp button)
 *  - $store.ui.heroCtaUnderWhatsApp → hero button is where the floating WhatsApp button sits
 *                            (small phones: the WhatsApp button steps aside until the visitor scrolls)
 *  - orderForm()        → the order form (pair lines, live total, validation, sending)
 *  - Pixel "ViewContent" events
 *  Texts of the current language come from <script id="page-data"> (OrderForm.astro).
 * ============================================================================
 */
import Alpine from 'alpinejs';
import { product, site } from '../config/product';
import type { Translation } from '../config/translations/ar';
import { totalFor, savingFor } from '../lib/pricing';
import { makeOrderSchema, validateOrder, type OrderInput } from '../lib/validation';
import { track } from '../lib/tracking';
import { whatsappLink, isPlaceholder } from '../lib/whatsapp';
import { LAST_ORDER_KEY } from '../lib/constants';

/* ---------------------------------------------- Texts of this language --- */
type PageData = {
  lang: string;
  thanksUrl: string;
  productName: string;
  currencyLabel: string;
  otherCity: string;
  colorLabels: Record<string, string>;
  form: Translation['form'];
  errors: Translation['errors'];
};
const pageData: PageData = JSON.parse(document.getElementById('page-data')?.textContent || '{}');
const f = pageData.form;
const OTHER_CITY = pageData.otherCity;
const schema = makeOrderSchema(pageData.errors);

/** Replaces {name} in a text */
const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
const colorName = (id: string) => pageData.colorLabels[id] ?? id;

const STORAGE_KEY = 'order-form-v1'; // localStorage (form draft)
const firstColor = product.colors[0].id;

type Line = { uid: number; color: string; size: number | null };
let uid = 0;
const newLine = (color = firstColor): Line => ({ uid: ++uid, color, size: null });

const colorById = (id: string) => product.colors.find((c) => c.id === id) ?? product.colors[0];

/* ----------------------------------------------------------- Stores ------- */
Alpine.store('shop', { color: firstColor });
Alpine.store('ui', { formVisible: false, heroCtaVisible: true, heroCtaUnderWhatsApp: false });

/* ------------------------------------------------------- Order form ------ */
Alpine.data('orderForm', () => ({
  // field values
  name: '',
  phone: '',
  city: '',
  cityOther: '',
  address: '',
  note: '',
  website: '', // honeypot (hidden) — humans leave it empty
  lines: [newLine()] as Line[],

  // UI state
  errors: {} as Record<string, string>,
  touched: {} as Record<string, boolean>,
  submitted: false,
  status: 'idle' as 'idle' | 'sending' | 'error',

  init() {
    this.restore();
    // The color picked at the top of the page and the color of the first pair are always the same:
    // top color changed → first pair follows (setColor also keeps $store.shop.color in step the other way)
    // @ts-ignore Alpine magic
    this.$watch('$store.shop.color', (c: string) => {
      if (this.lines[0] && this.lines[0].color !== c) this.setColor(0, c);
    });
  },

  /* ---- computed values ---- */
  get pairs() {
    return this.lines.length;
  },
  get total() {
    return totalFor(this.pairs);
  },
  get saving() {
    return savingFor(this.pairs);
  },
  get canAdd() {
    return this.lines.length < product.maxPairs;
  },
  /** Message shown when one more pair would unlock the bundle price */
  get bundleHint() {
    const rest = this.pairs % product.bundle.pairs;
    if (rest === 0 || !this.canAdd) return '';
    const missing = product.bundle.pairs - rest;
    return missing === 1 ? f.bundleHintOne : fill(f.bundleHintMany, { n: missing });
  },
  get showCityOther() {
    return this.city.trim() === OTHER_CITY;
  },
  /** WhatsApp link with the order details, used if sending fails */
  get whatsappOrderUrl() {
    const msg = [
      fill(f.waIntro, { product: pageData.productName }),
      ...this.lines.map((l) => `- ${colorName(l.color)} ${l.size ?? '?'}`),
      `${f.waName}: ${this.name}`,
      `${f.waPhone}: ${this.phone}`,
      `${f.waCity}: ${this.showCityOther ? this.cityOther : this.city}`,
      `${f.waAddress}: ${this.address}`,
      `${f.waTotal}: ${this.total} ${pageData.currencyLabel}`,
    ].join('\n');
    return whatsappLink(msg);
  },

  /* ---- helpers used in the template ---- */
  sizesOf(colorId: string) {
    return colorById(colorId).sizes;
  },
  err(key: string) {
    const field = key.split('.')[0];
    return this.submitted || this.touched[field] || this.touched[key] ? this.errors[key] || '' : '';
  },

  /* ---- actions ---- */
  addLine() {
    if (!this.canAdd) return;
    const last = this.lines[this.lines.length - 1];
    this.lines.push(newLine(last?.color));
    this.changed();
  },
  removeLine(index: number) {
    if (this.lines.length <= 1) return;
    this.lines.splice(index, 1);
    // The first pair was removed → the new first pair's color becomes the shown color
    // @ts-ignore Alpine magic
    if (index === 0) this.$store.shop.color = this.lines[0].color;
    this.changed();
  },
  setColor(index: number, colorId: string) {
    const line = this.lines[index];
    if (!line) return;
    line.color = colorId;
    if (line.size !== null && !this.sizesOf(colorId).includes(line.size)) line.size = null;
    // @ts-ignore Alpine magic
    if (index === 0) this.$store.shop.color = colorId;
    this.changed();
  },
  setSize(index: number, size: number) {
    this.lines[index].size = size;
    this.touched[`lines.${index}.size`] = true;
    this.changed();
  },
  blur(field: string) {
    this.touched[field] = true;
    this.validate();
  },
  startCheckout() {
    track('InitiateCheckout', { value: this.total, currency: site.currency }, true);
  },

  /** Called after every change: re-validate + save draft */
  changed() {
    this.validate();
    this.save();
  },

  input(): OrderInput {
    return {
      name: this.name,
      phone: this.phone,
      city: this.city,
      cityOther: this.cityOther,
      address: this.address,
      note: this.note,
      lines: this.lines.map((l) => ({ color: l.color, size: l.size })),
    };
  },
  validate() {
    const { data, errors } = validateOrder(this.input(), schema, pageData.errors, OTHER_CITY);
    this.errors = errors;
    return data;
  },

  /* ---- localStorage draft (so the customer doesn't lose the form) ---- */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.input())); // honeypot is never saved
    } catch {
      /* private mode / storage full → ignore */
    }
  },
  restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      for (const k of ['name', 'phone', 'city', 'cityOther', 'address', 'note'] as const) {
        if (typeof d[k] === 'string') this[k] = d[k];
      }
      if (Array.isArray(d.lines) && d.lines.length) {
        this.lines = d.lines
          .slice(0, product.maxPairs)
          .filter((l: Line) => product.colors.some((c) => c.id === l.color))
          .map((l: Line) => ({
            ...newLine(l.color),
            size: colorById(l.color).sizes.includes(l.size as number) ? l.size : null,
          }));
        if (!this.lines.length) this.lines = [newLine()];
        // @ts-ignore Alpine magic
        this.$store.shop.color = this.lines[0].color;
      }
    } catch {
      /* corrupted data → ignore */
    }
  },

  /* ---- submit ---- */
  async submit() {
    if (this.status === 'sending') return; // prevents double submission
    this.submitted = true;
    const data = this.validate();
    if (!data) {
      // focus the first field with an error
      // @ts-ignore Alpine magic
      this.$nextTick(() => {
        const el = document.querySelector<HTMLElement>('#order-form [aria-invalid="true"]');
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    this.status = 'sending';
    const city = data.city === OTHER_CITY ? data.cityOther : data.city;
    const items = data.lines.map((l) => ({ color: colorName(l.color), size: l.size as number }));
    const total = this.total;
    const payload = {
      name: data.name,
      phone: data.phone, // normalized to 0XXXXXXXXX
      city,
      address: data.address,
      pairs: items.map((i) => `${i.color} ${i.size}`).join(' | '),
      pairsCount: items.length,
      total,
      note: data.note,
      lang: pageData.lang, // language of the page (ar / fr / en)
      website: this.website, // honeypot
    };

    try {
      await sendOrder(payload);
      track('Lead', { value: total, currency: site.currency, content_name: pageData.productName, num_items: items.length });
      try {
        sessionStorage.setItem(
          LAST_ORDER_KEY,
          JSON.stringify({ name: data.name, phone: data.phone, city, address: data.address, items, total }),
        );
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      // small delay so the Pixel events have time to leave
      setTimeout(() => (window.location.href = pageData.thanksUrl), 400);
    } catch (e) {
      console.error(e);
      this.status = 'error';
    }
  },
}));

/** POST the order to Google Apps Script as text/plain JSON (no CORS preflight) */
async function sendOrder(payload: object) {
  if (isPlaceholder(site.scriptUrl)) {
    if (import.meta.env.DEV) {
      console.warn('[dev] scriptUrl is not set in product.ts — simulating a successful order', payload);
      await new Promise((r) => setTimeout(r, 800));
      return;
    }
    throw new Error('scriptUrl is not configured in src/config/product.ts');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(site.scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.result !== 'success') throw new Error(json?.error || `HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------- Observers ------------ */
function observe(selector: string, cb: (visible: boolean, el: Element) => void, options?: IntersectionObserverInit) {
  const els = document.querySelectorAll(selector);
  if (!els.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting, e.target)), options);
  els.forEach((el) => io.observe(el));
}

// Order form on screen → hide sticky bar & WhatsApp button
observe('#order', (visible) => {
  (Alpine.store('ui') as { formVisible: boolean }).formVisible = visible;
});

// Hero "Order now" button on screen → no need for the sticky bar yet
observe('#hero-cta', (visible) => {
  (Alpine.store('ui') as { heroCtaVisible: boolean }).heroCtaVisible = visible;
});

// Small phones: the hero "Order now" button can land at the very bottom of the screen, right where
// the floating WhatsApp button is. While it does, the WhatsApp button hides (it comes back on scroll).
{
  const cta = document.getElementById('hero-cta');
  const WA_ZONE = 96; // px from the bottom of the screen covered by the WhatsApp button
  let queued = false;
  const check = () => {
    queued = false;
    if (!cta) return;
    const r = cta.getBoundingClientRect();
    (Alpine.store('ui') as { heroCtaUnderWhatsApp: boolean }).heroCtaUnderWhatsApp =
      r.bottom > innerHeight - WA_ZONE && r.top < innerHeight;
  };
  const queue = () => {
    if (!queued) (queued = true), requestAnimationFrame(check);
  };
  if (cta) {
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    check();
  }
}

// Pixel ViewContent when the gallery or the offer is seen (once)
observe('#gallery, #offer', (visible) => {
  if (visible) {
    track(
      'ViewContent',
      { content_name: pageData.productName, value: product.price, currency: site.currency, content_type: 'product' },
      true,
    );
  }
});

// @ts-ignore expose for debugging in the console
window.Alpine = Alpine;
Alpine.start();
