'use client';

import React from 'react';
import { TestProgress } from '@/lib/types';
import { formatSpeed } from '@/lib/utils';

interface SpeedGaugeProps {
  isRunning: boolean;
  progress: TestProgress;
  currentSpeed: number;
}

export default function SpeedGauge({ isRunning, progress, currentSpeed }: SpeedGaugeProps) {
  const calculateRotation = () => {
    // Convert progress to degrees (0-180 degrees)
    return progress.progress * 1.8;
  };

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto">
      {/* Gauge background */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <div className="w-3/4 h-3/4 bg-white dark:bg-gray-900 rounded-full flex flex-col items-center justify-center">
          {/* Test phase indicator */}
          <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {progress.phase === 'idle' ? 'Ready' : progress.phase}
          </div>
          
          {/* Speed display */}
          <div className="text-4xl font-bold my-2">
            {isRunning && currentSpeed > 0
              ? formatSpeed(currentSpeed)
              : progress.phase === 'complete'
              ? '✓'
              : '--'}
          </div>
          
          {/* Progress percentage */}
          {isRunning && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress.progress)}%
            </div>
          )}
        </div>
      </div>
      
      {/* Progress arc - overlay a colored arc based on progress */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <path
          d="M 50,50 m 0,-46 a 46,46 0 1 1 0,92 a 46,46 0 1 1 0,-92"
          stroke={isRunning ? '#3b82f6' : '#6b7280'}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray="289"
          strokeDashoffset={289 - (289 * (progress.progress / 100))}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
    </div>
  );
}