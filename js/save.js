/* =========================================================
   save.js — Sistem penyimpanan progres via Local Storage
   Semua data bersifat permanen (Gaji Guru selalu akumulatif)
   ========================================================= */
const SaveSystem = (() => {
  const KEY = 'mykisah_save_v1';

  function defaultData() {
    return {
      gajiGuru: 0,           // mata uang, permanen & akumulatif
      exp: 0,
      level: 1,
      upgrades: { health: 0, stamina: 0, speed: 0, power: 0, defense: 0, luck: 0 },
      vehicles: { owned: ['jalan_kaki'], active: 'jalan_kaki' },
      items: {},              // inventori item konsumsi
      achievements: [],
      stageUnlocked: 1,
      highScore: 0,
      settings: { sfx: true, music: true, vibrate: true },
      stats: { playCount: 0, totalCoinsCollected: 0, totalDeaths: 0, bestTime: {} }
    };
  }

  let data = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultData();
      const parsed = JSON.parse(raw);
      // gabungkan dengan default agar field baru tetap ada
      return Object.assign(defaultData(), parsed);
    } catch (e) {
      console.warn('Save rusak, membuat baru.', e);
      return defaultData();
    }
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Gagal menyimpan progres:', e);
    }
  }

  function get() { return data; }

  function addGaji(amount) {
    data.gajiGuru = Math.max(0, data.gajiGuru + Math.floor(amount));
    persist();
    return data.gajiGuru;
  }

  function spendGaji(amount) {
    if (data.gajiGuru < amount) return false;
    data.gajiGuru -= amount;
    persist();
    return true;
  }

  function addExp(amount) {
    data.exp += amount;
    const need = data.level * 150;
    let leveledUp = false;
    while (data.exp >= data.level * 150) {
      data.exp -= data.level * 150;
      data.level++;
      leveledUp = true;
    }
    persist();
    return leveledUp;
  }

  function unlockAchievement(id) {
    if (!data.achievements.includes(id)) {
      data.achievements.push(id);
      persist();
      return true;
    }
    return false;
  }

  function unlockStage(n) {
    if (n > data.stageUnlocked) {
      data.stageUnlocked = n;
      persist();
    }
  }

  function reset() {
    data = defaultData();
    persist();
  }

  return { get, persist, addGaji, spendGaji, addExp, unlockAchievement, unlockStage, reset };
})();
