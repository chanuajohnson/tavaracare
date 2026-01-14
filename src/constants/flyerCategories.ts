export interface FlyerCategory {
  code: string;
  label: string;
  description: string;
  icon: string;
}

export const FLYER_CATEGORIES: FlyerCategory[] = [
  { code: 'pharmacy', label: 'Pharmacies', description: 'High-value - elderly visit frequently', icon: '💊' },
  { code: 'wellness', label: 'Health & Wellness Shops', description: 'Health food, organic, supplements', icon: '🌿' },
  { code: 'beauty', label: 'Beauty & Aesthetics', description: 'Salons, spas, hairdressers', icon: '💇' },
  { code: 'fitness', label: 'Fitness', description: 'Gyms, yoga, pilates studios', icon: '🏋️' },
  { code: 'medical', label: 'Medical', description: 'Doctor offices, clinics, specialists', icon: '🏥' },
  { code: 'grocery', label: 'Groceries', description: 'Supermarkets with community boards', icon: '🛒' },
  { code: 'community', label: 'Community/Senior Centers', description: 'Direct access to elderly', icon: '👴' },
  { code: 'church', label: 'Churches/Religious', description: 'Strong community ties', icon: '⛪' },
  { code: 'retirement', label: 'Retirement Homes', description: 'Staff & visiting families', icon: '🏠' },
];

export const getCategoryByCode = (code: string): FlyerCategory | undefined => {
  return FLYER_CATEGORIES.find(cat => cat.code === code);
};

export const generateLocationCode = (category: string, businessName: string): string => {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 30);
  return `${category}_${slug}`;
};
