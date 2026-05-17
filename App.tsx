import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { ApiProvider } from "@/context/ApiContext";
import { useAppUpdateCheck } from "@/hooks/useAppUpdate";
import { hideSplashAfterReady } from "@/lib/splash";
import NavigationRoot from "@/navigation/MainTabs";
import React, { useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AppRoot() {
  useAppUpdateCheck();
  return <NavigationRoot />;
}

export default function App() {
  const [layoutReady, setLayoutReady] = useState(false);

  const onRootLayout = useCallback(() => {
    if (layoutReady) return;
    setLayoutReady(true);
    hideSplashAfterReady();
  }, [layoutReady]);

  return (
    <AppErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onRootLayout}>
        <SafeAreaProvider>
          <ApiProvider>
            <AppRoot />
          </ApiProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AppErrorBoundary>
  );
}
