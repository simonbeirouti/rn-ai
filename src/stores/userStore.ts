import { create } from 'zustand';

export interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface UserData {
  displayName: string;
  bio: string;
  interests: string[];
  communicationStyle: 'descriptive' | 'concise' | 'funny';
  goals: {
    personal: Goal[];
    professional: Goal[];
  };
  createdAt: Date;
  updatedAt: Date;
  hasCompletedOnboarding: boolean;
}

interface UserState {
  userData: UserData | null;
  loading: boolean;
  hasCompletedOnboarding: boolean;
  initiatingAccess: boolean;
  addingProfileInfo: boolean;
  
  // Actions
  setUserData: (userData: UserData | null) => void;
  setLoading: (loading: boolean) => void;
  setHasCompletedOnboarding: (hasCompleted: boolean) => void;
  setInitiatingAccess: (value: boolean) => void;
  setAddingProfileInfo: (value: boolean) => void;
  updateUserData: (updates: Partial<UserData>) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  userData: null,
  loading: false,
  hasCompletedOnboarding: false,
  initiatingAccess: false,
  addingProfileInfo: false,

  setUserData: (userData: UserData | null) => {
    set({ 
      userData,
      hasCompletedOnboarding: userData?.hasCompletedOnboarding || false
    });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setHasCompletedOnboarding: (hasCompleted: boolean) => {
    set({ hasCompletedOnboarding: hasCompleted });
    // Also update userData if it exists
    const currentUserData = get().userData;
    if (currentUserData) {
      set({ 
        userData: { 
          ...currentUserData, 
          hasCompletedOnboarding: hasCompleted 
        }
      });
    }
  },

  setInitiatingAccess: (value: boolean) => {
    set({ initiatingAccess: value });
  },

  setAddingProfileInfo: (value: boolean) => {
    set({ addingProfileInfo: value });
  },

  updateUserData: (updates: Partial<UserData>) => {
    const currentUserData = get().userData;
    if (currentUserData) {
      const updatedUserData = { ...currentUserData, ...updates };
      set({ 
        userData: updatedUserData,
        hasCompletedOnboarding: updatedUserData.hasCompletedOnboarding
      });
    }
  },

  clearUserData: () => {
    set({ 
      userData: null, 
      hasCompletedOnboarding: false,
      loading: false,
      initiatingAccess: false,
      addingProfileInfo: false
    });
  },
}));
