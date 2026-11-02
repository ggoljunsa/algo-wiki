// ============================================================
// fib_tree_repeat — L12 p.24 "Consider Fib(8)" 재귀 트리 → p.36–37 memo-ization visualization (사슬로 접힘)
// 그림은 깊이 4 (31 노드)까지만 그리고 아래는 "…". 색은 값마다 하나 (슬라이드처럼 같은 부분문제 = 같은 색).
// 검산(Python, F(0)=F(1)=1 인 슬라이드 정의로 Fibonacci(8) 순수 재귀): 전체 호출 67번,
//   값별 호출 수 Fib(7) 1 · Fib(6) 2 · Fib(5) 3 · Fib(4) 5 · Fib(3) 8 · Fib(2) 13 · Fib(1) 21 · Fib(0) 13
//   그려진 깊이 4 까지: Fib(5) 3번, Fib(4) 5번 (둘 다 전체 호출 수와 같다)
// memo(top-down, 왼쪽 Fib(n−1) 먼저): 실제로 계산하는 호출 = 사슬 8 → 7 → … → 1 (+ F[0], F[1] 은 초기값), 오른쪽 Fib(n−2) 는 F[] 에서 바로 꺼냄
// 시간축(초): 0.4–3.6 트리가 자람 → 4.4 Fib(5) → 5.7 Fib(4) → 7.0 memo 로 가지치기 → 10.2 사슬 → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["fib_tree_repeat"] = {
  title: "Fib(8) 재귀 트리 — 같은 부분문제가 반복된다, memo 로 사슬이 된다 (13초)",
  desc: "L12 p.23–37. 순수 재귀 `Fibonacci(8)` 은 Fib(5), Fib(4) … 를 몇 번이고 다시 푼다 — [[overlapping subproblems]]. 한 번 푼 값을 F[] 에 적어 두면([[top-down과 memoization]]) 오른쪽 가지가 전부 잘려 8 → 7 → … → 0 사슬, O(n) 이 된다.",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { blue: "#1d65b3", green: "#2e9e4f", or: "#e09a40", pur: "#3b2f4a", red: "#d6465f", muted: "#777", ink: "#222", line: "#b9c4d8" };
    var VC = { 8: "#1f8a6e", 7: "#7fb236", 6: "#e09a40", 5: "#b5541c", 4: "#6b3fa0", 3: "#1d65b3", 2: "#3aa6c8", 1: "#666", 0: "#9aa3ad" };
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

    // 전체 호출 수 (순수 재귀, 검산과 같은 계산)
    var calls = {};
    (function fib(n) { calls[n] = (calls[n] || 0) + 1; if (n > 1) { fib(n - 1); fib(n - 2); } })(8);
    var total = 0; Object.keys(calls).forEach(function (k) { total += calls[k]; });

    // 깊이 4 까지의 트리
    var nodes = [];   // {L, i, v, x, y, kind}
    function X(L, i) { return Math.round(20 + (i + 0.5) * 720 / Math.pow(2, L)); }
    function Y(L) { return 64 + L * 46; }
    var GT = [0.4, 1.2, 2.0, 2.8, 3.6];
    var MEMO = 7.0, CHAIN = 10.2;
    function build(L, i, v, kind) {
      // kind: "spine" = 왼쪽 사슬(실제 계산), "hit" = spine 의 오른쪽 자식(F[] 에서 꺼냄), "cut" = 잘리는 가지
      var n = { L: L, i: i, v: v, x: X(L, i), y: Y(L), kind: kind };
      nodes.push(n);
      if (L < 4 && v > 1) {
        n.kids = [build(L + 1, 2 * i, v - 1, kind === "spine" ? "spine" : "cut"), build(L + 1, 2 * i + 1, v - 2, kind === "spine" ? "hit" : "cut")];
      }
      return n;
    }
    build(0, 0, 8, "spine");

    var s = '<svg viewBox="0 0 760 362" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fibonacci 재귀 트리와 memoization 애니메이션">';
    var caps = [
      [0, 4.4, "순수 재귀 Fibonacci(8): 호출이 두 갈래로 계속 갈라진다"],
      [4.4, 5.7, "Fib(5) 가 여러 번 — 같은 부분문제를 처음부터 다시 푼다"],
      [5.7, MEMO, "Fib(4) 는 더 많이 — overlapping subproblems"],
      [MEMO, CHAIN, "memo 를 켜면: 오른쪽 Fib(n−2) 는 F[] 에서 꺼내고 끝 — 가지가 잘린다"],
      [CHAIN, D, "남는 것은 사슬 8 → 7 → … → 0: 각 F(i) 를 한 번씩 = O(n)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    function fadeAfterMemo(kind) {
      if (kind === "cut") return anim("opacity", [[MEMO, 1], [MEMO + 0.8, 0.1]]);
      return "";
    }
    // 간선
    nodes.forEach(function (n) {
      (n.kids || []).forEach(function (k) {
        s += '<g opacity="0">' + show(GT[k.L], D) + '<line x1="' + n.x + '" y1="' + n.y + '" x2="' + k.x + '" y2="' + k.y + '" stroke="' + C.line + '" stroke-width="2">' +
          (k.kind === "cut" ? anim("opacity", [[MEMO, 1], [MEMO + 0.8, 0.1]]) : "") +
          (k.kind === "spine" ? step("stroke", [[0, C.line], [MEMO, C.pur]]) + step("stroke-width", [[0, 2], [MEMO, 3.5]]) : "") + '</line></g>';
      });
      if (n.L === 4 && n.v > 1) s += '<g opacity="0">' + show(GT[4], D) + '<text x="' + n.x + '" y="' + (n.y + 30) + '" font-size="12" fill="' + C.muted + '" text-anchor="middle">…' + fadeAfterMemo(n.kind === "spine" ? "spine" : "cut") + '</text></g>';
    });
    // 노드
    nodes.forEach(function (n) {
      var inner = '<circle cx="' + n.x + '" cy="' + n.y + '" r="14" fill="' + VC[n.v] + '" stroke="#fff" stroke-width="1.5">' +
        (n.kind === "hit" ? step("fill", [[0, VC[n.v]], [MEMO, "#fff"]]) + step("stroke", [[0, "#fff"], [MEMO, VC[n.v]]]) + step("stroke-width", [[0, 1.5], [MEMO, 3]]) : "") + '</circle>' +
        '<text x="' + n.x + '" y="' + (n.y + 5) + '" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">' +
        (n.kind === "hit" ? step("fill", [[0, "#fff"], [MEMO, VC[n.v]]]) : "") + n.v + '</text>';
      s += '<g opacity="0">' + show(GT[n.L], D) + '<g>' + fadeAfterMemo(n.kind) + inner + '</g></g>';
      if (n.kind === "hit") s += vis(MEMO + 0.3, D, txt(n.x + 18, n.y - 12, "F[" + n.v + "] 꺼냄", 10, C.green, ' text-anchor="start" font-weight="700"'));
    });
    // 반복 강조 고리
    [[5, 4.4, MEMO], [4, 5.7, MEMO]].forEach(function (r) {
      var rings = "", cnt = 0;
      nodes.forEach(function (n) {
        if (n.v !== r[0]) return;
        cnt++;
        rings += '<circle cx="' + n.x + '" cy="' + n.y + '" r="19" fill="none" stroke="' + C.red + '" stroke-width="3">' +
          '<animate attributeName="r" values="19;23;19" dur="0.6s" begin="' + r[1] + 's" repeatCount="' + Math.floor((MEMO - r[1]) / 0.6) + '"/></circle>';
      });
      s += vis(r[1], r[2], rings + txt(r[0] === 5 ? 120 : 640, 300, "Fib(" + r[0] + ") × " + cnt + " (그림 안)", 13, C.red, ' font-weight="700"'));
    });
    // 전체 호출 수
    s += vis(4.4, CHAIN, txt(380, 326, "Fib(8) 전체 호출 " + total + "번: Fib(5) " + calls[5] + "번 · Fib(4) " + calls[4] + "번 · Fib(3) " + calls[3] + "번 · Fib(2) " + calls[2] + "번 · Fib(1) " + calls[1] + "번", 12.5, C.ink, ' font-weight="700"'));

    // 사슬 (p.25 / p.37)
    var ch = "";
    for (var v = 8; v >= 0; v--) {
      var cx = 186 + (8 - v) * 46;
      if (v < 8) ch += '<line x1="' + (cx - 32) + '" y1="300" x2="' + (cx - 14) + '" y2="300" stroke="' + C.pur + '" stroke-width="2"/>';
      ch += '<circle cx="' + cx + '" cy="300" r="14" fill="' + VC[v] + '"/>' + txt(cx, 305, v, 13, "#fff", ' font-weight="700"');
    }
    s += vis(CHAIN, D, '<rect x="40" y="278" width="680" height="62" rx="10" fill="#fff" stroke="' + C.green + '" stroke-width="2"/>' +
      txt(60, 305, "사슬:", 13, C.green, ' text-anchor="start" font-weight="700"') + ch +
      txt(380, 333, "호출 " + total + "번 → F(i) 마다 한 번 계산 (n+1 칸) = O(n)", 12.5, C.green, ' font-weight="700"'));

    s += txt(380, 356, "overlapping subproblems + 표(F[])에 적어 두기 = dynamic programming", 12.5, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
