/**
 * Device Detection Utility
 * Parses user agent strings to extract device, browser, and OS information
 */

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenWidth: number;
  screenHeight: number;
}

/**
 * Detect device type from user agent and screen size
 */
export const detectDeviceType = (userAgent: string, screenWidth: number): 'mobile' | 'tablet' | 'desktop' => {
  const ua = userAgent.toLowerCase();
  
  // Check for mobile patterns first
  const mobilePatterns = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile/i;
  const tabletPatterns = /ipad|tablet|playbook|silk/i;
  
  if (tabletPatterns.test(ua)) {
    return 'tablet';
  }
  
  if (mobilePatterns.test(ua)) {
    return 'mobile';
  }
  
  // Use screen width as fallback
  if (screenWidth <= 768) {
    return 'mobile';
  } else if (screenWidth <= 1024) {
    return 'tablet';
  }
  
  return 'desktop';
};

/**
 * Detect browser from user agent
 */
export const detectBrowser = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  // Order matters - check more specific patterns first
  if (ua.includes('edg/') || ua.includes('edge/')) return 'Edge';
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
  if (ua.includes('chrome') && !ua.includes('chromium')) return 'Chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('msie') || ua.includes('trident/')) return 'IE';
  if (ua.includes('samsung')) return 'Samsung Browser';
  
  return 'Unknown';
};

/**
 * Detect OS from user agent
 */
export const detectOS = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  // iOS detection
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    // Try to extract iOS version
    const match = ua.match(/os (\d+)[_\.](\d+)/);
    if (match) {
      return `iOS ${match[1]}.${match[2]}`;
    }
    return 'iOS';
  }
  
  // Android detection
  if (ua.includes('android')) {
    const match = ua.match(/android (\d+(\.\d+)?)/);
    if (match) {
      return `Android ${match[1]}`;
    }
    return 'Android';
  }
  
  // Windows detection
  if (ua.includes('windows nt')) {
    if (ua.includes('windows nt 10')) return 'Windows 10/11';
    if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
    if (ua.includes('windows nt 6.2')) return 'Windows 8';
    if (ua.includes('windows nt 6.1')) return 'Windows 7';
    return 'Windows';
  }
  
  // macOS detection
  if (ua.includes('mac os x') || ua.includes('macintosh')) {
    const match = ua.match(/mac os x (\d+)[_\.](\d+)/);
    if (match) {
      return `macOS ${match[1]}.${match[2]}`;
    }
    return 'macOS';
  }
  
  // Linux detection
  if (ua.includes('linux') && !ua.includes('android')) {
    return 'Linux';
  }
  
  // Chrome OS
  if (ua.includes('cros')) {
    return 'Chrome OS';
  }
  
  return 'Unknown';
};

/**
 * Get complete device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const screenWidth = typeof window !== 'undefined' ? window.screen.width : 1920;
  const screenHeight = typeof window !== 'undefined' ? window.screen.height : 1080;
  
  return {
    deviceType: detectDeviceType(userAgent, screenWidth),
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent),
    screenWidth,
    screenHeight
  };
};
