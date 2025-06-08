import React from 'react';

interface TestControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
}

export default function TestControls({ isRunning, onStart, onReset }: TestControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs mx-auto">
      <button
        onClick={isRunning ? undefined : onStart}
        disabled={isRunning}
        className={`flex-1 px-6 py-3 rounded-full font-medium text-white 
          ${isRunning 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'}
          transition-colors`}
      >
        {isRunning ? 'Testing...' : 'Start Test'}
      </button>
      
      <button
        onClick={onReset}
        disabled={isRunning}
        className={`flex-1 px-6 py-3 rounded-full font-medium border
          ${isRunning
            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'}
          transition-colors`}
      >
        Reset
      </button>
    </div>
  );
}