import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme/ThemeContext";
import type { DimensionValue } from "react-native";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

/** ローディング中のプレースホルダー。reduced motion 時は明滅アニメーションを行わない */
export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 6,
}: SkeletonProps) {
  const theme = useTheme();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceRaised,
        },
        style,
      ]}
    />
  );
}
