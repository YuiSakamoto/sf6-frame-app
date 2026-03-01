/**
 * 広告設定
 *
 * 環境変数 EXPO_PUBLIC_ADS_ENABLED で制御:
 *   - "true" → 広告有効
 *   - それ以外 or 未設定 → 広告無効（デフォルト）
 *
 * 使い方:
 *   EXPO_PUBLIC_ADS_ENABLED=true pnpm start
 *   または .env に EXPO_PUBLIC_ADS_ENABLED=true を記載
 */
export const ADS_ENABLED = process.env.EXPO_PUBLIC_ADS_ENABLED === "true";
