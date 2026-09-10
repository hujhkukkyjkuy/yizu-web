/* YiZu PWA service worker — cache app shell lightly */
const CACHE = 'yizu-shell-v2';
const BASE = '/yizu-web';
const PRECACHE = [BASE + '/', BASE + '/manifest.webmanifest', BASE + '/favicon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          try {
            if (res.ok && new URL(req.url).origin === self.location.origin) {
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
          } catch (_) {}
          return res;
        })
        .catch(() => caches.match(BASE + '/'))
    )
  );
});
