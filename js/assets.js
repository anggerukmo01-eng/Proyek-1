/* =========================================================
   assets.js — Semua aset visual digambar langsung via Canvas
   (pixel art prosedural) sehingga TIDAK perlu file gambar
   eksternal maupun CDN. Karakter mengikuti deskripsi:
   Pria Indonesia ~30-an, gemuk, rambut cepak, kumis &
   jenggot dagu tipis, wajah bulat, mata besar, batik biru.
   ========================================================= */
const Assets = (() => {

  // Palet warna tetap agar konsisten di seluruh game
  const PAL = {
    skin: '#d9a066', skinShade: '#b97a4a',
    hair: '#2b2118', mustache: '#2b2118',
    batikBlue: '#2255aa', batikBlueDark: '#173d7a', batikPattern: '#f2c14e',
    pants: '#3a3a3a', shoes: '#5a3a20',
    eyeWhite: '#ffffff', eyeBlack: '#111111',
    outlineDark: '#1a1208'
  };

  // Gambar 1 "frame" pixel-art guru ke sebuah offscreen canvas kecil
  // lalu di-scale saat render supaya tetap tajam (image-rendering pixelated).
  function drawTeacher(ctx, x, y, w, h, state, frame, facing) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(facing, 1);
    ctx.translate(-w / 2, -h / 2);

    const bob = (state === 'walk' || state === 'run') ? Math.sin(frame * 0.9) * 2 : 0;
    const squash = state === 'jump' ? -3 : (state === 'fall' ? 3 : 0);

    ctx.translate(0, bob + squash);

    // Bayangan kaki
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h - 2, w * 0.32, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kaki / celana
    ctx.fillStyle = PAL.pants;
    const legSwing = (state === 'walk' || state === 'run') ? Math.sin(frame * 1.2) * 6 : 0;
    ctx.fillRect(w * 0.30, h * 0.68, w * 0.16, h * 0.28);
    ctx.fillRect(w * 0.54, h * 0.68 + Math.abs(legSwing) * 0.2, w * 0.16, h * 0.28);
    // Sepatu
    ctx.fillStyle = PAL.shoes;
    ctx.fillRect(w * 0.28, h * 0.92, w * 0.20, h * 0.08);
    ctx.fillRect(w * 0.52, h * 0.92, w * 0.20, h * 0.08);

    // Badan (batik biru, agak gemuk)
    ctx.fillStyle = PAL.batikBlue;
    roundRect(ctx, w * 0.18, h * 0.34, w * 0.64, h * 0.40, 6);
    ctx.fill();
    ctx.fillStyle = PAL.batikBlueDark;
    roundRect(ctx, w * 0.18, h * 0.58, w * 0.64, h * 0.16, 4);
    ctx.fill();
    // motif batik kecil
    ctx.fillStyle = PAL.batikPattern;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(w * (0.24 + i * 0.13), h * 0.42, 3, 3);
    }

    // Lengan
    ctx.fillStyle = PAL.batikBlue;
    const armSwing = (state === 'walk' || state === 'run') ? Math.sin(frame * 1.2) * 8 : 0;
    ctx.save();
    ctx.translate(w * 0.16, h * 0.40);
    ctx.rotate((armSwing * Math.PI) / 180 * 0.3);
    ctx.fillRect(-w * 0.06, 0, w * 0.12, h * 0.26);
    ctx.restore();
    ctx.save();
    ctx.translate(w * 0.80, h * 0.40);
    ctx.rotate((-armSwing * Math.PI) / 180 * 0.3);
    ctx.fillRect(-w * 0.06, 0, w * 0.12, h * 0.26);
    ctx.restore();
    // tangan
    ctx.fillStyle = PAL.skin;
    ctx.fillRect(w * 0.12, h * 0.62, w * 0.10, w * 0.10);
    ctx.fillRect(w * 0.78, h * 0.62, w * 0.10, w * 0.10);

    // Leher
    ctx.fillStyle = PAL.skinShade;
    ctx.fillRect(w * 0.42, h * 0.30, w * 0.16, h * 0.08);

    // Kepala bulat
    ctx.fillStyle = PAL.skin;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.20, w * 0.26, h * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rambut cepak
    ctx.fillStyle = PAL.hair;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.115, w * 0.27, h * 0.10, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(w * 0.24, h * 0.10, w * 0.52, h * 0.05);

    // Mata besar
    ctx.fillStyle = PAL.eyeWhite;
    ctx.beginPath(); ctx.ellipse(w * 0.42, h * 0.205, 3.4, 3.0, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.58, h * 0.205, 3.4, 3.0, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PAL.eyeBlack;
    ctx.beginPath(); ctx.arc(w * 0.43, h * 0.208, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.585, h * 0.208, 1.6, 0, Math.PI * 2); ctx.fill();

    // Kumis tipis + jenggot dagu tipis
    ctx.fillStyle = PAL.mustache;
    ctx.fillRect(w * 0.42, h * 0.255, w * 0.16, 2);
    ctx.fillRect(w * 0.47, h * 0.29, w * 0.06, 3);

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Musuh sederhana digambar sebagai bentuk khas per jenis
  function drawEnemy(ctx, x, y, w, h, type, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.5) * 2;
    ctx.translate(0, bob);
    switch (type) {
      case 'ayam':
        ctx.fillStyle = '#f2f2f2';
        ctx.beginPath(); ctx.ellipse(w/2, h/2, w*0.4, h*0.35, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#e02020';
        ctx.fillRect(w*0.3, h*0.15, w*0.15, h*0.1);
        ctx.fillStyle = '#e8a020';
        ctx.beginPath(); ctx.moveTo(w*0.05,h*0.5); ctx.lineTo(-w*0.1,h*0.55); ctx.lineTo(w*0.05,h*0.6); ctx.fill();
        break;
      case 'kambing':
        ctx.fillStyle = '#e8e0d0';
        roundRect(ctx, 0, h*0.2, w, h*0.6, 6); ctx.fill();
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(w*0.05,h*0.75,w*0.15,h*0.25);
        ctx.fillRect(w*0.7,h*0.75,w*0.15,h*0.25);
        break;
      case 'anjing':
      case 'anjing_besar':
        ctx.fillStyle = type === 'anjing_besar' ? '#5a4632' : '#8a6b4a';
        roundRect(ctx, 0, h*0.25, w, h*0.55, 8); ctx.fill();
        ctx.beginPath(); ctx.ellipse(w*0.85,h*0.35,w*0.18,h*0.18,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#e02020';
        ctx.beginPath(); ctx.arc(w*0.9,h*0.32,2,0,Math.PI*2); ctx.fill();
        break;
      case 'ular':
        ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = h*0.35;
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.quadraticCurveTo(w*0.3, h/2 - Math.sin(frame*0.3)*8, w, h/2);
        ctx.stroke();
        break;
      case 'monyet':
        ctx.fillStyle = '#6b4226';
        ctx.beginPath(); ctx.ellipse(w/2,h*0.5,w*0.35,h*0.4,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#c89b6a';
        ctx.beginPath(); ctx.ellipse(w/2,h*0.45,w*0.18,h*0.16,0,0,Math.PI*2); ctx.fill();
        break;
      case 'buaya':
      case 'buaya_besar':
        ctx.fillStyle = type === 'buaya_besar' ? '#1b5e20' : '#33691e';
        roundRect(ctx, 0, h*0.35, w, h*0.4, 6); ctx.fill();
        ctx.fillStyle = '#e0e0e0';
        for (let i=0;i<5;i++) ctx.fillRect(w*0.1+i*w*0.15, h*0.32, 3, 5);
        break;
      case 'orang_gila':
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(w*0.3,h*0.4,w*0.4,h*0.5);
        ctx.fillStyle = '#d9a066';
        ctx.beginPath(); ctx.arc(w*0.5,h*0.25,w*0.2,0,Math.PI*2); ctx.fill();
        break;
      case 'polisi':
        ctx.fillStyle = '#1a3c8f';
        ctx.fillRect(w*0.25,h*0.35,w*0.5,h*0.55);
        ctx.fillStyle = '#d9a066';
        ctx.beginPath(); ctx.arc(w*0.5,h*0.22,w*0.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(w*0.3,h*0.08,w*0.4,h*0.1);
        break;
      case 'debt_collector':
        ctx.fillStyle = '#333';
        ctx.fillRect(w*0.25,h*0.3,w*0.5,h*0.6);
        ctx.fillStyle = '#d9a066';
        ctx.beginPath(); ctx.arc(w*0.5,h*0.2,w*0.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(w*0.4,h*0.15,5,0,Math.PI*2); ctx.fill();
        break;
      case 'kendaraan':
        ctx.fillStyle = '#c62828';
        roundRect(ctx, 0, h*0.4, w, h*0.35, 6); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(w*0.2,h*0.78,h*0.12,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w*0.8,h*0.78,h*0.12,0,Math.PI*2); ctx.fill();
        break;
      default:
        ctx.fillStyle = '#999';
        ctx.fillRect(0,0,w,h);
    }
    ctx.restore();
  }

  // Background parallax sederhana per stage (langit, gunung, dsb)
  function drawBackground(ctx, cw, ch, camX, theme) {
    const layers = THEME_LAYERS[theme] || THEME_LAYERS.desa;
    layers.forEach(layer => {
      ctx.fillStyle = layer.color;
      const offset = -(camX * layer.speed) % cw;
      for (let i = -1; i <= Math.ceil(cw / cw) + 1; i++) {
        layer.draw(ctx, offset + i * cw, cw, ch);
      }
    });
  }

  const THEME_LAYERS = {
    desa: [
      { color: '#8fd0f0', speed: 0, draw: (ctx,x,w,h)=>{ ctx.fillRect(x,0,w,h); } },
      { color: '#c8f0a0', speed: 0.2, draw: (ctx,x,w,h)=>{
          ctx.beginPath(); ctx.moveTo(x,h*0.7);
          for(let i=0;i<=6;i++) ctx.lineTo(x+i*w/6, h*0.7 - Math.sin(i)*20 - 20);
          ctx.lineTo(x+w,h); ctx.lineTo(x,h); ctx.fill();
        } },
      { color: '#6fae3f', speed: 0.6, draw: (ctx,x,w,h)=>{ ctx.fillRect(x,h*0.85,w,h*0.15); } },
    ],
    hutan: [
      { color: '#5fa8c9', speed: 0, draw: (ctx,x,w,h)=>{ ctx.fillRect(x,0,w,h); } },
      { color: '#1b5e20', speed: 0.3, draw: (ctx,x,w,h)=>{
          for(let i=0;i<5;i++){ ctx.beginPath(); ctx.ellipse(x+i*w/5, h*0.6, 40, 60, 0,0,Math.PI*2); ctx.fill(); }
        } },
      { color: '#2e7d32', speed: 0.7, draw: (ctx,x,w,h)=>{ ctx.fillRect(x,h*0.82,w,h*0.18); } },
    ],
    jalan: [
      { color: '#b0c4de', speed: 0, draw: (ctx,x,w,h)=>{ ctx.fillRect(x,0,w,h); } },
      { color: '#78909c', speed: 0.4, draw: (ctx,x,w,h)=>{
          for(let i=0;i<3;i++) ctx.fillRect(x+i*w/3, h*0.4, 30, h*0.4);
        } },
      { color: '#424242', speed: 0.9, draw: (ctx,x,w,h)=>{ ctx.fillRect(x,h*0.85,w,h*0.15); } },
    ]
  };

  return { drawTeacher, drawEnemy, drawBackground };
})();
