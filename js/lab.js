// GameScope Lab and DviseScope
const dvBoardFor = cpu => {
  const name = String(cpu?.name || '');
  const intel = name.match(/i[3579]-(\\d{4,5})/i);
  const ryzen = name.match(/Ryzen\\s+[3579]\\s+(\\d{4})/i);
  if (/Core Ultra/i.test(name)) return 'Intel B860 / Z890 class';
  if (intel) {
    const generation = Number(intel[1].length === 5 ? intel[1].slice(0, 2) : intel[1][0]);
    if (generation >= 12) return 'Intel B760 / Z790 class';
    if (generation >= 10) return 'Intel B560 / Z590 class';
    if (generation >= 8) return 'Intel B365 / Z390 class';
    return 'Verify exact Intel socket';
  }
  if (ryzen) return Number(ryzen[1][0]) >= 7 ? 'AMD AM5 B650 / B850 class' : 'AMD AM4 B450 / B550 class';
  return 'Match board to exact CPU socket';
};
const dvPsuFor = tier => tier >= 10 ? '850–1000W' : tier >= 9 ? '750–850W' : tier >= 8 ? '650–750W' : tier >= 7 ? '600–650W' : tier >= 5 ? '550–600W' : '450–550W';
const dvHasPcRequirements = game => {
  if (!game || !Array.isArray(game.platforms) || !game.platforms.includes('pc') || !game.pc) return false;
  const min = game.pc.min || {}, rec = game.pc.rec || {};
  return ['cpu', 'gpu'].some(key => Number(rec[key] ?? min[key] ?? 0) > 0);
};
const dvRequirement = (game, key) => {
  const min = Number(game.pc?.min?.[key] || 0);
  const recommended = Number(game.pc?.rec?.[key] || 0);
  return Math.max(min, recommended);
};
const dvSpread = (items, index) => {
  if (!items.length) return null;
  return items[Math.round(index * (items.length - 1) / 4)];
};

PAGES.lab = () => {
  const device = typeof activeDev === 'function' ? activeDev() : null;
  view(`<section class="hero"><span class="badge mute">GameScope Lab</span><h1>${t('lab')}</h1><p class="mut">${t('labIntro')}</p></section>
    <div class="lab-grid">
      <a class="card lab-tile" href="#find"><span>🎯</span><h2>${t('labCompatibility')}</h2><p>${device ? esc(device.name) : t('chooseDevice')}</p><b>${t('find')} →</b></a>
      <a class="card lab-tile" href="#dvisescope"><span>🧩</span><h2>DviseScope</h2><p>${t('labBuilds')}</p><b>${t('dvGenerate')} →</b></a>
    </div><p class="banner">${t('labNote')}</p>`);
};

PAGES.dvisescope = () => {
  const games = DB.games.filter(dvHasPcRequirements).slice().sort((a, b) => a.name.localeCompare(b.name));
  view(`<div class="dv-page">
    <a class="mut dv-back" href="#lab">← ${t('lab')}</a>
    <h1>${t('dvTitle')}</h1><p class="mut">${t('dvIntro')}</p>
    <form data-form="dvisescope" class="dv-form">
      <label>${t('dvSearch')}<input id="dv-game-search" type="search" placeholder="${t('dvSearchPlaceholder')}" autocomplete="off"></label>
      <div class="dv-selection-head"><b>${t('dvGames')}</b><span class="badge mute"><strong id="dv-selected-count">0</strong> / 10</span></div>
      <p class="mut" id="dv-selection-help">${t('dvSelectHelp')}</p>
      <div id="dv-game-list" class="dv-game-list">
        ${games.map(game => `<label class="dv-game-option" data-name="${esc(game.name.toLocaleLowerCase())}">
          <input type="checkbox" name="games" value="${esc(game.id)}">
          <span>${esc(game.name)}</span><small>${esc(game.genre || 'PC')}</small>
        </label>`).join('')}
      </div>
      <p class="mut" id="dv-no-games" hidden>${t('dvNoSearchResults')}</p>
      <label>${t('dvResolution')}<select name="resolution"><option value="1920x1080">1080p</option><option value="2560x1440">1440p</option><option value="3840x2160">4K</option></select></label>
      <button id="dv-submit" class="btn pri" type="submit" disabled>${t('dvGenerate')}</button>
    </form>
    <div id="dv-results" aria-live="polite"></div>
    <p class="banner">${t('dvOfficial')} ${t('dvGtaNotice')}</p>
  </div>`);

  const list = document.querySelector('#dv-game-list');
  const search = document.querySelector('#dv-game-search');
  const submit = document.querySelector('#dv-submit');
  const count = document.querySelector('#dv-selected-count');
  const noGames = document.querySelector('#dv-no-games');
  if (!list || !search || !submit || !count) return;

  const update = () => {
    const boxes = [...list.querySelectorAll('input[name="games"]')];
    const selected = boxes.filter(box => box.checked).length;
    count.textContent = String(selected);
    boxes.forEach(box => { box.disabled = !box.checked && selected >= 10; });
    submit.disabled = selected !== 10;
    submit.textContent = selected === 10 ? t('dvGenerate') : t('dvChooseRemaining').replace('{count}', String(10 - selected));
    const visible = [...list.querySelectorAll('.dv-game-option')].some(option => !option.hidden);
    if (noGames) noGames.hidden = visible;
  };

  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    list.querySelectorAll('.dv-game-option').forEach(option => {
      option.hidden = !option.dataset.name.includes(query);
    });
    update();
  });
  list.addEventListener('change', update);
  update();
};

