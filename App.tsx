import { ApiProvider } from "@/context/ApiContext";
import NavigationRoot from "@/navigation/MainTabs";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <ApiProvider>
        <NavigationRoot />
      </ApiProvider>
    </SafeAreaProvider>
  );
}
