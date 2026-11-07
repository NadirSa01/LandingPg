/**
 * One call → Meta Pixel (fbq) + TikTok Pixel (ttq) + Google Analytics 4 (gtag).
 * Each tool is skipped if it is not loaded (placeholder ID in product.ts / ad blocker).
 *
 *  Site event          Meta / TikTok                 Google Analytics 4
 *  (Meta "Lead (order sent)" = Lead + Purchase, like TikTok PlaceAnOrder + Purchase)
 *  ViewContent         ViewContent / ViewContent     view_item
 *  AddToCart           AddToCart / AddToCart         add_to_cart   ("Order now" button clicked)
 *  InitiateCheckout    InitiateCheckout / same       begin_checkout
 *  Lead (order sent)   Lead / PlaceAnOrder+Purchase  generate_lead + purchase (cash on delivery order)
 *  Contact (WhatsApp)  Contact / Contact             contact
 */
import { site } from '../config/product';
import { isPlaceholder } from './whatsapp';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, data?: object, options?: object) => void;
      page: () => void;
      identify: (data: object) => void;
    };
    gtag?: (...args: unknown[]) => void;
  }
}

export type EventName = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Lead' | 'Contact';

/** One product line for Google Analytics (GA4 "items") */
export type GaItem = { item_id: string; item_name: string; item_variant?: string; price: number; quantity: number };

export type TrackData = {
  value?: number;
  currency?: string;
  content_name?: string;
  num_items?: number;
  /** GA4 only: products of the event */
  items?: GaItem[];
  /** GA4 only: order id for "purchase" (avoids counting the same order twice) */
  transaction_id?: string;
  /** GA4 only: where the event happened (ex: WhatsApp button "floating" / "footer") */
  location?: string;
};

const metaName: Record<EventName, string[]> = {
  ViewContent: ['ViewContent'],
  AddToCart: ['AddToCart'],
  InitiateCheckout: ['InitiateCheckout'],
  Lead: ['Lead', 'Purchase'], // Purchase also counts orders later refused at delivery
  Contact: ['Contact'],
};

const tiktokName: Record<EventName, string[]> = {
  ViewContent: ['ViewContent'],
  AddToCart: ['AddToCart'],
  InitiateCheckout: ['InitiateCheckout'],
  // cash-on-delivery order = TikTok "Place an Order"; "Purchase" too, because TikTok's
  // e-commerce funnel requires it (note: it also counts orders later refused at delivery)
  Lead: ['PlaceAnOrder', 'Purchase'],
  Contact: ['Contact'],
};

const gaName: Record<EventName, string[]> = {
  ViewContent: ['view_item'],
  AddToCart: ['add_to_cart'],
  InitiateCheckout: ['begin_checkout'],
  Lead: ['generate_lead', 'purchase'],
  Contact: ['contact'],
};

const sent = new Set<string>();

/**
 * TikTok advanced matching: gives TikTok the customer's phone, hashed (SHA-256) in the browser,
 * so the order can be matched to the person who saw the ad. Call it before track('Lead').
 * phone = Moroccan format 0XXXXXXXXX → sent as +212XXXXXXXXX (E.164), as TikTok asks.
 */
async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function identifyCustomer(phone: string) {
  try {
    if (!window.crypto?.subtle) return;
    const local = phone.replace(/\D/g, '').replace(/^0/, ''); // 6XXXXXXXX
    // TikTok: E.164 with "+" → +2126XXXXXXXX
    if (window.ttq) window.ttq.identify({ phone_number: await sha256('+212' + local) });
    // Meta: digits with country code, no "+" → 2126XXXXXXXX (re-init with user data = advanced matching)
    if (window.fbq && !isPlaceholder(site.metaPixelId)) window.fbq('init', site.metaPixelId, { ph: await sha256('212' + local) });
  } catch {
    /* never break the page because of tracking */
  }
}

export function track(event: EventName, data: TrackData = {}, once = false) {
  if (once && sent.has(event)) return;
  sent.add(event);
  const { items, transaction_id, location, ...pixelData } = data;
  try {
    if (window.fbq) {
      // Meta wants content_ids + contents [{ id, quantity, item_price }]
      const ids = items?.length ? items.map((i) => i.item_id) : ['strada-clogs'];
      const fbData = {
        ...pixelData,
        content_type: 'product',
        content_ids: ids,
        ...(items?.length && {
          contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity, item_price: i.price })),
        }),
      };
      for (const name of metaName[event]) {
        window.fbq('track', name, fbData, transaction_id ? { eventID: `${transaction_id}-${name}` } : undefined);
      }
    }
    if (window.ttq) {
      // TikTok wants the products as "contents" (content_id / content_type)
      const ttData = items?.length
        ? {
            ...pixelData,
            content_type: 'product',
            contents: items.map((i) => ({
              content_id: i.item_id,
              content_type: 'product',
              content_name: i.item_name,
              price: i.price,
              quantity: i.quantity,
            })),
          }
        : // no products (ex: WhatsApp "Contact") → still give TikTok a content_id
          { ...pixelData, content_type: 'product', content_id: 'strada-clogs' };
      for (const name of tiktokName[event]) {
        window.ttq.track(name, ttData, transaction_id ? { event_id: `${transaction_id}-${name}` } : undefined);
      }
    }
  } catch {
    /* never break the page because of tracking */
  }
  try {
    if (window.gtag) {
      for (const name of gaName[event]) {
        window.gtag('event', name, {
          currency: data.currency,
          value: data.value,
          items,
          ...(name === 'purchase' && { transaction_id }),
          ...(location && { location }),
        });
      }
    }
  } catch {
    /* never break the page because of tracking */
  }
}

/**
 * Counts clicks on every WhatsApp link of the page (floating button, footer, form, thank-you page).
 * "location" tells which one was clicked.
 */
export function trackWhatsAppClicks() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href*="wa.me"]');
    if (!a) return;
    const location = a.classList.contains('fixed')
      ? 'floating_button'
      : a.closest('footer')
        ? 'footer'
        : a.closest('#order')
          ? 'order_form'
          : 'page';
    track('Contact', { location });
  });
}
