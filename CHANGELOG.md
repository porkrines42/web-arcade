# Changelog

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
