import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
// import { useTheme } from '../hooks/useTheme';

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
  // const { colors } = useTheme();

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
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-foreground mb-2">
          Welcome! 👋
        </Text>
        <Text className="text-base text-muted-foreground text-center leading-6">
          Let's set up your profile to get started
        </Text>
      </View>

      <View style={{ gap: 24 }}>
        {/* Display Name */}
        <View>
          <Text className="text-base font-semibold text-foreground mb-2">
            Display Name *
          </Text>
          <TextInput
            className="bg-card rounded-xl p-4 text-foreground text-base border border-border"
            placeholder="How should we call you?"
            placeholderTextColor="rgb(var(--muted-foreground))"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={50}
          />
        </View>

        {/* Bio */}
        <View>
          <Text className="text-base font-semibold text-foreground mb-2">
            Bio
          </Text>
          <TextInput
            className="bg-card rounded-xl p-4 text-foreground text-base border border-border min-h-[100px]"
            style={{ textAlignVertical: 'top' }}
            placeholder="Tell us a bit about yourself..."
            placeholderTextColor="rgb(var(--muted-foreground))"
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={200}
          />
          <Text className="text-xs text-muted-foreground text-right mt-1">
            {bio.length}/200
          </Text>
        </View>

        {/* Communication Style */}
        <View>
          <Text className="text-base font-semibold text-foreground mb-2">
            Communication Style
          </Text>
          <View className="flex-row gap-2">
            {(['descriptive', 'concise', 'funny'] as const).map((style) => (
              <TouchableOpacity
                key={style}
                className={`flex-1 rounded-lg p-3 items-center border ${communicationStyle === style
                    ? 'bg-primary border-transparent'
                    : 'bg-card border-border'
                  }`}
                onPress={() => setCommunicationStyle(style)}
              >
                <Text
                  className={`text-sm font-medium capitalize ${communicationStyle === style ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goals */}
        <View>
          <Text className="text-base font-semibold text-foreground mb-2">
            Goals (Optional)
          </Text>

          {/* Personal Goal */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-foreground mb-1 opacity-80">
              Personal Goal
            </Text>
            <TextInput
              className="bg-card rounded-lg p-3 text-foreground text-sm"
              placeholder="e.g., Run a marathon"
              placeholderTextColor="rgb(var(--muted-foreground))"
              value={personalGoal}
              onChangeText={setPersonalGoal}
              maxLength={100}
            />
            {personalGoal.trim() && (
              <TextInput
                className="bg-card rounded-lg p-3 text-foreground text-sm mt-3 min-h-[60px]"
                style={{ textAlignVertical: 'top' }}
                placeholder="Describe your personal goal (optional)..."
                placeholderTextColor="rgb(var(--muted-foreground))"
                value={personalGoalDescription}
                onChangeText={setPersonalGoalDescription}
                multiline
                maxLength={200}
              />
            )}
          </View>

          {/* Professional Goal */}
          <View>
            <Text className="text-sm font-medium text-foreground mb-1 opacity-80">
              Professional Goal
            </Text>
            <TextInput
              className="bg-card rounded-lg p-3 text-foreground text-sm"
              placeholder="e.g., Launch project #2"
              placeholderTextColor="rgb(var(--muted-foreground))"
              value={professionalGoal}
              onChangeText={setProfessionalGoal}
              maxLength={100}
            />
            {professionalGoal.trim() && (
              <TextInput
                className="bg-card rounded-lg p-3 text-foreground text-sm mt-3 min-h-[60px]"
                style={{ textAlignVertical: 'top' }}
                placeholder="Describe your professional goal (optional)..."
                placeholderTextColor="rgb(var(--muted-foreground))"
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
          <Text className="text-base font-semibold text-foreground mb-2">
            Interests
          </Text>

          {/* Add Interest Input */}
          <View className="flex-row gap-2 mb-3">
            <TextInput
              className="flex-1 bg-card rounded-lg p-3 text-foreground text-sm"
              placeholder="Add an interest"
              placeholderTextColor="rgb(var(--muted-foreground))"
              value={newInterest}
              onChangeText={setNewInterest}
              maxLength={30}
              onSubmitEditing={addInterest}
            />
            <TouchableOpacity
              className="bg-primary rounded-lg p-3 justify-center"
              onPress={addInterest}
            >
              <Text className="text-sm font-medium text-primary-foreground">
                Add
              </Text>
            </TouchableOpacity>
          </View>

          {/* Interest Tags */}
          {interests.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-card rounded-full px-3 py-1 flex-row items-center gap-1"
                  onPress={() => removeInterest(index)}
                >
                  <Text className="text-xs text-foreground">
                    {interest}
                  </Text>
                  <Text className="text-sm text-foreground opacity-60">×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Complete Button */}
      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center mt-10 mb-5"
        onPress={handleComplete}
      >
        <Text className="text-base font-semibold text-primary-foreground">
          Complete Setup
        </Text>
      </TouchableOpacity>

      {/* Skip Button */}
      <TouchableOpacity
        className="items-center p-3"
        onPress={() => onComplete({
          displayName: displayName || 'User',
          bio: '',
          interests: [],
          communicationStyle: 'descriptive',
          goals: { personal: [], professional: [] },
        })}
      >
        <Text className="text-sm text-foreground opacity-70">
          Skip for now
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
