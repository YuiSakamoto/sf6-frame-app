import { Text, View } from "react-native";
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
    <View
      style={{
        backgroundColor: bgColor,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
      }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
