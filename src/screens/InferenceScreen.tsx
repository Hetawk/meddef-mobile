import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { toByteArray } from "base64-js";
import { normalizeApiBase, postInfer } from "@/api/client";
import { AppScreen } from "@/components/layout/AppScreen";
import { InlineGhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { ChipStrip } from "@/components/ui/ChipStrip";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { APP } from "@/config/app";
import { useApiBase } from "@/context/ApiContext";
import {
  ATTACK_EPSILONS,
  ATTACK_TYPES,
  DATASETS,
  MODEL_REGISTRY,
  type AttackType,
} from "@/data/datasets";
import { SAMPLE_IMAGES } from "@/data/sampleImages";
import { logitsToClassResult, type ClassResult } from "@/lib/infer";
import { floatTensorToTensorB64, preprocessJpegBytes } from "@/lib/preprocess";
import { common } from "@/theme/common";
import { colors } from "@/theme/colors";

const SAMPLE_THUMB = 64;
const MODEL_TILE_W = 196;
const PREVIEW_MAX_H = 128;

export default function InferenceScreen() {
  const { baseUrl } = useApiBase();
  const [modelIdx, setModelIdx] = useState(0);
  const model = MODEL_REGISTRY[modelIdx]!;
  const ds = DATASETS[model.dataset];

  const [attack, setAttack] = useState<AttackType>("CLEAN");
  const [epsilon, setEpsilon] = useState(0.05);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [groundTruth, setGroundTruth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clean, setClean] = useState<ClassResult | null>(null);
  const [attacked, setAttacked] = useState<ClassResult | null>(null);
  const [robust, setRobust] = useState<boolean | null>(null);
  /** Path key from `SAMPLE_IMAGES` when the current image came from a server sample (for chip highlight). */
  const [selectedSamplePath, setSelectedSamplePath] = useState<string | null>(
    null,
  );

  const classes = ds.classes;
  const sampleBaseRoot = normalizeApiBase(baseUrl);

  const epsilonOptions = useMemo(
    () =>
      attack === "CLEAN" ? [0] : ATTACK_EPSILONS.filter((v) => v > 0),
    [attack],
  );

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
      setGroundTruth(null);
      setSelectedSamplePath(null);
      resetResults();
    }
  };

  const resetResults = () => {
    setError(null);
    setClean(null);
    setAttacked(null);
    setRobust(null);
  };

  const loadSample = async (path: string, label: string) => {
    const url = `${normalizeApiBase(baseUrl)}${path}`;
    const name = path.split("/").pop() ?? "sample.jpg";
    const safe = name.replace(/[^\w.-]/g, "_");
    const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!dir) {
      setError("No local cache directory for downloads.");
      return;
    }
    const dest = `${dir}meddef_${safe}`;
    try {
      const dl = await FileSystem.downloadAsync(url, dest);
      setImageUri(dl.uri);
      setGroundTruth(label);
      setSelectedSamplePath(path);
      resetResults();
      setError(null);
    } catch {
      setError(
        `Could not download sample. Check your connection and that ${path} exists on the server.`,
      );
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setGroundTruth(null);
    setSelectedSamplePath(null);
    resetResults();
  };

  const run = async () => {
    if (!imageUri) {
      setError("Choose an image or sample first.");
      return;
    }
    setLoading(true);
    resetResults();

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

      const eps = attack === "CLEAN" ? 0 : epsilon;

      const raw = await postInfer(baseUrl, {
        modelFile: model.onnxFile,
        tensorB64,
        attack,
        epsilon: eps,
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

  const samples = SAMPLE_IMAGES[model.dataset];

  return (
    <AppScreen>
      <ScreenHeader
        title="Model inference"
        subtitle="ONNX via /api/infer — 224² input, dataset mean/std (same as the web app)."
        footnote={`${APP.author} · ${APP.studentId}`}
      />

      <View style={[common.card, styles.compactCard]}>
        <Text style={common.label}>Model</Text>
        <Text style={styles.dsHint}>
          {ds.displayName} · {classes.length} classes
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modelScroll}
        >
          {MODEL_REGISTRY.map((m, i) => (
            <View key={m.id} style={styles.modelTile}>
              <SelectableChip
                variant="wrap"
                selected={i === modelIdx}
                label={`[${m.paper}] ${m.label}\n${m.dataset}`}
                numberOfLines={3}
                onPress={() => {
                  setModelIdx(i);
                  clearImage();
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[common.card, styles.compactCard]}>
        <Text style={common.label}>Attack</Text>
        <ChipStrip>
          {ATTACK_TYPES.map((a) => (
            <SelectableChip
              key={a}
              variant="compact"
              selected={attack === a}
              label={a}
              onPress={() => {
                setAttack(a);
                if (a === "CLEAN") setEpsilon(0);
                resetResults();
              }}
            />
          ))}
        </ChipStrip>
        {attack !== "CLEAN" && (
          <>
            <Text style={[common.label, styles.epsilonLabel]}>Epsilon</Text>
            <ChipStrip>
              {epsilonOptions.map((v) => (
                <SelectableChip
                  key={v}
                  variant="compact"
                  numeric
                  selected={Math.abs(epsilon - v) < 1e-9}
                  label={String(v)}
                  onPress={() => {
                    setEpsilon(v);
                    resetResults();
                  }}
                />
              ))}
            </ChipStrip>
          </>
        )}
      </View>

      <View style={[common.card, styles.compactCard]}>
        <View style={styles.imgRow}>
          <Text style={common.label}>Image</Text>
          {imageUri && (
            <Pressable onPress={clearImage} hitSlop={8}>
              <Text style={styles.clearLink}>Clear</Text>
            </Pressable>
          )}
        </View>
        <InlineGhostButton title="Pick from library" onPress={() => void pickImage()} />

        <Text style={[common.label, styles.samplesLabel]}>Samples</Text>
        <Text style={styles.sampleHint}>
          Tap a thumbnail to fetch from <Text style={{ fontFamily: "monospace" }}>public/datasets/samples/</Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sampleScroll}
        >
          {samples.map((s) => {
            const previewUri = `${sampleBaseRoot}${s.path}`;
            const isSelected = selectedSamplePath === s.path;
            return (
              <Pressable
                key={s.path}
                style={({ pressed }) => [
                  styles.sampleTileH,
                  isSelected && styles.sampleTileHSelected,
                  pressed && { opacity: 0.92 },
                ]}
                onPress={() => void loadSample(s.path, s.label)}
              >
                <View style={styles.sampleThumbWrapH}>
                  <Image
                    source={{ uri: previewUri }}
                    style={styles.sampleThumbH}
                    resizeMode="cover"
                  />
                  {isSelected && (
                    <View style={styles.sampleSelectedBadgeH}>
                      <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.sampleLabelTxt,
                    isSelected && styles.sampleLabelTxtSel,
                  ]}
                  numberOfLines={2}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {groundTruth && !clean && (
          <Text style={styles.gt}>GT: {groundTruth}</Text>
        )}
      </View>

      <PrimaryButton
        title="Run inference"
        loading={loading}
        onPress={() => void run()}
      />

      {error && <Text style={common.errorText}>{error}</Text>}

      {clean && (
        <View style={[common.card, styles.resultCard]}>
          <Text style={styles.resultCardTitle}>Clean</Text>
          <Text style={styles.pred}>{clean.prediction}</Text>
          <Text style={styles.conf}>
            {(clean.confidence * 100).toFixed(2)}% · {clean.elapsedMs.toFixed(0)} ms
          </Text>
          {groundTruth && (
            <Text
              style={[
                styles.gtCheck,
                clean.prediction.toLowerCase() === groundTruth.toLowerCase()
                  ? { color: "#059669" }
                  : { color: "#d97706" },
              ]}
            >
              {clean.prediction.toLowerCase() === groundTruth.toLowerCase()
                ? "✓ Matches sample label"
                : `✗ Expected: ${groundTruth}`}
            </Text>
          )}
          {Object.entries(clean.probabilities).map(([k, v]) => (
            <Text key={k} style={styles.prob}>
              {k}: {(v * 100).toFixed(2)}%
            </Text>
          ))}
        </View>
      )}

      {attacked && (
        <View style={[common.card, styles.resultCard]}>
          <Text style={styles.resultCardTitle}>
            Under attack ({attack}, ε={attack === "CLEAN" ? 0 : epsilon})
          </Text>
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

      {imageUri && (
        <View style={[common.card, styles.compactCard]}>
          <Text style={common.label}>Preview</Text>
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
            resizeMode="contain"
          />
          {groundTruth && clean && (
            <Text style={styles.gt}>Ground truth (sample): {groundTruth}</Text>
          )}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dsHint: { fontSize: 10, color: colors.muted, marginBottom: 6 },
  modelScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
    paddingRight: 4,
  },
  modelTile: {
    width: MODEL_TILE_W,
    minHeight: 48,
    justifyContent: "center",
  },
  epsilonLabel: { marginTop: 8 },
  imgRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  clearLink: { fontSize: 12, color: colors.indigo, fontWeight: "600" },
  samplesLabel: { marginTop: 10 },
  sampleHint: { fontSize: 10, color: colors.muted, marginBottom: 6, lineHeight: 14 },
  sampleScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  sampleTileH: {
    width: 72,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#f8fafc",
  },
  sampleTileHSelected: {
    borderColor: colors.indigo,
    backgroundColor: "#eef2ff",
  },
  sampleThumbWrapH: {
    position: "relative",
    width: "100%",
    height: SAMPLE_THUMB,
    backgroundColor: "#e2e8f0",
  },
  sampleThumbH: {
    width: "100%",
    height: SAMPLE_THUMB,
  },
  sampleSelectedBadgeH: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.indigo,
    borderRadius: 10,
    padding: 2,
  },
  sampleLabelTxt: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    paddingHorizontal: 3,
    paddingVertical: 3,
    minHeight: 28,
    lineHeight: 12,
    backgroundColor: "#f1f5f9",
  },
  sampleLabelTxtSel: {
    backgroundColor: colors.indigo,
    color: "#fff",
  },
  preview: {
    marginTop: 6,
    width: "100%",
    height: PREVIEW_MAX_H,
    borderRadius: 10,
    backgroundColor: "#0f172a",
  },
  gt: {
    marginTop: 8,
    fontSize: 11,
    color: colors.indigo,
    fontWeight: "600",
  },
  resultCard: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  resultCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  pred: { fontSize: 18, fontWeight: "800", color: colors.text },
  conf: { fontSize: 12, color: colors.muted, marginTop: 3 },
  prob: { fontSize: 11, color: colors.muted, marginTop: 1 },
  robust: { marginTop: 8, fontWeight: "700", fontSize: 13 },
  gtCheck: { marginTop: 6, fontSize: 12, fontWeight: "700" },
});
