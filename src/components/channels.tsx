import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const mockChannels = [
  { id: '1', name: 'general', description: 'General discussion', unread: 3 },
  { id: '2', name: 'random', description: 'Random conversations', unread: 0 },
  { id: '3', name: 'tech-talk', description: 'Technical discussions', unread: 7 },
  { id: '4', name: 'announcements', description: 'Important updates', unread: 1 },
];

export function Channels() {
  const theme = useTheme();
  
  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.chatBackground }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {mockChannels.map((channel) => (
          <TouchableOpacity
            key={channel.id}
            className="rounded-lg p-4 shadow-sm border"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.isDark ? '#374151' : '#f3f4f6'
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text 
                    className="text-lg font-semibold"
                    style={{ color: theme.colors.text }}
                  >
                    #{channel.name}
                  </Text>
                  {channel.unread > 0 && (
                    <View className="bg-blue-500 rounded-full px-2 py-1 min-w-[20px] items-center">
                      <Text className="text-white text-xs font-medium">
                        {channel.unread}
                      </Text>
                    </View>
                  )}
                </View>
                <Text 
                  className="mt-1"
                  style={{ color: theme.colors.tabInactiveText }}
                >
                  {channel.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
