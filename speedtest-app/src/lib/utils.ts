import { SpeedRating } from './types';

/**
 * Format speed value into a human-readable string
 * 
 * @param speed - Speed in Mbps
 * @returns Formatted speed string
 */
export const formatSpeed = (speed: number): string => {
  if (speed < 1) {
    return `${(speed * 1000).toFixed(0)} Kbps`;
  }
  return `${speed.toFixed(1)} Mbps`;
};

/**
 * Get a rating for a given speed value
 * 
 * @param speed - Speed in Mbps
 * @returns Object containing rating details
 */
export const getSpeedRating = (speed: number): SpeedRating => {
  if (speed < 1) {
    return {
      rating: 'Very Slow',
      color: '#ef4444', // red-500
      description: 'Unsuitable for most online activities'
    };
  } else if (speed < 5) {
    return {
      rating: 'Slow',
      color: '#f97316', // orange-500
      description: 'Basic web browsing only'
    };
  } else if (speed < 25) {
    return {
      rating: 'Moderate',
      color: '#eab308', // yellow-500
      description: 'SD video streaming, online gaming with high latency'
    };
  } else if (speed < 100) {
    return {
      rating: 'Fast',
      color: '#22c55e', // green-500
      description: 'HD video streaming, responsive online gaming'
    };
  } else {
    return {
      rating: 'Very Fast',
      color: '#3b82f6', // blue-500
      description: '4K video streaming, large file downloads, multiple users'
    };
  }
};

/**
 * Format milliseconds into a human-readable string
 * 
 * @param ms - Milliseconds
 * @returns Formatted milliseconds string
 */
export const formatMilliseconds = (ms: number): string => {
  return `${ms.toFixed(1)} ms`;
};

/**
 * Calculate average from an array of numbers
 * 
 * @param values - Array of numeric values
 * @returns Average value
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate jitter from an array of ping measurements
 * 
 * @param pingMeasurements - Array of ping values in milliseconds
 * @returns Jitter value in milliseconds
 */
export const calculateJitter = (pingMeasurements: number[]): number => {
  if (pingMeasurements.length <= 1) return 0;
  
  let totalDiff = 0;
  for (let i = 1; i < pingMeasurements.length; i++) {
    totalDiff += Math.abs(pingMeasurements[i] - pingMeasurements[i-1]);
  }
  
  return totalDiff / (pingMeasurements.length - 1);
};