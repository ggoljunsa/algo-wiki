// ============================================================
// harmonic_sum — L6 p.36–42 (PNG 34–40) 조화급수 Σ 1/c ≈ ln n → quicksort 기대 비교 횟수 O(n log n)
// 시간축(초): 0 축 → 1.5~5.7 막대 1, 1/2, …, 1/10 가 차례로 (0.42초 간격) → 6~7.5 곡선 1/x 그려짐
//   → 7.6 곡선 아래 넓이 음영 = ln n → 8 Σ 1/c ≤ 1 + ln n → 10 2n·ln n = O(n log n) → 12
// 좌표: 원점 (80,300), x 1칸 = 58px, y 1 = 200px, n = 10
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["harmonic_sum"] = {
  title: "조화급수 — 막대 1/c 의 넓이 ≈ ln n (12초)",
  desc: "폭 1, 높이 1/c 막대를 세우고 곡선 1/x 를 겹치면 Σ 1/c ≤ 1 + ln n. 그래서 [[quicksort 기대 비교 횟수 증명|quicksort 의 기대 비교 횟수]] ≤ 2n·ln n = O(n log n) — [[조화급수]]",
  duration: 12,
  build: function () {
    var D = 12;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + (extra || "") + '/>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    // 키프레임 [[초, 값], …] → 0~D 전체 values/keyTimes
    function kf(pts) {
      var ks = [], vs = [];
      if (pts[0][0] > 0) { ks.push(0); vs.push(pts[0][1]); }
      pts.forEach(function (p) { ks.push(r4(p[0] / D)); vs.push(p[1]); });
      if (pts[pts.length - 1][0] < D) { ks.push(1); vs.push(pts[pts.length - 1][1]); }
      return 'values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function anim(attr, pts) { return '<animate attributeName="' + attr + '" ' + kf(pts) + '/>'; }


    var OX = 80, OY = 300, UX = 58, UY = 200, N = 10;
    function X(x) { return r4(OX + UX * x); }
    function Y(y) { return r4(OY - UY * y); }
    function sub(t) { return '<tspan baseline-shift="sub" font-size="72%">' + t + '</tspan>'; }
    function sup(t) { return '<tspan baseline-shift="super" font-size="72%">' + t + '</tspan>'; }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="조화급수 애니메이션">';
    var caps = [
      [0, 1.5, "Σ 1/c 를 넓이로 본다 — 폭 1, 높이 1/c 인 막대를 세운다"],
      [1.5, 6, "c = 1, 2, 3, … n: 막대 높이 1, 1/2, 1/3, … 1/n"],
      [6, 8, "곡선 y = 1/x 를 겹치면 — 둘째 막대부터는 모두 곡선 아래에 들어간다"],
      [8, 10, "Σ 1/c ≤ 1 + ∫" + sub("1") + sup("n") + " dx/x = 1 + ln n"],
      [10, D, "E[비교 횟수] ≤ 2n · Σ 1/c ≈ 2n ln n = O(n log n)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // 곡선 아래 넓이 (x = 1..n)
    var pts = [], k, x;
    for (k = 0; k <= 36; k++) { x = 1 + (N - 1) * k / 36; pts.push(X(x) + "," + Y(1 / x)); }
    s += vis(7.6, D, '<polygon points="' + X(1) + ',' + OY + ' ' + pts.join(" ") + ' ' + X(N) + ',' + OY + '" fill="' + C.redL + '" opacity="0.7"/>');

    // 막대
    for (var c = 1; c <= N; c++) {
      var x0 = X(c - 1), h = UY / c, t = 1.5 + 0.42 * (c - 1), first = c === 1;
      s += '<rect x="' + x0 + '" y="' + OY + '" width="' + UX + '" height="0" fill="' + (first ? C.orL : C.blueL) + '" fill-opacity="0.85" stroke="' + (first ? C.or : C.blue) + '" stroke-width="1.5">' +
        anim("height", [[t, 0], [t + 0.3, r4(h)]]) + anim("y", [[t, OY], [t + 0.3, r4(OY - h)]]) + '</rect>';
      var lab = first ? "1" : "1/" + c;
      s += vis(t + 0.3, D, txt(r4(x0 + UX / 2), r4(OY - h - 6), lab, c <= 6 ? 12 : 10, first ? C.or : C.blue, ' font-weight="700"'));
    }
    // 곡선 1/x (선 그리기)
    var len = 0, prev = null;
    pts.forEach(function (p) { var q = p.split(",").map(Number); if (prev) len += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; });
    len = Math.ceil(len);
    s += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + C.red + '" stroke-width="3" stroke-dasharray="' + len + '" stroke-dashoffset="' + len + '">' +
      anim("stroke-dashoffset", [[6, len], [7.5, 0]]) + '</polyline>';
    s += vis(7.2, D, txt(X(1.35), Y(0.93), "y = 1/x", 14, C.red, ' text-anchor="start" font-weight="700"'));

    // 축
    s += '<line x1="' + OX + '" y1="' + OY + '" x2="' + (X(N) + 22) + '" y2="' + OY + '" stroke="#555" stroke-width="1.5"/>';
    s += '<line x1="' + OX + '" y1="' + OY + '" x2="' + OX + '" y2="' + (Y(1) - 22) + '" stroke="#555" stroke-width="1.5"/>';
    for (c = 0; c <= N; c++) s += txt(X(c), OY + 17, String(c), 11, C.muted);
    s += txt(X(N) + 30, OY + 5, "x", 12, C.muted);
    s += '<line x1="' + (OX - 5) + '" y1="' + Y(1) + '" x2="' + OX + '" y2="' + Y(1) + '" stroke="#555"/>' + txt(OX - 9, Y(1) + 4, "1", 11, C.muted, ' text-anchor="end"');

    // 넓이 라벨
    s += vis(8, D, '<line x1="' + X(4.1) + '" y1="' + Y(0.47) + '" x2="' + X(3.6) + '" y2="' + Y(0.3) + '" stroke="' + C.red + '" stroke-width="1.5"/>' +
      txt(X(4.15), Y(0.5), "곡선 아래 넓이 (x = 1..n) = ∫" + sub("1") + sup("n") + " dx/x = ln n", 13, C.red, ' text-anchor="start" font-weight="700"') +
      txt(X(0.5), Y(1) - 22, "첫 막대 = 1", 12, C.or, ' font-weight="700"'));

    // 결론 상자
    s += vis(10, D, box(380, 64, 360, 92, "#fff", C.green) +
      txt(560, 86, "E[비교 횟수] = Σ" + sub("a") + " Σ" + sub("c") + " 2/(c+1)", 13, C.ink) +
      txt(560, 108, "≤ 2n · Σ" + sub("c=1..n") + " 1/c ≤ 2n (1 + ln n)", 13, C.ink) +
      txt(560, 136, "= O(n log n)", 17, C.green, ' font-weight="700"'));

    s += txt(380, 346, "조화급수 Σ 1/c ≈ ln n — randomized quicksort 의 기대 비교 횟수 ≤ 2n ln n = O(n log n)", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
