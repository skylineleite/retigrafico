const CACHE_NAME = 'retigrafico-final-v12'; // V12 para forçar atualização

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.html',
  './manifest.webmanifest',
  './app-logo.png',
  // Bibliotecas Externas
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
  'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Instalando V12...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignora parâmetros (?id=...) para servir o arquivo HTML limpo
  if (url.origin === location.origin) {
    if (url.pathname.endsWith('app.html')) {
      event.respondWith(caches.match('./app.html'));
      return;
    }
    if (url.pathname.endsWith('index.html') || url.pathname.endsWith('/')) {
      event.respondWith(caches.match('./index.html'));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
