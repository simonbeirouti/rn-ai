import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  currentTheme: 'light' | 'dark';
  isLoading: boolean;
  
  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  initializeTheme: () => Promise<void>;
  updateSystemTheme: (systemTheme: 'light' | 'dark' | null) => void;
}

const THEME_STORAGE_KEY = '@theme_preference';

export const useThemeStore = create<ThemeState>()((set, get) => ({
  themeMode: 'system',
  currentTheme: 'dark', // Default to dark to prevent white flash
  isLoading: true,

  setThemeMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ themeMode: mode });
      
      // Update current theme based on mode
      if (mode === 'system') {
        const systemTheme = Appearance.getColorScheme();
        set({ currentTheme: systemTheme || 'dark' });
      } else {
        set({ currentTheme: mode });
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  },

  updateSystemTheme: (systemTheme: 'light' | 'dark' | null) => {
    const { themeMode } = get();
    if (themeMode === 'system') {
      set({ currentTheme: systemTheme || 'dark' });
    }
  },

  initializeTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const systemTheme = Appearance.getColorScheme();
      
      if (savedTheme) {
        const themeMode = savedTheme as ThemeMode;
        set({ themeMode });
        
        if (themeMode === 'system') {
          set({ currentTheme: systemTheme || 'dark' });
        } else {
          set({ currentTheme: themeMode });
        }
      } else {
        // First time - use system theme
        set({ 
          themeMode: 'system',
          currentTheme: systemTheme || 'dark'
        });
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to dark theme
      set({ 
        themeMode: 'system',
        currentTheme: 'dark',
        isLoading: false 
      });
    }
  },
}));
