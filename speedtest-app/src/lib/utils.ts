import { SpeedRating } from './types';

/**
 * Format speed value to a human-readable string
 * @param speed Speed in Mbps (megabits per second)
 * @returns Formatted string with units
 */
export const formatSpeed = (speed: number): string => {
  if (speed === 0) return '0 Mbps';
  if (speed < 1) return `${(speed * 1000).toFixed(0)} Kbps`;
  if (speed >= 1000) return `${(speed / 1000).toFixed(2)} Gbps`;
  return `${speed.toFixed(2)} Mbps`;
};

/**
 * Get a rating for a given speed value
 * @param speed Speed in Mbps
 * @returns Rating object with description and color
 */
export const getSpeedRating = (speed: number): SpeedRating => {
  if (speed >= 500) {
    return {
      rating: 'Excellent',
      description: 'Lightning fast. Perfect for multiple 4K streams, large downloads, and real-time applications.',
      color: '#10b981' // Green
    };
  } else if (speed >= 100) {
    return {
      rating: 'Very Good',
      description: 'Great for 4K streaming, fast downloads, and most online activities.',
      color: '#22c55e' // Green
    };
  } else if (speed >= 50) {
    return {
      rating: 'Good',
      description: 'Suitable for HD streaming, video calls, and most online activities.',
      color: '#84cc16' // Light green
    };
  } else if (speed >= 25) {
    return {
      rating: 'Average',
      description: 'Good for regular browsing, HD video, and basic online activities.',
      color: '#eab308' // Yellow
    };
  } else if (speed >= 10) {
    return {
      rating: 'Fair',
      description: 'Sufficient for standard definition streaming and basic online tasks.',
      color: '#f59e0b' // Light orange
    };
  } else if (speed >= 5) {
    return {
      rating: 'Slow',
      description: 'Adequate for basic web browsing and standard definition video.',
      color: '#f97316' // Orange
    };
  } else if (speed > 0) {
    return {
      rating: 'Very Slow',
      description: 'Limited to basic web browsing. May struggle with video streaming.',
      color: '#ef4444' // Red
    };
  } else {
    return {
      rating: 'No Connection',
      description: 'No internet connectivity detected.',
      color: '#737373' // Gray
    };
  }
};

/**
 * Format milliseconds to a human-readable string
 * @param ms Time in milliseconds
 * @returns Formatted string with units
 */
export const formatMilliseconds = (ms: number): string => {
  if (ms < 1) return "< 1 ms";
  return `${Math.round(ms)} ms`;
};

/**
 * Calculate the average of an array of numbers
 * @param values Array of numbers
 * @returns Average value
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};