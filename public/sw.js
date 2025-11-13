// Kōtsū Sensei – Full-featured Service Worker
// Has Service Worker | Has Logic | Periodic Sync | Background Sync | Push Notifications | Offline Support

/* -------------------------------------------------------------------------- */
/* 1. IMPORT WORKBOX FROM CDN */
/* -------------------------------------------------------------------------- */
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js'
);

/* -------------------------------------------------------------------------- */
/* 2. PRECACHE ASSETS (Will be injected by VitePWA) */
/* -------------------------------------------------------------------------- */
// This will be replaced by VitePWA with the actual manifest
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Clean up outdated caches
workbox.precaching.cleanupOutdatedCaches();

// Skip waiting and claim clients immediately
self.skipWaiting();
workbox.core.clientsClaim();

/* -------------------------------------------------------------------------- */
/* 3. OFFLINE FALLBACK CONFIGURATION */
/* -------------------------------------------------------------------------- */
const OFFLINE_FALLBACK_PAGE = 'offline.html';

// Cache offline page during install
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(workbox.core.cacheNames.precache).then((cache) => {
      return cache.add(OFFLINE_FALLBACK_PAGE);
    })
  );
});

// Register navigation route with offline fallback
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Handle navigation requests with offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Try preload response first
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }
        
        // Try network request
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        // Network failed - serve offline page
        const cache = await caches.open(workbox.core.cacheNames.precache);
        const cachedResp = await cache.match(OFFLINE_FALLBACK_PAGE);
        if (cachedResp) {
          return cachedResp;
        }
        // If offline page not found, try all caches
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const response = await cache.match(OFFLINE_FALLBACK_PAGE);
          if (response) {
            return response;
          }
        }
        // Fallback response
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
    })());
  }
});

// Also use Workbox routing for non-navigation requests
workbox.routing.registerRoute(
  ({ request }) => request.mode !== 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'dynamic-cache',
  })
);

/* -------------------------------------------------------------------------- */
/* 4. RUNTIME CACHING */
/* -------------------------------------------------------------------------- */

// Cache Supabase storage (driving scenarios)
workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://ndulrvfwcqyvutcviebk.supabase.co' && 
               url.pathname.startsWith('/storage/v1/object/public/driving-scenarios/'),
  new workbox.strategies.CacheFirst({
    cacheName: 'driving-scenarios-cache',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache Google Fonts
workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache static assets (images, fonts, etc.) - stale while revalidate
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image' ||
                   request.destination === 'font' ||
                   request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

/* -------------------------------------------------------------------------- */
/* 5. BACKGROUND SYNC */
/* -------------------------------------------------------------------------- */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync', event.tag);
  
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  } else if (event.tag === 'sync-schedule') {
    event.waitUntil(syncScheduleData());
  }
});

async function syncQuizResults() {
  try {
    const db = await openDB();
    const pending = await getPendingResults(db);
    
    for (const result of pending) {
      try {
        await fetch('/kotsu-sensei-practice/api/sync-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        });
        await markResultAsSynced(db, result.id);
      } catch (error) {
        console.error('[SW] Failed to sync quiz result:', error);
        throw error; // Re-throw to retry
      }
    }
  } catch (error) {
    console.error('[SW] syncQuizResults failed', error);
    throw error;
  }
}

async function syncScheduleData() {
  try {
    const db = await openDB();
    const pending = await getPendingSchedule(db);
    
    for (const item of pending) {
      try {
        await fetch('/kotsu-sensei-practice/api/sync-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        await markScheduleAsSynced(db, item.id);
      } catch (error) {
        console.error('[SW] Failed to sync schedule item:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('[SW] syncScheduleData failed', error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* 6. PERIODIC SYNC */
/* -------------------------------------------------------------------------- */
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync', event.tag);
  
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  } else if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

async function updateContent() {
  try {
    const resp = await fetch('/kotsu-sensei-practice/api/check-updates');
    if (!resp.ok) return;
    
    const data = await resp.json();
    if (data.hasUpdates) {
      const cache = await caches.open(workbox.core.cacheNames.precache);
      await cache.addAll(data.updatedUrls);
      
      // Notify clients
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: 'CONTENT_UPDATED', message: 'New content ready' });
      });
    }
  } catch (error) {
    console.error('[SW] updateContent failed', error);
  }
}

async function syncProgressData() {
  try {
    await fetch('/kotsu-sensei-practice/api/sync-progress', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('[SW] syncProgressData failed', error);
  }
}

/* -------------------------------------------------------------------------- */
/* 7. PUSH NOTIFICATIONS */
/* -------------------------------------------------------------------------- */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
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
    ],
    requireInteraction: false,
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/kotsu-sensei-practice/';
  
  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow(url)
    );
  } else if (!event.action) {
    // Default action - open or focus the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        // If app is already open, focus it
        for (const client of clients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return self.clients.openWindow(url);
      })
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 8. MESSAGE HANDLER */
/* -------------------------------------------------------------------------- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open('custom-cache').then((cache) => 
        cache.addAll(event.data.urls)
      )
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 9. INDEXEDDB HELPERS */
/* -------------------------------------------------------------------------- */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('KotsuSenseiDB', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pendingResults')) {
        db.createObjectStore('pendingResults', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pendingSchedule')) {
        db.createObjectStore('pendingSchedule', { keyPath: 'id', autoIncrement: true });
      }
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
