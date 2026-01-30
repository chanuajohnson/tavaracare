/**
 * UTM Tracking Utilities
 * Captures, stores, and manages UTM parameters for campaign attribution
 */

const UTM_STORAGE_KEY = 'tavara_utm_data';

export interface UTMData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  captured_at: string;
  landing_page: string;
}

/**
 * Capture UTM parameters from the current URL and store in localStorage
 * Only captures if UTM parameters are present in the URL
 */
export function captureUTMParams(): UTMData | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    const utm_source = urlParams.get('utm_source');
    const utm_medium = urlParams.get('utm_medium');
    const utm_campaign = urlParams.get('utm_campaign');
    const utm_content = urlParams.get('utm_content');
    const utm_term = urlParams.get('utm_term');
    
    // Only store if at least one UTM param is present
    if (utm_source || utm_medium || utm_campaign || utm_content || utm_term) {
      const utmData: UTMData = {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        captured_at: new Date().toISOString(),
        landing_page: window.location.pathname
      };
      
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      console.log('[UTM Tracking] Captured UTM parameters:', utmData);
      
      return utmData;
    }
    
    return null;
  } catch (error) {
    console.error('[UTM Tracking] Error capturing UTM params:', error);
    return null;
  }
}

/**
 * Get stored UTM data from localStorage
 */
export function getStoredUTMData(): UTMData | null {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UTMData;
    }
    return null;
  } catch (error) {
    console.error('[UTM Tracking] Error reading stored UTM data:', error);
    return null;
  }
}

/**
 * Clear stored UTM data (call after successful registration)
 */
export function clearUTMData(): void {
  try {
    localStorage.removeItem(UTM_STORAGE_KEY);
    console.log('[UTM Tracking] Cleared stored UTM data');
  } catch (error) {
    console.error('[UTM Tracking] Error clearing UTM data:', error);
  }
}

/**
 * Check if there's stored UTM data
 */
export function hasStoredUTMData(): boolean {
  return localStorage.getItem(UTM_STORAGE_KEY) !== null;
}

/**
 * Generate a UTM-tagged link for campaigns
 */
export interface GenerateUTMLinkOptions {
  baseUrl?: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string;
  term?: string;
}

export function generateUTMLink(options: GenerateUTMLinkOptions): string {
  const {
    baseUrl = 'https://tavara.care',
    source,
    medium,
    campaign,
    content,
    term
  } = options;
  
  const params = new URLSearchParams();
  params.set('utm_source', source.toLowerCase().replace(/\s+/g, '_'));
  params.set('utm_medium', medium.toLowerCase().replace(/\s+/g, '_'));
  params.set('utm_campaign', campaign.toLowerCase().replace(/\s+/g, '_'));
  
  if (content) {
    params.set('utm_content', content.toLowerCase().replace(/\s+/g, '_'));
  }
  
  if (term) {
    params.set('utm_term', term.toLowerCase().replace(/\s+/g, '_'));
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Platform presets for quick link generation
 */
export const UTM_PLATFORM_PRESETS = {
  instagram: {
    source: 'instagram',
    mediums: ['bio', 'paid', 'story', 'reel', 'post', 'dm']
  },
  tiktok: {
    source: 'tiktok',
    mediums: ['bio', 'paid', 'video', 'dm']
  },
  facebook: {
    source: 'facebook',
    mediums: ['bio', 'paid', 'post', 'story', 'group', 'messenger']
  },
  whatsapp: {
    source: 'whatsapp',
    mediums: ['status', 'dm', 'group', 'broadcast']
  },
  flyer: {
    source: 'flyer',
    mediums: ['qr_code', 'print']
  },
  email: {
    source: 'email',
    mediums: ['newsletter', 'campaign', 'transactional']
  },
  google: {
    source: 'google',
    mediums: ['search', 'display', 'youtube']
  }
} as const;

export type UTMPlatform = keyof typeof UTM_PLATFORM_PRESETS;