FORMS.dvisescope = formData => {
  const ids = formData.getAll('games').map(String);
  const output = document.querySelector('#dv-results');
  if (!output) return;
  if (ids.length !== 10 || new Set(ids).size !== 10) {
    output.innerHTML = empty(t('dvNeedTen'));
    return;
  }

  const selectedGames = ids.map(id => DB.games.find(game => game.id === id)).filter(Boolean);
  if (selectedGames.length !== 10 || selectedGames.some(game => !dvHasPcRequirements(game))) {
    output.innerHTML = empty(t('dvInvalidSelection'));
    return;
  }

  const requirements = selectedGames.reduce((totals, game) => {
    ['cpu', 'gpu', 'vram', 'ram', 'storage'].forEach(key => {
      totals[key] = Math.max(totals[key], dvRequirement(game, key));
    });
    return totals;
  }, { cpu: 1, gpu: 1, vram: 0, ram: 8, storage: 0 });

  const resolution = String(formData.get('resolution') || '1920x1080');
  const resolutionBoost = resolution === '3840x2160' ? 2 : resolution === '2560x1440' ? 1 : 0;
  const requiredGpuTier = Math.min(10, requirements.gpu + resolutionBoost);
  const gpuCandidates = DB.gpus
    .filter(gpu => Number.isFinite(Number(gpu.tier)) && Number(gpu.tier) >= requiredGpuTier && Number(gpu.vram || 0) >= requirements.vram)
    .sort((a, b) => Number(a.tier) - Number(b.tier) || Number(a.vram || 0) - Number(b.vram || 0));
  const cpuCandidates = DB.cpus
    .filter(cpu => Number.isFinite(Number(cpu.tier)) && Number(cpu.tier) >= requirements.cpu)
    .sort((a, b) => Number(a.tier) - Number(b.tier));

  if (!gpuCandidates.length || !cpuCandidates.length) {
    output.innerHTML = empty(t('dvInsufficient'));
    return;
  }

  const ramOptions = [16, 32, 32, 64, 64].map(value => Math.max(value, Math.ceil(requirements.ram / 8) * 8));
  const builds = Array.from({ length: 5 }, (_, index) => ({
    gpu: dvSpread(gpuCandidates, index),
    cpu: dvSpread(cpuCandidates, index),
    ram: ramOptions[index]
  }));

  output.innerHTML = `<h2>${t('dvMatched')} (10/10)</h2>
    <div class="dv-picked-games">${selectedGames.map(game => `<span class="badge mute">${esc(game.name)}</span>`).join(' ')}</div>
    <p class="mut">${t('dvBased')} · CPU ${requirements.cpu}/10 · GPU ${requirements.gpu}/10 (+${resolutionBoost}) · VRAM ≥ ${requirements.vram} GB · RAM ≥ ${requirements.ram} GB · ${resolution}</p>
    <div class="grid build-grid">${builds.map((build, index) => `<article class="card cb">
      <span class="badge ${index === 0 ? 'ok' : 'mute'}">${t('dvBuild')} #${index + 1}</span>
      <h3>${t('dvTier')} ${build.gpu.tier}/10</h3>
      <p><b>${t('dvCPU')}:</b><br>${esc(build.cpu.name)}</p>
      <p><b>${t('dvGPU')}:</b><br>${esc(build.gpu.name)}</p>
      <p><b>${t('dvRAM')}:</b> ${build.ram} GB</p>
      <p><b>${t('dvVRAM')}:</b> ${Number(build.gpu.vram || 0)} GB</p>
      <p><b>${t('dvBoard')}:</b><br>${esc(dvBoardFor(build.cpu))}</p>
      <p><b>${t('dvPSU')}:</b> ${dvPsuFor(Number(build.gpu.tier))}</p>
      <p><b>${t('dvStorage')}:</b> ${Math.max(500, Math.ceil(requirements.storage / 500) * 500)} GB SSD</p>
      <p><b>${t('dvCase')}:</b> ${t('dvAirflowCase')}</p>
    </article>`).join('')}</div>
    <p class="mut">${t('dvBuildCaution')}</p>`;
};
