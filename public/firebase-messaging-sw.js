importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

let messaging = null;
let configReceived = false;

function initializeFirebase(config) {
  if (firebase.apps.length > 0) return;
  if (!config || !config.apiKey) {
    console.warn('[FCM SW] No valid Firebase config received');
    return;
  }
  firebase.initializeApp(config);
  messaging = firebase.messaging();
  configReceived = true;
  console.log('[FCM SW] Firebase initialized successfully');
  setupBackgroundHandler();
}

function setupBackgroundHandler() {
  if (!messaging) return;
  messaging.onBackgroundMessage(function(payload) {
    var title = (payload.notification && payload.notification.title) || 'AvianGuard Alert';
    var body = (payload.notification && payload.notification.body) || '';
    var data = payload.data || {};
    var alertId = data.alertId || null;
    var clickUrl = data.clickUrl || '/notifications';

    if (alertId) {
      clickUrl = '/dashboard/alerts/' + alertId;
    }

    var options = {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.alertType || 'general',
      requireInteraction: data.severity === 'CRITICAL' || data.severity === 'HIGH',
      data: { clickUrl: clickUrl, alertId: alertId },
      actions: [
        { action: 'open', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    self.registration.showNotification(title, options);
  });
}

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    initializeFirebase(event.data.config);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  var clickUrl = '/notifications';
  if (event.notification.data && event.notification.data.clickUrl) {
    clickUrl = event.notification.data.clickUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
          client.navigate(clickUrl);
          return client.focus();
        }
      }
      return clients.openWindow(clickUrl);
    })
  );
});
