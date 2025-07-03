
const CACHE_NAME = 'barberia-estilo-v4';
const urlsToCache = [
  '/gestion',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing v4...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache v4');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating v4...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          console.log('Fetched navigation from network:', event.request.url);
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          console.log('Network failed, serving from cache:', event.request.url);
          return caches.match(event.request);
        })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
      })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push received');
  const options = {
    body: event.data ? event.data.text() : 'Nuevo turno programado',
    icon: '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
    badge: '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'Ver turnos'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Barbería Estilo', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/gestion')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/gestion')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Manejo mejorado para instalación de PWA
self.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt triggered');
  // No prevenir el prompt automático
});

self.addEventListener('appinstalled', (e) => {
  console.log('PWA installed successfully');
});
