// ============================================================
// bfs_wave — L9 p.89 그래프(A–G)에서 BFS 가 L0, L1, L2, L3 로 물결처럼 퍼지고, 같은 layer 안 edge 를 찾는다
// 그래프 (p.89 왼쪽): A–B, A–E, B–C, B–F, C–D, C–G, D–E, D–G, F–G
// 검산(Python): L0={A}, L1={B,E}, L2={C,F,D}, L3={G}; BFS tree = A–B, A–E, B–C, B–F, E–D, C–G (p.89 오른쪽 그림과 같음)
//   같은 layer 안 edge = C–D 하나 (둘 다 L2) → cycle A–B–C–D–E–A 길이 5 (홀수) ⇒ not bipartite
// 시간축(초): 0–1.4 L0 → 1.4–3.4 L1 → 3.4–5.4 L2 → 5.4–7.4 L3 → 7.4–9.1 edge 검사 → 9.1–12 odd cycle
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bfs_wave"] = {
  title: "BFS — layer 가 물결처럼 퍼진다, 그리고 같은 layer 안 edge (12초)",
  desc: "L9 p.89·p.97–110. [[BFS]] 는 $L_i$ 의 이웃 중 처음 보는 정점을 $L_{i+1}$ 에 넣는다 → [[layer]] $L_i$ = 시작점에서 정확히 i step. 같은 layer 안에 edge 가 있으면 [[odd cycle]] 이 생겨 [[bipartite graph]] 가 아니다.",
  duration: 12,
  build: function () {
    var D = 12;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222", line: "#b9c4d8" };
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
    function kf(pts) {
      var ks = [], vs = [];
      if (pts[0][0] > 0) { ks.push(0); vs.push(pts[0][1]); }
      pts.forEach(function (p) { ks.push(r4(p[0] / D)); vs.push(p[1]); });
      if (pts[pts.length - 1][0] < D) { ks.push(1); vs.push(pts[pts.length - 1][1]); }
      return 'values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function anim(attr, pts) { return '<animate attributeName="' + attr + '" ' + kf(pts) + '/>'; }
    function step(attr, pts) { return '<animate attributeName="' + attr + '" calcMode="discrete" ' + kf(pts) + '/>'; }

    var P = { A: [50, 150], B: [185, 216], C: [76, 300], D: [138, 66], E: [250, 70], F: [312, 134], G: [279, 267] };
    var LAYER = { A: 0, B: 1, E: 1, C: 2, F: 2, D: 2, G: 3 };
    var PAR = { B: "A", E: "A", C: "B", F: "B", D: "E", G: "C" };
    var EDGES = ["AB", "AE", "BC", "BF", "CD", "CG", "DE", "DG", "FG"];
    var LC = [[C.pur, C.purL], [C.blue, C.blueL], [C.or, C.orL], [C.green, C.greenL]];
    var LT = [1.0, 2.6, 4.6, 6.6];          // layer i 정점이 칠해지는 시각
    var GROW = [null, 1.6, 3.6, 5.6];       // layer i 로 가는 tree edge 가 자라기 시작

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="BFS layer 와 bipartite 검사 애니메이션">';
    s += '<defs><clipPath id="bfs_clip"><rect x="0" y="36" width="350" height="300"/></clipPath></defs>';
    var caps = [
      [0, 1.4, "BFS(A): L0 = {A} — 0 step 에 닿는 정점"],
      [1.4, 3.4, "L0 의 이웃 중 unvisited → L1 = {B, E} (1 step)"],
      [3.4, 5.4, "L1 의 이웃 중 unvisited → L2 = {C, F, D} (2 step)"],
      [5.4, 7.4, "L2 의 이웃 중 unvisited → L3 = {G} (3 step) — 끝"],
      [7.4, 9.1, "bipartite 검사: non-tree edge 의 양 끝 layer 를 본다"],
      [9.1, D, "C–D 가 같은 L2 안 → 홀수 길이 cycle ⇒ not bipartite"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // 물결 (시작점 A 에서 퍼지는 고리)
    s += '<g clip-path="url(#bfs_clip)">';
    [1, 2, 3].forEach(function (i) {
      var b = GROW[i];
      s += '<circle cx="' + P.A[0] + '" cy="' + P.A[1] + '" r="0" fill="none" stroke="' + LC[i][0] + '" stroke-width="3" opacity="0">' +
        anim("r", [[b, 0], [b + 1.6, 300]]) + anim("opacity", [[b - 0.01, 0], [b, 0.55], [b + 1.6, 0]]) + '</circle>';
    });
    s += '</g>';

    // 모든 edge (회색 바탕)
    EDGES.forEach(function (e) {
      var a = P[e[0]], b = P[e[1]];
      var same = LAYER[e[0]] === LAYER[e[1]];
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C.line + '" stroke-width="2.5"' +
        (same ? '>' + step("stroke", [[0, C.line], [8.2, C.red]]) + step("stroke-width", [[0, 2.5], [8.2, 5]]) + '</line>' : '/>');
    });
    // odd cycle 강조
    var cyc = ["A", "B", "C", "D", "E", "A"].map(function (v) { return P[v].join(","); }).join(" ");
    s += vis(9.1, D, '<polyline points="' + cyc + '" fill="none" stroke="' + C.red + '" stroke-width="9" stroke-opacity="0.28" stroke-linejoin="round"/>');
    // tree edge: 부모 → 자식 방향으로 자란다
    Object.keys(PAR).forEach(function (v) {
      var p = P[PAR[v]], q = P[v], L = LAYER[v], b = GROW[L];
      s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="' + LC[L][0] + '" stroke-width="4.5" stroke-linecap="round">' +
        anim("x2", [[b, p[0]], [LT[L], q[0]]]) + anim("y2", [[b, p[1]], [LT[L], q[1]]]) + '</line>';
    });
    // 정점
    Object.keys(P).forEach(function (v) {
      var p = P[v], L = LAYER[v];
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="16" fill="#fff" stroke="' + C.muted + '" stroke-width="2">' +
        step("fill", [[0, "#fff"], [LT[L], LC[L][1]]]) + step("stroke", [[0, C.muted], [LT[L], LC[L][0]]]) + step("stroke-width", [[0, 2], [LT[L], 3]]) + '</circle>';
      s += txt(p[0], p[1] + 5, v, 14, C.ink, ' font-weight="700"');
      var ly = (v === "D" || v === "E") ? p[1] - 22 : p[1] + 32;
      s += vis(LT[L], D, txt(p[0], ly, "L" + L, 12, LC[L][0], ' font-weight="700"'));
    });

    // ---- 오른쪽 패널 ----
    s += '<rect x="372" y="44" width="378" height="290" rx="8" fill="#fafbfd" stroke="' + C.line + '"/>';
    var rows = [["L0 = { A }", 0], ["L1 = { B, E }", 1], ["L2 = { C, F, D }", 2], ["L3 = { G }", 3]];
    rows.forEach(function (r, i) {
      s += vis(LT[r[1]], D, txt(390, 72 + i * 28, r[0], 15, LC[r[1]][0], ' text-anchor="start" font-weight="700"') +
        txt(560, 72 + i * 28, "시작점에서 " + i + " step", 12, C.muted, ' text-anchor="start"'));
    });
    s += vis(7.4, D, '<line x1="386" y1="180" x2="736" y2="180" stroke="' + C.line + '"/>' +
      txt(390, 202, "non-tree edge 의 양 끝 layer", 13, C.ink, ' text-anchor="start" font-weight="700"'));
    s += vis(7.7, D, txt(400, 226, "D–G : L2–L3", 13, C.ink, ' text-anchor="start"') + txt(540, 226, "✓ 이웃 layer", 13, C.green, ' text-anchor="start" font-weight="700"'));
    s += vis(7.9, D, txt(400, 248, "F–G : L2–L3", 13, C.ink, ' text-anchor="start"') + txt(540, 248, "✓ 이웃 layer", 13, C.green, ' text-anchor="start" font-weight="700"'));
    s += vis(8.2, D, txt(400, 270, "C–D : L2–L2", 13, C.red, ' text-anchor="start" font-weight="700"') + txt(540, 270, "✗ 같은 layer!", 13, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(9.1, D, txt(390, 298, "A–B–C–D–E–A : 길이 5 = odd cycle", 13, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(9.7, D, txt(390, 320, "⇒ not bipartite (2색 칠하기 불가능)", 13, C.red, ' text-anchor="start" font-weight="700"'));

    s += txt(380, 358, "같은 layer 안 edge 가 있으면 odd cycle ⇒ not bipartite / 없으면 짝·홀 layer 로 2색 칠하기 성공", 12, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
