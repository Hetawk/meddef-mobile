import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP } from "@/config/app";
import { DATASETS } from "@/data/datasets";
import { useApiBase } from "@/context/ApiContext";
import { colors } from "@/theme/colors";

const stats = [
  { label: "Datasets", value: "3", bg: "#2563eb" },
  { label: "Model Variants", value: "6", bg: "#7c3aed" },
  { label: "Attack Types", value: "8", bg: "#d97706" },
  { label: "Defense", value: "DAAM", bg: "#059669" },
];

export default function OverviewScreen() {
  const { baseUrl, setBaseUrl } = useApiBase();
  const [draft, setDraft] = useState(baseUrl);

  useEffect(() => {
    setDraft(baseUrl);
  }, [baseUrl]);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} style={styles.root}>
        <LinearGradient
          colors={["#4f46e5", "#5b21b6", "#6d28d9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Master's Thesis · 2026</Text>
          </View>
          <Text style={styles.heroTitle}>{APP.title}</Text>
          <Text style={styles.heroSub}>
            DAAM dual-frequency attention for defending medical image classifiers
            against adversarial attacks across datasets.
          </Text>
          <View style={styles.identity}>
            <Text style={styles.idName}>{APP.author}</Text>
            <Text style={styles.idZh}>{APP.authorZh}</Text>
            <Text style={styles.idMono}>{APP.studentId}</Text>
            <Text style={styles.superLabel}>Supervisor</Text>
            <Text style={styles.idName}>
              {APP.supervisor} · {APP.supervisorZh}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { borderLeftColor: s.bg }]}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backend URL (Next.js)</Text>
          <Text style={styles.cardHint}>
            Same origin as your computer or server running `next-meddef`
            (e.g. http://192.168.1.10:3000). Saved on device.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="https://your-meddef-host"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={draft}
            onChangeText={setDraft}
            onEndEditing={() => void setBaseUrl(draft)}
          />
          <Text style={styles.saveLink} onPress={() => void setBaseUrl(draft)}>
            Save
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Supported Datasets</Text>
          {Object.values(DATASETS).map((d) => (
            <View key={d.name} style={styles.datasetRow}>
              <View style={styles.datasetHead}>
                <Text style={styles.datasetName}>{d.displayName}</Text>
                <Text style={styles.paper}>{d.paper}</Text>
              </View>
              <Text style={styles.datasetDesc}>{d.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  root: { flex: 1 },
  scroll: { paddingBottom: 32 },
  hero: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 8,
  },
  heroSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  identity: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  idName: { color: "#fff", fontSize: 14, fontWeight: "600" },
  idZh: { color: "rgba(255,255,255,0.85)", fontSize: 16, marginTop: 2 },
  idMono: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "monospace",
    marginTop: 6,
    letterSpacing: 2,
  },
  superLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 12,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  statIcon: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 },
  cardHint: { fontSize: 12, color: colors.muted, marginBottom: 10, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: "#fafafa",
  },
  saveLink: {
    color: colors.indigo,
    fontWeight: "600",
    marginTop: 10,
    fontSize: 14,
  },
  datasetRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  datasetHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  datasetName: { fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 },
  paper: { fontSize: 11, color: colors.indigo, fontWeight: "600" },
  datasetDesc: { fontSize: 12, color: colors.muted, marginTop: 4, lineHeight: 18 },
});
