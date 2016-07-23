var version = 'v3';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(version).then(function(cache) {
      return cache.matchAll('/');
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
