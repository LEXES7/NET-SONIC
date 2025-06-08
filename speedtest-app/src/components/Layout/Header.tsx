'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, Gauge, Github, HelpCircle, Info } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Check system preference and localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
    
    // Add scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };
  
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
          ? 'bg-white/80 dark:bg-gray-900/80 shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center">
              <div className="flex items-center p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/20 dark:shadow-blue-900/30 mr-3 transition-transform transform-gpu group-hover:scale-105">
                <Gauge className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent" 
                  style={{ 
                    backgroundImage: 'linear-gradient(to right, #2563eb, #6366f1, #9333ea)',
                    WebkitBackgroundClip: 'text'
                  }}>
                  NET SONIC
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium -mt-1">
                  Speed Test
                </span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md group"
            >
              <span className="relative z-10">Home</span>
              <span className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-left"></span>
            </Link>
            
            <Link 
              href="/about" 
              className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md group"
            >
              <span className="relative z-10 flex items-center">
                <Info className="h-4 w-4 mr-1.5 opacity-70" />
                About
              </span>
              <span className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-left"></span>
            </Link>
            
            <Link 
              href="/faq" 
              className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md group"
            >
              <span className="relative z-10 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1.5 opacity-70" />
                FAQ
              </span>
              <span className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-left"></span>
            </Link>
            
            <Link 
              href="https://github.com/LEXES7/NET-SONIC.git" 
              target="_blank" 
              className="relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md group"
            >
              <span className="relative z-10 flex items-center">
                <Github className="h-4 w-4 mr-1.5 opacity-70" />
                GitHub
              </span>
              <span className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-left"></span>
            </Link>
            
            {/* Theme toggle button */}
            <div className="pl-2 border-l border-gray-200 dark:border-gray-700 ml-2">
              <button 
                onClick={toggleDarkMode} 
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                }`}
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
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={toggleDarkMode} 
              className={`p-2 rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
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
              className={`p-2 rounded-md transition-all duration-300 ${
                isMenuOpen
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        id="mobile-menu" 
        className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-300 transform ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-2 py-3 space-y-1">
          <Link 
            href="/" 
            className="flex items-center px-3 py-2.5 text-base font-medium text-gray-800 dark:text-gray-200 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          
          <Link 
            href="/about" 
            className="flex items-center px-3 py-2.5 text-base font-medium text-gray-800 dark:text-gray-200 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onClick={() => setIsMenuOpen(false)}
          >
            <Info className="h-5 w-5 mr-2 opacity-70" />
            About
          </Link>
          
          <Link 
            href="/faq" 
            className="flex items-center px-3 py-2.5 text-base font-medium text-gray-800 dark:text-gray-200 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onClick={() => setIsMenuOpen(false)}
          >
            <HelpCircle className="h-5 w-5 mr-2 opacity-70" />
            FAQ
          </Link>
          
          <Link 
            href="https://github.com/LEXES7/NET-SONIC.git" 
            target="_blank" 
            className="flex items-center px-3 py-2.5 text-base font-medium text-gray-800 dark:text-gray-200 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onClick={() => setIsMenuOpen(false)}
          >
            <Github className="h-5 w-5 mr-2 opacity-70" />
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}