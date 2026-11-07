const STATUS={full:['Fully Compatible','ok'],adjust:['Playable With Adjustments','warn'],below:['Below Minimum Requirements','bad'],unknown:['Not Supported / Unknown','mute']};
const PLAT={pc:'PC',android:'Android',ios:'iPhone',ps4:'PlayStation 4 family',ps5:'PlayStation 5 family',xb1:'Xbox One family',xbs:'Xbox Series',switch:'Nintendo Switch',switch2:'Nintendo Switch 2'};
const cover=g=>{const h=[...g.name].reduce((a,c)=>a+c.charCodeAt(0),0)%360;return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="hsl(${h},40%,24%)"/><text x="200" y="108" font-size="26" fill="#fff" text-anchor="middle" font-family="sans-serif">${esc(g.name.slice(0,24))}</text></svg>`)};
const card=(g,d)=>{const r=d&&Compat.check(g,d),f=S.get('favs',[]).includes(g.id);
return `<article class="card"><img src="${cover(g)}" alt="${esc(g.name)} placeholder cover" loading="lazy"><div class="cb"><h3>${esc(g.name)}</h3><p class="mut">${esc(g.genre)} · ${g.free?'Free':'Paid'}</p>${r?`<span class="badge ${STATUS[r.status][1]}">${STATUS[r.status][0]}</span><p class="mut">${esc(r.bott)}</p>`:''}<div class="row"><a class="btn" href="#game/${g.id}">${t('details')}</a><button class="btn" data-a="fav" data-id="${g.id}" aria-label="Toggle favorite" title="Favorite">${f?'★':'☆'}</button></div></div></article>`};
const grid=(l,d)=>`<div class="grid">${l.map(g=>card(g,d)).join('')}</div>`;
const F={q:'',genre:'',plat:'',price:'',st:''};let CUR=null,CUR_ONLY=false;
const sel=(f,l,o)=>`<select data-f="${f}" aria-label="${l}"><option value="">${l}</option>${o.map(([v,n])=>`<option value="${v}" ${F[f]===v?'selected':''}>${esc(n)}</option>`).join('')}</select>`;
function body(){const d=CUR,platform=d?(d.type==='console'?(Compat.fam[d.specs.model]||''):d.type):'',rank={full:0,adjust:1,below:2,unknown:3};let L=DB.games.filter(g=>(!F.q||g.name.toLowerCase().includes(F.q.toLowerCase()))&&(!F.genre||g.genre===F.genre)&&(!F.plat||g.platforms.includes(F.plat))&&(!CUR_ONLY||!d||g.platforms.includes(platform))&&(!F.price||(F.price==='free')===g.free)&&(!F.st||!d||Compat.check(g,d).status===F.st));L.sort((a,b)=>{if(d){const x=rank[Compat.check(a,d).status],y=rank[Compat.check(b,d).status];if(x!==y)return x-y}return a.name.localeCompare(b.name)});
let h='';if(d){const c=counts(d);h=`<div class="stats"><div class="card"><b>${c.full}</b>Compatible</div><div class="card"><b>${c.adjust}</b>Playable</div><div class="card"><b>${c.below+c.unknown}</b>Unsupported / unknown</div></div>`}
return h+(L.length?grid(L,d):empty('No games match your filters. Clear a filter to see more.'))}
function listPage(d,title,deviceOnly=false){CUR=d;CUR_ONLY=deviceOnly;const gs=[...new Set(DB.games.map(g=>g.genre))].map(x=>[x,x]);
view(`<h1>${title}</h1>${d?`<p class="mut">Device: <b>${esc(d.name)}</b> <button class="btn" data-a="report">Export report (JSON)</button></p>`:''}
<div class="filters"><input data-f="q" type="search" placeholder="Search games" aria-label="Search games" value="${esc(F.q)}">${sel('genre','Genre',gs)}${sel('plat','Platform',Object.entries(PLAT))}${sel('price','Price',[['free','Free'],['paid','Paid']])}${d?sel('st','Status',Object.entries(STATUS).map(([k,v])=>[k,v[0]])):''}</div><div id="res">${body()}</div>`)}
PAGES.find=()=>{const d=activeDev();if(!d)return view(`<h1>${t('find')}</h1>${empty('Choose a device first.')}<div class="empty"><a class="btn pri" href="#select">${t('select')}</a></div>`);listPage(d,t('find'),true)};
PAGES.library=()=>listPage(activeDev(),t('library'));
PAGES.home=()=>{const rv=S.get('recent',[]).map(DB.game).filter(Boolean);
view(`<section class="hero"><h1>${t('tagline')}</h1><p class="mut">Check PC, Android, iPhone and console compatibility. No account needed.</p><a class="btn pri" href="#select">${t('cta')}</a></section>
<div class="stats"><div class="card"><b>${DB.games.length}</b>games in database</div><div class="card"><b>${S.get('devices',[]).length}</b>saved devices</div><div class="card"><b>${S.get('favs',[]).length}</b>favorites</div></div>
<div class="banner">${esc(DB.meta.notice)}</div><h2>${t('recent')}</h2>${rv.length?grid(rv,activeDev()):empty('No games viewed yet.')}`)};
PAGES.favorites=()=>{const l=S.get('favs',[]).map(DB.game).filter(Boolean);view(`<h1>${t('favorites')}</h1>${l.length?grid(l,activeDev()):empty('No favorites yet. Tap ☆ on any game.')}`)};
const REQ={ram:'RAM (GB)',vram:'VRAM (GB)',storage:'Storage (GB)',cpu:'CPU tier',gpu:'GPU tier',os:'OS'};
PAGES.game=id=>{const g=DB.game(id);if(!g)return view(empty('Game not found.')+'<div class="empty"><a class="btn" href="#library">Back to library</a></div>');
S.set('recent',[id,...S.get('recent',[]).filter(x=>x!==id)].slice(0,8));const d=activeDev(),r=d&&Compat.check(g,d);
const rq=q=>q?`<ul>${Object.entries(q).map(([k,v])=>`<li>${REQ[k]||k}: ${[].concat(v).join(', ')}</li>`).join('')}</ul>`:'<p class="mut">Insufficient Data</p>';
const mob=g.mobile?Object.entries(g.mobile).map(([k,v])=>`<p><b>${PLAT[k]}</b>: ${Object.keys(v).length?Object.entries(v).map(([a,b])=>`${a} ${b}`).join(', '):'Insufficient Data'}</p>`).join(''):'';
view(`<a href="#library">← ${t('library')}</a><div class="row"><img src="${cover(g)}" alt="${esc(g.name)} placeholder cover" style="max-width:320px;border-radius:12px"><div><h1>${esc(g.name)}</h1><p class="mut">${esc(g.genre)} · ${esc(g.dev)} · Released ${esc(g.date)} · ${g.free?'Free':'Paid'}</p><p>${esc(g.name)} is a ${esc(g.genre.toLowerCase())} game by ${esc(g.dev)}.</p><button class="btn" data-a="fav" data-id="${g.id}">Favorite</button></div></div>
<h2>Supported devices</h2><p>${g.platforms.map(p=>`<span class="badge mute">${PLAT[p]}</span>`).join(' ')}</p>
<div class="stats"><div class="card cb"><h3>Minimum (PC)</h3>${rq(g.pc?.min)}</div><div class="card cb"><h3>Recommended (PC)</h3>${rq(g.pc?.rec)}</div></div>${mob?`<h3>Mobile</h3>${mob}`:''}
<h2>Your device</h2>${r?`<p><span class="badge ${STATUS[r.status][1]}">${STATUS[r.status][0]}</span> ${esc(r.note)}</p>${r.rows.length?`<div class="tw"><table><tr><th>Check</th><th>Your device</th><th>Needed</th><th>Result</th></tr>${r.rows.map(x=>`<tr><td>${esc(x.l)}</td><td>${esc(x.have)}</td><td>${esc(x.need)}</td><td>${x.ok===null?'Insufficient Data':x.ok?'✔ Pass':'✘ Fail'}</td></tr>`).join('')}</table></div>`:''}`:empty('Select a device to see compatibility.')}
<p class="mut">Source: ${esc(g.src||DB.meta.source)} · Last updated: ${esc(g.upd||DB.meta.updated)} · <a href="${esc(g.url)}" target="_blank" rel="noopener">Official page</a>. CPU/GPU tiers are this project's approximate classes, not benchmarks.</p>`)};
PAGES.settings=()=>{const l=S.get('lang','en'),th=S.get('theme','dark');
view(`<h1>${t('settings')}</h1><label>Language<select data-s="lang"><option value="en" ${l==='en'?'selected':''}>English</option><option value="ar" ${l==='ar'?'selected':''}>العربية</option></select></label>
<label>Theme<select data-s="theme"><option value="dark" ${th==='dark'?'selected':''}>Dark</option><option value="light" ${th==='light'?'selected':''}>Light</option></select></label>
<div class="row"><button class="btn" data-a="expDev">Export devices</button><button class="btn" data-a="tests">Run compatibility self-tests</button><button class="btn" data-a="reset">Reset all data</button></div><div id="tests"></div>`)};
PAGES.about=()=>view(`<h1>${t('about')}</h1><p>${t('tagline')} GameScope compares your hardware with documented game requirements. It never invents FPS or benchmark numbers and shows "Insufficient Data" when information is missing.</p><div class="banner">${esc(DB.meta.notice)}</div><p>Open source under the MIT License. Data lives in <code>data/*.json</code>. Contributions are welcome.</p>`);
ACT.fav=id=>{let f=S.get('favs',[]);f=f.includes(id)?f.filter(x=>x!==id):[...f,id];S.set('favs',f);toast('Favorites updated');route()};
ACT.report=()=>{const d=activeDev();if(!d)return;dl('gamescope-report.json',{generated:new Date().toISOString(),notice:DB.meta.notice,device:d,results:DB.games.map(g=>{const r=Compat.check(g,d);return{game:g.name,status:r.status,note:r.note,checks:r.rows}})})};
ACT.reset=()=>{if(!confirm('Delete all saved devices, favorites and settings?'))return;Object.keys(localStorage).filter(k=>k.startsWith('gs_')).forEach(k=>localStorage.removeItem(k));applyPrefs();route()};
ACT.tests=()=>{const r=Compat.selfTest();$('#tests').innerHTML=`<div class="tw"><table>${r.map(x=>`<tr><td>${esc(x.n)}</td><td>${x.a} (expected ${x.e})</td><td>${x.pass?'✔':'✘'}</td></tr>`).join('')}</table></div>`};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)ACT[b.dataset.a]?.(b.dataset.id)});
document.addEventListener('submit',e=>{const f=e.target.dataset.form;if(f){e.preventDefault();FORMS[f](new FormData(e.target))}});
const onF=e=>{const el=e.target;if(el.dataset.f!==undefined){F[el.dataset.f]=el.value;$('#res').innerHTML=body()}};
document.addEventListener('input',onF);
document.addEventListener('change',e=>{onF(e);const el=e.target,s=el.dataset.s;
if(s==='lang'||s==='theme'){S.set(s,el.value);applyPrefs();route()}else if(s==='cmpA'){CMP.a=el.value;route()}else if(s==='cmpB'){CMP.b=el.value;route()}
else if(el.id==='imp'&&el.files[0])importDevices(el.files[0])});
(async()=>{applyPrefs();$('#menu').onclick=()=>$('#side').classList.toggle('open');window.addEventListener('hashchange',route);
try{await DB.load();route()}catch(e){console.error(e);view(`<p class="err">Could not load game data: ${esc(e.message)}. Serve the folder over HTTP (for example <code>python -m http.server</code>) instead of opening the file directly.</p>`)}})();
