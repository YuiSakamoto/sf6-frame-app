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

### Copilot Code Review (Ruleset)

PR 作成・更新時に GitHub Copilot が自動でコードレビュー。
Rulesets で有効化済み。カスタム指示は `.github/copilot-instructions.md` に定義。

### CodeQL (Default Setup)

GitHub 公式の静的解析セキュリティテスト (SAST)。
Default Setup で有効化済み（ワークフローファイル不要）。

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
