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
}

export function CustomTabs({ tabs }: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const theme = useTheme();

  const activeTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <View className="flex-1">
      {/* Tab Header */}
      <View 
        className="flex-row mx-4 mt-4 rounded-lg p-1"
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

      {/* Tab Content */}
      <View className="flex-1">
        {activeTabComponent}
      </View>
    </View>
  );
}
