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
import { useTheme } from '../hooks/useTheme';
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
  const { colors } = useTheme();
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
        <View style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Loading profile...</Text>
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
        }}
      >
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>Close</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>
          Profile Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Display Name */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Display Name
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: 8,
              padding: 16,
              color: colors.text,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your display name"
            placeholderTextColor={colors.text + '80'}
          />
        </View>

        {/* Bio */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Bio
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.card,
              borderRadius: 8,
              padding: 16,
              color: colors.text,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            placeholderTextColor={colors.text + '80'}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Communication Style */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Communication Style
          </Text>
          {communicationOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: communicationStyle === option.value ? colors.primary : colors.card,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: communicationStyle === option.value ? 0 : 1,
                borderColor: colors.border,
              }}
              onPress={() => setCommunicationStyle(option.value as 'descriptive' | 'concise' | 'funny')}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: communicationStyle === option.value ? 'white' : colors.border,
                  marginRight: 12,
                  backgroundColor:
                    communicationStyle === option.value
                      ? 'white'
                      : 'transparent',
                }}
              />
              <Text style={{ 
                color: communicationStyle === option.value ? 'white' : colors.text, 
                fontSize: 16 
              }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals Section */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
              }}
            >
              Goals
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
              onPress={() => setShowGoalModal(true)}
            >
              <Text style={{ color: 'white', fontSize: 14 }}>+ Add Goal</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Goals */}
          {goals.personal.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
                opacity: 0.8,
              }}>
                Personal Goals
              </Text>
              {goals.personal.map((goal) => (
                <View
                  key={goal.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    marginBottom: 8,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 16,
                    }}
                    onPress={() => toggleGoalExpansion(goal.id)}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: '500',
                        flex: 1,
                        textDecorationLine: goal.completed ? 'line-through' : 'none',
                        opacity: goal.completed ? 0.6 : 1,
                      }}
                    >
                      {goal.title}
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.6 }}>
                      {expandedGoals.has(goal.id) ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>

                  {expandedGoals.has(goal.id) && (
                    <View
                      style={{
                        padding: 16,
                        paddingTop: 0,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      {goal.description ? (
                        <Text
                          style={{
                            color: colors.text,
                            opacity: 0.8,
                            marginBottom: 12,
                          }}
                        >
                          {goal.description}
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#ff4444',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          alignSelf: 'flex-start',
                        }}
                        onPress={() => handleDeleteGoal(goal.id, 'personal')}
                      >
                        <Text style={{ color: 'white', fontSize: 12 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Professional Goals */}
          {goals.professional.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
                opacity: 0.8,
              }}>
                Professional Goals
              </Text>
              {goals.professional.map((goal) => (
                <View
                  key={goal.id}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    marginBottom: 8,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 16,
                    }}
                    onPress={() => toggleGoalExpansion(goal.id)}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 16,
                        fontWeight: '500',
                        flex: 1,
                        textDecorationLine: goal.completed ? 'line-through' : 'none',
                        opacity: goal.completed ? 0.6 : 1,
                      }}
                    >
                      {goal.title}
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.6 }}>
                      {expandedGoals.has(goal.id) ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>

                  {expandedGoals.has(goal.id) && (
                    <View
                      style={{
                        padding: 16,
                        paddingTop: 0,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      {goal.description ? (
                        <Text
                          style={{
                            color: colors.text,
                            opacity: 0.8,
                            marginBottom: 12,
                          }}
                        >
                          {goal.description}
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#ff4444',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          alignSelf: 'flex-start',
                        }}
                        onPress={() => handleDeleteGoal(goal.id, 'professional')}
                      >
                        <Text style={{ color: 'white', fontSize: 12 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Interests Section */}
        <View style={{ marginBottom: 30 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
              }}
            >
              Interests
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
              onPress={() => setShowInterestModal(true)}
            >
              <Text style={{ color: 'white', fontSize: 14 }}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {interests.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => handleRemoveInterest(interest)}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    marginRight: 6,
                  }}
                >
                  {interest}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    opacity: 0.6,
                    fontSize: 16,
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#ff4444',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            marginBottom: 40,
          }}
          onPress={handleLogout}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
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
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 300,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Add Interest
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                fontSize: 16,
                marginBottom: 16,
              }}
              placeholder="Enter interest..."
              placeholderTextColor={colors.text + '80'}
              value={newInterest}
              onChangeText={setNewInterest}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
                onPress={() => setShowInterestModal(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
                onPress={handleAddInterest}
              >
                <Text style={{ color: 'white' }}>Add</Text>
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
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 350,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Add Goal
            </Text>
            
            {/* Category Selection */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.text, marginBottom: 8, fontSize: 16 }}>Category</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: newGoal.category === 'personal' ? colors.primary : colors.card,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                  }}
                  onPress={() => setNewGoal({ ...newGoal, category: 'personal' })}
                >
                  <Text style={{ color: newGoal.category === 'personal' ? 'white' : colors.text }}>
                    Personal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: newGoal.category === 'professional' ? colors.primary : colors.card,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                  }}
                  onPress={() => setNewGoal({ ...newGoal, category: 'professional' })}
                >
                  <Text style={{ color: newGoal.category === 'professional' ? 'white' : colors.text }}>
                    Professional
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                fontSize: 16,
                marginBottom: 12,
              }}
              placeholder="Goal title..."
              placeholderTextColor={colors.text + '80'}
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
            />
            <TextInput
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: 12,
                color: colors.text,
                fontSize: 16,
                marginBottom: 16,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholder="Goal description (optional)..."
              placeholderTextColor={colors.text + '80'}
              value={newGoal.description}
              onChangeText={(text) =>
                setNewGoal({ ...newGoal, description: text })
              }
              multiline
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
                onPress={handleAddGoal}
              >
                <Text style={{ color: 'white' }}>Add Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
