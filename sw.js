// ATUALIZANDO VERSÃO PARA FORÇAR O CELULAR A BAIXAR TUDO DE NOVO
const CACHE_NAME = 'retigrafico-final-v10';

// Lista EXATA de arquivos. Se um falhar, tudo falha.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.html',
  './manifest.webmanifest',
  './app-logo.png', // <--- AQUI ESTAVA O ERRO (nome antigo)
  // Bibliotecas Externas
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
  'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
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
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Estratégia: Cache First, falling back to Network
  // (Tenta pegar do cache, se não tiver, tenta a internet)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
