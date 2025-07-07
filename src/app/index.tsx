import React, { useState } from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import { Chat } from "@/components/chat";
import { Channels } from "@/components/channels";
import { CustomTabs } from "@/components/custom-tabs";
import { LoginScreen } from "@/components/LoginScreen";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/hooks/useTheme";

export default function Page() {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userLoading, initiatingAccess, addingProfileInfo, completeOnboarding } = useUser();
  const { colors } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  // Show loading screen while checking authentication
  if (authLoading || (user && userLoading)) {
    return (
      <View 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show "initiating personal ai access" loading screen after signup
  if (initiatingAccess) {
    return (
      <LoadingScreen 
        message="Initiating personal AI access"
        duration={2500}
      />
    );
  }

  // Show "adding profile information to AI" loading screen after onboarding
  if (addingProfileInfo) {
    return (
      <LoadingScreen 
        message="Adding profile information to AI"
        duration={2500}
      />
    );
  }

  // Show onboarding screen if user hasn't completed onboarding (but not if we're still initiating access)
  if (userData && !userData.hasCompletedOnboarding && !initiatingAccess) {
    return (
      <OnboardingScreen 
        onComplete={async (onboardingData) => {
          await completeOnboarding(onboardingData);
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
    }
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
