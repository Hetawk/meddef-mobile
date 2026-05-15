import type { AttackType } from "@/data/datasets";
import {
  parseInferResponse,
  parseTextInferResponse,
  type InferApiResponse,
  type TextInferResponse,
} from "@/lib/infer";

/** Trim and strip trailing slashes — same root used for `/api/*` and static `/datasets/...` previews. */
export function normalizeApiBase(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export async function postInfer(
  baseUrl: string,
  body: {
    modelFile: string;
    tensorB64: string;
    attack: AttackType;
    epsilon: number;
  },
): Promise<InferApiResponse> {
  const root = normalizeApiBase(baseUrl);
  const res = await fetch(`${root}/api/infer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json?.error ??
      json?.issues?.join?.("; ") ??
      `HTTP ${res.status}`;
    throw new Error(String(msg));
  }
  return parseInferResponse(json);
}

export async function postInferText(
  baseUrl: string,
  text: string,
): Promise<TextInferResponse> {
  const root = normalizeApiBase(baseUrl);
  const res = await fetch(`${root}/api/infer-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error ?? json?.issues?.join?.("; ") ?? `HTTP ${res.status}`;
    throw new Error(String(msg));
  }
  return parseTextInferResponse(json);
}

export interface EvaluationRow {
  id: string;
  attack: string;
  epsilon: number;
  accuracy: number;
  robustAccuracy: number | null;
  model: { variant: string; stage: string };
  dataset: { name: string };
}

export async function getEvaluations(baseUrl: string): Promise<EvaluationRow[]> {
  const root = normalizeApiBase(baseUrl);
  const res = await fetch(`${root}/api/evaluations`);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? `HTTP ${res.status}`);
  }
  return json.data as EvaluationRow[];
}

export interface ModelRecord {
  id: string;
  variant: string;
  stage: string;
  format: string;
  onnxPath: string | null;
  accuracy: number | null;
  datasetId: string | null;
  dataset: { name: string } | null;
}

export async function getModels(baseUrl: string): Promise<ModelRecord[]> {
  const root = normalizeApiBase(baseUrl);
  const res = await fetch(`${root}/api/models`);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? `HTTP ${res.status}`);
  }
  return json.data as ModelRecord[];
}

export interface DatasetRecord {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
}

export async function getDatasetsFromApi(
  baseUrl: string,
): Promise<DatasetRecord[]> {
  const root = normalizeApiBase(baseUrl);
  const res = await fetch(`${root}/api/datasets`);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? `HTTP ${res.status}`);
  }
  return json.data as DatasetRecord[];
}

