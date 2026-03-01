import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import type { Move } from "@/types/frame-data";
import { FrameValue } from "./FrameValue";
import { useTranslation } from "react-i18next";
import { getMoveName, getComboScaling, getProperties, getNotes } from "@/utils/moveName";

interface MoveRowProps {
  move: Move;
  onPress?: (move: Move) => void;
  /** trueの場合タップで詳細を展開する（デフォルト: true） */
  expandable?: boolean;
}

/** 詳細行の1項目 */
function DetailItem({ label, value }: { label: string; value?: string }) {
  if (!value || value === "" || value === "-") return null;
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={{ color: colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11, fontVariant: ["tabular-nums"] }}>
        {value}
      </Text>
    </View>
  );
}

export function MoveRow({ move, onPress, expandable = true }: MoveRowProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const displayName = getMoveName(move, lang);
  const displayProperties = getProperties(move, lang);
  const displayComboScaling = getComboScaling(move, lang);
  const displayNotes = getNotes(move, lang);
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => {
        if (expandable) setExpanded((prev) => !prev);
        onPress?.(move);
      }}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: expanded ? colors.surfaceLight : colors.surface,
      }}
    >
      {/* メイン行: 技名 + 主要フレーム値 */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
            {move.input ? (
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                {move.input}
              </Text>
            ) : null}
            {displayProperties ? (
              <Text style={{ color: colors.accent, fontSize: 10, fontWeight: "600" }}>
                {displayProperties}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
          <FrameValue value={move.startup} />
          <FrameValue value={move.onBlock} />
          <FrameValue value={move.onHit} />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              minWidth: 40,
              textAlign: "center",
              fontVariant: ["tabular-nums"],
            }}
          >
            {move.damage}
          </Text>
        </View>
      </View>

      {/* 展開時の詳細情報 */}
      {expanded && (
        <View
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* 左列: フレーム関連 */}
            <View style={{ flex: 1 }}>
              <DetailItem label={t("frameData.active")} value={move.active} />
              <DetailItem label={t("frameData.recovery")} value={move.recovery} />
              <DetailItem label={t("frameData.cancel")} value={move.cancel} />
              <DetailItem label={t("frameData.comboScaling")} value={displayComboScaling} />
            </View>
            {/* 右列: ゲージ関連 */}
            <View style={{ flex: 1 }}>
              <DetailItem label={t("frameData.driveGaugeGain")} value={move.driveGaugeGain} />
              <DetailItem label={t("frameData.driveGaugeLossBlock")} value={move.driveGaugeLossBlock} />
              <DetailItem label={t("frameData.driveGaugeLossPc")} value={move.driveGaugeLossPc} />
              <DetailItem label={t("frameData.saGaugeGain")} value={move.saGaugeGain} />
            </View>
          </View>
          {displayNotes ? (
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>
              {displayNotes}
            </Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
