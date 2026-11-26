// ============================================================
// ff_full_run — L17 p.43–53: Ford-Fulkerson 을 끝까지. augmenting path 4 번 → 11, 마지막 Gf 의 BFS 로 min cut
//   그래프 p.43 (p.4 에서 A→B, B→C, D→E, E→F 를 뺀 11 간선, 이름 A–F 는 위키가 붙임)
//   경로 (검산 src/sims/_check_L17_anims.py):
//     1) s→A→E→t            residual 4,6,4          x=4  값 4
//     2) s→C→F→t            6,10,4                  x=4  값 8
//     3) s→B→E⇢A→D→t        2,3,4,3,4   (E⇢A 연두)  x=2  값 10, A→E 4→2
//     4) s→C→F→B→E⇢A→D→t    2,6,3,1,2,1,2           x=1  값 11, A→E 2→1
//   끝: Gf 에서 s 가 닿는 정점 {s,C,F,B} → cut s→A 4 + B→E 3 + F→t 4 = 11
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["ff_full_run"] = {
  title: "Ford-Fulkerson 한 바퀴씩 — 경로 4 번, 그리고 min cut (24초)",
  desc: "L17 p.43–53. 노란 띠가 이번에 찾은 augmenting path, 오른쪽이 그 경로 위 residual 값과 병목 x 다. 연두 점선은 backward 간선(A→E 의 flow 를 되돌림)이다. " +
    "더 갈 길이 없으면 마지막 Gf 에서 s 가 닿는 정점을 칠한다. 그게 min cut 이다. → [[Ford-Fulkerson]]",
  duration: 24,
  build: function () {
    var D = 24, K = FLOWKIT(D, "ffr"), C = K.C;
    var P = K.grid(48, 92, 140, 100, FLOWKIT.BIG);
    var EDGES = FLOWKIT.E14.filter(function (e) { return ["A-B", "B-C", "D-E", "E-F"].indexOf(e[0] + "-" + e[1]) < 0; });
    var its = [
      { t: 0.8, path: "sAEt", back: [], res: [4, 6, 4], x: 4, val: 4 },
      { t: 5.3, path: "sCFt", back: [], res: [6, 10, 4], x: 4, val: 8 },
      { t: 9.8, path: "sBEADt", back: [2], res: [2, 3, 4, 3, 4], x: 2, val: 10 },
      { t: 14.3, path: "sCFBEADt", back: [4], res: [2, 6, 3, 1, 2, 1, 2], x: 1, val: 11 }
    ];
    var TB = 18.8;  // BFS·cut 시작
    var f = {};
    EDGES.forEach(function (e) { f[e[0] + "-" + e[1]] = [[0, 0]]; });
    var cur = {};
    EDGES.forEach(function (e) { cur[e[0] + "-" + e[1]] = 0; });
    its.forEach(function (it) {
      var tu = it.t + 2.6;
      for (var i = 0; i + 1 < it.path.length; i++) {
        var u = it.path[i], v = it.path[i + 1];
        if (it.back.indexOf(i) >= 0) { cur[v + "-" + u] -= it.x; f[v + "-" + u].push([tu, cur[v + "-" + u], "chg"]); }
        else { cur[u + "-" + v] += it.x; f[u + "-" + v].push([tu, cur[u + "-" + v], "chg"]); }
      }
    });
    var s = '<svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ford-Fulkerson 예제 전체 애니메이션">' + K.defs();
    s += K.captions([
      [0, 0.8, "f = 0 에서 시작. Gf = G. s 에서 t 로 가는 길을 찾는다"],
      [0.8, 5.3, "경로 1: s→A→E→t, 병목 4 → 값 4"],
      [5.3, 9.8, "경로 2: s→C→F→t, 병목 4 → 값 8"],
      [9.8, 14.3, "경로 3: s→B→E ⇢ A→D→t. E⇢A 는 연두(backward): A→E 를 4 → 2 로 되돌린다"],
      [14.3, TB, "경로 4: s→C→F→B→E ⇢ A→D→t, 병목 1 → 값 11 (A→E 를 또 되돌림)"],
      [TB, 21.2, "더 갈 길이 없다. 마지막 Gf 에서 s 가 닿는 정점: C, F, B"],
      [21.2, D, "그 정점들로 자른 cut = 4 + 3 + 4 = 11 = flow 값. 끝"]
    ]);
    // 경로 강조
    its.forEach(function (it, n) {
      var end = n + 1 < its.length ? its[n + 1].t : TB;
      for (var i = 0; i + 1 < it.path.length; i++) {
        var u = it.path[i], v = it.path[i + 1], tt = it.t + 0.15 * i;
        if (it.back.indexOf(i) >= 0) {
          s += K.vis(tt, end, K.halo(P, u, v, "#f3c623", 14, 9) + K.edge(P, u, v, { color: "lime", w: 3, off: 9, dash: "6 4" }));
        } else s += K.vis(tt, end, K.halo(P, u, v, "#f3c623", 14));
      }
    });
    // 마지막 cut: S 영역과 꽉 찬 간선
    s += K.vis(TB + 0.3, D, ["s", "C", "F", "B"].map(function (k) { return '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="31" fill="' + C.limeL + '" stroke="' + C.lime + '" stroke-width="1.2" stroke-dasharray="3 3"/>'; }).join(""));
    s += K.vis(21.2, D, K.halo(P, "s", "A", C.or, 13) + K.halo(P, "B", "E", C.or, 13) + K.halo(P, "F", "t", C.or, 13));
    // 간선
    EDGES.forEach(function (e) {
      var u = e[0], v = e[1], key = u + "-" + v;
      s += K.edge(P, u, v, { color: "blue", w: 2.3 });
      var lp = K.at(P, u, v, e[3], e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 13, C.blue, ' font-weight="700"');
      var bp = K.at(P, u, v, e[3] > 0.6 ? 0.42 : 0.66, 0);
      var pairs = [];
      f[key].forEach(function (p) {
        var full = p[1] === e[2];
        if (p[2] === "chg") { pairs.push([p[0], p[1], C.red]); pairs.push([p[0] + 0.9, p[1], full ? C.or : C.blue]); }
        else pairs.push([p[0], p[1], full ? C.or : C.blue]);
      });
      s += K.fboxSeq(bp[0], bp[1], pairs);
    });
    // 정점
    var bfs = { s: TB + 0.1, C: TB + 0.6, F: TB + 1.1, B: TB + 1.6 };
    Object.keys(P).forEach(function (k) {
      var base = k === "s" ? "src" : k === "t" ? "sink" : "t";
      var pairs = [[0, base]];
      if (bfs[k] !== undefined) pairs.push([bfs[k], k === "s" ? "srcS" : "s"]);
      s += K.nodeSt(P, k, k, pairs, 17);
    });
    s += K.vis(21.2, D, '<path d="M 92,58 C 108,124 140,140 210,142 C 262,144 268,180 276,205 C 286,238 310,244 360,246 C 410,250 420,283 432,350" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="8 6"/>');
    // 오른쪽 판
    var X = 522;
    s += '<rect x="' + (X - 8) + '" y="44" width="244" height="300" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
    its.forEach(function (it, n) {
      var end = n + 1 < its.length ? its[n + 1].t : TB;
      var names = it.path.split("").map(function (c, i) { return (i > 0 ? (it.back.indexOf(i - 1) >= 0 ? "⇢" : "→") : "") + c; }).join("");
      s += K.vis(it.t, end, K.txt(X + 114, 68, "경로 " + (n + 1) + " (Gf 에서 BFS)", 13, C.pur, ' font-weight="700"') +
        K.txt(X + 114, 94, names, it.path.length > 6 ? 14 : 16, C.ink, ' font-weight="700"') +
        K.txt(X + 4, 124, "경로 위 residual:", 12, C.muted, ' text-anchor="start"') +
        K.txt(X + 114, 148, it.res.join(", "), 15, C.blue, ' font-weight="700"'));
      s += K.vis(it.t + 1.4, end, K.txt(X + 114, 184, "병목 x = " + it.x, 18, "#b38600", ' font-weight="700"'));
      s += K.vis(it.t + 2.6, end, K.txt(X + 114, 216, "flow 값 " + (it.val - it.x) + " → " + it.val, 15, C.ink, ' font-weight="700"') +
        (it.back.length ? K.txt(X + 114, 244, "연두 구간은 원래 간선 A→E 에서 −" + it.x, 12, C.lime, ' font-weight="700"') : "") +
        K.txt(X + 114, 270, "빨간 네모 = 방금 바뀐 flow", 11.5, C.red));
    });
    s += K.vis(TB, D, K.txt(X + 114, 68, "Gf 에 s→t 길 없음", 14, C.red, ' font-weight="700"') +
      K.txt(X + 4, 96, "s 에서 BFS 로 닿는 정점:", 12, C.ink, ' text-anchor="start"') +
      K.txt(X + 114, 120, "s → C → F → B", 15, C.sNode, ' font-weight="700"') +
      K.txt(X + 4, 146, "(s→C 1 남음, C→F 5 남음, F→B 2 남음)", 11, C.muted, ' text-anchor="start"'));
    s += K.vis(21.2, D, K.txt(X + 114, 184, "cut: s→A 4 + B→E 3 + F→t 4", 13, C.or, ' font-weight="700"') +
      K.txt(X + 114, 214, "= 11 = flow 값", 18, C.red, ' font-weight="700"') +
      K.txt(X + 114, 244, "세 간선 모두 꽉 참 (주황 네모)", 12, C.or, ' font-weight="700"') +
      K.txt(X + 114, 270, "\"Max flow and min cut are both 11.\"", 11.5, C.muted));
    s += K.txt(380, 380, "Gf 에 길이 있으면 병목만큼 더 보내고, 없으면 멈춘다. 멈춘 자리에서 s 가 닿는 곳이 min cut 의 S 다", 12.5, C.pur, ' font-weight="700"');
    return s + '</svg>';
  }
};
