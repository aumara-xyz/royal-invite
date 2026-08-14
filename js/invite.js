/* Royal invite layer — drives the REAL Zeta Harp (GLR / ST / OP).
   Look only: HUD stays hidden. No cockpit tour. Evidence never authorizes. */
(function () {
  'use strict';

  var held = true;
  var _openingTick = openingTick;
  openingTick = function (now, dt) {
    if (held) {
      var fade = document.getElementById('fade');
      if (fade) fade.style.opacity = '1';
      return;
    }
    _openingTick(now, dt);
  };

  var _endOpening = endOpening;
  endOpening = function () {
    if (!OP.on) return;
    OP.on = false;
    ST.opening = false;
    document.getElementById('fade').style.opacity = 0;
    document.body.classList.remove('introA');
    document.body.classList.add('invite');
    ST.frozen = false;
    ST.paused = false;
    ST.speedTarget = 0.22;
    GLR.CAM.distTarget = Math.max(GLR.CAM.distTarget, 48);
    if (window.INVITE && INVITE.landed) INVITE.landed();
  };

  introBStart = function () { /* invite owns the words */ };

  var veil = document.getElementById('veil');
  var inp = document.getElementById('pass');
  var err = document.getElementById('err');
  var inv = document.getElementById('inv');
  var ibox = document.getElementById('ibox');
  var bk = document.getElementById('bk');
  var bh = document.getElementById('bh');
  var bp = document.getElementById('bp');
  var blinks = document.getElementById('blinks');
  var talk = document.getElementById('talk');
  var say = document.getElementById('say');
  var reply = document.getElementById('reply');
  var adv = document.getElementById('iadv');
  var lanes = document.getElementById('lanes');
  var talking = false;
  var talked = false;
  var scene = -1;
  var typing = false;
  var typeTimer = null;
  var full = '';
  var shown = 0;
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  function openGate() {
    veil.style.opacity = '0';
    setTimeout(function () { veil.style.display = 'none'; }, 1300);
    held = false;
    setupOpening();
    OP.s = 0;
    document.body.classList.add('introA', 'invite');
    setTimeout(function () { document.getElementById('iskip').classList.add('on'); }, 1600);
  }
  function tryOpen() {
    if (inp.value.trim().toLowerCase() === 'tesseract') {
      err.textContent = '';
      openGate();
    } else {
      err.textContent = 'not yet — the nine-letter room';
      inp.value = '';
    }
  }
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryOpen(); });
  inp.addEventListener('input', function () { if (inp.value.length >= 9) tryOpen(); });
  setTimeout(function () { inp.focus(); }, 400);

  var SCENES = [
    { dist: 36, copy: ['Zeta Harp', 'This is the instrument. Not a sketch of it.',
      'You just flew the Riemann–Siegel main sum — the same tunnel as zeta-harp.kimi.page. Strings are terms. Gold is the resultant. No sliders. No proof.',
      'Known mathematics. Not evidence for the Riemann Hypothesis.'] },
    { dist: 18, copy: ['The pause', 'One gold line is everything they add up to.',
      'Each pale helix is a term in M(t). The gold coil is the same curve the observatory draws on the chart. We borrowed the look. We did not take the cockpit.'] },
    { dist: 42, copy: ['The tesseract', 'Four windings ask for a four-dimensional room.',
      'A phase lives on a circle. Two live on a torus — the small window the instrument already keeps. Four ask for a tesseract: a viewing frame for what will not sit still in 3-space. That is how the harp explains the shape. It is a frame, not a claim about the world.'] },
    { dist: 14, copy: ['Rewind', 'Before the tunnel, a single distinguishable event.',
      'Dive the gold. A crossing. A point. Every later address grows from something this small. Nothing granted. Just a place the rest can grow from.'] },
    { dist: 28, copy: ['Line, then face', 'Two points make a path. Three close a surface.',
      'Seed, edge, generate, address — sega geometry. Stack the faces and you get cells. Three choices on three axes make twenty-seven addresses. Infinity is not stored. It is pointed at.'] },
    { dist: 51, copy: ['The twenty-seven', 'A cube has exactly twenty-seven faces. Counted, not chosen.',
      'Eight corners, twelve edges, six sides, the cube itself. 3³ = 27. The same counting that lets a memory be a cell instead of a copy.'] },
    { dist: 40, center: true, talk: true, copy: ['The first room', 'A text box, floating in the middle of the tunnel.',
      'This is the spatial app before it has walls. Speak. The box will keep you — then it will sit down where a composer belongs.',
      'A demonstration of the door. Not the live membrane.'] },
    { dist: 56, lanes: true, copy: ['The room drops', 'The composer finds the floor. The lanes arrive.',
      'Threads. The conversation. Apps. A quiet ring in the gold — aura as instrument panel, never as a key. It grants nothing.',
      'Aura is staged. grantsAuthority stays false.'] },
    { dist: 48, lanes: true, copy: ['Aumlok', 'Identity as an address, not a costume.',
      'Aumlok is a cell in the same stack — derived from a chain you can recompute. A key is not a person. The system says so where the bind is not finished.'] },
    { dist: 52, lanes: true, copy: ['Cloud, or your node', 'The whole system can live in the cloud.',
      'If you want to be truly sovereign, you download your own node and it can still speak to the cloud version. Same law. Same receipts.'] },
    { dist: 44, last: true, copy: ['It fractals from there', 'A boundary needs two sides. We cannot be both.',
      'The harp is an instrument. The tesseract is a frame. The stack is an address. The room is where you speak. None of this is a grant. You are not the audience. You are the next observer.',
      'The instrument: github.com/aumara-xyz/zeta-harp — look borrowed, claims not.'] }
  ];

  function showBox(s) {
    ibox.classList.remove('on');
    bk.textContent = s.copy[0];
    bh.textContent = s.copy[1];
    bp.textContent = '';
    blinks.innerHTML = '';
    talk.classList.remove('on');
    reply.classList.remove('on');
    reply.textContent = '';
    if (s.center) inv.classList.add('center'); else inv.classList.remove('center');
    if (s.lanes) lanes.classList.add('on'); else lanes.classList.remove('on');
    talking = !!s.talk;
    if (s.talk) { talk.classList.add('on'); setTimeout(function () { say.focus(); }, 350); }
    requestAnimationFrame(function () { ibox.classList.add('on'); });
    full = s.copy[2] || '';
    shown = 0;
    typing = true;
    adv.classList.remove('on');
    clearInterval(typeTimer);
    function render() {
      bp.textContent = full.slice(0, shown);
      if (s.copy[3] && shown >= full.length) {
        var f = document.createElement('span');
        f.className = 'fence';
        f.textContent = s.copy[3];
        bp.appendChild(f);
      }
    }
    if (reduce) { shown = full.length; render(); finishType(s); return; }
    typeTimer = setInterval(function () {
      shown += 3;
      if (shown > full.length) shown = full.length;
      render();
      if (shown >= full.length) { clearInterval(typeTimer); finishType(s); }
    }, 12);
  }
  function finishType(s) {
    typing = false;
    if (s.last) {
      blinks.innerHTML =
        '<a class="pri" href="https://github.com/aumara-xyz/golden-horizon-principle/blob/main/research/AN_INVITATION.md">Read the invitation</a>' +
        '<a href="https://zeta-harp.kimi.page/">Open Zeta Harp</a>' +
        '<a href="https://github.com/aumara-xyz/golden-horizon-principle/blob/main/research/THE_GOLDEN_BOUNDARY.md">The Golden Boundary</a>';
      return;
    }
    if (!s.talk) adv.classList.add('on');
  }
  function completeType() {
    clearInterval(typeTimer);
    shown = full.length;
    bp.textContent = full;
    finishType(SCENES[scene] || {});
  }

  function enter(n) {
    scene = n;
    var s = SCENES[n];
    GLR.CAM.distTarget = s.dist;
    showBox(s);
    document.getElementById('iprog').style.width = (100 * n / Math.max(1, SCENES.length - 1)) + '%';
    var back = document.getElementById('iback');
    if (n > 0) back.classList.add('on'); else back.classList.remove('on');
  }

  function advance() {
    if (scene < 0) return;
    if (typing) { completeType(); return; }
    if (SCENES[scene].talk && !talked) { say.focus(); return; }
    if (scene < SCENES.length - 1) enter(scene + 1);
  }
  function goBack() { if (scene > 0) enter(scene - 1); }

  document.getElementById('talkform').addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!say.value.trim()) { say.focus(); return; }
    talked = true;
    reply.textContent = 'Heard. The gold keeps turning. The composer will sit down now. Nothing was granted.';
    reply.classList.add('on');
    say.value = '';
    adv.classList.add('on');
  });

  window.INVITE = {
    landed: function () {
      enter(0);
    }
  };

  document.getElementById('gl').addEventListener('click', function (e) {
    if (held) return;
    if (OP.on) { endOpening(); return; }
    advance();
  });
  inv.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#talk,.ilinks')) return;
    advance();
  });
  addEventListener('keydown', function (e) {
    if (e.target === say || e.target === inp) return;
    if (held) return;
    if (OP.on && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) { e.preventDefault(); endOpening(); return; }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
  });
  document.getElementById('iskip').addEventListener('click', function (e) {
    e.stopPropagation();
    if (OP.on) endOpening();
    enter(SCENES.length - 1);
  });
  document.getElementById('iback').addEventListener('click', function (e) { e.stopPropagation(); goBack(); });
})();
