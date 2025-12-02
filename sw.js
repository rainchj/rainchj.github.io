self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('rainchj-store').then((cache) => cache.addAll([
            '/index.html',
            '/scripts.js',
            '/styles.css',
            '/shortcut.html',
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});
