/* =========================================================
   physics.js — Konstanta & fungsi fisika sederhana platformer
   ========================================================= */
const Physics = (() => {
  const GRAVITY = 1800;       // px/s^2
  const MAX_FALL_SPEED = 1200;
  const GROUND_FRICTION = 0.82;

  function applyGravity(entity, dt) {
    entity.vy += GRAVITY * dt;
    if (entity.vy > MAX_FALL_SPEED) entity.vy = MAX_FALL_SPEED;
  }

  function integrate(entity, dt) {
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
  }

  return { GRAVITY, MAX_FALL_SPEED, GROUND_FRICTION, applyGravity, integrate };
})();
