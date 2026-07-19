/* =========================================================
   sw.js — Service Worker sederhana agar game bisa dimainkan
   offline setelah pertama kali dibuka.
   ========================================================= */
const CACHE_NAME = 'mykisah-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/utils.js',
  './js/save.js',
  './js/assets.js',
  './js/audio.js',
  './js/physics.js',
  './js/touchControls.js',
  './js/player.js',
  './js/enemy.js',
  './js/boss.js',
  './js/levels.js',
  './js/shop.js',
  './js/achievements.js',
  './js/ui.js',
  './js/game.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        return response;
      }).catch(() => cached);
    })
  );
});
