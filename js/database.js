const DB={games:[],cpus:[],gpus:[],dev:{},
async load(){const j=u=>fetch(u).then(r=>{if(!r.ok)throw new Error(u+' ('+r.status+')');return r.json()});
[DB.meta,DB.cpus,DB.gpus,DB.dev]=await Promise.all([j('data/games.json'),j('data/processors.json'),j('data/graphics-cards.json'),j('data/devices.json')]);DB.games=DB.meta.games},
game:id=>DB.games.find(g=>g.id===id),
cpu:n=>DB.cpus.find(c=>c.name.toLowerCase()===String(n||'').toLowerCase()),
gpu:n=>DB.gpus.find(c=>c.name.toLowerCase()===String(n||'').toLowerCase())};