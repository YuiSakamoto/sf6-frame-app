import { Text } from "react-native";
import { getFrameTone, type FrameTone } from "@/utils/frameAdvantage";
import { useTheme, type Theme } from "@/theme/ThemeContext";

interface FrameValueProps {
  value: string;
  fontSize?: number;
  minWidth?: number;
}

function toneColor(tone: FrameTone, theme: Theme): string {
  if (tone === "positive") return theme.colors.framePositive;
  if (tone === "negative") return theme.colors.frameNegative;
  return theme.colors.frameNeutral;
}

export function FrameValue({
  value,
  fontSize = 13,
  minWidth = 36,
}: FrameValueProps) {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: toneColor(getFrameTone(value), theme),
        fontSize,
        fontWeight: "700",
        fontVariant: ["tabular-nums"],
        textAlign: "center",
        minWidth,
      }}
    >
      {value}
    </Text>
  );
}
