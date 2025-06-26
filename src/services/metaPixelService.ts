
import { MetaPixelStandardEvent, MetaPixelCustomEvent } from '@/types/facebook-pixel';

/**
 * Meta Pixel tracking service for TavaraCare
 * Integrates with Facebook advertising and analytics
 */
class MetaPixelService {
  private isEnabled: boolean = true;
  private pixelId: string = '357645101963758';

  constructor() {
    // Check if user has opted out of tracking
    const hasOptedOut = localStorage.getItem('tavara_disable_pixel_tracking') === 'true';
    this.isEnabled = !hasOptedOut && typeof window !== 'undefined' && !!window.fbq;
  }

  /**
   * Track a standard Facebook event
   */
  trackStandardEvent(eventName: MetaPixelStandardEvent, parameters: Record<string, any> = {}) {
    if (!this.isEnabled) {
      console.log('[Meta Pixel disabled]', eventName, parameters);
      return;
    }

    try {
      window.fbq('track', eventName, parameters);
      console.log('[Meta Pixel] Standard event tracked:', eventName, parameters);
    } catch (error) {
      console.error('Meta Pixel tracking error:', error);
    }
  }

  /**
   * Track a custom event specific to TavaraCare
   */
  trackCustomEvent(eventName: MetaPixelCustomEvent, parameters: Record<string, any> = {}) {
    if (!this.isEnabled) {
      console.log('[Meta Pixel disabled]', eventName, parameters);
      return;
    }

    try {
      window.fbq('trackCustom', eventName, parameters);
      console.log('[Meta Pixel] Custom event tracked:', eventName, parameters);
    } catch (error) {
      console.error('Meta Pixel custom tracking error:', error);
    }
  }

  /**
   * Track page view with additional context
   */
  trackPageView(additionalData: Record<string, any> = {}) {
    this.trackStandardEvent('PageView', {
      content_name: document.title,
      content_category: additionalData.page_type || 'general',
      user_role: additionalData.user_role || 'anonymous',
      ...additionalData
    });
  }

  /**
   * Track user registration completion
   */
  trackRegistration(userRole: string, additionalData: Record<string, any> = {}) {
    this.trackStandardEvent('CompleteRegistration', {
      content_name: `${userRole}_registration`,
      content_category: 'registration',
      user_role: userRole,
      ...additionalData
    });
  }

  /**
   * Track lead generation (interest in services)
   */
  trackLead(leadType: string, additionalData: Record<string, any> = {}) {
    this.trackStandardEvent('Lead', {
      content_name: leadType,
      content_category: 'lead_generation',
      ...additionalData
    });
  }

  /**
   * Disable Meta Pixel tracking
   */
  disableTracking() {
    this.isEnabled = false;
    localStorage.setItem('tavara_disable_pixel_tracking', 'true');
    console.log('Meta Pixel tracking disabled');
  }

  /**
   * Enable Meta Pixel tracking
   */
  enableTracking() {
    this.isEnabled = true;
    localStorage.removeItem('tavara_disable_pixel_tracking');
    console.log('Meta Pixel tracking enabled');
  }

  /**
   * Get tracking status
   */
  isTrackingEnabled(): boolean {
    return this.isEnabled;
  }
}

export const metaPixelService = new MetaPixelService();
