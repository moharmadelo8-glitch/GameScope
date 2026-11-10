let chart;
const CMP={a:'',b:''};
const compareText={
en:{scope:'Compatibility is checked separately for each device. Different device types are not ranked against each other.',available:'Not available on this platform',common:'Games listed on both platforms',game:'Game',aStatus:'Device A',bStatus:'Device B',empty:'Not entered',hint:'Choose two different saved devices.',specNote:'Specifications are shown as entered; cross-platform hardware scores are not invented.'},
ar:{scope:'يُفحص التوافق لكل جهاز بشكل مستقل. لا تتم مقارنة أنواع الأجهزة المختلفة بدرجة أداء واحدة.',available:'غير متاحة على هذه المنصة',common:'ألعاب مدرجة على المنصتين',game:'اللعبة',aStatus:'نتيجة الجهاز A',bStatus:'نتيجة الجهاز B',empty:'غير مُدخل',hint:'اختر جهازين مختلفين محفوظين.',specNote:'تُعرض المواصفات كما أُدخلت، دون اختراع درجات مقارنة بين المنصات.'},
fr:{scope:'La compatibilité est vérifiée séparément pour chaque appareil. Les types différents ne sont pas classés ensemble.',available:'Indisponible sur cette plateforme',common:'Jeux répertoriés sur les deux plateformes',game:'Jeu',aStatus:'Résultat A',bStatus:'Résultat B',empty:'Non renseigné',hint:'Choisissez deux appareils enregistrés différents.',specNote:'Les caractéristiques sont affichées telles que saisies, sans score matériel interplateforme inventé.'}
};
const ct=k=>compareText[S.get('lang','en')]?.[k]||compareText.en[k]||k;
const platformOf=d=>d.type==='console'?(Compat.fam[d.specs?.model]||''):d.type;
const counts=d=>{const p=platformOf(d),c={full:0,adjust:0,below:0,unknown:0};DB.games.filter(g=>g.platforms?.includes(p)).forEach(g=>{const s=Compat.check(g,d).status;if(c[s]!==undefined)c[s]++});return c};
const statusFor=(g,d)=>g.platforms?.includes(platformOf(d))?Compat.check(g,d).status:null;
const specRows=(a,b)=>{
const keys=['cpu','gpu','ram','vram','os','storage','res','brand','model','soc','android','ios'];
const rows=keys.filter(k=>[a,b].some(d=>d.specs?.[k]!==null&&d.specs?.[k]!==undefined&&d.specs?.[k]!==''));
return rows.map(k=>{
const val=d=>{let v=d.specs?.[k];if(v===null||v===undefined||v==='')return ct('empty');if(k==='model'&&d.type==='console')return conName(v);if(k==='cpu')return DB.cpu(v)?.name||String(v);if(k==='gpu')return DB.gpu(v)?.name||String(v);if(k==='soc')return DB.mobileCPU(v)?.name||String(v);if(['ram','vram','storage'].includes(k))return v+' GB';return String(v)};
return '<tr><th>'+esc(t(k==='soc'?'chipset':k)||k)+'</th><td>'+esc(val(a))+'</td><td>'+esc(val(b))+'</td></tr>';
}).join('');
};
PAGES.compare=()=>{
const ds=S.get('devices',[]);
if(ds.length<2)return view('<h1>'+t('compare')+'</h1>'+empty(t('compareTwo'))+'<div class="empty"><a class="btn pri" href="#select">'+t('addDevice')+'</a></div>');
let A=ds.find(d=>d.id===CMP.a)||ds[0];
let B=ds.find(d=>d.id===CMP.b&&d.id!==A.id)||ds.find(d=>d.id!==A.id)||ds[1];
CMP.a=A.id;CMP.b=B.id;
const ca=counts(A),cb=counts(B),pA=platformOf(A),pB=platformOf(B);
const options=(chosen,other)=>ds.map(d=>'<option value="'+esc(d.id)+'" '+(d.id===chosen.id?'selected':'')+' '+(d.id===other.id?'disabled':'')+'>'+esc(d.name)+'</option>').join('');
const relevant=DB.games.filter(g=>statusFor(g,A)!==null||statusFor(g,B)!==null);
const common=DB.games.filter(g=>g.platforms?.includes(pA)&&g.platforms?.includes(pB)).length;
const diff=DB.games.filter(g=>g.platforms?.includes(pA)&&g.platforms?.includes(pB)&&statusFor(g,A)!==statusFor(g,B));
const cell=s=>s===null?'<span class="badge mute">'+ct('available')+'</span>':'<span class="badge '+(STATUS[s]?.[1]||'mute')+'">'+st(s)+'</span>';
view('<h1>'+t('compare')+'</h1><p class="mut">'+ct('hint')+'</p>'+
'<div class="filters"><label>'+t('device')+' A<select data-s="cmpA" aria-label="Device A">'+options(A,B)+'</select></label><label>'+t('device')+' B<select data-s="cmpB" aria-label="Device B">'+options(B,A)+'</select></label></div>'+
'<p class="mut">'+ct('scope')+'</p>'+
'<div class="stats"><div class="card cb"><b>'+DB.games.filter(g=>g.platforms?.includes(pA)).length+'</b>'+t('games')+' · '+esc(A.name)+'</div><div class="card cb"><b>'+DB.games.filter(g=>g.platforms?.includes(pB)).length+'</b>'+t('games')+' · '+esc(B.name)+'</div><div class="card cb"><b>'+common+'</b>'+ct('common')+'</div><div class="card cb"><b>'+diff.length+'</b>'+t('differences')+'</div></div>'+
'<h2>'+t('specs')+'</h2><p class="mut">'+ct('specNote')+'</p><div class="tw"><table><thead><tr><th></th><th>'+esc(A.name)+'</th><th>'+esc(B.name)+'</th></tr></thead><tbody><tr><th>'+t('type')+'</th><td>'+esc(t(A.type)||A.type)+'</td><td>'+esc(t(B.type)||B.type)+'</td></tr>'+specRows(A,B)+'</tbody></table></div>'+
'<h2>'+t('differences')+' ('+diff.length+')</h2>'+
(diff.length?'<div class="tw"><table><thead><tr><th>'+ct('game')+'</th><th>'+ct('aStatus')+'</th><th>'+ct('bStatus')+'</th></tr></thead><tbody>'+diff.map(g=>'<tr><td>'+esc(g.name)+'</td><td>'+cell(statusFor(g,A))+'</td><td>'+cell(statusFor(g,B))+'</td></tr>').join('')+'</tbody></table></div>':empty(t('noDifferences')))+
(window.Chart?'<canvas id="cc" height="110" aria-label="'+esc(t('chartLabel'))+'"></canvas>':''));
if(window.Chart&&$('#cc')){chart?.destroy();Chart.defaults.color='#94A3B8';const ks=Object.keys(STATUS);chart=new Chart($('#cc'),{type:'bar',data:{labels:ks.map(k=>t(STATUS[k][0])),datasets:[{label:A.name,data:ks.map(k=>ca[k]),backgroundColor:'#7857FF'},{label:B.name,data:ks.map(k=>cb[k]),backgroundColor:'#22C55E'}]},options:{responsive:true,scales:{y:{beginAtZero:true,ticks:{precision:0}}},plugins:{legend:{position:'bottom'}}}})}
};