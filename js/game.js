/* =========================================================
   game.js — Inti permainan: loop utama, canvas, gameplay
   ========================================================= */
const Game = (() => {
  let canvas, ctx;
  let running = false;
  let paused = false;
  let lastTime = 0;

  let player, stage, camX = 0;
  let elapsedMs = 0;
  let jumpsThisStage = 0;
  let deathsThisStage = 0;
  let allEnemiesDefeatedFlag = true;
  let allCoinsFlag = true;
  let bossActive = false;
  let boss = null;
  let stageClearedOnce = false;
  let pendingStageId = 1;
  let selectedItemsForStage = {};
  let jumpCountTotal = 0;

  function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    Controls.init();
    UI.bindGlobalNav();
    bindStaticButtons();

    // Terapkan pengaturan tersimpan
    const s = SaveSystem.get().settings;
    AudioSys.setSfxEnabled(s.sfx);
    AudioSys.setMusicEnabled(s.music);

    // Splash screen
    document.getElementById('btn-start-splash').addEventListener('click', () => {
      AudioSys.ensureCtx();
      AudioSys.sfx.click();
      UI.show('menu', false);
      AudioSys.playMusic('menu');
    });
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function bindStaticButtons() {
    document.getElementById('btn-pause').addEventListener('click', () => togglePause(true));
    document.getElementById('btn-resume').addEventListener('click', () => togglePause(false));
    document.getElementById('btn-restart-stage').addEventListener('click', () => { togglePause(false); goToPreStage(stage.id); });
    document.getElementById('btn-quit-menu').addEventListener('click', () => { togglePause(false); stopGame(); UI.show('menu'); AudioSys.playMusic('menu'); });

    document.getElementById('btn-continue-revive').addEventListener('click', reviveContinue);
    document.getElementById('btn-gameover-restart').addEventListener('click', () => { hideOverlay('overlay-gameover'); goToPreStage(stage.id); });
    document.getElementById('btn-gameover-menu').addEventListener('click', () => { hideOverlay('overlay-gameover'); stopGame(); UI.show('menu'); AudioSys.playMusic('menu'); });

    document.getElementById('btn-next-stage').addEventListener('click', () => { hideOverlay('overlay-stageclear'); goToPreStage(stage.id + 1); });
    document.getElementById('btn-stageclear-menu').addEventListener('click', () => { hideOverlay('overlay-stageclear'); stopGame(); UI.show('menu'); AudioSys.playMusic('menu'); });

    document.getElementById('btn-enter-stage').addEventListener('click', enterStageFromPre);

    document.getElementById('btn-end-again').addEventListener('click', () => { hideOverlay('overlay-ending'); goToPreStage(1); });
    document.getElementById('btn-end-stages').addEventListener('click', () => { hideOverlay('overlay-ending'); stopGame(); UI.show('stage-select'); });
    document.getElementById('btn-end-menu').addEventListener('click', () => { hideOverlay('overlay-ending'); stopGame(); UI.show('menu'); AudioSys.playMusic('menu'); });
  }

  function hideOverlay(id) { document.getElementById(id).classList.add('hidden'); }
  function showOverlay(id) { document.getElementById(id).classList.remove('hidden'); }

  function togglePause(state) {
    paused = state;
    if (state) showOverlay('overlay-pause'); else hideOverlay('overlay-pause');
  }

  function startNewOrContinue(isContinue) {
    const data = SaveSystem.get();
    goToPreStage(isContinue ? (data.stageUnlocked || 1) : 1);
  }

  function goToPreStage(stageId) {
    if (stageId > 3) { pendingStageId = 3; }
    pendingStageId = Utils.clamp(stageId, 1, 3);
    const info = [
      { name: 'Guru WB', desc: 'Lokasi: Perkampungan. Musuh: ayam, kambing, lubang, genangan air, anjing liar. Boss: Anjing Liar Besar.' },
      { name: 'Guru P3K', desc: 'Lokasi: Hutan dan Sungai. Musuh: ular, monyet, pohon tumbang, batu, buaya. Boss: Buaya Besar.' },
      { name: 'Guru PNS', desc: 'Lokasi: Jalan Raya menuju SD Negeri 1 Gerduren. Musuh: orang gila, polisi, debt collector, kendaraan. Boss: Debt Collector.' },
    ][pendingStageId - 1];
    document.getElementById('pre-stage-title').textContent = `Stage ${pendingStageId} — ${info.name}`;
    document.getElementById('pre-stage-desc').textContent = info.desc;
    document.getElementById('pre-stage-gaji').textContent = Utils.formatNumber(SaveSystem.get().gajiGuru);
    renderPreStageItems();
    UI.show('pre-stage');
  }

  function renderPreStageItems() {
    const wrap = document.getElementById('pre-stage-items');
    wrap.innerHTML = '';
    const data = SaveSystem.get();
    selectedItemsForStage = {};
    Shop.ITEMS.forEach(it => {
      const owned = data.items[it.id] || 0;
      if (owned <= 0) return;
      const chip = document.createElement('div');
      chip.className = 'pre-item';
      chip.textContent = `${it.icon} ${it.name} (${owned})`;
      wrap.appendChild(chip);
    });
    if (wrap.innerHTML === '') wrap.innerHTML = '<div class="pre-item">Belum ada item. Beli di Shop!</div>';
  }

  function enterStageFromPre() {
    AudioSys.sfx.click();
    stopGame();
    stage = Levels.getStage(pendingStageId, Levels.GROUND_Y);
    const data = SaveSystem.get();
    player = new Player(100, stage.groundY - 60, data.upgrades);
    applyStartingItems(player);
    camX = 0;
    elapsedMs = 0;
    jumpsThisStage = 0;
    deathsThisStage = 0;
    bossActive = false;
    boss = null;
    stageClearedOnce = false;
    data.stats.playCount++;
    SaveSystem.persist();
    UI.show('game');
    resizeCanvas();
    running = true;
    paused = false;
    lastTime = performance.now();
    AudioSys.playMusic(stage.theme);
    requestAnimationFrame(loop);
  }

  function applyStartingItems(p) {
    const data = SaveSystem.get();
    // Revive token & shield otomatis aktif jika dimiliki (dipakai sebagai persiapan awal)
    if (data.items.shield > 0) { p.shieldActive = true; p.shieldTimer = 9999; }
  }

  function stopGame() {
    running = false;
    AudioSys.stopMusic();
  }

  function reviveContinue() {
    const data = SaveSystem.get();
    if ((data.items.revive || 0) > 0) {
      data.items.revive--;
      SaveSystem.persist();
      player.dead = false;
      player.hp = player.maxHp;
      player.invincible = 2;
      player.x = Math.max(50, camX);
      player.y = stage.groundY - player.h;
      player.vy = 0;
      hideOverlay('overlay-gameover');
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    } else {
      alert('Anda tidak memiliki Revive Token. Silakan Restart atau kembali ke Menu.');
    }
  }

  function loop(ts) {
    if (!running) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    if (!paused) update(dt);
    render();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    elapsedMs += dt * 1000;
    const inputRaw = Controls.get();
    Controls.consumeEdges();
    const input = Controls.get();

    if (input.pausePressed) togglePause(!paused);

    const prevJump = player.state;
    player.update(dt, input);
    if ((player.state === 'jump' || player.state === 'doubleJump') && prevJump !== player.state) {
      jumpsThisStage++; jumpCountTotal++;
    }

    // Batas kiri layar & tanah
    player.x = Math.max(player.x, camX + 10);
    if (player.y + player.h >= stage.groundY) {
      player.y = stage.groundY - player.h;
      if (player.vy > 0) player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    // Kamera mengikuti pemain
    const targetCam = player.x - window.innerWidth * 0.35;
    camX = Utils.clamp(Utils.lerp(camX, targetCam, 0.1), 0, Math.max(0, stage.length - window.innerWidth));

    // Update koin
    stage.coins.forEach(c => {
      if (c.collected) return;
      const magnetRange = player.magnetTimer > 0 ? 180 : 36;
      const dx = (c.x) - (player.x + player.w/2);
      const dy = (c.y) - (player.y + player.h/2);
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < magnetRange) {
        if (dist < 30) {
          c.collected = true;
          const mult = player.doubleCoinTimer > 0 ? 2 : 1;
          const luckBonus = Utils.chance(player.luck * 3) ? 2 : 1;
          SaveSystem.addGaji(5 * mult * luckBonus);
          SaveSystem.get().stats.totalCoinsCollected++;
          SaveSystem.addExp(2);
          AudioSys.sfx.coin();
        } else {
          c.x = Utils.lerp(c.x, player.x, 0.3);
          c.y = Utils.lerp(c.y, player.y, 0.3);
        }
      }
    });

    // Update musuh reguler
    if (!bossActive) {
      stage.enemies.forEach(e => {
        e.update(dt);
        if (e.dead) return;
        if (Utils.rectsOverlap(player.rect, e.rect)) {
          if (e.isHazard || e.static) {
            player.takeDamage(e.damage);
          } else {
            // Serang balik jika pemain menyerang (aksi/dash/lompat di atas musuh)
            const stomping = player.vy > 0 && (player.y + player.h) < (e.y + e.h * 0.6);
            if (stomping || Controls.get().actionPressed || player.isDashing) {
              const killed = e.hit(player.power);
              if (killed) {
                SaveSystem.addGaji(e.scoreValue);
                SaveSystem.addExp(5);
              }
              if (stomping) player.vy = -300;
            } else {
              player.takeDamage(e.damage);
            }
          }
        }
      });

      // Cek apakah semua musuh non-hazard sudah tumbang & semua koin diambil, lalu mulai boss saat mendekat
      if (!bossActive && camX + window.innerWidth > stage.boss.x - 200) {
        startBoss();
      }
    } else if (boss) {
      boss.update(dt);
      if (!boss.dead) {
        if (Utils.rectsOverlap(player.rect, boss.rect)) {
          const stomping = player.vy > 0 && (player.y + player.h) < (boss.y + boss.h * 0.5);
          if (stomping || Controls.get().actionPressed || player.isDashing) {
            boss.hit(player.power * 1.2);
            if (stomping) player.vy = -300;
          } else if (boss.isAttacking() || Utils.chance(20)) {
            player.takeDamage(boss.damage);
          }
        }
        if (boss.isAttacking() && !Utils.rectsOverlap(player.rect, boss.rect)) {
          // serangan area kecil di sekitar boss
        }
      } else if (!stageClearedOnce) {
        onStageClear();
      }
    }

    if (player.dead) {
      onPlayerDeath();
    }

    UI.updateHUD(player, stage, elapsedMs, camX);
  }

  function startBoss() {
    bossActive = true;
    boss = new Boss(stage.boss.type, stage.boss.x, stage.groundY, stage.boss);
    AudioSys.playMusic('boss');
    AudioSys.sfx.boss();
  }

  function onPlayerDeath() {
    deathsThisStage++;
    SaveSystem.get().stats.totalDeaths++;
    SaveSystem.persist();
    running = false;
    setTimeout(() => showOverlay('overlay-gameover'), 400);
  }

  function onStageClear() {
    stageClearedOnce = true;
    running = false;
    allEnemiesDefeatedFlag = stage.enemies.every(e => e.dead || e.isHazard || e.static);
    allCoinsFlag = stage.coins.every(c => c.collected);
    const noDeath = deathsThisStage === 0;
    const fastTime = elapsedMs < 90000;

    let bonus = 0;
    if (noDeath) bonus += 40;
    if (allEnemiesDefeatedFlag) bonus += 40;
    if (allCoinsFlag) bonus += 60;
    if (fastTime) bonus += 30;

    const baseReward = Utils.randInt(stage.rewardMin, stage.rewardMax);
    const totalReward = baseReward + bonus;
    SaveSystem.addGaji(totalReward);
    SaveSystem.addExp(50);
    SaveSystem.unlockStage(stage.id + 1);
    const data = SaveSystem.get();
    if (totalReward + data.highScore === data.highScore) {} // no-op guard
    data.highScore = Math.max(data.highScore, data.gajiGuru);
    SaveSystem.persist();

    if (fastTime) Achievements.unlock('tepat_waktu');
    if (jumpCountTotal >= 50) Achievements.unlock('raja_platform');
    if (noDeath) Achievements.unlock('anti_jatuh');
    if (allCoinsFlag) Achievements.unlock('pemburu_koin');
    if (allEnemiesDefeatedFlag) Achievements.unlock('guru_teladan');

    if (stage.id === 3) {
      Achievements.unlock('sang_petualang');
      setTimeout(playEnding, 300);
      return;
    }

    document.getElementById('stageclear-rewards').innerHTML =
      `🪙 +${Utils.formatNumber(totalReward)} Gaji Guru<br/>⭐ +50 EXP` +
      (bonus > 0 ? `<br/><small>Termasuk bonus stage: +${bonus}</small>` : '');
    AudioSys.stopMusic();
    AudioSys.sfx.win();
    player.celebrate();
    setTimeout(() => showOverlay('overlay-stageclear'), 500);
  }

  function playEnding() {
    AudioSys.stopMusic();
    AudioSys.playMusic('win');
    showOverlay('overlay-ending');
    const confettiWrap = document.getElementById('ending-confetti');
    UI.spawnConfetti(confettiWrap);
    document.getElementById('ending-welcome').classList.add('hidden');
    document.getElementById('ending-thanks').classList.add('hidden');
    setTimeout(() => {
      document.getElementById('ending-welcome').classList.remove('hidden');
      AudioSys.sfx.cheer();
    }, 1200);
    setTimeout(() => {
      document.getElementById('ending-thanks').classList.remove('hidden');
    }, 3200);
  }

  function render() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    Assets.drawBackground(ctx, w, h, camX, stage.theme);

    // Tanah
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(0, stage.groundY, w, h - stage.groundY);
    ctx.fillStyle = '#4a7c2f';
    ctx.fillRect(0, stage.groundY, w, 8);

    // Koin
    stage.coins.forEach(c => {
      if (c.collected) return;
      const sx = c.x - camX;
      if (sx < -20 || sx > w + 20) return;
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath(); ctx.arc(sx, c.y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#a8700a'; ctx.lineWidth = 2; ctx.stroke();
    });

    // Musuh
    if (!bossActive) {
      stage.enemies.forEach(e => e.render(ctx, camX));
    } else if (boss) {
      boss.render(ctx, camX);
    }

    // Pemain
    player.render(ctx, camX);
  }

  return { init, startNewOrContinue, goToPreStage };
})();

window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
