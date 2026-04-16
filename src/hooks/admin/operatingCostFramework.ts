/**
 * Operating Cost Framework — Tavara Care
 *
 * A structured Chart of Accounts for operating costs, organized into 8 categories
 * matching real business accounting and aligned with T&T BIR expense classes.
 *
 * All values are stored as PER-WEEK amounts (normalized) for consistent calculation
 * with the unit economics engine. The UI lets users enter amounts in their natural
 * recurrence (weekly/monthly/yearly/one-time) and the framework normalizes to weekly.
 */

export type Recurrence = 'weekly' | 'monthly' | 'yearly' | 'one_time';

export interface CostLineItem {
  key: string;
  label: string;
  /** Natural recurrence the amount is entered in */
  recurrence: Recurrence;
  /** Amount in the units of `recurrence` */
  amount: number;
  /** T&T BIR tax-deductible flag */
  taxDeductible: boolean;
  notes?: string;
  /** For depreciable assets — months to spread cost over */
  depreciationMonths?: number;
  /** Auto-calculated from gross revenue (used for statutory items) */
  autoCalcPercentOfRevenue?: number;
  /** User-added custom item (deletable) */
  isCustom?: boolean;
}

export interface CostCategory {
  key: string;
  label: string;
  description: string;
  items: CostLineItem[];
}

/**
 * Convert a line item amount to its weekly-normalized equivalent.
 * One-time items with a depreciation period are spread over that period.
 * One-time items without depreciation are amortized over 52 weeks (1 year).
 */
export function normalizeToWeekly(item: CostLineItem): number {
  const amt = Number(item.amount) || 0;
  switch (item.recurrence) {
    case 'weekly':
      return amt;
    case 'monthly':
      return amt / 4.333;
    case 'yearly':
      return amt / 52;
    case 'one_time': {
      const months = item.depreciationMonths || 12;
      return amt / (months * 4.333);
    }
    default:
      return amt;
  }
}

export function categoryWeeklyTotal(cat: CostCategory): number {
  return cat.items.reduce((s, i) => s + normalizeToWeekly(i), 0);
}

export function frameworkWeeklyTotal(framework: CostCategory[]): number {
  return framework.reduce((s, c) => s + categoryWeeklyTotal(c), 0);
}

/**
 * Compute statutory costs that depend on gross revenue.
 * Returns the additional weekly cost from statutory provisions.
 */
export function statutoryWeeklyFromRevenue(
  framework: CostCategory[],
  weeklyGrossRevenue: number
): number {
  const statCat = framework.find(c => c.key === 'statutory');
  if (!statCat) return 0;
  return statCat.items.reduce((s, i) => {
    if (i.autoCalcPercentOfRevenue) {
      return s + (weeklyGrossRevenue * i.autoCalcPercentOfRevenue) / 100;
    }
    return s + normalizeToWeekly(i);
  }, 0);
}

