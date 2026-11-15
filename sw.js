/* Fikir Sepeti: çevrimdışı açılış. Önce ağ, olmazsa önbellek; böylece güncellemeler hemen görünür. */
var V='fs-v1', CORE=['./','index.html','en.html','style.css','seed.js','seed_en.js','store.js','config.js','manifest.webmanifest','icon-192.png','404.html'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var r=e.request; if(r.method!=='GET') return; var u=new URL(r.url);
  if(u.origin===location.origin){
    if(/admin\.html$/.test(u.pathname)) return;
    e.respondWith(fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone(); caches.open(V).then(function(c){c.put(r,cp)})} return res}).catch(function(){
      return caches.match(r,{ignoreSearch:true}).then(function(m){return m||(r.mode==='navigate'?caches.match(/\/en\.html$/.test(u.pathname)?'en.html':'index.html'):undefined)})}));
    return;
  }
  if(/^(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com)$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(function(m){var f=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque')){var cp=res.clone(); caches.open(V).then(function(c){c.put(r,cp)})} return res}).catch(function(){return m}); return m||f}));
  }
});
