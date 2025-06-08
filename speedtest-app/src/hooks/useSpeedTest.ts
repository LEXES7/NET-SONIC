import { useState, useCallback } from 'react';
import { NetworkSpeedTest, SpeedTestResult, TestProgress } from '../lib/speedtest';

interface UseSpeedTestReturn {
  isRunning: boolean;
  progress: TestProgress;
  result: SpeedTestResult | null;
  error: string | null;
  startTest: () => Promise<void>;
  resetTest: () => void;
  history: SpeedTestResult[];
}

export const useSpeedTest = (): UseSpeedTestReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<TestProgress>({
    phase: 'idle',
    progress: 0,
    currentSpeed: 0,
  });
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);

  const startTest = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setError(null);
    setResult(null);
    setProgress({ phase: 'idle', progress: 0, currentSpeed: 0 });

    try {
      const speedTest = new NetworkSpeedTest((progressData) => {
        setProgress(progressData);
      });

      const testResult = await speedTest.runFullTest();
      
      setResult(testResult);
      setHistory(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
      setProgress({ phase: 'complete', progress: 100, currentSpeed: 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('Speed test failed:', err);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning]);

  const resetTest = useCallback(() => {
    setIsRunning(false);
    setProgress({ phase: 'idle', progress: 0, currentSpeed: 0 });
    setResult(null);
    setError(null);
  }, []);

  return {
    isRunning,
    progress,
    result,
    error,
    startTest,
    resetTest,
    history,
  };
};