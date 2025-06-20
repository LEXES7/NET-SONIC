import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Keep reference to test instance for cancellation
  const speedTestRef = useRef<NetworkSpeedTest | null>(null);
  
  // Browser detection
  const [browser, setBrowser] = useState<Pick<BrowserInfo, 'isSafari'>>(defaultBrowserInfo);
  
  // Init and cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const detectedBrowser = detectBrowser();
        setBrowser({ isSafari: detectedBrowser.isSafari });
      } catch (err) {
        console.error('Browser detection failed:', err);
      }
    }
    
    // Clean up any test on unmount
    return () => {
      if (speedTestRef.current) {
        speedTestRef.current.cancelTest();
        speedTestRef.current = null;
      }
    };
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

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save test history:', e);
      }
    }
  }, [history]);

  // Improved progress handler
  const handleProgress = useCallback((progressData: TestProgress) => {
    // Ensure we never report 0% progress when test is active
    if (progressData.phase !== 'idle' && progressData.phase !== 'complete' && progressData.progress < 5) {
      progressData.progress = 5;
    }
    
    setProgress(progressData);
  }, []);

  const startTest = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setError(null);
    setResult(null);
    
    // Start with a minimum progress
    setProgress({ phase: 'ping', progress: 5, currentSpeed: 0 });

    try {
      // Create a new test instance and store the reference
      const speedTest = new NetworkSpeedTest(
        handleProgress,
        { isSafari: browser.isSafari }
      );
      
      speedTestRef.current = speedTest;

      const testResult = await speedTest.runFullTest();
      
      // Sanity checks for results
      if (testResult.downloadSpeed > 2000) { // 2 Gbps is an upper limit for most home connections
        testResult.downloadSpeed = 2000;
      }
      
      if (testResult.uploadSpeed > 1000) { // 1 Gbps is an upper limit for most home upload speeds
        testResult.uploadSpeed = 1000;
      }
      
      setResult(testResult);
      setHistory(prev => {
        const updated = [testResult, ...prev.slice(0, 9)]; // Keep last 10 results
        return updated;
      });
      
      // Ensure we show 100% on completion
      setProgress({ phase: 'complete', progress: 100, currentSpeed: 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('Speed test failed:', err);
      // Reset progress
      setProgress(prev => ({ ...prev, phase: 'idle' }));
    } finally {
      setIsRunning(false);
      speedTestRef.current = null;
    }
  }, [isRunning, browser.isSafari, handleProgress]);

  const resetTest = useCallback(() => {
    // Cancel any ongoing test
    if (speedTestRef.current) {
      speedTestRef.current.cancelTest();
      speedTestRef.current = null;
    }
    
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