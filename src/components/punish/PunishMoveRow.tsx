import { Text, View } from "react-native";
import { colors } from "@/theme/colors";
import type { PunishOption } from "@/utils/punishCalc";
import { FrameValue } from "@/components/frame-data/FrameValue";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "react-i18next";
import { getMoveName, getComboScaling, getProperties } from "@/utils/moveName";

interface PunishMoveRowProps {
  punish: PunishOption;
  isFastest: boolean;
}

export function PunishMoveRow({ punish, isFastest }: PunishMoveRowProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const displayName = getMoveName(punish.move, lang);
  const displayComboScaling = getComboScaling(punish.move, lang);
  const displayProperties = getProperties(punish.move, lang);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: isFastest ? "#0A1A12" : colors.surface,
        borderLeftWidth: isFastest ? 3 : 0,
        borderLeftColor: colors.punishSuccess,
      }}
    >
      <View style={{ flex: 1, marginRight: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {isFastest && (
            <Badge
              label={t("punish.fastestPunish")}
              color={colors.background}
              bgColor={colors.punishSuccess}
            />
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 2,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
            {punish.move.input}
          </Text>
          {punish.framesToSpare > 0 && (
            <Text style={{ color: colors.punishSuccess, fontSize: 10 }}>
              {t("punish.framesToSpare", { frames: punish.framesToSpare })}
            </Text>
          )}
        </View>
        {displayComboScaling ? (
          <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>
            {t("frameData.comboScaling")}: {displayComboScaling}
          </Text>
        ) : null}
      </View>
      <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
          <FrameValue value={String(punish.startup)} />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              minWidth: 40,
              textAlign: "center",
              fontVariant: ["tabular-nums"],
            }}
          >
            {punish.move.damage}
          </Text>
        </View>
        {displayProperties ? (
          <Text
            style={{ color: colors.accent, fontSize: 9, textAlign: "right" }}
          >
            {displayProperties}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
