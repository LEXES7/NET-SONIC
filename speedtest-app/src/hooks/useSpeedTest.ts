import { useState, useCallback, useEffect, useRef } from 'react';
import { NetworkSpeedTest } from '@/lib/speedtest';
import { SpeedTestResult, TestProgress, BrowserInfo } from '@/lib/types';
import { useSpeedTestStore } from '../store/speedtest-store';

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
  // Use our Zustand store for progress state
  const { progress, updateProgress, setResult, setRunning, isRunning } = useSpeedTestStore();
  
  // Keep some state locally
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
        // Basic browser detection
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        setBrowser({ isSafari });
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

  // Improved progress handler using the store
  const handleProgress = useCallback((progressData: TestProgress) => {
    // Log progress updates
    console.log(`Progress update: ${progressData.phase} - ${progressData.progress}%${
      progressData.currentSpeed > 0 ? ` - ${progressData.currentSpeed.toFixed(2)} Mbps` : ''
    }`);
    
    // Ensure we never report 0% progress when test is active
    if (progressData.progress < 1 && progressData.phase !== 'idle') {
      progressData.progress = 1;
    }
    
    // Use store action to update progress
    updateProgress(progressData);
  }, [updateProgress]);

  const startTest = useCallback(async () => {
    if (isRunning) return;

    // Set initial state
    setRunning(true);
    setError(null);
    setResult(null);
    updateProgress({ phase: 'ping', progress: 5, currentSpeed: 0 });

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
      
      // Update the store with the result
      setResult(testResult);
      
      // Update history
      setHistory(prev => {
        const updated = [testResult, ...prev.slice(0, 9)]; // Keep last 10 results
        return updated;
      });
      
      // Ensure we show 100% on completion
      updateProgress({ phase: 'complete', progress: 100, currentSpeed: 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed';
      setError(errorMessage);
      console.error('Speed test failed:', err);
      // Reset progress
      updateProgress({ phase: 'idle', progress: 0, currentSpeed: 0 });
    } finally {
      setRunning(false);
      speedTestRef.current = null;
    }
  }, [isRunning, browser.isSafari, handleProgress, setRunning, setResult, updateProgress]);

  const resetTest = useCallback(() => {
    // Cancel any ongoing test
    if (speedTestRef.current) {
      speedTestRef.current.cancelTest();
      speedTestRef.current = null;
    }
    
    setRunning(false);
    updateProgress({ phase: 'idle', progress: 0, currentSpeed: 0 });
    setResult(null);
    setError(null);
  }, [setRunning, updateProgress, setResult]);

  // Extract result from store
  const result = useSpeedTestStore(state => state.result);

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