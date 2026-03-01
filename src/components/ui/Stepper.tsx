import { Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 4,
      }}
    >
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            {/* ステップ番号 */}
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: isActive
                  ? colors.accent
                  : isDone
                    ? colors.accent
                    : colors.surfaceLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color:
                    isActive || isDone ? colors.background : colors.textMuted,
                }}
              >
                {isDone ? "✓" : index + 1}
              </Text>
            </View>
            {/* ラベル */}
            <Text
              style={{
                fontSize: 10,
                fontWeight: isActive ? "700" : "400",
                color: isActive
                  ? colors.accent
                  : isDone
                    ? colors.text
                    : colors.textMuted,
                marginLeft: 4,
              }}
              numberOfLines={1}
            >
              {label}
            </Text>
            {/* コネクタライン */}
            {index < steps.length - 1 && (
              <View
                style={{
                  width: 20,
                  height: 1,
                  backgroundColor: isDone ? colors.accent : colors.border,
                  marginLeft: 4,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
