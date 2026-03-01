# CI/CD

Automated pipeline powered by GitHub Actions.

## Workflows

### CI (`ci.yml`)

Runs on PRs and main push. 3-job pipeline:

| Job | Description |
|-----|-------------|
| `lint-typecheck` | TypeScript type check → ESLint → Prettier format check |
| `test` | Vitest unit tests + coverage |
| `build-web` | Expo Web build verification (runs after `lint-typecheck` and `test`) |

### Copilot Code Review (Ruleset)

Automatic code review by GitHub Copilot on PR creation and updates.
Enabled via Rulesets. Custom instructions defined in `.github/copilot-instructions.md`.

### CodeQL (Default Setup)

GitHub's official SAST (Static Application Security Testing).
Enabled via Default Setup (no workflow file needed).

### OSV-Scanner (`osv-scanner.yml`)

Google's dependency vulnerability scanner.
Detects known vulnerabilities using the OSV database.

## Test Commands

```bash
pnpm test            # Run all tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # With coverage report
pnpm test:ci         # CI mode (github-actions reporter)
```

## Dependency Management

Automated updates via [Renovate](https://github.com/renovatebot/renovate).

- Auto-merge minor/patch updates for devDependencies
- Major updates for Expo SDK / React Native require manual review
- GitHub Actions updates are grouped together
- Runs weekly on Monday mornings
