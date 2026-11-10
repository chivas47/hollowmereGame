// v121: installs the service worker (sw.js) so the game can be installed and played offline.
// The first visit loads before the worker runs, so the page hands it the files it already loaded to keep.
// Browsers without service workers, or a page opened from a file, simply play online.
// v233: not on itch.io, whose player is an iframe on an origin every itch game shares; itch serves the files.
// The font ships in assets/fonts, so only the game's own files are kept.
import { onItch } from '../core/host.js';

const kept = (u) => u.startsWith(location.origin);

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !onItch) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.active.postMessage({ keep: [location.href, ...performance.getEntriesByType('resource').map((r) => r.name).filter(kept)] }))
      .catch(() => { /* offline play unavailable */ });
  });
}
