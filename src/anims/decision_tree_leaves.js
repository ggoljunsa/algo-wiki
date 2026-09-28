// ============================================================
// decision_tree_leaves — L5 p.10–15 (PNG 8–13) decision tree 와 Ω(n log n) 하한
// 시간축(초): 0 루트 "a ≤ b?" → 1.5 1층 → 3 2층 → 4.5 3층, 잎 3! = 6 개 초록
//   → 7 가장 긴 경로(깊이 3) 빨강 + 점이 따라 내려감 → 9.5 log₂(n!) = Ω(n log n) → 12
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["decision_tree_leaves"] = {
  title: "Decision tree — 잎 n! 개면 깊이 ≥ log₂(n!) (12초)",
  desc: "원소 3개의 [[decision tree]]: 비교마다 YES/NO 로 갈라져 잎이 3! = 6 개. worst-case = 가장 긴 경로 → [[log(n!)|log₂(n!)]] = [[Ω(n log n) 하한|Ω(n log n)]]",
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
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + (extra || "") + '/>';
    }
    // from~to 초에만 보이기 (to >= D 이면 끝까지 유지)
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }

    // 노드: [x, y, 라벨, 잎?, 등장 시각]
    var N = {
      R: [380, 64, "a ≤ b?", 0, 0],
      A: [210, 130, "b ≤ c?", 0, 1.5], B: [550, 130, "a ≤ c?", 0, 1.5],
      L1: [122, 196, "a ≤ b ≤ c", 1, 3], A2: [300, 196, "a ≤ c?", 0, 3], L4: [460, 196, "b ≤ a ≤ c", 1, 3], B2: [650, 196, "b ≤ c?", 0, 3],
      L2: [240, 262, "a ≤ c ≤ b", 1, 4.5], L3: [360, 262, "c ≤ a ≤ b", 1, 4.5],
      L5: [590, 262, "b ≤ c ≤ a", 1, 4.5], L6: [700, 262, "c ≤ b ≤ a", 1, 4.5]
    };
    // 간선: [부모, 자식, YES?]
    var E = [["R", "A", 1], ["R", "B", 0], ["A", "L1", 1], ["A", "A2", 0], ["B", "L4", 1], ["B", "B2", 0],
      ["A2", "L2", 1], ["A2", "L3", 0], ["B2", "L5", 1], ["B2", "L6", 0]];
    var HW = 40, HH = 13;

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Decision tree 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "comparison-based sorting 은 모두 decision tree 를 가진다 — 입력 a, b, c"],
      [1.5, 4.5, "비교 한 번마다 YES / NO 로 갈라진다"],
      [4.5, 7, "잎 = 가능한 모든 순서(순열) → n = 3 이면 3! = 6 개"],
      [7, 9.5, "한 입력 = 한 경로 → worst-case 수행 시간 ≥ 가장 긴 경로의 길이"],
      [9.5, D, "잎이 n! 개인 이진 트리의 깊이 ≥ log₂(n!) = Ω(n log n)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 간선 ----
    E.forEach(function (e) {
      var p = N[e[0]], q = N[e[1]];
      var x1 = p[0], y1 = p[1] + HH, x2 = q[0], y2 = q[1] - HH;
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var inner = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#9aa6b8" stroke-width="2"/>' +
        txt(mx + (e[2] ? -14 : 14), my + 2, e[2] ? "YES" : "NO", 11, C.muted, e[2] ? ' text-anchor="end"' : ' text-anchor="start"');
      s += q[4] > 0 ? vis(q[4], D, inner) : inner;
    });
    // ---- 가장 긴 경로 R → B → B2 → L6 (빨강) ----
    var path = ["R", "B", "B2", "L6"], pd;
    for (var i = 0; i < path.length - 1; i++) {
      var p = N[path[i]], q = N[path[i + 1]];
      s += vis(7, D, '<line x1="' + p[0] + '" y1="' + (p[1] + HH) + '" x2="' + q[0] + '" y2="' + (q[1] - HH) + '" stroke="' + C.red + '" stroke-width="4"/>');
    }
    pd = "M" + N.R[0] + "," + N.R[1] + " L" + N.B[0] + "," + N.B[1] + " L" + N.B2[0] + "," + N.B2[1] + " L" + N.L6[0] + "," + N.L6[1];

    // ---- 노드 ----
    Object.keys(N).forEach(function (k) {
      var n = N[k], inner;
      if (n[3]) {
        inner = box(n[0] - 48, n[1] - HH, 96, 26, C.greenL, C.green) + txt(n[0], n[1] + 5, n[2], 12, C.green, ' font-weight="700"');
      } else {
        inner = box(n[0] - HW, n[1] - HH, 80, 26, C.purL, C.pur) + txt(n[0], n[1] + 5, n[2], 13, C.pur, ' font-weight="700"');
      }
      s += n[4] > 0 ? vis(n[4], D, inner) : inner;
    });
    // 가장 긴 경로 위 노드 테두리 빨강
    path.forEach(function (k) {
      var n = N[k], w = n[3] ? 96 : 80;
      s += vis(7, D, '<rect x="' + (n[0] - w / 2 - 3) + '" y="' + (n[1] - HH - 3) + '" width="' + (w + 6) + '" height="32" rx="8" fill="none" stroke="' + C.red + '" stroke-width="2.5"/>');
    });
    // 잎 번호 ①~⑥
    var leafNo = [["L1", "①"], ["L2", "②"], ["L3", "③"], ["L4", "④"], ["L5", "⑤"], ["L6", "⑥"]];
    leafNo.forEach(function (l) {
      var n = N[l[0]];
      s += vis(5, D, txt(n[0], n[1] + 30, l[1], 13, C.green, ' font-weight="700"'));
    });
    // 경로 따라 내려가는 점
    s += '<circle r="7" fill="' + C.red + '" opacity="0"><animateMotion begin="7s" dur="1.8s" fill="freeze" path="' + pd + '"/>' + show(7, 9.5) + '</circle>';
    // 깊이 표시
    s += vis(7.5, D, txt(12, 64, "깊이 0", 11, C.muted, ' text-anchor="start"') + txt(12, 134, "깊이 1", 11, C.muted, ' text-anchor="start"') +
      txt(12, 200, "깊이 2", 11, C.muted, ' text-anchor="start"') + txt(12, 266, "깊이 3", 11, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(8, D, txt(640, 106, "가장 긴 경로 = 비교 3 번", 12, C.red, ' font-weight="700"'));

    // ---- 결론 상자 ----
    s += vis(9.5, D, box(70, 300, 620, 40, "#fff", C.red) +
      txt(380, 318, "잎 ≥ n!  ⇒  깊이 ≥ log₂(n!) ≥ (n/2)·log₂(n/2) = Ω(n log n)", 14, C.red, ' font-weight="700"') +
      txt(380, 334, "n = 3: log₂ 6 ≈ 2.58 → 적어도 3 번은 비교해야 한다", 11, C.muted));

    // ---- 요점 ----
    s += txt(380, 362, "어떤 comparison-based sorting 도 worst-case 에 Ω(n log n) 번 비교한다 — 비교 정렬의 하한", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
