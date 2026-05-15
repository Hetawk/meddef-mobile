import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toByteArray } from "base64-js";
import { postInfer } from "@/api/client";
import { useApiBase } from "@/context/ApiContext";
import {
  ATTACK_TYPES,
  DATASETS,
  MODEL_REGISTRY,
  type AttackType,
} from "@/data/datasets";
import { logitsToClassResult, type ClassResult } from "@/lib/infer";
import { floatTensorToTensorB64, preprocessJpegBytes } from "@/lib/preprocess";
import { colors } from "@/theme/colors";

export default function InferenceScreen() {
  const { baseUrl } = useApiBase();
  const [modelIdx, setModelIdx] = useState(0);
  const model = MODEL_REGISTRY[modelIdx]!;
  const ds = DATASETS[model.dataset];

  const [attack, setAttack] = useState<AttackType>("CLEAN");
  const [epsilon, setEpsilon] = useState("0.05");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clean, setClean] = useState<ClassResult | null>(null);
  const [attacked, setAttacked] = useState<ClassResult | null>(null);
  const [robust, setRobust] = useState<boolean | null>(null);

  const classes = ds.classes;

  const epsNum = useMemo(() => {
    const n = parseFloat(epsilon.replace(",", "."));
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.05;
  }, [epsilon]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo library permission is required.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.95,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setError(null);
      setClean(null);
      setAttacked(null);
      setRobust(null);
    }
  };

  const run = async () => {
    if (!baseUrl) {
      setError("Set Backend URL on the Overview tab first.");
      return;
    }
    if (!imageUri) {
      setError("Choose an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    setClean(null);
    setAttacked(null);
    setRobust(null);

    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 224, height: 224 } }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG },
      );

      const b64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const jpegBytes = toByteArray(b64);

      const mean: [number, number, number] = [...ds.normMean] as [
        number,
        number,
        number,
      ];
      const std: [number, number, number] = [...ds.normStd] as [
        number,
        number,
        number,
      ];

      const tensor = preprocessJpegBytes(jpegBytes, mean, std);
      const tensorB64 = floatTensorToTensorB64(tensor);

      const raw = await postInfer(baseUrl, {
        modelFile: model.onnxFile,
        tensorB64,
        attack,
        epsilon: attack === "CLEAN" ? 0 : epsNum,
      });

      const c = logitsToClassResult(raw.cleanLogits, classes, raw.cleanElapsedMs);
      setClean(c);

      if (raw.attackedLogits && raw.attackedElapsedMs != null) {
        const a = logitsToClassResult(
          raw.attackedLogits,
          classes,
          raw.attackedElapsedMs,
        );
        setAttacked(a);
        setRobust(a.prediction === c.prediction);
      } else {
        setAttacked(null);
        setRobust(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Inference failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll} style={styles.root}>
        <Text style={styles.h1}>Inference</Text>
        <Text style={styles.lead}>
          ONNX models via your Next.js server (`/api/infer`). Preprocessing
          matches the web app (224², dataset mean/std).
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Model</Text>
          <View style={styles.chips}>
            {MODEL_REGISTRY.map((m, i) => (
              <Pressable
                key={m.id}
                onPress={() => {
                  setModelIdx(i);
                  setClean(null);
                  setAttacked(null);
                }}
                style={[styles.chip, i === modelIdx && styles.chipOn]}
              >
                <Text
                  style={[styles.chipText, i === modelIdx && styles.chipTextOn]}
                  numberOfLines={2}
                >
                  {m.label} · {m.dataset}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Attack</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {ATTACK_TYPES.map((a) => (
                <Pressable
                  key={a}
                  onPress={() => setAttack(a)}
                  style={[styles.miniChip, attack === a && styles.miniChipOn]}
                >
                  <Text
                    style={[styles.miniChipTxt, attack === a && styles.miniChipTxtOn]}
                  >
                    {a}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {attack !== "CLEAN" && (
            <>
              <Text style={[styles.label, { marginTop: 12 }]}>Epsilon (0–1)</Text>
              <TextInput
                style={styles.input}
                value={epsilon}
                onChangeText={setEpsilon}
                keyboardType="decimal-pad"
              />
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Image</Text>
          <Pressable style={styles.btn} onPress={pickImage}>
            <Text style={styles.btnText}>Pick from library</Text>
          </Pressable>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          )}
        </View>

        <Pressable
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={() => void run()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Run inference</Text>
          )}
        </Pressable>

        {error && <Text style={styles.err}>{error}</Text>}

        {clean && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Clean</Text>
            <Text style={styles.pred}>{clean.prediction}</Text>
            <Text style={styles.conf}>
              {(clean.confidence * 100).toFixed(2)}% · {clean.elapsedMs.toFixed(0)} ms
            </Text>
            {Object.entries(clean.probabilities).map(([k, v]) => (
              <Text key={k} style={styles.prob}>
                {k}: {(v * 100).toFixed(2)}%
              </Text>
            ))}
          </View>
        )}

        {attacked && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Under attack ({attack})</Text>
            <Text style={styles.pred}>{attacked.prediction}</Text>
            <Text style={styles.conf}>
              {(attacked.confidence * 100).toFixed(2)}% ·{" "}
              {attacked.elapsedMs.toFixed(0)} ms
            </Text>
            {robust !== null && (
              <Text
                style={[
                  styles.robust,
                  { color: robust ? colors.indigo : "#dc2626" },
                ]}
              >
                {robust ? "Prediction unchanged (robust)" : "Prediction flipped"}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  root: { flex: 1 },
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
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 12, fontWeight: "600", color: colors.muted, marginBottom: 8 },
  chips: { gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  chipOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  chipText: { fontSize: 13, color: colors.text },
  chipTextOn: { color: colors.indigoDark, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  miniChipOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  miniChipTxt: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  miniChipTxtOn: { color: colors.indigo },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: colors.text,
  },
  btn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  btnText: { fontSize: 14, fontWeight: "600", color: colors.text },
  preview: {
    marginTop: 12,
    width: "100%",
    height: 220,
    borderRadius: 12,
    resizeMode: "contain",
    backgroundColor: "#0f172a",
  },
  btnPrimary: {
    marginTop: 16,
    backgroundColor: colors.indigo,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  err: { color: "#dc2626", marginTop: 12, fontSize: 13 },
  pred: { fontSize: 20, fontWeight: "800", color: colors.text },
  conf: { fontSize: 13, color: colors.muted, marginTop: 4 },
  prob: { fontSize: 12, color: colors.muted, marginTop: 2 },
  robust: { marginTop: 10, fontWeight: "700", fontSize: 14 },
});
