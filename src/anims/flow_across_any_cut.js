// ============================================================
// flow_across_any_cut — L17 p.17 Lemma 1 (proof by picture) 를 숫자로: 어떤 cut 에서 재도
//   (S→T 로 넘어간 flow) − (T→S 로 되돌아온 flow) = flow 의 값, 그리고 그 값 ≤ cut 의 cost.
//   p.11 flow (값 4). 검산 src/sims/_check_L17_anims.py:
//     S={s,A}      넘어감 A→D 2 + A→B 1 + A→E 1 = 4, 되돌아옴 0   → 4, cost 19
//     S={s,B,C}    넘어감 s→A 4 + B→E 1 = 5, 되돌아옴 A→B 1      → 4, cost 17
//     S={s,B,C,F}  넘어감 s→A 4 + B→E 1 = 5, 되돌아옴 A→B 1      → 4, cost 11
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["flow_across_any_cut"] = {
  title: "Lemma 1 — 어떤 cut 에서 재도 flow 값은 같고, cut 의 cost 를 못 넘는다 (18초)",
  desc: "L17 p.17. s 에서 나온 물건은 t 에 가려면 점선을 넘어야 한다. 점선을 S→T 로 넘은 양에서 T→S 로 되돌아온 양을 빼면 언제나 flow 의 값(4)이다. " +
    "그런데 S→T 로 넘는 양은 그 간선들의 capacity 합(= cut 의 cost)을 넘을 수 없다. 그래서 '''모든 flow ≤ 모든 cut''', 즉 max flow ≤ min cut. → [[max-flow min-cut theorem]]",
  duration: 18,
  build: function () {
    var D = 18, K = FLOWKIT(D, "fac"), C = K.C;
    var P = K.grid(48, 92, 140, 100, FLOWKIT.BIG);
    var f = { "s-A": 4, "A-D": 2, "A-B": 1, "A-E": 1, "B-E": 1, "D-t": 2, "E-t": 2 };
    var cuts = [
      { S: "sA", t0: 0.8, t1: 5.6, fw: ["A-D", "A-B", "A-E"], bk: [], net: "2 + 1 + 1 − 0 = 4", cost: "2+6+3+2+6 = 19", le: "4 ≤ 19",
        name: "{s, A}", path: "M 250,52 C 256,112 240,142 162,154 C 100,164 122,252 96,350" },
      { S: "sBC", t0: 5.6, t1: 10.4, fw: ["s-A", "B-E"], bk: ["A-B"], net: "4 + 1 − 1 = 4", cost: "4 + 3 + 10 = 17", le: "4 ≤ 17",
        name: "{s, B, C}", path: "M 92,58 C 108,128 150,146 222,152 C 276,156 270,232 262,350" },
      { S: "sBCF", t0: 10.4, t1: 15.2, fw: ["s-A", "B-E"], bk: ["A-B"], net: "4 + 1 − 1 = 4", cost: "4 + 3 + 4 = 11", le: "4 ≤ 11",
        name: "{s, B, C, F}", path: "M 92,58 C 108,124 140,140 210,142 C 262,144 268,180 276,205 C 286,238 310,244 360,246 C 410,250 420,283 432,350" }
    ];
    var s = '<svg viewBox="0 0 760 390" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lemma 1 그림 증명 애니메이션">' + K.defs();
    s += K.captions([
      [0, 0.8, "p.11 의 flow (값 4). 이 flow 를 그대로 두고 cut 만 바꿔 본다"],
      [0.8, 5.6, "S = {s, A}: 점선을 S→T 로 넘는 flow 를 모두 더한다"],
      [5.6, 10.4, "S = {s, B, C}: A→B 의 1 은 T→S 로 되돌아온 것 → 뺀다"],
      [10.4, 15.2, "S = {s, B, C, F} (min cut): 역시 5 − 1 = 4"],
      [15.2, D, "어디를 잘라도 순수하게 넘는 양 = 4 ≤ 그 cut 의 cost"]
    ]);
    cuts.forEach(function (c) {
      var g = "";
      c.S.split("").forEach(function (k) { g += '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="31" fill="' + C.limeL + '" stroke="' + C.lime + '" stroke-width="1.2" stroke-dasharray="3 3"/>'; });
      s += K.vis(c.t0, c.t1, g);
      c.fw.forEach(function (k, i) {
        var uv = k.split("-"), t = c.t0 + 0.6 + i * 0.6;
        s += K.vis(c.t0, c.t1, K.blinkG(t, t + 0.5, true, K.halo(P, uv[0], uv[1], C.or, 13), 2));
      });
      c.bk.forEach(function (k, i) {
        var uv = k.split("-"), t = c.t0 + 0.6 + c.fw.length * 0.6 + i * 0.6;
        s += K.vis(c.t0, c.t1, K.blinkG(t, t + 0.5, true, K.halo(P, uv[0], uv[1], C.blue, 13), 2));
      });
    });
    FLOWKIT.E14.forEach(function (e) {
      var u = e[0], v = e[1], key = u + "-" + v;
      s += K.edge(P, u, v, { color: "blue", w: 2.2 });
      var lp = K.at(P, u, v, e[3], e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 13, C.blue, ' font-weight="700"');
      if (f[key]) {
        var bp = K.at(P, u, v, e[3] > 0.6 ? 0.42 : 0.66, 0);
        s += K.fbox(bp[0], bp[1], f[key]);
        s += K.dots(P, u, v, 0, D, f[key], C.or, 0, 1.6);
      }
    });
    Object.keys(P).forEach(function (k) {
      var base = k === "s" ? "src" : k === "t" ? "sink" : "t";
      var pairs = [[0, base]];
      cuts.forEach(function (c) { pairs.push([c.t0, c.S.indexOf(k) >= 0 ? (k === "s" ? "srcS" : "s") : base]); });
      pairs.push([15.2, base]);
      s += K.nodeSt(P, k, k, pairs, 17);
    });
    cuts.forEach(function (c) {
      s += K.vis(c.t0 + 0.2, c.t1, '<path d="' + c.path + '" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="8 6"/>');
    });
    // 오른쪽 판
    var X = 522;
    s += '<rect x="' + (X - 8) + '" y="44" width="244" height="300" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
    cuts.forEach(function (c) {
      var tn = c.t0 + 0.6 + (c.fw.length + c.bk.length) * 0.6;
      s += K.vis(c.t0, c.t1, K.txt(X + 114, 68, "S = " + c.name, 13, C.sNode, ' font-weight="700"') +
        K.txt(X + 4, 96, "넘어감(주황) − 되돌아옴(파랑)", 12, C.ink, ' text-anchor="start"'));
      s += K.vis(tn, c.t1, K.txt(X + 114, 122, c.net, 16, C.or, ' font-weight="700"'));
      s += K.vis(tn + 0.6, c.t1, K.txt(X + 4, 156, "cut 의 cost (S→T capacity 합)", 12, C.ink, ' text-anchor="start"') +
        K.txt(X + 114, 180, c.cost, 15, C.blue, ' font-weight="700"'));
      s += K.vis(tn + 1.2, c.t1, K.txt(X + 114, 214, c.le, 20, C.red, ' font-weight="700"'));
    });
    s += K.vis(15.2, D, K.txt(X + 114, 72, "세 cut 모두", 13, C.ink, ' font-weight="700"') +
      K.txt(X + 114, 100, "flow 값 4 ≤ 19, 17, 11", 15, C.red, ' font-weight="700"') +
      K.txt(X + 4, 140, "물건은 언젠가 S→T 로 넘어야 하고,", 12, C.ink, ' text-anchor="start"') +
      K.txt(X + 4, 160, "넘는 파이프 굵기 합이 cost 다", 12, C.ink, ' text-anchor="start"') +
      K.txt(X + 114, 200, "아무 flow ≤ 아무 cut", 15, C.pur, ' font-weight="700"') +
      K.txt(X + 114, 228, "⇒ max flow ≤ min cut", 15, C.pur, ' font-weight="700"') +
      K.txt(X + 114, 256, "(Lemma 1, p.17)", 12, C.muted));
    s += K.txt(380, 378, "flow 값 = (S→T 로 넘은 flow) − (T→S 로 되돌아온 flow). 넘은 flow 는 capacity 합을 못 넘는다", 12.5, C.pur, ' font-weight="700"');
    return s + '</svg>';
  }
};
