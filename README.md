# Web Arcade

A lightweight, neon-styled collection of browser games built with plain HTML, CSS, and JavaScript. The arcade includes one-player Pong and Block Grid, a satisfying block-placement puzzle, and can be installed for offline play after its first successful visit.

## Folder structure

```text
.
├── index.html                 # Arcade home and game library
├── styles.css / app.js         # Home-page presentation and behavior
├── manifest.webmanifest        # PWA metadata
├── service-worker.js           # Root offline cache for all games
├── shared/                    # Shared Settings Center, UI, and browser helpers
├── icons/icon.svg              # Self-contained installable-app icon
└── games/
    ├── pong/                   # Pong HTML, styles, and game logic
    └── block-grid/             # Block Grid HTML, styles, and game logic
```

## Play Pong

Open the home page and select **Play** on the Pong card. Keep the ball in play with **W/S** or **Up/Down Arrow** keys. You can also move the paddle with the mouse, drag on a touch screen, or use the visible mobile Up and Down buttons. Select Easy, Normal, or Hard; the first player to 7 wins.

## Play Block Grid

Open **Block Grid** from the home page, select any of the three pieces, then choose where to place it on the 8 × 8 board. Complete horizontal or vertical lines to clear them. The board supports mouse, touch, and keyboard play: Tab to a piece, then move the board cursor with the arrow keys and place with Space or Enter. Your best score remains only in this browser.

## Settings Center

Use **Settings** on the home page or in Pong to save global sound and volume, animation, theme, and default Pong difficulty preferences. Settings stay on the device. Pong keeps its own selected difficulty once you choose one, and the center provides confirmed controls to reset settings, Pong preferences, or all Web Arcade data.

## Local statistics and achievements

Pong records matches, points, win streaks, difficulty results, approximate active play time, and achievements in `localStorage`. This information stays only in the current browser on the current device; it is never sent anywhere. Open **View progress** from the home page to review it. The Settings Center has confirmed controls to reset Pong statistics and achievements or clear all Web Arcade data.

## Install, offline use, and updates

Visit the deployed site once while online, then use the visible **Install app** button when your browser offers it. On iPhone or iPad, use Safari’s Share button and choose **Add to Home Screen**. The installed arcade opens in standalone mode and respects the device safe area. You can also save Pong directly to the home screen; its shortcut opens Pong, while the persistent **Back to Arcade** link returns to the complete game library.

The first successful visit caches the arcade home page, Pong, Block Grid, Settings Center, statistics, achievements, icon, and their local supporting files. These saved pages continue to work offline; uncached destinations fall back to the home page instead of showing a browser error. Coming Soon cards remain informational and are not presented as offline games.

When a new release has downloaded, a small **An update is available** message appears. Choose **Update** to activate it and reload safely. A live Pong match is never reloaded automatically; finish or restart it first, then update.

## Publish with GitHub Pages

1. Push this repository to GitHub.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the `main` branch and the **/(root)** folder, then save.
4. Open the generated project URL.

All paths are relative so this works at a project URL such as `https://USERNAME.github.io/web-arcade/`. Preserve these relative paths; root-absolute paths would break project hosting.

## Add another game

1. Create a self-contained folder such as `games/my-game/` with its own `index.html`, CSS, and JavaScript.
2. Link shared PWA assets with paths relative to that folder (for example `../../manifest.webmanifest`). Do **not** add a game-level service worker.
3. Add a reusable game card to the home page linking to `games/my-game/`.
4. Add every new game file to `APP_FILES` in the root `service-worker.js` and increment the clearly named cache version.
5. Test home → game → home navigation, keyboard/touch controls, and offline use.

No packages, build tools, external services, or external assets are needed: publish the files directly from `main` and the repository root.
