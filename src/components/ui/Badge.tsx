import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export function Badge({ label, color, bgColor }: BadgeProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.textPrimary;
  const resolvedBgColor = bgColor ?? theme.colors.surfaceRaised;

  return (
    <View style={[styles.container, { backgroundColor: resolvedBgColor }]}>
      <Text style={[styles.label, { color: resolvedColor }]}>{label}</Text>
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
