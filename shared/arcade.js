(function () {
  'use strict';
  const VERSION = '1.14.0';
  const SETTINGS_KEY = 'webArcade.settings';
  const PONG_KEY = 'webArcade.pong';
  const STATS_KEY = 'webArcade.stats';
  const ACHIEVEMENTS_KEY = 'webArcade.achievements';
  const LEGACY_MUTE = 'web-arcade-muted';
  const LEGACY_DIFFICULTY = 'web-arcade-pong-difficulty';
  const defaults = { sound: true, volume: 70, motion: 'system', theme: 'arcade-dark', difficulty: 'normal' };
  const Arcade = window.WebArcade = window.WebArcade || {};
  function read(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value && typeof value === 'object' ? value : fallback; } catch (_) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function settings() { const value = Object.assign({}, defaults, read(SETTINGS_KEY, {})); value.sound = value.sound !== false; value.volume = Math.max(0, Math.min(100, Number(value.volume) || 0)); if (!['system', 'full', 'reduced', 'off'].includes(value.motion)) value.motion = defaults.motion; if (!['arcade-dark', 'midnight', 'high-contrast'].includes(value.theme)) value.theme = defaults.theme; if (!['easy', 'normal', 'hard'].includes(value.difficulty)) value.difficulty = defaults.difficulty; return value; }
  function saveSettings(next) { write(SETTINGS_KEY, Object.assign({}, settings(), next)); apply(); }
  function pong() { return read(PONG_KEY, {}); }
  function migrate() {
    const current = read(SETTINGS_KEY, {});
    if (localStorage.getItem(LEGACY_MUTE) !== null && current.sound === undefined) current.sound = localStorage.getItem(LEGACY_MUTE) !== 'true';
    if (Object.keys(current).length) write(SETTINGS_KEY, current);
    const game = pong();
    if (localStorage.getItem(LEGACY_DIFFICULTY) && !game.difficulty) { game.difficulty = localStorage.getItem(LEGACY_DIFFICULTY); write(PONG_KEY, game); }
  }
  function motionOff() { const value = settings().motion; return value === 'off' || (value === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function apply() {
    const value = settings();
    document.documentElement.dataset.theme = value.theme;
    document.documentElement.dataset.motion = motionOff() ? 'off' : value.motion === 'reduced' ? 'reduced' : 'full';
    document.querySelectorAll('[data-version]').forEach(el => { el.textContent = 'v' + VERSION; });
    document.querySelectorAll('[data-global-mute]').forEach(button => { const muted = !value.sound; button.setAttribute('aria-pressed', String(muted)); button.innerHTML = muted ? '🔇 <span>Sound off</span>' : '🔊 <span>Sound on</span>'; });
  }
  Arcade.version = VERSION; Arcade.getSettings = settings; Arcade.saveSettings = saveSettings;
  Arcade.isMuted = () => !settings().sound; Arcade.getVolume = () => settings().sound ? settings().volume / 100 : 0;
  Arcade.getPongDifficulty = () => pong().difficulty || settings().difficulty;
  Arcade.setPongDifficulty = difficulty => { write(PONG_KEY, Object.assign({}, pong(), { difficulty })); };
  Arcade.motionOff = motionOff;
  function announce(message) { document.querySelectorAll('[data-announcements]').forEach(node => { node.textContent = ''; setTimeout(() => { node.textContent = message; }, 20); }); }
  function updateConnection() { const offline = !navigator.onLine; document.querySelectorAll('[data-network-status]').forEach(indicator => { indicator.classList.toggle('is-offline', offline); const label = indicator.querySelector('span'); if (label) label.textContent = offline ? 'Offline — saved games ready' : 'Online · offline ready'; }); announce(offline ? 'You are offline. Saved arcade pages remain available.' : 'You are online.'); }
  let installPrompt;
  function install() { if (!installPrompt) return; installPrompt.prompt(); installPrompt.userChoice.then(() => { installPrompt = null; updateInstall(); }); }
  function updateInstall() { document.querySelectorAll('[data-install-app]').forEach(button => { button.hidden = !installPrompt; }); }
  function closeModal(modal, opener) { modal.hidden = true; document.body.classList.remove('modal-open'); if (opener) opener.focus(); }
  function openSettings(opener) {
    const modal = document.getElementById('settings-modal'); if (!modal) return;
    const value = settings();
    modal.querySelector('#setting-sound').checked = value.sound;
    modal.querySelector('#setting-volume').value = value.volume; modal.querySelector('#volume-value').textContent = value.volume + '%';
    modal.querySelector('#setting-motion').value = value.motion; modal.querySelector('#setting-theme').value = value.theme; modal.querySelector('#setting-difficulty').value = value.difficulty;
    modal.querySelector('#app-network').textContent = navigator.onLine ? 'Online · offline ready' : 'Offline';
    modal.querySelector('#app-standalone').textContent = matchMedia('(display-mode: standalone)').matches || navigator.standalone ? 'Yes — standalone app' : 'No — running in browser';
    modal.querySelector('#settings-install').hidden = !installPrompt; modal.querySelector('[data-reset="pong"]').hidden = !localStorage.getItem(PONG_KEY) && !localStorage.getItem(STATS_KEY) && !localStorage.getItem(ACHIEVEMENTS_KEY) && !localStorage.getItem(LEGACY_DIFFICULTY); modal.hidden = false; document.body.classList.add('modal-open'); modal.querySelector('.settings-close').focus(); modal._opener = opener;
  }
  function settingsModal() {
    const modal = document.createElement('div'); modal.id = 'settings-modal'; modal.className = 'settings-modal'; modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'settings-title');
    modal.innerHTML = `<div class="settings-dialog" tabindex="-1"><header><div><p class="settings-kicker">WEB ARCADE</p><h2 id="settings-title">Settings Center</h2></div><button class="settings-close" type="button" aria-label="Close settings">×</button></header><div class="settings-content"><section><h3>Audio</h3><label class="setting-switch"><input id="setting-sound" type="checkbox"><span>Global sound</span></label><label for="setting-volume">Global volume <output id="volume-value">70%</output></label><input id="setting-volume" type="range" min="0" max="100" step="1"></section><section><h3>Visuals</h3><label for="setting-motion">Animation</label><select id="setting-motion"><option value="system">System default</option><option value="full">Full</option><option value="reduced">Reduced</option><option value="off">Off</option></select><p class="setting-help">System default follows your browser’s reduced-motion preference; choosing Full, Reduced, or Off overrides it.</p><label for="setting-theme">Theme</label><select id="setting-theme"><option value="arcade-dark">Arcade Dark</option><option value="midnight">Midnight</option><option value="high-contrast">High Contrast</option></select></section><section><h3>Gameplay defaults</h3><label for="setting-difficulty">Default Pong difficulty</label><select id="setting-difficulty"><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select><p class="setting-help">Used only until Pong has its own saved difficulty.</p></section><section><h3>Data controls</h3><p class="setting-help">Reset settings removes audio, visuals, theme, and default difficulty choices. Pong preferences are kept.</p><div class="settings-actions"><button type="button" data-reset="settings">Reset settings</button><button type="button" data-reset="pong">Reset Pong preferences, statistics, and achievements</button><button type="button" class="danger" data-reset="all">Clear all Web Arcade data</button></div></section><section><h3>App information</h3><dl class="app-info"><div><dt>Version</dt><dd>v${VERSION}</dd></div><div><dt>Connection</dt><dd id="app-network"></dd></div><div><dt>Standalone</dt><dd id="app-standalone"></dd></div></dl><button id="settings-install" type="button" hidden>Install app</button><p class="setting-help">On iPhone or iPad, use Safari’s Share button, then choose <strong>Add to Home Screen</strong>.</p></section></div></div>`;
    document.body.append(modal);
    modal.querySelector('.settings-close').addEventListener('click', () => closeModal(modal, modal._opener));
    modal.addEventListener('click', event => { if (event.target === modal) closeModal(modal, modal._opener); });
    modal.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(modal, modal._opener); if (event.key === 'Tab') { const nodes = [...modal.querySelectorAll('button,input,select:not([disabled])')]; const first = nodes[0], last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
    modal.querySelector('#setting-sound').addEventListener('change', e => saveSettings({ sound: e.target.checked }));
    modal.querySelector('#setting-volume').addEventListener('input', e => { modal.querySelector('#volume-value').textContent = e.target.value + '%'; saveSettings({ volume: Number(e.target.value) }); });
    ['motion', 'theme', 'difficulty'].forEach(name => modal.querySelector('#setting-' + name).addEventListener('change', e => saveSettings({ [name]: e.target.value })));
    modal.querySelector('#settings-install').addEventListener('click', install);
    modal.querySelectorAll('[data-reset]').forEach(button => button.addEventListener('click', () => { const kind = button.dataset.reset; const message = kind === 'settings' ? 'Reset audio, visuals, theme, and gameplay defaults? Pong preferences will stay.' : kind === 'pong' ? 'Reset saved Pong preferences, statistics, and achievement progress, including its difficulty? This cannot be undone.' : 'Clear all saved Web Arcade settings, Pong preferences, statistics, and achievement progress on this device? This cannot be undone.'; if (!window.confirm(message)) return; if (kind === 'settings') localStorage.removeItem(SETTINGS_KEY); if (kind === 'pong') { localStorage.removeItem(PONG_KEY); localStorage.removeItem(STATS_KEY); localStorage.removeItem(ACHIEVEMENTS_KEY); localStorage.removeItem(LEGACY_DIFFICULTY); } if (kind === 'all') Object.keys(localStorage).filter(key => key.startsWith('webArcade.') || key.startsWith('web-arcade-')).forEach(key => localStorage.removeItem(key)); window.dispatchEvent(new CustomEvent('webarcade:statschange')); window.dispatchEvent(new CustomEvent('webarcade:achievementschange')); apply(); openSettings(modal._opener); }));
  }
  migrate(); apply(); settingsModal();
  document.querySelectorAll('[data-settings]').forEach(button => button.addEventListener('click', () => openSettings(button)));
  document.querySelectorAll('[data-global-mute]').forEach(button => button.addEventListener('click', () => saveSettings({ sound: !settings().sound })));
  document.querySelectorAll('[data-install-app]').forEach(button => button.addEventListener('click', install));
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; updateInstall(); }); window.addEventListener('appinstalled', () => { installPrompt = null; updateInstall(); });
  window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection); updateConnection();
  function showUpdate(worker) {
    if (document.querySelector('.update-notice')) return;
    const notice = document.createElement('aside'); notice.className = 'update-notice'; notice.setAttribute('role', 'status');
    notice.innerHTML = '<span>An update is available.</span><div><button type="button" data-update>Update</button><button type="button" data-dismiss>Dismiss</button></div>';
    document.body.append(notice); announce('An update is available.');
    notice.querySelector('[data-dismiss]').addEventListener('click', () => notice.remove());
    notice.querySelector('[data-update]').addEventListener('click', () => {
      if (document.body.dataset.pongActive === 'true') { announce('Finish or restart the active Pong match before updating.'); return; }
      notice.querySelector('[data-update]').disabled = true; worker.postMessage('skipWaiting');
    });
  }
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const manifest = document.querySelector('link[rel="manifest"]'); if (!manifest) return;
    const workerUrl = new URL(manifest.dataset.serviceWorker || 'service-worker.js', manifest.href);
    navigator.serviceWorker.register(workerUrl, { scope: new URL(manifest.dataset.serviceWorkerScope || './', manifest.href).pathname }).then(registration => {
      if (registration.waiting) showUpdate(registration.waiting);
      registration.addEventListener('updatefound', () => { const worker = registration.installing; if (worker) worker.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker); }); });
      let refreshing = false; navigator.serviceWorker.addEventListener('controllerchange', () => { if (!refreshing) { refreshing = true; window.location.reload(); } });
    }).catch(() => {});
  }
  window.addEventListener('load', registerServiceWorker);
}());
