import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        height: 40,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        style={{
          flex: 1,
          marginLeft: 8,
          color: colors.text,
          fontSize: 14,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t("common.search")}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
