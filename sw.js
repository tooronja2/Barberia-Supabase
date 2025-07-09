const CACHE_NAME = 'barberia-admin-cache-v4';
const urlsToCache = [
  './',
  './admin-login.html',
  './admin-panel.html',
  './css/admin-style.css',
  './css/style.css',
  './js/admin-auth.js',
  './js/admin-panel.js',
  './js/supabase.js',
  './js/config.js',
  './js/pwa.js',
  './js/pwa-debug.js',
  './js/pwa-diagnostics.js',
  './js/pwa-checker.js',
  './manifest.json',
  './assets/images/barber-icon-192.png',
  './assets/images/barber-icon-512.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ SW: Cache opened:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ SW: All files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ SW: Cache installation failed:', error);
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
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('✅ SW: Cleaning old caches');
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('🗑️ SW: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ SW: Activated successfully');
      return self.clients.claim();
    })
  );
});
