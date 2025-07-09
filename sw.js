const CACHE_NAME = 'barberia-admin-cache-v6';
const urlsToCache = [
  '/admin-login.html',
  '/admin-panel.html',
  '/css/admin-style.css',
  '/css/style.css',
  '/js/admin-auth.js',
  '/js/admin-panel.js',
  '/js/supabase.js',
  '/js/config.js',
  '/js/pwa.js',
  '/js/pwa-debug.js',
  '/js/pwa-diagnostics.js',
  '/js/pwa-checker.js',
  '/manifest.json',
  '/assets/images/barber-icon-48.png',
  '/assets/images/barber-icon-72.png',
  '/assets/images/barber-icon-96.png',
  '/assets/images/barber-icon-144.png',
  '/assets/images/barber-icon-192.png',
  '/assets/images/barber-icon-512.png',
  '/assets/images/barber-icon-192-maskable.png',
  '/assets/images/barber-icon-512-maskable.png'
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
  // Only handle requests within the admin scope
  if (event.request.url.includes('/admin-login.html') || 
      event.request.url.includes('/admin-panel.html') ||
      event.request.url.includes('/css/admin-style.css') ||
      event.request.url.includes('/css/style.css') ||
      event.request.url.includes('/js/admin-') ||
      event.request.url.includes('/js/supabase.js') ||
      event.request.url.includes('/js/config.js') ||
      event.request.url.includes('/js/pwa') ||
      event.request.url.includes('/manifest.json') ||
      event.request.url.includes('/assets/images/barber-icon-')) {
    
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('✅ SW: Serving from cache:', event.request.url);
            return response;
          }
          
          console.log('🌐 SW: Fetching from network:', event.request.url);
          return fetch(event.request)
            .then(response => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              console.log('❌ SW: Network failed, using offline fallback');
              // Fallback for offline
              if (event.request.destination === 'document') {
                return caches.match('/admin-login.html');
              }
            });
        })
    );
  }
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
