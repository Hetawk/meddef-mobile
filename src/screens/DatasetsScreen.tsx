import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getDatasetsFromApi, type DatasetRecord } from "@/api/client";
import { AppScreen } from "@/components/layout/AppScreen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiBase } from "@/context/ApiContext";
import { DATASETS } from "@/data/datasets";
import { common } from "@/theme/common";
import { colors } from "@/theme/colors";

export default function DatasetsScreen() {
  const { baseUrl } = useApiBase();
  const list = Object.values(DATASETS);
  const [fromApi, setFromApi] = useState<DatasetRecord[] | null>(null);
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setApiErr(null);
    try {
      setFromApi(await getDatasetsFromApi(baseUrl));
    } catch (e) {
      setFromApi(null);
      setApiErr(e instanceof Error ? e.message : "Failed /api/datasets");
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
          title="Datasets"
          subtitle="Built-in definitions mirror the web app's types. When the API is reachable, Prisma dataset rows load from /api/datasets."
        />

        {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}
        {apiErr && <Text style={common.errorText}>{apiErr}</Text>}
        {fromApi && fromApi.length > 0 && (
          <View style={common.card}>
            <Text style={styles.subTitle}>Server records</Text>
            {fromApi.map((r) => (
              <View key={r.id} style={styles.apiRow}>
                <Text style={styles.apiName}>{r.displayName}</Text>
                <Text style={styles.apiMono}>{r.name}</Text>
                {r.description ? (
                  <Text style={styles.apiDesc}>{r.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <Text style={[common.sectionHeading, { marginBottom: 8 }]}>
          Built-in definitions (client)
        </Text>
        {list.map((d) => (
          <View key={d.name} style={common.card}>
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
        <View style={[common.card, { marginTop: 8 }]}>
          <Text style={styles.foot}>
            ONNX models are loaded by the Next.js server from `public/models/onnx/`.
            This app sends tensors to `/api/infer` — no model files on the phone.
          </Text>
        </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  subTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10, color: colors.text },
  apiRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  apiName: { fontSize: 14, fontWeight: "600", color: colors.text },
  apiMono: { fontSize: 11, fontFamily: "monospace", color: colors.muted },
  apiDesc: { fontSize: 12, color: colors.muted, marginTop: 4 },
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
