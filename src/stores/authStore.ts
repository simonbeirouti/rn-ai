import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInAnonymous: () => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  },

  signInAnonymous: async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      throw error;
    }
  },

  signInWithGoogle: async (idToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('AuthStore: Logout error:', error);
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      loading: false 
    });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));

// Initialize Firebase auth listener
let authListenerInitialized = false;

export const initializeAuthListener = () => {
  if (authListenerInitialized) return;
  
  authListenerInitialized = true;
  
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
};
