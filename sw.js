// v121: plays offline once the game has loaded online. Network first, so a new version is always what
// loads when there is a connection (modules never mix two versions); every answer is kept in the cache,
// and the cache answers when the network cannot. The game's own files plus its font from Google Fonts.
const CACHE = 'hollowmere';
const FONTS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// The page's list of what it loaded before the worker ran (ui/offline.js).
self.addEventListener('message', (e) => {
  const urls = e.data?.keep;
  if (Array.isArray(urls)) e.waitUntil(caches.open(CACHE).then((c) => Promise.all(urls.map((u) => c.add(u).catch(() => {})))));
});

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || (url.origin !== self.location.origin && !FONTS.includes(url.origin))) return;
  // The game's own files are checked with the server every time (no-cache: a quick "not modified" when
  // nothing changed), so the browser's own cache never serves an old version while online.
  const own = url.origin === self.location.origin;
  const net = own ? fetch(req.mode === 'navigate' ? req.url : req, { cache: 'no-cache' }) : fetch(req);
  e.respondWith(net.then((res) => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: own }).then((hit) => hit || Response.error())));
});
