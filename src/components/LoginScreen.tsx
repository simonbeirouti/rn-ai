import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInAnonymous } = useAuthStore();
  const { setInitiatingAccess } = useUserStore();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setLoading(false);
        setInitiatingAccess(true);
        setTimeout(() => {
          setInitiatingAccess(false);
        }, 2500);
      } else {
        await signIn(email, password);
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      await signInAnonymous();
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be implemented next');
  };

  const handleAppleSignIn = async () => {
    Alert.alert('Coming Soon', 'Apple Sign-In will be implemented next');
  };

  const handlePhoneSignIn = async () => {
    Alert.alert('Coming Soon', 'Phone Sign-In will be implemented next');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Welcome
          </Text>
          <Text className="text-base text-muted-foreground text-center">
            Sign in to continue to your chat
          </Text>
        </View>

        {/* Email/Password Section */}
        <View className="mb-8">
          <TextInput
            className="bg-card rounded-xl p-4 mb-3 text-foreground text-base"
            placeholder="Email"
            placeholderTextColor="rgb(var(--muted-foreground))"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-card rounded-xl p-4 mb-4 text-foreground text-base"
            placeholder="Password"
            placeholderTextColor="rgb(var(--muted-foreground))"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            className={`bg-primary rounded-xl p-4 items-center mb-3 ${loading ? 'opacity-70' : ''}`}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            <Text className="text-primary-foreground text-base font-semibold">
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            className="items-center"
          >
            <Text className="text-primary text-sm">
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-5">
          <View className="flex-1 h-px bg-border" />
          <Text className="mx-4 text-muted-foreground">
            or continue with
          </Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Social Auth Buttons */}
        <View className="gap-3 mb-5">
          <TouchableOpacity
            className="bg-card rounded-xl p-4 items-center flex-row justify-center"
            onPress={handleGoogleSignIn}
          >
            <Text className="text-foreground text-base font-medium">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-card rounded-xl p-4 items-center flex-row justify-center"
            onPress={handleAppleSignIn}
          >
            <Text className="text-foreground text-base font-medium">
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-card rounded-xl p-4 items-center flex-row justify-center"
            onPress={handlePhoneSignIn}
          >
            <Text className="text-foreground text-base font-medium">
              Continue with Phone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Anonymous Sign In */}
        <TouchableOpacity
          className="border border-border rounded-xl p-4 items-center"
          onPress={handleAnonymousSignIn}
        >
          <Text className="text-foreground text-base font-medium opacity-80">
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
