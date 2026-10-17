// Era Gadgets Service Worker for Universal Background & Real-Time Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Universal Push Event Handler (wakes up phone/laptop in background when orders drop)
self.addEventListener('push', (event) => {
  let data = {
    title: '🛒 New Order Received · Era Gadgets',
    body: 'A customer has placed an order. Tap to view details.',
    url: '/admin?tab=orders'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (_) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/favicon-32x32.png',
    vibrate: [250, 100, 250, 100, 250],
    tag: data.id || `era-alert-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/admin?tab=orders'
    },
    actions: [
      { action: 'open', title: 'Open Order' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, options),
      // Broadcast to any open windows/tabs on this device
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'UNIVERSAL_PUSH_RECEIVED',
            notification: data
          });
        });
      })
    ])
  );
});

// Notification Click Handler: focuses existing window or opens order URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/admin?tab=orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && client.url && !client.url.includes(urlToOpen)) {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
