/* 生成背景那面字墙 */
(function () {
  'use strict';
  var wall = document.getElementById('wall');
  if (!wall) return;

  var POOL = ('傲娇ツンデレ別にバカうるさい素直照れ恥ずかしい好き嫌い' +
              '勘違いすんなよ本音顔赤いてるあんたのばかだからねっと言えない').split('');

  function build() {
    var cell = 44;
    var cols = Math.ceil(window.innerWidth / cell);
    var rows = Math.ceil(window.innerHeight / cell);
    var n = cols * rows;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.textContent = POOL[Math.floor(Math.random() * POOL.length)];
      if (Math.random() < 0.04) {
        s.className = 'p ' + (Math.random() < 0.28 ? 'r' : 'b');
        s.style.setProperty('--t', (2.6 + Math.random() * 3.4).toFixed(2) + 's');
        s.style.setProperty('--d', (Math.random() * 4).toFixed(2) + 's');
      }
      frag.appendChild(s);
    }
    wall.textContent = '';
    wall.appendChild(frag);
  }

  build();

  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(build, 220);
  });
})();