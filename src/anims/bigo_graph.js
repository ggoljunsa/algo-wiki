// ============================================================
// bigo_graph — L2 p.10–24 Big-O / Big-Ω / Big-Θ 를 그래프로
// T(n) = 0.9n + 3.5 + 1.2 sin(2n) (요동), g(n) = n, 상한 c·g(n) = 2n, 하한 c·g(n) = n/2.
// 좌표: x = 50 + 48n (n = 0…8), y = 300 − 14.5·값.  n₀ 는 build() 안에서 계산 (T 가 2n 위로 나오는 마지막 지점 뒤).
// 시간축(초): 0 T(n) → 1.5 g, c·g → 3 n₀ 이동 → 6 Big-O 초록 → 8 Big-Ω → 10.5 Big-Θ 샌드위치 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bigo_graph"] = {
  title: "Big-O · Big-Ω · Big-Θ — c 와 n₀ 를 그래프로",
  desc: "[[Big-O]]: ∃ c, n₀ &gt; 0 s.t. ∀ n ≥ n₀, 0 ≤ T(n) ≤ c·g(n). n₀ 보다 왼쪽에서 T(n) 이 삐져나와도 상관없다. 부등호를 뒤집으면 [[Big-Ω]], 둘 다면 [[Big-Θ]] ([[c와 n₀]])",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function r1(v) { return Math.round(v * 10) / 10; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + (extra || "") + '/>';
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

    // ---- 함수와 좌표 ----
    function T(n) { return 0.9 * n + 3.5 + 1.2 * Math.sin(2 * n); }
    function hi(n) { return 2 * n; }
    function lo(n) { return 0.5 * n; }
    function X(n) { return r1(50 + 44 * n); }
    function Y(v) { return r1(300 - 14.5 * v); }
    function curve(f, a, b) {
      var d = "", N = 40;
      for (var i = 0; i <= N; i++) { var n = a + (b - a) * i / N; d += (i ? " L" : "M") + X(n) + "," + Y(f(n)); }
      return d;
    }
    // 두 곡선 사이 영역 (a~b)
    function band(fTop, fBot, a, b) {
      var d = "", N = 30, i, n;
      for (i = 0; i <= N; i++) { n = a + (b - a) * i / N; d += (i ? " L" : "M") + X(n) + "," + Y(fTop(n)); }
      for (i = N; i >= 0; i--) { n = a + (b - a) * i / N; d += " L" + X(n) + "," + Y(fBot(n)); }
      return d + " Z";
    }
    var n0 = 0;
    for (var q = 0; q <= 8; q += 0.01) if (T(q) > hi(q)) n0 = q;
    n0 = Math.ceil(n0 * 10) / 10 + 0.1;
    // T 가 2n 위로 삐져나온 구간들 (n₀ 왼쪽)
    var bad = [], st = null;
    for (q = 0; q <= n0; q += 0.02) {
      if (T(q) > hi(q)) { if (st === null) st = q; } else if (st !== null) { bad.push([st, q]); st = null; }
    }
    if (st !== null) bad.push([st, n0]);

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Big-O Big-Omega Big-Theta 그래프 애니메이션">';
    s += '<defs><marker id="bg_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "T(n) = 수행 시간 — n 이 커질 때 어떻게 자라는가 (요동쳐도 된다)"],
      [1.5, 3, "c·g(n) 을 그린다 (g(n) = n, c = 2 → 2·g(n)) — 작은 n 에서는 T(n) 이 더 클 수도 있다"],
      [3, 6, "n₀ 를 오른쪽으로 옮기다가, 그 뒤로는 T(n) 이 c·g(n) 아래에만 있는 곳에서 멈춘다"],
      [6, 8, "Big-O: ∀ n ≥ n₀, T(n) ≤ c·g(n) → T(n) = O(g(n))  (상한)"],
      [8, 10.5, "부등호를 뒤집으면 Big-Ω: ∀ n ≥ n₀, c·g(n) ≤ T(n)  (c = 1/2 → g(n)/2, 하한)"],
      [10.5, 14, "둘 다 성립 → Big-Θ: c₁·g(n) ≤ T(n) ≤ c₂·g(n) — 샌드위치"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 칠하기 (곡선보다 먼저 그려 뒤에 깔림) ----
    bad.forEach(function (b) { s += vis(1.6, 6, '<path d="' + band(T, hi, b[0], b[1]) + '" fill="' + C.red + '" opacity="0.28"/>'); });
    s += vis(6, 8, '<path d="' + band(hi, T, n0, 8) + '" fill="' + C.green + '" opacity="0.25"/>');
    s += vis(8, 10.5, '<path d="' + band(T, lo, n0, 8) + '" fill="' + C.green + '" opacity="0.25"/>');
    s += vis(10.5, D, '<path d="' + band(hi, lo, n0, 8) + '" fill="' + C.green + '" opacity="0.22"/>');
    s += vis(1.6, 6, txt(X(0.15), Y(8.6), "T(n) &gt; 2·g(n) 이어도", 11.5, C.red, ' text-anchor="start" font-weight="700"') + txt(X(0.15), Y(7.6), "n₀ 왼쪽이면 괜찮다", 11, C.red, ' text-anchor="start"'));

    // ---- 축 ----
    s += '<line x1="50" y1="300" x2="420" y2="300" stroke="#555" stroke-width="1.5" marker-end="url(#bg_arrow)"/>';
    s += '<line x1="50" y1="300" x2="50" y2="48" stroke="#555" stroke-width="1.5" marker-end="url(#bg_arrow)"/>';
    s += txt(424, 316, "n", 13, "#555", ' font-style="italic"') + txt(42, 314, "0", 11, "#555");

    // ---- 곡선 ----
    function draw(d, col, t0, t1, extra) {
      return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"' + (extra || "") + '>' +
        an("stroke-dashoffset", [[t0, 1], [t1, 0]]) + '</path>';
    }
    s += draw(curve(function (n) { return n; }, 0, 8), C.muted, 1.5, 2.3, ' stroke-width="1.5"');
    s += vis(1.5, D, txt(X(8) + 6, Y(8) + 4, "g(n)", 12, C.muted, ' text-anchor="start"'));
    s += draw(curve(hi, 0, 8), C.red, 1.7, 2.8);
    s += vis(1.7, D, txt(X(8) + 6, Y(16) + 12, "2·g(n)", 12, C.red, ' text-anchor="start" font-weight="700"'));
    s += draw(curve(T, 0, 8), C.blue, 0.2, 1.4);
    s += vis(0.2, D, txt(X(8) + 6, Y(T(8)) + 4, "T(n)", 13, C.blue, ' text-anchor="start" font-weight="700"'));
    s += '<g opacity="0">' + '<path d="' + curve(lo, 0, 8) + '" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="6 4"/>' +
      txt(X(8) + 6, Y(4) + 4, "g(n)/2", 12, C.red, ' text-anchor="start" font-weight="700"') + show(8, D) + '</g>';

    // ---- n₀ 세로선 (3~6초에 오른쪽으로 이동) ----
    s += '<g opacity="0">' + mv([[3, X(0.4) + ",0"], [5.6, X(n0) + ",0"]]) +
      '<line x1="0" y1="52" x2="0" y2="300" stroke="' + C.or + '" stroke-width="2.5" stroke-dasharray="5 4"/>' +
      '<rect x="-16" y="303" width="32" height="18" rx="4" fill="' + C.orL + '" stroke="' + C.or + '"/>' + txt(0, 317, "n₀", 13, "#8a5a14", ' font-weight="700"') +
      show(3, D) + '</g>';
    s += vis(5.6, D, txt(X(n0) + 6, 64, "∀ n ≥ n₀ →", 12, C.green, ' text-anchor="start" font-weight="700"'));

    // ---- 정의 카드 (오른쪽) ----
    function card(y, h, lines, t0, t1) {
      var g = '<rect x="490" y="' + y + '" width="258" height="' + h + '" rx="8" stroke-width="2" fill="#f4f4f4" stroke="#ccc">' +
        an("fill", [[t0, "#f4f4f4"], [t0 + 0.05, C.greenL]].concat(t1 < D ? [[t1, C.greenL], [t1 + 0.05, "#fff"]] : [])) +
        an("stroke", [[t0, "#ccc"], [t0 + 0.05, C.green]].concat(t1 < D ? [[t1, C.green], [t1 + 0.05, "#9ccfa9"]] : [])) + '</rect>';
      var inner = "";
      lines.forEach(function (l, i) { inner += txt(502, y + 20 + i * 18, l[0], l[1], l[2], ' text-anchor="start"' + (l[3] ? ' font-weight="700"' : "")); });
      return g + vis(t0, D, inner);
    }
    s += card(52, 84, [["T(n) = O(g(n))  iff", 13, C.pur, 1], ["∃ c, n₀ &gt; 0 s.t. ∀ n ≥ n₀,", 12, "#222"], ["0 ≤ T(n) ≤ c·g(n)", 12.5, C.red, 1], ["상한 (upper bound)", 11, C.muted]], 6, 8);
    s += card(146, 84, [["T(n) = Ω(g(n))  iff", 13, C.pur, 1], ["∃ c, n₀ &gt; 0 s.t. ∀ n ≥ n₀,", 12, "#222"], ["0 ≤ c·g(n) ≤ T(n)", 12.5, C.red, 1], ["하한 (lower bound) — Switched these!", 11, C.muted]], 8, 10.5);
    s += card(240, 70, [["T(n) = Θ(g(n))  iff", 13, C.pur, 1], ["T(n) = O(g(n))  AND  T(n) = Ω(g(n))", 11.5, "#222"], ["상한 + 하한 = 샌드위치", 11, C.muted]], 10.5, D);

    // ---- 요점 ----
    s += txt(380, 348, "c 와 n₀ 하나만 찾으면 증명 끝 — n₀ 왼쪽(작은 n)에서의 모양은 상관없고, n₀ 의 정답은 하나가 아니다", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
