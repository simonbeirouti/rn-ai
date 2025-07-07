import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

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
  const theme = useTheme();

  const activeTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <View className="flex-1">
      {/* Tab Header */}
      <View className="flex-row items-center mx-4 mt-4 gap-2">
        <View 
          className="flex-row flex-1 rounded-lg p-1"
          style={{ backgroundColor: theme.colors.tabBackground }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className="flex-1 py-3 px-4 rounded-md"
              style={{
                backgroundColor: activeTab === tab.id 
                  ? theme.colors.tabActiveBackground 
                  : 'transparent'
              }}
            >
              <Text 
                className="text-center font-medium"
                style={{
                  color: activeTab === tab.id 
                    ? theme.colors.text 
                    : theme.colors.tabInactiveText
                }}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Profile Button */}
        {onProfilePress && (
          <TouchableOpacity
            onPress={onProfilePress}
            className="p-3 rounded-lg"
            style={{ backgroundColor: theme.colors.tabBackground }}
          >
            <Text 
              className="text-center font-medium"
              style={{ color: theme.colors.text }}
            >
              👤
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTabComponent}
      </View>
    </View>
  );
}
