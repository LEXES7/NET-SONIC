'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, Github, HelpCircle, Info, Activity } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ThemeColorSelector from '@/components/ThemeColorSelector';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode, currentThemeColors } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen && e.target instanceof HTMLElement) {
        const nav = document.getElementById('mobile-menu');
        if (nav && !nav.contains(e.target)) {
          setIsMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);
  
  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled 
          ? 'bg-black/50' 
          : 'bg-black/30'
      }`}
      style={{
        boxShadow: scrolled 
          ? `0 0 15px rgba(${currentThemeColors.primaryRGB}, 0.15)` 
          : 'none',
        borderBottom: `1px solid rgba(${currentThemeColors.primaryRGB}, ${scrolled ? '0.15' : '0.05'})`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <div className="w-12 h-12 overflow-hidden rounded-full mr-3 transition-transform transform-gpu group-hover:scale-105 flex-shrink-0 flex items-center justify-center">
                {/* Neon Logo - Use current theme color */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg 
                    viewBox="0 0 792 792" 
                    className="w-10 h-10" 
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      filter: `drop-shadow(0 0 8px rgba(${currentThemeColors.primaryRGB}, 0.5))`
                    }}
                  >
                    <path 
                      d="M667.12,535.02c-3.79-0.62-7.63-0.96-11.46-1.22c-17.54-1.18-35.12-1.09-52.66-0.61 c-22.37,0.61-44.74,1.45-67.09,2.96c-12.64,0.85-25.27,2.22-37.94,2.47c-4.84,0.09-6.49,2.49-7.93,6.47 c-6.12,16.92-7.95,34.49-8.45,52.28c-0.1,7.58,1.02,15.04,1.64,22.56c1.29,15.87,5.48,30.98,10.59,45.92 c0.82,2.38,2.05,2.94,4.52,2.13c12.42-4.06,24.69-8.53,36.6-13.9c38.1-17.2,71.59-40.96,100.51-71.12 c12.66-13.21,24.13-27.39,33.92-42.89C671.75,536.28,671.61,535.76,667.12,535.02z" 
                      fill={currentThemeColors.primary}
                    />
                    <path 
                      d="M337.34,574.41c-3.67-1.82-5.99-5.21-7.99-8.72c-1.66-2.91-3.1-6.26-1.46-9.28c1.53-2.84,0.28-3.44-1.75-4.32 c-4.47-1.95-8.36-4.72-11.94-8.05c-6.85-6.36-12.49-13.68-17.28-21.64c-6.53-10.86-12.14-22.16-13.99-34.9 c-0.33-2.29-1.37-1.71-2.56-1.04c-2.97,1.68-5.97,3.31-8.83,5.16c-35.26,22.7-60.4,53.01-70.42,94.46c-1.19,4.93-2.88,10.02-2,15.52 c2.66-0.94,4.14-2.94,6.02-4.35c25.98-19.49,55.36-27.8,87.57-26.37c4.6,0.21,5.59-0.45,4.03-4.77c-0.58-1.62-0.09-3.62-0.09-5.56 c2.22,1.86,1.56,4.57,2.4,6.78c4.4,11.62,12.28,20.38,22.13,27.59c1.52,1.11,4.57,2.17,3.27,4.17c-1.33,2.06-3.45-0.7-5.1-1.37 c-1.83-0.74-2.78-1.86-4.28,0.72c-7.72,13.24-18.21,24.03-30.31,33.34c-11.77,9.07-24.65,16.21-38.22,22.49 c4.68,1,9.42,0.86,13.96,0.24c24.67-3.38,47.03-12.65,67.32-27.06c2.9-2.06,4.04-4.44,4.11-7.81c0.26-13.17,3.05-25.92,7.87-38.08 C341.39,577.58,340.82,576.14,337.34,574.41z" 
                      fill={currentThemeColors.primary}
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight"
                  style={{ 
                    color: currentThemeColors.primary,
                    textShadow: `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.7), 0 0 20px rgba(${currentThemeColors.primaryRGB}, 0.4)`,
                    fontFamily: "'Share Tech Mono', monospace"
                  }}>
                  NET SONIC
                </span>
                <span 
                  className="text-[10px] font-medium -mt-1"
                  style={{ color: `rgba(${currentThemeColors.primaryRGB}, 0.6)` }}
                >
                  SPEED TEST
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="relative px-4 py-2 text-sm font-medium transition-colors rounded-md group"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                color: `rgba(${currentThemeColors.primaryRGB}, 0.8)`
              }}
            >
              <span className="relative z-10">HOME</span>
              <span className="absolute inset-0 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-left"
                style={{
                  background: `rgba(${currentThemeColors.primaryRGB}, 0.1)`
                }}
              ></span>
            </Link>
            
            <Link 
              href="/about" 
              className="relative px-4 py-2 text-sm font-medium transition-colors rounded-md group"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                color: `rgba(${currentThemeColors.primaryRGB}, 0.8)`
              }}
            >
              <span className="relative z-10 flex items-center">
                <Info className="h-4 w-4 mr-1.5 opacity-70" />
                ABOUT
              </span>
              <span className="absolute inset-0 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-left"
                style={{
                  background: `rgba(${currentThemeColors.primaryRGB}, 0.1)`
                }}
              ></span>
            </Link>
            
            {/* Theme color selector */}
            <div className="pl-2 border-l ml-2"
              style={{
                borderColor: `rgba(${currentThemeColors.primaryRGB}, 0.2)`
              }}
            >
              <ThemeColorSelector />
            </div>
            
            {/* Theme toggle button */}
            <div className="pl-2 ml-2">
              <button 
                onClick={toggleDarkMode} 
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-black/50 hover:bg-black/70'
                    : 'hover:bg-black/20'
                }`}
                style={{
                  color: currentThemeColors.primary,
                  boxShadow: isDarkMode 
                    ? `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.2)` 
                    : 'none'
                }}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            </div>
          </nav>
          
          {/* Mobile menu button and theme color selector */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeColorSelector />
            
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-black/50'
                  : 'bg-black/10'
              }`}
              style={{
                color: currentThemeColors.primary,
                boxShadow: isDarkMode 
                  ? `0 0 10px rgba(${currentThemeColors.primaryRGB}, 0.2)` 
                  : 'none'
              }}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-4.5 w-4.5" />
              ) : (
                <Moon className="h-4.5 w-4.5" />
              )}
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md transition-all duration-300`}
              style={{
                background: isMenuOpen 
                  ? `rgba(${currentThemeColors.primaryRGB}, 0.2)` 
                  : 'transparent',
                color: currentThemeColors.primary
              }}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        id="mobile-menu" 
        className={`md:hidden absolute top-full left-0 w-full backdrop-blur-md transition-all duration-300 transform ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          borderTop: `1px solid rgba(${currentThemeColors.primaryRGB}, 0.2)`,
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="px-2 py-3 space-y-1">
          <Link 
            href="/" 
            className="flex items-center px-3 py-2.5 text-base font-medium rounded-md hover:bg-black/50"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              color: currentThemeColors.primary
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <Activity className="h-5 w-5 mr-2 opacity-70" />
            HOME
          </Link>
          
          <Link 
            href="/about" 
            className="flex items-center px-3 py-2.5 text-base font-medium rounded-md hover:bg-black/50"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              color: currentThemeColors.primary
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <Info className="h-5 w-5 mr-2 opacity-70" />
            ABOUT
          </Link>
          
          <Link 
            href="/faq" 
            className="flex items-center px-3 py-2.5 text-base font-medium rounded-md hover:bg-black/50"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              color: currentThemeColors.primary
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <HelpCircle className="h-5 w-5 mr-2 opacity-70" />
            FAQ
          </Link>
        </div>
      </div>
    </header>
  );
}