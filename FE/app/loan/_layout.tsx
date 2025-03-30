import { Stack } from "expo-router";

export default function LoanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: "vertical",
        contentStyle: { backgroundColor: "#FFFFFF" },
        animationTypeForReplace: "push",
      }}
    ></Stack>
  );
}
