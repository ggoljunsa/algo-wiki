// ============================================================
// pivot_partition — L4 p.8–16 select(A, k=3) on [1,64,9,49,16,4,0,25,36,81]
// 피벗 36 → 왼쪽만 재귀 (k=3) → 피벗 1 → 오른쪽 재귀, k = 3−1−1 = 1 → 피벗 9 = 답 (슬라이드 순서 그대로)
// 칸 i 의 x = 60 + 62i. 시간축(초): 0 → 1.5 피벗36 → 2.6 분할 → 4 버림 → 5.5 피벗1 → 6.6 분할 → 8 k 보정
//   → 9.8 피벗9 → 10.9 분할 → 12 답 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["pivot_partition"] = {
  title: "select — 피벗으로 나누고 한쪽만 재귀",
  desc: "[[select]]: pivot 을 골라 [[partition_about_pivot]] 으로 작은 쪽·큰 쪽을 나누고, k 가 있는 한쪽으로만 재귀. 오른쪽으로 갈 때는 k 를 k − len(left) − 1 로 보정한다 ([[k-len(left)-1 보정]])",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", grayL: "#eeeeee", gray: "#bbbbbb" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function kv(pts) {
      var p = pts.slice();
      if (p[0][0] > 0) p.unshift([0, p[0][1]]);
      if (p[p.length - 1][0] < D) p.push([D, p[p.length - 1][1]]);
      return 'values="' + p.map(function (q) { return q[1]; }).join(";") + '" keyTimes="' + p.map(function (q) { return r4(q[0] / D); }).join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function an(attr, pts) { return '<animate attributeName="' + attr + '" ' + kv(pts) + '/>'; }
    function mv(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kv(pts) + '/>'; }
    function steps(first, list) {
      var p = [[0, first]], prev = first;
      list.forEach(function (q) { p.push([q[0], prev]); p.push([q[0] + 0.05, q[1]]); prev = q[1]; });
      return p;
    }
    function X(i) { return 60 + 62 * i; }

    var S = [
      [1, 64, 9, 49, 16, 4, 0, 25, 36, 81],
      [1, 9, 16, 4, 0, 25, 36, 64, 49, 81],
      [0, 1, 9, 16, 4, 25, 36, 64, 49, 81],
      [0, 1, 4, 9, 16, 25, 36, 64, 49, 81]
    ];
    var MOVE = [[2.6, 3.8], [6.6, 7.8], [10.9, 11.8]];
    // 값별 색 이벤트 [t, 상태] (o = pivot, g = 버림, a = 답)
    var EV = {
      36: [[1.5, "o"], [4.0, "g"]], 64: [[4.0, "g"]], 49: [[4.0, "g"]], 81: [[4.0, "g"]],
      1: [[5.5, "o"], [8.0, "g"]], 0: [[8.0, "g"]],
      9: [[9.8, "o"], [12.0, "a"]], 4: [[12.0, "g"]], 16: [[12.0, "g"]], 25: [[12.0, "g"]]
    };
    var FILL = { b: C.blueL, o: C.orL, g: C.grayL, a: C.greenL }, STR = { b: C.blue, o: C.or, g: C.gray, a: C.green }, TX = { b: "#222", o: "#222", g: "#aaa", a: "#1f5f33" };

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="select 피벗 분할 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "k = 3 번째로 작은 원소 찾기 — Select a pivot, partition around it, and recurse"],
      [1.5, 2.6, "Select a pivot at random (for now) → 36"],
      [2.6, 4.0, "Partition: 36 보다 작으면 왼쪽, 크면 오른쪽 (두 쪽은 정렬되지 않은 채)"],
      [4.0, 5.5, "len(left) = 6 &gt; k = 3 → 왼쪽만 재귀: select(left, 3) — 오른쪽은 버림"],
      [5.5, 6.6, "왼쪽 안에서 다시 pivot → 1"],
      [6.6, 8.0, "Partition around the pivot 1"],
      [8.0, 9.8, "len(left) = 1 &lt; k = 3 → select(right, k − len(left) − 1) = select(right, 1)"],
      [9.8, 10.9, "다시 pivot → 9"],
      [10.9, 12.0, "Partition around the pivot 9"],
      [12.0, 14, "len(left) = 1 = k → pivot 9 가 답! We found the element!"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 원소 토큰 ----
    S[0].forEach(function (v) {
      var pts = [[0, X(S[0].indexOf(v)) + ",0"]];
      MOVE.forEach(function (m, i) {
        var a = X(S[i].indexOf(v)), b = X(S[i + 1].indexOf(v));
        pts.push([m[0], a + ",0"]);
        if (a !== b) pts.push([(m[0] + m[1]) / 2, (a + b) / 2 + "," + (b < a ? -30 : 30)]);   // 왼쪽으로 가는 원소는 위로, 오른쪽은 아래로 비켜 감
        pts.push([m[1], b + ",0"]);
      });
      var ev = (EV[v] || []).map(function (e) { return [e[0], e[1]]; });
      var fp = steps(FILL.b, ev.map(function (e) { return [e[0], FILL[e[1]]]; }));
      var sp = steps(STR.b, ev.map(function (e) { return [e[0], STR[e[1]]]; }));
      var tp = steps(TX.b, ev.map(function (e) { return [e[0], TX[e[1]]]; }));
      s += '<g transform="translate(' + X(S[0].indexOf(v)) + ',0)">' + mv(pts) +
        '<rect x="0" y="110" width="52" height="48" rx="6" stroke-width="2.5" fill="' + FILL.b + '" stroke="' + STR.b + '">' + an("fill", fp) + an("stroke", sp) + '</rect>' +
        '<text x="26" y="141" font-size="19" font-weight="700" text-anchor="middle" fill="#222">' + v + an("fill", tp) + '</text></g>';
    });
    for (var i = 0; i < 10; i++) s += txt(X(i) + 26, 174, String(i), 11, C.muted);

    // ---- 분할 라벨 (위) ----
    function lab(from, to, a, b, t, col) { return vis(from, to, txt((X(a) + X(b) + 52) / 2, 98, t, 12, col, ' font-weight="700"')); }
    s += lab(3.8, 5.5, 0, 5, "left: 36 보다 작음 (len 6)", C.blue) + lab(3.8, 5.5, 7, 9, "right: 36 보다 큼", C.muted);
    s += lab(7.8, 9.8, 0, 0, "left (len 1)", C.muted) + lab(7.8, 9.8, 2, 5, "right", C.blue);
    s += lab(11.8, D, 2, 2, "left (len 1)", C.muted) + lab(11.8, D, 4, 5, "right", C.muted);
    s += vis(12.0, D, txt(X(3) + 26, 98, "답 = 9", 13, C.green, ' font-weight="700"'));

    // ---- 현재 탐색 구간 괄호 + k ----
    var br = [[0, 0, 9], [4.0, 0, 5], [8.0, 2, 5], [12.0, 3, 3]];
    var bx = steps(X(0) - 2, br.slice(1).map(function (b) { return [b[0], X(b[1]) - 2]; }));
    var bw = steps(X(9) + 56 - X(0), br.slice(1).map(function (b) { return [b[0], X(b[2]) + 56 - X(b[1])]; }));
    s += '<rect y="182" height="6" rx="3" fill="' + C.or + '" x="' + (X(0) - 2) + '" width="' + (X(9) + 56 - X(0)) + '">' + an("x", bx) + an("width", bw) + '</rect>';
    var kl = [[0, 4.0, 0, 9, "select(A, k = 3)"], [4.0, 8.0, 0, 5, "select(left, k = 3)"], [8.0, 12.0, 2, 5, "select(right, k = 1)"], [12.0, D, 3, 3, "k = 1 ✓"]];
    kl.forEach(function (k) { s += vis(k[0], k[1], txt((X(k[2]) + X(k[3]) + 52) / 2, 206, k[4], 13, "#8a5a14", ' font-weight="700"')); });

    // ---- 코드 (세 분기 강조) ----
    s += '<rect x="100" y="222" width="560" height="92" rx="8" fill="#fafafa" stroke="#ccc"/>';
    var code = [
      ["if len(left) == k:", "return pivot", [[12.0, D]]],
      ["elif len(left) &gt; k:", "return select(left, k, c)", [[4.0, 5.5]]],
      ["else:", "return select(right, k-len(left)-1, c)", [[8.0, 9.8]]]
    ];
    code.forEach(function (c, j) {
      var y = 236 + j * 26;
      c[2].forEach(function (w) { s += vis(w[0], w[1], '<rect x="108" y="' + (y - 2) + '" width="544" height="24" rx="4" fill="' + C.orL + '" stroke="' + C.or + '"/>'); });
      s += '<text x="122" y="' + (y + 15) + '" font-size="13" font-family="SF Mono, Menlo, Consolas, monospace" fill="' + C.pur + '">' + c[0] + '</text>';
      s += '<text x="306" y="' + (y + 15) + '" font-size="13" font-family="SF Mono, Menlo, Consolas, monospace" fill="#222">' + c[1] + '</text>';
    });

    // ---- 요점 ----
    s += txt(380, 342, "한쪽만 재귀 — 오른쪽으로 갈 때는 왼쪽(len(left))과 pivot(1) 만큼 k 를 빼 준다: k − len(left) − 1", 12.5, C.muted);
    s += '</svg>';
    return s;
  }
};
