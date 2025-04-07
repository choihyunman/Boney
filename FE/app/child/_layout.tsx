import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function ChildLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="Register" />
        <Stack.Screen
          name="[id]"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            contentStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
      </Stack>
    </View>
  );
}
