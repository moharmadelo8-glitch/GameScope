let SEL='pc';
const activeDev=()=>S.get('devices',[]).find(d=>d.id===S.get('active'))||null;
const conName=id=>(DB.dev.consoles.find(c=>c[0]===id)||[id,id])[1];
const fields=ty=>({
 pc:[['cpu',t('cpu'),'l','cpus'],['gpu',t('gpu'),'l','gpus'],['ram',t('ram'),'n',[1,1024]],['vram',t('vram'),'n',[0,128]],['os',t('os'),'s',['Windows 10','Windows 11','macOS','Linux']],['storage',t('storage'),'n',[0,100000]],['res',t('resolution')+' ('+t('optional')+')','s',['1280x720','1920x1080','2560x1440','3840x2160']]],
 android:[['brand',t('brand'),'b',DB.dev.androidBrands||[]],['model',t('model'),'l','androidModels'],['soc',t('chipset')+' ('+t('optional')+')','l','mobile-processors'],['ram',t('ram'),'n',[1,64]],['android',t('androidVersion'),'n',[4,20]],['storage',t('freeStorage'),'n',[0,2048]]],
 ios:[['model',t('model'),'s',DB.dev.iphones],['ios',t('iosVersion'),'n',[9,30]],['storage','Free storage (GB)','n',[0,2048]]],
 console:[['model',t('console'),'c']]
}[ty]);
const input=([k,l,kind,x])=>{
 const a=`name="${k}" id="f_${k}" title="${l}"`;
 let i;
 if(kind==='n')i=`<input type="number" step="any" min="${x[0]}" max="${x[1]}" placeholder="${t('leaveBlank')}" ${a}>`;
 else if(kind==='b')i=`<select ${a}><option value="">${t('choose')}</option>${x.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select>`;
 else if(kind==='s'||kind==='c')i=`<select ${a}><option value="">${t('choose')}</option>${(kind==='c'?DB.dev.consoles:x.map(v=>[v,v])).map(([v,n])=>`<option value="${esc(v)}">${esc(n)}</option>`).join('')}</select>`;
 else i=`<input type="text" maxlength="100" autocomplete="off" placeholder="${kind==='l'?'${t('typeToSearch')}':'Enter if known'}" ${kind==='l'?`list="dl_${x}"`:''} ${a}>`;
 return `<label>${l}${i}</label>`;
};
PAGES.select=()=>{
 const T={pc:t('pcLaptop'),android:t('androidPhone'),ios:t('iphone'),console:t('console')};
 const dataLists=`<datalist id="dl_cpus">${DB.cpus.map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist><datalist id="dl_gpus">${DB.gpus.map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist><datalist id="dl_androidModels">${(DB.dev.androidModels||[]).map(c=>`<option value="${esc(c)}">`).join('')}</datalist><datalist id="dl_mobile-processors">${DB.mobileCPUs.map(c=>`<option value="${esc(c.name)}">`).join('')}</datalist>`;
 view(`<h1>${t('select')}</h1><p class="mut">${t('chooseDevice')} ${t('leaveBlank')}.</p>
 <div class="tabs" role="tablist">${Object.entries(T).map(([k,v])=>`<button class="btn ${k===SEL?'pri':''}" role="tab" aria-selected="${k===SEL}" data-a="tab" data-id="${k}">${v}</button>`).join('')}</div>
 ${dataLists}<form data-form="dev"><label>${t('nameOptional')}<input type="text" name="name" maxlength="40" placeholder="e.g. My gaming PC"></label>
 <div class="spec-grid">${fields(SEL).map(input).join('')}</div>
 <div class="banner"><b>${t('tip')}:</b> ${SEL==='pc'?t('tipPc'):SEL==='android'?t('tipAndroid'):t('tipOther')}</div>
 <button class="btn pri" type="submit">${t('save')}</button></form>`);
};
ACT.tab=id=>{SEL=id;PAGES.select()};
FORMS.dev=fd=>{
 const specs={};
 fields(SEL).forEach(([k,,kind])=>{const v=String(fd.get(k)||'').trim();specs[k]=kind==='n'?(v===''?null:Number(v)):v});
 const ds=S.get('devices',[]);
 if(ds.length>=20)return toast(t('limit'));
 const nm=String(fd.get('name')||'').trim()||(SEL==='pc'?(specs.gpu||specs.cpu||'My PC'):SEL==='android'?([specs.brand,specs.model].filter(Boolean).join(' ')||'My Android phone'):SEL==='ios'?(specs.model||'My iPhone'):(conName(specs.model)||'My console'));
 const d={id:Date.now().toString(36),type:SEL,name:nm,specs};
 ds.push(d);S.set('devices',ds);S.set('active',d.id);toast(t('saveSuccess'));location.hash='find';
};
const specsText=d=>Object.entries(d.specs).filter(([,v])=>v!==null&&v!=='').map(([k,v])=>`${k}: ${k==='model'&&d.type==='console'?conName(v):v}`).join(' · ')||t('noSpecs');
PAGES.devices=()=>{const ds=S.get('devices',[]),a=S.get('active');view(`<h1>${t('devices')}</h1><div class="row"><a class="btn pri" href="#select" >${t('addDevice')}</a><button class="btn" data-a="expDev" >${t('exportDevices')}</button><label class="btn">${t('import')}<input id="imp" type="file" accept="application/json" hidden></label></div>${ds.length?`<div class="grid">${ds.map(d=>`<div class="card cb"><h3>${esc(d.name)}</h3><span class="badge mute">${t(d.type)}</span>${d.id===a?` <span class="badge ok">${t('active')}</span>`:''}<p class="mut">${esc(specsText(d))}</p><div class="row"><button class="btn" data-a="use" data-id="${d.id}" >${t('use')}</button><button class="btn" data-a="del" data-id="${d.id}" >${t('delete')}</button></div></div>`).join('')}</div>`:empty(t('noDevices'))}` )};
ACT.use=id=>{S.set('active',id);toast(t('activeDevice'));route()};
ACT.del=id=>{if(!confirm(t('deleteConfirm')))return;S.set('devices',S.get('devices',[]).filter(d=>d.id!==id));if(S.get('active')===id)S.set('active','');route()};
ACT.expDev=()=>dl('gamescope-devices.json',S.get('devices',[]));
function importDevices(file){const r=new FileReader();r.onload=()=>{try{const a=JSON.parse(r.result);if(!Array.isArray(a))throw 0;const ok=a.filter(d=>d&&typeof d.name==='string'&&['pc','android','ios','console'].includes(d.type)&&d.specs&&typeof d.specs==='object').map(d=>({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),type:d.type,name:d.name.slice(0,40),specs:d.specs}));if(!ok.length)throw 0;S.set('devices',[...S.get('devices',[]),...ok].slice(0,20));toast(ok.length+' '+t('devicesImported'));route()}catch{toast(t('importFail'))}};r.readAsText(file)}
