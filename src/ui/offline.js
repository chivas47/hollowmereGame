// v121: installs the service worker (sw.js) so the game can be installed and played offline.
// The first visit loads before the worker runs, so the page hands it the files it already loaded to keep.
// Browsers without service workers, or a page opened from a file, simply play online.
const kept = (u) => u.startsWith(location.origin) || u.startsWith('https://fonts.');

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.active.postMessage({ keep: [location.href, ...performance.getEntriesByType('resource').map((r) => r.name).filter(kept)] }))
      .catch(() => { /* offline play unavailable */ });
  });
}
