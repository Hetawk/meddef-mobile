import type { AttackType } from "@/data/datasets";

export function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export interface ClassResult {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  elapsedMs: number;
}

export function logitsToClassResult(
  logits: number[],
  classes: readonly string[],
  elapsedMs: number,
): ClassResult {
  const probs = softmax(logits);
  const predIdx = probs.indexOf(Math.max(...probs));
  const probMap: Record<string, number> = {};
  classes.forEach((cls, i) => {
    probMap[cls] = probs[i] ?? 0;
  });
  return {
    prediction: classes[predIdx] ?? `class_${predIdx}`,
    confidence: probs[predIdx] ?? 0,
    probabilities: probMap,
    elapsedMs,
  };
}

export interface InferApiResponse {
  cleanLogits: number[];
  cleanElapsedMs: number;
  attackedLogits: number[] | null;
  attackedElapsedMs: number | null;
}

export function parseInferResponse(json: unknown): InferApiResponse {
  if (typeof json !== "object" || json === null) {
    throw new Error("Invalid JSON from /api/infer");
  }
  const o = json as Record<string, unknown>;
  if (!Array.isArray(o.cleanLogits)) throw new Error("Missing cleanLogits");
  return {
    cleanLogits: o.cleanLogits as number[],
    cleanElapsedMs: Number(o.cleanElapsedMs),
    attackedLogits: o.attackedLogits == null ? null : (o.attackedLogits as number[]),
    attackedElapsedMs:
      o.attackedElapsedMs == null || o.attackedElapsedMs === null
        ? null
        : Number(o.attackedElapsedMs),
  };
}

export interface TextInferResponse {
  label: "safe" | "harmful";
  confidence: number;
  probabilities: { safe: number; harmful: number };
  elapsedMs: number;
  detectionLayer?: string;
}

export function parseTextInferResponse(json: unknown): TextInferResponse {
  if (typeof json !== "object" || json === null) {
    throw new Error("Invalid JSON from /api/infer-text");
  }
  const o = json as Record<string, unknown>;
  if (o.error) throw new Error(String(o.error));
  return {
    label: o.label === "harmful" ? "harmful" : "safe",
    confidence: Number(o.confidence),
    probabilities: o.probabilities as TextInferResponse["probabilities"],
    elapsedMs: Number(o.elapsedMs),
    detectionLayer: o.detectionLayer as string | undefined,
  };
}
