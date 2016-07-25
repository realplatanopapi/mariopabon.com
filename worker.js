var version = 'v4';

// Invoked on initial installation of the service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(version).then(function(cache) {
      // Cache all the things
      return cache.matchAll('/');
    })
  );
});

// Listen for fetch() requests
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Respond with a cached response if there was a network error
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
