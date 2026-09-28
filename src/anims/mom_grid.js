// ============================================================
// mom_grid — L4 p.77–85 median of medians 격자와 3n/10 논증
// A (n=23) → 5개씩 5그룹(열) → 열마다 세로 정렬, 가운데 = sub-median → 열을 sub-median 순으로 가로 정렬
//   → median of medians 15 ★ → 15 보다 확실히 작은 영역(초록 8개) / 확실히 큰 영역(빨강 7개)
// 시간축(초): 0 한 줄 → 1.5 그룹 → 3.2 세로 정렬 → 5 가로 정렬 → 6.8 ★15 → 8.3 작은 쪽 → 11 큰 쪽 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["mom_grid"] = {
  title: "Median of medians — 5개씩 그룹, sub-median, 3n/10",
  desc: "[[median of medians]]: 5개씩 그룹 → 그룹마다 [[sub-median]] → 그 median(15)을 pivot 으로. 격자를 정렬해 보면 15 보다 확실히 작은 원소가 최소 3n/10 − 4 개 ([[3n/10 논증]]) — 진짜 median(12)은 아니어도 충분히 가깝다",
  duration: 14,
  build: function () {
    var D = 14;
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

    // 슬라이드 p.78 의 그룹 (A 를 5개씩 끊은 것)
    var G = [[2, 11, 9, 3, 13], [5, 16, 4, 6, 12], [17, 23, 10, 7, 21], [8, 18, 15, 1, 20], [22, 19, 14]];
    var A = [].concat.apply([], G);
    var SG = G.map(function (g) { return g.slice().sort(function (a, b) { return a - b; }); });
    var med = SG.map(function (g) { return g[(g.length - 1) >> 1]; });            // 9, 6, 17, 15, 19
    var order = [0, 1, 2, 3, 4].sort(function (a, b) { return med[a] - med[b]; });  // sub-median 순 → [1,0,3,2,4]
    var MOM = 15;
    var TW = 28, TH = 26;
    function Xs(c) { return 150 + c * 64; }
    function Yr(r) { return 84 + r * 34; }
    function off(g) { return G[g].length === 3 ? 1 : 0; }                          // 3개짜리 그룹은 가운데 정렬

    var s = '<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="median of medians 격자 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "A = [2, 11, 9, 3, 13, 5, 16, 4, 6, 12, …, 19, 14]  (n = 23)"],
      [1.5, 3.2, "Divide A into g = ⌈n/5⌉ groups of at most 5 elements"],
      [3.2, 5.0, "각 그룹을 세로로 정렬 → 가운데가 그 그룹의 sub-median (주황)"],
      [5.0, 6.8, "그룹들을 sub-median 크기순으로 가로 정렬했다고 상상"],
      [6.8, 8.3, "sub-median 들의 median = median of medians = 15 ★ → 이것을 pivot 으로"],
      [8.3, 11, "15 보다 확실히 작은 원소: 왼쪽 그룹들의 sub-median 과 그 위 (초록)"],
      [11, 14, "대칭으로 오른쪽 아래는 15 보다 확실히 큼 → 한쪽이 7n/10 + 3 을 넘지 못한다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 영역 음영 (토큰보다 먼저) ----
    function cellBg(c, r, col) { return '<rect x="' + (Xs(c) - 18) + '" y="' + (Yr(r) - 4) + '" width="64" height="34" fill="' + col + '" opacity="0.25"/>'; }
    var small = "", big = "";
    for (var c = 0; c < 5; c++) {
      var g = order[c], n = SG[g].length, o = off(g);
      for (var r = 0; r < n; r++) {
        var v = SG[g][r];
        if (c < 2 && r <= (n - 1) >> 1) small += cellBg(c, r + o, C.green);
        else if (c === 2 && v < MOM) small += cellBg(c, r + o, C.green);
        if (c > 2 && r >= (n - 1) >> 1) big += cellBg(c, r + o, C.red);
        else if (c === 2 && v > MOM) big += cellBg(c, r + o, C.red);
      }
    }
    s += vis(8.3, D, small);
    s += vis(11, D, big);
    s += vis(3.2, D, txt(Xs(0) - 26, Yr(2) + 18, "sub-median →", 12, C.or, ' text-anchor="end" font-weight="700"'));

    // ---- 토큰 ----
    A.forEach(function (v, i) {
      var g = Math.floor(i / 5), idx = i % 5, rank = SG[g].indexOf(v), o = off(g), slot = order.indexOf(g);
      var p0 = (22 + 31 * i) + ",46";
      var p1 = Xs(g) + "," + Yr(idx + o);
      var p2 = Xs(g) + "," + Yr(rank + o);
      var p3 = Xs(slot) + "," + Yr(rank + o);
      var isMed = v === med[g];
      var pts = [[0, p0], [1.5 + g * 0.15, p0], [2.4 + g * 0.15, p1], [3.4, p1], [4.3, p2], [5.2, p2], [6.3, p3]];
      var g1 = '<g transform="translate(' + p0 + ')">' + mv(pts);
      var fillP = [[0, C.blueL]], strP = [[0, C.blue]];
      if (isMed) { fillP.push([4.5, C.blueL], [4.55, C.orL]); strP.push([4.5, C.blue], [4.55, C.or]); }
      if (v === MOM) { fillP.push([6.8, C.orL], [6.85, C.or]); strP.push([6.8, C.or], [6.85, "#b36f14"]); }
      g1 += '<rect width="' + TW + '" height="' + TH + '" rx="4" stroke-width="2" fill="' + C.blueL + '" stroke="' + C.blue + '">' + an("fill", fillP) + an("stroke", strP) + (isMed ? an("rx", [[4.5, 4], [4.7, 13]]) : "") + '</rect>';
      g1 += txt(TW / 2, 18, String(v), 13, "#222", ' font-weight="700"');
      if (v === MOM) g1 += vis(6.8, D, txt(TW + 6, 2, "★", 18, C.red, ' font-weight="700"'));
      s += g1 + '</g>';
    });

    // ---- 오른쪽 설명 ----
    var info = [
      [1.5, 76, "g = ⌈n/5⌉ = ⌈23/5⌉ = 5 groups", "#222", 1],
      [4.5, 102, "sub-median: 9, 6, 17, 15, 19", C.or, 1],
      [6.8, 128, "median of medians = 15 ★", C.red, 1],
      [6.8, 146, "p = SELECT([p₁, …, pₘ], m/2)", C.muted, 0],
      [8.3, 176, "초록: 15 보다 확실히 작음 = 8개", C.green, 1],
      [8.3, 194, "≥ 3·(⌈g/2⌉ − 2) + 2 ≥ 3n/10 − 4", C.green, 0],
      [11, 222, "빨강: 15 보다 확실히 큼 = 7개", C.red, 1],
      [11, 240, "→ len(left), len(right) ≤ 7n/10 + 3", C.red, 0],
      [11.8, 266, "실제 median 은 12 — 15 는 '충분히 가까운' pivot", C.muted, 0]
    ];
    info.forEach(function (t) { s += vis(t[0], D, txt(476, t[1], t[2], 12.5, t[3], ' text-anchor="start"' + (t[4] ? ' font-weight="700"' : ""))); });

    // ---- 요점 ----
    s += txt(380, 316, "pivot = median of medians 이면 양쪽에 최소 3n/10 − 4 개씩 → T(n) ≤ T(n/5) + T(7n/10) + O(n) = O(n)", 12.5, C.muted);
    s += '</svg>';
    return s;
  }
};
