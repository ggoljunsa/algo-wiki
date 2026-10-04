// ============================================================
// rotation_yoink — L8 p.28–29: rotation(YOINK) = Y 를 잡아 올리면 B 가 X 쪽으로 떨어진다
// 시간축(초): 0 X(Y(A,B),C) → 2–3.8 손이 Y 를 끌어올림 → 3.8–6 "That's not binary!!" (Y 의 자식 3개)
//   → 6–7.4 B 가 X 의 왼쪽으로 떨어짐 → 7.4–9.7 Y(A, X(B,C)) + in-order 비교 → 9.9–13 p.29 3→5 회전
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["rotation_yoink"] = {
  title: "rotation — YOINK! Y 를 들어 올리면 B 가 떨어진다 (13초)",
  desc: "L8 p.28–29. [[rotation]] 은 X(Y(A,B),C) 를 Y(A,X(B,C)) 로 바꾼다 — in-order 가 A < Y < B < X < C 로 그대로라서 BST property 가 유지되고, 바뀌는 포인터는 3개뿐이라 O(1). [[self-balancing BST]] 와 [[red-black tree]] 의 기본 연산.",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222", skin: "#f1c7a4" };
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
    function edge(ta, tb, from, to, color, w) {
      var ts = [];
      ta.concat(tb).forEach(function (p) { if (ts.indexOf(p[0]) < 0) ts.push(p[0]); });
      ts.sort(function (a, b) { return a - b; });
      var A0 = at(ta, ts[0]), B0 = at(tb, ts[0]);
      var a = "";
      if (ts.length > 1) ["x1", "y1", "x2", "y2"].forEach(function (k, i) {
        a += anim(k, ts.map(function (t) { var P = i < 2 ? at(ta, t) : at(tb, t); return [t, Math.round(P[i % 2])]; }));
      });
      return '<g opacity="0"><line x1="' + A0[0] + '" y1="' + A0[1] + '" x2="' + B0[0] + '" y2="' + B0[1] + '" stroke="' + (color || C.blue) + '" stroke-width="' + (w || 2) + '">' + a + '</line>' + show(from, to) + '</g>';
    }
    function box(label, size, fill, stroke, tri, triFill) {
      var h = size / 2, g = "";
      if (tri) g += '<polygon points="0,' + (h + 2) + ' ' + (-h) + ',' + (h + 32) + ' ' + h + ',' + (h + 32) + '" fill="' + triFill + '" stroke="' + C.blue + '" stroke-width="1.5"/>';
      g += '<rect x="' + (-h) + '" y="' + (-h) + '" width="' + size + '" height="' + size + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>';
      g += txt(0, 8, label, size > 36 ? 24 : 18, C.ink);
      return g;
    }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="rotation YOINK 애니메이션">';
    var caps = [
      [0, 2, "X(Y(A, B), C): Y 를 잡아서 끌어올린다 — YOINK!"],
      [2, 3.8, "Y 가 올라가고 X 가 오른쪽 아래로 매달린다"],
      [3.8, 6, "잠깐 — Y 의 자식이 A, B, X 3개: That's not binary!!"],
      [6, 7.4, "B 가 떨어져서 X 의 왼쪽 자식이 된다 (B fell down)"],
      [7.4, 9.8, "CLAIM: 이 트리도 BST property 를 만족한다 — in-order 가 그대로"],
      [9.8, 11.9, "p.29: 3 에서 YOINK — 5 를 잡아 올리면 4 가 3 쪽으로 떨어진다"],
      [11.9, D, "한 번의 rotation 으로 층 4 → 3: 더 균형 잡힌 BST"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---------- 장면 1: p.28 ----------
    var E = 9.8;
    var P = {
      X: [[0, 380, 85], [2, 380, 85], [3.8, 480, 160], [6, 480, 160], [7.4, 460, 160]],
      Y: [[0, 300, 160], [2, 300, 160], [3.8, 380, 85]],
      A: [[0, 250, 235], [2, 250, 235], [3.8, 280, 160], [6, 280, 160], [7.4, 300, 160]],
      B: [[0, 350, 235], [2, 350, 235], [3.8, 380, 160], [6, 380, 160], [7.4, 410, 235]],
      Cc: [[0, 460, 160], [2, 460, 160], [3.8, 520, 235], [6, 520, 235], [7.4, 510, 235]]
    };
    s += edge(P.X, P.Y, 0, E);
    s += edge(P.X, P.Cc, 0, E);
    s += edge(P.Y, P.A, 0, E);
    s += edge(P.Y, P.B, 0, 6.6);
    s += edge(P.X, P.B, 6.6, E, C.or, 3);
    var pat = { A: "#cfe0f4", B: "#bcd3ee", Cc: "#e3edf8" };
    s += '<g opacity="0">' + show(0, E) +
      mover(P.A, box("A", 40, C.blueL, C.blue, true, pat.A)) +
      mover(P.B, box("B", 40, C.blueL, C.blue, true, pat.B)) +
      mover(P.Cc, box("C", 40, C.blueL, C.blue, true, pat.Cc)) +
      mover(P.X, box("X", 44, C.blueL, C.blue)) +
      mover(P.Y, '<rect x="-22" y="-22" width="44" height="44" fill="' + C.blueL + '" stroke="' + C.blue + '" stroke-width="2">' +
        anim("stroke", [[1, C.blue], [1.2, C.or], [7.4, C.or], [7.6, C.blue]]) + anim("stroke-width", [[1, 2], [1.2, 4], [7.4, 4], [7.6, 2]]) + '</rect>' + txt(0, 8, "Y", 24, C.ink)) +
      '</g>';
    // 손 (Y 와 같이 움직임)
    var hand = '<g transform="scale(0.65)"><path d="M -3,-24 L 26,-62" stroke="' + C.skin + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M 6,-26 L 34,-52" stroke="#e2ae86" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M 22,-58 L 70,-76" stroke="' + C.skin + '" stroke-width="18" stroke-linecap="round"/></g>';
    s += '<g opacity="0">' + mover(P.Y, hand) + show(1, 6.2) + '</g>';
    s += vis(1, 3.6, txt(205, 130, "YOINK!", 20, "#c00", ' font-weight="900" font-style="italic"'));
    // That's not binary
    s += vis(3.8, 6.2, '<g transform="rotate(10 650 200)">' + txt(650, 200, "THAT'S NOT BINARY!!", 16, "#c00", ' font-weight="900"') + '</g>' +
      txt(380, 300, "Y 의 자식: A, B, X → 3개", 13, C.red, ' font-weight="700"'));
    s += vis(6.6, E, txt(355, 233, "B fell", 12, C.or, ' text-anchor="end" font-weight="700"') + txt(355, 248, "down.", 12, C.or, ' text-anchor="end" font-weight="700"'));
    // in-order 비교
    s += vis(0.2, 2, txt(380, 318, "in-order: A &lt; Y &lt; B &lt; X &lt; C", 14, C.blue, ' font-weight="700"'));
    s += vis(7.6, E, txt(380, 310, "in-order: A &lt; Y &lt; B &lt; X &lt; C — 회전 전과 똑같다 → BST property 유지", 14, C.green, ' font-weight="700"'));
    s += vis(8.2, E, txt(380, 328, "바뀐 포인터: Y.right = X, X.left = B, (X 의 부모).child = Y → 3개 = O(1)", 12, C.pur));

    // ---------- 장면 2: p.29 숫자 예 ----------
    var S0 = 9.9, M0 = 10.9, M1 = 11.9;
    var Q = {
      3: [[S0, 300, 85], [M0, 300, 85], [M1, 320, 155]],
      2: [[S0, 240, 155], [M0, 240, 155], [M1, 280, 225]],
      5: [[S0, 360, 155], [M0, 360, 155], [M1, 380, 85]],
      4: [[S0, 320, 225], [M0, 320, 225], [M1, 360, 225]],
      7: [[S0, 400, 225], [M0, 400, 225], [M1, 440, 155]],
      6: [[S0, 370, 290], [M0, 370, 290], [M1, 410, 225]],
      8: [[S0, 430, 290], [M0, 430, 290], [M1, 470, 225]]
    };
    var G = "#2a8f6a", GL = "#eaf3df";
    s += edge(Q[3], Q[2], S0, D, G, 3) + edge(Q[3], Q[5], S0, D, G, 3) + edge(Q[5], Q[4], S0, 11.4, G, 3) + edge(Q[3], Q[4], 11.4, D, C.or, 3) +
      edge(Q[5], Q[7], S0, D, G, 3) + edge(Q[7], Q[6], S0, D, G, 3) + edge(Q[7], Q[8], S0, D, G, 3);
    var g2 = "";
    [2, 4, 6, 8, 7, 3].forEach(function (k) { g2 += mover(Q[k], '<rect x="-17" y="-17" width="34" height="34" fill="' + GL + '" stroke="' + G + '" stroke-width="4"/>' + txt(0, 7, k, 19, C.ink)); });
    g2 += mover(Q[5], '<rect x="-17" y="-17" width="34" height="34" fill="' + GL + '" stroke="' + G + '" stroke-width="4">' + anim("stroke", [[10.2, G], [10.4, C.or], [M1, C.or], [12.2, G]]) + '</rect>' + txt(0, 7, 5, 19, C.ink));
    s += '<g opacity="0">' + g2 + show(S0, D) + '</g>';
    s += '<g opacity="0">' + mover(Q[5], hand) + show(10.2, 12.2) + '</g>';
    s += vis(10.2, 11.4, txt(470, 120, "YOINK!", 20, "#c00", ' font-weight="900" font-style="italic"'));
    s += vis(11.9, D, txt(600, 160, "층 4 → 층 3", 15, C.green, ' font-weight="700"') + txt(600, 182, "4 는 3 의 오른쪽으로", 12, C.or, ' font-weight="700"'));
    s += vis(S0 + 0.1, M0, txt(600, 160, "3 의 오른쪽 사슬이 길다", 13, C.red, ' font-weight="700"'));

    s += txt(380, 352, "rotation: BST property 유지, 시간 O(1) — 포인터 3개만 바뀐다", 13, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
