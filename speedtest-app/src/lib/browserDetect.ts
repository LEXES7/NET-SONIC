import { BrowserInfo } from './types';

/**
 * Detect browser and device information
 * @returns Browser detection information
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      name: 'unknown',
      version: 'unknown',
      isSafari: false,
      isChrome: false,
      isMobile: false
    };
  }
  
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isChrome = /chrome|chromium|crios/i.test(userAgent);
  const isMobile = /mobile|iphone|ipad|android/i.test(userAgent);
  
  let name = 'unknown';
  let version = 'unknown';
  
  if (isSafari) name = 'safari';
  else if (isChrome) name = 'chrome';
  else if (userAgent.indexOf('Firefox') > -1) name = 'firefox';
  else if (userAgent.indexOf('Edge') > -1) name = 'edge';
  
  // Extract version (simplified)
  const match = userAgent.match(/(chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (match && match[2]) version = match[2];
  
  return {
    name,
    version,
    isSafari,
    isChrome,
    isMobile
  };
}