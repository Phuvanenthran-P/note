self.addEventListener("install", e=>self.skipWaiting());
self.addEventListener("activate", e=>e.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", e=>{
  if(e.action==="remove"){
    e.notification.close();
    e.waitUntil(self.clients.matchAll({type:"window"}).then(clients=>{
      if(clients.length){clients[0].postMessage({type:"removeNote",id:e.notification.data.id});}
    }));
  }else{
    e.notification.close();
    e.waitUntil(self.clients.openWindow("/"));
  }
});
