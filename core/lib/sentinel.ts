/**
 * Syndicate Sentinel Tracker
 * ⚓📡🐾
 * 
 * Shared telemetry module to notify the Architect of system activity.
 */

export function initSentinel(siteName: string) {
  // Only execute on client-side
  if (typeof window === 'undefined') return;

  // Wait for page to load potentially
  const track = () => {
    const data = {
      site: siteName,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    fetch('https://office.saitik.su/api/sentinel/visit', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(err => {
      // Fail silently to not disrupt the UI
      console.warn('[SENTINEL] Telemetry sync failed', err);
    });
  };

  // Run immediately or on load
  if (document.readyState === 'complete') {
    track();
  } else {
    window.addEventListener('load', track, { once: true });
  }
}
