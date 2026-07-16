# Web Arcade Agent Guide

- Read `PROJECT.md` before making changes so additions follow the product and platform conventions.

- Preserve the multi-game structure: put every game in its own folder under `./games/`.
- Add a home-page card whenever a new game is added, and test navigation to the game and back.
- Preserve mobile, mouse, touch, and keyboard controls where applicable.
- Preserve offline functionality and the root service-worker scope. Never add a service worker inside an individual game.
- Use relative, GitHub Pages project-compatible paths; do not use root-absolute paths or hardcoded production URLs.
- Avoid dependencies and build tools unless explicitly requested.
- Whenever files change, update the root service worker file list and its cache version.

## Pull-request automation

- Pull requests targeting `main` are automatically queued for squash auto-merge once they are ready for review and originate from this repository.
- The **Validate Web Arcade** check must pass before GitHub can merge a queued pull request. Merge conflicts and failed checks require manual intervention; never bypass validation or branch protections.
- GitHub automatically deletes merged head branches. A merge to `main` continues to trigger the existing GitHub Pages deployment.
