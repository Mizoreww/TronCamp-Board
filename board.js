// 榜单渲染(原生 JS,零依赖)。列序锁定:
// 主榜 T3 综合分 + Δ₂ | 科学列 Δ₁ | 扰动擦除率 | 力质量分 | T1 干净参考分
"use strict";

function fmt(v) {
  return (v === null || v === undefined) ? "—" : Number(v).toFixed(4);
}

function esc(s) {
  var d = document.createElement("div");
  d.textContent = String(s);
  return d.innerHTML;
}

function renderRows(tbody, rows) {
  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9">暂无成绩。</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(function (r) {
    return "<tr>" +
      "<td>" + esc(r.rank) + "</td>" +
      "<td>" + esc(r.team) + "</td>" +
      "<td>" + fmt(r.t3_composite) + "</td>" +
      "<td>" + fmt(r.delta2) + "</td>" +
      "<td>" + fmt(r.delta1) + "</td>" +
      "<td>" + fmt(r.wipe_rate) + "</td>" +
      "<td>" + fmt(r.force_quality) + "</td>" +
      "<td>" + fmt(r.t1_clean) + "</td>" +
      "<td>" + (r.baseline ? "baseline(未交 T3,按 T2 计)" : "") + "</td>" +
      "</tr>";
  }).join("");
}

// board: "dev" | "final"
function loadBoard(board) {
  var tbody = document.getElementById("board-body");
  var meta = document.getElementById("board-meta");
  var lockedNote = document.getElementById("final-locked");
  fetch(window.BOARD_CONFIG.BOARD_DATA_URL, { cache: "no-store" })
    .then(function (resp) {
      if (!resp.ok) { throw new Error("HTTP " + resp.status); }
      return resp.json();
    })
    .then(function (data) {
      if (meta) { meta.textContent = "数据生成时间(UTC):" + data.generated_at; }
      if (board === "final") {
        if (!data.final_unlocked) {
          if (lockedNote) { lockedNote.style.display = ""; }
          if (tbody) { tbody.innerHTML = '<tr><td colspan="9">赛末公布。</td></tr>'; }
          return;
        }
        if (lockedNote) { lockedNote.style.display = "none"; }
        renderRows(tbody, data.final);
      } else {
        renderRows(tbody, data.dev);
      }
    })
    .catch(function (err) {
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9">榜单数据加载失败(' +
          esc(err.message) + '),稍后自动重试。</td></tr>';
      }
    });
}

function startBoard(board) {
  loadBoard(board);
  setInterval(function () { loadBoard(board); },
    (window.BOARD_CONFIG.REFRESH_SECONDS || 60) * 1000);
}
