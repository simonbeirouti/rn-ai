import { Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export function UserMessage({
  part,
}: {
  part: { type: string; text: string };
}) {
  return (
    <Animated.View entering={FadeIn} className="flex flex-row justify-end">
      <View
        className="p-3 rounded-xl rounded-br-md border bg-primary border-primary"
        style={{
          borderCurve: "continuous",
        }}
      >
        <Text className="text-base text-primary-foreground">
          {part.text}
        </Text>
      </View>
    </Animated.View>
  );
}
