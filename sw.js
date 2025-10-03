self.addEventListener('install', (e)=>{ self.skipWaiting(); });
});


// handle messages from page
self.addEventListener('message', (ev)=>{
const data = ev.data || {};
if(data.type === 'PIN_NOTE'){
const n = data.note;
self.registration.showNotification(n.title||'Pinned note', {body:n.body, tag:'pinned-note-'+n.id, requireInteraction:true, data:{id:n.id}});
// also persist to IDB
writeNoteToIDB(n);
}
if(data.type === 'UNPIN_NOTE'){
const id = data.id;
// close notifications with tag
self.registration.getNotifications({tag:'pinned-note-'+id}).then(notifs=>notifs.forEach(n=>n.close()));
// update IDB
markUnpinnedInIDB(id);
}
});


// --- small IDB helpers inside SW ---
function openDBsw(){
return new Promise((resolve,reject)=>{
const req = indexedDB.open('pinned-notes-db',1);
req.onupgradeneeded = (e)=>{ const db = e.target.result; if(!db.objectStoreNames.contains('notes')){ db.createObjectStore('notes',{keyPath:'id'}); } }
req.onsuccess = ()=>resolve(req.result);
req.onerror = ()=>reject(req.error);
})
}
async function readPinnedFromIDB(){
const db = await openDBsw();
return new Promise((resolve,reject)=>{
const tx = db.transaction('notes','readonly');
const store = tx.objectStore('notes');
const req = store.getAll();
req.onsuccess = ()=>resolve(req.result.filter(x=>x.pinned));
req.onerror = ()=>reject(req.error);
})
}
async function writeNoteToIDB(note){
const db = await openDBsw();
return new Promise((resolve,reject)=>{
const tx = db.transaction('notes','readwrite');
tx.objectStore('notes').put(note);
tx.oncomplete = ()=>resolve(); tx.onerror = ()=>reject(tx.error);
})
}
async function markUnpinnedInIDB(id){
const db = await openDBsw();
return new Promise((resolve,reject)=>{
const tx = db.transaction('notes','readwrite');
const store = tx.objectStore('notes');
const req = store.get(id);
req.onsuccess = ()=>{
const val = req.result; if(!val) return resolve(); val.pinned=false; store.put(val); }
tx.oncomplete = ()=>resolve(); tx.onerror = ()=>reject(tx.error);
})
}
