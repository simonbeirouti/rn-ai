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
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../hooks/useTheme';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInAnonymous } = useAuth();
  const { setInitiatingAccess } = useUser();
  const { colors } = useTheme();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        // Show loading screen immediately after successful sign up
        setLoading(false);
        setInitiatingAccess(true);
        
        // Hide loading screen after 2.5 seconds
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
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Welcome
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            Sign in to continue to your chat
          </Text>
        </View>

        {/* Email/Password Section */}
        <View style={{ marginBottom: 30 }}>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              color: colors.text,
              fontSize: 16,
            }}
            placeholder="Email"
            placeholderTextColor={colors.text + '80'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              color: colors.text,
              fontSize: 16,
            }}
            placeholder="Password"
            placeholderTextColor={colors.text + '80'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              marginBottom: 12,
              opacity: loading ? 0.7 : 1,
            }}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            style={{ alignItems: 'center' }}
          >
            <Text style={{ color: colors.primary, fontSize: 14 }}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: colors.border,
            }}
          />
          <Text
            style={{
              marginHorizontal: 16,
              color: colors.text,
              opacity: 0.6,
            }}
          >
            or continue with
          </Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: colors.border,
            }}
          />
        </View>

        {/* Social Auth Buttons */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handleGoogleSignIn}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '500',
              }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handleAppleSignIn}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '500',
              }}
            >
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handlePhoneSignIn}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '500',
              }}
            >
              Continue with Phone
            </Text>
          </TouchableOpacity>
        </View>

        {/* Anonymous Sign In */}
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
          }}
          onPress={handleAnonymousSignIn}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: '500',
              opacity: 0.8,
            }}
          >
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
