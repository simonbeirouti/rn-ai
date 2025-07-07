import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Tab {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface CustomTabsProps {
  tabs: Tab[];
  onProfilePress?: () => void;
}

export function CustomTabs({ tabs, onProfilePress }: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const activeTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <View className="flex-1 bg-background">
      {/* Tab Header */}
      <View className="flex-row items-center mx-2 mt-2 gap-2">
        {/* Profile Button */}
        {onProfilePress && (
          <TouchableOpacity
            onPress={onProfilePress}
            className="p-3 rounded-lg bg-tab-background"
          >
            <Text className="text-center font-medium text-foreground">
              👤
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row flex-1 rounded-lg p-2 bg-tab-background">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md ${
                activeTab === tab.id ? 'bg-tab-active-background' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab.id ? 'text-foreground' : 'text-tab-inactive-text'
                }`}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTabComponent}
      </View>
    </View>
  );
}
