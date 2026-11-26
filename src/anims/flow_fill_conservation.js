// ============================================================
// flow_fill_conservation — L17 p.11–14: capacity 위에 flow 가 채워지고, 정점마다 들어온 만큼 나간다
//   그래프 p.4 (정점 이름 A–F 는 위키가 붙임). p.11 flow (값 4): sA4 AD2 AB1 AE1 BE1 Dt2 Et2.
//   p.14 max flow (값 11): sA4 sB2 sC5 AD3 AE1 BE3 FB1 CF5 Dt3 Et4 Ft4. 검산 src/sims/_check_L17_anims.py
// 시간축(초): 0–2 capacity 만 → 2–5 p.11 flow 가 흐름 → 5–8 정점 A 보존 → 8–10.5 정점 E 보존
//   → 10.5–12.5 값 = s 에서 나감 = t 로 들어감 = 4 → 12.5–17 p.14 max flow, 값 11
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["flow_fill_conservation"] = {
  title: "flow — 파이프에 물을 흘리고, 정점마다 들어온 만큼 나간다 (17초)",
  desc: "L17 p.11–14. 간선 옆 파란 숫자는 capacity(파이프 굵기), 네모 안 숫자는 flow(지금 흘리는 양)다. " +
    "s, t 가 아닌 정점은 들어온 양과 나간 양이 같아야 한다. 그래서 s 에서 나간 양과 t 로 들어간 양이 같고, 그게 flow 의 값이다. → [[flow]]",
  duration: 17,
  build: function () {
    var D = 17, K = FLOWKIT(D, "ffc"), C = K.C;
    var P = K.grid(48, 88, 140, 100, FLOWKIT.BIG);
    var f11 = { "s-A": 4, "A-D": 2, "A-B": 1, "A-E": 1, "B-E": 1, "D-t": 2, "E-t": 2 };
    var f14 = { "s-A": 4, "s-B": 2, "s-C": 5, "A-D": 3, "A-E": 1, "B-E": 3, "F-B": 1, "C-F": 5, "D-t": 3, "E-t": 4, "F-t": 4 };
    var T1 = 2, T2 = 12.5;
    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="flow 와 보존 법칙 애니메이션">' + K.defs();
    s += K.captions([
      [0, T1, "간선 = 파이프, 파란 숫자 = capacity (최대로 흘릴 수 있는 양)"],
      [T1, 5, "네모 = flow: 이 간선으로 지금 보내는 양 (capacity 이하)"],
      [5, 8, "정점 A: 들어온 4 = 나간 2 + 1 + 1"],
      [8, 10.5, "정점 E: 들어온 1 + 1 = 나간 2"],
      [10.5, T2, "flow 의 값 = s 에서 나간 양 = t 로 들어간 양 = 4"],
      [T2, D, "p.14 의 flow: 값 11. 이게 max flow 다"]
    ]);
    // 강조 띠 (보존 확인)
    s += K.vis(5, 8, K.halo(P, "s", "A", C.green, 12) + K.halo(P, "A", "D", C.or, 12) + K.halo(P, "A", "B", C.or, 12) + K.halo(P, "A", "E", C.or, 12));
    s += K.vis(8, 10.5, K.halo(P, "A", "E", C.green, 12) + K.halo(P, "B", "E", C.green, 12) + K.halo(P, "E", "t", C.or, 12));
    s += K.vis(10.5, T2, K.halo(P, "s", "A", C.or, 12) + K.halo(P, "D", "t", C.green, 12) + K.halo(P, "E", "t", C.green, 12));
    // 간선 + capacity + flow
    FLOWKIT.E14.forEach(function (e) {
      var u = e[0], v = e[1], key = u + "-" + v;
      s += K.edge(P, u, v, { color: "blue", w: 2.5 });
      var lp = K.at(P, u, v, e[3], e[4]);
      s += K.txt(lp[0], lp[1] + 5, e[2], 14, C.blue, ' font-weight="700"');
      var bp = K.at(P, u, v, e[3] > 0.6 ? 0.42 : 0.66, 0);
      var a = f11[key], b = f14[key];
      s += K.fboxSeq(bp[0], bp[1], [[0, null], [T1, a ? a : null], [T2, b ? b : null, b && b === e[2] ? C.or : C.blue]]);
      if (a) s += K.dots(P, u, v, T1, T2, a, C.or);
      if (b) s += K.dots(P, u, v, T2 + 0.3, D, b, C.or);
    });
    // 정점
    Object.keys(P).forEach(function (k) {
      s += K.nodeSt(P, k, k, [[0, k === "s" ? "src" : k === "t" ? "sink" : "t"]], 17);
    });
    // 오른쪽 계산판
    var X = 560;
    s += '<rect x="' + (X - 8) + '" y="52" width="204" height="270" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
    s += K.txt(X + 97, 76, "규칙 두 개 (p.11)", 14, C.pur, ' font-weight="700"');
    s += K.txt(X + 4, 100, "① flow ≤ capacity", 13, C.ink, ' text-anchor="start"');
    s += K.txt(X + 4, 122, "② 들어온 양 = 나간 양", 13, C.ink, ' text-anchor="start"');
    s += K.txt(X + 22, 140, "(s, t 는 빼고)", 11.5, C.muted, ' text-anchor="start"');
    s += K.vis(5, 8, K.txt(X + 4, 178, "A 로 들어옴: 4", 13.5, C.green, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 4, 202, "A 에서 나감: 2 + 1 + 1 = 4", 13.5, C.or, ' text-anchor="start" font-weight="700"') + K.txt(X + 97, 232, "같다 ✓", 15, C.green, ' font-weight="700"'));
    s += K.vis(8, 10.5, K.txt(X + 4, 178, "E 로 들어옴: 1 + 1 = 2", 13.5, C.green, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 4, 202, "E 에서 나감: 2", 13.5, C.or, ' text-anchor="start" font-weight="700"') + K.txt(X + 97, 232, "같다 ✓", 15, C.green, ' font-weight="700"'));
    s += K.vis(10.5, T2, K.txt(X + 4, 178, "s 에서 나감: 4", 13.5, C.or, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 4, 202, "t 로 들어옴: 2 + 2 = 4", 13.5, C.green, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 97, 236, "flow 의 값 = 4", 15, C.ink, ' font-weight="700"') + K.txt(X + 97, 258, "\"pretty wasteful\" (p.13)", 11.5, C.muted));
    s += K.vis(T2, D, K.txt(X + 4, 178, "s 에서 나감: 4 + 2 + 5 = 11", 13.5, C.or, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 4, 202, "t 로 들어옴: 3 + 4 + 4 = 11", 13.5, C.green, ' text-anchor="start" font-weight="700"') +
      K.txt(X + 97, 236, "max flow = 11", 15, C.ink, ' font-weight="700"') + K.txt(X + 97, 258, "주황 네모 = 꽉 찬 간선", 11.5, C.or, ' font-weight="700"') +
      K.txt(X + 97, 300, "min cut 도 11. 우연일까?", 12.5, C.red, ' font-weight="700"'));
    s += K.txt(380, 368, "중간 정점에서 물이 생기거나 사라지지 않으니, s 에서 나간 만큼 t 로 들어간다", 13, C.pur, ' font-weight="700"');
    return s + '</svg>';
  }
};
