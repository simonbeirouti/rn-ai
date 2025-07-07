import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface LoadingScreenProps {
  message?: string;
  onComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

export function LoadingScreen({
  message = "Loading...",
  onComplete,
  duration = 2000
}: LoadingScreenProps) {
  const { isDark } = useTheme();
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Animate dots
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    // Auto complete after duration
    const timeout = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete, duration]);

  return (
    <View className="flex-1 justify-center items-center bg-background px-10">
      <ActivityIndicator
        size="large"
        color="rgb(var(--primary))"
        className="mb-6"
      />
      <Text className="text-foreground text-lg font-medium text-center mb-2">
        {message}
      </Text>
      <Text className="text-foreground text-lg font-medium opacity-60 min-h-[24px]">
        {dots}
      </Text>
    </View>
  );
}
