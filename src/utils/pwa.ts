/**
 * PWA Utility Functions
 * Handles install prompt, offline detection, and service worker registration
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Check if app is installed (running as PWA)
 */
export function isAppInstalled(): boolean {
  // Check if running in standalone mode (PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check if running in standalone mode on iOS
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }
  
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Error getting service worker registration:', error);
    return null;
  }
}

/**
 * Unregister all service workers (for development/testing)
 */
export async function unregisterServiceWorkers(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
    return true;
  } catch (error) {
    console.error('Error unregistering service workers:', error);
    return false;
  }
}

/**
 * Handle install prompt
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Listen for beforeinstallprompt event
 */
export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('Install prompt available');
  });
}

/**
 * Show install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }
  
  try {
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      deferredPrompt = null;
      return true;
    } else {
      console.log('User dismissed the install prompt');
      deferredPrompt = null;
      return false;
    }
  } catch (error) {
    console.error('Error showing install prompt:', error);
    deferredPrompt = null;
    return false;
  }
}

/**
 * Check if install prompt is available
 */
export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null;
}

/**
 * Setup offline/online detection
 */
export function setupOfflineDetection(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  const handleOnline = () => {
    console.log('App is online');
    onOnline?.();
  };
  
  const handleOffline = () => {
    console.log('App is offline');
    onOffline?.();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Register periodic background sync
 */
export async function registerPeriodicSync(
  tag: string,
  minInterval?: number
): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service worker not supported');
    return false;
  }
  
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return false;
    }
    
    // Check if periodic sync is supported
    if (!('periodicSync' in registration)) {
      console.log('Periodic sync not supported');
      return false;
    }
    
    // Request periodic sync permission
    try {
      const status = await (navigator as any).permissions.query({
        name: 'periodic-background-sync' as PermissionName,
      });
      
      if (status.state !== 'granted') {
        console.log('Periodic sync permission not granted');
        return false;
      }
    } catch (error) {
      // Permission API might not be available
      console.log('Periodic sync permission API not available');
      return false;
    }
    
    // Register periodic sync
    await (registration as any).periodicSync.register(tag, {
      minInterval: minInterval || 24 * 60 * 60 * 1000, // 24 hours default
    });
    
    console.log(`Periodic sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error('Error registering periodic sync:', error);
    return false;
  }
}

/**
 * Register background sync
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service worker not supported');
    return false;
  }
  
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return false;
    }
    
    // Check if background sync is supported
    if (!('sync' in registration)) {
      console.log('Background sync not supported');
      return false;
    }
    
    await (registration as any).sync.register(tag);
    console.log(`Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error('Error registering background sync:', error);
    return false;
  }
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return null;
    }
    
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }
    
    // Check if push manager is available
    if (!registration.pushManager) {
      console.log('Push manager not available');
      return null;
    }
    
    // Get existing subscription or create new one
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      // Note: In production, you would need a VAPID public key
      // For now, we'll just return null if no subscription exists
      console.log('Push subscription not available (VAPID key required)');
      return null;
    }
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Sync quiz results (client-side trigger for background sync)
 */
export async function syncQuizResults(): Promise<boolean> {
  return await registerBackgroundSync('sync-quiz-results');
}

/**
 * Sync schedule data (client-side trigger for background sync)
 */
export async function syncScheduleData(): Promise<boolean> {
  return await registerBackgroundSync('sync-schedule');
}

/**
 * Initialize PWA features
 */
export function initializePWA(): void {
  // Setup install prompt
  setupInstallPrompt();
  
  // Setup offline detection
  setupOfflineDetection(
    () => {
      // App came back online
      console.log('App is back online');
    },
    () => {
      // App went offline
      console.log('App is offline');
    }
  );
  
  // Log PWA status
  if (isAppInstalled()) {
    console.log('App is installed as PWA');
  } else {
    console.log('App is running in browser');
  }
  
  // Log service worker status
  if (isServiceWorkerSupported()) {
    getServiceWorkerRegistration().then(async (registration) => {
      if (registration) {
        console.log('Service worker is registered and ready');
        
        // Register periodic sync for content updates
        // Note: This requires user permission and may not work in all browsers
        registerPeriodicSync('update-content', 24 * 60 * 60 * 1000).catch((error) => {
          console.log('Periodic sync registration failed:', error);
        });
        
        // Register periodic sync for progress sync
        registerPeriodicSync('sync-progress', 6 * 60 * 60 * 1000).catch((error) => {
          console.log('Periodic sync registration failed:', error);
        });
      } else {
        console.log('Service worker is not registered');
      }
    });
  } else {
    console.log('Service worker is not supported');
  }
}

