# High Dice

A poker-like dice roguelite inspired by Balatro, built with React, TypeScript, and Vite.

Play at <a href="https://felcardoso.github.io/HighDice/" target="_blank" rel="noopener">HighDice</a>.

## Status

The project has been migrated from a vanilla-JS prototype (kept in [`legacy/`](./legacy) for
reference) to a React app, with jokers, a shop, and seeded runs on top of the original game.

## Features

- Classic poker-dice scoring: Five/Four/Three of a Kind, Full House, Straight, Two Pair, Pair.
- Hand-level upgrades and a shop where you spend coins on passive **jokers** that boost scoring.
- **Seeded runs** — every run has a shareable seed; typing the same seed back in reproduces the
  exact same dice sequence for the whole run.
- A persistent high score (stored in `localStorage`).

## Stack

- React + TypeScript, bundled with Vite
- Tailwind CSS
- Zustand for state management
- Vitest for unit tests
- ESLint + Prettier
- GitHub Actions for CI and GitHub Pages deployment

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # type-check + production build
npm run test      # run unit tests
npm run lint       # lint
npm run format     # format with Prettier
```

## Project structure

```
src/
  game/         # pure game logic (dice, hand scoring, jokers, shop, run state, rng) — no React
  store/        # Zustand stores
  components/   # React components, grouped by feature
  hooks/        # custom hooks
  lib/          # external integrations (e.g. Supabase, once added)
tests/          # unit tests (Vitest)
legacy/         # original vanilla-JS prototype, kept for reference during migration
```

## CI/CD

`.github/workflows/ci.yml` runs lint, format check, tests, and a production build on every push
and pull request. On a push to `main`, it also deploys `dist/` to GitHub Pages.

**One-time setup required**: in the repo's Settings → Pages, set "Source" to **GitHub Actions**
(instead of "Deploy from a branch"). Without this, the workflow's deploy step won't have anywhere
to publish to.

## License

MIT — free to use.
