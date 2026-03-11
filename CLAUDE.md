# Sol Game

Kid-friendly Hebrew educational game platform for first-graders (class א1).

## Tech Stack

- **Astro** (v5) with static output — no server at runtime
- **TypeScript** (strict, extends `astro/tsconfigs/strict`)
- **Bun** as package manager and runtime
- Deployed to **GitHub Pages** via GitHub Actions (push to `main` triggers deploy)

## Project Structure

```
src/
  layouts/Base.astro          # Shared HTML shell (RTL, he lang)
  pages/
    index.astro               # Home — game card grid with completion badges
    games/<game>/index.astro  # Each game's Astro page (loads CSS + TS)
  games/<game>/               # Game logic (pure TS, no framework)
    index.ts                  # Entry — wires game logic + renderer + events
    game.ts                   # Pure game state/logic (no DOM)
    renderer.ts               # DOM rendering + interaction
    data.ts                   # Game content data
    types.ts                  # TypeScript interfaces
  shared/
    progress.ts               # localStorage completion tracking
    sounds.ts                 # Sound effects
    victory.ts                # Victory/celebration UI
  styles/
    main.css                  # Global styles
    <game>.css                # Per-game styles
    shared-game.css           # Shared game UI styles
public/
  images/                     # Static assets (puzzle photos, comic images)
```

## Games

1. **hebrew-match** — Match Hebrew letters to pictures (drag lines)
2. **picture-puzzle** — Jigsaw puzzle
3. **math-quiz** — Addition and subtraction
4. **comics-quiz** — Read comic stories and answer questions

## Commands

- `bun run dev` — Start Astro dev server (port 1234)
- `bun run build` — Build static site to `dist/`
- `bun run preview` — Preview built site

## Conventions

- All pages are RTL (`lang="he" dir="rtl"`)
- Game logic lives in `src/games/<name>/`, page shell in `src/pages/games/<name>/`
- Game state classes are pure (no DOM) — renderers handle DOM separately
- Completion is tracked via `localStorage` using `src/shared/progress.ts`
- `BASE_URL` (`import.meta.env.BASE_URL`) is used for all internal links (GitHub Pages subpath)
- Environment variables `SITE_URL` and `BASE_PATH` are set during CI build

## Deployment

Push to `main` → GitHub Actions builds with Bun → deploys to GitHub Pages.
Site URL pattern: `https://<owner>.github.io/<repo>/`
