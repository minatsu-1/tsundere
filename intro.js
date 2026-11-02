/* ─────────────────────────────────────────────
   开场：字往外飘，越飘越小，最后模糊掉
   版式照《Angel Beats!》次回予告：分区、错位、字号跨三级。
   但动作只有一种——出现之后朝画面深处的消失点缩进去。
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  var qs = new URLSearchParams(location.search);
  /* 播不播由 index.html 头部脚本统一决定（结果写在 <html data-intro>），
     这里只照着执行，避免两处判断不一致导致黑屏或闪一下。 */
  var mode = document.documentElement.getAttribute('data-intro');
  if (mode === 'skip' || qs.get('intro') === '0') {
    document.documentElement.classList.remove('intro-pending');
    return;
  }
  var freeze = qs.get('introat');

  var VPX = 50, VPY = 54;     // 消失点（视口百分比）
  var START = 200;            // 第一块出现
  var STEP = 400;             // 相邻两块间隔
  var HOLD = 0;               // 先藏着，等到开始缩小的那一刻才瞬间现身
  var RECEDE = 1400;          // 缩小 + 内移的时长
  var BLUR_MS = 520;          // 模糊从倒数第几毫秒开始
  var FADE_MS = 460;          // 完全消失
  var S_END = 0.18;           // 缩到原来的 18%
  var BLUR_MAX = 9;
  var TITLE_AT = 11800;
  var TOTAL_MS = 13200;

  /* x,y 落点（%） · fs 字号上限（vw） · at 出生毫秒
     顺序按「ツン → デレ」排，最后两句是全篇最软的，收在那里 */
  var T = [
    /* 一、起手：硬、短、只放一两个 */
    { t: 'バカ！',                                   x: 10, y: 22, fs: 13, at: 300 },
    { t: 'うるさい！',                               x: 56, y: 20, fs: 8.5, at: 1150 },
    { t: 'なによ。ジロジロ見ないでよ',                 x: 16, y: 46, fs: 4.6, at: 1850 },
    /* 二、经典否认 */
    { t: 'べ、別にあんたのために作ったんじゃないんだからね！', x: 5, y: 70, fs: 3.7, at: 2400 },
    { t: '勘違いすんなよ、別に深い意味は、ねぇからな。',       x: 5, y: 30, fs: 3.9, at: 2950 },
    { t: 'あんたなんか、どうなっても知らないんだから！',       x: 8, y: 52, fs: 4.2, at: 3450 },
    { t: 'ち、調子に乗らないでよね',                   x: 6, y: 82, fs: 5.2, at: 3900 },
    /* 三、最密 */
    { t: '今回だけは許してあげる！',                   x: 34, y: 62, fs: 5.0, at: 4300 },
    { t: 'べっ別に、あんたのことがすきなんかじゃないからね！', x: 6, y: 20, fs: 3.4, at: 4600 },
    { t: 'く、くく、偶然ハート型に出来ただけなんだからッ！',   x: 8, y: 74, fs: 3.6, at: 4870 },
    { t: 'はあ、き、奇遇ね、わ、私も今ちょうど帰るとこなんだけど', x: 4, y: 38, fs: 3.2, at: 5120 },
    { t: 'うるさい',                                 x: 74, y: 24, fs: 9,   at: 5350 },
    { t: 'うるさい',                                 x: 64, y: 44, fs: 7,   at: 5520 },
    { t: 'うるさい',                                 x: 56, y: 64, fs: 5,   at: 5680 },
    { t: 'あ、あんたって本当にバカね。……嫌いじゃないけど',   x: 12, y: 58, fs: 4.2, at: 5900 },
    { t: '別に、あんたのことなんかこれっぽっちも好きじゃないんだから', x: 5, y: 86, fs: 3.0, at: 6180 },
    /* 四、开始漏气，句子一句比一句软 */
    { t: '見てたの？見てたなら消えて。……見てなかったなら、いいけど', x: 5, y: 28, fs: 3.1, at: 6700 },
    { t: 'ちょっと、いつまで手を握ってるのよ！……べ、別に嫌とは言ってないけど', x: 4, y: 52, fs: 3.0, at: 7400 },
    { t: 'あんたは、私のことだけ見てればいいのよッ',     x: 16, y: 76, fs: 4.2, at: 8100 },
    { t: '感謝してるわけじゃないからね。……一応、助かったけど', x: 8, y: 36, fs: 3.4, at: 8800 },
    /* 五、收尾：最短最软 */
    { t: 'うるさい。……ありがと',                     x: 26, y: 30, fs: 6.2, at: 9500 },
    { t: '別に寂しくなんかなかったんだから。……ちょっとだけ、だよ', x: 10, y: 56, fs: 3.5, at: 10100 },
    { t: 'バカ。……心配、したんだからね',               x: 30, y: 44, fs: 5.6, at: 10800 }
  ];

  var ZH = [
    { zh: '笨蛋！',               corner: 'lb', at: 500 },
    { zh: '吵死了！',            corner: 'rt', at: 1350 },
    { zh: '干嘛。别盯着看啊。',   corner: 'lb', at: 2050 },
    { zh: '才、才不是特意为你做的呢！', corner: 'rt', at: 2650 },
    { zh: '别搞错了…才没别的意思…', corner: 'lb', at: 3200 },
    { zh: '你这种人，出什么事我才不管！', corner: 'rt', at: 3700 },
    { zh: '吵死了吵死了吵死了！',  corner: 'lt', at: 5500 },
    { zh: '你、你真是个笨蛋。……不过不讨厌。', corner: 'rb', at: 6150 },
    { zh: '才、才没有喜欢你…',     corner: 'lt', at: 6600 },
    { zh: '吵死了。……谢了。',     corner: 'lb', at: 9750 },
    { zh: '我才没有觉得寂寞。……就一点点而已。', corner: 'rt', at: 10350 },
    { zh: '笨蛋。……我、我可是担心你了。', corner: 'lb', at: 11050 }
  ];
  var ZH_LIFE = 1000;

  T.forEach(function (it) { if (it.hold == null) it.hold = HOLD; });

  var root = document.createElement('div');
  root.id = 'intro';

  var title = document.createElement('div');
  title.className = 'intro__title';
  title.innerHTML =
    '<div class="intro__ep">[ EPISODE.01 ]</div>' +
    '<div class="intro__name">ツンデレ</div>' +
    '<div class="intro__zh">傲娇</div>';
  root.appendChild(title);
  var nameEl = title.querySelector('.intro__name');

  function unpending() {
    document.documentElement.classList.remove('intro-pending');
  }

  /* ── 建元素 ── */
  T.forEach(function (it) {
    var el = document.createElement('div');
    el.className = 'line';
    el.textContent = it.t;
    var v = Math.min(it.fs, (98 - it.x) / Math.max(1, it.t.length));
    it.w = v * it.t.length;                       // 这行字占多少 vw
    el.style.setProperty('--x', (it.x + it.w / 2).toFixed(2) + '%');   // x 是中心点
    el.style.setProperty('--y', it.y + '%');
    el.style.setProperty('--s', '1');
    el.style.setProperty('--dx', '0');
    el.style.setProperty('--dy', '0');
    el.style.setProperty('--blur', '0px');
    el.style.fontSize = 'min(' + v.toFixed(2) + 'vw, ' + Math.round(v * 18) + 'px)';
    it.el = el;
    /* 朝消失点漂移的距离（vw / vh） */
    it.dx = (VPX - (it.x + it.w / 2)) * 0.3;
    it.dy = (VPY - it.y) * 0.3;
    root.appendChild(el);
  });

  ZH.forEach(function (it) {
    var el = document.createElement('div');
    el.className = 'zh corner--' + it.corner;
    el.textContent = '「' + it.zh + '」';
    it.el = el;
    root.appendChild(el);
  });

  /* ── 冻结模式 ── */
  if (freeze !== null) {
    var t = parseInt(freeze, 10) || 0;
    if (t >= TITLE_AT) {
      title.classList.add('is-on');
      nameEl.style.transition = 'none';
      nameEl.style.clipPath = 'polygon(0 0, 112% 0, 100% 100%, 0 100%)';
    }
    T.forEach(function (it) {
      var dt = t - it.at;
      if (dt < 0) { it.el.style.setProperty('--o', '0'); return; }
      var p = Math.min(1, Math.max(0, (dt - it.hold) / RECEDE));
      var e = p * p;
      var s = 1 - (1 - S_END) * e;
      var bp = Math.min(1, Math.max(0, (dt - (it.hold + RECEDE - BLUR_MS)) / BLUR_MS));
      var fp = Math.min(1, Math.max(0, (dt - (it.hold + RECEDE - FADE_MS)) / FADE_MS));
      it.el.style.setProperty('--s', s.toFixed(4));
      it.el.style.setProperty('--dx', (it.dx * e).toFixed(2));
      it.el.style.setProperty('--dy', (it.dy * e).toFixed(2));
      it.el.style.setProperty('--blur', (bp * bp * BLUR_MAX).toFixed(1) + 'px');
      it.el.style.setProperty('--o', ((Math.min(1, dt / 90)) * (1 - fp)).toFixed(3));
    });
    ZH.forEach(function (it) {
      var dt = t - it.at;
      it.el.style.opacity = (dt >= 0 && dt < ZH_LIFE) ? 1 : 0;
    });
    document.body.appendChild(root);
    unpending();
    return;
  }

  /* ── 正常播放 ── */
  var SEEN_KEY = 'tsundere.intro.v1';
  try {
    /* 只记在 sessionStorage：新开浏览器/新标签会重新播一次，关掉就重置。
       （旧版本留下的 localStorage 标记由 index.html 头部脚本清掉） */
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch (e) { /* 记不住就算了 */ }
  document.body.classList.add('intro-lock');
  T.forEach(function (it) { it.el.style.setProperty('--o', '0'); });
  document.body.appendChild(root);
  unpending();

  var hasAnime = window.anime && typeof window.anime.animate === 'function';
  var timers = [];

  T.forEach(function (it) {
    var el = it.el;

    /* 出现：瞬间显形，和开始缩小同一刻 */
    timers.push(setTimeout(function () {
      if (hasAnime) {
        el.style.setProperty('--o', '1');
      } else {
        el.style.setProperty('--o', '1');
      }
    }, it.at));

    /* 到该淡出的时候：开过渡，再把 --o 拨到 0 */
    timers.push(setTimeout(function () {
      el.classList.add('is-fading');
      el.style.setProperty('--o', '0');
    }, it.at + it.hold + RECEDE - FADE_MS));

    /* 缩小、朝消失点内移 */
    if (hasAnime) {
      window.anime.animate(el, {
        '--s': [1, S_END],
        '--dx': [0, it.dx],
        '--dy': [0, it.dy],
        duration: RECEDE,
        delay: it.at + it.hold,
        ease: 'inQuad'
      });
      /* 后半程开始糊掉（不透明度不归 anime 管，交上面那个定时器 + CSS 过渡） */
      window.anime.animate(el, {
        '--blur': ['0px', BLUR_MAX + 'px'],
        duration: BLUR_MS,
        delay: it.at + it.hold + RECEDE - BLUR_MS,
        ease: 'inQuad'
      });
    } else {
      timers.push(setTimeout(function () {
        el.style.setProperty('--s', S_END);
        el.style.setProperty('--dx', it.dx);
        el.style.setProperty('--dy', it.dy);
      }, it.at + it.hold));
    }
  });

  ZH.forEach(function (it) {
    it.el.style.opacity = 0;
    timers.push(setTimeout(function () { it.el.style.opacity = 1; }, it.at));
    timers.push(setTimeout(function () { it.el.style.opacity = 0; }, it.at + ZH_LIFE));
  });

  timers.push(setTimeout(function () {
    title.classList.add('is-on');
    nameEl.classList.add('is-wipe');
  }, TITLE_AT));

  function revealSite() {
    if (!hasAnime) return;
    var targets = document.querySelectorAll('.hero > *, .card');
    if (!targets.length) return;
    try {
      window.anime.animate('.hero > *', {
        translateY: [18, 0], opacity: [0, 1],
        duration: 520, delay: window.anime.stagger(70), ease: 'outQuad'
      });
      window.anime.animate('.card', {
        translateY: [22, 0], opacity: [0, 1],
        duration: 520, delay: window.anime.stagger(70, { start: 160 }), ease: 'outQuad'
      });
      setTimeout(function () {
        targets.forEach(function (el) {
          el.style.opacity = '';
          el.style.transform = '';
        });
      }, 1400);
    } catch (e) { /* 静默 */ }
  }

  function done() {
    root.classList.add('is-done');
    document.body.classList.remove('intro-lock');
    setTimeout(function () {
      if (root.parentNode) root.parentNode.removeChild(root);
      revealSite();
    }, 200);
  }

  timers.push(setTimeout(done, TOTAL_MS));

  var skipped = false;
  function skip() {
    if (skipped) return;
    skipped = true;
    timers.forEach(clearTimeout);
    done();
  }
  window.addEventListener('pointerdown', skip, { passive: true });
  window.addEventListener('keydown', skip);
})();
