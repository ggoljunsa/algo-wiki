// ============================================================
// rb_insert_cases — L8 p.41 → p.47 → p.54: 0 을 red 로 넣었을 때의 세 경우
// 시간축(초): 0–4.3 ① 부모 3 black → 끝 / 4.4–9.0 ② 부모 3 red·uncle 7 red → 색 뒤집기, 6 에서 다시 검사 → 부모 −1 black 이라 끝
//   / 9.2–14 ③ 부모 3 red·uncle 7 black → 색 교환 + right_rotate(6) (YOINK). 각 장면 끝에 규칙 5개 체크표가 전부 초록
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["rb_insert_cases"] = {
  title: "RB 삽입 세 경우 — 끝 / 색 뒤집기 / 회전 (14초)",
  desc: "L8 p.41, 47, 54. 새 노드는 항상 '''red''' 로 넣는다. ① 부모가 black 이면 끝 ② 부모 red·[[uncle]] red 면 부모·uncle 을 black, 조부모를 red 로 뒤집고 조부모에서 다시 검사 ③ 부모 red·uncle black 이면 회전(YOINK) + 색 교환. [[RB 삽입 세 경우]], [[recolor]], [[rb_insert]]",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222", R: "#c00", K: "#222", skin: "#f1c7a4" };
    var TRI = { gray: "#aaa", orange: "#f0a020", green: "#8bc34a" };
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
      return '<g opacity="0"><line x1="' + A0[0] + '" y1="' + A0[1] + '" x2="' + B0[0] + '" y2="' + B0[1] + '" stroke="#333" stroke-width="2">' + a + '</line>' + show(from, to) + '</g>';
    }
    // 노드: colors = [[t, "#c00"|"#222"], ...]
    function node(key, colors, ring) {
      return (ring ? '<rect x="-22" y="-22" width="44" height="44" rx="6" fill="none" stroke="' + C.red + '" stroke-width="3" opacity="0">' + anim("opacity", ring) + '</rect>' : "") +
        '<rect x="-17" y="-17" width="34" height="34" fill="' + colors[0][1] + '">' + (colors.length > 1 ? anim("fill", colors) : "") + '</rect>' + txt(0, 7, key, 18, "#fff", ' font-weight="700"');
    }
    function tri(color, w, h) { return '<polygon points="0,0 ' + (-w) + ',' + h + ' ' + w + ',' + h + '" fill="' + TRI[color] + '" stroke="#7a4a2a" stroke-width="1"/>'; }
    var hand = '<g transform="scale(-0.75,0.75)"><path d="M -3,-20 L 26,-58" stroke="' + C.skin + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M 6,-22 L 34,-48" stroke="#e2ae86" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M 22,-54 L 70,-72" stroke="' + C.skin + '" stroke-width="18" stroke-linecap="round"/></g>';

    // 체크표: conflict = [t0, t1] 동안 ④ 빨강, okAt 부터 전부 초록
    var RULES = ["① 노드는 red 또는 black", "② root 는 black", "③ NIL 은 black", "④ red 의 자식은 black", "⑤ 경로마다 black 수 같음"];
    function checklist(from, to, title, conflict, okAt) {
      var g = '<rect x="560" y="52" width="190" height="196" rx="8" fill="' + C.purL + '" stroke="' + C.pur + '"/>' + txt(655, 74, title, 13, C.pur, ' font-weight="700"');
      RULES.forEach(function (r, i) {
        var y = 102 + i * 28, pts = [[from, "#ccc"]];
        if (conflict && i === 3) pts.push([conflict[0], "#ccc"], [conflict[0] + 0.15, C.red], [conflict[1], C.red]);
        pts.push([okAt, "#ccc"], [okAt + 0.15 + i * 0.08, C.green]);
        g += '<circle cx="576" cy="' + (y - 4) + '" r="7" fill="#ccc">' + anim("fill", pts) + '</circle>' + txt(590, y, r, 12, C.ink, ' text-anchor="start"');
      });
      g += vis(okAt + 0.5, to, txt(655, 268, "✓ 규칙 5개 모두 성립", 13, C.green, ' font-weight="700"'));
      return vis(from, to, g);
    }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="red-black tree 삽입 세 경우 애니메이션">';
    var caps = [
      [0, 1.5, "① p.41: 0 을 새 red 노드로, 보통 BST 처럼 3 의 왼쪽에 넣는다"],
      [1.5, 4.3, "① 부모 3 이 black → red-red 없음, black 수도 그대로 → 아무것도 안 하고 끝"],
      [4.4, 6.3, "② p.47: 부모 3 red, uncle 7 red → red-red (규칙 ④ 위반)"],
      [6.3, 7.4, "② Flip colors! 부모·uncle → black, grand_p 6 → red"],
      [7.4, 9.0, "② grand_p 6 에서 다시 검사(recolor(6)): 부모 −1 이 black → 끝"],
      [9.2, 10.8, "③ p.54: 부모 3 red, uncle 7 black → red-red"],
      [10.8, 11.4, "③ 색 교환: 부모 3 → black, grand_p 6 → red"],
      [11.4, 12.6, "③ right_rotate(6) — YOINK! 3 을 잡아 올린다"],
      [12.6, D, "③ 3 이 black 루트, 자식 0·6 은 red → 회전 한 번으로 끝 (재귀 없음)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---------- 장면 ① (0–4.3) ----------
    var E1 = 4.3;
    var A = { 6: [[0, 270, 90]], 3: [[0, 190, 165]], 7: [[0, 350, 165]], 0: [[0.4, 130, 60], [1.2, 130, 240]] };
    var g1 = edge(A[6], A[3], 0, E1) + edge(A[6], A[7], 0, E1) + edge(A[3], A[0], 1.2, E1);
    g1 += mover(A[6], node(6, [[0, C.K]])) + mover(A[3], node(3, [[0, C.K]])) + mover(A[7], node(7, [[0, C.K]]));
    g1 += vis(0.4, E1, mover(A[0], node(0, [[0, C.R]])));
    s += vis(0, E1, g1);
    s += vis(1.6, E1, txt(250, 300, "부모 black → 새 red 아래에 문제 없음", 14, C.green, ' font-weight="700"'));
    s += checklist(0, E1, "① 부모 black", null, 1.7);

    // ---------- 장면 ② (4.4–9.0) ----------
    var S2 = 4.4, E2 = 9.0;
    var B = { m1: [[S2, 270, 70]], 6: [[S2, 350, 130]], 3: [[S2, 290, 195]], 7: [[S2, 410, 195]], 0: [[4.8, 250, 60], [5.5, 250, 258]],
      gray: [[S2, 165, 108]], orange: [[S2, 318, 215]], green: [[S2, 410, 215]] };
    var g2 = edge(B.m1, B.gray, S2, E2) + edge(B.m1, B[6], S2, E2) + edge(B[6], B[3], S2, E2) + edge(B[6], B[7], S2, E2) + edge(B[3], B.orange, S2, E2) + edge(B[3], B[0], 5.5, E2);
    g2 += mover(B.gray, tri("gray", 50, 150)) + mover(B.orange, tri("orange", 16, 50)) + mover(B.green, tri("green", 24, 56));
    g2 += mover(B.m1, node(-1, [[0, C.K]]));
    g2 += mover(B[6], node(6, [[6.4, C.K], [6.6, C.R]], [[7.4, 0], [7.5, 1], [8.0, 1], [8.1, 0]]));
    g2 += mover(B[3], node(3, [[6.4, C.R], [6.6, C.K]], [[5.6, 0], [5.7, 1], [6.4, 1], [6.5, 0]]));
    g2 += mover(B[7], node(7, [[6.4, C.R], [6.6, C.K]]));
    g2 += vis(4.8, E2, mover(B[0], node(0, [[0, C.R]], [[5.6, 0], [5.7, 1], [6.4, 1], [6.5, 0]])));
    s += vis(S2, E2, g2);
    s += vis(5.7, 6.4, txt(190, 312, "3 과 0 이 둘 다 red ✗", 13, C.red, ' font-weight="700"'));
    s += vis(6.5, 7.4, txt(470, 112, "Flip colors!", 15, C.blue, ' font-weight="700"') +
      '<path d="M 448,118 L 378,128" stroke="' + C.blue + '" stroke-width="1.5"/><path d="M 470,120 L 428,180" stroke="' + C.blue + '" stroke-width="1.5"/>');
    s += vis(7.5, E2, txt(470, 112, "6 의 부모 −1 = black → 끝", 13, C.green, ' font-weight="700"') + txt(470, 312, "−1B / 6R(3B(0R), 7B)", 13, C.ink, ' font-weight="700"'));
    s += checklist(S2, E2, "② uncle red", [5.6, 6.5], 7.7);

    // ---------- 장면 ③ (9.2–14) ----------
    var S3 = 9.2, R0 = 11.4, R1 = 12.4;
    var Q = { 6: [[S3, 270, 90], [R0, 270, 90], [R1, 350, 165]],
      3: [[S3, 190, 165], [R0, 190, 165], [R1, 270, 90]],
      7: [[S3, 350, 165], [R0, 350, 165], [R1, 420, 225]],
      0: [[9.5, 130, 60], [10.1, 130, 240], [R0, 130, 240], [R1, 190, 165]],
      orange: [[S3, 222, 185], [R0, 222, 185], [R1, 310, 185]],
      green: [[S3, 350, 185], [R0, 350, 185], [R1, 420, 245]] };
    var g3 = edge(Q[6], Q[3], S3, D) + edge(Q[6], Q[7], S3, D) + edge(Q[3], Q.orange, S3, 11.9) + edge(Q[6], Q.orange, 11.9, D) + edge(Q[3], Q[0], 10.1, D);
    g3 += mover(Q.orange, tri("orange", 16, 50)) + mover(Q.green, tri("green", 24, 56));
    g3 += mover(Q[7], node(7, [[0, C.K]]));
    g3 += mover(Q[6], node(6, [[10.9, C.K], [11.1, C.R]]));
    g3 += vis(9.5, D, mover(Q[0], node(0, [[0, C.R]], [[10.3, 0], [10.4, 1], [10.9, 1], [11.0, 0]])));
    g3 += mover(Q[3], node(3, [[10.9, C.R], [11.1, C.K]], [[10.3, 0], [10.4, 1], [10.9, 1], [11.0, 0]]));
    s += vis(S3, D, g3);
    s += vis(11.0, 12.2, mover(Q[3], hand));
    s += vis(11.2, 12.2, txt(80, 160, "YOINK!", 20, "#c00", ' font-weight="900" font-style="italic"'));
    s += vis(10.4, 10.9, txt(190, 312, "3 과 0 이 둘 다 red ✗ (uncle 7 은 black)", 13, C.red, ' font-weight="700"'));
    s += vis(12.6, D, txt(230, 318, "3B(0R, 6R(△, 7B)) — 주황 부분 트리는 6 의 왼쪽으로", 13, C.ink, ' font-weight="700"'));
    s += checklist(S3, D, "③ uncle black", [10.4, 11.0], 12.6);

    s += txt(380, 350, "새 노드는 red → 부모 black: 끝 · uncle red: 색 뒤집기 후 위로 · uncle black: 회전 + 색 교환", 12.5, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
