import React from "react";
import { Stack } from "expo-router";

export default function QuestParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        presentation: "modal",
        animationDuration: 200,
        gestureEnabled: true,
        gestureDirection: "vertical",
        animationTypeForReplace: "push",
      }}
    />
  );
}
