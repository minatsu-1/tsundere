/* ─────────────────────────────────────────────
   回避鼠标的漫画气泡
   ─────────────────────────────────────────────
   气泡先按正常流排在标题正下方，之后它一辈子都「相对这个位置」移动：
   transform 里写的是偏移量 (ox, oy)。这样不用去猜标题多高、字体加载完没。

   每帧量一次「气泡中心 → 鼠标」的距离：
     进到半径 R 以内就朝反方向推一把，然后阻尼、限速、撞墙反弹。
   限速是关键 —— 不限速就永远追不上；限速之后它躲得开你第一下，
   但你连着追两下总能把它逼到墙角，于是点得到。

   尖角每一帧重新指向标题中心，所以它跑到哪都像在跟那四个字说话。
   触屏没有 hover，直接关掉回避，点即进。
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  var bubble      = document.getElementById('bubble');
  var titleScreen = document.getElementById('titleScreen');
  var mainScreen  = document.getElementById('mainScreen');
  var h1          = titleScreen ? titleScreen.querySelector('h1') : null;
  var tail        = bubble ? bubble.querySelector('.tail') : null;
  var backBtn     = document.getElementById('backBtn');
  if (!bubble || !titleScreen || !mainScreen || !h1) return;

  var coarse = window.matchMedia('(hover: none)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 手感参数 —— 想让它更皮就调大 R / ACC / MAXV */
  var R    = 150;    // 感知半径（px）
  var ACC  = 1.6;    // 推力加速度
  var DAMP = 0.905;  // 每帧衰减，越小停得越快
  var MAXV = 15;     // 每帧最大位移（px），约 900 px/s
  var PAD  = 12;     // 离屏幕边缘留多少

  var W = 0, H = 0;
  var halfW = 0, halfH = 0;
  var baseX = 0, baseY = 0;
  var ox = 0, oy = 0;
  var vx = 0, vy = 0;
  var mx = -9999, my = -9999;
  var rot = 0;
  var entered = false;

  function centerX() { return baseX + ox; }
  function centerY() { return baseY + oy; }

  /* 量一次静止位置（量的时候把 transform 摘掉，免得量到偏移后的框） */
  function measureBase() {
    W = window.innerWidth;
    H = window.innerHeight;
    var keep = bubble.style.transform;
    bubble.style.transform = 'none';
    var r = bubble.getBoundingClientRect();
    halfW = r.width / 2;
    halfH = r.height / 2;
    baseX = r.left + halfW;
    baseY = r.top + halfH;
    bubble.style.transform = keep;
  }

  function apply() {
    bubble.style.transform =
      'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)' +
      ' rotate(' + rot.toFixed(2) + 'deg)';
    aimTail();
  }

  /* 尖角永远指着标题 —— 气泡飞到哪，都像在跟它说话 */
  function aimTail() {
    if (!tail) return;
    var r = h1.getBoundingClientRect();
    var tx = r.left + r.width / 2;
    var ty = r.top + r.height / 2;
    var dx = tx - centerX();
    var dy = ty - centerY();
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;

    var a = Math.atan2(dy, dx);
    var c = Math.cos(a), s = Math.sin(a);
    var rx = Math.abs(c) < 1e-4 ? 1e9 : halfW / Math.abs(c);
    var ry = Math.abs(s) < 1e-4 ? 1e9 : halfH / Math.abs(s);

    tail.style.setProperty('--a', (a * 180 / Math.PI).toFixed(1) + 'deg');
    tail.style.setProperty('--r', Math.min(rx, ry).toFixed(1) + 'px');
  }

  function step() {
    if (entered) return;

    if (!coarse) {
      var dx = centerX() - mx;
      var dy = centerY() - my;
      var d2 = dx * dx + dy * dy;
      if (d2 < R * R && d2 > 0.01) {
        var d = Math.sqrt(d2);
        var push = (1 - d / R) * ACC;
        vx += (dx / d) * push;
        vy += (dy / d) * push;
      }
    }

    vx *= DAMP;
    vy *= DAMP;

    var sp = Math.sqrt(vx * vx + vy * vy);
    if (sp > MAXV) { vx = vx / sp * MAXV; vy = vy / sp * MAXV; }
    if (Math.abs(vx) < 0.02) vx = 0;
    if (Math.abs(vy) < 0.02) vy = 0;

    if (vx || vy) {
      ox += vx;
      oy += vy;

      var cx = centerX(), cy = centerY();
      var minX = halfW + PAD, maxX = Math.max(minX, W - halfW - PAD);
      var minY = halfH + PAD, maxY = Math.max(minY, H - halfH - PAD);

      if (cx < minX) { ox += minX - cx; vx = Math.abs(vx) * 0.5; }
      if (cx > maxX) { ox -= cx - maxX; vx = -Math.abs(vx) * 0.5; }
      if (cy < minY) { oy += minY - cy; vy = Math.abs(vy) * 0.5; }
      if (cy > maxY) { oy -= cy - maxY; vy = -Math.abs(vy) * 0.5; }

      rot = Math.max(-11, Math.min(11, vx * 0.55));
    } else {
      rot *= 0.9;
    }

    apply();
    requestAnimationFrame(step);
  }

  function reset() {
    ox = oy = vx = vy = rot = 0;
    bubble.style.transform = '';
    measureBase();
    apply();
  }

  /* ── 进入主页面 ── */
  function enter() {
    if (entered) return;
    entered = true;

    bubble.classList.add('is-hit');
    bubble.style.transform =
      'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0) rotate(-4deg) scale(1.12)';

    setTimeout(function () {
      bubble.style.opacity = '0';
      bubble.style.transform =
        'translate3d(' + ox.toFixed(1) + 'px,' + (oy - 16).toFixed(1) + 'px,0)' +
        ' rotate(3deg) scale(.66)';
    }, 130);

    titleScreen.classList.add('is-gone');

    setTimeout(function () {
      titleScreen.style.display = 'none';
      mainScreen.hidden = false;
      document.documentElement.classList.add('intro-done');
      document.body.classList.add('intro-done');
      window.scrollTo(0, 0);
      requestAnimationFrame(function () { mainScreen.classList.add('is-in'); });
    }, 400);
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      mainScreen.classList.remove('is-in');
      setTimeout(function () {
        mainScreen.hidden = true;
        document.documentElement.classList.remove('intro-done');
        document.body.classList.remove('intro-done');
        titleScreen.style.display = '';
        titleScreen.classList.remove('is-gone');
        bubble.classList.remove('is-hit');
        bubble.style.opacity = '';
        entered = false;
        reset();
        requestAnimationFrame(step);
      }, 400);
    });
  }

  /* ── 事件 ── */
  window.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  window.addEventListener('pointerleave', function () { mx = my = -9999; }, { passive: true });

  bubble.addEventListener('click', function (e) {
    e.stopPropagation();
    enter();
  });

  bubble.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); }
  });

  window.addEventListener('resize', reset);

  function start() {
    reset();
    if (!reduce && !coarse) requestAnimationFrame(step);
  }

  /* 跳过标题页、直接打开主页面（图鉴目录）。
     ?nosplash=1 和 ?view=home 都走这里 —— 分类页/角色页的「回目录」用 ?view=home。 */
  function skipToMain() {
    document.documentElement.classList.add('intro-done');
    document.body.classList.add('intro-done');
    var tsEl = document.getElementById('titleScreen');
    var msEl = document.getElementById('mainScreen');
    if (tsEl) tsEl.style.display = 'none';
    if (msEl) {
      msEl.hidden = false;
      msEl.style.opacity = '1';
      msEl.style.pointerEvents = 'auto';
      msEl.classList.add('is-in');
    }
  }

  /* 调试钩子：?enter=1 直接进主页面 */
  var APPQ = new URLSearchParams(location.search);
  if (APPQ.get('enter') === '1') {
    setTimeout(enter, 700);
  }
  /* 从分类页/角色页点「回目录」过来时，直接落到图鉴目录页，不再停标题页。
     优先看参数；同时看 referrer —— 这样就算浏览器缓存着旧版链接（裸 index.html）也能走对。 */
  var REF = document.referrer || '';
  var fromSub =
    REF.indexOf(location.origin) === 0 && /\/cat\.html|\/char\.html/i.test(REF);
  if (APPQ.get('nosplash') === '1' || APPQ.get('view') === 'home' || fromSub) {
    skipToMain();
    return;
  }

  function waitForIntro() {
    if (document.documentElement.classList.contains('intro-pending')) {
      setTimeout(waitForIntro, 180);
    } else {
      setTimeout(start, 120);
    }
  }
  waitForIntro();
})();