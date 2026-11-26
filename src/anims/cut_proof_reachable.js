// ============================================================
// cut_proof_reachable — L17 p.38–40 (⇒ 방향 증명) 을 그림 그대로: Gf 에서 s 가 닿는 정점을 칠하면 그게 S
//   G: s→a 4 (f4), s→b 8 (f1), a→b 6 (f2), a→t 2 (f2), b→t 3 (f3). 값 5.
//   Gf (맞는 값): s→b 7, b→s 1, a→s 4, a→b 4, b→a 2, t→a 2, t→b 3. (슬라이드 p.39 의 a–b 5·1 은 옛 flow 값)
//   BFS: s → b (s→b 7) → a (b→a 2, 연두). t 에 들어가는 Gf 화살표 없음 → S = {s,a,b}, T = {t}
//   S→T: a→t 2/2, b→t 3/3 꽉 참. T→S: 없음. 값 5 = cost 5. 검산 src/sims/_check_L17_anims.py
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["cut_proof_reachable"] = {
  title: "증명의 cut 선 긋기 — Gf 에서 s 가 닿는 곳을 연두로 칠한다 (20초)",
  desc: "L17 p.38–40. 왼쪽 Gf 에서 s 부터 화살표를 따라 갈 수 있는 정점을 칠하면 S = {s, a, b} 이고 t 는 못 칠한다. 그 경계가 cut 이다. " +
    "오른쪽 G 에서 보면 경계를 S→T 로 넘는 간선은 전부 꽉 차 있다(안 찼으면 Gf 에 파랑 화살표가 있어서 BFS 가 넘어갔다). 그래서 flow 값 = cut 의 cost. → [[max-flow min-cut 증명 (cut 선 긋기)]]",
  duration: 20,
  build: function () {
    var D = 20, K = FLOWKIT(D, "cpr"), C = K.C;
    var L = { s: [62, 186], a: [200, 84], b: [200, 288], t: [338, 186] };
    var R = { s: [430, 186], a: [568, 84], b: [568, 288], t: [706, 186] };
    var Ts = 2, Tb = 3.2, Ta = 4.8, Tt = 6.4, Tc = 8.2, Tf = 9.8, Th = 12.6, Tn = 14.8, Tv = 16.6;
    var s = '<svg viewBox="0 0 760 404" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="max-flow min-cut 증명의 cut 선 긋기 애니메이션">' + K.defs();
    s += K.captions([
      [0, Ts, "가정: Gf 에 s→t 경로가 없다. 왼쪽 Gf, 오른쪽 원래 G 와 flow (값 5)"],
      [Ts, Tb, "Gf 에서 s 부터 시작. s 를 칠한다"],
      [Tb, Ta, "s 에서 나가는 Gf 화살표는 파랑 s→b 7 하나 → b 를 칠한다"],
      [Ta, Tt, "b 에서 연두 b→a 2 → a 를 칠한다 (a→b 로 보낸 2 를 되돌릴 수 있다)"],
      [Tt, Tc, "a 에서는 s, b 로만 간다. t 로 들어가는 Gf 화살표가 없다 → t 는 못 칠한다"],
      [Tc, Tf, "칠한 정점 S = {s, a, b}, 못 칠한 정점 T = {t}. 그 경계에 선을 긋는다"],
      [Tf, Th, "G 에서 선을 S→T 로 넘는 간선: a→t 2/2, b→t 3/3. 둘 다 꽉 찼다"],
      [Th, Tn, "만약 b→t 가 2/3 이었다면? Gf 에 파랑 b→t 1 → BFS 가 t 로 넘어간다. 모순"],
      [Tn, Tv, "T→S 로 되돌아오는 간선은 여기엔 없다 (있었다면 flow 가 0 이어야 한다)"],
      [Tv, D, "flow 값 = 2 + 3 − 0 = 5 = 이 cut 의 cost. 그래서 f 는 max flow"]
    ]);
    s += K.txt(200, 334, "residual graph Gf", 13, C.pur, ' font-weight="700"') + K.txt(568, 334, "원래 G 와 flow f", 13, C.pur, ' font-weight="700"');
    s += '<line x1="384" y1="44" x2="384" y2="322" stroke="#d5dbe6" stroke-width="1.5" stroke-dasharray="4 4"/>';
    // 연두 S 영역 (양쪽)
    function lime(P, k, t) { return K.vis(t, D, '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="31" fill="' + C.limeL + '" stroke="' + C.lime + '" stroke-width="1.2" stroke-dasharray="3 3"/>'); }
    s += lime(L, "s", Ts) + lime(L, "b", Tb + 0.6) + lime(L, "a", Ta + 0.6);
    s += lime(R, "s", Tc) + lime(R, "b", Tc) + lime(R, "a", Tc);
    // BFS 로 탄 화살표 강조
    s += K.blinkG(Tb, Tb + 0.6, true, K.halo(L, "s", "b", "#f3c623", 13, 5));
    s += K.blinkG(Ta, Ta + 0.6, true, K.halo(L, "b", "a", "#f3c623", 13, 5));
    // ---- Gf ----
    var F = [["s", "b", 7, "blue", 5], ["b", "s", 1, "lime", 5], ["a", "s", 4, "lime", 0], ["a", "b", 4, "blue", 5],
      ["b", "a", 2, "lime", 5], ["t", "a", 2, "lime", 0], ["t", "b", 3, "lime", 0]];
    F.forEach(function (e) {
      s += K.edge(L, e[0], e[1], { color: e[3], w: 2.6, off: e[4] });
      var lp = K.at(L, e[0], e[1], 0.5, e[4] ? 17 : 13, e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 15, e[3] === "lime" ? C.lime : C.blue, ' font-weight="700"');
    });
    // t 쪽: 들어가는 화살표 없음 표시
    s += K.vis(Tt, Tc, '<circle cx="338" cy="186" r="25" fill="none" stroke="' + C.red + '" stroke-width="3"/>' + K.txt(338, 236, "들어가는 화살표 0 개", 12, C.red, ' font-weight="700"'));
    // 가정 위반 장면: 파랑 b→t 1 (점선)
    s += K.vis(Th, Tn, K.edge(L, "b", "t", { color: "blue", w: 3, dash: "6 4", off: 7 }) + K.txt(300, 268, "b→t 1 ?", 13, C.blue, ' font-weight="700"') +
      K.txt(330, 302, "→ t 도 칠해짐 ✗", 12.5, C.red, ' font-weight="700"'));
    // ---- G ----
    var G = [["s", "a", 4, 4, -13], ["s", "b", 8, 1, 13], ["a", "b", 6, 2, 12], ["a", "t", 2, 2, -13], ["b", "t", 3, 3, 13]];
    s += K.blinkG(Tf, Tf + 0.8, true, K.halo(R, "a", "t", C.or, 14));
    s += K.blinkG(Tf + 0.9, Tf + 1.7, true, K.halo(R, "b", "t", C.or, 14));
    G.forEach(function (e) {
      s += K.edge(R, e[0], e[1], { color: "blue", w: 2.5 });
      var lp = K.at(R, e[0], e[1], 0.4, e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 15, C.blue, ' font-weight="700"');
      var bp = K.at(R, e[0], e[1], 0.62, 0);
      var full = e[2] === e[3];
      if (e[0] === "b" && e[1] === "t") s += K.fboxSeq(bp[0], bp[1], [[0, "3", C.or], [Th, "2", C.red], [Tn, "3", C.or]]);
      else s += K.fbox(bp[0], bp[1], e[3], full ? C.or : C.blue);
    });
    s += K.vis(Tf, Th, K.txt(690, 110, "꽉 참", 13, C.or, ' font-weight="700"') + K.txt(690, 270, "꽉 참", 13, C.or, ' font-weight="700"'));
    s += K.vis(Th, Tn, K.txt(690, 270, "남은 1 ?", 13, C.red, ' font-weight="700"'));
    // cut 선
    var cutL = '<path d="M 292,52 C 270,120 262,160 282,200 C 300,240 268,290 292,326" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="8 6"/>';
    var cutR = '<path d="M 660,52 C 638,120 630,160 650,200 C 668,240 636,290 660,326" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="8 6"/>';
    s += K.vis(Tc + 0.3, D, cutL + cutR);
    // 정점
    ["s", "a", "b", "t"].forEach(function (k) {
      var base = k === "s" ? "src" : k === "t" ? "sink" : "t";
      var tl = { s: Ts, b: Tb + 0.6, a: Ta + 0.6 }[k];
      s += K.nodeSt(L, k, k, tl !== undefined ? [[0, base], [tl, k === "s" ? "srcS" : "s"]] : [[0, base]], 17);
      s += K.nodeSt(R, k, k, k !== "t" ? [[0, base], [Tc, k === "s" ? "srcS" : "s"]] : [[0, base]], 17);
    });
    s += K.vis(Tc + 0.3, D, K.txt(250, 62, "S", 16, C.sNode, ' font-weight="700"') + K.txt(318, 62, "T", 16, C.sink, ' font-weight="700"') +
      K.txt(618, 62, "S", 16, C.sNode, ' font-weight="700"') + K.txt(686, 62, "T", 16, C.sink, ' font-weight="700"'));
    // 아래 계산
    s += K.vis(Tv, D, K.txt(380, 360, "flow 값 = (S→T 넘은 flow 2 + 3) − (T→S 0) = 5,   cut cost = 2 + 3 = 5", 13.5, C.ink, ' font-weight="700"') +
      K.txt(380, 384, "5 = cost(이 cut) ≥ min cut ≥ max flow ≥ 5  →  전부 5", 14.5, C.red, ' font-weight="700"'));
    s += K.vis(Tc, Tv, K.txt(380, 362, "S 는 원래 그래프 G 가 아니라 Gf 의 화살표로 정한다 (a 는 연두 b→a 로 들어왔다)", 13, C.pur, ' font-weight="700"'));
    s += K.vis(0, Tc, K.txt(380, 362, "Gf: 파랑 = 더 보낼 수 있는 양, 연두 = 되돌릴 수 있는 양. 화살표 방향으로만 간다", 13, C.pur, ' font-weight="700"'));
    return s + '</svg>';
  }
};
