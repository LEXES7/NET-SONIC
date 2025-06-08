import React from 'react';
import { SpeedTestResult } from '@/lib/types';
import { formatSpeed, formatMilliseconds } from '@/lib/utils';

interface TestHistoryProps {
  history: SpeedTestResult[];
}

export default function TestHistory({ history }: TestHistoryProps) {
  if (!history.length) return null;
  
  return (
    <div className="w-full mt-8">
      <h3 className="text-xl font-semibold mb-4">Test History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-left">
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Date</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Download</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Upload</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Ping</th>
              <th className="py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-300">Jitter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.map((result, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {result.timestamp.toLocaleDateString()} {result.timestamp.toLocaleTimeString()}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {formatSpeed(result.downloadSpeed)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {formatSpeed(result.uploadSpeed)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {formatMilliseconds(result.ping)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                  {formatMilliseconds(result.jitter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}