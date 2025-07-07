import "../global.css";
import "@/utils/fetch-polyfill";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Appearance } from 'react-native';
import 'react-native-reanimated';

import { useThemeStore } from '@/stores/themeStore';
import { AppProviders } from '@/providers/AppProviders';

export { ErrorBoundary } from "expo-router";

export default function Layout() {
  const { currentTheme, isLoading, initializeTheme, updateSystemTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
    
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      updateSystemTheme(colorScheme);
    });

    return () => subscription?.remove();
  }, [initializeTheme, updateSystemTheme]);

  // Show loading screen with correct theme while initializing
  if (isLoading) {
    return null; // Or a minimal loading component with the correct background
  }

  return (
    <AppProviders>
      <ThemeProvider value={currentTheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={currentTheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppProviders>
  );
}
