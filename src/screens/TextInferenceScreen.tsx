import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { postInferText } from "@/api/client";
import { AppScreen } from "@/components/layout/AppScreen";
import { OutlineButton, PrimaryButton } from "@/components/ui/Buttons";
import { EmptyStateHint, ErrorBanner } from "@/components/ui/Feedback";
import { SelectableChip } from "@/components/ui/SelectableChip";
import { ScreenHeader } from "@/components/ScreenHeader";
import { APP } from "@/config/app";
import { useApiBase } from "@/context/ApiContext";
import { SAMPLE_PROMPTS } from "@/data/samplePrompts";
import { formatConfidence } from "@/lib/format";
import type { TextInferResponse } from "@/lib/infer";
import { chipStyles } from "@/theme/chips";
import { common } from "@/theme/common";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/tokens";

export default function TextInferenceScreen() {
  const { baseUrl } = useApiBase();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TextInferResponse | null>(null);

  const run = async () => {
    if (!text.trim()) {
      setError("Enter prompt text.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await postInferText(baseUrl, text.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const isHarmful = result?.label === "harmful";

  return (
    <AppScreen>
      <ScreenHeader
        title="LLMShield"
        subtitle="DistilBERT intent classifier — type a prompt or pick a sample, then classify (same as the web app)."
        footnote={`LLMShield · ${APP.author} · ${APP.studentId}`}
      />

      <View style={common.card}>
        <Text style={common.cardTitle}>Prompt input</Text>
        <TextInput
          style={styles.area}
          multiline
          value={text}
          onChangeText={(t) => {
            setText(t);
            setResult(null);
            setError(null);
          }}
          placeholder="Type or paste a prompt to classify…"
          placeholderTextColor={colors.muted}
        />
        <View style={styles.rowBtns}>
          <PrimaryButton
            title="Classify"
            loading={loading}
            onPress={() => void run()}
            style={styles.btnPrimaryInRow}
          />
          {!!text && (
            <OutlineButton
              title="Clear"
              onPress={() => {
                setText("");
                setResult(null);
                setError(null);
              }}
              style={styles.btnOutlineInRow}
            />
          )}
        </View>
        <Text style={[common.caption, { marginTop: 10 }]}>
          Model: DistilBERT · ONNX (server)
        </Text>
        </View>

        {!result && !error && !text.trim() && (
          <EmptyStateHint
            title="Enter a prompt and tap Classify"
            subtitle="Classifier runs server-side via ONNX Runtime."
          />
        )}

        <Text style={[common.sectionHeading, { marginTop: 8 }]}>
          Sample prompts
        </Text>
      {SAMPLE_PROMPTS.map((group) => (
        <View key={group.category} style={styles.group}>
          <Text style={styles.cat}>{group.category}</Text>
          <View style={chipStyles.rowWrap}>
            {group.prompts.map((p) => (
              <SelectableChip
                key={p.label}
                variant="pill"
                selected={text === p.text}
                label={p.label}
                numberOfLines={2}
                onPress={() => {
                  setText(p.text);
                  setResult(null);
                  setError(null);
                }}
              />
            ))}
          </View>
        </View>
      ))}

      {error && (
        <ErrorBanner title="Inference error" message={error} />
      )}

      {result && (
        <>
          <View
            style={[
              styles.verdict,
              {
                borderColor: isHarmful ? "#fecaca" : "#6ee7b7",
                backgroundColor: isHarmful ? "#fef2f2" : "#ecfdf5",
              },
            ]}
          >
            <Text
              style={[
                styles.verdictTxt,
                { color: isHarmful ? "#991b1b" : "#065f46" },
              ]}
            >
              {isHarmful ? "HARMFUL" : "SAFE"}
            </Text>
            <Text style={styles.confBadge}>
              {formatConfidence(result.confidence)}
            </Text>
            <Text style={styles.meta}>
              {result.tokenCount != null ? `${result.tokenCount} tokens · ` : ""}
              {result.elapsedMs.toFixed(0)} ms
              {result.detectionLayer === "rule-based" && (
                <Text style={styles.rule}> · rule-based</Text>
              )}
            </Text>
          </View>

          <View style={common.card}>
            <Text style={common.cardTitle}>Probability breakdown</Text>
            {(["safe", "harmful"] as const).map((cls) => {
              const prob = result.probabilities[cls];
              const isTop = cls === result.label;
              return (
                <View key={cls} style={{ marginBottom: 10 }}>
                  <View style={styles.probRow}>
                    <Text
                      style={[
                        styles.probName,
                        isTop && { fontWeight: "700", color: colors.text },
                      ]}
                    >
                      {cls.charAt(0).toUpperCase() + cls.slice(1)}
                    </Text>
                    <Text
                      style={[
                        styles.probVal,
                        isTop && {
                          color: cls === "harmful" ? "#dc2626" : "#059669",
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {formatConfidence(prob)}
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${Math.min(100, prob * 100)}%`,
                          backgroundColor: isTop
                            ? cls === "harmful"
                              ? "#f87171"
                              : "#10b981"
                            : "#cbd5e1",
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {result.logits && result.logits.length >= 2 && (
            <View style={common.card}>
              <Text style={common.cardTitle}>Raw logits</Text>
              <View style={styles.logitRow}>
                <View style={styles.logitBox}>
                  <Text style={styles.logitLabel}>Safe logit</Text>
                  <Text style={styles.logitVal}>{result.logits[0]!.toFixed(4)}</Text>
                </View>
                <View style={styles.logitBox}>
                  <Text style={styles.logitLabel}>Harmful logit</Text>
                  <Text style={styles.logitVal}>{result.logits[1]!.toFixed(4)}</Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}

    </AppScreen>
  );
}

const styles = StyleSheet.create({
  area: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: "top",
    backgroundColor: "#fafafa",
  },
  rowBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  btnPrimaryInRow: {
    marginTop: 0,
    alignSelf: "flex-start",
    paddingHorizontal: 22,
  },
  btnOutlineInRow: {
    marginTop: 0,
    alignSelf: "flex-start",
  },
  group: { marginTop: 12 },
  cat: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  verdict: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  verdictTxt: { fontSize: 26, fontWeight: "800" },
  confBadge: { fontSize: 15, fontWeight: "700", color: colors.indigo, marginTop: 4 },
  meta: { marginTop: 6, fontSize: 12, color: colors.muted },
  rule: { color: "#d97706", fontWeight: "700" },
  probRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  probName: { fontSize: 13, color: colors.muted },
  probVal: { fontSize: 13, color: colors.muted },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: 4 },
  logitRow: { flexDirection: "row", gap: 12 },
  logitBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
  },
  logitLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.muted,
  },
  logitVal: {
    marginTop: 4,
    fontFamily: "monospace",
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
});
