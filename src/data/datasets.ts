export type DatasetKey = "tbcr" | "chest_xray" | "roct";

export const DATASETS: Record<
  DatasetKey,
  {
    name: DatasetKey;
    displayName: string;
    description: string;
    classes: readonly string[];
    onnxFile: string;
    paper: string;
    normMean: [number, number, number];
    normStd: [number, number, number];
  }
> = {
  tbcr: {
    name: "tbcr",
    displayName: "Tuberculosis Chest X-Ray",
    description: "Binary classification: Normal vs Tuberculosis chest X-rays",
    classes: ["Normal", "Tuberculosis"],
    onnxFile: "vista_no_def_tbcr.onnx",
    paper: "VISTA (MedDef2)",
    normMean: [0, 0, 0],
    normStd: [1, 1, 1],
  },
  chest_xray: {
    name: "chest_xray",
    displayName: "Chest X-Ray (Pneumonia)",
    description: "Binary classification: Normal vs Pneumonia chest X-rays",
    classes: ["NORMAL", "PNEUMONIA"],
    onnxFile: "meddef1_chest_xray.onnx",
    paper: "MedDef1",
    normMean: [0.48230693, 0.48230693, 0.48230693],
    normStd: [0.22157896, 0.22157896, 0.22157896],
  },
  roct: {
    name: "roct",
    displayName: "Retinal OCT",
    description: "4-class retinal OCT: CNV, DME, Drusen, Normal",
    classes: ["CNV", "DME", "DRUSEN", "NORMAL"],
    onnxFile: "meddef1_roct.onnx",
    paper: "MedDef1",
    normMean: [0.19338988, 0.19338988, 0.19338988],
    normStd: [0.1933612, 0.1933612, 0.1933612],
  },
};

export const ATTACK_TYPES = [
  "CLEAN",
  "FGSM",
  "PGD",
  "BIM",
  "MIM",
  "CW",
  "DEEPFOOL",
  "APGD",
  "SQUARE",
] as const;

export type AttackType = (typeof ATTACK_TYPES)[number];

export const ATTACK_EPSILONS = [
  0.0, 0.005, 0.01, 0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.3,
];

export const MODEL_REGISTRY: {
  id: string;
  label: string;
  paper: string;
  dataset: DatasetKey;
  onnxFile: string;
}[] = [
  {
    id: "meddef1_roct",
    label: "MedDef1 FULL",
    paper: "MedDef1",
    dataset: "roct",
    onnxFile: "meddef1_roct.onnx",
  },
  {
    id: "meddef1_chest_xray",
    label: "MedDef1 FULL",
    paper: "MedDef1",
    dataset: "chest_xray",
    onnxFile: "meddef1_chest_xray.onnx",
  },
  {
    id: "vista_no_def_tbcr",
    label: "VISTA NO_DEF — Distill v2",
    paper: "VISTA (MedDef2)",
    dataset: "tbcr",
    onnxFile: "vista_no_def_tbcr.onnx",
  },
];
