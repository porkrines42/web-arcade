# Web Arcade Agent Guide

- Preserve the multi-game structure: put every game in its own folder under `./games/`.
- Add a home-page card whenever a new game is added, and test navigation to the game and back.
- Preserve mobile, mouse, touch, and keyboard controls where applicable.
- Preserve offline functionality and the root service-worker scope. Never add a service worker inside an individual game.
- Use relative, GitHub Pages project-compatible paths; do not use root-absolute paths or hardcoded production URLs.
- Avoid dependencies and build tools unless explicitly requested.
- Whenever files change, update the root service worker file list and its cache version.
