/* =========================================================
   utils.js — Fungsi bantu umum (matematika, random, storage)
   ========================================================= */
const Utils = (() => {
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function chance(percent) { return Math.random() * 100 < percent; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function formatNumber(n) {
    return Math.floor(n).toLocaleString('id-ID');
  }

  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  return { clamp, rand, randInt, chance, lerp, rectsOverlap, formatNumber, formatTime };
})();
