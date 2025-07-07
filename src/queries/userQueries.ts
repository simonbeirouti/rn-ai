import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { UserData, useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';

// Query keys
export const userQueryKeys = {
  userData: (userId: string) => ['userData', userId],
  privateProfile: (userId: string) => ['privateProfile', userId],
};

// Fetch user data from Firestore
export const useUserData = (userId?: string) => {
  return useQuery({
    queryKey: userQueryKeys.userData(userId || ''),
    queryFn: async (): Promise<UserData | null> => {
      if (!userId) return null;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const privateProfileDoc = await getDoc(doc(db, 'users', userId, 'private', 'profile'));
        
        if (!userDoc.exists() || !privateProfileDoc.exists()) {
          return null;
        }
        
        const publicData = userDoc.data();
        const privateData = privateProfileDoc.data();
        
        const userData: UserData = {
          displayName: publicData?.displayName || 'Anonymous',
          bio: privateData?.bio || '',
          interests: privateData?.interests || [],
          communicationStyle: privateData?.communicationStyle || 'descriptive',
          goals: privateData?.goals || { personal: [], professional: [] },
          createdAt: publicData?.createdAt?.toDate() || new Date(),
          updatedAt: privateData?.updatedAt?.toDate() || new Date(),
          hasCompletedOnboarding: privateData?.hasCompletedOnboarding || false,
        };
        
        console.log('📖 User data fetched from Firebase:', {
          displayName: userData.displayName,
          bio: userData.bio,
          interests: userData.interests,
          communicationStyle: userData.communicationStyle,
          goalsFromFirebase: {
            personal: userData.goals.personal?.length || 0,
            professional: userData.goals.professional?.length || 0,
            personalGoals: userData.goals.personal,
            professionalGoals: userData.goals.professional,
          },
          hasCompletedOnboarding: userData.hasCompletedOnboarding,
        });
        
        return userData;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Create new user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const setUserData = useUserStore((state) => state.setUserData);
  
  return useMutation({
    mutationFn: async ({ user, userData }: { user: any; userData?: Partial<UserData> }) => {
      const defaultUserData: UserData = {
        displayName: userData?.displayName || user.displayName || 'Anonymous',
        bio: userData?.bio || '',
        interests: userData?.interests || [],
        communicationStyle: userData?.communicationStyle || 'descriptive',
        goals: userData?.goals || { personal: [], professional: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
        hasCompletedOnboarding: userData?.hasCompletedOnboarding || false,
      };
      
      // Create main user document (public data)
      await setDoc(doc(db, 'users', user.uid), {
        displayName: defaultUserData.displayName,
        createdAt: defaultUserData.createdAt,
        updatedAt: defaultUserData.updatedAt,
      });
      
      // Create private profile document
      await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), {
        email: user.email,
        bio: defaultUserData.bio,
        interests: defaultUserData.interests,
        communicationStyle: defaultUserData.communicationStyle,
        goals: defaultUserData.goals,
        createdAt: defaultUserData.createdAt,
        updatedAt: defaultUserData.updatedAt,
        hasCompletedOnboarding: defaultUserData.hasCompletedOnboarding,
      });
      
      return defaultUserData;
    },
    onSuccess: (userData, { user }) => {
      // Update local store
      setUserData(userData);
      
      // Update query cache
      queryClient.setQueryData(userQueryKeys.userData(user.uid), userData);
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });
};

// Update user data mutation
export const useUpdateUserData = () => {
  const queryClient = useQueryClient();
  const { updateUserData } = useUserStore();
  const user = useAuthStore((state) => state.user);
  
  return useMutation({
    mutationFn: async (updates: Partial<UserData>) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🔄 useUpdateUserData called with updates:', {
        ...updates,
        goalsStructure: updates.goals ? {
          personal: updates.goals.personal?.length || 0,
          professional: updates.goals.professional?.length || 0,
          personalGoals: updates.goals.personal,
          professionalGoals: updates.goals.professional,
        } : 'No goals in update'
      });
      
      const updatedData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      // Update public data if needed
      if (updates.displayName) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: updates.displayName,
          updatedAt: updatedData.updatedAt,
        }, { merge: true });
      }
      
      // Update private profile data
      const privateUpdates: any = { ...updatedData };
      delete privateUpdates.displayName; // Don't duplicate in private doc
      
      console.log('💾 Saving to Firebase private profile:', {
        ...privateUpdates,
        goalsBeingSaved: privateUpdates.goals ? {
          personal: privateUpdates.goals.personal?.length || 0,
          professional: privateUpdates.goals.professional?.length || 0,
        } : 'No goals being saved'
      });
      
      await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), privateUpdates, { merge: true });
      
      return updatedData;
    },
    onSuccess: (updatedData) => {
      if (!user) return;
      
      // Update local store
      updateUserData(updatedData);
      
      // Update query cache
      queryClient.setQueryData(
        userQueryKeys.userData(user.uid),
        (oldData: UserData | null) => oldData ? { ...oldData, ...updatedData } : null
      );
    },
    onError: (error) => {
      console.error('Error updating user data:', error);
    },
  });
};

// Complete onboarding mutation
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const updateUserMutation = useUpdateUserData();
  const { setAddingProfileInfo, setHasCompletedOnboarding } = useUserStore();
  const user = useAuthStore((state) => state.user);
  
  return useMutation({
    mutationFn: async (onboardingData: {
      displayName: string;
      bio: string;
      interests: string[];
      communicationStyle: 'descriptive' | 'concise' | 'funny';
      goals: {
        personal: Array<{ id: string; title: string; description: string; completed: boolean }>;
        professional: Array<{ id: string; title: string; description: string; completed: boolean }>;
      };
    }) => {
      // Show "Creating personalised AI experience" loading screen
      setAddingProfileInfo(true);
      
      console.log('🎯 Onboarding data received:', {
        displayName: onboardingData.displayName,
        bio: onboardingData.bio,
        interests: onboardingData.interests,
        communicationStyle: onboardingData.communicationStyle,
        goals: onboardingData.goals,
        personalGoalsCount: onboardingData.goals.personal.length,
        professionalGoalsCount: onboardingData.goals.professional.length,
      });
      
      const result = await updateUserMutation.mutateAsync({
        ...onboardingData,
        hasCompletedOnboarding: true,
      });
      
      console.log('✅ Onboarding completion result:', result);
      
      return result;
    },
    onSuccess: (result) => {
      if (!user) return;
      
      // Update local state immediately
      setHasCompletedOnboarding(true);
      
      // Invalidate and refetch user data to ensure consistency
      queryClient.invalidateQueries({ queryKey: userQueryKeys.userData(user.uid) });
      
      // Hide loading screen after 2.5 seconds
      setTimeout(() => {
        setAddingProfileInfo(false);
      }, 2500);
    },
    onError: (error) => {
      console.error('Error completing onboarding:', error);
      setAddingProfileInfo(false);
    },
  });
};
