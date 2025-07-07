import { useThemeStore } from '../stores/themeStore';
import { useEffect } from 'react';

export function useTheme() {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';
  
  // Apply dark class to document root for CSS variables
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [isDark]);
  
  return {
    isDark,
    currentTheme,
    // Helper function to get theme-aware class names
    getThemeClass: (lightClass: string, darkClass?: string) => {
      if (darkClass) {
        return isDark ? darkClass : lightClass;
      }
      return lightClass;
    },
  };
}
