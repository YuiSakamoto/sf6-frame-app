# Copilot Code Review Instructions

## Project Overview

A Street Fighter 6 frame data viewer and punish finder app built with React Native / Expo.

## Review Focus

- Ensure compliance with TypeScript strict mode
- Verify code works on both React Native and Web (no platform-specific APIs without abstractions)
- i18n: No hardcoded UI strings — use translation keys from `i18n/`
- Correct usage of frame data types (`Move`, `CharacterFrameData`)
- Consistent use of `@/` path aliases

## Coding Conventions

- Package manager: pnpm
- Commit messages: Conventional Commits format
- Code must pass Prettier formatting and ESLint checks
