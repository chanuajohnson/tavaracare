// SEO metadata for prerendered routes.
// Source of truth for the per-route <head> injected at build time so social
// crawlers (WhatsApp, LinkedIn, Slack, Facebook) — which do not execute JS —
// see correct title / description / canonical / OG / Twitter / JSON-LD.
//
// Keep this in sync with each page's <SEO> component for the listed routes.
// Blog posts are intentionally NOT here — they stay dynamic via the
// blog-share edge function so edits do not go stale.

const BASE = 'https://tavara.care';
const OG_IMAGE = `${BASE}/og-image.png`;

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tavara',
  url: BASE,
  logo: `${BASE}/TAVARACARElogo.JPG`,
};

const localBusiness = (areaServed, description) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: `Tavara Care — ${areaServed}`,
  description,
  url: `${BASE}/care/${slugify(areaServed)}`,
  telephone: '+1-868-786-5357',
  areaServed,
  address: { '@type': 'PostalAddress', addressCountry: 'TT', addressRegion: areaServed },
  priceRange: '$40-$50+ per hour',
});

const service = (serviceType, description, slug) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: serviceType,
  description,
  url: `${BASE}/services/${slug}`,
  provider: { '@type': 'Organization', name: 'Tavara Care', url: BASE },
  areaServed: 'Trinidad and Tobago',
});

const faqPage = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Location FAQs (kept short — full content is on the page itself)
const posFaqs = [
  { q: 'Do you have caregivers based in Port of Spain?', a: 'Yes. Many of our caregivers live in or near POS, including Woodbrook, Belmont, St Ann\'s, Newtown, and Cascade.' },
  { q: 'How quickly can care start in Port of Spain?', a: 'Non urgent matches usually within a few days. Urgent situations often within 24 to 48 hours.' },
  { q: 'What does it cost?', a: 'Care rates are $40 per hour Standard, $45 per hour Full Service, $50 plus per hour Premium.' },
];
const sfFaqs = [
  { q: 'Do you have caregivers in San Fernando?', a: 'Yes. We work with caregivers across South Trinidad including San Fernando, Marabella, Gasparillo, and surrounding districts.' },
  { q: 'How quickly can care start?', a: 'Non urgent matches usually within a few days. Urgent situations often within 24 to 48 hours.' },
  { q: 'What does it cost?', a: 'Care rates are $40 per hour Standard, $45 per hour Full Service, $50 plus per hour Premium.' },
];
const arimaFaqs = [
  { q: 'Do you cover Arima and East Trinidad?', a: 'Yes. We match caregivers across Arima, Tunapuna, Sangre Grande, and the East-West corridor.' },
  { q: 'How quickly can care start?', a: 'Non urgent matches usually within a few days. Urgent situations often within 24 to 48 hours.' },
  { q: 'What does it cost?', a: 'Care rates are $40 per hour Standard, $45 per hour Full Service, $50 plus per hour Premium.' },
];
const tobagoFaqs = [
  { q: 'Do you have caregivers in Tobago?', a: 'Yes. We work with caregivers based in Tobago, including Scarborough and surrounding areas.' },
  { q: 'How quickly can care start?', a: 'Non urgent matches usually within a few days. Urgent situations often within 24 to 48 hours.' },
  { q: 'What does it cost?', a: 'Care rates are $40 per hour Standard, $45 per hour Full Service, $50 plus per hour Premium.' },
];

// Service FAQs
const elderFaqs = [
  { q: 'What does elder care on Tavara include?', a: 'Companion care, personal care, medication reminders, mobility support, meal preparation, and daily care logs.' },
  { q: 'Are caregivers vetted?', a: 'Yes. Every caregiver goes through identity verification, references, and screening before matching.' },
];
const dementiaFaqs = [
  { q: 'Do your caregivers have dementia training?', a: 'Yes. We match families with caregivers experienced in dementia friendly routines, redirection, and safe supervision.' },
  { q: 'Can you support sundowning and night supervision?', a: 'Yes. We arrange evening and overnight coverage as part of the care team plan.' },
];
const postSurgeryFaqs = [
  { q: 'How soon can a caregiver start after discharge?', a: 'Urgent post discharge requests are usually covered within 24 to 48 hours.' },
  { q: 'Can caregivers support mobility and wound care?', a: 'Full Service and Premium tier caregivers support safe transfers, mobility, and basic wound care under family direction.' },
];
const liveInFaqs = [
  { q: 'How does live-in care work on Tavara?', a: 'A caregiver stays in the home for an extended block of days, with built in rest periods and a rotating fill-in caregiver for continuity.' },
  { q: 'Is live-in care cheaper than hourly?', a: 'Live-in arrangements are quoted separately. We share full details privately during onboarding.' },
];

