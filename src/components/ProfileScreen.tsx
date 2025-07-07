import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useUpdateUserData } from '../queries/userQueries';

interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface ProfileScreenProps {
  onClose: () => void;
}

export function ProfileScreen({ onClose }: ProfileScreenProps) {
  const { logout } = useAuthStore();
  const { userData } = useUserStore();
  const updateUserMutation = useUpdateUserData();
  
  const [communicationStyle, setCommunicationStyle] = useState<'descriptive' | 'concise' | 'funny'>(
    userData?.communicationStyle || 'descriptive'
  );
  const [goals, setGoals] = useState<{ personal: Goal[], professional: Goal[] }>(() => {
    if (userData?.goals) {
      // Handle both old array format and new object format
      if (Array.isArray(userData.goals)) {
        return { personal: userData.goals, professional: [] };
      }
      return userData.goals;
    }
    return { personal: [], professional: [] };
  });
  const [interests, setInterests] = useState<string[]>(userData?.interests || []);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  
  // Modal states
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'personal' as 'personal' | 'professional' });
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [editingProfile, setEditingProfile] = useState(false);

  const communicationOptions = [
    { value: 'descriptive', label: 'Descriptive' },
    { value: 'concise', label: 'Concise' },
    { value: 'funny', label: 'Funny' },
  ];

  // Sync local state with userData when it changes
  useEffect(() => {
    if (userData) {
      setCommunicationStyle(userData.communicationStyle || 'descriptive');
      setDisplayName(userData.displayName || '');
      setBio(userData.bio || '');
      setInterests(userData.interests || []);
      
      // Handle goals format
      if (userData.goals) {
        if (Array.isArray(userData.goals)) {
          setGoals({ personal: userData.goals, professional: [] });
        } else {
          setGoals(userData.goals);
        }
      } else {
        setGoals({ personal: [], professional: [] });
      }
    }
  }, [userData]);

  // Auto-save effects with Firebase persistence
  useEffect(() => {
    if (userData && communicationStyle !== userData.communicationStyle) {
      const timer = setTimeout(() => {
        updateUserMutation.mutate({ communicationStyle });
      }, 1000); // Debounce for 1 second
      return () => clearTimeout(timer);
    }
  }, [communicationStyle, userData, updateUserMutation]);

  useEffect(() => {
    if (userData && JSON.stringify(goals) !== JSON.stringify(userData.goals)) {
      const timer = setTimeout(() => {
        updateUserMutation.mutate({ goals });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [goals, userData, updateUserMutation]);

  useEffect(() => {
    if (userData && JSON.stringify(interests) !== JSON.stringify(userData.interests)) {
      const timer = setTimeout(() => {
        updateUserMutation.mutate({ interests });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [interests, userData, updateUserMutation]);

  useEffect(() => {
    if (userData && displayName !== userData.displayName) {
      const timer = setTimeout(() => {
        updateUserMutation.mutate({ displayName });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [displayName, userData, updateUserMutation]);

  useEffect(() => {
    if (userData && bio !== userData.bio) {
      const timer = setTimeout(() => {
        updateUserMutation.mutate({ bio });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bio, userData, updateUserMutation]);

  const handleSaveChanges = async () => {
    try {
      await updateUserMutation.mutateAsync({
        displayName,
        bio,
        communicationStyle,
        goals,
        interests,
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setEditingProfile(false);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // Show loading state if no user data is available yet
  if (!userData) {
    return (
      <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-background justify-center items-center">
          <Text className="text-foreground text-base">Loading profile...</Text>
        </View>
      </Modal>
    );
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
      setShowInterestModal(false);
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title.trim(),
        description: newGoal.description.trim(),
        completed: false,
      };
      
      setGoals(prev => ({
        ...prev,
        [newGoal.category]: [...prev[newGoal.category], goal]
      }));
      
      setNewGoal({ title: '', description: '', category: 'personal' });
      setShowGoalModal(false);
    }
  };

  const handleDeleteGoal = (goalId: string, category: 'personal' | 'professional') => {
    setGoals(prev => ({
      ...prev,
      [category]: prev[category].filter(goal => goal.id !== goalId)
    }));
  };

  const handleToggleGoal = (goalId: string, category: 'personal' | 'professional') => {
    setGoals(prev => ({
      ...prev,
      [category]: prev[category].map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    }));
  };

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-5">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-primary text-base">Close</Text>
        </TouchableOpacity>
        <Text className="text-foreground text-lg font-semibold">
          Profile Settings
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Display Name */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Display Name
          </Text>
          <TextInput
            className="bg-card rounded-lg p-4 text-foreground text-base border border-border"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your display name"
            placeholderTextColor="rgb(var(--muted-foreground))"
          />
        </View>

        {/* Bio */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Bio
          </Text>
          <TextInput
            className="bg-card rounded-lg p-4 text-foreground text-base border border-border min-h-[80px]"
            style={{ textAlignVertical: 'top' }}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor="rgb(var(--muted-foreground))"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Communication Style */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-foreground mb-3">
            Communication Style
          </Text>
          {communicationOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`flex-row items-center py-3 px-4 rounded-lg mb-2 border ${
                communicationStyle === option.value
                  ? 'bg-primary border-transparent'
                  : 'bg-card border-border'
              }`}
              onPress={() => setCommunicationStyle(option.value as 'descriptive' | 'concise' | 'funny')}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 ${
                  communicationStyle === option.value
                    ? 'border-primary-foreground bg-primary-foreground'
                    : 'border-border'
                }`}
              />
              <Text
                className={`text-base ${
                  communicationStyle === option.value
                    ? 'text-primary-foreground'
                    : 'text-foreground'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-foreground">
              Goals
            </Text>
            <TouchableOpacity
              className="bg-primary py-1.5 px-3 rounded-md"
              onPress={() => setShowGoalModal(true)}
            >
              <Text className="text-primary-foreground text-sm">+ Add Goal</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Goals */}
          {goals.personal.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-foreground mb-2 opacity-80">
                Personal Goals
              </Text>
              {goals.personal.map((goal) => (
                <View
                  key={goal.id}
                  className="bg-card rounded-lg mb-2 overflow-hidden border border-border"
                >
                  <TouchableOpacity
                    className="flex-row justify-between items-center p-4"
                    onPress={() => toggleGoalExpansion(goal.id)}
                  >
                    <Text
                      className={`text-foreground text-base font-medium flex-1 ${
                        goal.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {goal.title}
                    </Text>
                    <Text className="text-foreground opacity-60">
                      {expandedGoals.has(goal.id) ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>

                  {expandedGoals.has(goal.id) && (
                    <View className="p-4 pt-0 border-t border-border">
                      {goal.description ? (
                        <Text className="text-foreground opacity-80 mb-3">
                          {goal.description}
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        className="bg-destructive py-1.5 px-3 rounded-md self-start"
                        onPress={() => handleDeleteGoal(goal.id, 'personal')}
                      >
                        <Text className="text-destructive-foreground text-xs">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Professional Goals */}
          {goals.professional.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-foreground mb-2 opacity-80">
                Professional Goals
              </Text>
              {goals.professional.map((goal) => (
                <View
                  key={goal.id}
                  className="bg-card rounded-lg mb-2 overflow-hidden border border-border"
                >
                  <TouchableOpacity
                    className="flex-row justify-between items-center p-4"
                    onPress={() => toggleGoalExpansion(goal.id)}
                  >
                    <Text
                      className={`text-foreground text-base font-medium flex-1 ${
                        goal.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {goal.title}
                    </Text>
                    <Text className="text-foreground opacity-60">
                      {expandedGoals.has(goal.id) ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>

                  {expandedGoals.has(goal.id) && (
                    <View className="p-4 pt-0 border-t border-border">
                      {goal.description ? (
                        <Text className="text-foreground opacity-80 mb-3">
                          {goal.description}
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        className="bg-destructive py-1.5 px-3 rounded-md self-start"
                        onPress={() => handleDeleteGoal(goal.id, 'professional')}
                      >
                        <Text className="text-destructive-foreground text-xs">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Interests Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-foreground">
              Interests
            </Text>
            <TouchableOpacity
              className="bg-primary py-1.5 px-3 rounded-md"
              onPress={() => setShowInterestModal(true)}
            >
              <Text className="text-primary-foreground text-sm">+ Add</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {interests.map((interest, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center bg-card py-2 px-3 rounded-full border border-border"
                onPress={() => handleRemoveInterest(interest)}
              >
                <Text className="text-foreground text-sm mr-1.5">
                  {interest}
                </Text>
                <Text className="text-foreground opacity-60 text-base">
                  ×
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-destructive rounded-xl p-4 items-center mb-10"
          onPress={handleLogout}
        >
          <Text className="text-destructive-foreground text-base font-semibold">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Interest Modal */}
      <Modal
        visible={showInterestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInterestModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-background rounded-xl p-5 w-full max-w-[300px]">
            <Text className="text-lg font-semibold text-foreground mb-4 text-center">
              Add Interest
            </Text>
            <TextInput
              className="bg-card rounded-lg p-3 text-foreground text-base mb-4"
              placeholder="Enter interest..."
              placeholderTextColor="rgb(var(--muted-foreground))"
              value={newInterest}
              onChangeText={setNewInterest}
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-card rounded-lg p-3 items-center"
                onPress={() => setShowInterestModal(false)}
              >
                <Text className="text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-lg p-3 items-center"
                onPress={handleAddInterest}
              >
                <Text className="text-primary-foreground">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-background rounded-xl p-5 w-full max-w-[350px]">
            <Text className="text-lg font-semibold text-foreground mb-4 text-center">
              Add Goal
            </Text>
            
            {/* Category Selection */}
            <View className="mb-4">
              <Text className="text-foreground mb-2 text-base">Category</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 rounded-lg p-3 items-center ${
                    newGoal.category === 'personal' ? 'bg-primary' : 'bg-card'
                  }`}
                  onPress={() => setNewGoal({ ...newGoal, category: 'personal' })}
                >
                  <Text
                    className={
                      newGoal.category === 'personal'
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }
                  >
                    Personal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 rounded-lg p-3 items-center ${
                    newGoal.category === 'professional' ? 'bg-primary' : 'bg-card'
                  }`}
                  onPress={() => setNewGoal({ ...newGoal, category: 'professional' })}
                >
                  <Text
                    className={
                      newGoal.category === 'professional'
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }
                  >
                    Professional
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              className="bg-card rounded-lg p-3 text-foreground text-base mb-3"
              placeholder="Goal title..."
              placeholderTextColor="rgb(var(--muted-foreground))"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
            />
            <TextInput
              className="bg-card rounded-lg p-3 text-foreground text-base mb-4 min-h-[80px]"
              style={{ textAlignVertical: 'top' }}
              placeholder="Goal description (optional)..."
              placeholderTextColor="rgb(var(--muted-foreground))"
              value={newGoal.description}
              onChangeText={(text) =>
                setNewGoal({ ...newGoal, description: text })
              }
              multiline
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-card rounded-lg p-3 items-center"
                onPress={() => setShowGoalModal(false)}
              >
                <Text className="text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary rounded-lg p-3 items-center"
                onPress={handleAddGoal}
              >
                <Text className="text-primary-foreground">Add Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
