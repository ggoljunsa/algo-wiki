// ============================================================
// st_cut_sweep — L17 p.5–9: s-t cut 을 여러 번 그어 보고 cost 를 센다
//   S 쪽 정점 = 짙은 초록 + 연두 배경, T 쪽 = 연한 민트 (슬라이드 색 그대로). 빨간 점선 = cut.
//   cut 네 개 (검산 src/sims/_check_L17_anims.py, 64 개 cut 중 최소 11):
//     {s}            s→A 4 + s→B 2 + s→C 6 = 12
//     {s,C}          s→A 4 + s→B 2 + C→F 10 = 16, B→C 는 T→S 라 안 셈 (p.8)
//     {s,A,…,F}      D→t 4 + E→t 4 + F→t 4 = 12
//     {s,B,C,F}      s→A 4 + B→E 3 + F→t 4 = 11, A→B·E→F 는 T→S 라 안 셈 (p.9)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["st_cut_sweep"] = {
  title: "s-t cut — 연두색으로 S 를 칠하고, S→T 간선만 더한다 (20초)",
  desc: "L17 p.5–9. 정점을 s 편(S, 짙은 초록 + 연두 배경)과 t 편(T, 연한 민트)으로 나누는 방법마다 cost 를 센다. " +
    "점선을 넘는 간선 중 '''S 에서 T 로 가는 것만''' capacity 를 더하고, T 에서 S 로 들어오는 간선(회색 ✗)은 세지 않는다. → [[s-t cut]]",
  duration: 20,
  build: function () {
    var D = 20, K = FLOWKIT(D, "stc"), C = K.C;
    var P = K.grid(48, 92, 140, 100, FLOWKIT.BIG);
    var cap = {};
    FLOWKIT.E14.forEach(function (e) { cap[e[0] + "-" + e[1]] = e[2]; });
    var cuts = [
      { S: "s", t0: 0.6, t1: 4.6, fw: ["s-A", "s-B", "s-C"], bk: [], name: "{s}",
        path: "M 112,58 C 100,150 126,230 108,350" },
      { S: "sC", t0: 4.6, t1: 9.2, fw: ["s-A", "s-B", "C-F"], bk: ["B-C"], name: "{s, C}",
        path: "M 100,58 C 110,125 120,195 165,230 C 212,255 250,232 262,350" },
      { S: "sABCDEF", t0: 9.2, t1: 12.8, fw: ["D-t", "E-t", "F-t"], bk: [], name: "{s, A, B, C, D, E, F}",
        path: "M 420,58 C 398,150 432,232 410,350" },
      { S: "sBCF", t0: 12.8, t1: 17.6, fw: ["s-A", "B-E", "F-t"], bk: ["A-B", "E-F"], name: "{s, B, C, F}",
        path: "M 92,58 C 108,124 140,140 210,142 C 262,144 268,180 276,205 C 286,238 310,244 360,246 C 410,250 420,283 432,350" }
    ];
    var s = '<svg viewBox="0 0 760 390" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="s-t cut 여러 개와 cost 애니메이션">' + K.defs();
    s += K.captions([
      [0, 0.6, "s 와 t 를 다른 편에 두기만 하면 s-t cut 이다"],
      [0.6, 4.6, "S = {s} 만 칠한다. 점선을 넘는 S→T 간선: 4 + 2 + 6"],
      [4.6, 9.2, "S = {s, C}. B→C 는 점선을 넘지만 T→S 방향이라 안 센다 (p.8)"],
      [9.2, 12.8, "S = t 빼고 전부. 이번엔 t 로 들어가는 세 간선"],
      [12.8, 17.6, "S = {s, B, C, F}. A→B, E→F 는 거꾸로 → 안 센다. 4 + 3 + 4 (p.9)"],
      [17.6, D, "64 가지 cut 을 다 세 보면 가장 싼 것이 11 = minimum s-t cut"]
    ]);
    // 연두 배경 (S 영역)
    cuts.forEach(function (c) {
      var g = "";
      c.S.split("").forEach(function (k) { g += '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="31" fill="' + C.limeL + '" stroke="' + C.lime + '" stroke-width="1.2" stroke-dasharray="3 3"/>'; });
      s += K.vis(c.t0, c.t1, g);
    });
    s += K.vis(17.6, D, cuts[3].S.split("").map(function (k) { return '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="31" fill="' + C.limeL + '" stroke="' + C.lime + '" stroke-width="1.2" stroke-dasharray="3 3"/>'; }).join(""));
    // 강조: 센 간선(주황), 안 센 간선(회색)
    var late = "";
    cuts.forEach(function (c) {
      c.fw.forEach(function (k, i) {
        var uv = k.split("-"), t = c.t0 + 0.7 + i * 0.75;
        s += K.vis(c.t0, c.t1, K.blinkG(t, t + 0.6, true, K.halo(P, uv[0], uv[1], C.or, 13), 2));
      });
      c.bk.forEach(function (k, i) {
        var uv = k.split("-"), t = c.t0 + 0.7 + c.fw.length * 0.75 + i * 0.6;
        var m = K.at(P, uv[0], uv[1], 0.3, 0);
        s += K.vis(c.t0, c.t1, K.blinkG(t, t + 0.5, true, K.halo(P, uv[0], uv[1], C.grey, 13), 2));
        late += K.vis(c.t0, c.t1, K.blinkG(t, t + 0.5, true, '<circle cx="' + m[0] + '" cy="' + m[1] + '" r="9" fill="#fff" stroke="' + C.red + '" stroke-width="1.5"/>' + K.txt(m[0], m[1] + 4.5, "✗", 13, C.red, ' font-weight="700"'), 2));
      });
    });
    s += K.vis(17.6, D, K.halo(P, "s", "A", C.or, 13) + K.halo(P, "B", "E", C.or, 13) + K.halo(P, "F", "t", C.or, 13));
    // 간선
    FLOWKIT.E14.forEach(function (e) {
      s += K.edge(P, e[0], e[1], { color: "blue", w: 2.5 });
      var lp = K.at(P, e[0], e[1], e[3], e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 14, C.blue, ' font-weight="700"');
    });
    // 정점 색: 각 cut 동안 S 면 짙은 초록
    Object.keys(P).forEach(function (k) {
      var base = k === "s" ? "src" : k === "t" ? "sink" : "t";
      var pairs = [[0, base]];
      cuts.forEach(function (c) {
        var inS = c.S.indexOf(k) >= 0;
        pairs.push([c.t0, inS ? (k === "s" ? "srcS" : "s") : base]);
      });
      s += K.nodeSt(P, k, k, pairs, 17);
    });
    s += late;
    // cut 점선
    cuts.forEach(function (c, i) {
      s += K.vis(c.t0 + 0.2, i === 3 ? D : c.t1, '<path d="' + c.path + '" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="8 6"/>');
    });
    // 오른쪽: 지금 세는 식 + 점수판
    var X = 522;
    s += '<rect x="' + (X - 8) + '" y="44" width="244" height="300" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
    s += K.txt(X + 114, 66, "cost = S→T 간선 capacity 합", 13, C.pur, ' font-weight="700"');
    cuts.forEach(function (c, ci) {
      var pairs = [[0, null]], acc = [], sum = 0;
      c.fw.forEach(function (k, i) {
        sum += cap[k]; acc.push(cap[k]);
        pairs.push([c.t0 + 0.7 + i * 0.75, acc.join(" + ") + (i === c.fw.length - 1 ? " = " + sum : "")]);
      });
      pairs.push([c.t1, null]);
      s += K.vis(c.t0, c.t1, K.txt(X + 114, 98, "S = " + c.name, 12.5, C.sNode, ' font-weight="700"'));
      s += K.seq(X + 114, 124, pairs, 17, C.or, ' font-weight="700"');
      if (c.bk.length) {
        var tb = c.t0 + 0.7 + c.fw.length * 0.75;
        s += K.vis(tb, c.t1, K.txt(X + 114, 148, c.bk.map(function (k) { return k.replace("-", "→"); }).join(", ") + " : T→S 라 0", 12, C.muted, ' font-weight="700"'));
      }
      // 점수판 한 줄
      var y = 186 + ci * 26, tEnd = c.t0 + 0.7 + c.fw.length * 0.75;
      var best = ci === 3;
      s += K.vis(tEnd, D, K.txt(X + 6, y, "S = " + c.name, 12, C.ink, ' text-anchor="start"') +
        K.txt(X + 222, y, String(sum), 14, best ? C.red : C.ink, ' text-anchor="end" font-weight="700"'));
    });
    s += K.txt(X + 6, 170, "지금까지 센 cut", 11.5, C.muted, ' text-anchor="start"');
    s += K.vis(17.6, D, '<rect x="' + (X - 2) + '" y="269" width="234" height="22" rx="5" fill="none" stroke="' + C.red + '" stroke-width="2"/>' +
      K.txt(X + 114, 318, "minimum s-t cut = 11", 15, C.red, ' font-weight="700"') +
      K.txt(X + 114, 336, "(S = {s,A,B,C,E,F} 도 11: A→D, E→t, F→t)", 10.5, C.muted));
    s += K.txt(380, 378, "선을 넘어도 T→S 방향 간선은 세지 않는다. S 에서 T 로 나가는 파이프 굵기만 더한다", 13, C.pur, ' font-weight="700"');
    return s + '</svg>';
  }
};
