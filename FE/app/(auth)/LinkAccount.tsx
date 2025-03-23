// app/(auth)/LinkAccount.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function LinkAccount(): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>계좌연동 페이지</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
