# CI/CD

GitHub Actions による自動化パイプライン。

## ワークフロー一覧

### CI (`ci.yml`)

PR と main push で実行。3 ジョブ構成:

| ジョブ | 内容 |
|--------|------|
| `lint-typecheck` | TypeScript 型チェック → ESLint → Prettier フォーマットチェック |
| `test` | Vitest ユニットテスト + カバレッジ |
| `build-web` | Expo Web ビルド検証 (`lint-typecheck` と `test` の両方完了後) |

### AI Code Review (`ai-review.yml`)

PR 作成・更新時に GitHub AI Inference (GPT-4o) が差分を自動レビュー。
API キー不要（`GITHUB_TOKEN` のみ）。

### CodeQL (`codeql.yml`)

GitHub 公式の静的解析セキュリティテスト (SAST)。
TypeScript/JavaScript のセキュリティ脆弱性を検出。
main push, PR, 毎週月曜に実行。

### OSV-Scanner (`osv-scanner.yml`)

Google 製の依存パッケージ脆弱性スキャナー。
OSV データベースを使い、既知の脆弱性を検出。

## テストコマンド

```bash
pnpm test            # 全テスト実行
pnpm test:watch      # ウォッチモード
pnpm test:coverage   # カバレッジレポート
pnpm test:ci         # CI 用 (github-actions reporter)
```

## 依存パッケージ管理

[Renovate](https://github.com/renovatebot/renovate) で自動更新。

- devDependencies の minor/patch は自動マージ
- Expo SDK / React Native のメジャーアップデートは手動対応
- GitHub Actions のアップデートはグルーピング
- 毎週月曜朝にチェック
