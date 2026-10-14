// ============================================================
// bst_skew_vs_balanced — L8 p.24–25: 같은 키, 넣는 순서만 다르다
// 시간축(초): 0 빈 두 화면 → 0.6–3.6 왼쪽 2..8 / 오른쪽 5,3,7,2,4,8,1 을 0.5초마다 하나씩 INSERT
//   → 4.4–7.6 SEARCH 8: 왼쪽 7개 노드, 오른쪽 3개 노드를 지남 → 8 height 비교 → 10
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bst_skew_vs_balanced"] = {
  title: "편향 트리 vs 균형 트리 — 넣는 순서가 height 를 정한다 (10초)",
  desc: "L8 p.24–25. 같은 BST INSERT 라도 2,3,4,5,6,7,8 순서로 넣으면 오른쪽으로만 자라는 사슬([[편향 트리]], 층 7 = n), 5,3,7,2,4,8,1 순서면 height 3. 모든 연산이 [[O(height)]] 이므로 '''균형이 전부'''다.",
  duration: 10,
  build: function () {
    var D = 10;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222" };
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

    var B = 30;
    // 왼쪽: 사슬 2..8
    var L = {}, R = {};
    [2, 3, 4, 5, 6, 7, 8].forEach(function (k, i) { L[k] = { x: 60 + i * 42, y: 78 + i * 34, t: 0.6 + i * 0.5, par: i ? k - 1 : null }; });
    // 오른쪽: 5,3,7,2,4,8,1
    var RP = { 5: [575, 78, null], 3: [500, 140, 5], 7: [650, 140, 5], 2: [460, 202, 3], 4: [540, 202, 3], 8: [690, 202, 7], 1: [425, 264, 2] };
    [5, 3, 7, 2, 4, 8, 1].forEach(function (k, i) { R[k] = { x: RP[k][0], y: RP[k][1], t: 0.6 + i * 0.5, par: RP[k][2] }; });

    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="편향 트리와 균형 트리 비교 애니메이션">';
    var caps = [
      [0, 0.6, "같은 키 7개를 빈 BST 에 INSERT 한다 — 넣는 순서만 다르다"],
      [0.6, 4.3, "왼쪽: 2,3,4,5,6,7,8 순서 → 매번 오른쪽 자식으로만 / 오른쪽: 5,3,7,2,4,8,1 순서"],
      [4.3, 8, "SEARCH 8: 왼쪽은 노드 7개를 지나고, 오른쪽은 5 → 7 → 8 의 3개"],
      [8, D, "SEARCH·INSERT·DELETE 모두 시간 = O(height) — 사슬이면 O(n), 균형이면 O(log n)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });
    s += '<line x1="395" y1="50" x2="395" y2="330" stroke="#ccc" stroke-dasharray="4 4"/>';
    s += txt(200, 54, "2,3,4,5,6,7,8 순서 (p.25)", 13, C.red, ' font-weight="700"');
    s += txt(575, 54, "5,3,7,2,4,8,1 순서 (p.10)", 13, C.green, ' font-weight="700"');

    function tree(T, order, pathKeys, t0, dt) {
      var g = "";
      order.forEach(function (k) {
        var n = T[k];
        if (n.par !== null) {
          var p = T[n.par], hot = pathKeys.indexOf(k) > 0;
          var ti = t0 + pathKeys.indexOf(k) * dt;
          g += '<line x1="' + p.x + '" y1="' + (p.y + B / 2) + '" x2="' + n.x + '" y2="' + (n.y - B / 2) + '" stroke="#8aa6c8" stroke-width="2" opacity="0">' +
            show(n.t, D) + (hot ? anim("stroke", [[ti - 0.05, "#8aa6c8"], [ti + 0.1, C.or]]) + anim("stroke-width", [[ti - 0.05, 2], [ti + 0.1, 4]]) : "") + '</line>';
        }
      });
      order.forEach(function (k) {
        var n = T[k], i = pathKeys.indexOf(k), ti = t0 + i * dt;
        var isNew = '<rect x="' + (n.x - B / 2) + '" y="' + (n.y - B / 2) + '" width="' + B + '" height="' + B + '" rx="5" stroke-width="2" fill="' + C.blueL + '" stroke="' + C.blue + '">' +
          anim("fill", [[n.t, C.greenL], [n.t + 0.45, C.blueL]].concat(i >= 0 ? [[ti - 0.05, C.blueL], [ti + 0.1, C.orL]] : [])) +
          anim("stroke", [[n.t, C.green], [n.t + 0.45, C.blue]].concat(i >= 0 ? [[ti - 0.05, C.blue], [ti + 0.1, C.or]] : [])) + '</rect>';
        g += '<g opacity="0">' + isNew + txt(n.x, n.y + 5, k, 14, C.ink, ' font-weight="700"') + show(n.t, D) + '</g>';
      });
      return g;
    }
    s += tree(L, [2, 3, 4, 5, 6, 7, 8], [2, 3, 4, 5, 6, 7, 8], 4.5, 0.45);
    s += tree(R, [5, 3, 7, 2, 4, 8, 1], [5, 7, 8], 4.5, 0.45);

    // 방문 카운터
    for (var i = 1; i <= 7; i++) s += vis(4.5 + (i - 1) * 0.45, i === 7 ? D : 4.5 + i * 0.45, txt(110, 320, "SEARCH 8: 노드 " + i + "개 방문", 13, C.or, ' font-weight="700"'));
    for (var j = 1; j <= 3; j++) s += vis(4.5 + (j - 1) * 0.45, j === 3 ? D : 4.5 + j * 0.45, txt(575, 320, "SEARCH 8: 노드 " + j + "개 방문", 13, C.or, ' font-weight="700"'));

    // height 괄호 (8s~)
    s += vis(8, D, '<line x1="345" y1="63" x2="345" y2="297" stroke="' + C.red + '" stroke-width="2"/>' +
      '<line x1="338" y1="63" x2="352" y2="63" stroke="' + C.red + '" stroke-width="2"/><line x1="338" y1="297" x2="352" y2="297" stroke="' + C.red + '" stroke-width="2"/>' +
      txt(358, 170, "층 7 = n", 13, C.red, ' text-anchor="start" font-weight="700"') + txt(358, 188, "height 6", 12, C.red, ' text-anchor="start"'));
    s += vis(8, D, '<line x1="730" y1="63" x2="730" y2="279" stroke="' + C.green + '" stroke-width="2"/>' +
      '<line x1="723" y1="63" x2="737" y2="63" stroke="' + C.green + '" stroke-width="2"/><line x1="723" y1="279" x2="737" y2="279" stroke="' + C.green + '" stroke-width="2"/>' +
      txt(722, 300, "height 3", 13, C.green, ' font-weight="700"'));
    s += vis(8.3, D, txt(200, 345, "O(n) — 정렬된 순서로 넣으면 이렇게 된다", 12, C.red) + txt(575, 345, "O(log n) — 이걸 항상 유지하고 싶다", 12, C.green));

    s += txt(380, 370, "모든 연산 = O(height) → 균형이 전부 (p.24–25)", 13, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
