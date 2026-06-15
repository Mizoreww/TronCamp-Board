// TronCamp VLA LeaderBoard 表格渲染(2026-06-15 重构:只按 T3 绝对分排名)。
// T1/T2 达标显绿勾,T3 = 分数(0.7·擦除 + 0.3·力质量)+ 进度条。契约见 publish.py。
(function () {
  'use strict';

  var cfg = window.BOARD_CONFIG || {};
  var URL = cfg.BOARD_DATA_URL || './data/leaderboard.json';
  var REFRESH = (cfg.REFRESH_SECONDS || 60) * 1000;
  var BOARD = 'dev';  // 实际值在 DOMContentLoaded 时从 <body data-board> 读取

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // T1/T2 达标门:达标=绿勾,未达标=空圈(hover 看成功率),未提交=点。
  function gate(g) {
    if (!g) return '<span class="gate gate-none" title="未提交">·</span>';
    if (g.pass) return '<span class="gate gate-ok" title="已达标">✓</span>';
    var sr = (g.success_rate != null) ? ' ' + Math.round(g.success_rate * 100) + '%' : '';
    return '<span class="gate gate-miss" title="未达标' + sr + '">○</span>';
  }

  // T3 分数 = 0.7·擦除 + 0.3·力质量(×100 一位小数)+ 进度条 + 擦/力分量。
  function t3cell(t3) {
    if (!t3 || t3.score === null || t3.score === undefined) {
      return '<td class="c-t3"><span class="dimcell">未上场</span></td>';
    }
    var w = Math.max(2, Math.min(100, t3.score * 100));
    var sub = (t3.wipe_rate != null && t3.force_quality != null)
      ? '<span class="t3sub">擦 ' + Math.round(t3.wipe_rate * 100) +
        ' · 力 ' + Math.round(t3.force_quality * 100) + '</span>'
      : '';
    return '<td class="c-t3"><div class="t3wrap">' +
      '<span class="t3num">' + (t3.score * 100).toFixed(1) + '</span>' + sub +
      '<span class="t3bar"><i style="width:' + w + '%"></i></span></div></td>';
  }

  function rowHtml(r) {
    var cls = r.rank <= 3 ? ' top top' + r.rank : '';
    return '<tr class="brow' + cls + '">' +
      '<td class="c-rank">' + r.rank + '</td>' +
      '<td class="c-team">' + esc(r.team) + '</td>' +
      '<td class="c-gate">' + gate(r.t1) + '</td>' +
      '<td class="c-gate">' + gate(r.t2) + '</td>' +
      t3cell(r.t3) +
      '</tr>';
  }

  var countdownTimer = null;

  function renderCountdown(deadline) {
    var el = document.getElementById('countdown');
    if (!el) return false;
    if (!deadline) { el.textContent = ''; return false; }
    var end = new Date(deadline).getTime();
    function tick() {
      var ms = end - Date.now();
      if (ms <= 0) {
        el.textContent = '已截止 · 榜单已冻结为最终成绩';
        el.classList.add('over');
        return;
      }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400);
      var pad = function (n) { return String(n).padStart(2, '0'); };
      el.textContent = '距截止 ' + d + ' 天 ' + pad(Math.floor(s % 86400 / 3600)) +
        ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
    }
    if (countdownTimer) clearInterval(countdownTimer);
    tick();
    countdownTimer = setInterval(tick, 1000);
    return end - Date.now() <= 0;
  }

  function render(data) {
    var updated = document.getElementById('updated');
    if (updated) updated.textContent = '更新于 ' + (data.generated_at || '—');
    var over = renderCountdown(data.deadline);

    var locked = document.getElementById('locked');
    var table = document.getElementById('board-table');
    var empty = document.getElementById('empty');

    // final = 截止时刻冻结的 dev 榜(不单独统跑);截止前 final 页显示倒计时
    var rows;
    if (BOARD === 'final') {
      if (data.final_unlocked && data.final.length) {
        rows = data.final;
      } else if (over) {
        rows = data.dev || [];
      } else {
        if (locked) locked.hidden = false;
        if (table) table.hidden = true;
        if (empty) empty.hidden = true;
        return;
      }
    }
    if (locked) locked.hidden = true;

    rows = rows || data[BOARD] || [];
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
