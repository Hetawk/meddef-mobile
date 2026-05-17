import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/layout/AppScreen";
import { APP } from "@/config/app";
import { useApiBase } from "@/context/ApiContext";
import { DATASETS } from "@/data/datasets";
import { common } from "@/theme/common";
import { colors } from "@/theme/colors";

const stats = [
  { label: "Datasets", value: "3", bg: "#2563eb" },
  { label: "Model Variants", value: "6", bg: "#7c3aed" },
  { label: "Attack Types", value: "8", bg: "#d97706" },
  { label: "Defense", value: "DAAM", bg: "#059669" },
];

export default function OverviewScreen() {
  const { baseUrl } = useApiBase();
  const apiHostLabel = baseUrl.replace(/^https?:\/\//, "");
  return (
    <AppScreen>
      <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.logoShell}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Master's Thesis · 2026</Text>
            </View>
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
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { borderLeftColor: s.bg }]}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.apiFoot}>API: {apiHostLabel}</Text>

        <View style={common.card}>
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
      </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#4f46e5",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  logoShell: {
    backgroundColor: "rgba(248,250,252,0.95)",
    borderRadius: 999,
    padding: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  logoImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 4,
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
  apiFoot: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 12,
    marginTop: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 8 },
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
