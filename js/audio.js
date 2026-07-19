/* =========================================================
   audio.js — Efek suara & musik disintesis via Web Audio API
   (tidak butuh file .mp3/.wav eksternal ataupun CDN)
   ========================================================= */
const AudioSys = (() => {
  let ctx = null;
  let musicTimer = null;
  let enabled = true;
  let musicEnabled = true;

  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function beep(freq, duration, type = 'square', vol = 0.15, delay = 0) {
    if (!enabled) return;
    try {
      const c = ensureCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      osc.connect(gain);
      gain.connect(c.destination);
      const t0 = c.currentTime + delay;
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
      osc.start(t0);
      osc.stop(t0 + duration);
    } catch (e) { /* audio tidak tersedia, abaikan */ }
  }

  const sfx = {
    step: () => beep(120, 0.05, 'square', 0.05),
    jump: () => beep(400, 0.12, 'triangle', 0.12),
    coin: () => { beep(800, 0.08, 'square', 0.1); beep(1200, 0.08, 'square', 0.08, 0.06); },
    hurt: () => beep(140, 0.2, 'sawtooth', 0.15),
    enemyHit: () => beep(220, 0.1, 'square', 0.12),
    boss: () => beep(80, 0.4, 'sawtooth', 0.2),
    win: () => { beep(523,0.15); beep(659,0.15,'square',0.15,0.15); beep(784,0.25,'square',0.15,0.3); },
    gameover: () => { beep(300,0.2,'sawtooth',0.15); beep(200,0.3,'sawtooth',0.15,0.2); },
    click: () => beep(500, 0.05, 'square', 0.08),
    cheer: () => { for(let i=0;i<4;i++) beep(600+i*80,0.1,'square',0.08,i*0.08); }
  };

  // Musik latar sederhana: pola nada berulang berbeda per stage
  const MUSIC_PATTERNS = {
    menu: [392, 440, 523, 440],
    desa: [262, 330, 392, 330],
    hutan: [220, 262, 294, 262],
    jalan: [294, 349, 392, 349],
    boss: [196, 220, 196, 174],
    win: [523, 659, 784, 1046]
  };

  function playMusic(theme) {
    stopMusic();
    if (!musicEnabled) return;
    const pattern = MUSIC_PATTERNS[theme] || MUSIC_PATTERNS.menu;
    let i = 0;
    musicTimer = setInterval(() => {
      beep(pattern[i % pattern.length], 0.35, 'triangle', 0.05);
      i++;
    }, 420);
  }

  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  function setSfxEnabled(v) { enabled = v; }
  function setMusicEnabled(v) { musicEnabled = v; if (!v) stopMusic(); }

  return { sfx, playMusic, stopMusic, setSfxEnabled, setMusicEnabled, ensureCtx };
})();
