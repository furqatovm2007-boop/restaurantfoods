/*
 * Service worker for the installable RestaurantFoods apps. It never caches pages or data (the
 * site and its prices must always be live); it only shows a small offline page when there is
 * no network, so the installed app opens to a message instead of the browser error. That page
 * also shows the QR passes of active bookings that receipt.js saved in localStorage, so the
 * guest can still show the pass at the restaurant door with no internet.
 */
const OFFLINE = `<!doctype html><html lang="uz"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RestaurantFoods</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#081521;color:#f8fafc;font:16px system-ui,sans-serif;text-align:center;padding:24px"><div><p style="font-size:42px;margin:0">📡</p><h1 style="font-size:20px">Internet aloqasi yo‘q</h1><p style="color:#a7c1ca">Нет подключения к интернету · You are offline</p><div id="passes"></div></div><script>
(function(){var all={};try{all=JSON.parse(localStorage.getItem('rf_offline_passes')||'{}')||{}}catch(e){}
var now=Date.now(),box=document.getElementById('passes');
Object.keys(all).map(function(k){return all[k]}).filter(function(e){var b=e&&e.data&&e.data.booking;if(!b||!e.data.pass)return false;var end=Date.parse(b.date+'T'+String(b.endSlot||b.slot||'23:59').slice(0,5)+':00+05:00')||0;return end+3600000>now}).sort(function(a,b){return(a.data.booking.date+a.data.booking.slot)<(b.data.booking.date+b.data.booking.slot)?-1:1}).forEach(function(e){
var d=e.data,card=document.createElement('section');card.style.cssText='margin:18px auto 0;max-width:320px;padding:16px;border-radius:18px;background:#0f1f2b;border:1px solid #2fe3b555';
var h=document.createElement('h2');h.style.cssText='font-size:17px;margin:0 0 4px';h.textContent='🎟 '+d.restaurant.name;
var p=document.createElement('p');p.style.cssText='margin:0 0 10px;color:#a7c1ca';p.textContent=d.booking.date+' · '+String(d.booking.slot).slice(0,5)+' · Stol '+d.booking.table+(d.booking.mergedTable?'+'+d.booking.mergedTable:'')+' · '+d.booking.guests;
var qr=document.createElement('div');qr.style.cssText='background:#fff;border-radius:12px;padding:6px;display:inline-block';qr.innerHTML=e.qr[260];
var c=document.createElement('code');c.style.cssText='display:block;margin-top:10px;font-size:18px;letter-spacing:.12em';c.textContent=d.pass.code.replace(/(.{4})/g,'$1 ').trim();
var s=document.createElement('small');s.style.color='#a7c1ca';s.textContent='Restoranga kelganda shu QR kodni ko‘rsating · Покажите QR-код · Show this QR code';
card.append(h,p,qr,c,s);box.append(card)})})();
</script></body></html>`;
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
