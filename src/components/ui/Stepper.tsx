import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: colors.accent,
  },
  circleText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
  },
  circleTextActive: {
    color: colors.background,
  },
  label: {
    fontSize: 10,
    fontWeight: "400",
    color: colors.textMuted,
    marginLeft: 4,
  },
  labelActive: {
    fontWeight: "700",
    color: colors.accent,
  },
  labelDone: {
    color: colors.text,
  },
  connector: {
    width: 20,
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 4,
  },
  connectorDone: {
    backgroundColor: colors.accent,
  },
});
