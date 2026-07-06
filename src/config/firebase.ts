import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function logFirebaseConfig(): void {
  console.group('[Firebase] Configuration');
  console.log('  Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID || '(missing)');
  console.log('  Sender ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '(missing)');
  console.log('  API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '***set***' : '(missing)');
  console.log('  Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '(missing)');
  console.log('  App ID:', import.meta.env.VITE_FIREBASE_APP_ID ? '***set***' : '(missing)');
  console.log('  VAPID Key:', import.meta.env.VITE_FIREBASE_VAPID_KEY ? '***set***' : '(missing)');
  console.groupEnd();
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.error('[Firebase] VITE_FIREBASE_API_KEY not set in .env — push notifications disabled');
    logFirebaseConfig();
    return null;
  }
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      console.log('[Firebase] initializeApp() succeeded — Project:', firebaseConfig.projectId);
    } catch (err) {
      console.error('[Firebase] initializeApp() failed:', err);
      return null;
    }
  }
  return app;
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') {
    console.warn('[Firebase] getMessaging skipped — SSR');
    return null;
  }
  if (!('serviceWorker' in navigator)) {
    console.warn('[Firebase] getMessaging skipped — service workers not supported');
    return null;
  }
  try {
    const fbApp = getFirebaseApp();
    if (!fbApp) return null;
    if (!messaging) {
      messaging = getMessaging(fbApp);
      console.log('[Firebase] getMessaging() succeeded');
    }
    return messaging;
  } catch (err) {
    console.error('[Firebase] getMessaging() failed:', err);
    return null;
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[Firebase] Service workers not supported');
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('[Firebase] Service worker registered — scope:', registration.scope);
    return registration;
  } catch (err) {
    console.error('[Firebase] Service worker registration failed:', err);
    return null;
  }
}

export async function sendConfigToServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (!firebaseConfig.apiKey) {
    console.warn('[Firebase] Cannot send config to SW — no API key');
    return;
  }

  try {
    await navigator.serviceWorker.ready;
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      if (registration.active) {
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: firebaseConfig,
        });
        console.log('[Firebase] Config sent to active service worker');
        return;
      }
    }
    console.warn('[Firebase] No active service worker found to send config to');
  } catch (err) {
    console.warn('[Firebase] Failed to send config to SW:', err);
  }
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
