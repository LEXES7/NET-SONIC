'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TestProgress } from '@/lib/types';
import { formatSpeed } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { AlertCircle, X, Info } from 'lucide-react'; // Added Info icon
import Rocket from './Rocket';

interface SpeedGaugeProps {
  isRunning: boolean;
  progress: TestProgress;
  currentSpeed: number;
}

export default function SpeedGauge({ isRunning, progress, currentSpeed }: SpeedGaugeProps) {
  const { currentThemeColors } = useTheme();
  
  // Animation states - with explicit types to avoid comparison errors
  const [visualProgress, setVisualProgress] = useState<number>(0);
  const [particleIntensity, setParticleIntensity] = useState<number>(0);
  const [launchSequence, setLaunchSequence] = useState<number>(0); // 0: pre-launch, 1-3: countdown, 4: launched, 5: orbiting
  
  // Notification states
  const [showNotification, setShowNotification] = useState<boolean>(true);
  const [notificationDismissed, setNotificationDismissed] = useState<boolean>(false);
  
  // Animation timing config
  const testDuration = 15000; // Total animation duration in ms (15 seconds)
  const startTimeRef = useRef<number>(0);
  const testCompleteTimeRef = useRef<number>(0); // Time when test completed
  
  // Effect for launch sequence when test begins
  useEffect(() => {
    if (isRunning && progress.phase !== 'idle' && launchSequence === 0) {
      console.log("Starting launch sequence");
      
      // Start launch sequence
      setLaunchSequence(1);
      
      // Add pre-ignition smoke during countdown
      setTimeout(() => {
        setLaunchSequence(2);
        // Start generating light smoke
        setParticleIntensity(10);
      }, 1000);
      
      setTimeout(() => {
        setLaunchSequence(3);
        // More smoke as ignition approaches
        setParticleIntensity(20);
      }, 2000);
      
      setTimeout(() => {
        setLaunchSequence(4); // Rocket launches
        startTimeRef.current = Date.now(); // Record start time for animation
        console.log("Rocket launched, starting animation");
        // Intense particles at liftoff
        setParticleIntensity(50);
      }, 3000);
    } else if (!isRunning && progress.phase === 'idle') {
      // Reset everything when not running
      setLaunchSequence(0);
      setVisualProgress(0);
      setParticleIntensity(0);
      console.log("Reset animation");
    }
    
    // Check if test is complete and set orbital mode
    if (!isRunning && progress.phase !== 'idle' && progress.progress >= 95) {
      if (launchSequence !== 5) {
        console.log("Test complete, entering orbit mode");
        setLaunchSequence(5); // Set to orbital mode
        testCompleteTimeRef.current = Date.now();
      }
    }
  }, [isRunning, progress.phase, progress.progress, launchSequence]);
  
  // Time-based animation effect for rocket travel
  useEffect(() => {
    // Skip if not launched
    if (launchSequence < 4) return;
    
    let animationFrameId: number;
    
    const animateProgress = () => {
      // Test is considered complete if upload phase is nearly done or test is no longer running
      const isTestFinishing = 
        (progress.phase === 'upload' && progress.progress >= 95) || 
        (!isRunning && progress.phase !== 'idle');
      
      if (isTestFinishing && (launchSequence as number) === 4) {
        setVisualProgress(100);
        // Keep showing rocket at 100% position for a moment before transitioning to orbit
        setTimeout(() => {
          if ((launchSequence as number) !== 5) {
            setLaunchSequence(5); // Move to orbital mode
            testCompleteTimeRef.current = Date.now();
          }
        }, 1000);
        return;
      }
      
      if (!isRunning && progress.phase === 'idle') {
        return; // Don't continue animation if test is reset
      }
      
      // If in orbital mode, we don't update progress anymore
      if (launchSequence === 5) {
        return;
      }
      
      // Regular flight mode - update progress based on elapsed time
      const elapsed = Date.now() - startTimeRef.current;
      const timeProgress = Math.min(100, (elapsed / testDuration) * 100);
      
      // Update visual progress with slight easing
      // Acceleration phase: start slower then speed up
      let easedProgress;
      if (timeProgress < 20) {
        // Slow start (accelerating)
        easedProgress = timeProgress * 0.8;
      } else if (timeProgress < 80) {
        // Middle of flight (cruising)
        easedProgress = 16 + (timeProgress - 20) * 1.05;
      } else {
        // End of flight (decelerating slightly)
        easedProgress = 79 + (timeProgress - 80) * 1.05;
      }
      
      setVisualProgress(easedProgress);
      
      // Continue animation unless complete
      if (timeProgress < 100 && isRunning) {
        animationFrameId = requestAnimationFrame(animateProgress);
      } else if (timeProgress >= 100) {
        // Ensure we reach 100% at the end
        setVisualProgress(100);
      }
    };
    
    // Start time-based animation
    animationFrameId = requestAnimationFrame(animateProgress);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [launchSequence, progress.phase, progress.progress, isRunning]);
  
  // Update particle intensity based on speed and phase
  useEffect(() => {
    if (launchSequence === 5) {
      // Gentle particles in orbit mode
      setParticleIntensity(25);
      return;
    }
    
    if (isRunning && (progress.phase === 'download' || progress.phase === 'upload')) {
      // Calculate intensity based on speed during the test
      const speed = progress.currentSpeed > 0 ? progress.currentSpeed : currentSpeed;
      
      // Calculate base intensity with minimum and maximum limits
      // Map speed to intensity: 0 -> 15, 100 -> 100
      const baseIntensity = Math.min(100, 15 + (speed / 1.5));
      
      // Make particles more intense during phase changes
      const phaseBoost = progress.progress < 10 ? 20 : 0;
      
      const finalIntensity = baseIntensity + phaseBoost;
      setParticleIntensity(finalIntensity);
    } else if (launchSequence >= 1 && launchSequence <= 3) {
      // Pre-launch smoke levels already set in launch sequence effect
    } else if (!isRunning || progress.phase === 'idle') {
      setParticleIntensity(0);
    }
  }, [isRunning, progress.phase, progress.currentSpeed, currentSpeed, progress.progress, launchSequence]);
  
  // Force progress to 100% when test finishes
  useEffect(() => {
    const isTestFinishing = 
      (progress.phase === 'upload' && progress.progress >= 95) || 
      (!isRunning && progress.phase !== 'idle');
      
    if (isTestFinishing) {
      setVisualProgress(100);
    }
  }, [progress.phase, progress.progress, isRunning]);

  // Store notification state in localStorage to persist user preference
  useEffect(() => {
    // Check if we already hidden the notification
    const notificationState = localStorage.getItem('net-sonic-notification');
    if (notificationState === 'hidden') {
      setShowNotification(false);
      setNotificationDismissed(true);
    }
  }, []);

  // Handle closing the notification
  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationDismissed(true);
    localStorage.setItem('net-sonic-notification', 'hidden');
  };

  // Handle reopening the notification when icon is clicked
  const handleReopenNotification = () => {
    setShowNotification(true);
  };

  // Get phase status text
  const getStatusText = () => {
    if (launchSequence > 0 && launchSequence < 4) {
      return 'PREPARING LAUNCH';
    }
    
    switch (progress.phase) {
      case 'idle': return 'READY';
      case 'ping': return 'T-MINUS';
      case 'download': return 'DOWNLOAD SPEED';
      case 'upload': return 'UPLOAD SPEED';
      case 'complete': return 'MISSION COMPLETE';
      default: 
        // Handle other phases
        if (launchSequence === 5) {
          return 'MISSION COMPLETE';
        } else if (progress.progress >= 95 && !isRunning) {
          return 'MISSION COMPLETE';
        }
        return String(progress.phase).toUpperCase();
    }
  };
  
  // Format the speed value
  const formattedSpeed = formatSpeed(
    progress.currentSpeed > 0 ? progress.currentSpeed : currentSpeed
  );
  
  // Check if we should display the speed value
  const shouldShowSpeed = progress.phase === 'download' || progress.phase === 'upload';

  return (
    <div className="w-full aspect-square max-w-[500px] mx-auto my-8 relative">
      {/* Persistent notification icon */}
      {notificationDismissed && (
        <div className="absolute -top-10 right-0 z-30">
          <button
            onClick={handleReopenNotification}
            className="p-2 rounded-full transition-all bg-black/50 backdrop-blur-md hover:bg-black/70"
            style={{
              border: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.5)`,
              boxShadow: `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.3)`
            }}
            aria-label="Show speed test information"
          >
            <Info size={18} color="white" />
          </button>
        </div>
      )}
      
      {/* Full notification message */}
      {showNotification && (
        <div className="absolute -top-20 left-0 right-0 z-30">
          <div 
            className="relative flex items-center p-4 rounded-lg backdrop-blur-md transition-all"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              border: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.7)`,
              boxShadow: `0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.4), 
                          0 0 30px rgba(${currentThemeColors.primaryRGB}, 0.2)`
            }}
          >
            <AlertCircle 
              className="flex-shrink-0 mr-3"
              size={24} 
              style={{ color: currentThemeColors.primary }} 
            />
            <div className="flex-1 text-sm text-gray-200">
              To test the speed of a network, it runs locally. On Netlify, it checks connection speed 
              from your device to the server, not your actual internet speed. 
              so clone & run it locally.
            </div>
            <button 
              onClick={handleCloseNotification}
              className="p-1 ml-3 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Close notification"
            >
              <X size={18} style={{ color: currentThemeColors.primary }} />
            </button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Launch pad elements */}
        {launchSequence > 0 && launchSequence <= 3 && (
          <div 
            className="absolute" 
            style={{ 
              bottom: '26%',
              left: '45%',
              width: '10%',
              height: '3px',
              background: `rgba(${currentThemeColors.primaryRGB}, 0.6)`,
              boxShadow: `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.4)`
            }}
          />
        )}
        
        {/* Progress Arc - visual indicator */}
        <div className="relative w-[85%] aspect-square">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={`rgba(${currentThemeColors.primaryRGB}, 0.7)`} />
                <stop offset="50%" stopColor={currentThemeColors.primary} />
                <stop offset="100%" stopColor={`rgba(${currentThemeColors.primaryRGB}, 0.7)`} />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Background track */}
            <path
              d="M 30,100 A 70,70 0 1,1 170,100"
              stroke="rgba(40, 40, 40, 0.6)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={launchSequence >= 4 ? "6,6" : "0,0"}
            />
            
            {/* Progress track - with animation dependent on visualProgress */}
            <path
              d="M 30,100 A 70,70 0 1,1 170,100"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="220"
              strokeDashoffset={220 - (220 * (launchSequence === 5 ? 100 : visualProgress) / 100)}
              filter="url(#glow)"
              className={launchSequence === 5 ? 'animate-pulse' : ''}
            />
            
            {/* Center speed display */}
            <foreignObject x="25" y="60" width="150" height="80">
              <div className="h-full flex flex-col items-center justify-center">
                {shouldShowSpeed && launchSequence >= 4 && (
                  <div className="text-center">
                    <p 
                      className="text-4xl font-bold"
                      style={{ 
                        color: currentThemeColors.primary, 
                        textShadow: `0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.8)`
                      }}
                    >
                      {formattedSpeed}
                    </p>
                  </div>
                )}
              </div>
            </foreignObject>
          </svg>
        </div>
        
        {/* Status badge */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div 
            className={`px-8 py-2 rounded-sm transition-all duration-300 ${
              isRunning || launchSequence === 5 ? "scale-105" : "scale-100"
            }`}
            style={{ 
              background: 'rgba(10, 10, 10, 0.9)',
              borderTop: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.7)`,
              borderBottom: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.7)`,
              boxShadow: isRunning || launchSequence === 5
                ? `0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.7), 0 0 30px rgba(${currentThemeColors.primaryRGB}, 0.4)` 
                : `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.3)`,
              animation: launchSequence === 5 ? 'pulse 2s infinite' : 'none'
            }}
          >
            <span 
              className="font-bold tracking-widest text-sm"
              style={{ 
                color: currentThemeColors.primary, 
                textShadow: `0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.7)`
              }}
            >
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Rocket Component */}
      <Rocket 
        launchSequence={launchSequence}
        visualProgress={visualProgress}
        particleIntensity={particleIntensity}
        testCompleteTime={testCompleteTimeRef.current}
      />
    </div>
  );
}