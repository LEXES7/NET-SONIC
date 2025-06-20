'use client';

import React from 'react';
import { SpeedTestResult } from '@/lib/types';
import { formatSpeed } from '@/lib/utils';

interface TestResultsProps {
  result: SpeedTestResult | null;
}

export default function TestResults({ result }: TestResultsProps) {
  if (!result) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Download</div>
        <div className="text-3xl font-bold my-2">{formatSpeed(result.downloadSpeed)}</div>
      </div>
      
      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Upload</div>
        <div className="text-3xl font-bold my-2">{formatSpeed(result.uploadSpeed)}</div>
      </div>
      
      <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Ping</div>
        <div className="text-3xl font-bold my-2">{Math.round(result.ping)} ms</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Jitter: {Math.round(result.jitter)} ms</div>
      </div>
      
      {/* ISP and connection info */}
      <div className="md:col-span-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">ISP: </span>
            <span>{result.isp || 'Unknown'}</span>
          </div>
          
          {result.connectionType && (
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Connection: </span>
              <span>{result.connectionType}</span>
            </div>
          )}
          
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Date: </span>
            <span>{result.timestamp.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}