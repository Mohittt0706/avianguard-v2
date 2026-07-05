import { io, Socket } from 'socket.io-client';

const POLL_INTERVAL = 10000;
const SOCKET_EVENT = 'alert:new';
const CUSTOM_EVENT = 'alert:new-toast';

let socket: Socket | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let knownAlertIds = new Set<string>();
let listenerCount = 0;

export interface IncomingAlert {
  id: string;
  severity: string;
  alertType: string;
  sensorName: string;
  wetland: string;
  description: string;
  currentValue: number | null;
  createdAt: string;
  status: string;
}

function getBaseURL(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
}

function getToken(): string | null {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
}

async function fetchActiveAlerts(): Promise<IncomingAlert[]> {
  const token = getToken();
  if (!token) return [];
  try {
    const base = getBaseURL();
    const res = await fetch(`${base}/alerts?status=ACTIVE&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data?.alerts)) {
      return json.data.alerts;
    }
    return [];
  } catch {
    return [];
  }
}

function diffAndDispatch(alerts: IncomingAlert[]): boolean {
  let hasNew = false;
  for (const alert of alerts) {
    if (!knownAlertIds.has(alert.id)) {
      knownAlertIds.add(alert.id);
      window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: alert }));
      hasNew = true;
    }
  }
  return hasNew;
}

async function checkForNewAlerts(): Promise<boolean> {
  const alerts = await fetchActiveAlerts();
  return diffAndDispatch(alerts);
}

function startSocket() {
  const token = getToken();
  if (!token || socket) return false;

  try {
    const base = getBaseURL().replace('/api/v1', '');
    socket = io(base, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      socket?.emit('subscribe:alerts');
    });

    socket.on(SOCKET_EVENT, (alert: IncomingAlert) => {
      if (!knownAlertIds.has(alert.id)) {
        knownAlertIds.add(alert.id);
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: alert }));
        window.dispatchEvent(new CustomEvent('sensor:updated'));
      }
    });

    socket.on('disconnect', () => {
      // socket will auto-reconnect; no action needed
    });

    return true;
  } catch {
    return false;
  }
}

function stopSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

function startPolling() {
  if (pollTimer) return;
  const tick = async () => {
    const hasNew = await checkForNewAlerts();
    if (hasNew) {
      window.dispatchEvent(new CustomEvent('sensor:updated'));
    }
  };
  tick();
  pollTimer = setInterval(tick, POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function subscribe(callback: (alert: IncomingAlert) => void): () => void {
  const handler = (e: Event) => {
    callback((e as CustomEvent).detail as IncomingAlert);
  };

  window.addEventListener(CUSTOM_EVENT, handler);
  listenerCount++;

  if (listenerCount === 1) {
    knownAlertIds = new Set();
    const started = startSocket();
    if (!started) {
      startPolling();
    }
    // Listen for sensor:updated as additional trigger
    window.addEventListener('sensor:updated', onSensorUpdated);
  }

  return () => {
    window.removeEventListener(CUSTOM_EVENT, handler);
    listenerCount = Math.max(0, listenerCount - 1);
    if (listenerCount === 0) {
      stopSocket();
      stopPolling();
      window.removeEventListener('sensor:updated', onSensorUpdated);
    }
  };
}

async function onSensorUpdated() {
  if (!socket?.connected) {
    const hasNew = await checkForNewAlerts();
    if (hasNew) {
      window.dispatchEvent(new CustomEvent('sensor:updated'));
    }
  }
}
