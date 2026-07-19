/* =========================================================
   touchControls.js — Kontrol sentuh permanen (prioritas Android)
   + dukungan keyboard untuk Desktop
   ========================================================= */
const Controls = (() => {
  const state = {
    left: false, right: false,
    jump: false, jumpPressed: false,
    dash: false, dashPressed: false,
    slide: false, slidePressed: false,
    action: false, actionPressed: false,
    pausePressed: false
  };

  let prevJump = false, prevDash = false, prevSlide = false, prevAction = false, prevPause = false;

  function consumeEdges() {
    state.jumpPressed = state.jump && !prevJump;
    state.dashPressed = state.dash && !prevDash;
    state.slidePressed = state.slide && !prevSlide;
    state.actionPressed = state.action && !prevAction;
    state.run = state.dash; // menahan tombol dash/sprint = lari cepat
    prevJump = state.jump; prevDash = state.dash; prevSlide = state.slide; prevAction = state.action;
  }

  function bindButton(el, key) {
    if (!el) return;
    const on = (e) => { e.preventDefault(); state[key] = true; if (navigator.vibrate) navigator.vibrate(10); };
    const off = (e) => { e.preventDefault(); state[key] = false; };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off, { passive: false });
    el.addEventListener('touchcancel', off, { passive: false });
    el.addEventListener('mousedown', on);
    el.addEventListener('mouseup', off);
    el.addEventListener('mouseleave', off);
  }

  function init() {
    bindButton(document.getElementById('btn-left'), 'left');
    bindButton(document.getElementById('btn-right'), 'right');
    bindButton(document.getElementById('btn-jump'), 'jump');
    bindButton(document.getElementById('btn-dash'), 'dash');
    bindButton(document.getElementById('btn-action'), 'action');

    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': state.left = true; break;
        case 'ArrowRight': case 'KeyD': state.right = true; break;
        case 'ArrowUp': case 'KeyW': case 'Space': state.jump = true; break;
        case 'ShiftLeft': case 'ShiftRight': state.dash = true; break;
        case 'ArrowDown': case 'KeyS': state.slide = true; break;
        case 'KeyE': state.action = true; break;
        case 'Escape': case 'KeyP': state.pausePressed = true; break;
      }
    });
    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft': case 'KeyA': state.left = false; break;
        case 'ArrowRight': case 'KeyD': state.right = false; break;
        case 'ArrowUp': case 'KeyW': case 'Space': state.jump = false; break;
        case 'ShiftLeft': case 'ShiftRight': state.dash = false; break;
        case 'ArrowDown': case 'KeyS': state.slide = false; break;
        case 'KeyE': state.action = false; break;
      }
    });
  }

  function get() { return state; }

  return { init, get, consumeEdges,
    get left(){return state.left;}, get right(){return state.right;},
    get run(){ return state.dash; } // tombol dash dobel fungsi sebagai run/sprint
  };
})();
