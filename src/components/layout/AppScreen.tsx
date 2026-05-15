import React from "react";
import { ScrollView, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { common } from "@/theme/common";

type Props = {
  children: React.ReactNode;
  /** Extra ScrollView content style (padding is already applied). */
  contentStyle?: ViewStyle;
};

/**
 * Standard screen shell: safe area, padded scroll, keyboard-friendly taps.
 */
export function AppScreen({ children, contentStyle }: Props) {
  return (
    <SafeAreaView style={common.screen} edges={["bottom"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[common.scroll, contentStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
