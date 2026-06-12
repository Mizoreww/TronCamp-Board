// TronCamp VLA LeaderBoard 表格渲染(总分排名,T1/T2/T3 分组列)。
// 数据契约见 boardpub/publish.py;数值以 ×100 一位小数展示,Δ 带符号。
(function () {
  'use strict';

  var cfg = window.BOARD_CONFIG || {};
  var URL = cfg.BOARD_DATA_URL || './data/leaderboard.json';
  var REFRESH = (cfg.REFRESH_SECONDS || 60) * 1000;
  var BOARD = 'dev';  // 实际值在 DOMContentLoaded 时从 <body data-board> 读取

  function pts(x) {
    return (x === null || x === undefined) ? '—' : (x * 100).toFixed(1);
  }

  function delta(x) {
    if (x === null || x === undefined) return '<span class="dimcell">—</span>';
    var cls = x >= 0 ? 'pos' : 'neg';
    return '<span class="' + cls + '">' + (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '</span>';
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function rowHtml(r) {
    var t1 = r.t1 || {};
    var t2 = r.t2 || {};
    var t3 = r.t3 || {};
    var t3main = (t3.composite === null || t3.composite === undefined)
      ? '<span class="dimcell">—</span>'
      : (t3.baseline
        ? '<span class="dimcell">' + pts(t3.composite) + '</span><span class="tag">保底</span>'
        : pts(t3.composite));
    return '<tr>' +
      '<td class="rank">' + r.rank + '</td>' +
      '<td class="team">' + esc(r.team) + '</td>' +
      '<td class="total">' + pts(r.total) + '</td>' +
      '<td class="gstart">' + pts(t1.clean) + '</td>' +
      '<td class="gstart">' + pts(t2.composite) + '</td>' +
      '<td>' + pts(t2.wipe_rate) + '</td>' +
      '<td>' + pts(t2.force_quality) + '</td>' +
      '<td>' + delta(t2.delta1) + '</td>' +
      '<td class="gstart">' + t3main + '</td>' +
      '<td>' + delta(t3.delta2) + '</td>' +
      '</tr>';
  }

  function render(data) {
    var updated = document.getElementById('updated');
    if (updated) updated.textContent = '更新于 ' + (data.generated_at || '—');

    var locked = document.getElementById('locked');
    var table = document.getElementById('board');
    var empty = document.getElementById('empty');

    if (BOARD === 'final' && !data.final_unlocked) {
      if (locked) locked.hidden = false;
      if (table) table.hidden = true;
      if (empty) empty.hidden = true;
      return;
    }
    if (locked) locked.hidden = true;

    var rows = data[BOARD] || [];
    if (!rows.length) {
      if (table) table.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    table.hidden = false;
    if (empty) empty.hidden = true;
    table.querySelector('tbody').innerHTML = rows.map(rowHtml).join('');
  }

  function load() {
    fetch(URL + '?t=' + Date.now())
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () { /* 静态站:加载失败保持现状,下轮重试 */ });
  }

  window.addEventListener('DOMContentLoaded', function () {
    BOARD = document.body.dataset.board || 'dev';
    load();
    setInterval(load, REFRESH);
  });
})();
