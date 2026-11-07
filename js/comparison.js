let chart;const CMP={a:'',b:''};
const counts=d=>{const c={full:0,adjust:0,below:0,unknown:0},p=d.type==='console'?(Compat.fam[d.specs.model]||''):d.type;DB.games.filter(g=>g.platforms.includes(p)).forEach(g=>c[Compat.check(g,d).status]++);return c};
PAGES.compare=()=>{const ds=S.get('devices',[]);
if(ds.length<2)return view(`<h1>${t('compare')}</h1>${empty('Save at least two devices to compare them.')}<div class="empty"><a class="btn pri" href="#select">Add device</a></div>`);
const A=ds.find(d=>d.id===CMP.a)||ds[0],B=ds.find(d=>d.id===CMP.b)||ds[1],ca=counts(A),cb=counts(B),opt=x=>ds.map(d=>`<option value="${d.id}" ${d.id===x.id?'selected':''}>${esc(d.name)}</option>`).join('');
const diff=DB.games.map(g=>[g,Compat.check(g,A).status,Compat.check(g,B).status]).filter(r=>r[1]!==r[2]);
view(`<h1>${t('compare')}</h1><div class="filters"><select data-s="cmpA" aria-label="Device A">${opt(A)}</select><select data-s="cmpB" aria-label="Device B">${opt(B)}</select></div>
<p class="mut">Hardware specs are listed side by side but never scored against each other across device types. Only database compatibility is compared.</p>
<div class="tw"><table><tr><th></th><th>${esc(A.name)}</th><th>${esc(B.name)}</th></tr><tr><td>Type</td><td>${A.type}</td><td>${B.type}</td></tr><tr><td>Specs</td><td>${esc(specsText(A))}</td><td>${esc(specsText(B))}</td></tr>
${Object.entries(STATUS).map(([k,v])=>`<tr><td>${v[0]}</td><td>${ca[k]}</td><td>${cb[k]}</td></tr>`).join('')}</table></div>
<canvas id="cc" height="110" aria-label="Compatibility comparison chart"></canvas><h2>Differences (${diff.length})</h2>
${diff.length?`<div class="tw"><table>${diff.map(([g,x,y])=>`<tr><td>${esc(g.name)}</td><td><span class="badge ${STATUS[x][1]}">${STATUS[x][0]}</span></td><td><span class="badge ${STATUS[y][1]}">${STATUS[y][0]}</span></td></tr>`).join('')}</table></div>`:empty('No differences in the database for these two devices.')}`);
if(window.Chart){chart?.destroy();Chart.defaults.color='#94A3B8';const ks=Object.keys(STATUS);
chart=new Chart($('#cc'),{type:'bar',data:{labels:ks.map(k=>STATUS[k][0]),datasets:[{label:A.name,data:ks.map(k=>ca[k]),backgroundColor:'#7857FF'},{label:B.name,data:ks.map(k=>cb[k]),backgroundColor:'#22C55E'}]},options:{scales:{y:{beginAtZero:true,ticks:{precision:0}}}}})}};