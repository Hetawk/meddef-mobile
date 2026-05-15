import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { common } from "@/theme/common";

type Props = {
  title: string;
  subtitle?: string;
  footnote?: string;
};

/** Consistent page title block across tabs (matches web section headers). */
export function ScreenHeader({ title, subtitle, footnote }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={common.h1}>{title}</Text>
      {subtitle ? <Text style={common.lead}>{subtitle}</Text> : null}
      {footnote ? <Text style={common.foot}>{footnote}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
});
