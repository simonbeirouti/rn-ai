import { Text, ViewProps } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";

function ToolCard(props: ViewProps) {
  const theme = useTheme();
  
  return (
    <Animated.View
      entering={FadeIn}
      className="p-4 rounded-2xl gap border transition-all duration-200"
      style={[
        { 
          borderCurve: "continuous",
          backgroundColor: theme.colors.card,
          borderColor: theme.isDark ? '#374151' : '#d1d5db'
        },
        props.style
      ]}
      {...props}
    />
  );
}

export function WeatherCard({
  location,
  temperature,
}: {
  location: string;
  temperature: number;
}) {
  const theme = useTheme();
  
  return (
    <ToolCard>
      <Text className="text-lg font-semibold" style={{ color: theme.colors.text }}>Weather in {location}</Text>
      <Text style={{ color: theme.colors.tabInactiveText }}>Current temperature:</Text>
      <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>{temperature}°F</Text>
    </ToolCard>
  );
}

export function CelsiusConvertCard({
  celsius,
  temperature,
}: {
  celsius: number;
  temperature: number;
}) {
  const theme = useTheme();
  
  return (
    <ToolCard>
      <Text className="text-lg font-semibold" style={{ color: theme.colors.text }}>Temperature Conversion</Text>
      <Text style={{ color: theme.colors.tabInactiveText }}>
        Converted {temperature}°F to Celsius:
      </Text>
      <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>{celsius}°C</Text>
    </ToolCard>
  );
}
