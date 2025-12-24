# High Dice

Small single-player dice game built with HTML/CSS/JS.

## Overview

High Dice is a poker-like dice game based on Balatro, but using 5 dice. The player makes "plays" that consume an stake, can reroll selected dice, and can upgrade hand levels to increase scores.

## How to run

- <a href="https://felcardoso.github.io/HighDice/" target="_blank" rel="noopener">HighDice</a>
- Open `index.html` in a browser (double-click or serve with a simple static server).

## Project structure

- `index.html` — UI and markup.
- `styles.css` — styles.
- `game.js` — game logic (classes and functions).
- `manifest.json` — PWA manifest.

## Key files / symbols

- Main logic: `game.js`
  - Classes: `Dice`, `Table`, `Run`, `Player`
  - Constants: `HAND_SCORE`, `HAND_NAMES`, `HAND_ORDER`
  - Render/UI: `renderHUD`, `renderDice`
  - Actions: `rerollSelected`, `playOnce`, `openUpgradeModal`, `resetGame`

## How to play

1. Click any die to select or deselect it.
2. Click "Reroll" to reroll selected dice (consumes rerolls).
3. Click "Play Hand" to score the current hand — this computes score and subtracts from the stake (consumes plays).
4. When the stake reaches zero you level up and upgrade 1 of 4 hand options.
5. Use "Hand Upgrade" to level up specific hands (improves multipliers/points).

Game messages appear in the on-screen console log.

## Scoring (summary)

Each hand has a base value and multipliers in `HAND_SCORE` (see `game.js`). Final score includes the sum of dice faces plus level-based bonuses.

## Development notes

- Main logic is in `game.js`. Hand evaluation (pairs, three-of-a-kind, full house, straights, etc.) is implemented in the `Table` methods.
- Styles are in `styles.css`.

## Reset / State

- "Reset Game" resets levels / game state and clears the log.

## License

MIT — free to use.
