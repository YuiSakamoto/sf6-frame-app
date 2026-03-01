# アーキテクチャ

## プロジェクト構造

```
src/
├── app/                  # Expo Router ページ（ファイルベースルーティング）
│   ├── (tabs)/           # タブ: ホーム / 確反検索 / 検索
│   └── character/[slug]  # キャラクター詳細
├── components/           # UI コンポーネント
├── hooks/                # カスタムフック
├── stores/               # Zustand ストア
├── services/             # データ取得・キャッシュ
├── i18n/                 # 翻訳ファイル (14言語)
├── types/                # TypeScript 型定義
├── utils/                # ユーティリティ関数
└── theme/                # SF6 テーマカラー
data/
├── characters.json       # キャラクター一覧
├── version.json          # データバージョン
└── frames/               # キャラ別フレームデータ JSON (28キャラ)
scripts/scraper/          # Playwright スクレイパー
```

## 技術スタック

- **フレームワーク**: React Native (Expo SDK 55) + expo-router
- **スタイリング**: NativeWind (TailwindCSS)
- **状態管理**: Zustand
- **ストレージ**: AsyncStorage + メモリキャッシュ (native) / localStorage (web)
- **多言語対応**: i18next + react-i18next + expo-localization
- **言語**: TypeScript (strict mode)

## パスエイリアス

- `@/*` → `src/*`（tsconfig.json で設定）

## 確定反撃ロジック

```
確反成立条件: |相手技のガード時フレーム| >= 自キャラの技の発生フレーム

例: 相手の技がガード時 -8F → 自キャラの発生 8F 以下の技が確定反撃
```

## データフロー

1. アプリ起動時に `data/frames/` のバンドル済み JSON を読み込み
2. Zustand ストアに格納
3. バックグラウンドで GitHub Raw URL から最新データをチェック
4. 更新があればダウンロードしてキャッシュを更新
