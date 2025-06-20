import Script from "next/script";

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Plexus Background Canvas - only on About page */}
      <canvas 
        id="plexus-background" 
        className="fixed inset-0 z-0 w-full h-full"
        style={{ opacity: 1 }}
      ></canvas>

      {children}

      {/* Plexus Animation Script */}
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
            
            // Mouse tracking
            let mouseX = width / 2;
            let mouseY = height / 2;
            const mouseRadius = 150; // Mouse influence radius
            
            // Particle settings
            const particleCount = width < 768 ? 80 : 150;
            const particles = [];
            const connectionDistance = width < 768 ? 120 : 180;
            const hexRadius = width < 768 ? 60 : 90;
            
            // Function to get theme colors (reads CSS variables)
            function getThemeColors() {
              const primaryRGB = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary-rgb').trim() || '252, 238, 9';
              return {
                particleColor: \`rgba(\${primaryRGB}, 0.8)\`,
                connectionColor: \`rgba(\${primaryRGB}, 0.3)\`,
                hexColor: \`rgba(\${primaryRGB}, 0.1)\`,
                mouseHexColor: \`rgba(\${primaryRGB}, 0.25)\`
              };
            }
            
            let themeColors = getThemeColors();
            
            // Watch for theme color changes
            const observer = new MutationObserver(() => {
              themeColors = getThemeColors();
            });
            
            observer.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['style']
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
              width = canvas.width = window.innerWidth;
              height = canvas.height = window.innerHeight;
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
                this.size = Math.random() * 2.5 + 1.5;
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
                ctx.fillStyle = themeColors.particleColor;
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
                    const primaryRGB = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary-rgb').trim() || '252, 238, 9';
                    ctx.strokeStyle = \`rgba(\${primaryRGB}, \${opacity * 0.3})\`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    
                    // Find potential hexagons
                    if (Math.abs(distance - hexRadius) < 25) {
                      for (let k = j + 1; k < particles.length; k++) {
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
              
              // Draw hexagons (triangles)
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
                ctx.fillStyle = isNearMouse ? themeColors.mouseHexColor : themeColors.hexColor;
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
          }

          // Initialize plexus
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(initPlexus, 1000);
          } else {
            document.addEventListener('DOMContentLoaded', () => setTimeout(initPlexus, 1000));
          }
          window.addEventListener('load', () => setTimeout(initPlexus, 1000));
        `}
      </Script>
    </>
  );
}