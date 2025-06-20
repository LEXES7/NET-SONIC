import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Layout/Header";
import "./globals.css";
import Script from "next/script";
import Footer from "@/components/Layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NET SONIC - Network Speed Test",
  description: "Fast and accurate internet speed testing tool",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{
          background: '#080808',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          color: '#f8f8f8',
        }}
      >
        {/* Plexus Background Canvas - make sure it's visible */}
        <canvas 
          id="plexus-background" 
          className="fixed inset-0 z-0 w-full h-full"
          style={{ opacity: 1 }}
        ></canvas>

        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Subtle glow effect on top of plexus */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/3 rounded-full blur-[100px] opacity-20"
               style={{ background: 'radial-gradient(circle, rgba(252, 238, 9, 0.8) 0%, transparent 70%)' }}>
          </div>
        </div>

        <div className="relative z-10">
          <Header />
          <main>
            {children}
          </main>
          <Footer/>

          
        </div>

        {/* Plexus Animation Script - Modified for visibility */}
        <Script id="plexus-script">
          {`
            function initPlexus() {
              // Canvas setup
              const canvas = document.getElementById('plexus-background');
              if (!canvas) {
                console.error('Plexus canvas not found');
                return;
              }
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                console.error('Could not get canvas context');
                return;
              }
              
              // Make canvas full size
              let width = canvas.width = window.innerWidth;
              let height = canvas.height = window.innerHeight;
              
              console.log('Plexus initialized with dimensions:', width, height);
              
              // Mouse tracking
              let mouseX = width / 2;
              let mouseY = height / 2;
              const mouseRadius = 150; // Mouse influence radius
              
              // Particle settings - increased counts for visibility
              const particleCount = width < 768 ? 80 : 150;
              const particles = [];
              const connectionDistance = width < 768 ? 120 : 180;
              const hexRadius = width < 768 ? 60 : 90;
              
              // Colors - increased opacity for visibility
              const particleColor = 'rgba(252, 238, 9, 0.8)';
              const connectionColor = 'rgba(252, 238, 9, 0.3)';
              const hexColor = 'rgba(252, 238, 9, 0.1)';
              const mouseHexColor = 'rgba(252, 238, 9, 0.25)';
              
              // Handle window resize
              window.addEventListener('resize', () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
                console.log('Canvas resized:', width, height);
              });
              
              // Track mouse movement
              window.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
              });
              
              // Particle class
              class Particle {
                constructor() {
                  this.x = Math.random() * width;
                  this.y = Math.random() * height;
                  this.velocityX = (Math.random() - 0.5) * 0.5;
                  this.velocityY = (Math.random() - 0.5) * 0.5;
                  this.size = Math.random() * 2.5 + 1.5; // Slightly larger particles
                  this.connected = false;
                }
                
                update() {
                  // Calculate distance from mouse
                  const dx = mouseX - this.x;
                  const dy = mouseY - this.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  
                  // Add mouse repulsion
                  if (distance < mouseRadius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (mouseRadius - distance) / mouseRadius;
                    this.velocityX -= Math.cos(angle) * force * 0.2;
                    this.velocityY -= Math.sin(angle) * force * 0.2;
                  }
                  
                  // Update position
                  this.x += this.velocityX;
                  this.y += this.velocityY;
                  
                  // Add slight damping to velocity
                  this.velocityX *= 0.99;
                  this.velocityY *= 0.99;
                  
                  // Bounce off edges
                  if (this.x < 0 || this.x > width) this.velocityX *= -1;
                  if (this.y < 0 || this.y > height) this.velocityY *= -1;
                  
                  // Keep particles within bounds
                  this.x = Math.max(0, Math.min(width, this.x));
                  this.y = Math.max(0, Math.min(height, this.y));
                  
                  // Reset connected flag for next frame
                  this.connected = false;
                }
                
                draw() {
                  ctx.fillStyle = particleColor;
                  ctx.beginPath();
                  ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
              
              // Create particles
              for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
              }
              
              // Animation loop
              function animate() {
                ctx.clearRect(0, 0, width, height);
                
                // Update and draw particles
                for (let i = 0; i < particles.length; i++) {
                  particles[i].update();
                  particles[i].draw();
                }
                
                // Draw connections and find potential hexagons
                const hexagons = [];
                
                // Find connections between particles
                for (let i = 0; i < particles.length; i++) {
                  for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance) {
                      particles[i].connected = true;
                      particles[j].connected = true;
                      
                      // Draw connection line with opacity based on distance
                      const opacity = 1 - (distance / connectionDistance);
                      ctx.strokeStyle = \`rgba(252, 238, 9, \${opacity * 0.3})\`;
                      ctx.lineWidth = 0.8;
                      ctx.beginPath();
                      ctx.moveTo(particles[i].x, particles[i].y);
                      ctx.lineTo(particles[j].x, particles[j].y);
                      ctx.stroke();
                      
                      // Find potential hexagons (only check when distances are similar to hexRadius)
                      if (Math.abs(distance - hexRadius) < 25) {
                        for (let k = j + 1; k < particles.length; k++) {
                          // Check if particles i, j, k could form part of a hexagon
                          const dist_ik = Math.sqrt(Math.pow(particles[i].x - particles[k].x, 2) + 
                                                  Math.pow(particles[i].y - particles[k].y, 2));
                          const dist_jk = Math.sqrt(Math.pow(particles[j].x - particles[k].x, 2) + 
                                                  Math.pow(particles[j].y - particles[k].y, 2));
                          
                          if (Math.abs(dist_ik - hexRadius) < 25 && Math.abs(dist_jk - hexRadius) < 25) {
                            hexagons.push([i, j, k]);
                          }
                        }
                      }
                    }
                  }
                }
                
                // Draw hexagons (triangles for performance)
                for (let i = 0; i < hexagons.length; i++) {
                  const [a, b, c] = hexagons[i];
                  
                  // Calculate hexagon center
                  const centerX = (particles[a].x + particles[b].x + particles[c].x) / 3;
                  const centerY = (particles[a].y + particles[b].y + particles[c].y) / 3;
                  
                  // Check if near mouse
                  const dx = mouseX - centerX;
                  const dy = mouseY - centerY;
                  const mouseDistance = Math.sqrt(dx * dx + dy * dy);
                  const isNearMouse = mouseDistance < mouseRadius * 1.5;
                  
                  // Draw the triangle with appropriate color
                  ctx.fillStyle = isNearMouse ? mouseHexColor : hexColor;
                  ctx.beginPath();
                  ctx.moveTo(particles[a].x, particles[a].y);
                  ctx.lineTo(particles[b].x, particles[b].y);
                  ctx.lineTo(particles[c].x, particles[c].y);
                  ctx.closePath();
                  ctx.fill();
                }
                
                requestAnimationFrame(animate);
              }
              
              // Start animation
              animate();
              console.log('Plexus animation started');
            }

            // Try to initialize on page load in multiple ways to ensure it runs
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              setTimeout(initPlexus, 1000);
            } else {
              document.addEventListener('DOMContentLoaded', () => setTimeout(initPlexus, 1000));
            }
            window.addEventListener('load', () => setTimeout(initPlexus, 1000));
          `}
        </Script>
      </body>
    </html>
  );
}