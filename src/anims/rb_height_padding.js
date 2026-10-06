// ============================================================
// rb_height_padding — L8 p.36–37: red 로 패딩해도 한 경로는 다른 경로의 두 배까지만
// 시간축(초): 0 black 만의 균형 트리 (b(root)=3) → 1.8 red 하나 끼움 → 3.4 또 하나 → 5 leaf 아래 red
//   → 6.4 더는 못 늘림 (규칙 ④·⑤) → 7.6~ 수식 n ≥ 2^b − 1 ≥ 2^(height/2) − 1 ⇒ height ≤ 2 log(n+1) 한 줄씩 → 12
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["rb_height_padding"] = {
  title: "red 로 패딩하기 — RB 트리의 height ≤ 2 log(n+1) (12초)",
  desc: "L8 p.36–37. black 노드만으로 된 균형 트리의 한 경로에 red 를 끼워 넣으면 그 경로는 '''최대 두 배'''까지 길어진다 — red 는 연달아 올 수 없고(규칙 ④) black 수는 모든 경로가 같아야 하므로(규칙 ⑤). 그래서 b(root) ≥ height/2 이고 [[height ≤ 2 log(n+1) 증명]] 이 나온다. [[black height b(x)]], [[red-black 규칙 5가지]]",
  duration: 12,
  build: function () {
    var D = 12;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222", R: "#c00", K: "#222" };
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
    function at(tr, t) {
      if (t <= tr[0][0]) return [tr[0][1], tr[0][2]];
      for (var i = 1; i < tr.length; i++) if (t <= tr[i][0]) {
        var u = (t - tr[i - 1][0]) / (tr[i][0] - tr[i - 1][0]);
        return [tr[i - 1][1] + u * (tr[i][1] - tr[i - 1][1]), tr[i - 1][2] + u * (tr[i][2] - tr[i - 1][2])];
      }
      var l = tr[tr.length - 1]; return [l[1], l[2]];
    }
    function mover(tr, inner) {
      if (tr.length === 1) return '<g transform="translate(' + tr[0][1] + ',' + tr[0][2] + ')">' + inner + '</g>';
      return '<g><animateTransform attributeName="transform" type="translate" ' + kf(tr.map(function (p) { return [p[0], p[1] + "," + p[2]]; })) + '/>' + inner + '</g>';
    }
    function edge(ta, tb, from, to) {
      var ts = [];
      ta.concat(tb).forEach(function (p) { if (ts.indexOf(p[0]) < 0) ts.push(p[0]); });
      ts.sort(function (a, b) { return a - b; });
      var A0 = at(ta, ts[0]), B0 = at(tb, ts[0]), a = "";
      if (ts.length > 1) ["x1", "y1", "x2", "y2"].forEach(function (k, i) {
        a += anim(k, ts.map(function (t) { var P = i < 2 ? at(ta, t) : at(tb, t); return [t, Math.round(P[i % 2])]; }));
      });
      return '<g opacity="0"><line x1="' + A0[0] + '" y1="' + A0[1] + '" x2="' + B0[0] + '" y2="' + B0[1] + '" stroke="#333" stroke-width="1.5">' + a + '</line>' + show(from, to) + '</g>';
    }
    function sq(color) { return '<rect x="-13" y="-13" width="26" height="26" fill="' + color + '"/>'; }
    function sup(base, ex) { return base + '<tspan dy="-7" font-size="11">' + ex + '</tspan><tspan dy="7"> </tspan>'; }

    // 노드 궤적 [t, x, y]
    var P = {
      root: [[0, 200, 70]],
      L1: [[0, 120, 115]], LL: [[0, 80, 160]], LR: [[0, 160, 160]],
      R1: [[0, 280, 115], [1.9, 280, 115], [2.9, 300, 160]],
      RL: [[0, 240, 160], [1.9, 240, 160], [2.9, 255, 205]],
      RR: [[0, 320, 160], [1.9, 320, 160], [2.9, 340, 205], [3.5, 340, 205], [4.5, 360, 250]],
      r1: [[0, 270, 115]], r2: [[0, 330, 205]], r3: [[0, 390, 295]]
    };
    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="red 노드로 경로를 늘려 RB 트리 height 상한을 보이는 애니메이션">';
    var caps = [
      [0, 1.8, "black 노드만으로 된 균형 트리: 모든 root→NIL 경로의 black 수 = 3"],
      [1.8, 5, "한 경로에만 red 를 끼워 넣는다 — red 는 black 수를 안 바꾸므로 규칙 ⑤ 그대로"],
      [5, 6.4, "One path could be twice as long another if we pad it with red nodes."],
      [6.4, 7.6, "더는 못 늘린다: red 아래 red ✗(규칙 ④), black 을 넣으면 이 경로만 black 4개 ✗(규칙 ⑤)"],
      [7.6, D, "그래서 b(root) ≥ height/2 → height ≤ 2 log(n+1) (p.37)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], c[2].length > 46 ? 13 : 14, C.ink, ' font-weight="700"')); });

    // 간선
    s += edge(P.root, P.L1, 0, D) + edge(P.L1, P.LL, 0, D) + edge(P.L1, P.LR, 0, D);
    s += edge(P.root, P.R1, 0, 2.0) + edge(P.root, P.r1, 2.0, D) + edge(P.r1, P.R1, 2.0, D);
    s += edge(P.R1, P.RL, 0, D) + edge(P.R1, P.RR, 0, 3.6) + edge(P.R1, P.r2, 3.6, D) + edge(P.r2, P.RR, 3.6, D) + edge(P.RR, P.r3, 5.2, D);
    // NIL (처음에만)
    var nil = "";
    [80, 160, 240, 320].forEach(function (x) {
      [-14, 14].forEach(function (dx) {
        nil += '<line x1="' + x + '" y1="173" x2="' + (x + dx) + '" y2="194" stroke="#bbb"/><rect x="' + (x + dx - 9) + '" y="194" width="18" height="12" fill="#555"/>';
      });
    });
    nil += txt(200, 222, "NIL 도 black (규칙 ③) — 앞으로는 안 그린다", 11, C.muted);
    s += vis(0, 1.8, nil);
    // 노드
    ["root", "L1", "LL", "LR", "R1", "RL", "RR"].forEach(function (k) { s += mover(P[k], sq(C.K)); });
    s += vis(2.0, D, mover(P.r1, sq(C.R)));
    s += vis(3.6, D, mover(P.r2, sq(C.R)));
    s += vis(5.2, D, mover(P.r3, sq(C.R)));
    // 길이 표시
    s += vis(6.0, D, txt(60, 205, "짧은 경로", 12, C.ink, ' font-weight="700"') + txt(60, 221, "노드 3개", 12, C.ink) + txt(60, 237, "black 3", 12, C.ink));
    s += vis(6.0, D, '<path d="M 200,70 L 270,115 L 300,160 L 330,205 L 360,250 L 390,295" fill="none" stroke="' + C.or + '" stroke-width="5" opacity="0.45"/>' +
      txt(318, 330, "긴 경로: 노드 6개 = 2배", 12, C.or, ' font-weight="700"') + txt(318, 346, "black 3 + red 3", 12, C.or));
    // 더 못 늘림
    s += vis(6.4, D, '<line x1="390" y1="308" x2="420" y2="330" stroke="#999" stroke-dasharray="3 3"/><rect x="408" y="330" width="26" height="26" fill="none" stroke="' + C.red + '" stroke-width="2" stroke-dasharray="4 3"/>' +
      txt(421, 349, "✗", 16, C.red, ' font-weight="700"'));
    // 오른쪽 패널: 규칙
    var X = 470;
    s += '<rect x="455" y="48" width="295" height="88" rx="8" fill="' + C.purL + '" stroke="' + C.pur + '"/>';
    s += txt(X, 70, "④ red 의 자식은 black → red 는 연달아 못 옴", 12, C.pur, ' text-anchor="start"');
    s += txt(X, 92, "⑤ 모든 x→NIL 경로의 black 수가 같다", 12, C.pur, ' text-anchor="start"');
    s += txt(X, 114, "⇒ 긴 경로 ≤ 2 × 짧은 경로", 13, C.pur, ' text-anchor="start" font-weight="700"');
    // 수식 (한 줄씩)
    var lines = [
      [7.6, "b(x) = x→NIL 경로의 black 수 (x 제외, NIL 포함)", C.ink, 12],
      [8.4, "Claim: x 아래 non-NIL 노드 ≥ " + sup("2", "b(x)") + "− 1", C.ink, 13],
      [9.2, "n ≥ " + sup("2", "b(root)") + "− 1", C.blue, 14],
      [10.0, "  ≥ " + sup("2", "height/2") + "− 1  (b(root) ≥ height/2)", C.blue, 14],
      [10.8, "⇒ height ≤ 2 log(n+1)", C.green, 16]
    ];
    lines.forEach(function (l, i) {
      var y = 170 + i * 36;
      s += vis(l[0], D, (i === 4 ? '<rect x="458" y="' + (y - 22) + '" width="230" height="32" rx="6" fill="' + C.greenL + '" stroke="' + C.green + '" stroke-width="2"/>' : "") +
        txt(X, y, l[1], l[3], l[2], ' text-anchor="start" font-weight="700"'));
    });

    s += txt(380, 372, "red 로 패딩해도 가장 긴 경로 ≤ 2 × 가장 짧은 경로 → height = O(log n)", 13, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
