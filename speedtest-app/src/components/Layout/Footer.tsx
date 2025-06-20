'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, ExternalLink, Activity, Zap, Wifi } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 py-12 border-t border-yellow-400/10" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="container mx-auto px-4">
        {/* Top section with logo and links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-start">
              <div className="mr-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 792 792" 
                    className="w-10 h-10" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(252, 238, 9, 0.5))'
                    }}
                  >
                    <path 
                      d="M667.12,535.02c-3.79-0.62-7.63-0.96-11.46-1.22c-17.54-1.18-35.12-1.09-52.66-0.61 c-22.37,0.61-44.74,1.45-67.09,2.96c-12.64,0.85-25.27,2.22-37.94,2.47c-4.84,0.09-6.49,2.49-7.93,6.47 c-6.12,16.92-7.95,34.49-8.45,52.28c-0.1,7.58,1.02,15.04,1.64,22.56c1.29,15.87,5.48,30.98,10.59,45.92 c0.82,2.38,2.05,2.94,4.52,2.13c12.42-4.06,24.69-8.53,36.6-13.9c38.1-17.2,71.59-40.96,100.51-71.12 c12.66-13.21,24.13-27.39,33.92-42.89C671.75,536.28,671.61,535.76,667.12,535.02z" 
                      fill="#fcee09"
                    />
                    <path 
                      d="M337.34,574.41c-3.67-1.82-5.99-5.21-7.99-8.72c-1.66-2.91-3.1-6.26-1.46-9.28c1.53-2.84,0.28-3.44-1.75-4.32 c-4.47-1.95-8.36-4.72-11.94-8.05c-6.85-6.36-12.49-13.68-17.28-21.64c-6.53-10.86-12.14-22.16-13.99-34.9 c-0.33-2.29-1.37-1.71-2.56-1.04c-2.97,1.68-5.97,3.31-8.83,5.16c-35.26,22.7-60.4,53.01-70.42,94.46c-1.19,4.93-2.88,10.02-2,15.52 c2.66-0.94,4.14-2.94,6.02-4.35c25.98-19.49,55.36-27.8,87.57-26.37c4.6,0.21,5.59-0.45,4.03-4.77c-0.58-1.62-0.09-3.62-0.09-5.56 c2.22,1.86,1.56,4.57,2.4,6.78c4.4,11.62,12.28,20.38,22.13,27.59c1.52,1.11,4.57,2.17,3.27,4.17c-1.33,2.06-3.45-0.7-5.1-1.37 c-1.83-0.74-2.78-1.86-4.28,0.72c-7.72,13.24-18.21,24.03-30.31,33.34c-11.77,9.07-24.65,16.21-38.22,22.49 c4.68,1,9.42,0.86,13.96,0.24c24.67-3.38,47.03-12.65,67.32-27.06c2.9-2.06,4.04-4.44,4.11-7.81c0.26-13.17,3.05-25.92,7.87-38.08 C341.39,577.58,340.82,576.14,337.34,574.41z" 
                      fill="#fcee09"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-yellow-400" 
                  style={{ 
                    textShadow: '0 0 10px rgba(252, 238, 9, 0.7), 0 0 20px rgba(252, 238, 9, 0.4)',
                    fontFamily: "'Share Tech Mono', monospace"
                  }}>
                  NET SONIC
                </span>
                <span className="text-[10px] text-yellow-300/60 font-medium mt-1">
                  INTERNET SPEED TEST
                </span>
              </div>
            </Link>
            <p className="mt-4 text-gray-400 text-sm max-w-xs">
              Fast and accurate internet speed testing tool with a modern cyberpunk interface.
            </p>
          </div>
          
          {/* Links */}
          <div className="col-span-1">
            <h3 className="text-yellow-400 font-bold mb-4 text-sm tracking-wider"
                style={{ 
                  fontFamily: "'Share Tech Mono', monospace",
                  textShadow: '0 0 5px rgba(252, 238, 9, 0.5)'
                }}>
              NAVIGATION
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-2" />
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center">
                  <Wifi className="w-3.5 h-3.5 mr-2" />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-yellow-400 font-bold mb-4 text-sm tracking-wider"
                style={{ 
                  fontFamily: "'Share Tech Mono', monospace",
                  textShadow: '0 0 5px rgba(252, 238, 9, 0.5)'
                }}>
              RESOURCES
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="https://github.com/LEXES7/NET-SONIC" 
                  target="_blank"
                  className="text-gray-300 hover:text-yellow-400 text-sm transition-colors duration-200 flex items-center"
                >
                  <Github className="w-3.5 h-3.5 mr-2" />
                  GitHub
                  <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                </Link>
              </li>
       
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-yellow-400 font-bold mb-4 text-sm tracking-wider"
                style={{ 
                  fontFamily: "'Share Tech Mono', monospace",
                  textShadow: '0 0 5px rgba(252, 238, 9, 0.5)'
                }}>
              CONNECT
            </h3>
            <div className="flex items-center space-x-3">
              <a href="https://github.com/LEXES7/NET-SONIC" target="_blank" rel="noopener noreferrer" 
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 p-2 hover:bg-yellow-400/10 rounded-full">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 p-2 hover:bg-yellow-400/10 rounded-full">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-400 text-sm mb-2">Get updates on new features:</p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-black/50 text-gray-300 px-4 py-2 text-sm border border-yellow-400/30 rounded-l-md focus:outline-none focus:border-yellow-400/50 w-full max-w-[200px]"
                  style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
                />
                <button 
                  type="submit" 
                  className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 px-3 py-2 text-sm font-semibold rounded-r-md hover:bg-yellow-400/30 transition-colors duration-200"
                  style={{ textShadow: '0 0 5px rgba(252, 238, 9, 0.5)' }}
                >
                  SUBMIT
                </button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="pt-6 mt-6 border-t border-yellow-400/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} NET SONIC. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="text-gray-400 hover:text-yellow-400 text-xs transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-yellow-400 text-xs transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative line at the very bottom */}
        <div className="w-full h-0.5 mt-10 relative overflow-hidden">
          <div className="absolute inset-0" 
               style={{ 
                 background: 'linear-gradient(90deg, transparent, rgba(252, 238, 9, 0.7), transparent)',
                 boxShadow: '0 0 8px rgba(252, 238, 9, 0.5)'
               }}>
          </div>
        </div>
      </div>
    </footer>
  );
}