import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemedStyles, useTheme, type Theme } from "@/theme/ThemeContext";
import { getCharacterColors } from "@/theme/characterColors";
import type { Character } from "@/types/character";
import { useTranslation } from "react-i18next";
import { lightImpact } from "@/utils/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CharacterCardProps {
  character: Character;
  onPress: (character: Character) => void;
  isSelected?: boolean;
}

export function CharacterCard({
  character,
  onPress,
  isSelected = false,
}: CharacterCardProps) {
  const { i18n } = useTranslation();
  const displayName =
    i18n.language === "ja" ? character.nameJa : character.name;
  const [colorStart, colorEnd] = getCharacterColors(character.slug);
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <AnimatedPressable
      onPress={() => {
        lightImpact();
        onPress(character);
      }}
      onPressIn={() => {
        if (reduced) return;
        scale.value = withTiming(0.95, { duration: 100 });
      }}
      onPressOut={() => {
        if (reduced) return;
        scale.value = withTiming(1, { duration: 150 });
      }}
      accessibilityRole="button"
      accessibilityLabel={displayName}
      accessibilityState={{ selected: isSelected }}
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? theme.colors.accentSubtle
            : theme.colors.surface,
          borderColor: isSelected ? theme.colors.accent : theme.colors.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatarHalf,
            {
              backgroundColor: isSelected ? theme.colors.surface : colorStart,
            },
          ]}
        />
        <View
          style={[
            styles.avatarHalf,
            {
              backgroundColor: isSelected ? theme.colors.surface : colorEnd,
            },
          ]}
        />
        <View style={styles.avatarOverlay}>
          <Text
            style={[
              styles.avatarText,
              { color: isSelected ? theme.colors.accent : "#FFFFFF" },
            ]}
          >
            {character.name.charAt(0)}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.name,
          {
            color: isSelected ? theme.colors.accent : theme.colors.textPrimary,
          },
        ]}
        numberOfLines={1}
      >
        {displayName}
      </Text>
    </AnimatedPressable>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: {
      borderRadius: 10,
      padding: 10,
      alignItems: "center",
      borderWidth: 1.5,
      minWidth: 80,
    },
    avatarContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 6,
    },
    avatarHalf: {
      flex: 1,
    },
    avatarOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 20,
      fontWeight: "800",
      textShadowColor: "rgba(0,0,0,0.4)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    name: {
      fontSize: 11,
      fontWeight: "600",
      textAlign: "center",
    },
  });
