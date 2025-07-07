import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface OnboardingScreenProps {
  onComplete: (userData: UserData) => void;
}

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
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState<'descriptive' | 'concise' | 'funny'>('descriptive');
  const [personalGoal, setPersonalGoal] = useState('');
  const [personalGoalDescription, setPersonalGoalDescription] = useState('');
  const [professionalGoal, setProfessionalGoal] = useState('');
  const [professionalGoalDescription, setProfessionalGoalDescription] = useState('');
  const { colors } = useTheme();

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (!displayName.trim()) {
      Alert.alert('Required Field', 'Please enter your display name');
      return;
    }

    const goals: { personal: Goal[]; professional: Goal[] } = {
      personal: personalGoal.trim() ? [{
        id: Date.now().toString() + '_personal',
        title: personalGoal.trim(),
        description: personalGoalDescription.trim(),
        completed: false,
      }] : [],
      professional: professionalGoal.trim() ? [{
        id: Date.now().toString() + '_professional',
        title: professionalGoal.trim(),
        description: professionalGoalDescription.trim(),
        completed: false,
      }] : [],
    };

    const userData: UserData = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      interests: interests,
      communicationStyle: communicationStyle,
      goals: goals,
    };

    onComplete(userData);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
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
          Welcome! 👋
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            opacity: 0.7,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          Let's set up your profile to get started
        </Text>
      </View>

      <View style={{ gap: 24 }}>
        {/* Display Name */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Display Name *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              color: colors.text,
              fontSize: 16,
            }}
            placeholder="How should we call you?"
            placeholderTextColor={colors.text + '80'}
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={50}
          />
        </View>

        {/* Bio */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Bio
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              color: colors.text,
              fontSize: 16,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            placeholder="Tell us a bit about yourself..."
            placeholderTextColor={colors.text + '80'}
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={200}
          />
          <Text
            style={{
              fontSize: 12,
              color: colors.text,
              opacity: 0.6,
              textAlign: 'right',
              marginTop: 4,
            }}
          >
            {bio.length}/200
          </Text>
        </View>

        {/* Communication Style */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Communication Style
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['descriptive', 'concise', 'funny'] as const).map((style) => (
              <TouchableOpacity
                key={style}
                style={{
                  flex: 1,
                  backgroundColor: communicationStyle === style ? colors.primary : colors.card,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
                onPress={() => setCommunicationStyle(style)}
              >
                <Text
                  style={{
                    color: communicationStyle === style ? 'white' : colors.text,
                    fontSize: 14,
                    fontWeight: '500',
                    textTransform: 'capitalize',
                  }}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goals */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Goals (Optional)
          </Text>
          
          {/* Personal Goal */}
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.text,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Personal Goal
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                fontSize: 14,
              }}
              placeholder="e.g., Run a marathon"
              placeholderTextColor={colors.text + '80'}
              value={personalGoal}
              onChangeText={setPersonalGoal}
              maxLength={100}
            />
            {personalGoal.trim() && (
              <TextInput
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.text,
                  fontSize: 14,
                  marginTop: 8,
                  minHeight: 60,
                  textAlignVertical: 'top',
                }}
                placeholder="Describe your personal goal (optional)..."
                placeholderTextColor={colors.text + '80'}
                value={personalGoalDescription}
                onChangeText={setPersonalGoalDescription}
                multiline
                maxLength={200}
              />
            )}
          </View>

          {/* Professional Goal */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.text,
                marginBottom: 6,
                opacity: 0.8,
              }}
            >
              Professional Goal
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                fontSize: 14,
              }}
              placeholder="e.g., Launch project #2"
              placeholderTextColor={colors.text + '80'}
              value={professionalGoal}
              onChangeText={setProfessionalGoal}
              maxLength={100}
            />
            {professionalGoal.trim() && (
              <TextInput
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.text,
                  fontSize: 14,
                  marginTop: 8,
                  minHeight: 60,
                  textAlignVertical: 'top',
                }}
                placeholder="Describe your professional goal (optional)..."
                placeholderTextColor={colors.text + '80'}
                value={professionalGoalDescription}
                onChangeText={setProfessionalGoalDescription}
                multiline
                maxLength={200}
              />
            )}
          </View>
        </View>

        {/* Interests */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Interests
          </Text>
          
          {/* Add Interest Input */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                fontSize: 14,
              }}
              placeholder="Add an interest"
              placeholderTextColor={colors.text + '80'}
              value={newInterest}
              onChangeText={setNewInterest}
              maxLength={30}
              onSubmitEditing={addInterest}
            />
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 12,
                justifyContent: 'center',
              }}
              onPress={addInterest}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Interest Tags */}
          {interests.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {interests.map((interest, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onPress={() => removeInterest(index)}
                >
                  <Text style={{ color: colors.text, fontSize: 12 }}>{interest}</Text>
                  <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6 }}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Complete Button */}
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary,
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          marginTop: 40,
          marginBottom: 20,
        }}
        onPress={handleComplete}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Complete Setup
        </Text>
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity
        style={{
          alignItems: 'center',
          padding: 12,
        }}
        onPress={() => onComplete({
          displayName: displayName || 'User',
          bio: '',
          interests: [],
          communicationStyle: 'descriptive',
          goals: { personal: [], professional: [] },
        })}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          Skip for now
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
