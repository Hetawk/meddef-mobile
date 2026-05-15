import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { radius, space } from "./tokens";

/**
 * Central chip / pill styles so selection controls feel identical app-wide.
 */
export const chipStyles = StyleSheet.create({
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    alignItems: "center",
  },
  rowInline: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },

  /** Dataset / evaluation name chips */
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    maxWidth: "100%",
  },
  wrapOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  wrapTxt: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  wrapTxtOn: { color: colors.indigo },

  /** Attack row, epsilon row */
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 36,
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  compactOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  compactTxt: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  compactTxtOn: { color: colors.indigo },

  epsilonTxt: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  epsilonTxtOn: { color: colors.indigo },

  /** Model registry (stacked blocks) */
  block: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 10,
    marginBottom: space.sm,
    backgroundColor: "#fafafa",
  },
  blockOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  blockTxt: { fontSize: 13, color: colors.text },
  blockTxtOn: { color: colors.indigoDark, fontWeight: "600" },

  /** LLMShield sample prompts */
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#fff",
    maxWidth: "100%",
  },
  pillOn: { borderColor: colors.indigo, backgroundColor: "#eef2ff" },
  pillTxt: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  pillTxtOn: { color: colors.indigo },
});
