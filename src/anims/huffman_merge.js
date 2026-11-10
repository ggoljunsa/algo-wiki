// ============================================================
// huffman_merge — L14 p.71–76: 빈도 A45 B13 C12 D16 E9 F5 에서 가장 작은 두 개를 합쳐 나간다
// 합치는 순서 (Python heapq 검산과 같음, 왼쪽 = 0, 오른쪽 = 1 은 p.76 그림 배치대로):
//   E9 + F5 = 14 → C12 + B13 = 25 (그림은 B 왼쪽) → D16 + 14 = 30 → 25 + 30 = 55 → A45 + 55 = 100
// 코드: A 0, B 100, C 101, D 110, E 1110, F 1111
// 기대 길이 = 1·0.45 + 3·(0.13+0.12+0.16) + 4·(0.09+0.05) = 0.45 + 1.23 + 0.56 = 2.24
// 시간축(초): 0–1.5 초기 → 1.5, 3.3, 5.1, 6.9, 8.7 merge → 10.5 코드 → 11.8 기대 길이 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["huffman_merge"] = {
  title: "Huffman coding — 가장 작은 두 개를 합친다 (14초)",
  desc: "L14 p.71–76. 빈도가 가장 작은 두 덩어리를 골라 새 노드(빈도 합)로 묶는 일을 하나가 남을 때까지 반복한다. 왼쪽 가지 0, 오른쪽 가지 1 을 읽으면 [[prefix-free code]] 가 나오고, 기대 길이는 2.24 비트다. [[Huffman coding]].",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", ink: "#222", line: "#b9c4d8" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }

    var M = [1.5, 3.3, 5.1, 6.9, 8.7];       // merge 시각
    var TC = 10.5, TE = 11.8;
    // 최종 트리 위치 (p.76 배치)
    var P = {
      "100": [300, 92], A: [170, 148], "55": [430, 148], "25": [335, 204], "30": [560, 204],
      B: [285, 262], C: [385, 262], D: [505, 262], "14": [620, 262], E: [570, 312], F: [670, 312]
    };
    var leaf = { A: 45, B: 13, C: 12, D: 16, E: 9, F: 5 };
    var code = { A: "0", B: "100", C: "101", D: "110", E: "1110", F: "1111" };
    // [부모, 왼쪽, 오른쪽, 시각 index]
    var merges = [["14", "E", "F", 0], ["25", "B", "C", 1], ["30", "D", "14", 2], ["55", "25", "30", 3], ["100", "A", "55", 4]];
    var appear = { A: M[4], B: M[1], C: M[1], D: M[2], E: M[0], F: M[0] };
    merges.forEach(function (m) { appear[m[0]] = M[m[3]]; });

    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Huffman 트리 만들기 애니메이션">';
    var caps = [
      [0, M[0], "글자마다 빈도(%)를 적은 덩어리 6개에서 시작한다"],
      [M[0], M[1], "가장 작은 두 개 E:9, F:5 를 합친다 → 14"],
      [M[1], M[2], "남은 것 중 가장 작은 두 개 C:12, B:13 → 25"],
      [M[2], M[3], "가장 작은 두 개 14, D:16 → 30"],
      [M[3], M[4], "가장 작은 두 개 25, 30 → 55"],
      [M[4], TC, "마지막 두 개 A:45, 55 → 100. 덩어리가 하나 남으면 끝"],
      [TC, TE, "왼쪽 가지 0, 오른쪽 가지 1. 루트에서 리프까지 읽으면 코드"],
      [TE, D, "기대 길이 = Σ 빈도 × 깊이 = 2.24 비트"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 남은 덩어리 줄 (빈도 순) ----
    var states = [
      [["F", 5], ["E", 9], ["C", 12], ["B", 13], ["D", 16], ["A", 45]],
      [["C", 12], ["B", 13], ["", 14], ["D", 16], ["A", 45]],
      [["", 14], ["D", 16], ["", 25], ["A", 45]],
      [["", 25], ["", 30], ["A", 45]],
      [["A", 45], ["", 55]],
      [["", 100]]
    ];
    // 합치는 장면 동안에는 합치기 전 상태(가장 작은 두 개가 주황)를 보여 준다
    var ST = [0, M[1], M[2], M[3], M[4], TC];
    states.forEach(function (st, i) {
      var g = txt(24, 58, "남은 덩어리:", 12, C.muted, ' text-anchor="start" font-weight="700"');
      st.forEach(function (it, j) {
        var x = 108 + j * 58, small = j < 2 && st.length > 1;
        g += '<rect x="' + x + '" y="43" width="52" height="22" rx="5" fill="' + (small ? C.orL : (it[0] ? C.greenL : C.purL)) + '" stroke="' + (small ? C.or : (it[0] ? C.green : C.pur)) + '" stroke-width="' + (small ? 2.2 : 1.3) + '"/>';
        g += txt(x + 26, 59, (it[0] ? it[0] + ":" : "") + it[1], 12, C.ink, ' font-weight="700"');
      });
      s += vis(ST[i], i < 5 ? ST[i + 1] : D, g);
    });

    // ---- 트리 ----
    merges.forEach(function (m) {
      var t = M[m[3]], p = P[m[0]];
      [m[1], m[2]].forEach(function (c, k) {
        var q = P[c];
        var e = '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="' + C.blue + '" stroke-width="2"/>';
        s += vis(t, D, e);
        var mx = (p[0] + q[0]) / 2 + (k ? 10 : -10), my = (p[1] + q[1]) / 2 - 4;
        s += vis(TC, D, txt(mx, my, k ? "1" : "0", 14, C.blue, ' font-weight="700"'));
        // 이번에 합쳐지는 두 개 강조
        s += vis(t, t + 1.5, '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="25" fill="none" stroke="' + C.or + '" stroke-width="3"/>');
      });
    });
    // 내부 노드
    merges.forEach(function (m) {
      var p = P[m[0]];
      s += vis(appear[m[0]], D, '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="19" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="2"/>' +
        txt(p[0], p[1] + 5, m[0], 13, C.ink, ' font-weight="700"'));
    });
    // 리프 (처음엔 흐리게 → 합쳐질 때 진하게)
    Object.keys(leaf).forEach(function (k) {
      var p = P[k], t = appear[k];
      s += '<g opacity="0.25"><rect x="' + (p[0] - 26) + '" y="' + (p[1] - 15) + '" width="52" height="30" rx="4" fill="' + C.green + '" stroke="#1d6b3a"/>' +
        txt(p[0], p[1] + 5, k + ":" + leaf[k], 13, "#fff", ' font-weight="700"') +
        '<animate attributeName="opacity" values="0.25;0.25;1;1" keyTimes="0;' + r4(t / D) + ';' + r4((t + 0.15) / D) + ';1" dur="' + D + 's" fill="freeze"/></g>';
      s += vis(TC + 0.3, D, txt(p[0], p[1] + 30, code[k], 12, C.ink, ' font-family="monospace" font-weight="700"'));
    });

    // ---- 기대 길이 ----
    var ex = txt(740, 92, "기대 길이 (빈도 × 깊이)", 12, C.muted, ' text-anchor="end" font-weight="700"') +
      txt(740, 112, "1 · 0.45  (A)", 13, C.or, ' text-anchor="end" font-weight="700"') +
      txt(740, 131, "+ 3 · 0.41  (B, C, D)", 13, C.or, ' text-anchor="end" font-weight="700"') +
      txt(740, 150, "+ 4 · 0.14  (E, F)", 13, C.or, ' text-anchor="end" font-weight="700"') +
      txt(740, 174, "= 2.24", 16, C.blue, ' text-anchor="end" font-weight="800"');
    s += vis(TE, D, ex);

    s += '<line x1="20" y1="352" x2="740" y2="352" stroke="' + C.line + '"/>';
    s += txt(380, 372, "빈도가 작은 글자일수록 먼저 합쳐져 깊이 내려간다 → 긴 코드는 드문 글자에게", 12.5, C.pur, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
