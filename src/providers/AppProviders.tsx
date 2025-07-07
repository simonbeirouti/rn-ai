import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient, initializeQueryPersistence } from '../queries/queryClient';
import { initializeAuthListener, useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useUserData, useCreateUser } from '../queries/userQueries';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Auth synchronization component
function AuthSync() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { setUserData, setLoading, clearUserData } = useUserStore();
  
  // Fetch user data when authenticated
  const { data: userData, isLoading, error } = useUserData(user?.uid);
  const createUserMutation = useCreateUser();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (error && !userData) {
        // User doesn't exist in Firestore, create them
        createUserMutation.mutate({ user });
      } else if (userData) {
        // User data loaded successfully
        setUserData(userData);
      }
    } else {
      // User not authenticated, clear data
      clearUserData();
    }
  }, [user, isAuthenticated, userData, error]);

  useEffect(() => {
    setLoading(isLoading || createUserMutation.isPending);
  }, [isLoading, createUserMutation.isPending, setLoading]);

  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    // Initialize Firebase auth listener
    initializeAuthListener();
    
    // Initialize query persistence
    initializeQueryPersistence();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
    </QueryClientProvider>
  );
}
