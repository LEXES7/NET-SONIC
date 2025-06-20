'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TestProgress } from '@/lib/types';
import { formatSpeed } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext'; // Add this import

interface SpeedGaugeProps {
  isRunning: boolean;
  progress: TestProgress;
  currentSpeed: number;
}

export default function SpeedGauge({ isRunning, progress, currentSpeed }: SpeedGaugeProps) {
  // Use theme context for dynamic colors
  const { currentThemeColors } = useTheme();

  // Track both visual progress and actual progress separately
  const [visualProgress, setVisualProgress] = useState(0);
  const gaugeAnimationRef = useRef<number>(0);
  
  // Effect for initial animation when test starts
  useEffect(() => {
    if (isRunning && progress.phase !== 'idle' && visualProgress === 0) {
      // Animate the gauge needle from 0 to initial position
      let startValue = 0;
      const targetValue = progress.phase === 'ping' ? 10 : 8;
      const animateGauge = () => {
        startValue += 1;
        setVisualProgress(startValue);
        if (startValue < targetValue) {
          gaugeAnimationRef.current = requestAnimationFrame(animateGauge);
        }
      };
      gaugeAnimationRef.current = requestAnimationFrame(animateGauge);
      
      return () => {
        cancelAnimationFrame(gaugeAnimationRef.current);
      };
    }
  }, [isRunning, progress.phase]);
  
  // Update visual progress with smooth animation
  useEffect(() => {
    // If test is running, ensure minimum progress values
    if (isRunning && progress.phase !== 'idle') {
      // Set minimum progress values based on phase
      if (progress.phase === 'ping' && progress.progress < 10) {
        setVisualProgress(10);
      } else if (progress.phase === 'download' && progress.progress < 8) {
        setVisualProgress(8);
      } else if (progress.phase === 'upload' && progress.progress < 8) {
        setVisualProgress(8);
      } else if (progress.progress > visualProgress) {
        // Only update when progress increases
        setVisualProgress(progress.progress);
      }
    } else if (progress.phase === 'complete') {
      // Animate to 100% on completion
      let startValue = visualProgress;
      const animateToComplete = () => {
        startValue += (100 - startValue) * 0.1;
        if (startValue > 99.5) startValue = 100;
        setVisualProgress(startValue);
        if (startValue < 100) {
          gaugeAnimationRef.current = requestAnimationFrame(animateToComplete);
        }
      };
      gaugeAnimationRef.current = requestAnimationFrame(animateToComplete);
    } else if (!isRunning && progress.phase === 'idle') {
      setVisualProgress(0);
    }
    
    return () => {
      cancelAnimationFrame(gaugeAnimationRef.current);
    };
  }, [isRunning, progress, visualProgress]);
  
  // Formatted percentage for display
  const progressPercentage = Math.round(visualProgress);
  
  // Determine if we should show speed or completion symbol
  const showCompletionSymbol = progress.phase === 'complete';
  const showSpeed = isRunning && progress.phase !== 'idle';
  
  // Use the progress's current speed if available, otherwise use the prop
  const effectiveSpeed = progress.currentSpeed > 0 ? progress.currentSpeed : currentSpeed;
      
  // More descriptive status text based on phase
  const getStatusText = (phase: TestProgress['phase']): string => {
    switch (phase) {
      case 'idle':
        return 'READY';
      case 'ping':
        return 'LATENCY';
      case 'download':
        return 'DOWNLOAD';
      case 'upload':
        return 'UPLOAD';
      case 'complete':
        return 'COMPLETE';
      default:
        const phaseString = String(phase);
        return phaseString.toUpperCase();
    }
  };

  const statusText = getStatusText(progress.phase);
  
  // Calculate the needle rotation angle
  const needleRotation = (visualProgress * 180 / 100) - 90;

  // Generate tick marks for the speedometer
  const tickMarks = [];
  
  // Create major ticks and labels first (0, 25, 50, 75, 100)
  for (let i = 0; i <= 4; i++) {
    const rotation = (i * 45) - 90; // 0, 45, 90, 135, 180 degrees
    const value = i * 25; // 0, 25, 50, 75, 100
    
    // Major tick marks - starting further out from center
    tickMarks.push(
      <line 
        key={`major-tick-${i}`}
        x1="50"
        y1="20"  // Start further from center
        x2="50"
        y2="30" // End at position 30
        stroke={currentThemeColors.primary}
        strokeWidth="2"
        transform={`rotate(${rotation}, 50, 50)`}
      />
    );
    
    // Labels for major ticks - moved inward to avoid the arc
    const labelRadius = 33; // Positioned MORE inward
    const labelAngle = (rotation * Math.PI) / 180;
    const labelX = 50 + labelRadius * Math.cos(labelAngle);
    const labelY = 50 + labelRadius * Math.sin(labelAngle);
    
    tickMarks.push(
      <text
        key={`label-${i}`}
        x={labelX}
        y={labelY}
        fill={currentThemeColors.primary}
        fontSize="5"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        {value}
      </text>
    );
  }
  
  // Then add minor ticks - but make them shorter
  for (let i = 1; i <= 8; i++) {
    if (i % 2 !== 0) { // Only add minor ticks (skipping positions where major ticks are)
      const rotation = (i * 22.5) - 90; // Position between major ticks
      
      tickMarks.push(
        <line 
          key={`minor-tick-${i}`}
          x1="50"
          y1="20" // Start at same position as major ticks
          x2="50"
          y2="26" // End shorter than major ticks
          stroke={`rgba(${currentThemeColors.primaryRGB}, 0.4)`}
          strokeWidth="1"
          transform={`rotate(${rotation}, 50, 50)`}
        />
      );
    }
  }

  return (
    <div className="relative w-[500px] h-[400px] mx-auto my-6 mb-16 flex flex-col items-center">
      {/* Main gauge container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Background circle */}
          <div className="absolute w-[400px] h-[400px] rounded-full"
               style={{ 
                 background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)',
                 boxShadow: `0 0 20px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.15)`
               }}>
          </div>
          
          {/* Gauge SVG */}
          <svg className="absolute w-[400px] h-[400px]" viewBox="0 0 100 100">
            {/* Outer decorative circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="48" 
              fill="none" 
              stroke={`rgba(${currentThemeColors.primaryRGB}, 0.15)`}
              strokeWidth="0.5"
            />
            
            {/* Background track for the gauge - MOVED OUTWARD */}
            <path
              d="M 5,50 A 45,45 0 1,1 95,50"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Progress arc - MOVED OUTWARD */}
            <path
              d="M 5,50 A 45,45 0 1,1 95,50"
              stroke={currentThemeColors.primary}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="141.4"  // Updated for larger arc (2*π*45*0.5)
              strokeDashoffset={141.4 - (141.4 * visualProgress / 100)}
              className="transition-all duration-300 ease-out"
              style={{ filter: `drop-shadow(0 0 3px rgba(${currentThemeColors.primaryRGB}, 0.7))` }}
            />
            
            {/* Tick marks */}
            {tickMarks}
            
            {/* Gauge needle */}
            <g 
              style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: 'center' }}
              className="transition-transform duration-700 ease-out"
            >
              <line 
                x1="50" 
                y1="50" 
                x2="50" 
                y2="20" // Match the start of tick marks
                stroke={currentThemeColors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 3px ${currentThemeColors.primary})` }} 
              />
              <circle cx="50" cy="50" r="4" fill="#292929" stroke={currentThemeColors.primary} strokeWidth="1.5" />
            </g>
            
            {/* Middle circle */}
            <circle cx="50" cy="50" r="15" fill="none" stroke={`rgba(${currentThemeColors.primaryRGB}, 0.3)`} strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      
      {/* Status badge - Neon style */}
      <div 
        className="mt-4 relative"
        style={{ 
          padding: '8px 30px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: `2px solid ${currentThemeColors.primary}`,
          boxShadow: `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.5), 0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.3), inset 0 0 8px rgba(${currentThemeColors.primaryRGB}, 0.3)`,
          borderRadius: '3px',
          animation: progress.phase !== 'idle' ? 'neonPulse 1.5s infinite alternate' : 'none'
        }}
      >
        <style jsx>{`
          @keyframes neonPulse {
            from {
              box-shadow: 0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.5), 0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.3), inset 0 0 8px rgba(${currentThemeColors.primaryRGB}, 0.3);
            }
            to {
              box-shadow: 0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.7), 0 0 30px rgba(${currentThemeColors.primaryRGB}, 0.5), inset 0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.4);
            }
          }
        `}</style>
        <span 
          className="text-base font-bold tracking-widest"
          style={{ 
            color: currentThemeColors.primary, 
            textShadow: `0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.7), 0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.5)`,
            fontFamily: "'Courier New', monospace",
            letterSpacing: '0.15em'
          }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}