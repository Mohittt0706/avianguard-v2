import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import {
  logFirebaseConfig,
  getFirebaseApp,
  getFirebaseMessaging,
  registerServiceWorker,
  sendConfigToServiceWorker,
  VAPID_KEY,
} from '@/config/firebase';
import { citizenApi } from '@/services/citizenApi';

interface FcmContextValue {
  permissionStatus: NotificationPermission | 'unsupported';
  fcmToken: string | null;
  lastNotification: MessagePayload | null;
  requestPermission: () => Promise<string | null>;
  isSupported: boolean;
}

const FcmContext = createContext<FcmContextValue>({
  permissionStatus: 'default',
  fcmToken: null,
  lastNotification: null,
  requestPermission: async () => null,
  isSupported: false,
});

export function useFcm(): FcmContextValue {
  return useContext(FcmContext);
}

async function saveTokenToBackend(token: string): Promise<void> {
  try {
    const storedCitizen = localStorage.getItem('avian_citizens');
    if (storedCitizen) {
      const citizens = JSON.parse(storedCitizen);
      const last = citizens[citizens.length - 1];
      if (last?.mobile) {
        try {
          await citizenApi.saveFcmToken({ mobile: last.mobile, token });
          console.log('[FCM] Token saved to backend via mobile:', last.mobile);
          return;
        } catch {
          console.log('[FCM] citizens/fcm-token failed, trying /notifications/register-token...');
        }
        try {
          const { notificationApi } = await import('@/services/notificationApi');
          await notificationApi.registerToken({ token, mobile: last.mobile });
          console.log('[FCM] Token saved via /notifications/register-token');
          return;
        } catch {
          console.log('[FCM] Both endpoints failed — token not saved');
        }
      }
    }
    console.log('[FCM] No citizen mobile in localStorage — token not saved to backend');
  } catch (err) {
    console.warn('[FCM] Failed to save token to backend:', err);
  }
}

export function FcmProvider({ children }: { children: ReactNode }) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<MessagePayload | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    console.log('[FCM] FcmProvider mounting...');
    logFirebaseConfig();

    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('[FCM] Not supported — SW:', 'serviceWorker' in navigator, 'Notification:', 'Notification' in window);
      setPermissionStatus('unsupported');
      return;
    }

    setIsSupported(true);
    setPermissionStatus(Notification.permission);
    console.log('[FCM] Supported — current permission:', Notification.permission);

    const app = getFirebaseApp();
    if (!app) {
      console.error('[FCM] Firebase app init failed — cannot proceed');
      return;
    }

    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('[FCM] SW scope:', registration.scope);
        return sendConfigToServiceWorker();
      }
    }).then(() => {
      if (Notification.permission === 'granted') {
        return getTokenAndSave();
      }
    });

    const messaging = getFirebaseMessaging();
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message:', payload);
        setLastNotification(payload);

        if (payload.notification && Notification.permission === 'granted') {
          new Notification(payload.notification.title || 'AvianGuard Alert', {
            body: payload.notification.body || '',
            icon: '/favicon.ico',
          });
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, []);

  const getTokenAndSave = useCallback(async (): Promise<string | null> => {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.error('[FCM] Cannot get token — messaging not initialized');
      return null;
    }
    if (!VAPID_KEY) {
      console.error('[FCM] Cannot get token — VAPID key is empty');
      return null;
    }

    try {
      console.log('[FCM] Calling getToken() with VAPID key...');
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      setFcmToken(token);
      console.log('[FCM] ✅ FCM Token:', token);
      await saveTokenToBackend(token);
      return token;
    } catch (err) {
      console.error('[FCM] getToken() failed:', err);
      return null;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      console.warn('[FCM] requestPermission skipped — not supported');
      return null;
    }

    console.log('[FCM] Requesting notification permission...');
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    console.log('[FCM] Permission result:', permission);

    if (permission !== 'granted') {
      console.warn('[FCM] Permission not granted:', permission);
      return null;
    }

    const token = await getTokenAndSave();
    return token;
  }, [isSupported, getTokenAndSave]);

  return (
    <FcmContext.Provider value={{ permissionStatus, fcmToken, lastNotification, requestPermission, isSupported }}>
      {children}
    </FcmContext.Provider>
  );
}
