'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface RocketProps {
  launchSequence: number; // 0: pre-launch, 1-3: countdown, 4: launched, 5: orbiting
  visualProgress: number; // 0-100 progress of the test
  particleIntensity: number; // Intensity of particles (0-100)
  testCompleteTime: number; // Timestamp when test completed (for orbit calculations)
}

export default function Rocket({ 
  launchSequence, 
  visualProgress, 
  particleIntensity,
  testCompleteTime 
}: RocketProps) {
  const { currentThemeColors } = useTheme();
  
  // Animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flameCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const flameAnimationRef = useRef<number>(0);
  const particlesAnimationRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  const smokeParticlesRef = useRef<any[]>([]);
  
  // Keep track of previous position for calculating direction
  const prevPositionRef = useRef<{x: number, y: number} | null>(null);

  // Calculate rocket position based on progress and phase
  const calculateRocketPosition = (
    canvasWidth: number,
    canvasHeight: number,
    progress: number,
    launchPhase: number
  ): { x: number; y: number; angle: number; scale: number } => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const gaugeRadius = canvasHeight * 0.35;
    const outerOrbitRadius = canvasHeight * 0.45; // Larger radius for outer orbit
    
    // Default position (at launch pad)
    let posX = centerX;
    let posY = centerY + gaugeRadius * 0.9;
    let rotationAngle = -Math.PI/2; // Default angle: point up
    
    // Calculate rocket scale based on phase
    let rocketScale: number;
    if (launchPhase === 5) {
      // Slight pulsing in orbit mode
      const pulseScale = 1 + Math.sin(Date.now() / 500) * 0.05;
      rocketScale = 0.7 * pulseScale;
    } else if (launchPhase === 4 && progress < 5) {
      // Initially larger during liftoff for dramatic effect
      rocketScale = 0.95;
    } else if (launchPhase === 4) {
      // Regular flight scale
      rocketScale = 0.85;
    } else {
      // Pre-launch scale
      rocketScale = 1.0;
    }
    
    if (launchPhase === 5) {
      // Orbital mode: rocket circles around the outside of the gauge
      const orbitTime = Date.now() - testCompleteTime;
      const orbitAngle = (orbitTime / 7000) % (2 * Math.PI); // Complete orbit every 7 seconds
      
      // Calculate position on the orbit
      posX = centerX + outerOrbitRadius * Math.cos(orbitAngle);
      posY = centerY + outerOrbitRadius * Math.sin(orbitAngle);
      
      // Calculate tangent direction at this point of the orbit
      // The tangent is perpendicular to the radius vector, so add π/2
      rotationAngle = orbitAngle + Math.PI / 2;
    } else if (launchPhase === 4) {
      // Calculate position on the semicircular path (modified for semicircle path)
      // Convert progress (0-100) to angle in radians for a semicircle (0 to π)
      // Semicircle starts at bottom (π/2) and ends at bottom (3π/2)
      const pathProgress = progress / 100;
      
      // Scale from 0-1 to π/2 to 3π/2 (bottom to bottom) for semicircle
      const pathAngle = Math.PI / 2 + pathProgress * Math.PI;
      
      // Position on semicircular path
      posX = centerX + gaugeRadius * Math.cos(pathAngle);
      posY = centerY + gaugeRadius * Math.sin(pathAngle);
      
      // Calculate the tangent angle to the path at this point
      // For a circle, the tangent is perpendicular to the radius vector
      rotationAngle = pathAngle + Math.PI / 2;
      
      // Adjust for initial phase - vertical liftoff
      if (progress < 5) {
        // Override position for initial vertical liftoff
        const liftProgress = progress / 5;
        posY = centerY + gaugeRadius * 0.9 - liftProgress * gaugeRadius * 0.4;
        posX = centerX;
        
        // Point straight up during liftoff
        rotationAngle = -Math.PI/2;
      }
    }
    
    return { x: posX, y: posY, angle: rotationAngle, scale: rocketScale };
  };

  // Rocket animation
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
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // RGB color values
    const primaryRGB = currentThemeColors.primaryRGB.split(',').map(c => parseInt(c.trim()));
    const safeRGB: [number, number, number] = [
      primaryRGB[0] || 100,
      primaryRGB[1] || 100,
      primaryRGB[2] || 255
    ];
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (launchSequence > 0) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const gaugeRadius = canvas.height * 0.35;
        const outerOrbitRadius = canvas.height * 0.45; // Outer orbit radius
        
        // Calculate rocket position based on phase
        let rocketPos: {x: number; y: number; angle: number; scale: number};
        
        if (launchSequence === 5) {
          // Draw orbit path - slightly larger than gauge
          ctx.beginPath();
          ctx.arc(centerX, centerY, outerOrbitRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${safeRGB[0]}, ${safeRGB[1]}, ${safeRGB[2]}, 0.2)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Get rocket position
        rocketPos = calculateRocketPosition(canvas.width, canvas.height, visualProgress, launchSequence);
        
        // Save current position for next frame
        prevPositionRef.current = { x: rocketPos.x, y: rocketPos.y };
        
        // Draw launch platform during pre-launch
        if (launchSequence >= 1 && launchSequence <= 3) {
          // Launch platform base
          ctx.beginPath();
          ctx.rect(centerX - 20, centerY + gaugeRadius * 0.9 + 15, 40, 5);
          ctx.fillStyle = `rgba(80, 80, 80, 0.8)`;
          ctx.fill();
          
          // Support struts
          ctx.beginPath();
          ctx.moveTo(centerX - 15, centerY + gaugeRadius * 0.9 + 20);
          ctx.lineTo(centerX - 25, centerY + gaugeRadius * 0.9 + 30);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(centerX + 15, centerY + gaugeRadius * 0.9 + 20);
          ctx.lineTo(centerX + 25, centerY + gaugeRadius * 0.9 + 30);
          ctx.stroke();
        }
        
        // Draw rocket
        ctx.save();
        ctx.translate(rocketPos.x, rocketPos.y);
        
        // Add rotation based on position
        ctx.rotate(rocketPos.angle);
        
        // Add vibration during countdown or at liftoff
        if (launchSequence === 3 || (launchSequence === 4 && visualProgress < 5)) {
          const vibrationIntensity = launchSequence === 4 ? 2 : 0.8;
          ctx.translate(
            Math.sin(Date.now() / 40) * vibrationIntensity * Math.random(), 
            Math.cos(Date.now() / 30) * vibrationIntensity * Math.random()
          );
        }
        
        ctx.scale(rocketPos.scale, rocketPos.scale);
        
        // Draw horizontal rocket
        // Rocket body
        ctx.beginPath();
        ctx.moveTo(20, 0);   // Nose tip (front/right)
        ctx.lineTo(0, -8);   // Top side
        ctx.lineTo(-15, -8); // Top back
        ctx.lineTo(-15, 8);  // Bottom back
        ctx.lineTo(0, 8);    // Bottom side
        ctx.closePath();
        
        // Add gradient to rocket body for depth
        const bodyGradient = ctx.createLinearGradient(0, -8, 0, 8);
        bodyGradient.addColorStop(0, currentThemeColors.primary);
        bodyGradient.addColorStop(0.5, `rgba(${safeRGB[0]}, ${safeRGB[1]}, ${safeRGB[2]}, 1.0)`);
        bodyGradient.addColorStop(1, `rgba(${safeRGB[0] * 0.8}, ${safeRGB[1] * 0.8}, ${safeRGB[2] * 0.8}, 1.0)`);
        
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        
        // Add a subtle outline
        ctx.strokeStyle = `rgba(${safeRGB[0] * 1.2}, ${safeRGB[1] * 1.2}, ${safeRGB[2] * 1.2}, 0.8)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Rocket nose
        ctx.beginPath();
        ctx.moveTo(20, 0);   // Tip
        ctx.lineTo(0, -8);   // Top back
        ctx.lineTo(0, 8);    // Bottom back
        ctx.closePath();
        
        const noseGradient = ctx.createLinearGradient(10, -8, 10, 8);
        noseGradient.addColorStop(0, `rgba(${safeRGB[0] * 0.8}, ${safeRGB[1] * 0.8}, ${safeRGB[2] * 0.8}, 1.0)`);
        noseGradient.addColorStop(0.5, `rgba(${safeRGB[0] * 1.2}, ${safeRGB[1] * 1.2}, ${safeRGB[2] * 1.2}, 1.0)`);
        noseGradient.addColorStop(1, `rgba(${safeRGB[0] * 0.8}, ${safeRGB[1] * 0.8}, ${safeRGB[2] * 0.8}, 1.0)`);
        
        ctx.fillStyle = noseGradient;
        ctx.fill();
        ctx.stroke();
        
        // Window
        ctx.beginPath();
        ctx.arc(5, 0, 3, 0, Math.PI * 2);
        
        // Add reflection to window
        const windowGradient = ctx.createRadialGradient(5, 0, 0, 5, 0, 3);
        windowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        windowGradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.85)');
        windowGradient.addColorStop(1, 'rgba(150, 200, 255, 0.75)');
        
        ctx.fillStyle = windowGradient;
        ctx.fill();
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.6)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Add subtle window highlight for depth
        ctx.beginPath();
        ctx.arc(6, -1, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        // Fins - top and bottom fins
        ctx.beginPath();
        ctx.moveTo(-5, -8);
        ctx.lineTo(-15, -14);
        ctx.lineTo(-15, -8);
        ctx.closePath();
        
        const finGradient = ctx.createLinearGradient(-10, -8, -10, -14);
        finGradient.addColorStop(0, `rgba(${safeRGB[0]}, ${safeRGB[1]}, ${safeRGB[2]}, 1.0)`);
        finGradient.addColorStop(1, `rgba(${safeRGB[0] * 1.1}, ${safeRGB[1] * 1.1}, ${safeRGB[2] * 1.1}, 1.0)`);
        
        ctx.fillStyle = finGradient;
        ctx.fill();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-5, 8);
        ctx.lineTo(-15, 14);
        ctx.lineTo(-15, 8);
        ctx.closePath();
        
        const finGradient2 = ctx.createLinearGradient(-10, 8, -10, 14);
        finGradient2.addColorStop(0, `rgba(${safeRGB[0]}, ${safeRGB[1]}, ${safeRGB[2]}, 1.0)`);
        finGradient2.addColorStop(1, `rgba(${safeRGB[0] * 1.1}, ${safeRGB[1] * 1.1}, ${safeRGB[2] * 1.1}, 1.0)`);
        
        ctx.fillStyle = finGradient2;
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        
        // Draw countdown text during launch sequence
        if (launchSequence > 0 && launchSequence < 4) {
          // Countdown number
          ctx.font = 'bold 32px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = currentThemeColors.primary;
          ctx.fillText(String(4 - launchSequence), centerX, centerY - 20);
          
          // Add vibrating effect to countdown number
          if (launchSequence === 3) {
            ctx.fillText(String(4 - launchSequence), centerX + Math.sin(Date.now() / 40) * 1, centerY - 20 + Math.cos(Date.now() / 40) * 1);
          }
          
          // Add launch text
          ctx.font = 'bold 14px Arial, sans-serif';
          ctx.fillText(launchSequence === 3 ? "LAUNCHING" : "COUNTDOWN", centerX, centerY + 20);
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // When unmounting or when dependencies change, reset previous position
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      prevPositionRef.current = null;
    };
  }, [launchSequence, visualProgress, currentThemeColors, testCompleteTime]);

  // Flame animation effect
  useEffect(() => {
    const canvas = flameCanvasRef.current;
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
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (launchSequence >= 4) {
        const rocketPos = calculateRocketPosition(canvas.width, canvas.height, visualProgress, launchSequence);
        
        // Draw flame
        ctx.save();
        ctx.translate(rocketPos.x, rocketPos.y);
        ctx.rotate(rocketPos.angle);
        ctx.scale(rocketPos.scale, rocketPos.scale);
        
        // Add vibration during countdown or at liftoff
        if (launchSequence === 4 && visualProgress < 5) {
          const vibrationIntensity = 2;
          ctx.translate(
            Math.sin(Date.now() / 40) * vibrationIntensity * Math.random(), 
            Math.cos(Date.now() / 30) * vibrationIntensity * Math.random()
          );
        }
        
        // Flame size varies based on phase
        let flameLength, flameWidth;
        
        if (launchSequence === 5) {
          // Gentler, pulsing flame in orbit
          flameLength = 10 + Math.sin(Date.now() / 200) * 3;
          flameWidth = 4 + Math.sin(Date.now() / 300) * 1;
        } else if (visualProgress < 5) {
          // Big initial blast at liftoff
          flameLength = 25 + Math.sin(Date.now() / 50) * 8;
          flameWidth = 8 + Math.sin(Date.now() / 80) * 2;
        } else {
          // Normal flight flame
          flameLength = 15 + Math.sin(Date.now() / 100) * 5;
          flameWidth = 6 + Math.sin(Date.now() / 150) * 1.5;
        }
        
        // Create flame at the back of the rocket (left side now)
        ctx.beginPath();
        
        // Start from back edge of rocket
        ctx.moveTo(-15, -flameWidth);
        
        // Create flame shape with dynamic wavy edge
        const waveFreq = Date.now() / 100;
        
        // Left point of flame (furthest back)
        const flameBackX = -15 - flameLength;
        
        // Draw top side of flame
        ctx.quadraticCurveTo(
          -15 - flameLength * 0.5 + Math.sin(waveFreq) * 3, -flameWidth * 0.7,
          flameBackX + Math.sin(waveFreq + 2) * 5, 0
        );
        
        // Draw bottom side of flame
        ctx.quadraticCurveTo(
          -15 - flameLength * 0.5 + Math.sin(waveFreq + 4) * 3, flameWidth * 0.7,
          -15, flameWidth
        );
        
        // Close the flame shape
        ctx.closePath();
        
        // Create gradient - horizontal for the flame direction
        const gradient = ctx.createLinearGradient(-15, 0, -15 - flameLength, 0);
        
        if (visualProgress < 5 && launchSequence === 4) {
          // More intense colors during liftoff
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.9)');
          gradient.addColorStop(0.4, 'rgba(255, 200, 50, 0.8)');
          gradient.addColorStop(0.7, 'rgba(255, 100, 20, 0.6)');
          gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        } else {
          // Normal flight colors
          gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
          gradient.addColorStop(0.3, 'rgba(255, 150, 20, 0.8)');
          gradient.addColorStop(0.7, 'rgba(255, 80, 10, 0.5)');
          gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add glow effect to flame
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255, 150, 30, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.restore();
      }
      
      flameAnimationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(flameAnimationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [launchSequence, visualProgress, testCompleteTime]);
  
  // Particle effects
  useEffect(() => {
    const canvas = particlesCanvasRef.current;
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
    const safeRGB: [number, number, number] = [
      primaryRGB[0] || 100,
      primaryRGB[1] || 100,
      primaryRGB[2] || 255
    ];
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      life: number;
      maxLife: number;
      type: string;
      color: [number, number, number];
      
      constructor(canvasWidth: number, canvasHeight: number, type = 'normal') {
        this.type = type;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const gaugeRadius = canvasHeight * 0.35;
        
        // Color based on particle type
        if (type === 'exhaust') {
          // Hot exhaust colors: yellow to orange to red
          const colorMix = Math.random();
          if (colorMix > 0.7) {
            this.color = [255, 220, 100]; // Yellow
          } else if (colorMix > 0.3) {
            this.color = [255, 160, 50]; // Orange
          } else {
            this.color = [255, 100, 50]; // Red
          }
        } else if (type === 'smoke') {
          // Smoke colors: gray shades
          const grayValue = 150 + Math.random() * 80;
          this.color = [grayValue, grayValue, grayValue];
        } else if (type === 'spark') {
          // Spark colors: white to theme color
          const sparkMix = Math.random();
          if (sparkMix > 0.5) {
            this.color = [255, 255, 255]; // White
          } else {
            this.color = safeRGB;
          }
        } else {
          // Normal particles use theme color
          this.color = safeRGB;
        }
        
        if (type === 'exhaust' && (launchSequence === 4)) {
          // Only generate exhaust particles during normal flight mode, not in orbit
          // Get rocket position for exhaust
          const rocketPos = calculateRocketPosition(canvasWidth, canvasHeight, visualProgress, launchSequence);
          
          // Position exhaust at the back of the rocket, considering its orientation
          const exhaustOffset = 15 * rocketPos.scale; // Scale the offset with rocket size
          
          // Calculate position at the back of the horizontal rocket based on its current angle
          // For a horizontal rocket, we add PI to the angle to get the back direction
          this.x = rocketPos.x + Math.cos(rocketPos.angle + Math.PI) * exhaustOffset;
          this.y = rocketPos.y + Math.sin(rocketPos.angle + Math.PI) * exhaustOffset;
          
          // Add small random offset for a more natural look
          const spreadFactor = rocketPos.scale * 4;
          this.x += (Math.random() - 0.5) * spreadFactor;
          this.y += (Math.random() - 0.5) * spreadFactor;
          
          this.size = Math.random() * 4 + 3;
          
          // Exhaust particles move in direction opposite to rocket travel
          const exhaustSpeed = 1 + Math.random() * 3 * (particleIntensity / 20);
          
          // Add velocity in the direction opposite to where the rocket points
          this.speedX = Math.cos(rocketPos.angle + Math.PI) * exhaustSpeed + (Math.random() - 0.5);
          this.speedY = Math.sin(rocketPos.angle + Math.PI) * exhaustSpeed + (Math.random() - 0.5);
          
          this.opacity = Math.random() * 0.8 + 0.5;
          this.maxLife = 8 + Math.random() * 12;
          this.life = 0;
        } else if (type === 'rocketFlame' && launchSequence === 5) {
          // Special flame particles for orbit mode - only from the rocket's back, no spread
          const rocketPos = calculateRocketPosition(canvasWidth, canvasHeight, visualProgress, launchSequence);
          
          // Position exactly at the back center of the rocket
          const exhaustOffset = 15 * rocketPos.scale;
          this.x = rocketPos.x + Math.cos(rocketPos.angle + Math.PI) * exhaustOffset;
          this.y = rocketPos.y + Math.sin(rocketPos.angle + Math.PI) * exhaustOffset;
          
          // Very small spread for a clean flame
          const spreadFactor = rocketPos.scale * 2;
          this.x += (Math.random() - 0.5) * spreadFactor;
          this.y += (Math.random() - 0.5) * spreadFactor;
          
          // Smaller size for cleaner look
          this.size = Math.random() * 3 + 2;
          
          // Slower speed for less spread
          const exhaustSpeed = 0.8 + Math.random() * 1.5;
          
          // Add velocity in the direction opposite to where the rocket points
          this.speedX = Math.cos(rocketPos.angle + Math.PI) * exhaustSpeed;
          this.speedY = Math.sin(rocketPos.angle + Math.PI) * exhaustSpeed;
          
          this.opacity = Math.random() * 0.7 + 0.3;
          this.maxLife = 6 + Math.random() * 8;
          this.life = 0;
        } else if (type === 'smoke' && launchSequence >= 1 && launchSequence <= 3) {
          // Pre-ignition smoke particles at the launchpad, centered below the rocket
          this.x = centerX + (Math.random() - 0.5) * 15;
          this.y = centerY + gaugeRadius * 0.9 + 15 + Math.random() * 5; // Just below the launchpad
          
          this.size = Math.random() * 10 + 5;
          
          // Smoke rises slowly and drifts
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.speedY = -Math.random() * 0.7 - 0.3;
          
          this.opacity = Math.random() * 0.4 + 0.1;
          this.maxLife = 40 + Math.random() * 40;
          this.life = 0;
        } else {
          // Default particles (won't be used in orbit mode)
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * gaugeRadius * 0.8;
          
          this.x = centerX + Math.cos(angle) * distance;
          this.y = centerY + Math.sin(angle) * distance;
          
          this.size = Math.random() * 3 + 1;
          
          const speedAngle = Math.random() * Math.PI * 2;
          const speedMagnitude = Math.random() * 0.5 + 0.2;
          
          this.speedX = Math.cos(speedAngle) * speedMagnitude;
          this.speedY = Math.sin(speedAngle) * speedMagnitude;
          
          this.opacity = Math.random() * 0.5 + 0.2;
          this.maxLife = 30 + Math.random() * 20;
          this.life = 0;
        }
      }
      
      update() {
        // Update position
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Apply drag and gravity depending on particle type
        if (this.type === 'smoke') {
          // Smoke slows down and expands
          this.speedX *= 0.99;
          this.speedY *= 0.99;
          this.size += 0.05;
        } else if (this.type === 'exhaust' || this.type === 'rocketFlame') {
          // Exhaust dissipates quickly
          this.size *= 0.97;
        }
        
        // Age particle
        this.life++;
        
        // Fade out near end of life
        if (this.life > this.maxLife * 0.7) {
          this.opacity -= this.type === 'smoke' ? 0.01 : 0.03;
          if (this.opacity < 0) this.opacity = 0;
        }
        
        return this.life < this.maxLife && this.opacity > 0;
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        if (this.opacity <= 0) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        // Use the particle's color
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
        ctx.fill();
        
        // Add glow effect for certain particle types
        if (this.type === 'exhaust' || this.type === 'rocketFlame') {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, 0.5)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
    
    // Initialize particles arrays
    if (!particlesRef.current) {
      particlesRef.current = [];
    }
    
    if (!smokeParticlesRef.current) {
      smokeParticlesRef.current = [];
    }
    
    // Animation function
    const animate = () => {
      // Clear canvas with a fade effect for trails
      // Use more opacity in orbit mode for faster clearing of previous particles
      const fadeOpacity = launchSequence === 5 ? 0.3 : 0.15;
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Pre-launch smoke during countdown - properly positioned at the bottom center of the rocket
      if (launchSequence >= 1 && launchSequence <= 3) {
        // Add smoke particles at the launchpad
        const smokeRate = launchSequence === 1 ? 1 : launchSequence === 2 ? 2 : 3;
        for (let i = 0; i < smokeRate; i++) {
          if (Math.random() < 0.4) {
            smokeParticlesRef.current.push(new Particle(canvas.width, canvas.height, 'smoke'));
          }
        }
      }
      
      // Rocket in flight - add exhaust (but not in orbit mode)
      if (launchSequence === 4) {
        // Exhaust rate based on intensity
        const exhaustRate = Math.floor(particleIntensity / 10) + 1;
        for (let i = 0; i < exhaustRate; i++) {
          particlesRef.current.push(new Particle(canvas.width, canvas.height, 'exhaust'));
        }
      }
      
      // In orbit mode, just add minimal flame particles for thruster effect
      if (launchSequence === 5) {
        // Lower rate for cleaner look
        if (Math.random() < 0.5) {
          particlesRef.current.push(new Particle(canvas.width, canvas.height, 'rocketFlame'));
        }
        
        // Clear any existing particles that aren't flame particles
        particlesRef.current = particlesRef.current.filter(p => p.type === 'rocketFlame');
      }
      
      // Update and draw smoke particles
      smokeParticlesRef.current = smokeParticlesRef.current.filter(particle => {
        const alive = particle.update();
        if (alive) particle.draw(ctx);
        return alive;
      });
      
      // Update and draw regular particles
      particlesRef.current = particlesRef.current.filter(particle => {
        const alive = particle.update();
        if (alive) particle.draw(ctx);
        return alive;
      });
      
      particlesAnimationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(particlesAnimationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [launchSequence, visualProgress, particleIntensity, currentThemeColors.primaryRGB, testCompleteTime]);

  return (
    <div className="absolute inset-0 z-30">
      {/* Background particles layer */}
      <canvas 
        ref={particlesCanvasRef} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Flame layer */}
      <canvas 
        ref={flameCanvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Rocket layer */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}