import { ApiProvider } from "@/context/ApiContext";
import { useAppUpdateCheck } from "@/hooks/useAppUpdate";
import NavigationRoot from "@/navigation/MainTabs";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const SPLASH_MIN_MS = 600;

function AppRoot() {
  useAppUpdateCheck();
  return <NavigationRoot />;
}

export default function App() {
  useEffect(() => {
    const id = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, SPLASH_MIN_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApiProvider>
          <AppRoot />
        </ApiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
