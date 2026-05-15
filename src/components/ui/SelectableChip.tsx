import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { chipStyles } from "@/theme/chips";

export type ChipVariant = "wrap" | "compact" | "block" | "pill";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant: ChipVariant;
  /** Use slightly larger label style (epsilon values). */
  numeric?: boolean;
  numberOfLines?: number;
};

/** Tappable chip with a consistent selected state (dataset, attack, model, etc.). */
export function SelectableChip({
  label,
  selected,
  onPress,
  variant,
  numeric,
  numberOfLines = 1,
}: Props) {
  const { base, on, txtBase, txtOn } = bundle(variant, numeric);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        base,
        selected && on,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[txtBase, selected && txtOn]}
        numberOfLines={numberOfLines}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function bundle(variant: ChipVariant, numeric?: boolean) {
  switch (variant) {
    case "compact":
      return {
        base: chipStyles.compact,
        on: chipStyles.compactOn,
        txtBase: numeric ? chipStyles.epsilonTxt : chipStyles.compactTxt,
        txtOn: numeric ? chipStyles.epsilonTxtOn : chipStyles.compactTxtOn,
      };
    case "block":
      return {
        base: chipStyles.block,
        on: chipStyles.blockOn,
        txtBase: chipStyles.blockTxt,
        txtOn: chipStyles.blockTxtOn,
      };
    case "pill":
      return {
        base: chipStyles.pill,
        on: chipStyles.pillOn,
        txtBase: chipStyles.pillTxt,
        txtOn: chipStyles.pillTxtOn,
      };
    case "wrap":
    default:
      return {
        base: chipStyles.wrap,
        on: chipStyles.wrapOn,
        txtBase: chipStyles.wrapTxt,
        txtOn: chipStyles.wrapTxtOn,
      };
  }
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.88 },
});
