// ============================================================
// augment_backward — L17 p.30–35: backward 간선이 섞인 augmenting path 로 flow 를 늘리는 법
//   G: s→a 4 (f1), s→b 3 (f1), b→a 6 (f1), a→t 2 (f2), b→t 3 (f0). 값 2.
//   Gf: s→a 3, a→s 1, s→b 2, b→s 1, b→a 5, a→b 1(연두), t→a 2, b→t 3.
//   경로 s→a ⇢ b→t (a⇢b 는 backward), x = min(3,1,3) = 1.
//   틀린 방법(모두 +1): a 로 들어옴 2+2=4, 나감 2 → 보존 깨짐 (p.31)
//   맞는 방법: s→a 1→2, b→a 1→0 (뺀다), b→t 0→1. 값 3 (p.34). 검산 src/sims/_check_L17_anims.py
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["augment_backward"] = {
  title: "augmenting path 에 연두(backward) 간선이 끼면 — 더하고, 뺀다 (16초)",
  desc: "L17 p.30–35. Gf 의 경로 s→a⇢b→t 는 가운데를 연두 간선으로 지난다. 연두 간선은 원래 간선 b→a 를 거꾸로 탄 것이라, " +
    "그 간선에는 flow 를 더하지 않고 '''뺀다'''. 그래야 a, b 에서 들어온 양 = 나간 양이 유지되고 값이 x 만큼 는다. → [[augmenting path]]",
  duration: 16,
  build: function () {
    var D = 16, K = FLOWKIT(D, "ab"), C = K.C;
    var L = { s: [52, 176], a: [176, 80], b: [176, 272], t: [300, 176] };
    var R = { s: [452, 176], a: [576, 80], b: [576, 272], t: [700, 176] };
    var s = '<svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="backward 간선을 지나는 augmenting path 애니메이션">' + K.defs();
    s += K.captions([
      [0, 2, "지금 flow 의 값은 2. 오른쪽 Gf 에 s 에서 t 로 가는 길이 있나?"],
      [2, 4.6, "있다: s→a (파랑 3) → a⇢b (연두 1) → b→t (파랑 3)"],
      [4.6, 6.2, "x = 경로 위 최솟값 = min(3, 1, 3) = 1"],
      [6.2, 8.8, "모든 간선에 +1 하면? a 로 4 가 들어오고 2 만 나간다 → 보존이 깨진다 (p.31)"],
      [8.8, 11.6, "파랑으로 간 곳은 +1, 연두로 거꾸로 간 b→a 는 −1"],
      [11.6, 14.2, "a: 2 + 0 들어와 2 나감, b: 1 들어와 0 + 1 나감. 값은 3"],
      [14.2, D, "\"Still a legit flow, but with a bigger value!\" (p.34)"]
    ]);
    s += K.txt(176, 330, "G 와 flow f", 13, C.pur, ' font-weight="700"') + K.txt(576, 330, "Gf (지금 flow 기준)", 13, C.pur, ' font-weight="700"');
    s += '<line x1="376" y1="46" x2="376" y2="318" stroke="#d5dbe6" stroke-width="1.5" stroke-dasharray="4 4"/>';
    // ---- G ----
    var G = [["s", "a", 4, -13, [[0, "1"], [6.2, "2", C.red], [8.8, "1"], [9.4, "2", C.red]]],
      ["s", "b", 3, 13, [[0, "1"]]],
      ["b", "a", 6, -12, [[0, "1"], [6.2, "2", C.red], [8.8, "1"], [10.2, "0", C.red]]],
      ["a", "t", 2, -13, [[0, "2"]]],
      ["b", "t", 3, 13, [[0, "0"], [6.2, "1", C.red], [8.8, "0"], [11, "1", C.red]]]];
    s += K.vis(6.2, 8.8, K.halo(L, "s", "a", C.red, 12) + K.halo(L, "b", "a", C.red, 12) + K.halo(L, "b", "t", C.red, 12));
    s += K.vis(8.8, D, K.halo(L, "s", "a", C.green, 12) + K.halo(L, "b", "t", C.green, 12));
    s += K.vis(10.2, D, K.halo(L, "b", "a", "#8a5cc0", 12));
    G.forEach(function (e) {
      s += K.edge(L, e[0], e[1], { color: "blue", w: 2.5 });
      var lp = K.at(L, e[0], e[1], 0.4, e[3]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 15, C.blue, ' font-weight="700"');
      var bp = K.at(L, e[0], e[1], 0.62, 0);
      s += K.fboxSeq(bp[0], bp[1], e[4].map(function (p) { return [p[0], p[1], p[2]]; }));
    });
    s += K.vis(9.4, D, K.txt(110, 108, "+1", 14, C.green, ' font-weight="700"'));
    s += K.vis(10.2, D, K.txt(206, 196, "−1", 14, "#8a5cc0", ' font-weight="700"'));
    s += K.vis(11, D, K.txt(262, 258, "+1", 14, C.green, ' font-weight="700"'));
    // 틀린 방법 경고
    s += K.vis(6.6, 8.8, '<circle cx="176" cy="80" r="26" fill="none" stroke="' + C.red + '" stroke-width="3"/>' +
      K.txt(176, 40, "들어옴 2 + 2 = 4, 나감 2 ✗", 13, C.red, ' font-weight="700"'));
    // 보존 확인
    s += K.vis(11.6, D, K.txt(176, 40, "a: 들어옴 2 + 0 = 2, 나감 2 ✓", 13, C.green, ' font-weight="700"') +
      K.txt(176, 312, "b: 들어옴 1, 나감 0 + 1 = 1 ✓", 13, C.green, ' font-weight="700"'));
    // ---- Gf ----
    var F = [["s", "a", 3, "blue"], ["a", "s", 1, "lime"], ["s", "b", 2, "blue"], ["b", "s", 1, "lime"],
      ["b", "a", 5, "blue"], ["a", "b", 1, "lime"], ["t", "a", 2, "lime"], ["b", "t", 3, "blue"]];
    // 경로 강조
    s += '<g opacity="0">' + K.halo(R, "s", "a", "#f3c623", 14, 5) + K.disc("opacity", [[0, 0], [2.0, 1], [14.2, 0.6]]) + '</g>';
    s += '<g opacity="0">' + K.halo(R, "a", "b", "#f3c623", 14, 5) + K.disc("opacity", [[0, 0], [2.8, 1], [14.2, 0.6]]) + '</g>';
    s += '<g opacity="0">' + K.halo(R, "b", "t", "#f3c623", 14, 5) + K.disc("opacity", [[0, 0], [3.6, 1], [14.2, 0.6]]) + '</g>';
    F.forEach(function (e) {
      s += K.edge(R, e[0], e[1], { color: e[3], w: 2.5, off: 5 });
      var lp = K.at(R, e[0], e[1], 0.5, 17, 5);
      s += K.txt(lp[0], lp[1] + 5, e[2], 15, e[3] === "lime" ? C.lime : C.blue, ' font-weight="700"');
    });
    s += K.vis(2.8, 8.8, K.txt(576, 308, "연두 a⇢b = 원래 간선 b→a 를 거꾸로 탄 것", 12, C.lime, ' font-weight="700"'));
    s += K.vis(4.6, D, K.pill(452, 100, "x = 1", "#fff7d6", "#e0b400", 15, 70));
    ["s", "a", "b", "t"].forEach(function (k) {
      var st = k === "s" ? "src" : k === "t" ? "sink" : "t";
      s += K.nodeSt(L, k, k, [[0, st]], 17) + K.nodeSt(R, k, k, [[0, st]], 17);
    });
    s += K.seq(380, 360, [[0, "flow 값 2"], [11.6, "flow 값 2 → 3"]], 15, C.ink, ' font-weight="700"');
    s += K.txt(380, 384, "increaseFlow: 파랑(forward) 간선은 f + x, 연두(backward) 간선은 원래 간선에서 f − x", 13, C.pur, ' font-weight="700"');
    return s + '</svg>';
  }
};
