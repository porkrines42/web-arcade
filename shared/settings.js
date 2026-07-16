(function () {
  'use strict';
  const SETTINGS_KEY = 'webArcade.settings';
  const PONG_KEY = 'webArcade.pong';
  const STATS_KEY = 'webArcade.stats';
  const LEGACY_MUTED = 'web-arcade-muted';
  const LEGACY_DIFFICULTY = 'web-arcade-pong-difficulty';
  const defaults = { sound: true, volume: 60, motion: 'system', theme: 'arcade', difficulty: 'normal' };
  const safeParse = (value, fallback) => { try { return JSON.parse(value) || fallback; } catch (_) { return fallback; } };
  const stored = safeParse(localStorage.getItem(SETTINGS_KEY), {});
  if (localStorage.getItem(LEGACY_MUTED) !== null && stored.sound === undefined) stored.sound = localStorage.getItem(LEGACY_MUTED) !== 'true';
  const settings = Object.assign({}, defaults, stored);
  function save() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); document.dispatchEvent(new CustomEvent('webarcade:settingschange', { detail: settings })); }
  function set(values) { Object.assign(settings, values); save(); apply(); }
  function motionMode() { return settings.motion === 'system' ? (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full') : settings.motion; }
  function apply() { document.documentElement.dataset.theme = settings.theme; document.documentElement.dataset.motion = motionMode(); }
  function pongPreferences() { return safeParse(localStorage.getItem(PONG_KEY), {}); }
  function defaultDifficulty() { const pong = pongPreferences(); return pong.difficulty || localStorage.getItem(LEGACY_DIFFICULTY) || settings.difficulty; }
  function savePong(values) { localStorage.setItem(PONG_KEY, JSON.stringify(Object.assign({}, pongPreferences(), values))); }
  const Arcade = window.WebArcade = window.WebArcade || {};
  Arcade.settings = settings; Arcade.saveSettings = set; Arcade.applySettings = apply; Arcade.getMotionMode = motionMode;
  Arcade.isMuted = () => !settings.sound || settings.volume === 0;
  Arcade.getVolume = () => settings.volume / 100;
  Arcade.getDefaultDifficulty = defaultDifficulty; Arcade.savePongPreferences = savePong;
  apply();
  function installed() { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
  function modal() {
    return `<div class="settings-modal" data-settings-modal hidden><div class="settings-scrim" data-settings-close></div><section class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1"><header><div><p class="eyebrow">WEB ARCADE</p><h2 id="settings-title">Settings center</h2></div><button class="settings-close" type="button" data-settings-close aria-label="Close settings">×</button></header><p class="settings-intro">Your choices are saved only on this device.</p><form data-settings-form><fieldset><legend>Audio</legend><label class="setting-switch"><span>Global sound <small>Used by every cabinet</small></span><input type="checkbox" name="sound"><i aria-hidden="true"></i></label><label class="setting-range" for="setting-volume"><span>Global volume <output data-volume-output>60%</output></span><input id="setting-volume" name="volume" type="range" min="0" max="100" step="1"></label></fieldset><fieldset><legend>Visuals</legend><label for="setting-motion">Animation</label><select id="setting-motion" name="motion"><option value="system">Browser default</option><option value="full">Full</option><option value="reduced">Reduced</option><option value="off">Off</option></select></fieldset><fieldset><legend>Theme</legend><label for="setting-theme">Arcade appearance</label><select id="setting-theme" name="theme"><option value="arcade">Arcade Dark</option><option value="midnight">Midnight</option><option value="contrast">High Contrast</option></select></fieldset><fieldset><legend>Gameplay defaults</legend><label for="setting-difficulty">Pong difficulty <small>Used until you pick a Pong-specific level</small></label><select id="setting-difficulty" name="difficulty"><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select></fieldset></form><section class="settings-data"><h3>Data controls</h3><p>Resets affect only this device and cannot be undone.</p><button type="button" class="settings-danger" data-reset-settings>Reset settings</button><button type="button" class="settings-danger" data-reset-pong hidden>Reset Pong preferences</button><button type="button" class="settings-danger" data-clear-data>Clear all Web Arcade data</button></section><section class="settings-info" aria-live="polite"><h3>App information</h3><dl><div><dt>Version</dt><dd data-version></dd></div><div><dt>Connection</dt><dd data-settings-network>Checking…</dd></div><div><dt>Installed</dt><dd>${installed() ? 'Yes — standalone app' : 'No — browser tab'}</dd></div></dl><button type="button" class="install-button" data-install-app hidden>Install app</button><p>On iPhone, use Safari’s <strong>Share</strong> menu and choose <strong>Add to Home Screen</strong>.</p></section><p class="settings-message" data-settings-message role="status"></p></section></div>`;
  }
  let previousFocus;
  function refreshModal(root) { const form = root.querySelector('[data-settings-form]'); form.sound.checked = settings.sound; form.volume.value = settings.volume; form.motion.value = settings.motion; form.theme.value = settings.theme; form.difficulty.value = settings.difficulty; root.querySelector('[data-volume-output]').textContent = settings.volume + '%'; root.querySelector('[data-reset-pong]').hidden = !(localStorage.getItem(PONG_KEY) || localStorage.getItem(LEGACY_DIFFICULTY)); const network = root.querySelector('[data-settings-network]'); network.textContent = navigator.onLine ? 'Online · offline-ready' : 'Offline-ready'; }
  function confirmAction(message, action) { if (window.confirm(message)) action(); }
  function setupModal(root) {
    const dialog = root.querySelector('.settings-dialog'); const form = root.querySelector('[data-settings-form]');
    const close = () => { root.hidden = true; previousFocus && previousFocus.focus(); };
    root.querySelectorAll('[data-settings-close]').forEach(button => button.addEventListener('click', close));
    form.addEventListener('input', () => { set({ sound: form.sound.checked, volume: Number(form.volume.value), motion: form.motion.value, theme: form.theme.value, difficulty: form.difficulty.value }); refreshModal(root); });
    root.querySelector('[data-reset-settings]').addEventListener('click', () => confirmAction('Reset audio, visuals, theme, and gameplay defaults to their original values?', () => { localStorage.removeItem(SETTINGS_KEY); Object.assign(settings, defaults); save(); apply(); refreshModal(root); root.querySelector('[data-settings-message]').textContent = 'Settings reset.'; }));
    root.querySelector('[data-reset-pong]').addEventListener('click', () => confirmAction('Remove saved Pong difficulty and preferences from this device?', () => { localStorage.removeItem(PONG_KEY); localStorage.removeItem(LEGACY_DIFFICULTY); refreshModal(root); root.querySelector('[data-settings-message]').textContent = 'Pong preferences reset.'; }));
    root.querySelector('[data-clear-data]').addEventListener('click', () => confirmAction('Clear all Web Arcade settings, Pong preferences, and local data from this device?', () => { Object.keys(localStorage).filter(key => key.startsWith('webArcade.') || key.startsWith('web-arcade-')).forEach(key => localStorage.removeItem(key)); localStorage.removeItem(STATS_KEY); Object.assign(settings, defaults); save(); apply(); refreshModal(root); root.querySelector('[data-settings-message]').textContent = 'All Web Arcade data cleared.'; }));
    root.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } if (event.key === 'Tab' && !root.hidden) { const focusable = [...dialog.querySelectorAll('button,input,select,[href]')].filter(el => !el.disabled); const first = focusable[0], last = focusable.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } } });
    window.addEventListener('online', () => refreshModal(root)); window.addEventListener('offline', () => refreshModal(root));
  }
  function mount() { document.body.insertAdjacentHTML('beforeend', modal()); const root = document.querySelector('[data-settings-modal]'); setupModal(root); document.querySelectorAll('[data-settings]').forEach(button => button.addEventListener('click', () => { previousFocus = button; refreshModal(root); root.hidden = false; root.querySelector('.settings-dialog').focus(); })); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
}());
