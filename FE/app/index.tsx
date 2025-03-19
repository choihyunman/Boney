import { StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Nav from "../components/Nav";

// 폰트 로딩 중 스플래시 스크린을 보여줌
SplashScreen.preventAutoHideAsync();

export default function Home() {
  const [fontsLoaded, fontError] = useFonts({
    "NEXONLv1Gothic-Bold": require("../assets/fonts/NEXONLv1GothicBold.ttf"),
    "NEXONLv1Gothic-Light": require("../assets/fonts/NEXONLv1GothicLight.ttf"),
    "NEXONLv1Gothic-Regular": require("../assets/fonts/NEXONLv1GothicRegular.ttf"),
  });

  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
  }, [fontError]);

  const onLayoutRootView = useCallback(async () => {
    try {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
      }
    } catch (e) {
      console.warn(e);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="auto" />
      <Nav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
