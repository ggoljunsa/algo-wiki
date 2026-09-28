// ============================================================
// expected_vs_worst — L6 p.5 (PNG 5) 두 시나리오: expected running time vs randomized worst-case
// 시간축(초): 0 질문 → 1.5 Scenario 1: 적이 입력 → 2.5 내가 주사위(굴러감) → 3~5.4 수행 시간 분포 막대 → 5.6 E[T] 선
//   → 6.5 Scenario 2: 적이 입력 → 7.6 적이 주사위까지 고정 → 8.6 항상 최악 한 값 → 10.5 정리 → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["expected_vs_worst"] = {
  title: "두 시나리오 — expected running time vs worst-case (13초)",
  desc: "Scenario 1: 적([[adversary]])이 입력만 고르고 주사위는 내가 → 수행 시간은 random variable → [[expected running time]]. Scenario 2: 적이 주사위까지 고정 → [[randomized worst-case|worst-case]]",
  duration: 13,
  build: function () {
    var D = 13;
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
    function move(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kf(pts) + '/>'; }


    // 주사위: 중심 (x,y), 한 변 sz, 눈 face
    var PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
      5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    function die(x, y, sz, face, stroke, fill) {
      var g = '<rect x="' + (x - sz / 2) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '" rx="6" fill="' + (fill || "#fff") + '" stroke="' + stroke + '" stroke-width="2.5"/>';
      PIPS[face].forEach(function (p) { g += '<circle cx="' + (x + p[0] * sz * 0.27) + '" cy="' + (y + p[1] * sz * 0.27) + '" r="' + (sz * 0.08) + '" fill="' + stroke + '"/>'; });
      return g;
    }
    function arrow(x1, y1, x2, y2, color) {
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="2.2" marker-end="url(#ew_arr)"/>';
    }
    function badguy(x, y) {
      return box(x - 44, y - 17, 88, 34, C.redL, C.red) + txt(x, y + 5, "적 (bad guy)", 13, C.red, ' font-weight="700"');
    }
    function inputBox(x, y) {
      return box(x - 36, y - 17, 72, 34, C.blueL, C.blue) + txt(x, y + 5, "입력 A", 13, C.blue, ' font-weight="700"');
    }
    // 히스토그램 축: 패널 왼쪽 x0
    function axes(x0) {
      return '<line x1="' + (x0 + 20) + '" y1="282" x2="' + (x0 + 320) + '" y2="282" stroke="#555" stroke-width="1.5" marker-end="url(#ew_arr)"/>' +
        '<line x1="' + (x0 + 20) + '" y1="282" x2="' + (x0 + 20) + '" y2="168" stroke="#555" stroke-width="1.5"/>' +
        txt(x0 + 318, 298, "수행 시간 →", 11, C.muted, ' text-anchor="end"') +
        txt(x0 + 26, 176, "빈도", 11, C.muted, ' text-anchor="start"');
    }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Expected vs worst-case 애니메이션">';
    s += '<defs><marker id="ew_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';
    var caps = [
      [0, 1.5, "randomized algorithm 의 수행 시간을 어떻게 재나? — 변수가 둘: 입력, random choice"],
      [1.5, 6.5, "Scenario 1: 적이 입력을 고르고, 나는 진짜 주사위를 굴린다 → 수행 시간 = random variable"],
      [6.5, 10.5, "Scenario 2: 적이 입력도 고르고 주사위까지 고정 → 수행 시간은 random 이 아니다"],
      [10.5, D, "expected = fixed input, average over random choices / worst-case = 적이 주사위까지"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ===== 왼쪽 패널: Scenario 1 =====
    var L = box(12, 44, 360, 266, "#fff", "#c9d2e0") + txt(192, 66, "Scenario 1 → expected running time", 14, C.blue, ' font-weight="700"');
    L += vis(1.5, D, badguy(70, 112) + arrow(116, 112, 146, 112, "#555") + inputBox(186, 112) + txt(70, 146, "① 입력을 고름", 11, C.red));
    L += vis(2.5, D, arrow(224, 112, 262, 112, "#555") + txt(300, 146, "② 내가 굴림", 11, C.blue));
    // 굴러가는 주사위 (2.5~6.3 초 동안 0.38초마다 눈이 바뀌고, 마지막 눈에서 멈춤)
    var faces = [3, 5, 2, 6, 1, 4, 2, 5, 3, 6, 4];
    faces.forEach(function (f, k) {
      var t0 = 2.5 + 0.38 * k, pts = [[t0, 0], [t0 + 0.01, 1]];
      if (k < faces.length - 1) { pts.push([t0 + 0.38, 1]); pts.push([t0 + 0.39, 0]); }
      L += '<g opacity="0">' + die(300, 112, 36, f, C.blue) + anim("opacity", pts) + '</g>';
    });
    L += axes(12);
    var hs = [0.18, 0.55, 0.95, 1, 0.78, 0.5, 0.3, 0.17, 0.08, 0.04];
    hs.forEach(function (h, i) {
      var x = 42 + 28 * i, hh = h * 96, t = 3 + 0.24 * i;
      L += '<rect x="' + x + '" y="282" width="24" height="0" fill="' + C.blueL + '" stroke="' + C.blue + '" stroke-width="1.5">' +
        anim("height", [[t, 0], [t + 0.3, hh]]) + anim("y", [[t, 282], [t + 0.3, 282 - hh]]) + '</rect>';
    });
    L += vis(5.6, D, '<line x1="152" y1="172" x2="152" y2="282" stroke="' + C.or + '" stroke-width="3" stroke-dasharray="6 4"/>' +
      txt(160, 186, "E[T] = 평균", 13, C.or, ' text-anchor="start" font-weight="700"') +
      txt(160, 202, "(입력 고정, 주사위에 대해)", 11, C.or, ' text-anchor="start"'));
    s += '<g>' + L + '<animate attributeName="opacity" ' + kf([[6.4, 1], [6.6, 0.45], [10.4, 0.45], [10.6, 1]]) + '/></g>';

    // ===== 오른쪽 패널: Scenario 2 =====
    var R = box(388, 44, 360, 266, "#fff", "#c9d2e0") + txt(568, 66, "Scenario 2 → worst-case running time", 14, C.red, ' font-weight="700"');
    R += vis(6.5, D, badguy(446, 112) + arrow(492, 112, 522, 112, "#555") + inputBox(562, 112) + txt(446, 146, "① 입력을 고름", 11, C.red));
    R += vis(7.6, D, arrow(600, 112, 638, 112, C.red) + die(676, 112, 36, 6, C.red, C.redL) +
      txt(676, 146, "② 주사위도 고정", 11, C.red, ' font-weight="700"') +
      '<path d="M600,94 C620,78 650,78 664,90" fill="none" stroke="' + C.red + '" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#ew_arr)"/>');
    R += axes(388);
    R += '<rect x="660" y="282" width="24" height="0" fill="' + C.red + '">' + anim("height", [[8.6, 0], [8.9, 96]]) + anim("y", [[8.6, 282], [8.9, 186]]) + '</rect>';
    R += vis(8.9, D, txt(652, 196, "항상 이 한 값", 13, C.red, ' text-anchor="end" font-weight="700"') +
      txt(652, 212, "= worst-case", 12, C.red, ' text-anchor="end"') + txt(652, 228, "(random 이 아님)", 11, C.red, ' text-anchor="end"'));
    s += '<g>' + R + '<animate attributeName="opacity" ' + kf([[0, 0.3], [6.4, 0.3], [6.6, 1]]) + '/></g>';

    // ===== 정리 =====
    s += vis(10.5, D, box(120, 318, 520, 26, C.orL, C.or) +
      txt(380, 336, "randomized quicksort — expected Θ(n log n) · worst-case Θ(n²)", 13, C.ink, ' font-weight="700"'));
    s += '<g>' + txt(380, 336, "같은 알고리즘이라도 expected 와 worst-case 는 다른 질문에 대한 답이다", 12, C.muted) + show(0, 10.4).replace('values="0;0;1;1;0;0"', 'values="1;1;1;1;0;0"') + '</g>';
    s += '</svg>';
    return s;
  }
};
