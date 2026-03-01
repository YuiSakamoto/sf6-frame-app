import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export function Badge({
  label,
  color = colors.text,
  bgColor = colors.surfaceLight,
}: BadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
