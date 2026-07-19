/* =========================================================
   shop.js — Toko: kendaraan, upgrade permanen, dan item
   ========================================================= */
const Shop = (() => {
  const VEHICLES = [
    { id: 'jalan_kaki', name: 'Jalan Kaki', price: 0, speed: 1, accel: 1, handling: 1, durability: 1 },
    { id: 'sepeda', name: 'Sepeda', price: 200, speed: 1.15, accel: 1.05, handling: 1.1, durability: 1.0 },
    { id: 'sepeda_listrik', name: 'Sepeda Listrik', price: 500, speed: 1.3, accel: 1.2, handling: 1.15, durability: 1.05 },
    { id: 'motor_bebek', name: 'Motor Bebek', price: 1200, speed: 1.5, accel: 1.35, handling: 1.2, durability: 1.15 },
    { id: 'motor_trail', name: 'Motor Trail', price: 2500, speed: 1.75, accel: 1.5, handling: 1.4, durability: 1.3 },
  ];

  const UPGRADES = [
    { id: 'health', name: 'Health ❤️', desc: 'Menambah HP maksimum', maxLevel: 5, baseCost: 150, costGrowth: 1.4 },
    { id: 'stamina', name: 'Stamina ⚡', desc: 'Menambah durasi sprint/dash/lompat', maxLevel: 5, baseCost: 150, costGrowth: 1.4 },
    { id: 'speed', name: 'Speed 💨', desc: 'Meningkatkan kecepatan jalan/lari/kendaraan', maxLevel: 5, baseCost: 180, costGrowth: 1.4 },
    { id: 'power', name: 'Power 💪', desc: 'Meningkatkan damage & dorongan', maxLevel: 5, baseCost: 180, costGrowth: 1.4 },
    { id: 'defense', name: 'Defense 🛡', desc: 'Mengurangi damage yang diterima', maxLevel: 5, baseCost: 200, costGrowth: 1.4 },
    { id: 'luck', name: 'Luck 🍀', desc: 'Peluang bonus Gaji Guru / item langka', maxLevel: 5, baseCost: 200, costGrowth: 1.4 },
  ];

  const ITEMS = [
    { id: 'p3k', name: 'Kotak P3K', desc: 'Memulihkan 2 HP', price: 60, icon: '🩹' },
    { id: 'energi', name: 'Minuman Energi', desc: 'Mengisi penuh stamina', price: 40, icon: '🥤' },
    { id: 'shield', name: 'Shield', desc: 'Kebal 1x serangan', price: 80, icon: '🛡' },
    { id: 'magnet', name: 'Magnet Coin', desc: 'Menarik koin di sekitar selama 15 detik', price: 70, icon: '🧲' },
    { id: 'double_coin', name: 'Double Coin', desc: 'Gaji Guru x2 selama 20 detik', price: 90, icon: '💰' },
    { id: 'peluit', name: 'Peluit Pengusir Anjing', desc: 'Mengusir anjing di sekitar', price: 50, icon: '📯' },
    { id: 'revive', name: 'Revive Token', desc: 'Hidup kembali otomatis saat kalah', price: 150, icon: '💎' },
  ];

  function upgradeCost(def, currentLevel) {
    return Math.round(def.baseCost * Math.pow(def.costGrowth, currentLevel));
  }

  function buyVehicle(id) {
    const data = SaveSystem.get();
    const v = VEHICLES.find(v => v.id === id);
    if (!v) return { ok: false, msg: 'Kendaraan tidak ditemukan' };
    if (data.vehicles.owned.includes(id)) return { ok: false, msg: 'Sudah dimiliki' };
    if (!SaveSystem.spendGaji(v.price)) return { ok: false, msg: 'Gaji Guru tidak cukup' };
    data.vehicles.owned.push(id);
    SaveSystem.persist();
    return { ok: true };
  }

  function selectVehicle(id) {
    const data = SaveSystem.get();
    if (!data.vehicles.owned.includes(id)) return { ok: false, msg: 'Belum dimiliki' };
    data.vehicles.active = id;
    SaveSystem.persist();
    return { ok: true };
  }

  function buyUpgrade(id) {
    const data = SaveSystem.get();
    const def = UPGRADES.find(u => u.id === id);
    if (!def) return { ok: false, msg: 'Upgrade tidak ditemukan' };
    const lvl = data.upgrades[id] || 0;
    if (lvl >= def.maxLevel) return { ok: false, msg: 'Sudah maksimal' };
    const cost = upgradeCost(def, lvl);
    if (!SaveSystem.spendGaji(cost)) return { ok: false, msg: 'Gaji Guru tidak cukup' };
    data.upgrades[id] = lvl + 1;
    SaveSystem.persist();
    return { ok: true };
  }

  function buyItem(id) {
    const data = SaveSystem.get();
    const def = ITEMS.find(i => i.id === id);
    if (!def) return { ok: false, msg: 'Item tidak ditemukan' };
    if (!SaveSystem.spendGaji(def.price)) return { ok: false, msg: 'Gaji Guru tidak cukup' };
    data.items[id] = (data.items[id] || 0) + 1;
    SaveSystem.persist();
    return { ok: true };
  }

  return { VEHICLES, UPGRADES, ITEMS, upgradeCost, buyVehicle, selectVehicle, buyUpgrade, buyItem };
})();
