
/* global self, caches, clients, fetch, console */

// Service Worker for PWA - Offline Support & Caching
const CACHE_NAME = 'lumina-v1';
const RUNTIME_CACHE = 'lumina-runtime-v1';

// Assets to cache on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
        }).then((cachesToDelete) => {
            return Promise.all(cachesToDelete.map((cacheToDelete) => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // API requests - network first, never cache CSRF or Analytics
    if (event.request.url.includes('/api/')) {
        // Exclude security and high-frequency tracking endpoints from caching
        if (event.request.url.includes('/api/csrf-token') || event.request.url.includes('/api/analytics')) {
            event.respondWith(fetch(event.request));
            return;
        }

        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Only cache valid GET responses
                    if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
                        return response;
                    }

                    // Clone the response before caching
                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails (only for GET)
                    if (event.request.method === 'GET') {
                        return caches.match(event.request);
                    }
                    throw new Error('Network failure for non-GET request');
                })
        );
        return;
    }

    // Static assets - cache first
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses or non-GET requests
                if (!response || response.status !== 200 || response.type === 'error' || event.request.method !== 'GET') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    }
});

async function syncOrders() {
    // Implement order sync logic here
    console.log('Syncing offline orders...');
}

// Push notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Lumina';
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-192.png',
        data: data.url || '/',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});
