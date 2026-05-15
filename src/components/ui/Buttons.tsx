import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { common } from "@/theme/common";

type BaseProps = {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
};

export function PrimaryButton({
  title,
  loading,
  onPress,
  disabled,
  style,
}: BaseProps & {
  title: string;
  loading?: boolean;
}) {
  const dim = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={dim}
      style={({ pressed }) => [
        common.btnPrimary,
        dim && styles.dim,
        pressed && !dim && styles.pressedDark,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={common.btnPrimaryLabel}>{title}</Text>
      )}
    </Pressable>
  );
}

export function OutlineButton({
  title,
  onPress,
  disabled,
  style,
}: BaseProps & { title: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        common.btnOutline,
        disabled && styles.dimLight,
        pressed && !disabled && styles.pressedLight,
        style,
      ]}
    >
      <Text style={common.btnOutlineLabel}>{title}</Text>
    </Pressable>
  );
}

export function InlineGhostButton({
  title,
  onPress,
  disabled,
  style,
}: BaseProps & { title: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        common.btnInline,
        pressed && !disabled && styles.pressedLight,
        style,
      ]}
    >
      <Text style={common.btnInlineLabel}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dim: { opacity: 0.72 },
  dimLight: { opacity: 0.55 },
  pressedDark: { opacity: 0.92 },
  pressedLight: { opacity: 0.88 },
});
