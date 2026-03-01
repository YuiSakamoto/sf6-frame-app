# Copilot Code Review Instructions

## プロジェクト概要

Street Fighter 6 のフレームデータ閲覧・確定反撃検索アプリ（React Native / Expo）。

## レビュー観点

- TypeScript の strict mode に準拠しているか
- React Native と Web の両方で動作するコードか（プラットフォーム固有の API を使っていないか）
- i18n: ハードコードされた日本語/英語文字列がないか（UI テキストは `i18n/` の翻訳キーを使う）
- フレームデータの型（`Move`, `CharacterFrameData`）が正しく使われているか
- `@/` パスエイリアスが一貫して使われているか

## コーディング規約

- パッケージマネージャーは pnpm
- コミットメッセージは Conventional Commits 形式
- Prettier + ESLint でフォーマット・リント済みであること
