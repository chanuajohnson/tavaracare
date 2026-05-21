/**
 * Blog attribution helpers.
 * Captures inbound UTM params on blog landings, persists them for the session,
 * and exposes a helper to fire CTA click tracking events that carry attribution forward.
 */
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "tavara_blog_attribution_v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type InboundAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landed_at?: string;
  landed_post_slug?: string;
};

function readSearch(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function readStoredAttribution(): InboundAttribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InboundAttribution) : null;
  } catch {
    return null;
  }
}

function writeStoredAttribution(attr: InboundAttribution) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attr));
  } catch {
    /* storage blocked, ignore */
  }
}

/**
 * Capture UTM params from the current URL (if any) and persist as first-touch
 * attribution for the session. Fires a `blog_utm_landed` engagement event.
 * Idempotent per session for the same post slug.
 */
export async function captureInboundAttribution(postSlug: string) {
  const params = readSearch();
  const source = params.get("utm_source");
  if (!source) return;

  const attr: InboundAttribution = {
    landed_at: new Date().toISOString(),
    landed_post_slug: postSlug,
  };
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) attr[key as keyof InboundAttribution] = val as never;
  }

  // First-touch wins: only overwrite if not already stored.
  const existing = readStoredAttribution();
  if (!existing?.utm_source) {
    writeStoredAttribution(attr);
  }

  // Fire engagement event (best-effort, non-blocking)
  try {
    await supabase.from("cta_engagement_tracking").insert({
      user_id: null,
      action_type: "blog_utm_landed",
      session_id: getSessionId(),
      additional_data: {
        post_slug: postSlug,
        utm_source: attr.utm_source,
        utm_medium: attr.utm_medium,
        utm_campaign: attr.utm_campaign,
        utm_content: attr.utm_content,
        utm_term: attr.utm_term,
        page_url: typeof window !== "undefined" ? window.location.href : null,
      },
    });
  } catch (e) {
    console.warn("[attribution] landed event insert failed", e);
  }

  // Google Analytics event (optional)
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "blog_utm_landed", {
        post_slug: postSlug,
        ...attr,
      });
    }
  } catch {
    /* ignore */
  }
}

function getSessionId(): string {
  try {
    let id = localStorage.getItem("session_id");
    if (!id) {
      id = `s_${crypto.randomUUID()}`;
      localStorage.setItem("session_id", id);
    }
    return id;
  } catch {
    return `tmp_${Math.random().toString(36).slice(2)}`;
  }
}

export type BlogCtaPlacement =
  | "top-family"
  | "top-professional"
  | "inline-family"
  | "inline-professional"
  | "end-family"
  | "end-professional"
  | "sticky-mobile"
  | "public-copy-share";

/**
 * Build a destination URL that forwards inbound attribution as `utm_referrer_*`
 * params so the downstream registration / assessment funnel keeps the origin.
 */
export function buildCtaDestination(
  baseHref: string,
  placement: BlogCtaPlacement,
  postSlug: string,
): string {
  const attr = readStoredAttribution();
  const url = new URL(
    baseHref.startsWith("http") ? baseHref : `https://tavara.care${baseHref}`,
  );

  url.searchParams.set("utm_source", "blog");
  url.searchParams.set("utm_medium", "internal");
  url.searchParams.set("utm_campaign", `blog-${postSlug}`);
  url.searchParams.set("utm_content", placement);

  if (attr?.utm_source) {
    url.searchParams.set("utm_referrer_source", attr.utm_source);
    if (attr.utm_campaign) url.searchParams.set("utm_referrer_campaign", attr.utm_campaign);
    if (attr.utm_content) url.searchParams.set("utm_referrer_content", attr.utm_content);
  }

  // Return a path-relative URL when input was relative, so react-router handles it.
  return baseHref.startsWith("http")
    ? url.toString()
    : `${url.pathname}${url.search}`;
}

/**
 * Fire a CTA click engagement event. Best-effort, fire-and-forget.
 */
export async function trackBlogCtaClick(opts: {
  postSlug: string;
  placement: BlogCtaPlacement;
  destination: string;
}) {
  const attr = readStoredAttribution();
  const payload = {
    post_slug: opts.postSlug,
    placement: opts.placement,
    destination: opts.destination,
    inbound_utm_source: attr?.utm_source ?? null,
    inbound_utm_campaign: attr?.utm_campaign ?? null,
    inbound_utm_content: attr?.utm_content ?? null,
  };

  try {
    await supabase.from("cta_engagement_tracking").insert({
      user_id: null,
      action_type: "blog_cta_click",
      session_id: getSessionId(),
      additional_data: payload,
    });
  } catch (e) {
    console.warn("[attribution] cta click insert failed", e);
  }

  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "blog_cta_click", payload);
    }
  } catch {
    /* ignore */
  }
}
