import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getEvaluations, type EvaluationRow } from "@/api/client";
import { AppScreen } from "@/components/layout/AppScreen";
import { PrimaryButton } from "@/components/ui/Buttons";
import { ChipStrip } from "@/components/ui/ChipStrip";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiBase } from "@/context/ApiContext";
import {
  ATTACK_EPSILONS,
  ATTACK_TYPES,
  DATASETS,
  type AttackType,
} from "@/data/datasets";
import { chipStyles } from "@/theme/chips";
import { common } from "@/theme/common";
import { colors } from "@/theme/colors";

function cellColor(acc: number): string {
  if (acc >= 0.7) return "#059669";
  if (acc >= 0.5) return "#d97706";
  return "#ef4444";
}

export default function ResultsScreen() {
  const { baseUrl } = useApiBase();
  const [dataset, setDataset] = useState<string>("tbcr");
  const [attack, setAttack] = useState<AttackType>("FGSM");
  const [evals, setEvals] = useState<EvaluationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvaluations(baseUrl);
      const rows = data.filter(
        (e) => e.dataset.name === dataset && e.attack === attack,
      );
      setEvals(rows);
    } catch (e) {
      setEvals([]);
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, dataset, attack]);

  useFocusEffect(
    useCallback(() => {
      void fetchEvals();
    }, [fetchEvals]),
  );

  const grouped = useMemo(() => {
    const g: Record<string, Record<string, EvaluationRow>> = {};
    for (const e of evals) {
      const key = `${e.model.variant} (${e.model.stage})`;
      (g[key] ??= {})[e.epsilon.toString()] = e;
    }
    return g;
  }, [evals]);

  const epsilons = ATTACK_EPSILONS.filter((v) =>
    attack === "CLEAN" ? v === 0 : true,
  );

  const ds = DATASETS[dataset as keyof typeof DATASETS];

  return (
    <AppScreen>
      <ScreenHeader
        title="Evaluation results"
        subtitle="Accuracy vs ε (models × epsilon), from Prisma via `/api/evaluations`. Same filters as the web dashboard."
      />

      <View style={common.card}>
        <Text style={common.label}>Dataset</Text>
        <View style={chipStyles.rowWrap}>
          {Object.values(DATASETS).map((d) => (
            <SelectableChip
              key={d.name}
              variant="wrap"
              selected={dataset === d.name}
              label={d.displayName}
              numberOfLines={1}
              onPress={() => setDataset(d.name)}
            />
          ))}
        </View>
        <Text style={[common.label, { marginTop: 12 }]}>Attack</Text>
        <ChipStrip>
          {ATTACK_TYPES.map((a) => (
            <SelectableChip
              key={a}
              variant="compact"
              selected={attack === a}
              label={a}
              onPress={() => setAttack(a)}
            />
          ))}
        </ChipStrip>
      </View>

      <PrimaryButton
        title="Refresh"
        loading={loading}
        onPress={() => void fetchEvals()}
        style={styles.refreshBtn}
      />

      {error && <Text style={common.errorText}>{error}</Text>}

      {!loading && evals.length === 0 && !error && (
        <View style={common.card}>
          <Text style={styles.emptyTxt}>
            No evaluation data for this filter. Populate via POST to{" "}
            <Text style={styles.mono}>/api/evaluations</Text> or your training
            pipeline.
          </Text>
        </View>
      )}

      {!loading && evals.length > 0 && (
        <View style={common.card}>
          <View style={styles.tableHead}>
            <Text style={styles.tableTitle}>
              {attack} — accuracy vs ε
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>{ds?.displayName ?? dataset}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={[styles.tr, styles.thRow]}>
                <Text style={[styles.th, styles.modelCol]}>Model</Text>
                {epsilons.map((eps) => (
                  <Text key={eps} style={styles.th}>
                    ε={eps}
                  </Text>
                ))}
              </View>
              {Object.entries(grouped).map(([modelKey, byEps]) => (
                <View key={modelKey} style={styles.tr}>
                  <Text style={[styles.td, styles.modelCol]} numberOfLines={2}>
                    {modelKey}
                  </Text>
                  {epsilons.map((eps) => {
                    const row = byEps[eps.toString()];
                    const acc = row?.robustAccuracy ?? row?.accuracy;
                    return (
                      <View key={eps} style={styles.tdNum}>
                        {acc != null ? (
                          <Text
                            style={[
                              styles.acc,
                              { color: cellColor(acc) },
                            ]}
                          >
                            {(acc * 100).toFixed(1)}%
                          </Text>
                        ) : (
                          <Text style={styles.dash}>—</Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#059669" }]} />
              <Text style={styles.legendTxt}>≥70%</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#d97706" }]} />
              <Text style={styles.legendTxt}>50–70%</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: "#ef4444" }]} />
              <Text style={styles.legendTxt}>&lt;50%</Text>
            </View>
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  refreshBtn: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 20,
  },
  emptyTxt: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  mono: { fontFamily: "monospace", fontSize: 12, color: colors.text },
  tableHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  tableTitle: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTxt: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  tr: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  thRow: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
    marginBottom: 4,
  },
  th: {
    width: 72,
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    textAlign: "right",
    paddingVertical: 4,
  },
  modelCol: { width: 160, textAlign: "left" },
  td: {
    width: 160,
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
    paddingVertical: 10,
    paddingRight: 8,
  },
  tdNum: {
    width: 72,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: 10,
  },
  acc: { fontSize: 12, fontWeight: "700" },
  dash: { color: "#cbd5e1", fontSize: 13 },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendTxt: { fontSize: 11, color: colors.muted },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
