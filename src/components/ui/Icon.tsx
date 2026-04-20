import { Ionicons } from "@expo/vector-icons";

export type IconName =
  | "list"
  | "flash"
  | "search"
  | "settings-outline"
  | "chevron-back";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Platform-aware icon component. Native uses Ionicons from @expo/vector-icons.
 * Web uses inline SVG (see Icon.web.tsx) to avoid the 200 KB font download.
 */
export function Icon({ name, size = 24, color }: IconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
