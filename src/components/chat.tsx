import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { Fragment, useEffect, useRef } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { KeyboardPaddingView } from "@/components/keyboard-padding";
import { CelsiusConvertCard, WeatherCard } from "@/components/tool-cards";
import { UserMessage } from "@/components/user-message";
import { useTheme } from "@/hooks/useTheme";

export function Chat() {
  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    maxSteps: 5,
  });
  const { isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-destructive text-center">{error.message}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 p-4 pb-8"
        className="flex-1 bg-chat-background"
      >
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
        <KeyboardPaddingView />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          [process.env.EXPO_OS === "web"
            ? `backgroundImage`
            : `experimental_backgroundImage`]: isDark
            ? `linear-gradient(to bottom, #00000000, #000000)`
            : `linear-gradient(to bottom, #FFFFFF00, #FFFFFF)`,
        }}
      >
        <View
          className="web:drop-shadow-xl overflow-visible rounded-xl m-3 bg-card shadow-lg"
        >
          <TextInput
            className="p-4 text-base text-foreground outline-none"
            placeholder="Ask about the weather..."
            value={input}
            placeholderTextColor="rgb(var(--muted-foreground))"
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.nativeEvent.text,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmitEditing={(e) => {
              handleSubmit(e);
              e.preventDefault();
            }}
            autoFocus
          />
        </View>

        <KeyboardPaddingView />
      </View>
    </>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  const content = message.parts
    .map((part) => {
      switch (part.type) {
        case "text": {
          if (isUser) {
            return <UserMessage part={part} />;
          }
          return <Text className="text-lg text-foreground">{part.text}</Text>;
        }
        case "step-start":
          return null;
        case "tool-invocation": {
          const { toolInvocation } = part;

          if (toolInvocation.state === "result") {
            if (toolInvocation.toolName === "weather") {
              return <WeatherCard {...toolInvocation.result} />;
            } else if (
              toolInvocation.toolName === "convertFahrenheitToCelsius"
            ) {
              return <CelsiusConvertCard {...toolInvocation.result} />;
            }

            return (
              <Text>
                Tool: {toolInvocation.toolName} - Result:{" "}
                {JSON.stringify(toolInvocation.result, null, 2)}
              </Text>
            );
          }
          return null;
        }
        default:
          return <Text>{JSON.stringify(part, null, 2)}</Text>;
      }
    })
    .filter(Boolean);

  return (
    <View className="gap-2">
      {content.map((jsx, key) => (
        <Fragment key={key}>{jsx}</Fragment>
      ))}
    </View>
  );
}
