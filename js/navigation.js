const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=k=>(I18N[S.get('lang','en')]||I18N.en)[k]||I18N.en[k]||k;
const view=h=>{$('#main').innerHTML=h},PAGES={},ACT={},FORMS={};
const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2500)};
const empty=m=>`<div class="empty">${esc(m)}</div>`;
const NAV=[['home','🏠'],['select','➕'],['devices','💻'],['find','🎯'],['library','📚'],['compare','⚖️'],['favorites','★'],['settings','⚙️'],['about','ℹ️']];
function route(){const [p,a]=(location.hash.slice(1)||'home').split('/');
$('#nav').innerHTML=NAV.map(([k,i])=>`<a href="#${k}" ${k===p?'class="on" aria-current="page"':''}>${i} ${t(k)}</a>`).join('');
try{(PAGES[p]||PAGES.home)(a)}catch(e){console.error(e);view(`<p class="err">Something went wrong: ${esc(e.message)}. Reload the page.</p>`)}
$('#side').classList.remove('open');window.scrollTo(0,0)}
function applyPrefs(){const l=S.get('lang','en'),h=document.documentElement;h.dataset.theme=S.get('theme','dark');h.lang=l;h.dir=l==='ar'?'rtl':'ltr'}