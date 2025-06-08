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
   * Network latency in milliseconds
   */
  ping: number;
  
  /**
   * Ping variation in milliseconds
   */
  jitter: number;
  
  /**
   * When the test was performed
   */
  timestamp: Date;
}

/**
 * Current progress of the speed test
 */
export interface TestProgress {
  /**
   * Current phase of testing
   */
  phase: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  
  /**
   * Progress percentage (0-100)
   */
  progress: number;
  
  /**
   * Current speed in Mbps
   */
  currentSpeed: number;
}

/**
 * Speed rating result
 */
export interface SpeedRating {
  /**
   * Rating label (e.g., "Fast", "Slow")
   */
  rating: string;
  
  /**
   * Color code for UI display
   */
  color: string;
  
  /**
   * Descriptive explanation of the rating
   */
  description: string;
}