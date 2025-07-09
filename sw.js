const CACHE_NAME = 'barberia-admin-cache-v1';
const urlsToCache = [
  '/',
  '/admin-login.html',
  '/admin-panel.html',
  '/css/admin-style.css',
  '/css/style.css',
  '/js/admin-auth.js',
  '/js/admin-panel.js',
  '/js/supabase.js',
  '/js/config.js',
  '/js/pwa.js',
  '/manifest.json',
  '/assets/images/barber-icon-192.png',
  '/assets/images/barber-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
