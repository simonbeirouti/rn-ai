import { useTheme as useNavigationTheme } from '@react-navigation/native';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const navigationTheme = useNavigationTheme();
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme === 'dark';
  
  return {
    ...navigationTheme,
    isDark,
    colors: {
      ...navigationTheme.colors,
      // Override with theme-aware colors
      background: isDark ? '#000000' : '#ffffff',
      text: isDark ? '#ffffff' : '#000000',
      primary: isDark ? '#007AFF' : '#007AFF',
      // Custom colors for chat app
      chatBackground: isDark ? '#000000' : '#ffffff',
      messageBackground: isDark ? '#1f1f1f' : '#f5f5f5',
      tabBackground: isDark ? '#1a1a1a' : '#f8f9fa',
      tabActiveBackground: isDark ? '#374151' : '#e5e7eb',
      tabInactiveText: isDark ? '#9ca3af' : '#6b7280',
      // Choice element colors for consistent styling
      card: isDark ? '#1f1f1f' : '#f8f9fa',
      border: isDark ? '#374151' : '#e5e7eb',
      cardHover: isDark ? '#374151' : '#e5e7eb',
    }
  };
}
