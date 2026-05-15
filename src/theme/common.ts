import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { radius, touch } from "./tokens";

/** Shared layout tokens — keep screens visually aligned with the web dashboard. */
export const layout = {
  screenPad: 16,
  scrollBottomPad: 36,
  radius: 12,
  radiusSm: 8,
} as const;

export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: layout.screenPad,
    paddingBottom: layout.scrollBottomPad,
  },
  h1: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
  },
  lead: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
  foot: {
    marginTop: 8,
    fontSize: 11,
    color: colors.muted,
    lineHeight: 16,
  },
  card: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: layout.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radiusSm,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: "#fafafa",
  },

  /** Primary CTA — full width or inline */
  btnPrimary: {
    marginTop: layout.screenPad,
    backgroundColor: colors.indigo,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touch.minHeight,
  },
  btnPrimaryLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  btnOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touch.minHeight - 4,
    backgroundColor: "#fff",
  },
  btnOutlineLabel: { fontWeight: "600", fontSize: 15, color: colors.text },

  btnInline: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radius.md,
    backgroundColor: "#fff",
    minHeight: touch.minHeight - 4,
    justifyContent: "center",
  },
  btnInlineLabel: { fontSize: 14, fontWeight: "600", color: colors.text },

  /** Section titles between cards (e.g. “Variant matrix”) */
  sectionHeading: {
    marginTop: layout.screenPad + 4,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  errorText: {
    color: "#dc2626",
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
  },

  caption: { fontSize: 11, color: colors.muted, lineHeight: 16 },
});
