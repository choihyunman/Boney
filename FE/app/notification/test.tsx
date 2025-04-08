import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Stack } from "expo-router";
import PushNotificationTest from "@/components/PushNotificationTest";

export default function NotificationTestScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "푸시 알림 테스트",
          headerShown: true,
        }}
      />

      <ScrollView>
        <PushNotificationTest />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
