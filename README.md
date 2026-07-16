# Web Arcade

A lightweight, neon-styled collection of browser games built with plain HTML, CSS, and JavaScript. The first cabinet is a complete one-player Pong game, and the app can be installed for offline play after its first successful visit.

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
    └── pong/                   # Pong HTML, styles, and game logic
```

## Play Pong

Open the home page and select **Play** on the Pong card. Keep the ball in play with **W/S** or **Up/Down Arrow** keys. You can also move the paddle with the mouse, drag on a touch screen, or use the visible mobile Up and Down buttons. Select Easy, Normal, or Hard; the first player to 7 wins.

## Settings Center

Use **Settings** on the home page or in Pong to save global sound and volume, animation, theme, and default Pong difficulty preferences. Settings stay on the device. Pong keeps its own selected difficulty once you choose one, and the center provides confirmed controls to reset settings, Pong preferences, or all Web Arcade data.

## Install the PWA

Visit the deployed site once while online, then use your browser's **Install app** or **Add to Home Screen** control. The service worker caches the home page, Pong, icons, and supporting files so both screens work offline afterward.

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
