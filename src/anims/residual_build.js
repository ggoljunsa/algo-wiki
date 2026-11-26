// ============================================================
// residual_build — L17 p.21–22: flow f 가 있는 G 에서 residual graph Gf 를 간선 하나씩 만든다
//   G: s→a 4 (f3), s→b 8 (f1), a→b 6 (f1), a→t 2 (f2), b→t 3 (f2), flow 값 4.
//   Gf: forward(파랑) = c − f, backward(연두) = f. a→t 는 꽉 차서 forward 없음.
//   결과 s→a 1, a→s 3, s→b 7, b→s 1, a→b 5, b→a 1, t→a 2, b→t 1, t→b 2 (검산 src/sims/_check_L17_anims.py)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["residual_build"] = {
  title: "residual graph Gf 만들기 — 간선마다 파랑 c−f, 연두 f (15초)",
  desc: "L17 p.21–22. 왼쪽 G 의 간선을 하나씩 집어서 오른쪽 Gf 에 두 화살표로 옮긴다. 같은 방향 파랑 = 아직 더 보낼 수 있는 양(c − f), " +
    "반대 방향 연두 = 이미 보내서 되돌릴 수 있는 양(f). 0 이 되는 화살표는 그리지 않는다. → [[residual graph]]",
  duration: 15,
  build: function () {
    var D = 15, K = FLOWKIT(D, "rb"), C = K.C;
    var L = { s: [50, 172], a: [172, 78], b: [172, 266], t: [294, 172] };
    var R = { s: [448, 172], a: [570, 78], b: [570, 266], t: [692, 172] };
    var E = [["s", "a", 4, 3, -13], ["s", "b", 8, 1, 13], ["a", "b", 6, 1, 12], ["a", "t", 2, 2, -13], ["b", "t", 3, 2, 13]];
    var T0 = 1.5, ST = 2.2, TE = T0 + ST * E.length;
    var s = '<svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="residual graph 만들기 애니메이션">' + K.defs();
    var caps = [[0, T0, "왼쪽: flow f 가 있는 G (값 4). 오른쪽에 Gf 를 그린다"]];
    E.forEach(function (e, i) {
      caps.push([T0 + ST * i, T0 + ST * (i + 1), e[0] + "→" + e[1] + ": capacity " + e[2] + ", flow " + e[3] + (e[2] === e[3] ? " → 꽉 찼다" : "")]);
    });
    caps.push([TE, D, "파랑 = 더 보낼 수 있는 양, 연두 = 되돌릴 수 있는 양"]);
    s += K.captions(caps);
    s += K.txt(172, 330, "G 와 flow f", 13, C.pur, ' font-weight="700"') + K.txt(570, 330, "residual graph Gf", 13, C.pur, ' font-weight="700"');
    s += '<line x1="370" y1="50" x2="370" y2="318" stroke="#d5dbe6" stroke-width="1.5" stroke-dasharray="4 4"/>';
    // G
    E.forEach(function (e, i) {
      var t = T0 + ST * i;
      s += K.vis(t, t + ST, K.halo(L, e[0], e[1], C.or, 14));
      s += K.edge(L, e[0], e[1], { color: "blue", w: 2.5 });
      var lp = K.at(L, e[0], e[1], 0.42, e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 15, C.blue, ' font-weight="700"');
      var bp = K.at(L, e[0], e[1], 0.62, 0);
      s += K.fbox(bp[0], bp[1], e[3], e[2] === e[3] ? C.or : C.blue);
    });
    // Gf: 간선마다 forward → backward
    E.forEach(function (e, i) {
      var t = T0 + ST * i, fw = e[2] - e[3], bw = e[3];
      if (fw > 0) {
        var lf = K.at(R, e[0], e[1], 0.5, 17, 5);
        s += K.vis(t + 0.45, D, K.edge(R, e[0], e[1], { color: "blue", w: 2.5, off: 5 }) + K.txt(lf[0], lf[1] + 5, fw, 15, C.blue, ' font-weight="700"'));
      } else {
        var lx = K.at(R, e[0], e[1], 0.5, 0, 0);
        s += K.vis(t + 0.45, t + ST, K.edge(R, e[0], e[1], { color: "grey", w: 2, off: 5, dash: "5 4" }) +
          K.txt(lx[0] + 20, lx[1] - 12, "0 → 안 그림", 12, C.red, ' font-weight="700"'));
      }
      var lb = K.at(R, e[1], e[0], 0.5, 17, 5);
      s += K.vis(t + 1.1, D, K.edge(R, e[1], e[0], { color: "lime", w: 2.5, off: 5 }) + K.txt(lb[0], lb[1] + 5, bw, 15, C.lime, ' font-weight="700"'));
      // 아래 계산 줄
      s += K.vis(t + 0.45, t + ST, K.txt(380, 358, "파랑 " + e[0] + "→" + e[1] + " = c − f = " + e[2] + " − " + e[3] + " = " + fw + (fw ? "" : " (꽉 참: 그리지 않는다)"), 13.5, C.blue, ' font-weight="700"'));
      s += K.vis(t + 1.1, t + ST, K.txt(380, 382, "연두 " + e[1] + "→" + e[0] + " = f = " + e[3], 13.5, C.lime, ' font-weight="700"'));
    });
    s += K.vis(TE, D, K.txt(380, 358, "Gf 에 s→t 길이 있다: s→a→b→t (파랑 1, 5, 1) → 1 을 더 보낼 수 있다 (p.24)", 13, C.ink, ' font-weight="700"') +
      K.txt(380, 382, "\"Forward edges are the amount that's left. Backwards edges are the amount that's been used.\"", 11.5, C.muted));
    s += K.vis(TE, D, K.halo(R, "s", "a", C.or, 10, 5) + K.halo(R, "a", "b", C.or, 10, 5) + K.halo(R, "b", "t", C.or, 10, 5));
    ["s", "a", "b", "t"].forEach(function (k) {
      var st = k === "s" ? "src" : k === "t" ? "sink" : "t";
      s += K.nodeSt(L, k, k, [[0, st]], 17) + K.nodeSt(R, k, k, [[0, st]], 17);
    });
    return s + '</svg>';
  }
};
