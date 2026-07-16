(function () {
  'use strict';
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('service-worker.js'); });
  const button = document.querySelector('[data-settings]');
  const panel = document.querySelector('[data-settings-panel]');
  if (button && panel) button.addEventListener('click', function () { const open = panel.hidden; panel.hidden = !open; button.setAttribute('aria-expanded', String(open)); });
}());
