// ============================================================
// mis_tree_dp — L13 p.94–104: 가중치 트리의 maximum-weight independent set 을 리프부터 A[u]·B[u] 로 채워 올린다
// 트리 (p.95 그림 그대로, 가운데 가중치 5 정점을 루트로 잡음):
//   r(5) ─ x(3) ─ 리프 3, 2, 2
//        └ y(1) ─ p(2) ─ 리프 3
//                └ 리프 5, 리프 5
// 규칙 (p.104): 리프  A = weight, B = 0
//              내부  B[u] = Σ A[v],  A[u] = max{ Σ A[v], weight(u) + Σ B[v] }
// 검산(Python 전수조사 2^11 과 같음):
//   리프 A = 3,2,2,3,5,5 / B = 0
//   p : B = 3,  A = max{3, 2+0} = 3
//   x : B = 7,  A = max{7, 3+0} = 7
//   y : B = 3+5+5 = 13,  A = max{13, 1+(3+0+0)} = 13
//   r : B = 7+13 = 20,   A = max{20, 5+(7+13)} = 25   → 답 25 = {r, x 의 리프 3·2·2, p 의 리프 3, 리프 5·5}
// 시간축(초): 0–1.5 트리 → 1.5 리프 → 3.5 p → 5.2 x → 6.9 y → 8.8 r → 10.8–13 고른 정점
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["mis_tree_dp"] = {
  title: "트리 위 DP — 리프부터 A[u], B[u] 를 채워 올린다 (13초)",
  desc: "L13 p.94–104. A[u] 는 u 를 루트로 한 서브트리에서 고를 수 있는 independent set 의 최대 가중치, B[u] 는 자식들의 A 합이다. 리프에서 시작해 부모로 올라가며 채우면 루트의 A 가 답이다. 정점마다 O(1) 이라 전체 O(|V|).",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", ink: "#222", line: "#b9c4d8", bOr: "#b8741a" };
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

    // 정점: [이름, 가중치, x, y, 부모, 라벨 위치('below' | 'ul' | 'ur' | 'r')]
    var V = [
      ["r", 5, 380, 74, null, "r"],
      ["x", 3, 200, 140, "r", "ul"],
      ["y", 1, 560, 140, "r", "ur"],
      ["x1", 3, 110, 212, "x", "below"], ["x2", 2, 200, 212, "x", "below"], ["x3", 2, 290, 212, "x", "below"],
      ["p", 2, 470, 212, "y", "ul"], ["y2", 5, 575, 212, "y", "below"], ["y3", 5, 665, 212, "y", "below"],
      ["p1", 3, 470, 278, "p", "r"]
    ];
    var byName = {}; V.forEach(function (v) { byName[v[0]] = v; });
    var kids = {}; V.forEach(function (v) { if (v[4]) (kids[v[4]] = kids[v[4]] || []).push(v[0]); });
    // DP (build 안에서 계산 → 머리 주석과 같다)
    var A = {}, B = {};
    function solve(u) {
      var ch = kids[u] || [];
      if (!ch.length) { A[u] = byName[u][1]; B[u] = 0; return; }
      ch.forEach(solve);
      var sa = 0, sb = 0; ch.forEach(function (v) { sa += A[v]; sb += B[v]; });
      B[u] = sa; A[u] = Math.max(sa, byName[u][1] + sb);
    }
    solve("r");
    // 고른 정점 (역추적)
    var pick = {};
    function trace(u, canTake) {
      var ch = kids[u] || [], sb = 0; ch.forEach(function (v) { sb += B[v]; });
      var take = canTake && (!ch.length || byName[u][1] + sb > B[u]);
      if (take) pick[u] = 1;
      ch.forEach(function (v) { trace(v, !take); });
    }
    trace("r", true);

    var T = { leaf: 1.5, p: 3.5, x: 5.2, y: 6.9, r: 8.8, pick: 10.8 };
    function when(u) { return (kids[u] || []).length ? T[u] : T.leaf; }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="트리 DP 애니메이션">';
    var caps = [
      [0, T.leaf, "가중치 트리. 이웃한 두 정점을 함께 고를 수 없다"],
      [T.leaf, T.p, "리프: A = weight, B = 0"],
      [T.p, T.x, "p: 자식 리프 3 → B = 3, A = max{ 3, 2 + 0 } = 3"],
      [T.x, T.y, "x: 자식 A 합 7 과 3 + (B 합 0) 을 비교 → A = 7"],
      [T.y, T.r, "y: 자식 A 합 13 과 1 + (B 합 3) 을 비교 → A = 13"],
      [T.r, T.pick, "루트 r: max{ 7 + 13, 5 + (7 + 13) } = 25"],
      [T.pick, D, "답 A[r] = 25. 초록 정점이 고른 independent set"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // 간선
    V.forEach(function (v) {
      if (!v[4]) return;
      var p = byName[v[4]];
      s += '<line x1="' + p[2] + '" y1="' + p[3] + '" x2="' + v[2] + '" y2="' + v[3] + '" stroke="' + C.blue + '" stroke-width="2.2"/>';
    });
    // 정점
    V.forEach(function (v) {
      var t = when(v[0]);
      var ring = '<circle cx="' + v[2] + '" cy="' + v[3] + '" r="22" fill="none" stroke="' + C.or + '" stroke-width="3.5"/>';
      s += vis(t, t + 1.6, ring);
      var fillAnim = pick[v[0]]
        ? '<animate attributeName="fill" calcMode="discrete" values="' + C.purL + ';' + C.green + '" keyTimes="0;' + r4(T.pick / D) + '" dur="' + D + 's" fill="freeze"/>'
        : '<animate attributeName="fill" calcMode="discrete" values="' + C.purL + ';#f2f2f2" keyTimes="0;' + r4(T.pick / D) + '" dur="' + D + 's" fill="freeze"/>';
      s += '<circle cx="' + v[2] + '" cy="' + v[3] + '" r="17" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="2">' + fillAnim + '</circle>';
      var numCol = pick[v[0]]
        ? '<animate attributeName="fill" calcMode="discrete" values="' + C.ink + ';#fff" keyTimes="0;' + r4(T.pick / D) + '" dur="' + D + 's" fill="freeze"/>' : '';
      s += '<text x="' + v[2] + '" y="' + (v[3] + 5) + '" font-size="14" font-weight="700" fill="' + C.ink + '" text-anchor="middle">' + v[1] + numCol + '</text>';
      // 이름 (내부 정점만)
      if ((kids[v[0]] || []).length) s += txt(v[2], v[3] - 22, v[0], 11, C.muted, ' font-style="italic"');
      // A/B 라벨
      var lx, ly, anc;
      if (v[5] === "below") { lx = v[2]; ly = v[3] + 32; anc = "middle"; }
      else if (v[5] === "ul") { lx = v[2] - 26; ly = v[3] - 14; anc = "end"; }
      else if (v[5] === "ur") { lx = v[2] + 26; ly = v[3] - 14; anc = "start"; }
      else { lx = v[2] + 26; ly = v[3] - 2; anc = "start"; }
      var lab = '<text x="' + lx + '" y="' + ly + '" font-size="12" font-weight="700" text-anchor="' + anc + '">' +
        '<tspan fill="' + C.blue + '">A=' + A[v[0]] + '</tspan></text>' +
        '<text x="' + lx + '" y="' + (ly + 14) + '" font-size="12" font-weight="700" text-anchor="' + anc + '">' +
        '<tspan fill="' + C.bOr + '">B=' + B[v[0]] + '</tspan></text>';
      s += vis(t + 0.3, D, lab);
    });

    // 계산 칸 (왼쪽 아래)
    var calc = [
      [T.leaf, T.p, ["리프 u:  A[u] = weight(u),  B[u] = 0", "(자식이 없으니 비교할 것도 없다)"]],
      [T.p, T.x, ["B[p] = A[3] = 3", "A[p] = max{ 3, 2 + B[3] } = max{ 3, 2 } = 3"]],
      [T.x, T.y, ["B[x] = 3 + 2 + 2 = 7", "A[x] = max{ 7, 3 + (0 + 0 + 0) } = 7"]],
      [T.y, T.r, ["B[y] = A[p] + 5 + 5 = 13", "A[y] = max{ 13, 1 + (B[p] + 0 + 0) } = max{ 13, 4 } = 13"]],
      [T.r, T.pick, ["B[r] = A[x] + A[y] = 20", "A[r] = max{ 20, 5 + (B[x] + B[y]) } = max{ 20, 25 } = 25"]],
      [T.pick, D, ["r 을 고른다 → 자식 x, y 는 빼고 손자 쪽 A 를 쓴다", "5 + (3 + 2 + 2) + 3 + (5 + 5) = 25"]]
    ];
    calc.forEach(function (c) {
      s += vis(c[0], c[1], txt(30, 300, c[2][0], 12.5, C.ink, ' text-anchor="start" font-weight="700"') +
        txt(30, 320, c[2][1], 12.5, C.ink, ' text-anchor="start" font-weight="700"'));
    });

    s += '<line x1="20" y1="332" x2="740" y2="332" stroke="' + C.line + '"/>';
    s += txt(380, 352, "A[u] = max{ Σ A[v],  weight(u) + Σ B[v] },  B[u] = Σ A[v]  (v = u 의 자식). 정점마다 O(1) → O(|V|)", 12, C.pur, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
