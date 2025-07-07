import React, { useState } from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import { Chat } from "@/components/chat";
import { Channels } from "@/components/channels";
import { CustomTabs } from "@/components/custom-tabs";
import { LoginScreen } from "@/components/LoginScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useCompleteOnboarding } from "@/queries/userQueries";
import { useTheme } from "@/hooks/useTheme";

export default function Page() {
  const { user, loading: authLoading } = useAuthStore();
  const { userData, loading: userLoading, hasCompletedOnboarding, initiatingAccess, addingProfileInfo } = useUserStore();
  const completeOnboardingMutation = useCompleteOnboarding();
  const { isDark } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  // Show loading screen while checking authentication
  if (authLoading || (user && userLoading)) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
      </View>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show "Loading AI experience" loading screen after signup
  if (initiatingAccess) {
    return (
      <LoadingScreen 
        message="Loading AI experience"
        duration={2500}
      />
    );
  }

  // Show "Initialising Personalised AI" loading screen after onboarding
  if (addingProfileInfo) {
    return (
      <LoadingScreen 
        message="Initialising Personalised AI"
        duration={2500}
      />
    );
  }

  // Show onboarding screen if:
  // 1. User is authenticated but userData is null (new user) and not initiating access
  // 2. User has userData but hasn't completed onboarding and not initiating access
  // Use the store's hasCompletedOnboarding for consistent state
  if (user && !initiatingAccess && !hasCompletedOnboarding && (!userData || !userData.hasCompletedOnboarding)) {
    return (
      <OnboardingScreen 
        onComplete={async (onboardingData) => {
          await completeOnboardingMutation.mutateAsync(onboardingData);
        }}
      />
    );
  }

  // Show main app with tabs
  const tabs = [
    {
      id: 'main-chat',
      title: 'Main Chat',
      component: <Chat />
    },
    {
      id: 'channels',
      title: 'Channels',
      component: <Channels />
    },
  ];

  return (
    <>
      <CustomTabs 
        tabs={tabs} 
        onProfilePress={() => setShowProfile(true)}
      />
      
      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfile(false)}
      >
        <ProfileScreen onClose={() => setShowProfile(false)} />
      </Modal>
    </>
  );
}
