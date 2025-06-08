import { useState, useCallback, useEffect } from 'react';
import { NetworkSpeedTest } from '@/lib/speedtest';
import { SpeedTestResult, TestProgress, BrowserInfo } from '@/lib/types';
import { detectBrowser } from '../lib/browserDetect';

interface UseSpeedTestReturn {
  isRunning: boolean;
  progress: TestProgress;
  result: SpeedTestResult | null;
  error: string | null;
  startTest: () => Promise<void>;
  resetTest: () => void;
  history: SpeedTestResult[];
}

// Local storage key for saving test history
const HISTORY_STORAGE_KEY = 'speedtest_history';

// Fallback browser info if detection fails
const defaultBrowserInfo: Pick<BrowserInfo, 'isSafari'> = {
  isSafari: false
};

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
  
  // Detect browser once at component mount
  const [browser, setBrowser] = useState<Pick<BrowserInfo, 'isSafari'>>(defaultBrowserInfo);
  
  useEffect(() => {
    // Safe browser detection that won't break SSR
    if (typeof window !== 'undefined') {
      try {
        const detectedBrowser = detectBrowser();
        setBrowser({ isSafari: detectedBrowser.isSafari });
      } catch (err) {
        console.error('Browser detection failed:', err);
      }
    }
  }, []);

  // Load history from localStorage on first mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string dates back to Date objects
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      }
    } catch (e) {
      console.error('Failed to load test history:', e);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save test history:', e);
      }
    }
  }, [history]);

  const startTest = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setError(null);
    setResult(null);
    setProgress({ phase: 'idle', progress: 0, currentSpeed: 0 });

    try {
      const speedTest = new NetworkSpeedTest(
        (progressData) => setProgress(progressData),
        { isSafari: browser.isSafari }
      );

      const testResult = await speedTest.runFullTest();
      
      // Don't accept clearly invalid results (e.g., extremely high speeds that are unrealistic)
      if (testResult.downloadSpeed > 10000 || testResult.uploadSpeed > 10000) {
        throw new Error('Test produced unrealistic results. Please try again.');
      }
      
      setResult(testResult);
      setHistory(prev => {
        const updated = [testResult, ...prev.slice(0, 9)]; // Keep last 10 results
        return updated;
      });
      setProgress({ phase: 'complete', progress: 100, currentSpeed: 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('Speed test failed:', err);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, browser.isSafari]);

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