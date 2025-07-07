import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const mockChannels = [
  { id: '1', name: 'general', description: 'General discussion', unread: 3 },
  { id: '2', name: 'random', description: 'Random conversations', unread: 0 },
  { id: '3', name: 'tech-talk', description: 'Technical discussions', unread: 7 },
  { id: '4', name: 'announcements', description: 'Important updates', unread: 1 },
];

export function Channels() {
  return (
    <View className="flex-1 bg-chat-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {mockChannels.map((channel) => (
          <TouchableOpacity
            key={channel.id}
            className="rounded-lg p-4 shadow-sm border bg-card border-border"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-semibold text-foreground">
                    #{channel.name}
                  </Text>
                  {channel.unread > 0 && (
                    <View className="bg-primary rounded-full px-2 py-1 min-w-[20px] items-center">
                      <Text className="text-primary-foreground text-xs font-medium">
                        {channel.unread}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="mt-1 text-muted-foreground">
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
