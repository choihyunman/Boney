import { Stack } from "expo-router";

export default function MenuLayout() {
  return (
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
    />
  );
}