export const ROUTES = [
  // Marketing & info
  {
    path: '/',
    title: 'Tavara — Care Coordination Platform for Families & Caregivers',
    description: 'Tavara connects families with vetted caregivers and coordinates care across Trinidad and Tobago. Find care, build a team, manage a care plan.',
    schemas: [orgSchema],
  },
  {
    path: '/about',
    title: 'About Tavara | Care Coordination Platform',
    description: 'Tavara is a care coordination platform connecting families with vetted caregivers across Trinidad and Tobago. Learn how we coordinate care.',
    schemas: [orgSchema],
  },
  {
    path: '/faq',
    title: 'FAQ | Tavara Care',
    description: 'Common questions about arranging care, matching with caregivers, rates, scheduling, and how Tavara coordinates care for your loved one.',
  },
  {
    path: '/features',
    title: 'Features | Tavara Care Coordination',
    description: 'Dashboard, daily care logs, matching, scheduling, caregiver payment coordination. See how Tavara coordinates care for families and caregivers.',
  },
  {
    path: '/errands',
    title: 'Errands & Support | Tavara',
    description: 'Errand and home support services coordinated through Tavara. Vetted helpers for shopping, transport, and household tasks.',
  },
  {
    path: '/legacy',
    title: 'Legacy Stories | Tavara',
    description: 'Honour the people you love. Tavara helps families capture and share the stories of those receiving care.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Tavara',
    description: 'How Tavara collects, uses, and protects your information. Read our privacy commitments to families and caregivers.',
  },
  {
    path: '/blog',
    title: 'Blog | Tavara Care',
    description: 'Practical guidance for families coordinating care in Trinidad and Tobago. Dementia, recovery, caregiver continuity, and more.',
  },

  // Location landing pages
  {
    path: '/care/port-of-spain',
    title: 'Caregivers in Port of Spain | Tavara Care',
    description: 'Arrange in-home care in Port of Spain with vetted caregivers. Tavara coordinates matching, scheduling, and daily care for your loved one.',
    schemas: [localBusiness('Port of Spain', 'In-home care coordination in Port of Spain, Trinidad.'), faqPage(posFaqs)],
  },
  {
    path: '/care/san-fernando',
    title: 'Caregivers in San Fernando | Tavara Care',
    description: 'Arrange in-home care in San Fernando with vetted caregivers. Tavara coordinates matching, scheduling, and daily care for your loved one.',
    schemas: [localBusiness('San Fernando', 'In-home care coordination in San Fernando, Trinidad.'), faqPage(sfFaqs)],
  },
  {
    path: '/care/arima',
    title: 'Caregivers in Arima | Tavara Care',
    description: 'Arrange in-home care in Arima and East Trinidad with vetted caregivers. Tavara coordinates matching, scheduling, and daily care.',
    schemas: [localBusiness('Arima', 'In-home care coordination in Arima and East Trinidad.'), faqPage(arimaFaqs)],
  },
  {
    path: '/care/tobago',
    title: 'Caregivers in Tobago | Tavara Care',
    description: 'Arrange in-home care in Tobago with vetted caregivers. Tavara coordinates matching, scheduling, and daily care for your loved one.',
    schemas: [localBusiness('Tobago', 'In-home care coordination in Tobago.'), faqPage(tobagoFaqs)],
  },

  // Service landing pages
  {
    path: '/services/elder-care',
    title: 'Elder Care Services | Tavara Care',
    description: 'Elder care at home in Trinidad and Tobago. Companion care, personal care, medication support, daily care logs. Coordinated by Tavara.',
    schemas: [service('Elder Care', 'Elder care coordination across Trinidad and Tobago.', 'elder-care'), faqPage(elderFaqs)],
  },
  {
    path: '/services/dementia-care',
    title: 'Dementia Care Services | Tavara Care',
    description: 'Dementia-friendly home care across Trinidad and Tobago. Caregivers trained in redirection, sundowning, and safe supervision.',
    schemas: [service('Dementia Care', 'Dementia care coordination across Trinidad and Tobago.', 'dementia-care'), faqPage(dementiaFaqs)],
  },
  {
    path: '/services/post-surgery-care',
    title: 'Post-Surgery Care Services | Tavara Care',
    description: 'Post-discharge home care across Trinidad and Tobago. Safe transfers, mobility support, recovery routines. Coordinated by Tavara.',
    schemas: [service('Post-Surgery Care', 'Post-surgery care coordination across Trinidad and Tobago.', 'post-surgery-care'), faqPage(postSurgeryFaqs)],
  },
  {
    path: '/services/live-in-care',
    title: 'Live-In Care Services | Tavara Care',
    description: 'Live-in care across Trinidad and Tobago. Extended in-home coverage with a primary caregiver and rotating fill-in for continuity.',
    schemas: [service('Live-In Care', 'Live-in care coordination across Trinidad and Tobago.', 'live-in-care'), faqPage(liveInFaqs)],
  },
];

export function buildHead(route) {
  const url = `${BASE}${route.path === '/' ? '/' : route.path}`;
  const title = escapeHtml(route.title);
  const desc = escapeHtml(route.description);
  const schemas = route.schemas || [];

  return `    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:site_name" content="Tavara" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
${schemas.map((s) => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
