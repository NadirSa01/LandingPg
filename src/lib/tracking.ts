/**
 * Tiny wrapper around Meta Pixel (fbq) and TikTok Pixel (ttq).
 * Does nothing if a pixel is not loaded (placeholder ID / ad blocker).
 */
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: object) => void; page: () => void };
  }
}

type EventName = 'ViewContent' | 'InitiateCheckout' | 'Lead';

// Meta event → TikTok event
const tiktokName: Record<EventName, string> = {
  ViewContent: 'ViewContent',
  InitiateCheckout: 'InitiateCheckout',
  Lead: 'SubmitForm',
};

const sent = new Set<string>();

export function track(event: EventName, data: Record<string, unknown> = {}, once = false) {
  if (once && sent.has(event)) return;
  sent.add(event);
  try {
    window.fbq?.('track', event, data);
    window.ttq?.track(tiktokName[event], data);
  } catch {
    /* never break the page because of tracking */
  }
}
