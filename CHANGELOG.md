# Changelog

## Version 1.11.2 — Block Grid drag completion

- Removed the initial board-cursor highlight until a keyboard move is made.
- Calculate dragged-piece destinations from the board geometry and finish captured pointer releases on their source piece, preventing stuck drags on mobile.

## Version 1.11.1 — Block Grid drag reliability

- Captured active pointers from a tray piece so mouse and touch drags continue smoothly beyond the source button and release reliably.
- Showed landing previews only while a dragged piece is over the board, and let players return a piece to the tray without placing it.

## Unreleased — Block Grid drag and drop

- Added mouse and touch drag-and-drop placement for Block Grid pieces while retaining click and keyboard controls.
- Fixed dragged pieces to follow the grabbed block, align their previews and drops to the board, and reset cleanly after cancelled or invalid drops.
- Route active pointer movement and release through the document so mouse and touch drags continue reliably from a tray piece onto the board.

## Version 1.11.0 — Block Grid

- Added Block Grid, a touch- and keyboard-friendly neon block-placement puzzle with line clears and local best scores.
- Added its arcade library card and offline cache coverage.

## Version 1.10.1 — Pong mobile layout refinement

- Added a Back to Arcade button to the portrait rotation prompt.
- Moved the in-game arcade link to the top-left of the mobile score banner and condensed difficulty choices into a selector.

## Version 1.10.0 — Pong mobile score controls

- Replaced the mobile Up and Down paddle buttons with direct touch movement on the court.
- Moved Pause, difficulty selection, and the Arcade menu link into Pong's score banner so they remain available during mobile landscape play.

## Unreleased — Repository automation

- Added dependency-free pull-request validation for required files, syntax, manifests, local references, GitHub Pages-safe paths, service-worker scope, binary additions, and dependency artifacts.
- Added safe same-repository squash auto-merge queueing that honors required checks and branch protections.

## Version 1.9.0 — Full-screen mobile Pong

- Restored the landscape rotation prompt and full-screen Pong cabinet for touch devices, including home-screen installs where the platform supports the mode.
- Kept the on-screen Up and Down paddle buttons visible over the full-screen court so touch controls remain usable after rotating.

## Version 1.8.0 — Mobile arcade access

- Restored the complete Pong page on phones: difficulty selection, touch controls, and the Back to Arcade link remain available in portrait and landscape.
- Kept the arcade navigation visible while scrolling and removed the forced fullscreen/orientation experience that prevented access to the game menu.
- Expanded the Pong installed-app scope to include the arcade home page, so a Pong home-screen shortcut can return to the game library.

## Version 1.7.0 — Mobile Pong cabinet

- Made Pong install as its own landscape-oriented standalone app, while keeping it under the root offline service worker.
- Added a phone-rotation prompt, landscape game-cabinet layout, and fullscreen request where the browser supports it.

## Version 1.6.0 — Phase 1 polish complete

- Added safe-area-aware mobile layouts, larger controls, scrollable dialogs, responsive Pong layouts, and orientation-safe pausing.
- Completed PWA update handling with an opt-in update notice, cache cleanup, offline navigation fallback, installation metadata, and offline status announcements.
- Refined keyboard and screen-reader behavior, including focus containment and restoration in progress dialogs, live connection/update messages, and reduced-motion-safe UI.

## Version 1.5.0 — Local statistics and achievements

- Added local-only Pong match, point, streak, difficulty, date, and active-play-time statistics with safe versioned storage.
- Added eight gameplay-earned Pong achievements, accessible unlock notices, progress views, polished empty states, and confirmed reset controls.
- Added shared statistics and achievement modules to the offline cache and documented local data conventions.

## Version 1.4.0 — Settings Center completion

- Completed the shared Settings Center with validated persistent preferences, app status and install guidance, keyboard focus return, and confirmed data controls.
- Made Pong's canvas use shared theme tokens and extended the Pong reset control to remove saved Pong statistics when present.

## Version 1.3.0 — Settings Center

- Added a reusable, keyboard-accessible Settings Center on the arcade and Pong, with persistent global audio, visual motion, theme, and gameplay-default choices.
- Added safe migration for existing mute and Pong difficulty preferences, confirmed local-data reset controls, and app installation, connection, standalone, and iPhone guidance.
- Updated Pong to honor global volume, mute, motion, theme variation, and saved/default difficulty while retaining its improved CPU and controls.


## Version 1.2.0 — Premium home page redesign

- Rebuilt the home page with a responsive premium arcade layout, CSS-authored cabinet artwork, featured Pong presentation, reusable game cards, and accessible mobile navigation.
- Added factual arcade statistics, a privacy-first product promise, an achievements placeholder, settings disclosure, and clear offline/install status treatment.
- Updated shared version labels and offline cache coverage for the redesigned experience.

## Version 1.1.1 — Pong gameplay tuning

- Rebuilt Pong CPU behavior with distinct reaction, speed, tracking, and predictive-intercept tuning for Easy, Normal, and Hard difficulties.
- Made rallies more responsive with delta-time movement, accelerated angled paddle returns, reliable high-speed collisions, and impact and scoring feedback.
- Added automatic pause on hidden tabs and a visible difficulty guide.

## Version 1.1.0 — Arcade foundation redesign

- Redesigned the home page around a reusable arcade library and featured Pong play path.
- Added shared navigation, online status, install support, global mute preferences, and product documentation.
- Refined Pong's arcade integration while retaining its existing controls and gameplay.

## Version 1.0.0 — Initial Web Arcade and Pong

- Introduced the Web Arcade progressive web app and its first playable game, Pong.
