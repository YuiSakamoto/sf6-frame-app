import type { CharacterInfo } from "./types.js";

/**
 * SF6 全キャラクター一覧
 * slug は Capcom公式サイトのURL内で使用されるもの
 */
export const ALL_CHARACTERS: CharacterInfo[] = [
  // ローンチキャラクター
  { slug: "ryu", name: "Ryu", nameJa: "リュウ" },
  { slug: "luke", name: "Luke", nameJa: "ルーク" },
  { slug: "jamie", name: "Jamie", nameJa: "ジェイミー" },
  { slug: "chun-li", name: "Chun-Li", nameJa: "春麗" },
  { slug: "guile", name: "Guile", nameJa: "ガイル" },
  { slug: "kimberly", name: "Kimberly", nameJa: "キンバリー" },
  { slug: "juri", name: "Juri", nameJa: "ジュリ" },
  { slug: "ken", name: "Ken", nameJa: "ケン" },
  { slug: "blanka", name: "Blanka", nameJa: "ブランカ" },
  { slug: "dhalsim", name: "Dhalsim", nameJa: "ダルシム" },
  { slug: "honda", name: "E.Honda", nameJa: "E.本田" },
  { slug: "deejay", name: "Dee Jay", nameJa: "ディージェイ" },
  { slug: "manon", name: "Manon", nameJa: "マノン" },
  { slug: "marisa", name: "Marisa", nameJa: "マリーザ" },
  { slug: "lily", name: "Lily", nameJa: "リリー" },
  { slug: "zangief", name: "Zangief", nameJa: "ザンギエフ" },
  { slug: "cammy", name: "Cammy", nameJa: "キャミィ" },
  { slug: "jp", name: "JP", nameJa: "JP" },
  // Year 1 DLC
  { slug: "rashid", name: "Rashid", nameJa: "ラシード" },
  { slug: "aki", name: "A.K.I.", nameJa: "A.K.I." },
  { slug: "ed", name: "Ed", nameJa: "エド" },
  { slug: "gouki_akuma", name: "Akuma", nameJa: "豪鬼" },
  // Year 2 DLC
  { slug: "bison", name: "M.Bison", nameJa: "ベガ" },
  { slug: "terry", name: "Terry", nameJa: "テリー" },
  { slug: "mai", name: "Mai", nameJa: "マイ" },
  { slug: "elena", name: "Elena", nameJa: "エレナ" },
  // Year 3 DLC
  { slug: "cviper", name: "C.Viper", nameJa: "C.ヴァイパー" },
  { slug: "sagat", name: "Sagat", nameJa: "サガット" },
];
