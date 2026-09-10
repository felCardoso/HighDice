# High Dice

A poker-like dice roguelite inspired by Balatro, built with React, TypeScript, and Vite.

Play at <a href="https://felcardoso.github.io/HighDice/" target="_blank" rel="noopener">HighDice</a>.

## Status

The project is being migrated from a vanilla-JS prototype (kept in [`legacy/`](./legacy) for
reference) to a React app. This is currently **Phase 1: project scaffold** — the game logic and
UI have not been ported yet.

## Stack

- React + TypeScript, bundled with Vite
- Tailwind CSS
- Zustand for state management
- Vitest for unit tests
- ESLint + Prettier

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
  game/         # pure game logic (dice, hand scoring, jokers, shop, run state) — no React
  store/        # Zustand stores
  components/   # React components, grouped by feature
  hooks/        # custom hooks
  lib/          # external integrations (e.g. Supabase, once added)
tests/          # unit tests (Vitest)
legacy/         # original vanilla-JS prototype, kept for reference during migration
```

## License

MIT — free to use.
