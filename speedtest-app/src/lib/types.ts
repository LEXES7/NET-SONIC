/**
 * Speed test result interface
 */
export interface SpeedTestResult {
  /**
   * Download speed in Mbps (megabits per second)
   */
  downloadSpeed: number;
  
  /**
   * Upload speed in Mbps (megabits per second)
   */
  uploadSpeed: number;
  
  /**
   * Ping latency in milliseconds
   */
  ping: number;
  
  /**
   * Jitter in milliseconds
   */
  jitter: number;
  
  /**
   * Timestamp when the test was performed
   */
  timestamp: Date;
  
  /**
   * Internet Service Provider name
   */
  isp?: string;
  
  /**
   * Connection type (WiFi, Ethernet, Cellular, etc.)
   */
  connectionType?: string;
}

/**
 * Progress information during speed test
 */
export interface TestProgress {
  /**
   * Current phase of the speed test
   */
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  
  /**
   * Progress percentage (0-100)
   */
  progress: number;
  
  /**
   * Current speed in Mbps (for download/upload phases)
   */
  currentSpeed: number;
}

/**
 * Speed rating information
 */
export interface SpeedRating {
  /**
   * Rating text (e.g., "Fast", "Slow")
   */
  rating: string;
  
  /**
   * Rating color (for UI representation)
   */
  color: string;
  
  /**
   * Description of what this speed means
   */
  description: string;
}

/**
 * Browser detection information
 */
export interface BrowserInfo {
  /**
   * Whether the browser is Safari
   */
  isSafari: boolean;
  
  /**
   * Whether the device is mobile
   */
  isMobile: boolean;
  
  /**
   * Whether the device is running iOS
   */
  isIOS: boolean;
  
  /**
   * Browser name
   */
  browser: string;
  
  /**
   * Browser version
   */
  version: string;
  
  /**
   * Operating system
   */
  os: string;
}

/**
 * Speed test configuration options
 */
export interface SpeedTestOptions {
  /**
   * Base URL for API endpoints
   */
  apiBaseUrl?: string;
  
  /**
   * Size of test file for download test in bytes
   */
  testFileSize?: number;
  
  /**
   * Number of parallel requests to use
   */
  parallelRequests?: number;
  
  /**
   * Duration of each test phase in milliseconds
   */
  testDurationMs?: number;
}