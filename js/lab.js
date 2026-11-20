// GameScope Lab + DviseScope
PAGES.lab=()=>{
 const d=activeDev();
 view(`<section class="hero"><span class="badge mute">GameScope Lab</span><h1>${t('lab')}</h1><p class="mut">${t('labIntro')}</p></section>
 <div class="lab-grid">
  <a class="card lab-tile" href="#find"><span>🎯</span><h2>${t('labCompatibility')}</h2><p>${d?esc(d.name):t('chooseDevice')}</p><b>${t('find')} →</b></a>
  <a class="card lab-tile" href="#dvisescope"><span>🧩</span><h2>DviseScope</h2><p>${t('labBuilds')}</p><b>${t('dvGenerate')} →</b></a>
 </div><p class="banner">${t('labNote')}</p>`);
};
PAGES.dvisescope=()=>{
 view(`<h1>${t('dvTitle')}</h1><p class="mut">${t('dvIntro')}</p>
 <form data-form="dvisescope" class="dv-form">
  <label>${t('dvGames')}<textarea name="games" rows="10" required placeholder="Minecraft&#10;Cyberpunk 2077&#10;Red Dead Redemption 2"></textarea></label>
  <label>${t('dvResolution')}<select name="resolution"><option value="1920x1080">1080p</option><option value="2560x1440">1440p</option><option value="3840x2160">4K</option></select></label>
  <button class="btn pri" type="submit">${t('dvGenerate')}</button>
 </form><div id="dv-results" aria-live="polite"></div>
 <p class="banner">${t('dvOfficial')} ${t('dvGtaNotice')}</p>`);
};
FORMS.dvisescope=fd=>{
 const names=String(fd.get('games')||'').split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);
 const out=$('#dv-results'); if(names.length!==10){out.innerHTML=empty(t('dvNeedTen'));return}
 const matched=[],unmatched=[];
 names.forEach(n=>{const q=n.toLowerCase();const g=DB.games.find(x=>x.name.toLowerCase()===q||(x.aliases||[]).some(a=>a.toLowerCase()===q))||DB.games.find(x=>x.name.toLowerCase().includes(q)||(x.aliases||[]).some(a=>a.toLowerCase().includes(q)));if(g)matched.push(g);else unmatched.push(n)});
 const usable=matched.filter(g=>g.platforms.includes('pc')&&g.pc&&(g.pc.min||g.pc.rec));
 const req=usable.reduce((a,g)=>{const r=g.pc.rec||g.pc.min;a.cpu=Math.max(a.cpu,Number(r.cpu||g.pc.min?.cpu||1));a.gpu=Math.max(a.gpu,Number(r.gpu||g.pc.min?.gpu||1));a.vram=Math.max(a.vram,Number(r.vram||g.pc.min?.vram||0));a.ram=Math.max(a.ram,Number(r.ram||g.pc.min?.ram||8));a.storage=Math.max(a.storage,Number(r.storage||g.pc.min?.storage||0));return a},{cpu:1,gpu:1,vram:0,ram:8,storage:0});
 const resolution=String(fd.get('resolution')||'1920x1080');
 const resolutionBoost=resolution==='3840x2160'?2:resolution==='2560x1440'?1:0;
 const gpuNeed=Math.min(10,req.gpu+resolutionBoost);
 const eligibleGpus=DB.gpus.filter(x=>x.tier>=gpuNeed&&x.vram>=req.vram).sort((a,b)=>a.tier-b.tier||a.vram-b.vram||a.name.localeCompare(b.name));
 if(!usable.length||!eligibleGpus.length){out.innerHTML=empty(t('dvInsufficient'));return}
 const cpuPool=DB.cpus.filter(x=>x.tier>=req.cpu).sort((a,b)=>a.tier-b.tier||a.name.localeCompare(b.name));
 const ramOptions=[16,32,32,64,64].map(n=>Math.max(n,Math.ceil(req.ram/8)*8));
 const picks=Array.from({length:5},(_,i)=>{
  const gpu=eligibleGpus[i%eligibleGpus.length];
  const cpu=cpuPool[Math.min(i,cpuPool.length-1)]||DB.cpus.slice().sort((a,b)=>b.tier-a.tier)[0];
  const ram=ramOptions[i],vram=gpu.vram;
  return {tier:gpu.tier,gpu,cpu,ram,vram};
 });
 out.innerHTML=`<h2>${t('dvMatched')} (${usable.length}/10)</h2><div class="chips">${matched.map(g=>`<span class="badge mute">${esc(g.name)}</span>`).join(' ')}</div>
 ${unmatched.length?`<p class="mut">${t('dvUnmatched')}: ${unmatched.map(esc).join(', ')}</p>`:''}
 ${matched.filter(g=>!g.platforms.includes('pc')||!g.pc).map(g=>`<p class="banner">${esc(g.name)} — ${t('dvNoPC')}</p>`).join('')}
 <p class="mut">${t('dvBased')} · ${t('dvTier')}: CPU ${req.cpu}/10, GPU ${req.gpu}/10 (+${resolutionBoost}), VRAM ≥ ${req.vram} GB, RAM ≥ ${req.ram} GB · ${resolution}</p>
 <div class="grid build-grid">${picks.map((b,i)=>`<article class="card cb"><span class="badge ${i===0?'ok':'mute'}">${t('dvBuild')} #${i+1}</span><h3>${t('dvTier')} ${b.tier}/10</h3><p><b>${t('dvCPU')}:</b><br>${esc(b.cpu.name)}</p><p><b>${t('dvGPU')}:</b><br>${esc(b.gpu.name)}</p><p><b>${t('dvRAM')}:</b> ${b.ram} GB</p><p><b>${t('dvVRAM')}:</b> ${b.vram} GB</p><p><b>${t('dvStorage')}:</b> ${Math.max(1,Math.ceil(req.storage/500)*500)} GB</p></article>`).join('')}</div>`;
};