export const DEFAULT_FRAMEWORK: CostCategory[] = [
  {
    key: 'software',
    label: 'Software & SaaS',
    description: 'Recurring platform, AI, and infrastructure subscriptions',
    items: [
      { key: 'lovable', label: 'Lovable subscription', recurrence: 'monthly', amount: 25, taxDeductible: true },
      { key: 'supabase', label: 'Supabase (DB + storage + edge functions)', recurrence: 'monthly', amount: 25, taxDeductible: true },
      { key: 'openai', label: 'OpenAI / AI gateway usage', recurrence: 'monthly', amount: 50, taxDeductible: true },
      { key: 'whatsapp_api', label: 'WhatsApp Business API', recurrence: 'monthly', amount: 30, taxDeductible: true },
      { key: 'domain', label: 'Domain & DNS (tavara.care)', recurrence: 'yearly', amount: 80, taxDeductible: true },
      { key: 'google_workspace', label: 'Google Workspace / email', recurrence: 'monthly', amount: 18, taxDeductible: true },
      { key: 'resend', label: 'Resend / transactional email', recurrence: 'monthly', amount: 20, taxDeductible: true },
      { key: 'monitoring', label: 'Analytics & monitoring (Sentry, PostHog)', recurrence: 'monthly', amount: 15, taxDeductible: true },
      { key: 'capcut', label: '🎬 CapCut Pro (content creation)', recurrence: 'monthly', amount: 0, taxDeductible: true },
      { key: 'opusclip', label: '✂️ OpusClip (AI clip generation)', recurrence: 'monthly', amount: 0, taxDeductible: true },
      { key: 'icloud', label: '☁️ iCloud+ storage', recurrence: 'monthly', amount: 0, taxDeductible: true },
      { key: 'canva', label: '🎨 Canva Pro', recurrence: 'monthly', amount: 0, taxDeductible: true },
      { key: 'maregtig', label: '🤖 mAregtig content tools', recurrence: 'monthly', amount: 0, taxDeductible: true },
      { key: 'captions', label: '📝 Captions / subtitle tooling', recurrence: 'monthly', amount: 0, taxDeductible: true },
      { key: 'audio_tools', label: '🎙️ Audio tools (Descript, ElevenLabs)', recurrence: 'monthly', amount: 0, taxDeductible: true },
      { key: 'other_saas', label: 'Other SaaS', recurrence: 'monthly', amount: 0, taxDeductible: true },
    ],
  },
  {
    key: 'devices',
    label: 'Devices & Equipment',
    description: 'Capital equipment depreciated over useful life',
    items: [
      { key: 'laptop', label: 'Laptop (24-mo depreciation)', recurrence: 'one_time', amount: 1500, depreciationMonths: 24, taxDeductible: true },
      { key: 'phone', label: 'Phone / tablet (24-mo depreciation)', recurrence: 'one_time', amount: 800, depreciationMonths: 24, taxDeductible: true },
      { key: 'peripherals', label: 'Peripherals (monitor, headset)', recurrence: 'one_time', amount: 400, depreciationMonths: 36, taxDeductible: true },
      { key: 'printer', label: 'Printer & supplies', recurrence: 'monthly', amount: 25, taxDeductible: true },
    ],
  },
  {
    key: 'founder_admin',
    label: 'Founder & Admin Time',
    description: 'True cost of business — founder and support hours',
    items: [
      { key: 'founder_time', label: 'Founder hours (40 hrs/wk × $50)', recurrence: 'weekly', amount: 2000, taxDeductible: false, notes: 'Founder time — tax deductible only if paid as director fees per BIR' },
      { key: 'admin_va', label: 'Admin / Virtual Assistant', recurrence: 'weekly', amount: 200, taxDeductible: true },
      { key: 'bookkeeper', label: 'Bookkeeper time', recurrence: 'monthly', amount: 300, taxDeductible: true },
    ],
  },
  {
    key: 'care_ops',
    label: 'Care Operations',
    description: 'Direct platform overhead per active client',
    items: [
      { key: 'coordination', label: 'Care coordination labor', recurrence: 'weekly', amount: 75, taxDeductible: true },
      { key: 'training_stipend', label: 'Training & shadow shift stipends', recurrence: 'weekly', amount: 35, taxDeductible: true, notes: 'Log as contractor stipend / training pay — never as wages' },
      { key: 'replacement_buffer', label: 'Replacement / backup buffer', recurrence: 'weekly', amount: 75, taxDeductible: true },
      { key: 'quality_oversight', label: 'Quality oversight & spot-checks', recurrence: 'weekly', amount: 25, taxDeductible: true },
      { key: 'documentation', label: 'Documentation & report generation', recurrence: 'weekly', amount: 20, taxDeductible: true },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing & Acquisition',
    description: 'Customer acquisition and brand spend',
    items: [
      { key: 'social_ads', label: 'Social media ads (Meta, Google)', recurrence: 'monthly', amount: 200, taxDeductible: true },
      { key: 'content', label: 'Content production', recurrence: 'monthly', amount: 100, taxDeductible: true },
      { key: 'referral_payouts', label: 'Referral payouts', recurrence: 'monthly', amount: 50, taxDeductible: true },
      { key: 'print', label: 'Print marketing (flyers, cards)', recurrence: 'monthly', amount: 30, taxDeductible: true },
      { key: 'events', label: 'Event sponsorships', recurrence: 'yearly', amount: 500, taxDeductible: true },
    ],
  },
  {
    key: 'professional',
    label: 'Professional Services',
    description: 'External advisors and risk coverage',
    items: [
      { key: 'accountant', label: 'Accountant / bookkeeping fees', recurrence: 'monthly', amount: 250, taxDeductible: true },
      { key: 'legal', label: 'Legal counsel', recurrence: 'yearly', amount: 1500, taxDeductible: true },
      { key: 'bir_filing', label: 'BIR / tax filing fees', recurrence: 'yearly', amount: 600, taxDeductible: true },
      { key: 'insurance', label: 'Insurance (professional & general liability)', recurrence: 'yearly', amount: 1800, taxDeductible: true },
    ],
  },
  {
    key: 'banking',
    label: 'Banking & Financial',
    description: 'Transaction, banking, and FX costs',
    items: [
      { key: 'payment_processing', label: 'Payment processing fees', recurrence: 'weekly', amount: 30, taxDeductible: true, notes: '~3% of revenue typically' },
      { key: 'bank_fees', label: 'Bank account fees', recurrence: 'monthly', amount: 25, taxDeductible: true },
      { key: 'wire_fees', label: 'Wire / ACH fees', recurrence: 'monthly', amount: 15, taxDeductible: true },
      { key: 'fx_conversion', label: 'FX conversion costs (USD↔TTD)', recurrence: 'monthly', amount: 40, taxDeductible: true },
    ],
  },
  {
    key: 'statutory',
    label: 'T&T Statutory Costs',
    description: 'Trinidad & Tobago BIR provisions — auto-calculated from gross revenue where noted',
    items: [
      { key: 'business_levy', label: 'Business Levy provision', recurrence: 'weekly', amount: 0, taxDeductible: false, autoCalcPercentOfRevenue: 0.6, notes: 'Auto: 0.6% of gross revenue' },
      { key: 'green_fund', label: 'Green Fund Levy provision', recurrence: 'weekly', amount: 0, taxDeductible: false, autoCalcPercentOfRevenue: 0.3, notes: 'Auto: 0.3% of gross revenue' },
      { key: 'health_surcharge', label: 'Health Surcharge', recurrence: 'weekly', amount: 0, taxDeductible: true },
      { key: 'vat_absorbed', label: 'VAT input cost (pre-registration)', recurrence: 'weekly', amount: 0, taxDeductible: false, notes: 'Until VAT-registered, 12.5% on inputs is absorbed' },
      { key: 'corp_tax_provision', label: 'Corporation Tax provision', recurrence: 'weekly', amount: 0, taxDeductible: false, notes: 'Provision for 30% of estimated annual net profit' },
    ],
  },
];

const STORAGE_KEY = 'tavara_operating_cost_framework_v2';
const LEGACY_KEY = 'tavara_operating_costs';

/** Backward-compat: convert old flat shape to new framework shape */
function migrateLegacyCosts(): CostCategory[] | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const old = JSON.parse(raw);
    const fw = JSON.parse(JSON.stringify(DEFAULT_FRAMEWORK)) as CostCategory[];
    // Map legacy flat keys into the new framework where appropriate
    const careOps = fw.find(c => c.key === 'care_ops');
    if (careOps) {
      const set = (k: string, v: number) => {
        const it = careOps.items.find(i => i.key === k);
        if (it && typeof v === 'number') it.amount = v;
      };
      set('coordination', old.careCoordination);
      set('replacement_buffer', old.replacementBuffer);
      set('documentation', old.adminDocumentation);
    }
    const banking = fw.find(c => c.key === 'banking');
    if (banking && typeof old.paymentProcessing === 'number') {
      const it = banking.items.find(i => i.key === 'payment_processing');
      if (it) it.amount = old.paymentProcessing;
    }
    const software = fw.find(c => c.key === 'software');
    if (software && typeof old.platformOverhead === 'number') {
      const it = software.items.find(i => i.key === 'other_saas');
      if (it) it.amount = old.platformOverhead;
    }
    const marketing = fw.find(c => c.key === 'marketing');
    if (marketing && typeof old.salesAcquisition === 'number') {
      const it = marketing.items.find(i => i.key === 'social_ads');
      if (it) it.amount = old.salesAcquisition * 4.333; // weekly→monthly
    }
    return fw;
  } catch {
    return null;
  }
}

