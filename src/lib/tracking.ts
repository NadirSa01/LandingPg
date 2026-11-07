/**
 * One call → Meta Pixel (fbq) + TikTok Pixel (ttq) + Google Analytics 4 (gtag).
 * Each tool is skipped if it is not loaded (placeholder ID in product.ts / ad blocker).
 *
 *  Site event          Meta / TikTok                 Google Analytics 4
 *  ViewContent         ViewContent / ViewContent     view_item
 *  InitiateCheckout    InitiateCheckout / same       begin_checkout
 *  Lead (order sent)   Lead / PlaceAnOrder           generate_lead + purchase (cash on delivery order)
 *  Contact (WhatsApp)  Contact / Contact             contact
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: object, options?: object) => void; page: () => void };
    gtag?: (...args: unknown[]) => void;
  }
}

export type EventName = 'ViewContent' | 'InitiateCheckout' | 'Lead' | 'Contact';

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

const tiktokName: Record<EventName, string> = {
  ViewContent: 'ViewContent',
  InitiateCheckout: 'InitiateCheckout',
  Lead: 'PlaceAnOrder', // cash-on-delivery order = TikTok "Place an Order"
  Contact: 'Contact',
};

const gaName: Record<EventName, string[]> = {
  ViewContent: ['view_item'],
  InitiateCheckout: ['begin_checkout'],
  Lead: ['generate_lead', 'purchase'],
  Contact: ['contact'],
};

const sent = new Set<string>();

export function track(event: EventName, data: TrackData = {}, once = false) {
  if (once && sent.has(event)) return;
  sent.add(event);
  const { items, transaction_id, location, ...pixelData } = data;
  try {
    window.fbq?.('track', event, pixelData);
    if (window.ttq) {
      // TikTok wants the products as "contents" (content_id / content_type)
      const ttData = items?.length
        ? {
            ...pixelData,
            content_type: 'product',
            contents: items.map((i) => ({
              content_id: i.item_id,
              content_name: i.item_name,
              price: i.price,
              quantity: i.quantity,
            })),
          }
        : pixelData;
      window.ttq.track(tiktokName[event], ttData, transaction_id ? { event_id: transaction_id } : undefined);
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
