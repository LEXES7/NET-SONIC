'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, themeColors, ThemeColorKey } from '@/context/ThemeContext';
import { ChevronDown, Check } from 'lucide-react';

export default function ThemeColorSelector() {
  const { themeColor, setThemeColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md border transition-all"
        style={{
          borderColor: `rgba(${themeColors[themeColor].primaryRGB}, 0.5)`,
          background: `rgba(${themeColors[themeColor].primaryRGB}, 0.08)`,
        }}
        aria-label="Select theme color"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-2"
            style={{ 
              backgroundColor: themeColors[themeColor].primary,
              boxShadow: `0 0 4px rgba(${themeColors[themeColor].primaryRGB}, 0.7)`
            }}
          />
          <span 
            className="text-sm font-medium"
            style={{ color: themeColors[themeColor].primary }}
          >
            {themeColors[themeColor].name}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className="ml-1 transition-transform duration-200"
          style={{ 
            color: themeColors[themeColor].primary,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' 
          }}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 py-2 px-1 rounded-md border border-opacity-30 shadow-lg z-50 w-48"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            borderColor: `rgba(${themeColors[themeColor].primaryRGB}, 0.3)`,
            boxShadow: `0 0 20px rgba(0, 0, 0, 0.7), 0 0 10px rgba(${themeColors[themeColor].primaryRGB}, 0.2)`
          }}
        >
          <div className="py-1 px-3 mb-1 border-b border-gray-800">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Select Color Theme</p>
          </div>

          {(Object.keys(themeColors) as ThemeColorKey[]).map((colorKey) => (
            <button
              key={colorKey}
              onClick={() => {
                setThemeColor(colorKey);
                setIsOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-md w-full transition-all hover:bg-black/70 relative"
              style={{
                background: colorKey === themeColor ? `rgba(${themeColors[colorKey].primaryRGB}, 0.15)` : 'transparent',
              }}
            >
              <div className="flex-shrink-0 flex items-center">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: themeColors[colorKey].primary,
                    boxShadow: `0 0 6px rgba(${themeColors[colorKey].primaryRGB}, 0.7)`
                  }}
                >
                  {colorKey === themeColor && (
                    <Check size={12} className="text-black" />
                  )}
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <span 
                  className="text-sm font-medium"
                  style={{ 
                    color: colorKey === themeColor 
                      ? themeColors[colorKey].primary
                      : '#ffffff'
                  }}
                >
                  {themeColors[colorKey].name}
                </span>
                <span className="text-xs text-gray-400">
                  {themeColors[colorKey].description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}