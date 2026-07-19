/* =========================================================
   achievements.js — Daftar & pemeriksaan pencapaian
   ========================================================= */
const Achievements = (() => {
  const LIST = [
    { id: 'tepat_waktu', icon: '🏅', name: 'Guru Tepat Waktu', desc: 'Selesaikan sebuah stage dalam waktu cepat' },
    { id: 'raja_platform', icon: '🏅', name: 'Raja Platform', desc: 'Lakukan 50 lompatan total' },
    { id: 'anti_jatuh', icon: '🏅', name: 'Anti Jatuh', desc: 'Selesaikan stage tanpa mati' },
    { id: 'pemburu_koin', icon: '🏅', name: 'Pemburu Koin', desc: 'Kumpulkan semua koin di satu stage' },
    { id: 'guru_teladan', icon: '🏅', name: 'Guru Teladan', desc: 'Kalahkan semua musuh di satu stage' },
    { id: 'sang_petualang', icon: '🏅', name: 'Sang Petualang', desc: 'Tamatkan Part 1 (kalahkan Debt Collector)' },
  ];

  function unlock(id, onUnlock) {
    if (SaveSystem.unlockAchievement(id)) {
      if (typeof onUnlock === 'function') onUnlock(LIST.find(a => a.id === id));
      return true;
    }
    return false;
  }

  function isUnlocked(id) {
    return SaveSystem.get().achievements.includes(id);
  }

  return { LIST, unlock, isUnlocked };
})();
