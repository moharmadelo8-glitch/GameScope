const STATUS={full:['compatible','ok'],adjust:['adjust','warn'],below:['below','bad'],unknown:['unknown','mute']};
const PLAT={pc:'pc',android:'android',ios:'ios',ps4:'ps4',ps5:'ps5',xb1:'xb1',xbs:'xbs',switch:'switch',switch2:'switch2'};const st=k=>t(STATUS[k]?.[0]||k),pl=k=>t(PLAT[k]||k);
const STEAM_ART={'gta-v':'271590','cyberpunk-2077':'1091500','cs2':'730','rdr2':'1174180','forza-horizon-5':'1551360','warzone':'1962663','elden-ring':'1245620','baldurs-gate-3':'1086940','hogwarts-legacy':'990080'};const fallbackCover=g=>{const h=[...g.name].reduce((a,c)=>a+c.charCodeAt(0),0)%360;return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="hsl(${h},55%,25%)"/><stop offset="1" stop-color="#101522"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><path d="M0 290L640 90V360H0Z" fill="hsl(${h},55%,18%)" opacity=".65"/><text x="320" y="185" font-size="32" fill="white" text-anchor="middle" font-family="Arial,sans-serif">${esc(g.name.slice(0,34))}</text><text x="320" y="225" font-size="16" fill="#d8d8e8" text-anchor="middle">GAMESCOPE</text></svg>`)};const cover=g=>g.image|| (STEAM_ART[g.id]? 'https://cdn.cloudflare.steamstatic.com/steam/apps/'+STEAM_ART[g.id]+'/header.jpg':fallbackCover(g));

const buildEstimate=d=>{
 if(!d||d.type!=='pc')return null;
 const cpu=DB.cpu(d.specs?.cpu),gpu=DB.gpu(d.specs?.gpu);
 if(!cpu||!gpu)return null;
 const cb={1:[25,45],2:[30,55],3:[40,70],4:[55,90],5:[70,120],6:[90,150],7:[120,190],8:[150,240],9:[190,320],10:[240,420]};
 const gb={1:[20,45],2:[30,60],3:[45,85],4:[70,125],5:[100,180],6:[150,260],7:[220,370],8:[300,520],9:[450,750],10:[650,1150]};
 const ram=Math.max(4,Number(d.specs?.ram)||8),storage=Math.max(0,Number(d.specs?.storage)||512);
 const c=cb[cpu.tier]||cb[5],g=gb[gpu.tier]||gb[5];
 const lo=c[0]+g[0]+Math.round(ram*7.8)+Math.round(storage/1024*46)+180;
 const hi=c[1]+g[1]+Math.round(ram*21.25)+Math.round(storage/1024*273)+350;
 return {min:Math.round(lo/10)*10,max:Math.round(hi/10)*10};
};
const fpsLabel=f=>f?'<p class="fps-est">≈ '+f.min+'–'+f.max+' FPS <small>'+t('fpsEstimate')+'</small></p>':'';
