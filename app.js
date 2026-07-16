(function () {
  const indicator = document.getElementById('offline-status');
  function updateConnection() {
    const offline = !navigator.onLine;
    indicator.classList.toggle('is-offline', offline);
    indicator.querySelector('span').textContent = offline ? 'Offline ready' : 'Online · offline ready';
  }
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  updateConnection();
  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js'));
}());
