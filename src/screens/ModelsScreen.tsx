import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MODEL_VARIANTS } from "@/data/modelVariants";
import { colors } from "@/theme/colors";

export default function ModelsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Models</Text>
        <Text style={styles.lead}>
          Ablation matrix aligned with the thesis (web dashboard). Deployment uses
          ONNX on your Next.js backend.
        </Text>
        {MODEL_VARIANTS.map((v) => (
          <View
            key={v.key}
            style={[
              styles.card,
              v.primary && { borderColor: v.accent, borderWidth: 2 },
            ]}
          >
            <View style={[styles.strip, { backgroundColor: v.accent }]} />
            <Text style={styles.title}>{v.label}</Text>
            <Text style={styles.key}>{v.key}</Text>
            <Text style={styles.desc}>{v.description}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 22, fontWeight: "700", color: colors.text },
  lead: { marginTop: 6, fontSize: 13, color: colors.muted, lineHeight: 20 },
  card: {
    marginTop: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    paddingLeft: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  strip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  title: { fontSize: 15, fontWeight: "700", color: colors.text },
  key: {
    fontFamily: "monospace",
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  desc: { marginTop: 8, fontSize: 13, color: colors.muted, lineHeight: 20 },
});
