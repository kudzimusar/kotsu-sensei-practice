// sw.js - Kōtsū Sensei PWA Service Worker
const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `kotsu-sensei-${CACHE_VERSION}`;
const OFFLINE_URL = '/kotsu-sensei-practice/offline.html';

// Import Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js');

// === 1. PRECACHE CORE ASSETS (PWABuilder LOVES THIS) ===
workbox.precaching.precacheAndRoute([
  { url: '/kotsu-sensei-practice/', revision: CACHE_VERSION },
  { url: '/kotsu-sensei-practice/index.html', revision: CACHE_VERSION },
  { url: '/kotsu-sensei-practice/manifest.json', revision: CACHE_VERSION },
  { url: '/kotsu-sensei-practice/offline.html', revision: CACHE_VERSION },
  { url: '/kotsu-sensei-practice/questions.json', revision: CACHE_VERSION },
  { url: '/kotsu-sensei-practice/assets/icon-192.png', revision: CACHE_VERSION },
  { url: '/kotsu-sensei-practice/assets/icon-512.png', revision: CACHE_VERSION }
]);

// === 2. EXPLICIT OFFLINE FALLBACK FOR NAVIGATION ===
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// === 3. WORKBOX: Cache Static Resources ===
workbox.routing.registerRoute(
  /\.(?:js|css|png|jpg|svg|woff2)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);

// === 4. BACKGROUND SYNC ===
self.addEventListener('sync', event => {
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  }
});

// === 5. PERIODIC SYNC ===
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

// === 6. PUSH NOTIFICATIONS ===
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Time to practice!',
    icon: '/kotsu-sensei-practice/assets/icon-192.png',
    badge: '/kotsu-sensei-practice/assets/icon-72.png',
    data: { url: '/kotsu-sensei-practice/' }
  };
  event.waitUntil(self.registration.showNotification('Kōtsū Sensei', options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open') {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// === 7. INDEXEDDB HELPERS (Keep your logic) ===
function openDB() { /* ... your code ... */ }
async function syncQuizResults() { /* ... your code ... */ }
async function updateContent() { /* ... your code ... */ }
