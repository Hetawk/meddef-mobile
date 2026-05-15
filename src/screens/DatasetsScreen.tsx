import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DATASETS } from "@/data/datasets";
import { colors } from "@/theme/colors";

export default function DatasetsScreen() {
  const list = Object.values(DATASETS);
  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Datasets</Text>
        <Text style={styles.lead}>
          Medical imaging datasets used for training and evaluation (mirrors web).
        </Text>
        {list.map((d) => (
          <View key={d.name} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.icon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{d.displayName}</Text>
                <Text style={styles.mono}>{d.name}</Text>
              </View>
            </View>
            <Text style={styles.desc}>{d.description}</Text>
            <Text style={styles.clsTitle}>Classes</Text>
            <View style={styles.badges}>
              {d.classes.map((c) => (
                <View key={c} style={styles.badge}>
                  <Text style={styles.badgeTxt}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
        <View style={[styles.card, { marginTop: 8 }]}>
          <Text style={styles.foot}>
            ONNX models are loaded by the Next.js server from `public/models/onnx/`.
            This app sends tensors to `/api/infer` — no model files on the phone.
          </Text>
        </View>
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
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.text },
  mono: { fontSize: 11, color: colors.muted, fontFamily: "monospace" },
  desc: { marginTop: 10, fontSize: 13, color: colors.muted, lineHeight: 20 },
  clsTitle: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  badge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTxt: { fontSize: 11, color: colors.text, fontWeight: "600" },
  foot: { fontSize: 12, color: colors.muted, lineHeight: 18 },
});
