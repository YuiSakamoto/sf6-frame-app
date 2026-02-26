# SF6 Frame Data & Punish Finder

Street Fighter 6 のフレームデータ閲覧 & 確定反撃検索アプリ。

## 機能

- **フレームデータ閲覧**: 全キャラクターの技データ（発生、持続、硬直、ガード時、ヒット時、ダメージ）をカテゴリ別に表示
- **確定反撃検索**: 相手キャラの技をガードした時、自キャラのどの技で確反が取れるかを即座に検索
- **グローバル検索**: 技名やコマンドで全キャラ横断検索
- **オフライン対応**: バンドル済みJSONデータで起動即使用可、バックグラウンドで最新データを同期
- **多言語対応**: 14言語のUI（日本語、英語、フランス語、イタリア語、ドイツ語、スペイン語、アラビア語、ポルトガル語(BR)、ポーランド語、ロシア語、中国語(簡体/繁体)、韓国語、スペイン語(中南米)）

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Framework | Expo SDK 55 / React Native 0.83 |
| Routing | Expo Router (file-based) |
| State | Zustand 5 |
| Storage | react-native-mmkv (native) / localStorage (web) |
| i18n | i18next + expo-localization |
| Scraper | Playwright |
| Package Manager | pnpm |

## セットアップ

```bash
pnpm install
```

## 開発

```bash
# Web
pnpm start --web

# iOS シミュレーター
pnpm start --ios

# Android エミュレーター
pnpm start --android
```

## スクレイパー

Capcom公式サイトからフレームデータを取得:

```bash
# Playwright ブラウザをインストール（初回のみ）
pnpm exec playwright install chromium

# 全キャラスクレイピング
pnpm exec tsx scripts/scraper/src/index.ts

# 特定キャラのみ
pnpm exec tsx scripts/scraper/src/index.ts --character ryu
```

取得したデータは `data/frames/` に保存されます。

## プロジェクト構造

```
src/
├── app/                  # Expo Router ページ
│   ├── (tabs)/           # タブ: ホーム / 確反検索 / 検索
│   └── character/[slug]  # キャラクター詳細
├── components/           # UI コンポーネント
├── hooks/                # カスタムフック
├── stores/               # Zustand ストア
├── services/             # データ取得・キャッシュ
├── i18n/                 # 翻訳ファイル (14言語)
├── types/                # TypeScript 型定義
├── utils/                # ユーティリティ関数
└── theme/                # SF6テーマカラー
data/
├── characters.json       # キャラクター一覧
├── version.json          # データバージョン
└── frames/               # キャラ別フレームデータ JSON
scripts/scraper/          # Playwright スクレイパー
```

## 確定反撃ロジック

```
確反成立条件: |相手技のガード時フレーム| >= 自キャラの技の発生フレーム

例: 相手の技がガード時 -8F → 自キャラの発生 8F 以下の技が確定反撃
```

## データソース

- フレームデータ: [Capcom SF6 公式サイト](https://www.streetfighter.com/6/ja-jp/)
- オフラインキャッシュ → GitHub Raw URL からバックグラウンド同期
