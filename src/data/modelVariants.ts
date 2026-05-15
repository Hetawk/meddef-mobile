/** Static MedDef variant matrix (mirrors `next-meddef` models page). */
export const MODEL_VARIANTS: {
  key: string;
  label: string;
  description: string;
  accent: string;
  primary?: boolean;
}[] = [
  {
    key: "NO_DEF",
    label: "NO_DEF — Main Model",
    description:
      "Primary deployment model · full DAAM architecture (DISTILL_V2 final)",
    accent: "#4f46e5",
    primary: true,
  },
  {
    key: "FULL",
    label: "FULL (DAAM + Defense)",
    description: "Complete model with adversarial defense module enabled",
    accent: "#7c3aed",
  },
  {
    key: "NO_FREQ",
    label: "NO_FREQ",
    description: "Ablation: no dual-frequency attention branch",
    accent: "#d97706",
  },
  {
    key: "NO_PATCH",
    label: "NO_PATCH",
    description: "Ablation: no patch attention module",
    accent: "#ea580c",
  },
  {
    key: "NO_CBAM",
    label: "NO_CBAM",
    description: "Ablation: no CBAM channel attention",
    accent: "#db2777",
  },
  {
    key: "BASELINE",
    label: "BASELINE (ResNet-18)",
    description: "Standard ResNet-18 without any attention or defense",
    accent: "#059669",
  },
];
