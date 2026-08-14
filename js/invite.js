/* Hold the real harp until the original gate opens.
   HUD stays hidden. Controls tour never starts.
   Original invite scenes stay in charge. */
(function () {
  'use strict';
  var held = true;
  var _tick = openingTick;
  openingTick = function (now, dt) {
    if (held) {
      var fade = document.getElementById('fade');
      if (fade) fade.style.opacity = '0';
      return;
    }
    _tick(now, dt);
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
    ST.speedTarget = 0.2;
    GLR.CAM.distTarget = Math.max(GLR.CAM.distTarget, 40);
  };
  introBStart = function () {};

  window.HARP = {
    release: function () {
      held = false;
      document.body.classList.add('harp-live');
      setupOpening();
      OP.s = 0;
    },
    live: function (on) {
      document.body.classList.toggle('harp-live', !!on);
      if (on && GLR) GLR.CAM.distTarget = 34;
    }
  };
})();
