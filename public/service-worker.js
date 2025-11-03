const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `kotsu-sensei-${CACHE_VERSION}`;
const OFFLINE_URL = '/kotsu-sensei-practice/';

// Assets to cache on install
const STATIC_ASSETS = [
  '/kotsu-sensei-practice/',
  '/kotsu-sensei-practice/index.html',
  '/kotsu-sensei-practice/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[ServiceWorker] Skip waiting on install');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // If navigation request fails, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          
          return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Background Sync - retry failed requests
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-quiz-results') {
    event.waitUntil(syncQuizResults());
  } else if (event.tag === 'sync-schedule') {
    event.waitUntil(syncScheduleData());
  }
});

// Periodic Background Sync - update content regularly
self.addEventListener('periodicsync', (event) => {
  console.log('[ServiceWorker] Periodic sync:', event.tag);
  
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  } else if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/kotsu-sensei-practice/icons/icon-192x192.png',
    badge: '/kotsu-sensei-practice/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/kotsu-sensei-practice/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/kotsu-sensei-practice/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Kōtsū Sensei', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/kotsu-sensei-practice/')
    );
  }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Helper functions for background sync
async function syncQuizResults() {
  try {
    console.log('[ServiceWorker] Syncing quiz results...');
    // Get pending quiz results from IndexedDB
    const db = await openDB();
    const pendingResults = await getPendingResults(db);
    
    // Send to server
    for (const result of pendingResults) {
      await fetch('/kotsu-sensei-practice/api/sync-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      await markResultAsSynced(db, result.id);
    }
    
    console.log('[ServiceWorker] Quiz results synced successfully');
  } catch (error) {
    console.error('[ServiceWorker] Error syncing quiz results:', error);
    throw error;
  }
}

async function syncScheduleData() {
  try {
    console.log('[ServiceWorker] Syncing schedule data...');
    const db = await openDB();
    const pendingSchedule = await getPendingSchedule(db);
    
    for (const schedule of pendingSchedule) {
      await fetch('/kotsu-sensei-practice/api/sync-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      });
      await markScheduleAsSynced(db, schedule.id);
    }
    
    console.log('[ServiceWorker] Schedule synced successfully');
  } catch (error) {
    console.error('[ServiceWorker] Error syncing schedule:', error);
    throw error;
  }
}

async function updateContent() {
  try {
    console.log('[ServiceWorker] Updating content...');
    const response = await fetch('/kotsu-sensei-practice/api/check-updates');
    const data = await response.json();
    
    if (data.hasUpdates) {
      // Cache new content
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(data.updatedUrls);
      
      // Notify all clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'CONTENT_UPDATED',
          message: 'New content available'
        });
      });
    }
    
    console.log('[ServiceWorker] Content update check complete');
  } catch (error) {
    console.error('[ServiceWorker] Error updating content:', error);
  }
}

async function syncProgressData() {
  try {
    console.log('[ServiceWorker] Syncing progress data...');
    // Sync user progress in background
    const response = await fetch('/kotsu-sensei-practice/api/sync-progress', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('[ServiceWorker] Progress synced successfully');
    }
  } catch (error) {
    console.error('[ServiceWorker] Error syncing progress:', error);
  }
}

// IndexedDB helper functions
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KotsuSenseiDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
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

function getPendingResults(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingResults'], 'readonly');
    const store = transaction.objectStore('pendingResults');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getPendingSchedule(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSchedule'], 'readonly');
    const store = transaction.objectStore('pendingSchedule');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markResultAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingResults'], 'readwrite');
    const store = transaction.objectStore('pendingResults');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function markScheduleAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSchedule'], 'readwrite');
    const store = transaction.objectStore('pendingSchedule');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
