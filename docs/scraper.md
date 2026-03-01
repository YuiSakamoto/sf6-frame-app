# スクレイパー

Capcom 公式サイトからフレームデータを取得するスクリプト。

## セットアップ

```bash
# Playwright ブラウザをインストール（初回のみ）
pnpm exec playwright install chromium
```

## 使い方

```bash
# 全キャラスクレイピング
pnpm exec tsx scripts/scraper/src/index.ts

# 特定キャラのみ
pnpm exec tsx scripts/scraper/src/index.ts --character ryu
```

取得したデータは `data/frames/<character>.json` に保存されます。

## データ構造

各キャラクターの JSON ファイルには以下が含まれます:

- `slug` - キャラクター識別子
- `name` / `nameJa` - 英語名 / 日本語名
- `version` - ゲームバージョン
- `moves[]` - 技リスト
  - `name` / `nameJa` - 技名
  - `input` - コマンド入力
  - `startup` / `active` / `recovery` - フレームデータ
  - `onBlock` / `onHit` - ガード時 / ヒット時フレーム
  - `damage` - ダメージ
  - `category` - カテゴリ (normal, special, super, unique, throw, common)
