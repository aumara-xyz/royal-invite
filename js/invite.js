/* Real Zeta Harp in the right-hand well. HUD off. Page navy. No close fly-through. */
(function () {
  'use strict';
  var held = true;
  var CROSS = 1000010;

  openingTick = function (now, dt) {
    var fade = document.getElementById('fade');
    if (held) {
      if (fade) fade.style.opacity = '0';
      return;
    }
    OP.s += dt;
    var s = OP.s;
    if (fade) fade.style.opacity = '0';
    var f = Math.min(1, s / 8);
    var ease = 1 - Math.pow(1 - f, 3);
    if (OP.cross) CROSS = OP.cross;
    ST.t = 1000000 + (CROSS - 1000000) * ease;
    if (GLR && GLR.CAM) {
      GLR.CAM.yaw = 0.78 + ease * 0.12;
      GLR.CAM.pitch = 0.05;
      GLR.CAM.dist = 52;
      GLR.CAM.distTarget = 52;
    }
    if (s >= 8) endOpening();
  };

  endOpening = function () {
    if (!OP.on) return;
    OP.on = false;
    ST.opening = false;
    var fade = document.getElementById('fade');
    if (fade) fade.style.opacity = '0';
    document.body.classList.remove('introA');
    ST.frozen = false;
    ST.paused = false;
    ST.speedTarget = 0.14;
    if (GLR && GLR.CAM) GLR.CAM.distTarget = 52;
  };
  introBStart = function () {};

  window.HARP = {
    release: function () {
      held = false;
      setupOpening();
      OP.s = 0;
      if (GLR && GLR.CAM) {
        GLR.CAM.yaw = 0.78;
        GLR.CAM.pitch = 0.05;
        GLR.CAM.dist = 52;
        GLR.CAM.distTarget = 52;
      }
      window.HARP.live(true);
      try { window.dispatchEvent(new Event('resize')); } catch (e) {}
    },
    live: function (on) {
      document.body.classList.toggle('harp-live', !!on);
      if (on) {
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
      }
    }
  };
})();
