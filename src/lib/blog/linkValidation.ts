// Pure utilities for scanning blog markdown for internal links.

export interface ExtractedLink {
  href: string;       // normalized to start with "/"
  rawHref: string;    // original href as written
  text: string;
  line: number;       // 1-indexed line in the source body
}

export type LinkClassification = 'blog-slug' | 'known-route' | 'dynamic-allowed' | 'unknown';

// Public, top-level routes lifted from src/components/routing/AppRoutes.tsx.
// Keep static routes only — dynamic ones are covered by DYNAMIC_PREFIXES below.
export const KNOWN_ROUTES = new Set<string>([
  '/',
  '/auth',
  '/features',
  '/about',
  '/errands',
  '/faq',
  '/support/faq',
  '/privacy-policy',
  '/urgent-caregivers',
  '/urgent-families',
  '/join-as-caregiver',
  '/onboarding-guide',
  '/blog',
  '/care/port-of-spain',
  '/care/san-fernando',
  '/care/arima',
  '/care/tobago',
  '/services/elder-care',
  '/services/dementia-care',
  '/services/post-surgery-care',
  '/services/live-in-care',
  '/registration/family',
  '/registration/professional',
  '/registration/community',
  '/dashboard/family',
  '/dashboard/professional',
  '/dashboard/community',
  '/dashboard/admin',
  '/profile/edit',
  '/professional',
  '/professional/profile',
  '/professional/schedule',
  '/professional/training',
  '/professional/message-board',
  '/professional/screening',
  '/professional/onboarding-checklist',
  '/family',
  '/family/matching',
  '/family/story',
  '/family/care-assessment',
  '/family/meal-management',
  '/family/medication-management',
  '/family/care-management',
  '/family/care-journey-progress',
  '/family/onboarding-checklist',
  '/family/readiness-quiz',
  '/family/upgrade/care-log-access',
  '/community',
  '/caregiver/matching',
  '/caregiver/health',
  '/subscription',
  '/subscriptions',
  '/subscription/features',
  '/subscriptions/features',
]);

// Prefixes whose paths take a dynamic segment we cannot validate statically.
// Treated as "allowed" — no warning, no error.
export const DYNAMIC_PREFIXES = [
  '/urgent/',
  '/admin/',          // admin sub-pages are extensive — trust the author
  '/professional/assignment/',
  '/professional/training/module/',
  '/family/care-management/',
];

const INTERNAL_HOSTS = ['tavara.care', 'tavaracare.lovable.app'];

/**
 * Extract markdown links `[text](href)` whose href resolves to an internal route.
 * Skips: mailto:, tel:, anchors (#foo), javascript:, and external http(s) URLs
 * unless the host matches one of INTERNAL_HOSTS.
 */
export function extractInternalLinks(body: string): ExtractedLink[] {
  if (!body) return [];
  const lines = body.split('\n');
  const re = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const out: ExtractedLink[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(line)) !== null) {
      const text = m[1].trim();
      const rawHref = m[2].trim();
      if (!rawHref) continue;
      if (/^(mailto:|tel:|javascript:|#)/i.test(rawHref)) continue;

      let normalized: string | null = null;
      if (rawHref.startsWith('/')) {
        normalized = rawHref;
      } else if (/^https?:\/\//i.test(rawHref)) {
        try {
          const url = new URL(rawHref);
          if (INTERNAL_HOSTS.includes(url.hostname)) {
            normalized = url.pathname + url.search;
          }
        } catch {
          // ignore malformed
        }
      }
      if (!normalized) continue;

      // strip query/hash & trailing slash for classification
      const cleaned = normalized.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
      out.push({ href: cleaned, rawHref, text, line: i + 1 });
    }
  }
  return out;
}

export function isBlogSlugHref(href: string): string | null {
  const m = href.match(/^\/blog\/([a-z0-9][a-z0-9-]*)$/i);
  return m ? m[1] : null;
}

export function classifyRoute(href: string): LinkClassification {
  if (isBlogSlugHref(href)) return 'blog-slug';
  if (KNOWN_ROUTES.has(href)) return 'known-route';
  for (const prefix of DYNAMIC_PREFIXES) {
    if (href.startsWith(prefix) && href.length > prefix.length) return 'dynamic-allowed';
  }
  return 'unknown';
}
