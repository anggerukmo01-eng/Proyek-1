/* =========================================================
   player.js — Karakter utama: Guru
   State: idle, walk, run, jump, doubleJump, slide, dash,
          hurt, celebrate, fall, dead
   ========================================================= */
class Player {
  constructor(x, y, upgrades) {
    this.x = x; this.y = y;
    this.w = 44; this.h = 60;
    this.vx = 0; this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.state = 'idle';
    this.frame = 0;
    this.frameTimer = 0;

    this.canDoubleJump = true;
    this.usedDoubleJump = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.hurtTimer = 0;
    this.invincible = 0;
    this.dead = false;
    this.celebrating = false;

    // Statistik dasar + upgrade permanen dari shop
    const up = upgrades || { health:0, stamina:0, speed:0, power:0, defense:0, luck:0 };
    this.maxHp = 5 + up.health;
    this.hp = this.maxHp;
    this.baseSpeed = 220 + up.speed * 12;
    this.runSpeed = this.baseSpeed * 1.6;
    this.staminaMax = 100 + up.stamina * 15;
    this.stamina = this.staminaMax;
    this.power = 1 + up.power * 0.25;
    this.defense = up.defense * 0.06; // pengurang damage, max ~0.6
    this.luck = up.luck;

    this.jumpForce = -640;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.magnetTimer = 0;
    this.invincibleTimer = 0;
    this.doubleCoinTimer = 0;
  }

  get rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }

  takeDamage(amount) {
    if (this.invincible > 0 || this.dead || this.shieldActive) {
      if (this.shieldActive) { this.shieldActive = false; this.shieldTimer = 0; }
      return false;
    }
    const dmg = Math.max(1, Math.round(amount * (1 - this.defense)));
    this.hp -= dmg;
    this.hurtTimer = 0.4;
    this.invincible = 1.0;
    this.state = 'hurt';
    AudioSys.sfx.hurt();
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
    return true;
  }

  die() {
    this.dead = true;
    this.state = 'dead';
    this.vx = 0;
    AudioSys.sfx.gameover();
  }

  celebrate() {
    this.celebrating = true;
    this.state = 'celebrate';
    this.vx = 0;
    AudioSys.sfx.win();
  }

  jump() {
    if (this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.usedDoubleJump = false;
      this.state = 'jump';
      AudioSys.sfx.jump();
    } else if (!this.usedDoubleJump) {
      this.vy = this.jumpForce * 0.85;
      this.usedDoubleJump = true;
      this.state = 'doubleJump';
      AudioSys.sfx.jump();
    }
  }

  startSlide() {
    if (this.onGround && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.5;
      this.state = 'slide';
      this.h = 36; // hitbox lebih pendek saat slide
    }
  }

  startDash() {
    if (this.dashCooldown <= 0 && this.stamina >= 20) {
      this.isDashing = true;
      this.dashTimer = 0.22;
      this.dashCooldown = 0.9;
      this.stamina -= 20;
      this.state = 'dash';
      this.invincible = Math.max(this.invincible, 0.22);
    }
  }

  update(dt, input) {
    if (this.dead) { Physics.applyGravity(this, dt); Physics.integrate(this, dt); return; }
    if (this.celebrating) { return; }

    // Timer
    if (this.hurtTimer > 0) this.hurtTimer -= dt;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shieldTimer > 0) { this.shieldTimer -= dt; if (this.shieldTimer<=0) this.shieldActive=false; }
    if (this.magnetTimer > 0) this.magnetTimer -= dt;
    if (this.invincibleTimer > 0) { this.invincibleTimer -= dt; this.invincible = Math.max(this.invincible, 0.05); }
    if (this.doubleCoinTimer > 0) this.doubleCoinTimer -= dt;

    // Stamina regen
    if (!this.isDashing) this.stamina = Utils.clamp(this.stamina + 25*dt, 0, this.staminaMax);

    // Slide
    if (this.isSliding) {
      this.slideTimer -= dt;
      this.vx = this.facing * this.runSpeed * 0.9;
      if (this.slideTimer <= 0) { this.isSliding = false; this.h = 60; }
    } else if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.facing * this.baseSpeed * 3.2;
      if (this.dashTimer <= 0) this.isDashing = false;
    } else {
      // Gerakan horizontal normal
      let moveDir = 0;
      if (input.left) moveDir -= 1;
      if (input.right) moveDir += 1;
      const running = input.run && this.stamina > 0 && moveDir !== 0;
      if (running) this.stamina = Utils.clamp(this.stamina - 30*dt, 0, this.staminaMax);
      const targetSpeed = (running ? this.runSpeed : this.baseSpeed) * moveDir;
      this.vx = Utils.lerp(this.vx, targetSpeed, 0.35);
      if (moveDir !== 0) this.facing = moveDir;

      if (input.jumpPressed) this.jump();
      if (input.slidePressed) this.startSlide();
      if (input.dashPressed) this.startDash();
    }

    Physics.applyGravity(this, dt);
    Physics.integrate(this, dt);

    // Update state berdasarkan kondisi
    if (this.hurtTimer > 0) {
      this.state = 'hurt';
    } else if (this.isDashing) {
      this.state = 'dash';
    } else if (this.isSliding) {
      this.state = 'slide';
    } else if (!this.onGround) {
      this.state = this.vy < 0 ? (this.usedDoubleJump ? 'doubleJump' : 'jump') : 'fall';
    } else if (Math.abs(this.vx) > this.baseSpeed * 1.2) {
      this.state = 'run';
    } else if (Math.abs(this.vx) > 10) {
      this.state = 'walk';
    } else {
      this.state = 'idle';
    }

    // Animasi frame
    this.frameTimer += dt;
    if (this.frameTimer > 0.1) { this.frame++; this.frameTimer = 0; }
  }

  render(ctx, camX) {
    const drawX = this.x - camX;
    if (this.invincible > 0 && Math.floor(this.frame/2) % 2 === 0 && !this.isDashing) {
      ctx.globalAlpha = 0.5;
    }
    Assets.drawTeacher(ctx, drawX, this.y, this.w, this.h, this.state, this.frame, this.facing);
    if (this.shieldActive) {
      ctx.strokeStyle = 'rgba(100,200,255,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(drawX + this.w/2, this.y + this.h/2, this.w*0.75, this.h*0.65, 0, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
