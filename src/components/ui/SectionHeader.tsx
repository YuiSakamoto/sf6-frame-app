import { StyleSheet, Text } from "react-native";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";

interface SectionHeaderProps {
  label: string;
}

export function SectionHeader({ label }: SectionHeaderProps) {
  const styles = useThemedStyles(createStyles);
  return <Text style={styles.text}>{label}</Text>;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    text: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
  });
