import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getModels, type ModelRecord } from "@/api/client";
import { AppScreen } from "@/components/layout/AppScreen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiBase } from "@/context/ApiContext";
import { MODEL_STAGES, MODEL_VARIANTS } from "@/data/modelVariants";
import { common } from "@/theme/common";
import { colors } from "@/theme/colors";

export default function ModelsScreen() {
  const { baseUrl } = useApiBase();
  const [dbModels, setDbModels] = useState<ModelRecord[] | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    try {
      const data = await getModels(baseUrl);
      setDbModels(data);
    } catch (e) {
      setDbModels(null);
      setDbError(e instanceof Error ? e.message : "Could not load /api/models");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <AppScreen>
        <ScreenHeader
          title="Models"
          subtitle="Static ablation matrix + training stages (same structure as the web). When the API is reachable, registered ONNX rows load from Prisma via /api/models."
        />

        <View style={[common.card, styles.cardPad]}>
          <Text style={styles.subTitle}>Training stages</Text>
          {MODEL_STAGES.map((s) => (
            <View key={s.key} style={styles.stageRow}>
              <Text style={styles.stageKey}>{s.label}</Text>
              <Text style={styles.stageDesc}>{s.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={common.sectionHeading}>Variant matrix</Text>
        {MODEL_VARIANTS.map((v) => (
          <View
            key={v.key}
            style={[
              common.card,
              styles.cardPad,
              v.primary && { borderColor: v.accent, borderWidth: 2 },
            ]}
          >
            <View style={[styles.strip, { backgroundColor: v.accent }]} />
            <Text style={styles.title}>{v.label}</Text>
            <Text style={styles.key}>{v.key}</Text>
            <Text style={styles.desc}>{v.description}</Text>
          </View>
        ))}

        <Text style={[common.sectionHeading, { marginTop: 8 }]}>
          Registered models (database)
        </Text>
        {loading && <ActivityIndicator style={{ marginVertical: 12 }} />}
        {dbError && <Text style={common.errorText}>{dbError}</Text>}
        {dbModels && dbModels.length === 0 && !dbError && !loading && (
          <Text style={styles.hint}>No model rows in the database yet.</Text>
        )}
        {dbModels &&
          dbModels.map((m) => (
            <View key={m.id} style={styles.dbCard}>
              <Text style={styles.dbTitle}>
                {m.variant} · {m.stage}
              </Text>
              <Text style={styles.dbMono}>{m.onnxPath ?? "—"}</Text>
              {m.dataset && (
                <Text style={styles.dbTiny}>dataset: {m.dataset.name}</Text>
              )}
              {m.accuracy != null && (
                <Text style={styles.dbTiny}>accuracy: {(m.accuracy * 100).toFixed(2)}%</Text>
              )}
            </View>
          ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cardPad: {
    paddingLeft: 18,
    overflow: "hidden",
  },
  subTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10, color: colors.text },
  stageRow: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  stageKey: { fontSize: 13, fontWeight: "700", color: colors.text },
  stageDesc: { fontSize: 12, color: colors.muted, marginTop: 2 },
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
  hint: { fontSize: 12, color: colors.muted, marginTop: 8, lineHeight: 18 },
  dbCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fafafa",
  },
  dbTitle: { fontSize: 13, fontWeight: "700", color: colors.text },
  dbMono: { fontSize: 10, fontFamily: "monospace", color: colors.muted, marginTop: 4 },
  dbTiny: { fontSize: 11, color: colors.muted, marginTop: 4 },
});
