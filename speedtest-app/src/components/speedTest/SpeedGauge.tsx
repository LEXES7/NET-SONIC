'use client';

import React, { useEffect, useState, useRef } from 'react';
import { TestProgress } from '@/lib/types';
import { formatSpeed } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface SpeedGaugeProps {
  isRunning: boolean;
  progress: TestProgress;
  currentSpeed: number;
}

export default function SpeedGauge({ isRunning, progress, currentSpeed }: SpeedGaugeProps) {
  const { currentThemeColors } = useTheme();
  
  // Animation states
  const [visualProgress, setVisualProgress] = useState(0);
  const [particleIntensity, setParticleIntensity] = useState(0);
  const [launchSequence, setLaunchSequence] = useState(0); // 0: pre-launch, 1-3: countdown, 4: launched
  
  // Animation timing config - IMPORTANT
  const testDuration = 15000; // Total animation duration in ms (15 seconds)
  const startTimeRef = useRef<number>(0);
  
  // Animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rocketAnimationRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  
  // Effect for launch sequence when test begins
  useEffect(() => {
    if (isRunning && progress.phase !== 'idle' && launchSequence === 0) {
      console.log("Starting launch sequence");
      
      // Start launch sequence
      setLaunchSequence(1);
      setTimeout(() => setLaunchSequence(2), 1000);
      setTimeout(() => setLaunchSequence(3), 2000);
      setTimeout(() => {
        setLaunchSequence(4); // Rocket launches
        startTimeRef.current = Date.now(); // Record start time for animation
        console.log("Rocket launched, starting animation");
      }, 3000);
    } else if (!isRunning && progress.phase === 'idle') {
      // Reset everything when not running
      setLaunchSequence(0);
      setVisualProgress(0);
      setParticleIntensity(0);
      console.log("Reset animation");
    }
  }, [isRunning, progress.phase]);
  
  // Time-based animation effect
  useEffect(() => {
    // Skip if not launched
    if (launchSequence < 4) return;
    
    let animationFrameId: number;
    
    const animateProgress = () => {
      // Fix the type error by checking for test completion without directly comparing to 'complete'
      const isTestFinishing = 
        // Test is complete per UI state (upload finished with progress at/near 100%)
        (progress.phase === 'upload' && progress.progress >= 99) || 
        // Or explicitly not running anymore
        (!isRunning && progress.phase !== 'idle');
      
      if (isTestFinishing) {
        setVisualProgress(100);
        return;
      }
      
      if (!isRunning) {
        // Don't update if not running anymore
        return;
      }
      
      // Calculate progress based on elapsed time
      const elapsed = Date.now() - startTimeRef.current;
      const timeProgress = Math.min(100, (elapsed / testDuration) * 100);
      
      // Update visual progress
      setVisualProgress(timeProgress);
      
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
  
  // Update particle intensity based on speed
  useEffect(() => {
    if (isRunning && (progress.phase === 'download' || progress.phase === 'upload')) {
      const speed = progress.currentSpeed > 0 ? progress.currentSpeed : currentSpeed;
      const intensity = Math.min(100, speed / 10); // More intense particles
      setParticleIntensity(intensity);
    } else if (!isRunning || progress.phase === 'idle') {
      setParticleIntensity(0);
    }
  }, [isRunning, progress.phase, progress.currentSpeed, currentSpeed]);
  
  // Force progress to 100% when test finishes
  useEffect(() => {
    // Instead of checking for 'complete', check for when the test finishes
    const isTestFinishing = 
      (progress.phase === 'upload' && progress.progress >= 99) || 
      (!isRunning && progress.phase !== 'idle');
      
    if (isTestFinishing) {
      setVisualProgress(100);
    }
  }, [progress.phase, progress.progress, isRunning]);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    // Call once to initialize
    resizeCanvas();
    
    // Listen for resize events
    window.addEventListener('resize', resizeCanvas);
    
    // Convert theme color to RGB array
    const primaryRGB = currentThemeColors.primaryRGB.split(',').map(c => parseInt(c.trim()));
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      life: number;
      maxLife: number;
      
      constructor(canvas: HTMLCanvasElement, isExhaust = false) {
        if (isExhaust && launchSequence >= 4) {
          // Rocket exhaust particles when launched
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = canvas.height * 0.35;
          
          // Calculate rocket position based on progress
          const progressAngle = (visualProgress / 100) * Math.PI;
          const currentRocketX = centerX;
          const currentRocketY = centerY + radius * Math.sin(progressAngle * 0.9);
          
          this.x = currentRocketX + (Math.random() - 0.5) * 10;
          this.y = currentRocketY + 12 + Math.random() * 5;
          
          this.size = Math.random() * 4 + 2;
          
          // Exhaust particles move in direction opposite to rocket travel
          const exhaustAngle = Math.PI/2 + progressAngle * 0.9;
          const exhaustSpeed = 1 + Math.random() * 3 * (particleIntensity / 20);
          
          this.speedX = Math.cos(exhaustAngle) * exhaustSpeed + (Math.random() - 0.5) * 2;
          this.speedY = Math.sin(exhaustAngle) * exhaustSpeed + (Math.random() - 0.5) * 2;
          
          this.opacity = Math.random() * 0.7 + 0.3;
          this.maxLife = 10 + Math.random() * 20;
          this.life = 0;
        } else {
          // Regular arc particles
          const angle = Math.random() * (visualProgress / 100) * Math.PI;
          const radius = canvas.height * 0.35;
          
          this.x = canvas.width / 2 + radius * Math.cos(angle);
          this.y = canvas.height / 2 + radius * Math.sin(angle);
          
          this.size = Math.random() * 3 + 1;
          
          // Calculate direction perpendicular to the arc
          const perpAngle = angle + Math.PI / 2;
          const speedMultiplier = particleIntensity / 20;
          
          this.speedX = Math.cos(perpAngle) * (Math.random() * 2 + 1) * speedMultiplier;
          this.speedY = Math.sin(perpAngle) * (Math.random() * 2 + 1) * speedMultiplier;
          
          this.opacity = Math.random() * 0.5 + 0.3;
          this.maxLife = 20 + Math.random() * 40;
          this.life = 0;
        }
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        
        // Fade out near end of life
        if (this.life > this.maxLife * 0.7) {
          this.opacity -= 0.02;
          if (this.opacity < 0) this.opacity = 0;
        }
        
        return this.life < this.maxLife;
      }
      
      draw(ctx: CanvasRenderingContext2D, primaryRGB: number[]) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Create yellow/orange gradient for exhaust particles
        if (this.life < 5) {
          ctx.fillStyle = `rgba(255, 180, 50, ${this.opacity})`;
        } else {
          ctx.fillStyle = `rgba(${primaryRGB[0]}, ${primaryRGB[1]}, ${primaryRGB[2]}, ${this.opacity})`;
        }
        
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${primaryRGB[0]}, ${primaryRGB[1]}, ${primaryRGB[2]}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    // Initialize particles array if needed
    if (!particlesRef.current) {
      particlesRef.current = [];
    }
    
    // Animation function
    const animate = () => {
      // Clear canvas with a transparent fill to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Check if test is active for particle creation
      const isActiveTest = isRunning && progress.phase !== 'idle';
      
      // Add new particles based on intensity and state
      if (isActiveTest) {
        // Add arc particles
        const particlesToAdd = Math.floor(particleIntensity / 5);
        for (let i = 0; i < particlesToAdd; i++) {
          if (Math.random() < 0.3) { // Throttle particle creation
            particlesRef.current.push(new Particle(canvas));
          }
        }
        
        // Add exhaust particles if rocket has launched
        if (launchSequence >= 4) {
          const exhaustRate = Math.floor(particleIntensity / 3);
          for (let i = 0; i < exhaustRate; i++) {
            particlesRef.current.push(new Particle(canvas, true));
          }
        }
      }
      
      // Update and draw existing particles
      particlesRef.current = particlesRef.current.filter(particle => {
        const alive = particle.update();
        if (alive) particle.draw(ctx, primaryRGB);
        return alive;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isRunning, particleIntensity, progress.phase, visualProgress, currentThemeColors.primaryRGB, launchSequence]);

  // Rocket animation
  useEffect(() => {
    const canvas = rocketCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // RGB color values
    const primaryRGB = currentThemeColors.primaryRGB.split(',').map(c => parseInt(c.trim()));
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (launchSequence > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.height * 0.35;
        const angle = -Math.PI / 2; // Bottom of circle (270 degrees)
        const rocketPosX = centerX;
        
        // Calculate rocket position based on launch sequence
        let rocketPosY;
        let rocketRotation = 0;
        let rocketScale;
        
        if (launchSequence >= 4) {
          // Rocket is moving along the gauge based on animation progress
          const progressAngle = (visualProgress / 100) * Math.PI;
          rocketPosY = centerY + radius * Math.sin(progressAngle * 0.9);
          rocketRotation = progressAngle * 0.5; // Rotate rocket as it moves
          rocketScale = 0.8;
        } else {
          // Rocket is at starting position
          rocketPosY = centerY + radius * 0.8;
          rocketScale = 1;
        }
        
        // Draw rocket
        ctx.save();
        ctx.translate(rocketPosX, rocketPosY);
        
        // Add rotation based on progress
        if (launchSequence >= 4) {
          ctx.rotate(rocketRotation);
        }
        
        // Add vibration during countdown
        if (launchSequence < 4 && launchSequence > 0) {
          const vibration = Math.random() * 0.5;
          ctx.translate(Math.sin(Date.now() / 30) * vibration, Math.cos(Date.now() / 20) * vibration);
        }
        
        // Scale the rocket
        ctx.scale(rocketScale, rocketScale);
        
        // Rocket body
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(8, 0);
        ctx.lineTo(8, 15);
        ctx.lineTo(-8, 15);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fillStyle = currentThemeColors.primary;
        ctx.fill();
        
        // Rocket nose
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(8, 0);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(${primaryRGB[0]}, ${primaryRGB[1]}, ${primaryRGB[2]}, 0.8)`;
        ctx.fill();
        
        // Window
        ctx.beginPath();
        ctx.arc(0, -5, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Fins
        ctx.beginPath();
        ctx.moveTo(8, 5);
        ctx.lineTo(14, 15);
        ctx.lineTo(8, 15);
        ctx.closePath();
        ctx.fillStyle = `rgba(${primaryRGB[0]}, ${primaryRGB[1]}, ${primaryRGB[2]}, 0.9)`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(-8, 5);
        ctx.lineTo(-14, 15);
        ctx.lineTo(-8, 15);
        ctx.closePath();
        ctx.fillStyle = `rgba(${primaryRGB[0]}, ${primaryRGB[1]}, ${primaryRGB[2]}, 0.9)`;
        ctx.fill();
        
        // Exhaust flame when launched
        if (launchSequence >= 4) {
          ctx.beginPath();
          const flameHeight = 10 + (Math.sin(Date.now() / 100) + 1) * 5;
          
          ctx.moveTo(-6, 15);
          ctx.quadraticCurveTo(-3, 15 + flameHeight * 0.7, 0, 15 + flameHeight);
          ctx.quadraticCurveTo(3, 15 + flameHeight * 0.7, 6, 15);
          
          // Create gradient
          const gradient = ctx.createLinearGradient(0, 15, 0, 15 + flameHeight);
          gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
          gradient.addColorStop(0.3, 'rgba(255, 150, 20, 0.8)');
          gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        
        ctx.restore();
        
        // Draw countdown text
        if (launchSequence > 0 && launchSequence < 4) {
          ctx.font = 'bold 32px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = currentThemeColors.primary;
          ctx.fillText(String(4 - launchSequence), centerX, centerY - 20);
          
          // Add launch text
          ctx.font = 'bold 14px Arial, sans-serif';
          ctx.fillText(launchSequence === 3 ? "LAUNCHING" : "COUNTDOWN", centerX, centerY + 20);
        }
      }
      
      rocketAnimationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(rocketAnimationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [launchSequence, visualProgress, currentThemeColors]);

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
      default: 
        // Handle other phases without explicit comparison to 'complete'
        if (progress.progress >= 99 && !isRunning) {
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
      {/* Particle effect canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-10"
      />
      
      {/* Rocket canvas */}
      <canvas 
        ref={rocketCanvasRef}
        className="absolute inset-0 w-full h-full z-30"
      />
      
      {/* Background elements */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        <div className="w-[70%] aspect-square rounded-full"
             style={{ 
               background: 'radial-gradient(circle, rgba(20, 20, 20, 0.7) 0%, rgba(0, 0, 0, 0.9) 90%)',
               boxShadow: `0 0 30px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.1)`
             }}>
        </div>
      </div>
      
      {/* Main content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        {/* Launch pad elements */}
        {launchSequence > 0 && (
          <div 
            className="absolute" 
            style={{ 
              bottom: '28%',
              left: '45%',
              width: '10%',
              height: '3px',
              background: `rgba(${currentThemeColors.primaryRGB}, 0.6)`,
              boxShadow: `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.4)`
            }}
          />
        )}
        
        {/* Progress Arc */}
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
            
            {/* Background track - make it look like a launch trajectory */}
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
              strokeDashoffset={220 - (220 * visualProgress / 100)}
              filter="url(#glow)"
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
              isRunning ? "scale-105" : "scale-100"
            }`}
            style={{ 
              background: 'rgba(10, 10, 10, 0.9)',
              borderTop: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.7)`,
              borderBottom: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.7)`,
              boxShadow: isRunning 
                ? `0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.7), 0 0 30px rgba(${currentThemeColors.primaryRGB}, 0.4)` 
                : `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.3)`
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
    </div>
  );
}