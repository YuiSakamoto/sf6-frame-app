import { useWindowDimensions, Platform } from "react-native";

interface ResponsiveInfo {
  width: number;
  isWide: boolean;
  /** Web上で中央寄せコンテナに使うmaxWidth */
  containerMaxWidth: number;
  /** CharacterGrid の列数 */
  gridColumns: number;
}

export function useResponsive(): ResponsiveInfo {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWide = isWeb && width >= 768;

  return {
    width,
    isWide,
    containerMaxWidth: isWide ? 720 : width,
    gridColumns: width >= 1024 ? 7 : width >= 768 ? 6 : 4,
  };
}
