/* =========================================================
   boss.js — Musuh Boss di akhir tiap stage
   ========================================================= */
class Boss extends Enemy {
  constructor(type, x, groundY, opts) {
    super(type, x, groundY, opts);
    this.isBoss = true;
    this.phase = 1;
    this.attackTimer = 2;
    this.attackCooldown = opts.attackCooldown || 2.2;
    this.telegraph = 0;
    this.introDone = false;
    this.introTimer = 1.5;
    this.name = opts.name || 'BOSS';
  }

  update(dt) {
    if (this.dead) return;
    this.frame += dt * 10;
    if (!this.introDone) {
      this.introTimer -= dt;
      if (this.introTimer <= 0) this.introDone = true;
      return;
    }
    // Fase 2 saat HP di bawah 50%
    if (this.hp <= this.maxHp * 0.5 && this.phase === 1) {
      this.phase = 2;
      this.attackCooldown *= 0.7;
    }
    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      this.telegraph = 0.5; // beri jeda peringatan sebelum menyerang
      this.attackTimer = this.attackCooldown;
    }
    if (this.telegraph > 0) this.telegraph -= dt;

    // Gerak maju-mundur ringan di area boss
    this.x += Math.sin(this.frame * 0.05) * this.speed * dt * 0.02;
  }

  isAttacking() {
    return this.telegraph > 0 && this.telegraph < 0.15;
  }

  render(ctx, camX) {
    if (this.dead) return;
    if (!this.introDone) {
      ctx.save();
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(this.name + ' MUNCUL!', this.x - camX + this.w/2, this.y - 20);
      ctx.restore();
    }
    ctx.save();
    if (this.telegraph > 0 && this.telegraph < 0.5) {
      ctx.shadowColor = '#ff3333';
      ctx.shadowBlur = 15;
    }
    Assets.drawEnemy(ctx, this.x - camX, this.y, this.w, this.h, this.type, this.frame);
    ctx.restore();

    // Bar HP besar di atas layar
    const barW = 300, barX = (ctx.canvas.width - barW) / 2, barY = 20;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX, barY, barW, 18);
    ctx.fillStyle = '#e53935';
    ctx.fillRect(barX, barY, barW * Math.max(0,this.hp/this.maxHp), 18);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(barX, barY, barW, 18);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, ctx.canvas.width/2, barY - 4);
  }
}

const BOSS_DEFS = {
  anjing_besar:    { hp: 30, damage: 3, speed: 20, w: 90, h: 64, name: 'ANJING LIAR BESAR', attackCooldown: 1.8, scoreValue: 100 },
  buaya_besar:     { hp: 45, damage: 4, speed: 15, w: 110, h: 50, name: 'BUAYA BESAR', attackCooldown: 1.6, scoreValue: 150 },
  debt_collector:  { hp: 60, damage: 4, speed: 25, w: 50, h: 70, name: 'DEBT COLLECTOR', attackCooldown: 1.4, scoreValue: 200 },
};
