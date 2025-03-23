import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View, AppState } from "react-native";
import { SessionProvider } from "../ctx";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "NEXONLv1Gothic-Bold": require("../assets/fonts/NEXONLv1GothicBold.ttf"),
    "NEXONLv1Gothic-Light": require("../assets/fonts/NEXONLv1GothicLight.ttf"),
    "NEXONLv1Gothic-Regular": require("../assets/fonts/NEXONLv1GothicRegular.ttf"),
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AppState.addEventListener("change", (state) => {
      console.log("📱 앱 상태:", state); // active / background / inactive
    });

    const prepare = async () => {
      if (fontsLoaded || fontError) {
        await SplashScreen.hideAsync();
        setIsReady(true);
      }
    };
    prepare();
  }, [fontsLoaded, fontError]);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "white" }} />;
  }

  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
