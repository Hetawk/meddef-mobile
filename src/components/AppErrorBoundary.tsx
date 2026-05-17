import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { hideSplashScreen } from "@/lib/splash";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("MedDef root error:", error, info.componentStack);
    void hideSplashScreen();
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>MedDef could not start</Text>
          <Text style={styles.msg}>{this.state.error.message}</Text>
          <Text style={styles.hint}>
            If you installed a debug APK, run Metro with `npm start` or install a
            release build (`npm run android:apk:release`).
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0f172a",
  },
  title: { color: "#f8fafc", fontSize: 18, fontWeight: "700", marginBottom: 12 },
  msg: { color: "#fca5a5", fontSize: 14, marginBottom: 16 },
  hint: { color: "#94a3b8", fontSize: 13, lineHeight: 20 },
});
