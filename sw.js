// Nome do Cache (Mude o número 'v1' para forçar atualização no celular dos usuários quando fizer alterações)
const CACHE_NAME = 'retigrafico-offline-v5';

// Lista de arquivos para salvar no celular
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  // Bibliotecas Externas (Essenciais para funcionar offline)
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
  'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js'
];

// 1. INSTALAÇÃO: Baixa tudo para o cache
self.addEventListener('install', (event) => {
  // Força o SW a ativar imediatamente, não esperando o anterior fechar
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ATIVAÇÃO: Limpa caches antigos para liberar espaço
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
  // Garante que o SW controle a página imediatamente
  self.clients.claim();
});

// 3. FETCH: Intercepta os pedidos. Se tiver no cache, entrega. Se não, busca na web.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna do cache se existir
      if (cachedResponse) {
        return cachedResponse;
      }
      // Se não, busca na rede
      return fetch(event.request).catch(() => {
        // Se falhar (sem internet) e não estiver no cache, não faz nada (ou poderia mostrar uma página de erro)
        console.log('Offline e recurso não cacheado:', event.request.url);
      });
    })
  );
});
