import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

export function UserMessage({
  part,
}: {
  part: { type: string; text: string };
}) {
  const theme = useTheme();
  
  return (
    <Animated.View entering={FadeIn} className="flex flex-row justify-end">
      <View
        className="p-3 rounded-xl rounded-br-md border"
        style={{ 
          borderCurve: "continuous",
          backgroundColor: theme.isDark ? '#1e40af' : '#dbeafe',
          borderColor: theme.isDark ? '#3b82f6' : '#93c5fd'
        }}
      >
        <Text 
          className="text-base"
          style={{ color: theme.isDark ? '#ffffff' : '#1e40af' }}
        >
          {part.text}
        </Text>
      </View>
    </Animated.View>
  );
}
