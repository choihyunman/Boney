import { Stack } from "expo-router";

export default function NotificationLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
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
    </Stack>
  );
}
