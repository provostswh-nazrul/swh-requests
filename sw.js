// Service worker: keeps the app screens on the phone so they open instantly and
// still open without internet. Requests to the Apps Script API are never cached.
// When you change any file, raise the version number below so phones pick it up.
var CACHE = 'swh-app-v10';
var FILES = [
  './', './index.html', './supervisor.html',
  './config.js', './api.js', './install.js',
  './manifest.webmanifest', './manifest-supervisor.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './icons/supervisor-192.png', './icons/supervisor-512.png', './icons/apple-touch-icon-supervisor.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Network first (so updates show up), falling back to the saved copy when offline.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('./index.html'); });
    })
  );
});
