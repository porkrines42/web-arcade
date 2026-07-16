(function () {
  'use strict';
  const STORAGE_KEY = 'web-arcade-muted';
  const version = '1.3.0';
  const Arcade = window.WebArcade = window.WebArcade || {};
  Arcade.version = version;
  Arcade.isMuted = function () { return Arcade.settings ? !Arcade.settings.sound || Arcade.settings.volume === 0 : localStorage.getItem(STORAGE_KEY) === 'true'; };
  Arcade.setMuted = function (muted) { if (Arcade.settings && Arcade.saveSettings) Arcade.saveSettings({ sound: !muted }); else localStorage.setItem(STORAGE_KEY, String(Boolean(muted))); };
  Arcade.updateMuteButtons = function () { document.querySelectorAll('[data-global-mute]').forEach(button => { const muted = Arcade.isMuted(); button.setAttribute('aria-pressed', String(muted)); button.innerHTML = muted ? '🔇 <span>Sound off</span>' : '🔊 <span>Sound on</span>'; }); };
  function updateConnection() { document.querySelectorAll('[data-network-status]').forEach(indicator => { const offline = !navigator.onLine; indicator.classList.toggle('is-offline', offline); const label = indicator.querySelector('span'); if (label) label.textContent = offline ? 'Offline ready' : 'Online · offline ready'; }); }
  function configureInstall() { let promptEvent; const buttons = () => document.querySelectorAll('[data-install-app]'); window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); promptEvent = event; buttons().forEach(button => { button.hidden = false; }); }); document.addEventListener('click', async event => { const install = event.target.closest('[data-install-app]'); if (!install || !promptEvent) return; promptEvent.prompt(); await promptEvent.userChoice; promptEvent = null; buttons().forEach(button => { button.hidden = true; }); }); window.addEventListener('appinstalled', () => { buttons().forEach(button => { button.hidden = true; }); }); }
  document.querySelectorAll('[data-version]').forEach(element => { element.textContent = 'v' + version; });
  document.querySelectorAll('[data-global-mute]').forEach(button => button.addEventListener('click', () => { Arcade.setMuted(!Arcade.isMuted()); Arcade.updateMuteButtons(); }));
  window.addEventListener('online', updateConnection); window.addEventListener('offline', updateConnection); updateConnection(); Arcade.updateMuteButtons(); configureInstall();
}());
