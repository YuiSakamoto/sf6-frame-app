import { StyleSheet, View, type ViewStyle } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { useThemedStyles, type Theme } from "@/theme/ThemeContext";

interface WebContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Web上で中央寄せ + maxWidth を適用するコンテナ */
export function WebContainer({ children, style }: WebContainerProps) {
  const { containerMaxWidth, isWide } = useResponsive();
  const styles = useThemedStyles(createStyles);

  if (!isWide) {
    // モバイル: 画面幅いっぱいに表示し、横方向のはみ出しを防ぐ
    return <View style={[styles.rootMobile, style]}>{children}</View>;
  }

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.inner, { maxWidth: containerMaxWidth }]}>
        {children}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      alignItems: "center",
      overflow: "hidden",
    },
    rootMobile: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      width: "100%",
      overflow: "hidden",
    },
    inner: {
      flex: 1,
      width: "100%",
      backgroundColor: theme.colors.bg,
      overflow: "hidden",
    },
  });
