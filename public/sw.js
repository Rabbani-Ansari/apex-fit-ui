// GymMatrix Service Worker v1.0
// Provides offline caching for Android WebView support

const CACHE_NAME = 'gymmatrix-v1';
const STATIC_CACHE = 'gymmatrix-static-v1';
const DYNAMIC_CACHE = 'gymmatrix-dynamic-v1';

// Routes to cache for offline access
const APP_SHELL = [
    '/',
    '/workout',
    '/diet',
    '/progress',
    '/profile',
    '/offline.html',
    '/manifest.json',
    '/gymmatrix-logo.png',
    '/favicon.ico'
];

// Static asset patterns to cache
const STATIC_ASSETS = [
    /\.js$/,
    /\.css$/,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.svg$/,
    /\.ico$/,
    /\.woff2?$/,
    /\.ttf$/
];

// API/external URLs to use network-first strategy
const NETWORK_FIRST_PATTERNS = [
    /supabase/,
    /api\//,
    /\.json$/
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching app shell...');
                return cache.addAll(APP_SHELL);
            })
            .then(() => {
                console.log('[SW] App shell cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache app shell:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name !== CACHE_NAME &&
                                name !== STATIC_CACHE &&
                                name !== DYNAMIC_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Network-first for API calls and external resources
    if (isNetworkFirst(url)) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Cache-first for static assets
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Network-first with cache fallback for navigation (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(navigationHandler(request));
        return;
    }

    // Default: stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request));
});

// Check if URL should use network-first strategy
function isNetworkFirst(url) {
    return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href));
}

// Check if URL is a static asset
function isStaticAsset(url) {
    return STATIC_ASSETS.some(pattern => pattern.test(url.pathname));
}

// Cache-first strategy
async function cacheFirst(request, cacheName = CACHE_NAME) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache-first fetch failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network-first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        console.error('[SW] Network-first failed, no cache:', error);
        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);

    return cachedResponse || fetchPromise;
}

// Navigation handler - serve app shell for SPA routes
async function navigationHandler(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }

        throw new Error('Network response not ok');
    } catch (error) {
        // Try to serve from cache
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // For SPA, try serving the root index
        const indexResponse = await caches.match('/');

        if (indexResponse) {
            return indexResponse;
        }

        // Last resort: offline page
        const offlineResponse = await caches.match('/offline.html');

        if (offlineResponse) {
            return offlineResponse;
        }

        return new Response('Offline', { status: 503 });
    }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }
});
