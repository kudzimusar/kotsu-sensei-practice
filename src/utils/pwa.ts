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
    getServiceWorkerRegistration().then(registration => {
      if (registration) {
        console.log('Service worker is registered and ready');
      } else {
        console.log('Service worker is not registered');
      }
    });
  } else {
    console.log('Service worker is not supported');
  }
}

