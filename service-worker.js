const CACHE_NAME = 'web-arcade-v16';
const APP_FILES = ['./', 'index.html', 'styles.css', 'app.js', 'shared/arcade.css', 'shared/arcade.js', 'shared/stats.js', 'shared/achievements.js', 'manifest.webmanifest', 'icons/icon.svg', 'games/pong/', 'games/pong/index.html', 'games/pong/styles.css', 'games/pong/game.js', 'games/pong/manifest.webmanifest', 'games/block-grid/', 'games/block-grid/index.html', 'games/block-grid/styles.css', 'games/block-grid/game.js'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => { if (event.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const navigation = event.request.mode === 'navigate';
  event.respondWith(navigation
    ? fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then(hit => hit || caches.match('./')))
    : caches.match(event.request).then(hit => hit || fetch(event.request).then(response => { if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone())); return response; }))
  );
});
