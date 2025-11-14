/**
 * Mobile Zoom Prevention Utility
 * 
 * Prevents all forms of zooming (double-tap, pinch-to-zoom, keyboard shortcuts)
 * when the app is accessed on mobile devices to maintain consistent UI state.
 */

const MOBILE_BREAKPOINT = 768;

/**
 * Detect if the current device is mobile
 */
function isMobileDevice(): boolean {
  // Check screen width (consistent with useIsMobile hook)
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    return true;
  }

  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  return mobileRegex.test(userAgent);
}

/**
 * Prevent keyboard zoom shortcuts (Ctrl/Cmd + Plus/Minus/0)
 */
function preventKeyboardZoom(): void {
  document.addEventListener('keydown', (e) => {
    // Only prevent on mobile devices
    if (!isMobileDevice()) {
      return;
    }

    // Prevent Ctrl/Cmd + Plus/Minus/Equals (zoom in)
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === 'Equal')) {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl/Cmd + Minus (zoom out)
    if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_' || e.key === 'Minus')) {
      e.preventDefault();
      return false;
    }

    // Prevent Ctrl/Cmd + 0 (reset zoom)
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      return false;
    }
  }, { passive: false });
}

/**
 * Monitor and reset visual viewport scale if it changes
 */
function preventProgrammaticZoom(): void {
  if (!window.visualViewport) {
    return;
  }

  let lastScale = window.visualViewport.scale;

  window.visualViewport.addEventListener('resize', () => {
    if (!isMobileDevice()) {
      return;
    }

    const currentScale = window.visualViewport.scale;
    
    // If scale changed from 1.0, reset it
    if (currentScale !== 1.0 && lastScale === 1.0) {
      // Force scale back to 1.0 by setting viewport meta tag dynamically
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }
    
    lastScale = currentScale;
  });
}

/**
 * Prevent double-tap zoom by handling touch events
 */
function preventDoubleTapZoom(): void {
  if (!isMobileDevice()) {
    return;
  }

  let lastTouchEnd = 0;
  const doubleTapDelay = 300; // milliseconds

  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    
    // Check if this is a double-tap (two touches within delay period)
    if (now - lastTouchEnd < doubleTapDelay) {
      e.preventDefault();
      return false;
    }
    
    lastTouchEnd = now;
  }, { passive: false });
}

/**
 * Initialize zoom prevention for mobile devices
 */
export function initializeZoomPrevention(): void {
  // Only apply zoom prevention on mobile devices
  if (!isMobileDevice()) {
    console.log('Zoom prevention: Desktop device detected, skipping zoom prevention');
    return;
  }

  console.log('Zoom prevention: Mobile device detected, initializing zoom prevention');

  // Prevent keyboard zoom shortcuts
  preventKeyboardZoom();

  // Monitor and prevent programmatic zoom
  preventProgrammaticZoom();

  // Prevent double-tap zoom
  preventDoubleTapZoom();

  // Additional safety: Ensure viewport meta tag is set correctly
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    const content = viewport.getAttribute('content') || '';
    if (!content.includes('maximum-scale=1.0') || !content.includes('user-scalable=no')) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
      console.log('Zoom prevention: Viewport meta tag updated');
    }
  }
}