export function loadFramework(): CostCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CostCategory[];
      // Ensure all default categories/items exist (forward-compat for new defaults)
      const merged = DEFAULT_FRAMEWORK.map(defCat => {
        const userCat = parsed.find(c => c.key === defCat.key);
        if (!userCat) return defCat;
        const items = defCat.items.map(defItem => {
          const userItem = userCat.items.find(i => i.key === defItem.key);
          return userItem ? { ...defItem, ...userItem } : defItem;
        });
        return { ...defCat, items };
      });
      return merged;
    }
    const migrated = migrateLegacyCosts();
    if (migrated) {
      saveFramework(migrated);
      return migrated;
    }
  } catch (err) {
    console.error('Error loading operating cost framework:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_FRAMEWORK));
}

export function saveFramework(framework: CostCategory[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(framework));
  } catch (err) {
    console.error('Error saving framework:', err);
  }
}

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  weekly: '/wk',
  monthly: '/mo',
  yearly: '/yr',
  one_time: 'one-time',
};

/** Add a custom line item to a category. Returns a new framework array. */
export function addCustomItem(
  framework: CostCategory[],
  catKey: string,
  item: Omit<CostLineItem, 'key' | 'isCustom'>
): CostCategory[] {
  const key = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  return framework.map(c =>
    c.key === catKey
      ? { ...c, items: [...c.items, { ...item, key, isCustom: true }] }
      : c
  );
}

/** Remove an item (only allowed for custom items). Returns a new framework array. */
export function removeItem(
  framework: CostCategory[],
  catKey: string,
  itemKey: string
): CostCategory[] {
  return framework.map(c =>
    c.key === catKey
      ? { ...c, items: c.items.filter(i => !(i.key === itemKey && i.isCustom)) }
      : c
  );
}

/** Suggested examples shown as hints in the UI per category */
export const CATEGORY_HINTS: Record<string, string> = {
  software: 'e.g. CapCut, OpusClip, iCloud, Canva, Notion, Figma, Zapier, ChatGPT Plus',
  devices: 'e.g. laptop, phone, tablet, monitor, headset, ring light, microphone',
  founder_admin: 'e.g. founder time, VA, bookkeeper, executive assistant',
  care_ops: 'e.g. coordination, training stipends, replacement buffer, oversight',
  marketing: 'e.g. Meta ads, Google ads, influencers, print, events, swag',
  professional: 'e.g. accountant, lawyer, BIR filing, insurance, consultants',
  banking: 'e.g. processing fees, bank fees, FX, wire fees, currency conversion',
  statutory: 'T&T BIR: Business Levy 0.6%, Green Fund 0.3%, Health Surcharge, Corp Tax',
};
