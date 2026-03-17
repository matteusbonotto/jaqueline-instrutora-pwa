// Service Worker para PWA instalável
const CACHE_NAME = 'instrutora-jaque-v1';

// Instalação
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  self.skipWaiting(); // Ativa imediatamente
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] ✅ Service Worker ATIVADO e funcionando!');
      return self.clients.claim(); // Toma controle imediato
    })
  );
});

// Fetch - CRÍTICO para PWA ser instalável
self.addEventListener('fetch', (event) => {
  // O Chrome precisa que o SW responda a requisições para considerar instalável
  event.respondWith(
    fetch(event.request).catch(() => {
      // Fallback básico se offline
      return new Response('Offline', { status: 503 });
    })
  );
});
