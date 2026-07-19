/* =========================================================
   levels.js — Definisi 3 Stage (Part 1)
   ========================================================= */
const Levels = (() => {
  const GROUND_Y = 480; // posisi tanah default (disesuaikan canvas)

  function buildStage1(groundY) {
    const enemies = [];
    let x = 500;
    const seq = ['ayam','ayam','lubang','kambing','genangan','ayam','anjing','lubang','kambing','ayam','anjing'];
    seq.forEach(type => {
      const def = ENEMY_DEFS[type];
      enemies.push(new Enemy(type, x, groundY, def));
      x += Utils.randInt(220, 380);
    });
    const bossX = x + 300;
    const coins = [];
    for (let i = 0; i < 25; i++) coins.push({ x: 400 + i * 140 + Utils.randInt(-30,30), y: groundY - Utils.randInt(60,180), collected:false });
    return {
      id: 1, name: 'Guru WB', theme: 'desa', title: 'Perkampungan',
      length: bossX + 600, groundY, enemies, coins,
      boss: { type: 'anjing_besar', x: bossX, ...BOSS_DEFS.anjing_besar },
      rewardMin: 100, rewardMax: 250
    };
  }

  function buildStage2(groundY) {
    const enemies = [];
    let x = 500;
    const seq = ['ular','monyet','pohon','batu','ular','buaya','monyet','pohon','ular','buaya','batu','monyet'];
    seq.forEach(type => {
      const def = ENEMY_DEFS[type];
      enemies.push(new Enemy(type, x, groundY, def));
      x += Utils.randInt(220, 360);
    });
    const bossX = x + 300;
    const coins = [];
    for (let i = 0; i < 28; i++) coins.push({ x: 400 + i * 140 + Utils.randInt(-30,30), y: groundY - Utils.randInt(60,180), collected:false });
    return {
      id: 2, name: 'Guru P3K', theme: 'hutan', title: 'Hutan dan Sungai',
      length: bossX + 600, groundY, enemies, coins,
      boss: { type: 'buaya_besar', x: bossX, ...BOSS_DEFS.buaya_besar },
      rewardMin: 250, rewardMax: 450
    };
  }

  function buildStage3(groundY) {
    const enemies = [];
    let x = 500;
    const seq = ['orang_gila','lubang_jalan','polisi','kendaraan','lampu_merah','orang_gila','kendaraan','lubang_jalan','polisi','kendaraan','orang_gila'];
    seq.forEach(type => {
      const def = ENEMY_DEFS[type];
      enemies.push(new Enemy(type, x, groundY, def));
      x += Utils.randInt(220, 340);
    });
    const bossX = x + 300;
    const coins = [];
    for (let i = 0; i < 30; i++) coins.push({ x: 400 + i * 140 + Utils.randInt(-30,30), y: groundY - Utils.randInt(60,180), collected:false });
    return {
      id: 3, name: 'Guru PNS', theme: 'jalan', title: 'Jalan Raya menuju SD Negeri 1 Gerduren',
      length: bossX + 600, groundY, enemies, coins,
      boss: { type: 'debt_collector', x: bossX, ...BOSS_DEFS.debt_collector },
      rewardMin: 500, rewardMax: 1000
    };
  }

  function getStage(id, groundY = GROUND_Y) {
    if (id === 1) return buildStage1(groundY);
    if (id === 2) return buildStage2(groundY);
    if (id === 3) return buildStage3(groundY);
    return buildStage1(groundY);
  }

  return { getStage, GROUND_Y };
})();
