/* =========================================================
   ui.js — Navigasi layar/menu & sinkronisasi tampilan data
   ========================================================= */
const UI = (() => {
  let currentScreen = 'splash';
  const history = [];

  function show(name, push = true) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
    if (push && currentScreen !== name) history.push(currentScreen);
    currentScreen = name;
    if (name === 'menu') refreshMenu();
    if (name === 'stage-select') refreshStageSelect();
    if (name === 'shop') refreshShop();
    if (name === 'achievements') refreshAchievements();
    if (name === 'stats') refreshStats();
    if (name === 'settings') refreshSettings();
  }

  function back() {
    const prev = history.pop() || 'menu';
    show(prev, false);
  }

  function refreshMenu() {
    document.getElementById('menu-gaji').textContent = Utils.formatNumber(SaveSystem.get().gajiGuru);
  }

  function refreshStageSelect() {
    const data = SaveSystem.get();
    const stages = [
      { id: 1, name: 'Guru WB', title: 'Perkampungan' },
      { id: 2, name: 'Guru P3K', title: 'Hutan dan Sungai' },
      { id: 3, name: 'Guru PNS', title: 'Jalan Raya menuju SD Negeri 1 Gerduren' },
    ];
    const wrap = document.getElementById('stage-list');
    wrap.innerHTML = '';
    stages.forEach(s => {
      const locked = s.id > data.stageUnlocked;
      const card = document.createElement('div');
      card.className = 'stage-card' + (locked ? ' locked' : '');
      card.innerHTML = `<div><strong>Stage ${s.id}: ${s.name}</strong><br/><small>${s.title}</small></div>`;
      const btn = document.createElement('button');
      btn.textContent = locked ? '🔒' : '▶';
      btn.disabled = locked;
      btn.onclick = () => { AudioSys.sfx.click(); Game.goToPreStage(s.id); };
      card.appendChild(btn);
      wrap.appendChild(card);
    });
  }

  function refreshShop() {
    document.getElementById('shop-gaji').textContent = Utils.formatNumber(SaveSystem.get().gajiGuru);
    renderVehicles();
    renderUpgrades();
    renderItems();
  }

  function renderVehicles() {
    const data = SaveSystem.get();
    const wrap = document.getElementById('shop-vehicles');
    wrap.innerHTML = '';
    Shop.VEHICLES.forEach(v => {
      const owned = data.vehicles.owned.includes(v.id);
      const active = data.vehicles.active === v.id;
      const row = document.createElement('div');
      row.className = 'shop-item';
      row.innerHTML = `<div class="info"><strong>${v.name}</strong><small>Speed x${v.speed.toFixed(2)} · Handling x${v.handling.toFixed(2)}</small></div>`;
      const btn = document.createElement('button');
      if (active) { btn.textContent = 'Aktif'; btn.classList.add('active-vehicle'); btn.disabled = true; }
      else if (owned) { btn.textContent = 'Pakai'; btn.onclick = () => { Shop.selectVehicle(v.id); AudioSys.sfx.click(); refreshShop(); }; }
      else { btn.textContent = `🪙 ${v.price}`; btn.onclick = () => { const r = Shop.buyVehicle(v.id); AudioSys.sfx.click(); if (r.ok) refreshShop(); else alert(r.msg); }; }
      row.appendChild(btn);
      wrap.appendChild(row);
    });
  }

  function renderUpgrades() {
    const data = SaveSystem.get();
    const wrap = document.getElementById('shop-upgrades');
    wrap.innerHTML = '';
    Shop.UPGRADES.forEach(u => {
      const lvl = data.upgrades[u.id] || 0;
      const maxed = lvl >= u.maxLevel;
      const cost = Shop.upgradeCost(u, lvl);
      const row = document.createElement('div');
      row.className = 'shop-item';
      row.innerHTML = `<div class="info"><strong>${u.name} — Lv.${lvl}/${u.maxLevel}</strong><small>${u.desc}</small></div>`;
      const btn = document.createElement('button');
      btn.textContent = maxed ? 'MAX' : `🪙 ${cost}`;
      btn.disabled = maxed;
      btn.onclick = () => { const r = Shop.buyUpgrade(u.id); AudioSys.sfx.click(); if (r.ok) refreshShop(); else alert(r.msg); };
      row.appendChild(btn);
      wrap.appendChild(row);
    });
  }

  function renderItems() {
    const data = SaveSystem.get();
    const wrap = document.getElementById('shop-items');
    wrap.innerHTML = '';
    Shop.ITEMS.forEach(it => {
      const owned = data.items[it.id] || 0;
      const row = document.createElement('div');
      row.className = 'shop-item';
      row.innerHTML = `<div class="info"><strong>${it.icon} ${it.name} (${owned})</strong><small>${it.desc}</small></div>`;
      const btn = document.createElement('button');
      btn.textContent = `🪙 ${it.price}`;
      btn.onclick = () => { const r = Shop.buyItem(it.id); AudioSys.sfx.click(); if (r.ok) refreshShop(); else alert(r.msg); };
      row.appendChild(btn);
      wrap.appendChild(row);
    });
  }

  function refreshAchievements() {
    const wrap = document.getElementById('achievement-list');
    wrap.innerHTML = '';
    Achievements.LIST.forEach(a => {
      const unlocked = Achievements.isUnlocked(a.id);
      const row = document.createElement('div');
      row.className = 'ach-item' + (unlocked ? '' : ' locked');
      row.innerHTML = `<div class="ico">${a.icon}</div><div><strong>${a.name}</strong><br/><small>${a.desc}</small></div>`;
      wrap.appendChild(row);
    });
  }

  function refreshStats() {
    const data = SaveSystem.get();
    const wrap = document.getElementById('stats-content');
    const rows = [
      ['Total Gaji Guru', Utils.formatNumber(data.gajiGuru)],
      ['Level', data.level],
      ['EXP', data.exp],
      ['Stage Terbuka', data.stageUnlocked],
      ['High Score', Utils.formatNumber(data.highScore)],
      ['Total Bermain', data.stats.playCount],
      ['Total Koin Dikumpulkan', data.stats.totalCoinsCollected],
      ['Total Kematian', data.stats.totalDeaths],
      ['Achievement', `${data.achievements.length}/${Achievements.LIST.length}`],
    ];
    wrap.innerHTML = rows.map(r => `<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join('');
  }

  function refreshSettings() {
    const s = SaveSystem.get().settings;
    document.getElementById('opt-sfx').checked = s.sfx;
    document.getElementById('opt-music').checked = s.music;
    document.getElementById('opt-vibrate').checked = s.vibrate;
  }

  function bindGlobalNav() {
    document.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', () => { AudioSys.sfx.click(); show(btn.dataset.back, false); });
    });
    document.querySelectorAll('.btn-menu[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioSys.sfx.click();
        const action = btn.dataset.action;
        if (action === 'play') Game.startNewOrContinue(false);
        else if (action === 'continue') Game.startNewOrContinue(true);
        else if (action === 'stage-select') show('stage-select');
        else if (action === 'shop') show('shop');
        else if (action === 'achievements') show('achievements');
        else if (action === 'stats') show('stats');
        else if (action === 'settings') show('settings');
        else if (action === 'about') show('about');
        else if (action === 'credits') show('credits');
      });
    });
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.shop-panel').forEach(p => p.classList.add('hidden'));
        document.getElementById('shop-' + tab.dataset.tab).classList.remove('hidden');
      });
    });
    document.getElementById('opt-sfx').addEventListener('change', e => {
      SaveSystem.get().settings.sfx = e.target.checked; SaveSystem.persist(); AudioSys.setSfxEnabled(e.target.checked);
    });
    document.getElementById('opt-music').addEventListener('change', e => {
      SaveSystem.get().settings.music = e.target.checked; SaveSystem.persist(); AudioSys.setMusicEnabled(e.target.checked);
    });
    document.getElementById('opt-vibrate').addEventListener('change', e => {
      SaveSystem.get().settings.vibrate = e.target.checked; SaveSystem.persist();
    });
    document.getElementById('btn-reset-save').addEventListener('click', () => {
      if (confirm('Hapus semua progres? Tindakan ini tidak dapat dibatalkan.')) {
        SaveSystem.reset();
        refreshSettings();
        alert('Progres telah dihapus.');
      }
    });
  }

  function updateHUD(player, stage, elapsedMs, camX) {
    const heartsEl = document.getElementById('hud-hearts');
    let hearts = '';
    for (let i = 0; i < player.maxHp; i++) hearts += i < player.hp ? '❤️' : '🖤';
    heartsEl.textContent = hearts;
    document.getElementById('hud-stage').textContent = `Stage ${stage.id}: ${stage.name}`;
    document.getElementById('hud-coin').textContent = Utils.formatNumber(SaveSystem.get().gajiGuru);
    document.getElementById('hud-timer').textContent = Utils.formatTime(elapsedMs);
    const data = SaveSystem.get();
    const expPct = Utils.clamp((data.exp / (data.level * 150)) * 100, 0, 100);
    document.getElementById('hud-exp-bar').style.width = expPct + '%';
    const progressPct = Utils.clamp((camX / stage.length) * 100, 0, 100);
    document.getElementById('hud-progress-bar').style.width = progressPct + '%';
    document.getElementById('hud-stamina-bar').style.width = Utils.clamp((player.stamina/player.staminaMax)*100,0,100) + '%';
  }

  function spawnConfetti(container) {
    const colors = ['#ffd54f','#e53935','#43a047','#1e88e5','#fff'];
    container.innerHTML = '';
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Utils.rand(0, 100) + '%';
      p.style.background = colors[Utils.randInt(0, colors.length - 1)];
      p.style.animationDuration = Utils.rand(2, 4) + 's';
      p.style.animationDelay = Utils.rand(0, 1.5) + 's';
      container.appendChild(p);
    }
  }

  return { show, back, refreshMenu, refreshStageSelect, refreshShop, refreshAchievements,
    refreshStats, refreshSettings, bindGlobalNav, updateHUD, spawnConfetti };
})();
