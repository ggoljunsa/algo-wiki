// ============================================================
// divide_conquer_flow — L3 p.7–8 Divide and Conquer (Big → Not as big → Even smaller)
// 시간축(초): 0 Big → 1.5 Divide ×2 → 3 Divide ×4 → 4.5 Conquer (가장 작은 4개 ✓) → 6.5 Combine (한 단계 위)
//   → 8.5 Combine (루트) → 10 요약 → 12
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["divide_conquer_flow"] = {
  title: "Divide and Conquer — 쪼개고, 풀고, 합치는 3막",
  desc: "[[divide and conquer]]: '''Divide''' 현재 문제를 더 작은(쉬운) 부분 문제로 쪼갬 → '''Conquer''' 작은 문제를 풂 → '''Combine''' 그 결과를 모아 현재 문제를 푼다. [[mergesort]] 가 대표 예",
  duration: 12,
  build: function () {
    var D = 12;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function kv(pts) {
      var p = pts.slice();
      if (p[0][0] > 0) p.unshift([0, p[0][1]]);
      if (p[p.length - 1][0] < D) p.push([D, p[p.length - 1][1]]);
      return 'values="' + p.map(function (q) { return q[1]; }).join(";") + '" keyTimes="' + p.map(function (q) { return r4(q[0] / D); }).join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function an(attr, pts) { return '<animate attributeName="' + attr + '" ' + kv(pts) + '/>'; }
    function mv(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kv(pts) + '/>'; }

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="분할 정복 흐름 애니메이션">';
    s += '<defs><marker id="dc_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#777"/></marker>' +
      '<marker id="dc_up" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.green + '"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "Big 문제 하나 — 그대로 풀기엔 너무 크다"],
      [1.5, 4.5, "① Divide: 현재 문제를 더 작은(쉬운) 부분 문제로 쪼갠다 (Big → Not as big → Even smaller)"],
      [4.5, 6.5, "② Conquer: 가장 작은 문제들은 바로 풀린다 (base case)"],
      [6.5, 10, "③ Combine: 작은 문제의 답을 모아(collect the results) 한 단계 위 문제를 푼다"],
      [10, 12, "Divide → Conquer → Combine — 부분 문제들은 서로 독립이다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 트리 좌표 ----
    var L = [
      { y: 56, w: 170, nodes: [380], label: "Big", size: "크기 n" },
      { y: 136, w: 150, nodes: [230, 530], label: "Not as big", size: "n/2" },
      { y: 216, w: 124, nodes: [155, 305, 455, 605], label: "Even smaller", size: "n/4" }
    ];
    var H = 40;
    var appear = [0, 1.6, 3.1];              // 레벨이 나타나는 시각
    var solved = [[9.0], [7.0, 7.6], [4.6, 5.0, 5.4, 5.8]]; // 초록이 되는 시각

    // 쪼개는 선 (아래 방향)
    for (var lv = 1; lv < 3; lv++) {
      L[lv].nodes.forEach(function (cx, i) {
        var px = L[lv - 1].nodes[Math.floor(i / 2)];
        s += '<line x1="' + px + '" y1="' + (L[lv - 1].y + H) + '" x2="' + cx + '" y2="' + (L[lv].y - 2) + '" stroke="#999" stroke-width="1.5" marker-end="url(#dc_arrow)" opacity="0">' +
          an("opacity", [[appear[lv], 0], [appear[lv] + 0.1, 1], [6.4, 1], [6.6, 0.3]]) + '</line>';
      });
    }
    // 합치는 화살표 (위 방향, 초록) — 선 옆으로 10px 비켜서
    for (lv = 2; lv >= 1; lv--) {
      L[lv].nodes.forEach(function (cx, i) {
        var pi = Math.floor(i / 2), px = L[lv - 1].nodes[pi];
        var t0 = solved[lv - 1][pi] - 0.6;
        var sg = cx < px ? -1 : 1;
        s += '<path d="M' + (cx - sg * 22) + ',' + (L[lv].y - 2) + ' L' + (px + sg * 28) + ',' + (L[lv - 1].y + H + 3) + '" fill="none" stroke="' + C.green + '" stroke-width="2.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" marker-end="url(#dc_up)" opacity="0">' +
          an("stroke-dashoffset", [[t0, 1], [t0 + 0.5, 0]]) + an("opacity", [[t0, 0], [t0 + 0.02, 1]]) + '</path>';
      });
    }
    // 상자
    L.forEach(function (lvl, li) {
      lvl.nodes.forEach(function (cx, i) {
        var pcx = li ? L[li - 1].nodes[Math.floor(i / 2)] : cx;
        var dy = li ? L[li - 1].y - lvl.y : 0;
        var t = appear[li], ts = solved[li][i];
        var g = '<g opacity="' + (li ? 0 : 1) + '">';
        if (li) g += mv([[t, (pcx - cx) + "," + dy], [t + 0.6, "0,0"]]) + show(t, D);
        g += '<rect x="' + (cx - lvl.w / 2) + '" y="' + lvl.y + '" width="' + lvl.w + '" height="' + H + '" rx="8" stroke-width="2" fill="' + C.purL + '" stroke="' + C.pur + '">' +
          an("fill", [[ts, C.purL], [ts + 0.05, C.greenL]]) + an("stroke", [[ts, C.pur], [ts + 0.05, C.green]]) + '</rect>';
        g += txt(cx, lvl.y + 26, lvl.label, 14, "#222", ' font-weight="700"');
        g += '<g opacity="0">' + txt(cx + lvl.w / 2 - 14, lvl.y + 26, "✓", 16, C.green, ' font-weight="700"') + show(ts, D) + '</g>';
        s += g + '</g>';
      });
      s += vis(appear[li], D, txt(712, lvl.y + 26, lvl.size, 13, C.muted, ' font-weight="700"'));
    });

    // ---- 단계 배지 (아래) ----
    var badges = [["Divide", 1.5, 4.5, C.pur, C.purL], ["Conquer", 4.5, 6.5, C.green, C.greenL], ["Combine", 6.5, 10, C.or, C.orL]];
    badges.forEach(function (b, i) {
      var x = 190 + i * 140;
      s += '<rect x="' + x + '" y="278" width="110" height="26" rx="13" stroke-width="2" fill="#f2f2f2" stroke="#ccc">' +
        an("fill", [[b[1], "#f2f2f2"], [b[1] + 0.05, b[4]], [b[2], b[4]], [b[2] + 0.05, "#fff"]]) +
        an("stroke", [[b[1], "#ccc"], [b[1] + 0.05, b[3]], [b[2], b[3]], [b[2] + 0.05, "#bbb"]]) + '</rect>';
      s += txt(x + 55, 296, (i + 1) + ". " + b[0], 13, "#333", ' font-weight="700"');
      if (i < 2) s += txt(x + 125, 296, "→", 14, "#777");
    });
    s += vis(9.0, D, txt(380 + 100, 76 + 26 - 26, "✓ 전체 문제의 답", 12, C.green, ' text-anchor="start" font-weight="700"'));

    // ---- 요점 ----
    s += txt(380, 328, "mergesort: 반으로 쪼개고(Divide) → 1칸짜리는 이미 정렬(Conquer) → 정렬된 두 반을 merge(Combine)", 12.5, C.muted);
    s += '</svg>';
    return s;
  }
};
