function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c];});}
/* 傲娇·图鉴 — 目录页渲染。
   数据来自 data.js（window.CHARS / window.CATS），本文件只负责把它摆到页面上。 */
(function () {
  var C = window.CHARS || [];
  var CATS = window.CATS || [];

  function pickCover(list, label) {
    var cat = null;
    for (var i = 0; i < CATS.length; i++) if (CATS[i].label === label) cat = CATS[i];
    if (cat) {
      for (var j = 0; j < list.length; j++) if (list[j].name === cat.cover) return list[j];
    }
    return list.slice().sort(function (a, b) { return (b.fav || 0) - (a.fav || 0); })[0];
  }

  function members(kind, label) {
    return C.filter(function (c) {
      return kind === 'type' ? c.type === label : (c.genres || []).indexOf(label) >= 0;
    });
  }

  function card(kind, label) {
    var list = members(kind, label);
    var r = pickCover(list, label);
    var img = r ? '<img src="' + esc(r.img) + '" alt="' + esc(label) + '" loading="lazy">' : '';
    return '<a class="hm-cat hm-cat--img" href="cat.html?k=' +
           encodeURIComponent(kind + ':' + label) + '">' +
           '<div class="face">' + img + '</div>' +
           '<p>' + label + '</p></a>';
  }

  var gp = document.getElementById('gridP');
  var gg = document.getElementById('gridG');
  if (gp) gp.innerHTML = CATS.filter(function (x) { return x.kind === 'type'; })
      .map(function (x) { return card(x.kind, x.label); }).join('');
  if (gg) gg.innerHTML = CATS.filter(function (x) { return x.kind === 'genre'; })
      .map(function (x) { return card(x.kind, x.label); }).join('');

  /* 目录页顶栏搜索：回车跳到搜索结果页 */
  var q = document.getElementById('q');
  if (q) {
    q.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var v = q.value.trim();
      if (!v) return;
      e.preventDefault();
      location.href = 'search.html?q=' + encodeURIComponent(v);
    });
  }

  /* 随机傲娇：从 100 人里抽一个（避免连续抽到同一个人） */
  var rb = document.querySelector('.hm-random');
  if (rb) {
    rb.addEventListener('click', function (e) {
      e.preventDefault();
      if (!C.length) return;
      var last = '';
      try { last = sessionStorage.getItem('tsundere.lastRandom') || ''; } catch (err) {}
      var pool = C.length > 1 ? C.filter(function (c) { return String(c.anilist) !== last; }) : C;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      try { sessionStorage.setItem('tsundere.lastRandom', String(pick.anilist)); } catch (err) {}
      location.href = 'char.html?v=4&id=' + encodeURIComponent(pick.anilist);
    });
  }
})();
