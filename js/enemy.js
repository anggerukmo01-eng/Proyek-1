/* =========================================================
   enemy.js — Musuh & rintangan reguler tiap stage
   ========================================================= */
class Enemy {
  constructor(type, x, groundY, opts = {}) {
    this.type = type;
    this.x = x;
    this.hp = opts.hp || 1;
    this.maxHp = this.hp;
    this.damage = opts.damage || 1;
    this.speed = opts.speed || 0;
    this.static = !!opts.static; // rintangan diam (lubang, batu, dsb)
    this.w = opts.w || 40;
    this.h = opts.h || 40;
    this.y = groundY - this.h;
    this.vx = -this.speed; // bergerak melawan arah pemain (mendekat)
    this.dead = false;
    this.frame = Utils.randInt(0, 20);
    this.range = opts.range || 120; // jarak patroli
    this.originX = x;
    this.scoreValue = opts.scoreValue || 10;
    this.isHazard = !!opts.isHazard; // menyentuh = damage tanpa perlu dikalahkan (mis. lubang)
  }

  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  update(dt) {
    if (this.dead) return;
    this.frame += dt * 10;
    if (!this.static && this.speed > 0) {
      this.x += this.vx * dt;
      if (Math.abs(this.x - this.originX) > this.range) {
        this.vx *= -1;
      }
    }
  }

  hit(damage) {
    if (this.isHazard) return false; // hazard tidak bisa dikalahkan, hanya dihindari
    this.hp -= damage;
    AudioSys.sfx.enemyHit();
    if (this.hp <= 0) {
      this.dead = true;
      return true;
    }
    return false;
  }

  render(ctx, camX) {
    if (this.dead) return;
    Assets.drawEnemy(ctx, this.x - camX, this.y, this.w, this.h, this.type, this.frame);
    // Health bar kecil untuk musuh yang tangguh
    if (this.maxHp > 1 && this.hp < this.maxHp) {
      const bw = this.w;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(this.x - camX, this.y - 8, bw, 4);
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(this.x - camX, this.y - 8, bw * (this.hp/this.maxHp), 4);
    }
  }
}

// Definisi statistik dasar per jenis musuh (dipakai levels.js)
const ENEMY_DEFS = {
  ayam:        { hp: 1, damage: 1, speed: 60,  w: 30, h: 28, scoreValue: 10 },
  kambing:     { hp: 2, damage: 1, speed: 40,  w: 38, h: 34, scoreValue: 15 },
  lubang:      { hp: 1, damage: 1, speed: 0,   w: 50, h: 20, static: true, isHazard: true, scoreValue: 0 },
  genangan:    { hp: 1, damage: 0, speed: 0,   w: 60, h: 12, static: true, isHazard: false, scoreValue: 0 },
  anjing:      { hp: 2, damage: 2, speed: 90,  w: 40, h: 34, scoreValue: 20 },
  ular:        { hp: 2, damage: 2, speed: 50,  w: 44, h: 20, scoreValue: 18 },
  monyet:      { hp: 2, damage: 1, speed: 100, w: 34, h: 34, scoreValue: 18 },
  pohon:       { hp: 1, damage: 2, speed: 0,   w: 40, h: 40, static: true, isHazard: true, scoreValue: 0 },
  batu:        { hp: 1, damage: 1, speed: 0,   w: 34, h: 34, static: true, isHazard: true, scoreValue: 0 },
  buaya:       { hp: 3, damage: 2, speed: 70,  w: 54, h: 30, scoreValue: 25 },
  orang_gila:  { hp: 2, damage: 2, speed: 80,  w: 36, h: 46, scoreValue: 20 },
  polisi:      { hp: 2, damage: 2, speed: 90,  w: 36, h: 48, scoreValue: 22 },
  kendaraan:   { hp: 1, damage: 3, speed: 220, w: 60, h: 34, scoreValue: 15 },
  lubang_jalan:{ hp: 1, damage: 1, speed: 0,   w: 50, h: 16, static: true, isHazard: true, scoreValue: 0 },
  lampu_merah: { hp: 1, damage: 0, speed: 0,   w: 20, h: 60, static: true, isHazard: false, scoreValue: 0 },
};
