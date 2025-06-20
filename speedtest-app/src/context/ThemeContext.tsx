'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define theme colors with their names and color values
export const themeColors = {
  default: {
    name: 'Default',
    primary: '#ffffff', // Pure white for default
    primaryRGB: '255, 255, 255', // RGB values for rgba usage
    secondary: '#080808', // Background color
    description: 'Classic white'
  },
  yellow: {
    name: 'Yellow',
    primary: '#fcee09', // Bright neon yellow
    primaryRGB: '252, 238, 9',
    secondary: '#080808',
    description: 'Cyberpunk yellow'
  },
  cyan: {
    name: 'Cyan',
    primary: '#0affff', // Brighter teal
    primaryRGB: '10, 255, 255',
    secondary: '#080808',
    description: 'Electric blue'
  },
  red: {
    name: 'Red',
    primary: '#ff3131', // Neon red
    primaryRGB: '255, 49, 49',
    secondary: '#080808',
    description: 'Danger red'
  },
  pink: {
    name: 'Pink',
    primary: '#ff71ce', // Vibrant neon pink
    primaryRGB: '255, 113, 206',
    secondary: '#080808',
    description: 'Synthwave pink'
  },
  purple: {
    name: 'Purple',
    primary: '#b967ff', // Rich purple
    primaryRGB: '185, 103, 255',
    secondary: '#080808',
    description: 'Digital purple'
  },
  green: {
    name: 'Green',
    primary: '#05ffa1', // Mint/aqua green
    primaryRGB: '5, 255, 161',
    secondary: '#080808',
    description: 'Matrix green'
  },
  orange: {
    name: 'Orange',
    primary: '#ff9e00', // Vibrant orange
    primaryRGB: '255, 158, 0',
    secondary: '#080808',
    description: 'Sunset orange'
  }
};

export type ThemeColorKey = keyof typeof themeColors;

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  themeColor: ThemeColorKey;
  setThemeColor: (color: ThemeColorKey) => void;
  currentThemeColors: typeof themeColors[ThemeColorKey];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState<ThemeColorKey>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load saved theme preferences
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      // Default to dark mode
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Load saved color preference
    const storedColor = localStorage.getItem('themeColor') as ThemeColorKey;
    if (storedColor && themeColors[storedColor]) {
      setThemeColor(storedColor);
    }
    
    // Apply CSS variables for theme colors
    updateCSSVariables(storedColor || themeColor);
  }, []);

  // Update CSS variables when theme color changes
  const updateCSSVariables = (color: ThemeColorKey) => {
    const root = document.documentElement;
    const theme = themeColors[color];
    
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-rgb', theme.primaryRGB);
    root.style.setProperty('--theme-secondary', theme.secondary);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const handleSetThemeColor = (color: ThemeColorKey) => {
    setThemeColor(color);
    localStorage.setItem('themeColor', color);
    updateCSSVariables(color);
  };

  // Only render the provider's children once the component has mounted to avoid hydration issues
  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        themeColor,
        setThemeColor: handleSetThemeColor,
        currentThemeColors: themeColors[themeColor],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}