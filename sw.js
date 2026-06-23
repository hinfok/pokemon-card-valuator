const CACHE = 'pokeval-v1';
const API = 'https://api.pokemontcg.io/v2/cards';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  
  // Cache API responses
  if (url.startsWith(API)) {
    e.respondWith(
      caches.open(CACHE).then(function(cache) {
        return fetch(e.request).then(function(res) {
          var clone = res.clone();
          cache.put(e.request, clone);
          return res;
        }).catch(function() {
          return caches.match(e.request);
        });
      })
    );
    return;
  }
  
  // Cache static assets (images)
  if (url.match(/images\.pokemontcg\.io/)) {
    e.respondWith(
      caches.open(CACHE).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          if (cached) return cached;
          return fetch(e.request).then(function(res) {
            cache.put(e.request, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }
  
  // Network-first for everything else
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});