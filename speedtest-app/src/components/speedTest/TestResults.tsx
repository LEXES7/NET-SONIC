import React from 'react';
import { SpeedTestResult } from '@/lib/types';
import { formatSpeed, getSpeedRating, formatMilliseconds } from '@/lib/utils';

interface TestResultsProps {
  result: SpeedTestResult | null;
  error: string | null;
}

export default function TestResults({ result, error }: TestResultsProps) {
  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Test Failed</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!result) return null;

  const downloadRating = getSpeedRating(result.downloadSpeed);
  const uploadRating = getSpeedRating(result.uploadSpeed);

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-4">Test Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Download Speed */}
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">Download</span>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{formatSpeed(result.downloadSpeed)}</span>
              <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded`}
                style={{ backgroundColor: `${downloadRating.color}20`, color: downloadRating.color }}>
                {downloadRating.rating}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{downloadRating.description}</p>
          </div>
          
          {/* Upload Speed */}
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">Upload</span>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{formatSpeed(result.uploadSpeed)}</span>
              <span className={`ml-2 text-sm font-medium px-2 py-0.5 rounded`}
                style={{ backgroundColor: `${uploadRating.color}20`, color: uploadRating.color }}>
                {uploadRating.rating}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{uploadRating.description}</p>
          </div>
        </div>
        
        {/* Ping & Jitter */}
        <div className="grid grid-cols-2 gap-5 mt-5">
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Ping</span>
            <p className="text-xl font-semibold">{formatMilliseconds(result.ping)}</p>
          </div>
          
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm">Jitter</span>
            <p className="text-xl font-semibold">{formatMilliseconds(result.jitter)}</p>
          </div>
        </div>
        
        <div className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          Tested on: {result.timestamp.toLocaleString()}
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Results may vary from other speed test services due to differences in testing methodology and server locations.
        </p>
      </div>
    </div>
  );
}