// sw.js - Kōtsū Sensei PWA Service Worker
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `kotsu-sensei-${CACHE_VERSION}`;
const OFFLINE_URL = '/kotsu-sensei-practice/offline.html';

// Import Workbox for advanced caching
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

// === 1. STATIC ASSETS TO CACHE ON INSTALL ===
const STATIC_ASSETS = [
  '/kotsu-sensei-practice/',
  '/kotsu-sensei-practice/index.html',
  '/kotsu-sensei-practice/manifest.json',
  '/kotsu-sensei-practice/questions.json',
  '/kotsu-sensei-practice/offline.html',
  '/kotsu-sensei-practice/assets/icon-192.png',
  '/kotsu-sensei-practice/assets/icon-512.png'
];

// === 2. INSTALL: Cache Static Assets ===
self.addEventListener('install', event => {
  console.log('[SW] Installing version', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// === 3. ACTIVATE: Clean Old Caches ===
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// === 4. FETCH: Network First + Fallback ===
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request))
    );
  }
});

// === 5. WORKBOX: Cache CSS/JS/Images ===
workbox.routing.registerRoute(
  /\.(?:js|css|png|jpg|svg|woff2)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);

// === 6. BACKGROUND SYNC ===
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  } else if (event.tag === 'sync-schedule') {
    event.waitUntil(syncScheduleData());
  }
});

// === 7. PERIODIC SYNC ===
self.addEventListener('periodicsync', event => {
  console.log('[SW] Periodic sync:', event.tag);
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  } else if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

// === 8. PUSH NOTIFICATIONS ===
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/kotsu-sensei-practice/assets/icon-192.png',
    badge: '/kotsu-sensei-practice/assets/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: '/kotsu-sensei-practice/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Close' }
    ]
  };
  event.waitUntil(self.registration.showNotification('Kōtsū Sensei', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open') {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// === 9. MESSAGE HANDLER ===
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(event.data.urls)));
  }
});

// === 10. INDEXEDDB HELPERS (from your original) ===
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KotsuSenseiDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingResults')) {
        db.createObjectStore('pendingResults', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pendingSchedule')) {
        db.createObjectStore('pendingSchedule', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Reuse your original sync functions
async function syncQuizResults() { /* ... your code ... */ }
async function syncScheduleData() { /* ... your code ... */ }
async function updateContent() { /* ... your code ... */ }
async function syncProgressData() { /* ... your code ... */ }

// Keep your helper functions (getPendingResults, markResultAsSynced, etc.)
// Paste them here from your original
