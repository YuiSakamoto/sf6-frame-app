// キャラクターごとのグラデーションカラー（SF6のイメージカラーに基づく）
const CHARACTER_COLORS: Record<string, [string, string]> = {
  ryu: ["#2244AA", "#113377"], // 青（道着）
  luke: ["#3388DD", "#1166AA"], // 水色
  jamie: ["#CC5500", "#994400"], // オレンジ（酔拳）
  chunli: ["#4466CC", "#2244AA"], // 青（チャイナ服）
  guile: ["#336633", "#224422"], // カーキ（軍服）
  kimberly: ["#CC3366", "#992255"], // ピンク（忍者）
  juri: ["#8833AA", "#662288"], // 紫
  ken: ["#CC2222", "#991111"], // 赤（道着）
  blanka: ["#33AA33", "#228822"], // 緑
  dhalsim: ["#CC8833", "#AA6622"], // オレンジ黄
  ehonda: ["#3355BB", "#223399"], // 青（まわし）
  deejay: ["#33BBAA", "#229988"], // ターコイズ
  manon: ["#CC88AA", "#AA6688"], // ローズピンク
  marisa: ["#BB4433", "#993322"], // 深紅
  lily: ["#44AACC", "#3388AA"], // スカイブルー
  zangief: ["#CC3333", "#AA2222"], // 赤
  cammy: ["#33AA66", "#228855"], // グリーン
  jp: ["#555577", "#333355"], // グレー紫
  rashid: ["#CCAA33", "#AA8822"], // ゴールド
  aki: ["#9944AA", "#773388"], // 毒紫
  ed: ["#4477CC", "#3366AA"], // 青
  gouki_akuma: ["#441111", "#330000"], // 暗赤（殺意の波動）
  vega_mbison: ["#663399", "#442266"], // 紫（サイコパワー）
  terry: ["#CC4422", "#AA3311"], // 赤（キャップ）
  mai: ["#DD2244", "#BB1133"], // 赤（忍装束）
  elena: ["#44BB88", "#33AA77"], // エメラルド
  cviper: ["#AA4488", "#883366"], // マゼンタ
  sagat: ["#BB7733", "#996622"], // ブラウン
};

// デフォルト色
const DEFAULT_COLORS: [string, string] = ["#444466", "#333355"];

export function getCharacterColors(slug: string): [string, string] {
  return CHARACTER_COLORS[slug] ?? DEFAULT_COLORS;
}
