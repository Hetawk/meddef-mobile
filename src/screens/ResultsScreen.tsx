import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getEvaluations, type EvaluationRow } from "@/api/client";
import { useApiBase } from "@/context/ApiContext";
import { ATTACK_TYPES, type AttackType } from "@/data/datasets";
import { colors } from "@/theme/colors";

const DS_KEYS = ["tbcr", "chest_xray", "roct"] as const;

export default function ResultsScreen() {
  const { baseUrl } = useApiBase();
  const [dataset, setDataset] = useState<string>("tbcr");
  const [attack, setAttack] = useState<AttackType>("FGSM");
  const [rows, setRows] = useState<EvaluationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!baseUrl) {
      setRows([]);
      setError("Set Backend URL on Overview to load Prisma evaluations.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluations(baseUrl);
      const filtered = data.filter(
        (e) => e.dataset.name === dataset && e.attack === attack,
      );
      setRows(filtered);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, dataset, attack]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = [...rows].sort((a, b) => a.epsilon - b.epsilon);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>Results</Text>
        <Text style={styles.lead}>
          Reads `/api/evaluations` (Prisma, same as the web). Pick dataset and
          attack, then refresh.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Dataset</Text>
          <View style={styles.row}>
            {DS_KEYS.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDataset(d)}
                style={[styles.chip, dataset === d && styles.chipOn]}
              >
                <Text style={[styles.chipTxt, dataset === d && styles.chipTxtOn]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.label, { marginTop: 12 }]}>Attack</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {ATTACK_TYPES.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setAttack(a)}
                  style={[styles.mini, attack === a && styles.miniOn]}
                >
                  <Text style={[styles.miniTxt, attack === a && styles.miniTxtOn]}>
                    {a}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <Pressable style={styles.refresh} onPress={() => void load()}>
          <Text style={styles.refreshTxt}>Refresh</Text>
        </Pressable>

        {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

        {error && <Text style={styles.err}>{error}</Text>}

        {!loading && sorted.length === 0 && !error?.includes("Set Backend") && (
          <Text style={styles.empty}>No evaluation rows for this filter.</Text>
        )}

        {sorted.map((e) => (
          <View key={e.id} style={styles.rowCard}>
            <Text style={styles.eps}>ε = {e.epsilon}</Text>
            <Text style={styles.metric}>acc {(e.accuracy * 100).toFixed(2)}%</Text>
            {e.robustAccuracy != null && (
              <Text style={styles.metric}>
                robust {(e.robustAccuracy * 100).toFixed(2)}%
              </Text>
            )}
            <Text style={styles.variant}>
              {e.model.variant} · {e.model.stage}
            </Text>
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
    marginTop: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  chipOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  chipTxt: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  chipTxtOn: { color: colors.indigo },
  mini: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  miniTxt: { fontSize: 10, color: colors.muted, fontWeight: "600" },
  miniTxtOn: { color: colors.indigo },
  refresh: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.indigo,
  },
  refreshTxt: { color: "#fff", fontWeight: "700" },
  err: { color: "#dc2626", marginTop: 12 },
  empty: { marginTop: 16, color: colors.muted },
  rowCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  eps: { fontWeight: "700", color: colors.text },
  metric: { marginTop: 4, fontSize: 13, color: colors.muted },
  variant: {
    marginTop: 6,
    fontSize: 11,
    fontFamily: "monospace",
    color: colors.indigo,
  },
});
