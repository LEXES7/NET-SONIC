import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SpeedTestResult, TestProgress } from '@/lib/types';

interface SpeedTestState {
  // State
  isRunning: boolean;
  progress: TestProgress;
  result: SpeedTestResult | null;

  // Actions
  setRunning: (isRunning: boolean) => void;
  updateProgress: (progress: TestProgress) => void;
  setResult: (result: SpeedTestResult | null) => void;
  reset: () => void;
}

// Initial state
const initialState: Pick<SpeedTestState, 'isRunning' | 'progress' | 'result'> = {
  isRunning: false,
  progress: {
    phase: 'idle',
    progress: 0,
    currentSpeed: 0
  },
  result: null
};

// Create the store
export const useSpeedTestStore = create<SpeedTestState>()(
  devtools(
    (set) => ({
      ...initialState,

      // Actions
      setRunning: (isRunning) => set({ isRunning }),
      
      updateProgress: (progress) => set((state) => {
        // Always force progress to be at least 1% when active
        if (progress.phase !== 'idle' && progress.progress < 1) {
          progress.progress = 1;
        }
        
        // Ensure progress is never exactly 0 when test is running (to avoid UI glitches)
        if (state.isRunning && progress.progress === 0 && progress.phase !== 'idle') {
          progress.progress = 1;
        }
        
        // Don't allow progress to go backward within the same phase
        if (progress.phase === state.progress.phase && 
            progress.progress < state.progress.progress && 
            progress.phase !== 'idle') {
          progress.progress = state.progress.progress;
        }
        
        // Log for debugging
        console.log(`Store progress update: ${progress.phase} - ${progress.progress}%${
          progress.currentSpeed > 0 ? ` - ${progress.currentSpeed.toFixed(2)} Mbps` : ''
        }`);
        
        return { progress };
      }),
      
      setResult: (result) => set({ result }),
      
      reset: () => set({ 
        ...initialState
      })
    }),
    { name: 'speedtest-store' }
  )
);