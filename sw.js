<!-- ===== sw.js ===== -->
// Service Worker (save as sw.js in same directory as index.html)

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', function(event){
  const data = event.notification.data || {};
  const action = event.action;
  event.notification.close();

  if(action === 'remove'){
    // The user chose "Remove from app" action — tell clients to remove note
    event.waitUntil(
      self.clients.matchAll({type:'window', includeUncontrolled:true}).then(clients => {
        if(clients && clients.length){
          clients[0].postMessage({type:'removeNote', id: data.noteId});
          // Also try to focus the client
          clients[0].focus();
        }
      })
    );
    return;
  }

  // default click — open or focus the app
  event.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(clients => {
      for(const c of clients){ if(c.url && 'focus' in c) return c.focus(); }
      if(self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

self.addEventListener('notificationclose', function(event){
  // Optionally handle when user dismisses notification from system UI
  // We could send a message to clients here if we want to track dismissal
});

// Optional: respond to messages from page
self.addEventListener('message', event => {
  const d = event.data || {};
  if(d && d.type === 'closeNotification' && d.tag){
    self.registration.getNotifications({tag: d.tag}).then(notifs => notifs.forEach(n => n.close()));
  }
});
