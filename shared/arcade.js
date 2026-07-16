(function () {
  'use strict';
  const STORAGE_KEY = 'web-arcade-muted';
  const version = '1.1.0';
  const Arcade = window.WebArcade = window.WebArcade || {};
  Arcade.version = version;
  Arcade.isMuted = function () { return localStorage.getItem(STORAGE_KEY) === 'true'; };
  Arcade.setMuted = function (muted) { localStorage.setItem(STORAGE_KEY, String(Boolean(muted))); };
  Arcade.updateMuteButtons = function () { document.querySelectorAll('[data-global-mute]').forEach(button => { const muted = Arcade.isMuted(); button.setAttribute('aria-pressed', String(muted)); button.innerHTML = muted ? '🔇 <span>Sound off</span>' : '🔊 <span>Sound on</span>'; }); };
  function updateConnection() { document.querySelectorAll('[data-network-status]').forEach(indicator => { const offline = !navigator.onLine; indicator.classList.toggle('is-offline', offline); const label = indicator.querySelector('span'); if (label) label.textContent = offline ? 'Offline ready' : 'Online · offline ready'; }); }
  function configureInstall() { const install = document.querySelector('[data-install-app]'); if (!install) return; let promptEvent; window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); promptEvent = event; install.hidden = false; }); install.addEventListener('click', async () => { if (!promptEvent) return; promptEvent.prompt(); await promptEvent.userChoice; promptEvent = null; install.hidden = true; }); window.addEventListener('appinstalled', () => { install.hidden = true; }); }
  document.querySelectorAll('[data-version]').forEach(element => { element.textContent = 'v' + version; });
  document.querySelectorAll('[data-global-mute]').forEach(button => button.addEventListener('click', () => { Arcade.setMuted(!Arcade.isMuted()); Arcade.updateMuteButtons(); }));
  window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection); updateConnection(); Arcade.updateMuteButtons(); configureInstall();
}());
