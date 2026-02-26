import { Text } from "react-native";
import { getFrameColor } from "@/utils/frameAdvantage";

interface FrameValueProps {
  value: string;
  fontSize?: number;
}

export function FrameValue({ value, fontSize = 13 }: FrameValueProps) {
  return (
    <Text
      style={{
        color: getFrameColor(value),
        fontSize,
        fontWeight: "700",
        fontVariant: ["tabular-nums"],
        textAlign: "center",
        minWidth: 36,
      }}
    >
      {value}
    </Text>
  );
}
