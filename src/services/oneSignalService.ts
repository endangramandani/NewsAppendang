declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => Promise<void> | void>;
    OneSignal?: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

export type PushPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

const ONESIGNAL_STORAGE_KEY = 'seismo_onesignal_app_id';

/**
 * Gets saved OneSignal App ID from localStorage or environment
 */
export function getSavedOneSignalAppId(): string {
  try {
    const saved = localStorage.getItem(ONESIGNAL_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // Ignore
  }
  return (import.meta.env.VITE_ONESIGNAL_APP_ID as string) || '';
}

/**
 * Saves OneSignal App ID to localStorage
 */
export function saveOneSignalAppId(appId: string): void {
  try {
    localStorage.setItem(ONESIGNAL_STORAGE_KEY, appId.trim());
  } catch {
    // Ignore
  }
}

/**
 * Check if Web Push is supported by current browser
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Gets current notification permission
 */
export function getPushPermissionStatus(): PushPermissionStatus {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission as PushPermissionStatus;
}

/**
 * Plays an alert audio chime using Web Audio API
 */
export function playAlertBeep(): void {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency sweep: 880Hz (A5) down to 587Hz (D5)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(587, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio permission or playback errors
  }
}

/**
 * Initializes OneSignal SDK
 */
export function initOneSignal(appId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isPushNotificationSupported() || !appId.trim()) {
      resolve(false);
      return;
    }

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal: any) {
        try {
          await OneSignal.init({
            appId: appId.trim(),
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: false, // We use custom portal bell & center
            },
          });
          resolve(true);
        } catch {
          resolve(false);
        }
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Requests push notification subscription
 */
export async function subscribeToPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  // Play alert chime to confirm audio device is ready
  playAlertBeep();

  // If OneSignal SDK is loaded, use OneSignal opt-in
  if (window.OneSignal?.User?.PushSubscription) {
    try {
      await window.OneSignal.User.PushSubscription.optIn();
      return Notification.permission === 'granted';
    } catch {
      // Fallback to native
    }
  }

  // Native notification request fallback
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Disables / Opts out of push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (window.OneSignal?.User?.PushSubscription) {
    try {
      await window.OneSignal.User.PushSubscription.optOut();
    } catch {
      // Ignore
    }
  }
}

/**
 * Sets disaster alert topic tags in OneSignal
 */
export async function updateNotificationTopics(topics: {
  earthquakes: boolean;
  weather: boolean;
  breakingNews: boolean;
}): Promise<void> {
  if (window.OneSignal?.User?.addTags) {
    try {
      await window.OneSignal.User.addTags({
        alert_earthquake: topics.earthquakes ? 'true' : 'false',
        alert_weather: topics.weather ? 'true' : 'false',
        alert_news: topics.breakingNews ? 'true' : 'false',
      });
    } catch {
      // Ignore
    }
  }
}

/**
 * Sends a live preview test push notification with audio chime and vibration
 */
export async function sendLocalTestNotification(
  title: string = 'PERINGATAN DINI GEMPA M 5.2 - SEISMO WEATHER NEWS',
  body: string = 'BMKG: Gempa magnitudo 5.2 dirasakan di Banten & Jakarta. Kedalaman 10 km. Tidak berpotensi tsunami.'
): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;
  }

  // Sound chime
  playAlertBeep();

  // Device vibration pattern if supported
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {
      // Ignore vibration error
    }
  }

  const options: NotificationOptions = {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'seismo-disaster-alert',
    requireInteraction: true,
    data: {
      url: window.location.origin
    }
  };

  // Try service worker notification first (shows rich native background push)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return true;
      }
    } catch {
      // Fallback to direct Notification
    }
  }

  // Fallback direct Notification object
  try {
    const notif = new Notification(title, options);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch {
    return false;
  }
}
