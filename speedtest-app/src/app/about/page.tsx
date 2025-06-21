'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function AboutPage() {
  const { currentThemeColors } = useTheme();
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl mt-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6" 
            style={{ 
              fontFamily: "'Share Tech Mono', monospace", 
              color: currentThemeColors.primary,
              textShadow: `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.7), 0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.4)`
            }}>
          ABOUT NET SONIC
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          The story behind the cyberpunk speed test experience
        </p>
        <div className="w-24 h-1 mx-auto" 
             style={{ 
               background: `linear-gradient(90deg, transparent, rgba(${currentThemeColors.primaryRGB}, 0.7), transparent)` 
             }}>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: currentThemeColors.primary }}>
            Why I Built NET SONIC
          </h2>
          
          <p className="text-gray-200 leading-relaxed">
            I created NET SONIC as a personal project born from curiosity. I've always been fascinated by how we 
            measure internet performance, and I wanted to see if I could build something that was not only functional 
            but also visually engaging. Most speed tests out there feel clinical and boring – I wanted to create 
            something that would actually be fun to use.
          </p>
          
          <p className="text-gray-200 leading-relaxed">
            The cyberpunk aesthetic wasn't just a random choice. I've always loved the neon-lit, high-tech visual 
            language of cyberpunk media. It felt like the perfect match for a tool that's fundamentally about 
            measuring your connection to the digital world. There's something satisfying about watching those 
            neon-colored metrics climb during a test.
          </p>
          
          <h2 className="text-2xl font-bold mt-10 mb-4" style={{ color: currentThemeColors.primary }}>
            How It Works
          </h2>
          
          <p className="text-gray-200 leading-relaxed">
            Behind the flashy visuals, NET SONIC uses WebRTC technology to perform its measurements. It tests 
            your connection through a series of data transfers that simulate real-world usage better than 
            just downloading a single file. I was particularly interested in measuring jitter and stability 
            alongside the standard speed metrics – factors that actually matter a lot for everyday activities 
            like video calls and gaming.
          </p>
          
          <p className="text-gray-200 leading-relaxed">
            One aspect I'm particularly proud of is the responsive plexus background. It's not just eye candy – 
            I designed it to subtly respond to the test results, creating a visual representation of your 
            connection's stability. It's these little details that I believe make using NET SONIC a more 
            engaging experience than standard speed tests.
          </p>
          
          <h2 className="text-2xl font-bold mt-10 mb-4" style={{ color: currentThemeColors.primary }}>
            Future Plans
          </h2>
          
          <p className="text-gray-200 leading-relaxed">
            This project started as a personal experiment, but I've got some ideas for where to take it next. 
            I'd love to add historical tracking so users can monitor their connection quality over time, and 
            I'm exploring ways to provide more detailed diagnostics when problems are detected. There's also 
            room for more customization options – the theme selector is just the beginning.
          </p>
          
          <p className="text-gray-200 leading-relaxed">
            I'm also interested in making NET SONIC work better across different types of connections. While 
            it handles standard broadband well, I'd like to optimize it for satellite, cellular, and other 
            alternative connections that have different performance characteristics.
          </p>
        </div>
        
        {/*Profile */}
        <div>
          <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border" 
               style={{ borderColor: `rgba(${currentThemeColors.primaryRGB}, 0.2)` }}>
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 mb-4" 
                   style={{ borderColor: currentThemeColors.primary }}>
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl" 
                     style={{ color: currentThemeColors.primary }}>
                  SB
                </div>
              </div>
              <h3 className="text-xl font-bold" style={{ color: currentThemeColors.primary }}>Sachintha Bhashitha</h3>
              <p className="text-gray-400">Developer and Thinker</p>
            </div>
            
            <p className="text-sm text-gray-300 mb-6">
              I build digital things that combine functionality with engaging design. NET SONIC is a personal 
              project that let me explore the intersection of technical utility and creative presentation - 
              two areas I'm particularly passionate about.
            </p>
            
            <div className="flex justify-center space-x-4 mb-6">
              <Link href="https://github.com/LEXES7" target="_blank" className="social-link">
                <Github size={20} />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="social-link">
                <Twitter size={20} />
              </Link>
              <Link href="https://www.linkedin.com/in/sachintha-bhashitha-675286357/" target="_blank" className="social-link">
                <Linkedin size={20} />
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="https://github.com/LEXES7/NET-SONIC" 
                    target="_blank"
                    className="inline-flex items-center text-sm font-medium py-2 px-4 rounded-full transition-all duration-300"
                    style={{ 
                      background: `rgba(${currentThemeColors.primaryRGB}, 0.1)`,
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: `rgba(${currentThemeColors.primaryRGB}, 0.3)`,
                      color: currentThemeColors.primary,
                      textShadow: `0 0 5px rgba(${currentThemeColors.primaryRGB}, 0.3)`
                    }}>
                <Github size={16} className="mr-2" />
                View Project on GitHub
                <ExternalLink size={14} className="ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Tech Stack */}
          <div className="mt-8 bg-black/30 backdrop-blur-sm p-6 rounded-lg border" 
              style={{ borderColor: `rgba(${currentThemeColors.primaryRGB}, 0.2)` }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: currentThemeColors.primary }}>Built With</h3>
            
            <div className="space-y-3">
              <div className="tech-item">
                <span className="tech-name">Next.js</span>
                <span className="tech-description">React framework</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-name">TypeScript</span>
                <span className="tech-description">Type-safe development</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-name">TailwindCSS</span>
                <span className="tech-description">Styling</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-name">WebRTC</span>
                <span className="tech-description">Speed testing</span>
              </div>
              
              <div className="tech-item">
                <span className="tech-name">Canvas API</span>
                <span className="tech-description">Background animation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center mb-8 py-10">
        <h2 className="text-2xl font-bold mb-4" style={{ color: currentThemeColors.primary }}>
          Ready to Test Your Connection?
        </h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">
          Experience a visually engaging way to measure your internet performance.
          No ads, no tracking, just pure speed insights with a cyberpunk twist.
        </p>
        <Link href="/" 
              className="inline-block py-3 px-8 rounded-full font-medium transition-all duration-300 text-black"
              style={{ 
                background: currentThemeColors.primary,
                boxShadow: `0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.5), 0 0 30px rgba(${currentThemeColors.primaryRGB}, 0.3)`
              }}>
          Run Speed Test
        </Link>
      </div>
      
      <style jsx>{`
        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(${currentThemeColors.primaryRGB}, 0.1);
          color: ${currentThemeColors.primary};
          transition: all 0.2s ease;
          border-width: 1px;
          border-style: solid;
          border-color: rgba(${currentThemeColors.primaryRGB}, 0.3);
        }
        
        .social-link:hover {
          background: rgba(${currentThemeColors.primaryRGB}, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.3);
        }
        
        .tech-item {
          display: flex;
          justify-content: space-between;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(${currentThemeColors.primaryRGB}, 0.1);
        }
        
        .tech-name {
          font-family: var(--font-geist-mono);
          color: ${currentThemeColors.primary};
          font-size: 0.9rem;
        }
        
        .tech-description {
          color: #9CA3AF;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}