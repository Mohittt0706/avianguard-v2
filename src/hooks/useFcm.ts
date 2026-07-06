import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { getFirebaseMessaging, getFirebaseApp, sendConfigToServiceWorker, VAPID_KEY } from '@/config/firebase';
import { citizenApi } from '@/services/citizenApi';

export type PermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

interface UseFcmReturn {
  permissionStatus: PermissionStatus;
  fcmToken: string | null;
  lastNotification: MessagePayload | null;
  requestPermission: () => Promise<string | null>;
  isSupported: boolean;
}

export function useFcm(): UseFcmReturn {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<MessagePayload | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }
    setIsSupported(true);
    setPermissionStatus(Notification.permission as PermissionStatus);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    getFirebaseApp();
    sendConfigToServiceWorker();
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;
    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground notification received:', payload);
      setLastNotification(payload);

      if (payload.notification) {
        const title = payload.notification.title || 'AvianGuard Alert';
        const body = payload.notification.body || '';
        if (Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/favicon.ico' });
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isSupported]);

  const saveTokenToBackend = useCallback(async (token: string) => {
    try {
      const storedCitizen = localStorage.getItem('avian_citizens');
      if (storedCitizen) {
        const citizens = JSON.parse(storedCitizen);
        const last = citizens[citizens.length - 1];
        if (last?.mobile) {
          await citizenApi.saveFcmToken({ mobile: last.mobile, token });
          console.log('[FCM] Token saved to backend via mobile lookup');
          return;
        }
      }
      console.log('[FCM] Token generated but no citizen mobile found in localStorage');
    } catch (err) {
      console.warn('[FCM] Failed to save token to backend:', err);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!isSupported) return null;

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission as PermissionStatus);

      if (permission !== 'granted') return null;

      const messaging = getFirebaseMessaging();
      if (!messaging) return null;

      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      setFcmToken(token);

      console.log('[FCM] Token generated:', token);

      await saveTokenToBackend(token);

      return token;
    } catch (err) {
      console.error('[FCM] Failed to get token:', err);
      return null;
    }
  }, [isSupported, saveTokenToBackend]);

  useEffect(() => {
    if (!isSupported || permissionStatus !== 'granted') return;

    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    getToken(messaging, { vapidKey: VAPID_KEY }).then((token) => {
      setFcmToken(token);
      console.log('[FCM] Existing token loaded:', token);
      saveTokenToBackend(token);
    }).catch((err) => {
      console.error('[FCM] Failed to load existing token:', err);
    });
  }, [isSupported, permissionStatus, saveTokenToBackend]);

  return { permissionStatus, fcmToken, lastNotification, requestPermission, isSupported };
}
