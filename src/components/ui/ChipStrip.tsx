import React from "react";
import { ScrollView, View } from "react-native";
import { chipStyles } from "@/theme/chips";

type Props = {
  children: React.ReactNode;
};

/** Horizontal chip row — hides the scrollbar for a cleaner toolbar look. */
export function ChipStrip({ children }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={chipStyles.rowInline}>{children}</View>
    </ScrollView>
  );
}
