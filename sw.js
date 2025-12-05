// ATUALIZANDO VERSÃO PARA V11 (Força atualização)
const CACHE_NAME = 'retigrafico-final-v11';

// Arquivos exatos para salvar
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.html',
  './manifest.webmanifest',
  './app-logo.png',
  // Bibliotecas
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
  'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Instalando e baixando arquivos...');
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
            console.log('[Service Worker] Limpando cache antigo:', key);
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

  // LÓGICA CRÍTICA:
  // Se a url for "app.html?id=..." ou "index.html?...", servimos o arquivo limpo do cache.
  // O navegador ainda vai receber os parâmetros na barra de endereço pro JS ler.
  
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

  // Para o resto (imagens, bibliotecas, etc), comportamento padrão
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna do cache se tiver
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não, tenta internet
      return fetch(event.request).catch(() => {
        // Se falhar a internet e não tiver no cache, não faz nada (ou retorna erro)
        // Isso evita o crash total
        console.log('Falha offline para:', event.request.url);
      });
    })
  );
});
