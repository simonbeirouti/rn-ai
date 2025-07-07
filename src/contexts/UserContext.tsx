import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from './AuthContext';

interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface UserData {
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

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  initiatingAccess: boolean;
  addingProfileInfo: boolean;
  setInitiatingAccess: (value: boolean) => void;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  completeOnboarding: (onboardingData: {
    displayName: string;
    bio: string;
    interests: string[];
    communicationStyle: 'descriptive' | 'concise' | 'funny';
    goals: {
      personal: Goal[];
      professional: Goal[];
    };
  }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initiatingAccess, setInitiatingAccess] = useState(false);
  const [addingProfileInfo, setAddingProfileInfo] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      ensureUserDocumentsExist(user).then((isNewUser) => {
        // Only load user data if this is not a new user
        // New users already have their data set by createNewUser
        if (!isNewUser) {
          loadUserData();
        }
      }).catch((error) => {
        console.error('Failed to ensure user documents exist:', error);
        // Still try to load user data even if document creation fails
        loadUserData();
      });
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user]);

  const ensureUserDocumentsExist = async (user: any): Promise<boolean> => {
    try {
      
      // Check if main user document exists (public data)
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await createNewUser(user);
        return true; // New user was created
      }
      
      // Check if private profile document exists
      const privateProfileDoc = await getDoc(doc(db, 'users', user.uid, 'private', 'profile'));
      if (!privateProfileDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), {
          email: user.email,
          interests: [],
          communicationStyle: 'descriptive',
          goals: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          hasCompletedOnboarding: false,
        });
      }
      
      return false; // Existing user
    } catch (error) {
      console.error('Error ensuring user documents exist:', error);
      // If we can't ensure documents exist, try creating from scratch
      await createNewUser(user);
      return true; // New user was created
    }
  };

  const createNewUser = async (user: any) => {
    try {
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
      const now = new Date();
      
      // Create the main user document (PUBLIC DATA ONLY)
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName,
        bio: '',
        createdAt: now,
        updatedAt: now,
      });

      // Create the private profile document (PRIVATE DATA ONLY)
      await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), {
        email: user.email,
        interests: [],
        communicationStyle: 'descriptive',
        goals: [],
        createdAt: now,
        updatedAt: now,
        hasCompletedOnboarding: false,
      });
      
      // Create combined user data for local state
      const initialUserData: UserData = {
        displayName: displayName,
        bio: '',
        interests: [],
        communicationStyle: 'descriptive',
        goals: { personal: [], professional: [] },
        createdAt: now,
        updatedAt: now,
        hasCompletedOnboarding: false,
      };
      
      setUserData(initialUserData);
      
    } catch (error) {
      console.error('Error creating new user documents:', error);
      // Set a basic user data even if Firestore creation fails
      const fallbackUserData: UserData = {
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        bio: '',
        interests: [],
        communicationStyle: 'descriptive',
        goals: { personal: [], professional: [] },
        createdAt: new Date(),
        updatedAt: new Date(),
        hasCompletedOnboarding: false,
      };
      setUserData(fallbackUserData);
      throw error; // Re-throw to be caught by loadUserData
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load public user document
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const publicData = userDoc.data();
        
        // Load private profile document
        const privateProfileDoc = await getDoc(doc(db, 'users', user.uid, 'private', 'profile'));
        
        if (privateProfileDoc.exists()) {
          const privateData = privateProfileDoc.data();
          
          // Combine public and private data
          const combinedUserData: UserData = {
            displayName: publicData.displayName || '',
            bio: publicData.bio || '',
            interests: privateData.interests || [],
            communicationStyle: privateData.communicationStyle || 'descriptive',
            goals: privateData.goals || [],
            createdAt: publicData.createdAt?.toDate() || new Date(),
            updatedAt: privateData.updatedAt?.toDate() || new Date(),
            hasCompletedOnboarding: privateData.hasCompletedOnboarding || false,
          };
          
          setUserData(combinedUserData);
        } else {
          await createNewUser(user);
        }
      } else {
        await createNewUser(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user || !userData) return;

    try {
      const updatedData = {
        ...userData,
        ...data,
        updatedAt: new Date(),
      };

      // Update the main user document (PUBLIC DATA ONLY)
      await setDoc(doc(db, 'users', user.uid), {
        displayName: updatedData.displayName,
        bio: updatedData.bio,
        updatedAt: updatedData.updatedAt,
      }, { merge: true });

      // Update the private profile document (PRIVATE DATA ONLY)
      await setDoc(doc(db, 'users', user.uid, 'private', 'profile'), {
        interests: updatedData.interests,
        communicationStyle: updatedData.communicationStyle,
        goals: updatedData.goals,
        hasCompletedOnboarding: updatedData.hasCompletedOnboarding,
        updatedAt: updatedData.updatedAt,
      }, { merge: true });

      setUserData(updatedData);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const completeOnboarding = async (onboardingData: {
    displayName: string;
    bio: string;
    interests: string[];
    communicationStyle: 'descriptive' | 'concise' | 'funny';
    goals: {
      personal: Goal[];
      professional: Goal[];
    };
  }) => {
    setAddingProfileInfo(true);
    
    try {
      // Convert goals structure for storage
      const goalsArray = [...onboardingData.goals.personal, ...onboardingData.goals.professional];
      
      await updateUserData({
        displayName: onboardingData.displayName,
        bio: onboardingData.bio,
        interests: onboardingData.interests,
        communicationStyle: onboardingData.communicationStyle,
        goals: onboardingData.goals,
        hasCompletedOnboarding: true,
      });
      
      // Show loading screen for a few seconds before showing main app
      setTimeout(() => {
        setAddingProfileInfo(false);
      }, 2500);
    } catch (error) {
      setAddingProfileInfo(false);
      throw error;
    }
  };

  const value: UserContextType = {
    userData,
    loading,
    initiatingAccess,
    addingProfileInfo,
    setInitiatingAccess,
    updateUserData,
    completeOnboarding,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
