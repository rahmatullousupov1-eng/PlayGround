const CACHE_NAME = 'invictus-v4-6-subjects-20261026-fix1';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './lib/safe.js',
  './lib/idb.js',
  './lib/i18n.js',
  './vendor/pdf.min.js',
  './vendor/mammoth.browser.min.js',
  './lib/supabase-auth.js',
  './modules/knowledge/knowledge.js',
  './modules/knowledge/knowledge.css',
  './modules/v3-core.js',
  './modules/v3-core.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;

  const isStatic = /\.(?:html|css|js|json|svg|png|jpg|jpeg|webp|woff2?)$/i.test(url.pathname) || url.pathname.endsWith('/');
  if (!isStatic) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request, { cache: 'no-cache' }).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
