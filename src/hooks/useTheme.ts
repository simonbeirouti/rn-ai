import { useTheme as useNavigationTheme } from '@react-navigation/native';
import { useColorScheme } from './useColorScheme';

export function useTheme() {
  const navigationTheme = useNavigationTheme();
  const colorScheme = useColorScheme();
  
  return {
    ...navigationTheme,
    isDark: colorScheme === 'dark',
    colors: {
      ...navigationTheme.colors,
      // Custom colors for chat app
      chatBackground: colorScheme === 'dark' ? '#000000' : '#ffffff',
      messageBackground: colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5',
      tabBackground: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
      tabActiveBackground: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
      tabInactiveText: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
    }
  };
}
