// ============================================================
// recursion_tree_levels — L3 p.66–73 Recursion Tree Method, T(n) ≤ 2T(n/2) + cn, T(1) ≤ c
// 노드 = 그 부분 문제에서 하는 일 (c × input size). 오른쪽 = 레벨 합.
// 시간축(초): 0 루트 → 1.5 레벨1 → 3 레벨2 → 4.5 리프 → 6 log₂n levels → 8 총합 → 10 O(n log n) → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["recursion_tree_levels"] = {
  title: "재귀 트리 — 레벨마다 cn, 레벨 수 log₂n",
  desc: "[[recursion tree method]]: T(n) ≤ 2T(n/2) + cn 의 트리를 한 레벨씩 그리면 레벨 합이 모두 cn, 레벨 수는 log₂n → Runtime cn log₂n + cn = O(n log n)",
  duration: 13,
  build: function () {
    var D = 13;
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

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="재귀 트리 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "T(n) ≤ 2T(n/2) + cn — 루트: 크기 n 을 merge 하는 일 cn"],
      [1.5, 3, "크기 n/2 부분 문제 2개 — 각자 cn/2, 합 cn"],
      [3, 4.5, "크기 n/4 부분 문제 4개 — 각자 cn/4, 합 cn"],
      [4.5, 6, "크기 1 인 리프 n 개 — T(1) ≤ c, 합 cn"],
      [6, 8, "크기가 매번 반으로 → 1 이 될 때까지 log₂n levels"],
      [8, 10, "Runtime = (레벨 수) × (레벨당 일) + 리프 = cn log₂n + cn"],
      [10, 13, "cn log₂n + cn = O(n log(n)) — 같은 논리로 Ω 도 성립 → Θ(n log n)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });
    s += txt(300, 52, "노드 = 그 부분 문제에서 하는 일 (Runtime of merge is c × input size)", 11.5, C.muted);

    // ---- 트리 ----
    var LV = [
      { y: 72, w: 80, xs: [300], lab: "cn", t: 0.2, sum: "cn" },
      { y: 132, w: 72, xs: [170, 430], lab: "cn/2", t: 1.5, sum: "2 × cn/2 = cn" },
      { y: 192, w: 64, xs: [105, 235, 365, 495], lab: "cn/4", t: 3, sum: "4 × cn/4 = cn" },
      { y: 286, w: 40, xs: [], lab: "c", t: 4.5, sum: "n × c = cn" }
    ];
    for (var i = 0; i < 8; i++) LV[3].xs.push(76 + i * 64);
    var NH = 30;
    // 선
    [1, 2].forEach(function (k) {
      LV[k].xs.forEach(function (x, j) {
        var px = LV[k - 1].xs[j >> 1];
        s += vis(LV[k].t, D, '<line x1="' + px + '" y1="' + (LV[k - 1].y + NH) + '" x2="' + x + '" y2="' + LV[k].y + '" stroke="#aaa" stroke-width="1.5"/>');
      });
    });
    // 레벨2 → … → 리프
    var dots = "";
    LV[2].xs.forEach(function (x, j) {
      dots += '<line x1="' + x + '" y1="' + (LV[2].y + NH) + '" x2="' + x + '" y2="' + (LV[2].y + NH + 12) + '" stroke="#aaa" stroke-width="1.5"/>';
      dots += txt(x, 248, "…", 16, "#999");
      [LV[3].xs[2 * j], LV[3].xs[2 * j + 1]].forEach(function (lx) {
        dots += '<line x1="' + x + '" y1="258" x2="' + lx + '" y2="' + LV[3].y + '" stroke="#ccc" stroke-width="1.5" stroke-dasharray="3 3"/>';
      });
    });
    s += vis(4.5, D, dots);
    // 노드
    LV.forEach(function (L, k) {
      var g = "";
      L.xs.forEach(function (x) {
        g += '<rect x="' + (x - L.w / 2) + '" y="' + L.y + '" width="' + L.w + '" height="' + NH + '" rx="15" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="2"/>';
        g += txt(x, L.y + 20, L.lab, 14, C.pur, ' font-weight="700"');
      });
      s += vis(L.t, D, g);
      // 레벨 강조 띠 + 합
      s += vis(L.t + 0.5, L.t + 1.5, '<rect x="30" y="' + (L.y - 4) + '" width="560" height="' + (NH + 8) + '" rx="6" fill="' + C.or + '" opacity="0.14"/>');
      s += vis(L.t + 0.6, D, txt(612, L.y + 20, L.sum, 13, C.green, ' text-anchor="start" font-weight="700"'));
    });
    s += vis(4.5, D, txt(640, 252, "⋮", 16, C.green));
    s += txt(612, 60, "레벨 합", 12, C.muted, ' text-anchor="start"');

    // ---- log₂n levels 괄호 ----
    s += vis(6, D, '<path d="M596,' + LV[0].y + ' L588,' + LV[0].y + ' L588,' + (LV[2].y + NH + 30) + ' L596,' + (LV[2].y + NH + 30) + '" fill="none" stroke="' + C.or + '" stroke-width="2.5"/>' +
      '<rect x="514" y="112" width="66" height="40" rx="6" fill="' + C.orL + '" stroke="' + C.or + '"/>' +
      txt(547, 129, "log₂n", 13, "#8a5a14", ' font-weight="700"') + txt(547, 145, "levels", 12, "#8a5a14"));

    // ---- 총합 ----
    s += vis(8, D, '<rect x="150" y="326" width="460" height="30" rx="8" fill="' + C.greenL + '" stroke="' + C.green + '" stroke-width="2"/>' +
      txt(424, 346, "Runtime  cn log₂n + cn", 15, C.green, ' text-anchor="end" font-weight="700"'));
    s += vis(10, D, txt(434, 346, "= O(n log(n))", 15, C.red, ' text-anchor="start" font-weight="700"'));
    s += '</svg>';
    return s;
  }
};
