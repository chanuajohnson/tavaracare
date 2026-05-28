/**
 * Thin, SSR-safe wrapper around window.gtag for GA4 custom events.
 *
 * Most product events are already mirrored to GA inside `useTracking`'s
 * `sendToGoogleAnalytics` path. Use this helper for one-off click events
 * outside that flow (e.g. external WhatsApp links).
 */

type GtagParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function gtagEvent(eventName: string, params?: GtagParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", eventName, params ?? {});
  } catch {
    /* ignore */
  }
}

/**
 * Fire a WhatsApp click event to GA4 with the surface label for funnel breakdowns.
 * Call this from any external WhatsApp link's onClick.
 */
export function trackWhatsAppClick(location: string, extra?: GtagParams): void {
  gtagEvent("whatsapp_click", { location, ...extra });
}
