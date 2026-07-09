import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <View key={index} style={styles.step}>
            {/* ステップ番号 */}
            <View
              style={[
                styles.circle,
                (isActive || isDone) && styles.circleActive,
              ]}
            >
              <Text
                style={[
                  styles.circleText,
                  (isActive || isDone) && styles.circleTextActive,
                ]}
              >
                {isDone ? "✓" : index + 1}
              </Text>
            </View>
            {/* ラベル */}
            <Text
              style={[
                styles.label,
                isActive && styles.labelActive,
                isDone && styles.labelDone,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            {/* コネクタライン */}
            {index < steps.length - 1 && (
              <View
                style={[styles.connector, isDone && styles.connectorDone]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 4,
    },
    step: {
      flexDirection: "row",
      alignItems: "center",
    },
    circle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.surfaceRaised,
      alignItems: "center",
      justifyContent: "center",
    },
    circleActive: {
      backgroundColor: theme.colors.accent,
    },
    circleText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.colors.textMuted,
    },
    circleTextActive: {
      color: theme.colors.bg,
    },
    label: {
      fontSize: 10,
      fontWeight: "400",
      color: theme.colors.textMuted,
      marginLeft: 4,
    },
    labelActive: {
      fontWeight: "700",
      color: theme.colors.accent,
    },
    labelDone: {
      color: theme.colors.textPrimary,
    },
    connector: {
      width: 20,
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: 4,
    },
    connectorDone: {
      backgroundColor: theme.colors.accent,
    },
  });
