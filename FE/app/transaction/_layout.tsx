import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function TransactionLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          presentation: "modal",
          animationDuration: 200,
          gestureEnabled: true,
          gestureDirection: "vertical",
          contentStyle: {
            backgroundColor: "#FFFFFF",
          },
          animationTypeForReplace: "push",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="[transactionId]" />
      </Stack>
    </View>
  );
}
