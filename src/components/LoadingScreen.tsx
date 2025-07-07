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
  const { colors } = useTheme();
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
    <View 
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 40,
      }}
    >
      <ActivityIndicator 
        size="large" 
        color={colors.primary} 
        style={{ marginBottom: 24 }}
      />
      
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: '500',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {message}
      </Text>
      
      <Text
        style={{
          color: colors.text,
          fontSize: 18,
          fontWeight: '500',
          opacity: 0.6,
          minHeight: 24,
        }}
      >
        {dots}
      </Text>
    </View>
  );
}
