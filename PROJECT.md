# Web Arcade

## Vision

Web Arcade is a small, welcoming collection of quick browser games. It should feel like a pocket arcade cabinet: fast to open, clear to use, playable with a range of inputs, and available even after the connection drops. Pong is the first cabinet; the home page is designed to make future games feel like part of one product.

## Design philosophy

The home page should feel like a polished, premium browser-gaming platform without losing its lightweight character: deep, high-contrast surfaces, restrained neon accents, strong card hierarchy, and system typography. Motion should add atmosphere rather than distract, and must always respect reduced-motion preferences. Product claims and statistics must be factual; the arcade is free, private, account-free, and offline-ready after its first successful load.

## Architecture

The project intentionally uses plain HTML, CSS, and vanilla JavaScript. There is no build step, package manager, framework, CDN, analytics service, API, or database. Files can be deployed directly from the repository root to GitHub Pages.

## Folders

- `index.html`, `styles.css`, and `app.js` are the arcade home page.
- `games/<game-name>/` contains one self-contained playable game and its page assets.
- `shared/` contains only arcade-wide UI styles and small browser helpers, not game engines or game-specific logic.
- `icons/` contains local app icons.
- `service-worker.js` is the only service worker and must remain at the repository root.

## Adding a game

Create a folder under `games/` with an `index.html`, styles, and script. Add an Available card to the home-page grid with relative links, a concise description, category, status, and locally authored HTML/CSS/inline-SVG artwork. Keep the game usable by keyboard and, where suitable, pointer and touch input. Test the trip from the home page to the game and the Back to Arcade link before shipping.

## Shared UI and storage

Use `shared/arcade.css` for shared visual tokens, header/footer, controls, status chips, settings modal, and focus behavior. `shared/arcade.js` provides the version label, network indicator, and install prompt; `shared/settings.js` provides the arcade-wide Settings Center. Settings are stored in `webArcade.settings`, while Pong-specific choices live in `webArcade.pong`; the settings helper safely reads legacy `web-arcade-*` preferences without deleting them. Do not add third-party code to shared files.

## Accessibility and mobile

Pages need a skip link, semantic headings, visible `:focus-visible` states, readable contrast, and controls with labels. Layouts must adapt to narrow phone screens as well as tablet and desktop widths. Preserve keyboard, mouse, and touch controls for existing games whenever their UI is changed.

## Paths, PWA, and offline use

Use relative paths only: never root-absolute URLs, a GitHub user name, or a production host. Keep the manifest and root-scoped service worker working from a GitHub Pages project subpath. Every changed or newly required local asset must be listed in `APP_FILES` in `service-worker.js`; increment the cache version and retain obsolete-cache cleanup. Never put a service worker in a game directory.

## Versioning and roadmap

Display the current version in the shared footer and record releases in `CHANGELOG.md`. Increment the offline cache version whenever files change. A likely roadmap is additional games, optional local high scores, richer game-card artwork, motion-reduction refinements, and more offline-install polish—while keeping the no-build, dependency-free approach.
