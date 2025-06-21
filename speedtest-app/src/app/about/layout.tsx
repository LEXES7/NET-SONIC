import Script from "next/script";

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <canvas 
        id="plexus-background" 
        className="fixed inset-0 z-0 w-full h-full"
        style={{ opacity: 1 }}
      ></canvas>

      {children}

      <Script id="plexus-script">
        {`
          function initPlexus() {
            const canvas = document.getElementById('plexus-background');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;
            
            let mouseX = width / 2;
            let mouseY = height / 2;
            const mouseRadius = 150;
            
            const particleCount = width < 768 ? 70 : 120;
            const particles = [];
            const connectionDistance = width < 768 ? 120 : 180;
            const hexRadius = width < 768 ? 60 : 90;
            
            function getThemeColors() {
              const primaryRGB = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary-rgb').trim() || '252, 238, 9';
              return {
                particleColor: \`rgba(\${primaryRGB}, 0.8)\`,
                connectionColor: \`rgba(\${primaryRGB}, 0.3)\`,
                hexColor: \`rgba(\${primaryRGB}, 0.1)\`,
                mouseHexColor: \`rgba(\${primaryRGB}, 0.25)\`,
                primaryRGB
              };
            }
            
            let themeColors = getThemeColors();
            
            const observer = new MutationObserver(() => {
              themeColors = getThemeColors();
            });
            
            observer.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['style']
            });
            
            window.addEventListener('resize', () => {
              width = canvas.width = window.innerWidth;
              height = canvas.height = window.innerHeight;
            });
            
            window.addEventListener('mousemove', (e) => {
              mouseX = e.clientX;
              mouseY = e.clientY;
            });
            
            class Particle {
              constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.velocityX = (Math.random() - 0.5) * 0.4;
                this.velocityY = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2 + 1;
                this.connected = false;
                this.connections = [];
              }
              
              update() {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouseRadius) {
                  const angle = Math.atan2(dy, dx);
                  const force = (mouseRadius - distance) / mouseRadius;
                  this.velocityX -= Math.cos(angle) * force * 0.2;
                  this.velocityY -= Math.sin(angle) * force * 0.2;
                }
                
                this.x += this.velocityX;
                this.y += this.velocityY;
                
                this.velocityX *= 0.985;
                this.velocityY *= 0.985;
                
                if (this.x < 0 || this.x > width) this.velocityX *= -1;
                if (this.y < 0 || this.y > height) this.velocityY *= -1;
                
                this.x = Math.max(0, Math.min(width, this.x));
                this.y = Math.max(0, Math.min(height, this.y));
                
                this.connected = false;
                this.connections = [];
              }
              
              draw() {
                ctx.fillStyle = themeColors.particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            
            for (let i = 0; i < particleCount; i++) {
              particles.push(new Particle());
            }

            let lastFrameTime = performance.now();
            const targetFPS = 60;
            const frameInterval = 1000 / targetFPS;
            
            function animate(currentTime) {
              const elapsed = currentTime - lastFrameTime;
              
              if (elapsed > frameInterval) {
                lastFrameTime = currentTime - (elapsed % frameInterval);
                
                ctx.clearRect(0, 0, width, height);
                
                for (let i = 0; i < particles.length; i++) {
                  particles[i].update();
                }
                
                const hexagons = [];
                const connections = [];
                
                for (let i = 0; i < particles.length; i++) {
                  for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance) {
                      particles[i].connected = true;
                      particles[j].connected = true;
                      connections.push([i, j, distance]);
                      
                      if (Math.abs(distance - hexRadius) < 20) {
                        particles[i].connections.push(j);
                        particles[j].connections.push(i);
                        
                        for (let k = 0; k < particles[i].connections.length; k++) {
                          const thirdIndex = particles[i].connections[k];
                          if (thirdIndex !== j) {
                            const dist_jk = Math.sqrt(
                              Math.pow(particles[j].x - particles[thirdIndex].x, 2) + 
                              Math.pow(particles[j].y - particles[thirdIndex].y, 2)
                            );
                            
                            if (Math.abs(dist_jk - hexRadius) < 20) {
                              hexagons.push([i, j, thirdIndex]);
                            }
                          }
                        }
                      }
                    }
                  }
                }
                
                for (let i = 0; i < connections.length; i++) {
                  const [a, b, distance] = connections[i];
                  const opacity = 1 - (distance / connectionDistance);
                  ctx.strokeStyle = \`rgba(\${themeColors.primaryRGB}, \${opacity * 0.3})\`;
                  ctx.lineWidth = 0.7;
                  ctx.beginPath();
                  ctx.moveTo(particles[a].x, particles[a].y);
                  ctx.lineTo(particles[b].x, particles[b].y);
                  ctx.stroke();
                }
                
                for (let i = 0; i < hexagons.length; i++) {
                  const [a, b, c] = hexagons[i];
                  
                  const centerX = (particles[a].x + particles[b].x + particles[c].x) / 3;
                  const centerY = (particles[a].y + particles[b].y + particles[c].y) / 3;
                  
                  const dx = mouseX - centerX;
                  const dy = mouseY - centerY;
                  const mouseDistance = Math.sqrt(dx * dx + dy * dy);
                  const isNearMouse = mouseDistance < mouseRadius * 1.5;
                  
                  ctx.fillStyle = isNearMouse ? themeColors.mouseHexColor : themeColors.hexColor;
                  ctx.beginPath();
                  ctx.moveTo(particles[a].x, particles[a].y);
                  ctx.lineTo(particles[b].x, particles[b].y);
                  ctx.lineTo(particles[c].x, particles[c].y);
                  ctx.closePath();
                  ctx.fill();
                }

                for (let i = 0; i < particles.length; i++) {
                  particles[i].draw();
                }
              }
              
              requestAnimationFrame(animate);
            }
            
            requestAnimationFrame(animate);
          }

          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(initPlexus, 800);
          } else {
            document.addEventListener('DOMContentLoaded', () => setTimeout(initPlexus, 800));
          }
          window.addEventListener('load', () => setTimeout(initPlexus, 800));
        `}
      </Script>
    </>
  );
}