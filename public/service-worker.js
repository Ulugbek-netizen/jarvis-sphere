self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('jarvis-static-')) await caches.delete(name);
  await self.clients.claim();
})()));
// Network-only so old assets cannot hide a newly installed local release.
