# Architecture

## Project Structure

```
src/
├── app/                  # Expo Router pages (file-based routing)
│   ├── (tabs)/           # Tabs: Home / Punish Finder / Search
│   └── character/[slug]  # Character detail
├── components/           # UI components
├── hooks/                # Custom hooks
├── stores/               # Zustand stores
├── services/             # Data fetching & caching
├── i18n/                 # Translation files (14 languages)
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── theme/                # SF6 theme colors
data/
├── characters.json       # Character list
├── version.json          # Data version
└── frames/               # Per-character frame data JSON (28 characters)
scripts/scraper/          # Playwright scraper
```

## Tech Stack

- **Framework**: React Native (Expo SDK 55) + expo-router
- **Styling**: NativeWind (TailwindCSS)
- **State Management**: Zustand
- **Storage**: AsyncStorage + in-memory cache (native) / localStorage (web)
- **i18n**: i18next + react-i18next + expo-localization
- **Language**: TypeScript (strict mode)

## Path Aliases

- `@/*` → `src/*` (configured in tsconfig.json)

## Punish Logic

```
Punish condition: |opponent's on-block frame| >= your move's startup frames

Example: Opponent's move is -8F on block → Any move with 8F or less startup is a punish
```

## Data Flow

1. On app launch, load bundled JSON from `data/frames/`
2. Store in Zustand store
3. Check for updates in background via GitHub Raw URL
4. Download and update cache if newer data is available
