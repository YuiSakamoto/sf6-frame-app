# Scraper

Scripts to fetch frame data from the official Capcom website.

## Setup

```bash
# Install Playwright browser (first time only)
pnpm exec playwright install chromium
```

## Usage

```bash
# Scrape all characters
pnpm exec tsx scripts/scraper/src/index.ts

# Scrape a specific character
pnpm exec tsx scripts/scraper/src/index.ts --character ryu
```

Output is saved to `data/frames/<character>.json`.

## Data Structure

Each character JSON file contains:

- `slug` - Character identifier
- `name` / `nameJa` - English / Japanese name
- `version` - Game version
- `moves[]` - Move list
  - `name` / `nameJa` - Move name
  - `input` - Command input
  - `startup` / `active` / `recovery` - Frame data
  - `onBlock` / `onHit` - On-block / on-hit frames
  - `damage` - Damage value
  - `category` - Category (normal, special, super, unique, throw, common)
