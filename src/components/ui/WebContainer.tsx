import { StyleSheet, View, type ViewStyle } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { colors } from "@/theme/colors";

interface WebContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Web上で中央寄せ + maxWidth を適用するコンテナ */
export function WebContainer({ children, style }: WebContainerProps) {
  const { containerMaxWidth, isWide } = useResponsive();

  if (!isWide) {
    return <View style={[styles.root, style]}>{children}</View>;
  }

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.inner, { maxWidth: containerMaxWidth }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  inner: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
  },
});
