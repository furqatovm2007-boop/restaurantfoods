/*
 * Service worker for the installable RestaurantFoods apps. It never caches pages or data (the
 * site and its prices must always be live); it only shows a small offline page when there is
 * no network, so the installed app opens to a message instead of the browser error.
 */
const OFFLINE = `<!doctype html><html lang="uz"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RestaurantFoods</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#081521;color:#f8fafc;font:16px system-ui,sans-serif;text-align:center;padding:24px"><div><p style="font-size:42px;margin:0">📡</p><h1 style="font-size:20px">Internet aloqasi yo‘q</h1><p style="color:#a7c1ca">Нет подключения к интернету · You are offline</p></div></body></html>`;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
