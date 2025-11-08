// public/sw.js
// Kōtsū Sensei – Full-featured Service Worker
// Has Service Worker | Has Logic | Periodic Sync | Background Sync | Push Notifications | Offline Support

/* -------------------------------------------------------------------------- */
/* 1. BASIC SETTINGS */
/* -------------------------------------------------------------------------- */
const CACHE_VERSION = 'v2.0.0'; // BUMPED TO CLEAR CACHES
const CACHE_NAME = `kotsu-sensei-${CACHE_VERSION}`;
const OFFLINE_URL = '/kotsu-sensei-practice/offline.html';

// --------------------------------------------------------------------------
// 2. WORKBOX – MUST BE FIRST
// --------------------------------------------------------------------------
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js'
);

// CRITICAL: Let Workbox handle precaching FIRST
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// --------------------------------------------------------------------------
// 3. OFFLINE FALLBACK (Has Offline Support)
// --------------------------------------------------------------------------
const OFFLINE_FALLBACK_PAGE = '/kotsu-sensei-practice/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_FALLBACK_PAGE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* -------------------------------------------------------------------------- */
/* 4. FETCH HANDLER – ONLY IF NOT HANDLED BY WORKBOX */
/* -------------------------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET / cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // LET WORKBOX HANDLE PRECACHED ASSETS FIRST
  if (workbox.precaching.getCacheKeyForURL(request.url)) return;

  // Navigation → network-first + offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          if (!resp || resp.status >= 400) throw new Error('bad response');
          return resp;
        })
        .catch(() => caches.match(OFFLINE_FALLBACK_PAGE))
    );
    return;
  }

  // Assets (js, css, images, fonts…) → stale-while-revalidate
  if (/\.(js|css|png|jpe?g|svg|webp|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((networkResp) => {
            if (networkResp && networkResp.status === 200) {
              cache.put(request, networkResp.clone());
            }
            return networkResp;
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // Everything else → network-first
  event.respondWith(fetch(request));
});

/* -------------------------------------------------------------------------- */
/* 5. BACKGROUND SYNC (Has Background Sync) */
/* -------------------------------------------------------------------------- */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync', event.tag);
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  } else if (event.tag === 'sync-schedule') {
    event.waitUntil(syncScheduleData());
  }
});

/* -------------------------------------------------------------------------- */
/* 6. PERIODIC SYNC (Has Periodic Sync) */
/* -------------------------------------------------------------------------- */
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync', event.tag);
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  } else if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

/* -------------------------------------------------------------------------- */
/* 7. PUSH NOTIFICATIONS (Has Push Notifications) */
/* -------------------------------------------------------------------------- */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Kōtsū Sensei';
  const options = {
    body: data.body || 'New update available!',
    icon: '/kotsu-sensei-practice/assets/icon-192.png',
    badge: '/kotsu-sensei-practice/assets/icon-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'kotsu-update',
    data: data.url ? { url: data.url } : { url: '/kotsu-sensei-practice/' },
    actions: [
      { action: 'open', title: 'Open App', icon: '/kotsu-sensei-practice/assets/icon-96.png' },
      { action: 'close', title: 'Close', icon: '/kotsu-sensei-practice/assets/icon-96.png' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/kotsu-sensei-practice/';
  if (event.action === 'open') {
    event.waitUntil(clients.openWindow(url));
  }
});

/* -------------------------------------------------------------------------- */
/* 8. MESSAGE HANDLER (skipWaiting, manual caching, etc.) */
/* -------------------------------------------------------------------------- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(event.data.urls))
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 9. YOUR ORIGINAL SYNC HELPERS (unchanged) */
/* -------------------------------------------------------------------------- */
async function syncQuizResults() {
  try {
    const db = await openDB();
    const pending = await getPendingResults(db);
    for (const result of pending) {
      await fetch('/kotsu-sensei-practice/api/sync-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      await markResultAsSynced(db, result.id);
    }
  } catch (e) {
    console.error('[SW] syncQuizResults failed', e);
    throw e;
  }
}

async function syncScheduleData() {
  try {
    const db = await openDB();
    const pending = await getPendingSchedule(db);
    for (const item of pending) {
      await fetch('/kotsu-sensei-practice/api/sync-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      await markScheduleAsSynced(db, item.id);
    }
  } catch (e) {
    console.error('[SW] syncScheduleData failed', e);
    throw e;
  }
}

async function updateContent() {
  try {
    const resp = await fetch('/kotsu-sensei-practice/api/check-updates');
    const data = await resp.json();
    if (data.hasUpdates) {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(data.updatedUrls);
      const clients = await self.clients.matchAll();
      clients.forEach((c) =>
        c.postMessage({ type: 'CONTENT_UPDATED', message: 'New content ready' })
      );
    }
  } catch (e) {
    console.error('[SW] updateContent failed', e);
  }
}

async function syncProgressData() {
  try {
    await fetch('/kotsu-sensei-practice/api/sync-progress', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    console.error('[SW] syncProgressData failed', e);
  }
}

/* -------------------------------------------------------------------------- */
/* 10. IndexedDB HELPERS (unchanged) */
/* -------------------------------------------------------------------------- */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('KotsuSenseiDB', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pendingResults'))
        db.createObjectStore('pendingResults', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('pendingSchedule'))
        db.createObjectStore('pendingSchedule', { keyPath: 'id', autoIncrement: true });
    };
  });
}

function getPendingResults(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingResults', 'readonly');
    const store = tx.objectStore('pendingResults');
    const req = store.getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

function getPendingSchedule(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSchedule', 'readonly');
    const store = tx.objectStore('pendingSchedule');
    const req = store.getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

function markResultAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingResults', 'readwrite');
    const store = tx.objectStore('pendingResults');
    const req = store.delete(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

function markScheduleAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSchedule', 'readwrite');
    const store = tx.objectStore('pendingSchedule');
    const req = store.delete(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

/* -------------------------------------------------------------------------- */
/* END OF FILE */
/* -------------------------------------------------------------------------- */
