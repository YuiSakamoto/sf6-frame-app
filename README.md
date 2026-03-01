# SF6 Frame Data & Punish Finder

[![CI](https://github.com/YuiSakamoto/sf6-frame-app/actions/workflows/ci.yml/badge.svg)](https://github.com/YuiSakamoto/sf6-frame-app/actions/workflows/ci.yml)
[![CodeQL](https://github.com/YuiSakamoto/sf6-frame-app/actions/workflows/codeql.yml/badge.svg)](https://github.com/YuiSakamoto/sf6-frame-app/actions/workflows/codeql.yml)

Street Fighter 6 のフレームデータ閲覧 & 確定反撃検索アプリ。

## 機能

- **フレームデータ閲覧**: 全28キャラクターの技データをカテゴリ別に表示
- **確定反撃検索**: 相手技をガードした際の確反候補を即座に検索
- **グローバル検索**: 技名・コマンドで全キャラ横断検索
- **オフライン対応**: バンドル済みデータで起動即使用可
- **多言語対応**: 14言語の UI

## セットアップ

```bash
pnpm install
```

## 開発

```bash
pnpm web             # Web
pnpm ios             # iOS シミュレーター
pnpm android         # Android エミュレーター
```

## テスト & 品質チェック

```bash
pnpm test            # ユニットテスト実行
pnpm test:watch      # ウォッチモード
pnpm test:coverage   # カバレッジレポート付き
pnpm typecheck       # TypeScript 型チェック
pnpm lint            # ESLint
pnpm format:check    # Prettier フォーマットチェック
```

## ドキュメント

詳細なドキュメントは [docs/](docs/) を参照してください。

- [アーキテクチャ](docs/architecture.md)
- [CI/CD](docs/ci.md)
- [スクレイパー](docs/scraper.md)

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Framework | Expo SDK 55 / React Native |
| Routing | Expo Router (file-based) |
| State | Zustand |
| i18n | i18next + expo-localization |
| Test | Vitest |
| CI | GitHub Actions |
| Package Manager | pnpm |

## データソース

- [Capcom SF6 公式サイト](https://www.streetfighter.com/6/ja-jp/)
