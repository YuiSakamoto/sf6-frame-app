# SF6 Frame Data & Punish Finder

[![CI](https://github.com/YuiSakamoto/sf6-frame-app/actions/workflows/ci.yml/badge.svg)](https://github.com/YuiSakamoto/sf6-frame-app/actions/workflows/ci.yml)

A frame data viewer and punish finder app for Street Fighter 6.

## Features

- **Frame Data Viewer**: Browse move data for all 28 characters by category
- **Punish Finder**: Instantly find punish options after blocking an opponent's move
- **Global Search**: Search across all characters by move name or command input
- **Offline Support**: Bundled data works immediately, with background sync for updates
- **Multilingual**: UI available in 14 languages

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm web             # Web
pnpm ios             # iOS Simulator
pnpm android         # Android Emulator
```

## Testing & Quality

```bash
pnpm test            # Run unit tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # With coverage report
pnpm typecheck       # TypeScript type check
pnpm lint            # ESLint
pnpm format:check    # Prettier format check
```

## Documentation

See [docs/](docs/) for detailed documentation.

- [Architecture](docs/architecture.md)
- [CI/CD](docs/ci.md)
- [Scraper](docs/scraper.md)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Expo SDK 55 / React Native |
| Routing | Expo Router (file-based) |
| State | Zustand |
| i18n | i18next + expo-localization |
| Test | Vitest |
| CI | GitHub Actions |
| Package Manager | pnpm |

## Data Source

- [Capcom SF6 Official Site](https://www.streetfighter.com/6/ja-jp/)
