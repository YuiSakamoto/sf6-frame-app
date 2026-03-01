# SF6 Frame Data App

Street Fighter 6 のフレームデータ閲覧・確定反撃検索アプリ。

## 技術スタック

- **フレームワーク**: React Native (Expo SDK 55) + expo-router
- **スタイリング**: NativeWind (TailwindCSS)
- **状態管理**: Zustand + react-native-mmkv
- **多言語対応**: i18next + react-i18next
- **言語**: TypeScript (strict mode)
- **パッケージマネージャー**: pnpm

## プロジェクト構成

```
src/
  app/            # expo-router ページ（ファイルベースルーティング）
    (tabs)/       # タブナビゲーション（index, punish, search）
    character/    # キャラクター詳細
  components/     # UIコンポーネント
  hooks/          # カスタムフック
  i18n/           # 多言語リソース
  services/       # データ読み込み等のサービス層
  stores/         # Zustand ストア
  theme/          # テーマ定義
  types/          # TypeScript 型定義
  utils/          # ユーティリティ関数
data/
  characters.json # キャラクター一覧
  frames/         # 28キャラ分のフレームデータ（JSON）
  version.json    # データバージョン
scripts/
  scraper/        # Capcom公式サイトからのスクレイピングスクリプト
```

## よく使うコマンド

```bash
pnpm start          # Expo 開発サーバー起動
pnpm ios             # iOS シミュレーターで起動
pnpm android         # Android エミュレーターで起動
pnpm web             # Web ブラウザで起動
pnpm lint            # ESLint 実行
pnpm format          # Prettier フォーマット
pnpm typecheck       # TypeScript 型チェック
```

## パスエイリアス

- `@/*` → `src/*`（tsconfig.json で設定）

## データ構造

- フレームデータは `data/frames/<character>.json` に格納
- 全28キャラクター対応
- スクレイピングスクリプトは `scripts/scraper/` にあり、`tsx` で実行
