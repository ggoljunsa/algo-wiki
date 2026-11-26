// ============================================================
// cut_proof_two_facts — 증명 4단계의 두 사실을 p.14 그래프의 max flow 로: S = {s,B,C,F} (Gf BFS: s→C 1, C→F 5, F→B 2)
//   사실 A: S→T 간선은 꽉 참 — s→A 4/4, B→E 3/3, F→t 4/4
//   사실 B: T→S 간선은 flow 0 — A→B 0/2, E→F 0/6
//   값 = (4+3+4) − (0+0) = 11 = cost 11. 검산 src/sims/_check_L17_anims.py
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["cut_proof_two_facts"] = {
  title: "선을 넘는 간선의 두 사실 — S→T 는 꽉, T→S 는 0 (20초)",
  desc: "p.14 의 max flow(값 11)에서 Gf 로 칠한 S = {s, B, C, F}. 선을 S→T 로 넘는 간선은 전부 꽉 차 있고, T→S 로 넘는 간선은 전부 flow 가 0 이다. " +
    "둘 중 하나라도 어기면 Gf 에 S 에서 T 로 가는 화살표(파랑 c−f 또는 연두 f)가 생겨서 BFS 가 T 로 넘어갔을 것이다. → [[max-flow min-cut 증명 (cut 선 긋기)]]",
  duration: 20,
  build: function () {
    var D = 20, K = FLOWKIT(D, "c2f"), C = K.C;
    var P = K.grid(48, 92, 140, 100, FLOWKIT.BIG);
    var f = { "s-A": 4, "s-B": 2, "s-C": 5, "A-D": 3, "A-E": 1, "B-E": 3, "F-B": 1, "C-F": 5, "D-t": 3, "E-t": 4, "F-t": 4 };
    var T1 = 1, T2 = 3.4, TA = 4.4, TAh = 7.6, TB = 10, TBh = 13, TV = 15.6;
    var s = '<svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cut 을 넘는 간선의 두 사실 애니메이션">' + K.defs();
    s += K.captions([
      [0, T2, "p.14 의 max flow (값 11). Gf 에서 s 부터 BFS: s → C → F → B"],
      [T2, TA, "S = {s, B, C, F} 를 연두로 칠하고 경계에 선을 긋는다"],
      [TA, TAh, "사실 A: 선을 S→T 로 넘는 s→A, B→E, F→t 는 전부 꽉 찼다"],
      [TAh, TB, "B→E 가 2/3 이었다면 Gf 에 파랑 B→E 1 이 생겨 E 까지 칠해진다. 모순"],
      [TB, TBh, "사실 B: 선을 T→S 로 넘는 A→B, E→F 는 flow 가 0 이다"],
      [TBh, TV, "E→F 에 1 이 흘렀다면 Gf 에 연두 F→E 1 이 생겨 E 가 칠해진다. 모순"],
      [TV, D, "그래서 flow 값 = (4 + 3 + 4) − (0 + 0) = 11 = 이 cut 의 cost"]
    ]);
    var Sset = { s: T1, C: T1 + 0.5, F: T1 + 1.0, B: T1 + 1.5 };
    Object.keys(Sset).forEach(function (k) {
      s += K.vis(Sset[k], D, '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="31" fill="' + C.limeL + '" stroke="' + C.lime + '" stroke-width="1.2" stroke-dasharray="3 3"/>');
    });
    ["s-A", "B-E", "F-t"].forEach(function (k, i) {
      var uv = k.split("-"), t = TA + 0.2 + i * 0.9;
      s += K.blinkG(t, t + 0.7, true, K.halo(P, uv[0], uv[1], C.or, 14), 2);
    });
    ["A-B", "E-F"].forEach(function (k, i) {
      var uv = k.split("-"), t = TB + 0.2 + i * 1.0;
      s += K.blinkG(t, t + 0.8, true, K.halo(P, uv[0], uv[1], C.blue, 14), 2);
    });
    FLOWKIT.E14.forEach(function (e) {
      var u = e[0], v = e[1], key = u + "-" + v;
      s += K.edge(P, u, v, { color: "blue", w: 2.3 });
      var lp = K.at(P, u, v, e[3], e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 13, C.blue, ' font-weight="700"');
      var bp = K.at(P, u, v, e[3] > 0.6 ? 0.42 : 0.66, 0);
      var v0 = f[key] || 0, full = v0 === e[2];
      if (key === "B-E") s += K.fboxSeq(bp[0], bp[1], [[0, "3", C.or], [TAh, "2", C.red], [TB, "3", C.or]]);
      else if (key === "E-F") s += K.fboxSeq(bp[0], bp[1], [[0, "0", "#8a94a6"], [TBh, "1", C.red], [TV, "0", "#8a94a6"]]);
      else s += K.fbox(bp[0], bp[1], v0, full ? C.or : v0 ? C.blue : "#8a94a6");
    });
    // 가정 위반 화살표
    s += K.vis(TAh + 0.4, TB, K.edge(P, "B", "E", { color: "blue", w: 3.2, off: -12, dash: "6 4" }) + K.pill(262, 160, "Gf 파랑 B→E 1", "#fff", C.blue, 12));
    s += K.vis(TBh + 0.4, TV, K.edge(P, "F", "E", { color: "lime", w: 3.2, off: 12, dash: "6 4" }) + K.pill(398, 262, "Gf 연두 F→E 1", "#fff", C.lime, 12));
    s += K.vis(TAh + 0.9, TB, '<circle cx="' + P.E[0] + '" cy="' + P.E[1] + '" r="24" fill="none" stroke="' + C.red + '" stroke-width="3"/>');
    s += K.vis(TBh + 0.9, TV, '<circle cx="' + P.E[0] + '" cy="' + P.E[1] + '" r="24" fill="none" stroke="' + C.red + '" stroke-width="3"/>');
    Object.keys(P).forEach(function (k) {
      var base = k === "s" ? "src" : k === "t" ? "sink" : "t";
      var pairs = [[0, base]];
      if (Sset[k] !== undefined) pairs.push([Sset[k], k === "s" ? "srcS" : "s"]);
      if (k === "E") { pairs.push([TAh + 0.9, "s"]); pairs.push([TB, "t"]); pairs.push([TBh + 0.9, "s"]); pairs.push([TV, "t"]); }
      s += K.nodeSt(P, k, k, pairs, 17);
    });
    s += K.vis(T2, D, '<path d="M 92,58 C 108,124 140,140 210,142 C 262,144 268,180 276,205 C 286,238 310,244 360,246 C 410,250 420,283 432,350" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="8 6"/>');
    // 오른쪽 판
    var X = 522;
    s += '<rect x="' + (X - 8) + '" y="44" width="244" height="300" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
    s += K.vis(TA, D, K.txt(X + 4, 68, "사실 A  S→T 간선", 13, C.or, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 4, 92, "s→A 4/4, B→E 3/3, F→t 4/4", 12.5, C.ink, ' text-anchor="start"') +
      K.txt(X + 4, 112, "안 찼으면 Gf 에 파랑(c−f)이 생긴다", 11.5, C.muted, ' text-anchor="start"'));
    s += K.vis(TB, D, K.txt(X + 4, 148, "사실 B  T→S 간선", 13, C.blue, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 4, 172, "A→B 0/2, E→F 0/6", 12.5, C.ink, ' text-anchor="start"') +
      K.txt(X + 4, 192, "0 이 아니면 Gf 에 연두(f)가 생긴다", 11.5, C.muted, ' text-anchor="start"'));
    s += K.vis(TAh, TB, K.txt(X + 114, 236, "E 가 S 에 들어온다", 13, C.red, ' font-weight="700"') + K.txt(X + 114, 256, "= \"t 에 못 간다\"던 BFS 와 모순", 12, C.red));
    s += K.vis(TBh, TV, K.txt(X + 114, 236, "역시 E 가 S 에 들어온다", 13, C.red, ' font-weight="700"') + K.txt(X + 114, 256, "BFS 결과와 모순", 12, C.red));
    s += K.vis(TV, D, K.txt(X + 114, 232, "값 = (4 + 3 + 4) − (0 + 0)", 13.5, C.ink, ' font-weight="700"') +
      K.txt(X + 114, 260, "= 11 = cost", 18, C.red, ' font-weight="700"') +
      K.txt(X + 114, 290, "(cost 는 S→T capacity 4 + 3 + 4)", 11.5, C.muted));
    s += K.txt(380, 380, "Gf 에서 S 의 정점이 T 의 정점으로 가는 화살표는 하나도 없다. 이걸 G 의 말로 바꾸면 두 사실이 된다", 12.5, C.pur, ' font-weight="700"');
    return s + '</svg>';
  }
};
