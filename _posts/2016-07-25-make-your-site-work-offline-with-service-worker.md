---
layout: post
title:  "Make your site work offline with service worker"
date:   2016-07-22
---

If you're a frequent rider of underground mass transit, you know how frustrating
it can be when you open up your browser and try to get some reading done on your phone,
only to be greeted with this screen:

<div class="text-center">
  <img alt="No internet Chrome message"
    src="/images/posts/2016-07-25-make-your-site-work-offline-with-service-worker/no-internet.png" />
</div>

Enter service workers.

## What's a service worker?

According to [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), "A service worker is an event-driven worker registered against an origin and a path." Essentially, service workers allow you to run JavaScript outside of the DOM, even when your site or app is not being viewed in the browser. This allows you to do nifty things like send push notifications, pre-fetch data in the background, or cache static assets.

For this blog post, we are going to focus on caching, which allows your site to be viewed without an internet connection.

## Setting up a service worker

Before our service worker can actually do anything, it must be "registered" with the browser.

At the time of this writing, support for service workers [is somewhat limited](http://caniuse.com/#feat=serviceworkers), so we have to make sure that the browser supports service workers before attempting to register one:

{:.line-numbers}
```javascript
// Check if the browser supports service worker before registering.
if ('serviceWorker' in navigator) {
  // Register our service worker. Pass register() the relative path to the service worker.
  navigator.serviceWorker.register('/worker.js');
}
```

Include this code on every page of your site to make sure that the service worker is registered whenever someone visits your site.

The location of the service worker matters, as service workers can only interact with files that are within the same directory or lower. This means that if you want your service worker to be able to cache static assets located in the `/assets` directory, the service worker must be located at `/worker.js`, or at `/assets/worker.js`. If the worker is located at `/assets/worker.js`, the worker won't be able to access a file located at `/favicon.ico`.

In this example, the worker is located at `/worker.js`, which means it can access every file in the site.

## Caching assets

The Service Worker API is event driven, so it can only perform actions when an event is emitted.

In the case of caching, we want to setup our cache when the service worker is first installed.
We do this by creating an event listener that listens for the `install` event.

{:.line-numbers}
```javascript
// We must keep track of the version of our cache.
// Update this value whenever the list of items that are being cached changes.
var version = 'v1';

// Cache assets on service worker installation.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(version).then(function(cache) {
      // Pass the relative paths to all of the files that should be cached.
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/app.js',
        '/assets/app.css'
      ]);
    })
  );
});
```

## Retrieving assets from the cache

In order for our site to actually work offline, we have to tell the browser to
fetch items from the cache whenever there is a network error (e.g., while offline).

The code to implement this is surprisingly simple:

{:.line-numbers}
```javascript
// Listen for fetch requests.
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Respond with a cached response if there was a network error.
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
```

So now the code for our service worker (`worker.js`) should look like this:

{:.line-numbers}
```javascript
// We must keep track of the version of our cache.
// Update this value whenever the list of items that are being cached changes.
var version = 'v1';

// Cache assets on service worker installation.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(version).then(function(cache) {
      // Pass the relative paths to all of the files that should be cached.
      return cache.addAll([
        '/',
        '/index.html',
        '/assets/app.js',
        '/assets/app.css'
      ]);
    })
  );
});

// Listen for fetch requests.
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Respond with a cached response if there was a network error.
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
```

That's it! If you try to load a previously visited site when there is no internet connection,
the browser will load assets from the cache instead of showing you an error message.

You can view
a working example (by MDN) [here](http://mdn.github.io/sw-test/); the source code for that example is available [on GitHub](https://github.com/mdn/sw-test).

## More about service workers

There's a lot more to service workers than just enabling offline access. If you're interested in learning more about service workers and how they can improve the experience of your users, check out the excellent [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).
