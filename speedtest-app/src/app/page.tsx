'use client';

import { useState } from 'react';
import SpeedGauge from '@/components/speedTest/SpeedGauge';
import TestControls from '@/components/speedTest/TestControls';
import TestResults from '@/components/speedTest/TestResults';
import TestHistory from '@/components/speedTest/TestHistory';
import { useSpeedTest } from '@/hooks/useSpeedTest';

export default function Home() {
  const { 
    isRunning, 
    progress, 
    result, 
    error, 
    startTest, 
    resetTest,
    history
  } = useSpeedTest();

  const [showHistory, setShowHistory] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center pt-10 p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Title with neon effect */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-14 my-8 mb-12"
            style={{ 
              color: '#fcee09',
              textShadow: '0 0 10px rgba(252, 238, 9, 0.7), 0 0 20px rgba(252, 238, 9, 0.4), 0 0 30px rgba(252, 238, 9, 0.2)',
              letterSpacing: '0.05em',
              fontFamily: "'Share Tech Mono', monospace"
            }}>
          NET SONIC
          <span className="block text-lg mt-2 font-normal"
                style={{ 
                  color: 'rgba(252, 238, 9, 0.7)',
                  textShadow: '0 0 5px rgba(252, 238, 9, 0.5)'
                }}>
            INTERNET SPEED TEST
          </span>
        </h1>
        
        {/* Main test panel */}
        <div className="w-full flex flex-col items-center backdrop-blur-sm p-6 rounded-2xl mb-10"
             style={{ 
               backgroundColor: 'rgba(0, 0, 0, 0.3)',
               border: '1px solid rgba(252, 238, 9, 0.15)',
               boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)'
             }}>
          <div className="w-full max-w-lg">
            <SpeedGauge 
              isRunning={isRunning} 
              progress={progress} 
              currentSpeed={progress.currentSpeed} 
            />
          </div>
          
          <div className="my-6 w-full max-w-md">
            <TestControls 
              isRunning={isRunning} 
              onStart={startTest} 
              onReset={resetTest} 
            />
          </div>
        </div>
        
        {/* Results section */}
        {(result || error) && (
          <div className="w-full mt-2 mb-12">
            <TestResults 
              result={result}
              error={error}
            />
          </div>
        )}

        {/* History section with toggle */}
        <div className="w-full mt-6">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full py-3 mb-4 flex items-center justify-center gap-2 text-sm 
                      bg-black/30 border border-yellow-400/20 rounded-lg
                      transition-all duration-300 hover:bg-black/50 hover:border-yellow-400/40"
            style={{ 
              color: 'rgba(252, 238, 9, 0.8)'
            }}
          >
            {showHistory ? 'HIDE TEST HISTORY' : 'SHOW TEST HISTORY'}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          
          {showHistory && (
            <div>
              <TestHistory history={history} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}