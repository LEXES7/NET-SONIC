import { BrowserInfo } from './types';

/**
 * Detect browser and device information
 * @returns Browser detection information
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    // Default values for SSR
    return {
      isSafari: false,
      isMobile: false,
      isIOS: false,
      browser: 'unknown',
      version: '0',
      os: 'unknown'
    };
  }
  
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor || '';
  
  // More reliable Safari detection
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) || 
                  (vendor.indexOf('Apple') > -1 && /\sSafari\//.test(userAgent));
  
  // Mobile detection
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);
  
  // iOS detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Determine browser name and version
  let browser = 'unknown';
  let version = '0';
  
  if (userAgent.indexOf('Firefox') !== -1) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '0';
  } else if (userAgent.indexOf('Edge') !== -1 || userAgent.indexOf('Edg/') !== -1) {
    browser = 'Edge';
    version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 
              userAgent.match(/Edg\/([0-9.]+)/)?.[1] || '0';
  } else if (userAgent.indexOf('Chrome') !== -1) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '0';
  } else if (isSafari) {
    browser = 'Safari';
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || '0';
  } else if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1) {
    browser = 'IE';
    version = userAgent.match(/MSIE ([0-9.]+)/)?.[1] || 
              userAgent.match(/rv:([0-9.]+)/)?.[1] || '0';
  }
  
  // Determine OS
  let os = 'unknown';
  if (/Windows/.test(userAgent)) {
    os = 'Windows';
  } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
    os = 'macOS';
  } else if (isIOS) {
    os = 'iOS';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (/Linux/.test(userAgent)) {
    os = 'Linux';
  }
  
  return {
    isSafari,
    isMobile,
    isIOS,
    browser,
    version,
    os
  };
}