// Service Worker for Web Push Notifications
/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);

    let data = {
        title: 'New Notification',
        body: 'You have a new notification',
        icon: '/logo.png',
        badge: '/badge.png',
        data: {}
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: data.badge || '/badge.png',
        data: data.data || {},
        vibrate: [200, 100, 200],
        tag: data.tag || 'notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window/tab open
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle background sync (optional)
self.addEventListener('sync', (event) => {
    console.log('Background sync:', event);
    if (event.tag === 'sync-notifications') {
        event.waitUntil(syncNotifications());
    }
});

async function syncNotifications() {
    // Implement notification sync logic if needed
    console.log('Syncing notifications...');
}
