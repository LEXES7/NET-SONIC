'use client';

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

  return (
    <main className="flex min-h-screen flex-col items-center pt-20 p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Network Speed Test</h1>
        
        <div className="w-full max-w-lg">
          <SpeedGauge 
            isRunning={isRunning} 
            progress={progress} 
            currentSpeed={progress.currentSpeed} 
          />
        </div>
        
        <TestControls 
          isRunning={isRunning} 
          onStart={startTest} 
          onReset={resetTest} 
        />
        
        {(result || error) && (
          <TestResults 
            result={result} 
            error={error} 
          />
        )}
        
        <TestHistory history={history} />
      </div>
    </main>
  );
}