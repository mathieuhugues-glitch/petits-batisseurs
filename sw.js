/* Petits bâtisseurs - offline cache (network first, cache fallback) */
const C = 'pb-v1';
const FILES = ['./', 'index.html', 'solo.html', 'play.html', 'css/style.css', 'css/fonts.css', 'js/sound.js', 'js/voice.js', 'js/buildings.js', 'js/ui.js', 'js/builder.js', 'js/solo.js', 'js/host.js', 'js/play.js', 'js/net.js', 'vendor/peerjs.min.js', 'vendor/qrcode.js',
  'fonts/rubik-latin-700-normal.woff2', 'fonts/rubik-latin-800-normal.woff2', 'fonts/rubik-latin-ext-700-normal.woff2', 'fonts/rubik-latin-ext-800-normal.woff2'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
