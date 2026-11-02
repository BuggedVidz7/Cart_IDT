// Offline-capable shell: precache the app, refresh in the background. 
const VERSION = 'bsm-v2';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'app.js', 'store.js', 'scene.js', 'scanner.js', 'icons.js',
  'store-layout.json', 'products.json', 'offers.json', 'recipes.json',
  'three.module.js', 'three.core.js', 'OrbitControls.js', 'zxing.min.js', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  if (req.mode === 'navigate') { e.respondWith(fetch(req).then(r => { caches.open(VERSION).then(c => c.put('index.html', r.clone())); return r; }).catch(() => caches.match('index.html'))); return; }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(req, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
