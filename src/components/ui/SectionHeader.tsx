import { StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  return <Text style={styles.text}>{label}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});
