import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface TestControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
}

export default function TestControls({ isRunning, onStart, onReset }: TestControlsProps) {
  const { currentThemeColors } = useTheme();
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs mx-auto">
      <button
        onClick={isRunning ? undefined : onStart}
        disabled={isRunning}
        className={`flex-1 px-6 py-3 rounded-full font-medium text-black transition-all duration-300`}
        style={{
          background: isRunning 
            ? `rgba(${currentThemeColors.primaryRGB}, 0.5)`
            : currentThemeColors.primary,
          boxShadow: isRunning
            ? 'none'
            : `0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.5), 0 0 30px rgba(${currentThemeColors.primaryRGB}, 0.3)`,
          textShadow: `0 1px 2px rgba(${currentThemeColors.primaryRGB}, 0.3)`,
          cursor: isRunning ? 'not-allowed' : 'pointer',
        }}
        aria-label="Start speed test"
      >
        {isRunning ? 'TESTING...' : 'START TEST'}
      </button>
      
      <button
        onClick={onReset}
        disabled={isRunning}
        className={`flex-1 px-6 py-3 rounded-full font-medium border transition-all duration-300`}
        style={{
          borderColor: `rgba(${currentThemeColors.primaryRGB}, ${isRunning ? 0.3 : 0.6})`,
          color: isRunning
            ? `rgba(${currentThemeColors.primaryRGB}, 0.4)`
            : currentThemeColors.primary,
          background: 'transparent',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          textShadow: isRunning 
            ? 'none'
            : `0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.3)`,
        }}
        aria-label="Reset test results"
      >
        RESET
      </button>
    </div>
  );
}