const CACHE='save-concept-v12';
const ASSETS=['./','./index.html','./admin.html','./styles.css','./app.js','./admin.js','./catalog-data.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./save-concept-tirzepatide-3d.png','./login-product-back-v2.png','./save-concept-mark-v2.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))))});
