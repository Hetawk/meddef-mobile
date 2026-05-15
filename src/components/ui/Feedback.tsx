import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { space } from "@/theme/tokens";

type Props = {
  title?: string;
  message: string;
};

/** Prominent error panel — use for recoverable API / validation errors. */
export function ErrorBanner({ title = "Something went wrong", message }: Props) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  title: { fontWeight: "700", color: "#991b1b", marginBottom: 4 },
  body: { fontSize: 13, color: "#b91c1c", lineHeight: 19 },
});

type EmptyProps = {
  title: string;
  subtitle: string;
};

/** Soft empty state inside scroll content. */
export function EmptyStateHint({ title, subtitle }: EmptyProps) {
  return (
    <View style={emptyStyles.box}>
      <Text style={emptyStyles.title}>{title}</Text>
      <Text style={emptyStyles.sub}>{subtitle}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  box: {
    marginTop: space.xl,
    padding: space.lg,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 12,
    gap: 6,
  },
  title: { fontSize: 14, fontWeight: "600", color: colors.muted },
  sub: { fontSize: 12, color: "#94a3b8", textAlign: "center", lineHeight: 18 },
});
