// ============================================================
// universal_hash_pick — L7 p.59–70 (PNG 57–66) universal hash family, 예제 M = p = 5, n = 3, a = 2, b = 1
// 시간축(초): 0 H → 1.5 주사위 → 3 a=2, b=1 → h_{2,1} → 4~6.6 x 가 f(x) = 2x+1 mod 5 자리로 (전단사, 충돌 없음)
//   → 7.5~9.4 f(x) mod 3 버킷으로 → 9.6 버킷 0 {1,2}, 버킷 1 {0,4} 충돌 → 10.5 P ≤ 1/n, O(log M) 비트 → 14
// f: 0→1, 1→3, 2→0, 3→2, 4→4 / h = f mod 3: 0→1, 1→0, 2→0, 3→2, 4→1 (슬라이드 L7-66 그림과 같음)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["universal_hash_pick"] = {
  title: "Universal hash family — a, b 를 뽑아 h 만들기 (14초)",
  desc: "작은 [[hash family]] H 에서 a, b 를 뽑아 [[h_{a,b}]] 생성: f(x) = ax + b mod p 는 전단사(충돌 없음), 충돌은 mod n 단계에서만. 어떤 두 원소든 충돌 확률 ≤ 1/n — [[universal hash family]]",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + (extra || "") + '/>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    // 키프레임 [[초, 값], …] → 0~D 전체 values/keyTimes
    function kf(pts) {
      var ks = [], vs = [];
      if (pts[0][0] > 0) { ks.push(0); vs.push(pts[0][1]); }
      pts.forEach(function (p) { ks.push(r4(p[0] / D)); vs.push(p[1]); });
      if (pts[pts.length - 1][0] < D) { ks.push(1); vs.push(pts[pts.length - 1][1]); }
      return 'values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function anim(attr, pts) { return '<animate attributeName="' + attr + '" ' + kf(pts) + '/>'; }
    function move(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kf(pts) + '/>'; }


    var P = 5, NB = 3, A = 2, B = 1;
    function f(x) { return (A * x + B) % P; }
    function hh(x) { return f(x) % NB; }
    function sub(t) { return '<tspan baseline-shift="sub" font-size="72%">' + t + '</tspan>'; }
    var H21 = "h" + sub("2,1"), F21 = "f" + sub("2,1");
    var UC = [110, 240], FC = [360, 240], R = 58;
    function onCircle(c, k, r) {
      var th = (90 - 72 * k) * Math.PI / 180;
      return [r4(c[0] + r * Math.cos(th)), r4(c[1] + r * Math.sin(th))];
    }
    var BKX = 600;
    function bucketY(b) { return 188 + 52 * b; }

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Universal hash family 애니메이션">';
    s += '<defs><marker id="universal_hash_pick_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';
    var caps = [
      [0, 1.5, "M = p = 5, n = 3 — 작은 hash family H 에서 h 하나를 무작위로 고른다"],
      [1.5, 3.8, "a ∈ {1, …, 4}, b ∈ {0, …, 4} 를 무작위로 → a = 2, b = 1 → " + H21],
      [3.8, 7.3, F21 + "(x) = 2x + 1 mod 5 — 원 위에서 자리만 바뀐다: 충돌 없음 (No collisions here!)"],
      [7.3, 10.5, H21 + "(x) = " + F21 + "(x) mod 3 — 서로 다른 원소가 충돌하는 건 이 단계뿐"],
      [10.5, D, "universal: 어떤 두 원소 u" + sub("i") + " ≠ u" + sub("j") + " 든 충돌 확률 ≤ 1/n"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- H (작은 family) ----
    s += box(20, 50, 196, 92, C.purL, C.pur);
    s += txt(118, 74, "H = { h" + sub("a,b") + " }", 15, C.pur, ' font-weight="700"');
    s += txt(118, 96, "a ∈ {1..p−1}, b ∈ {0..p−1}", 12, C.pur);
    s += txt(118, 118, "|H| = p(p − 1) = 20", 12, C.pur);
    s += txt(118, 134, "h(x) = ((ax + b) mod p) mod n", 10, C.muted);

    // ---- 주사위 (1.5~3 굴러감) ----
    var PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
      5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    function die(x, y, sz, face) {
      var g = '<rect x="' + (x - sz / 2) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '" rx="5" fill="#fff" stroke="' + C.red + '" stroke-width="2.5"/>';
      PIPS[face].forEach(function (p) { g += '<circle cx="' + r4(x + p[0] * sz * 0.27) + '" cy="' + r4(y + p[1] * sz * 0.27) + '" r="' + r4(sz * 0.08) + '" fill="' + C.red + '"/>'; });
      return g;
    }
    var fa = [[3, 5], [6, 1], [2, 4], [5, 2], [1, 6], [2, 1]];
    fa.forEach(function (ff, k) {
      var t0 = 1.5 + 0.3 * k, pts = [[t0, 0], [t0 + 0.01, 1]];
      if (k < fa.length - 1) { pts.push([t0 + 0.3, 1]); pts.push([t0 + 0.31, 0]); } else { pts.push([10.4, 1]); pts.push([10.5, 0]); }
      s += '<g opacity="0">' + die(252, 96, 32, ff[0]) + die(292, 96, 32, ff[1]) + anim("opacity", pts) + '</g>';
    });
    // 말풍선
    s += vis(3, 10.5, '<ellipse cx="400" cy="96" rx="76" ry="30" fill="#fff" stroke="' + C.muted + '" stroke-width="1.5"/>' +
      txt(400, 92, "a = 2, b = 1", 15, C.ink, ' font-weight="700"') + txt(400, 112, "→ " + H21 + " 선택", 12, C.or, ' font-weight="700"'));
    // 정의식
    s += vis(3.5, 10.5, txt(620, 84, F21 + "(x) = 2x + 1  mod 5", 14, C.blue, ' font-weight="700"') +
      txt(620, 112, H21 + "(x) = " + F21 + "(x)  mod 3", 14, C.green, ' font-weight="700"'));
    // 결론 상자
    s += vis(10.5, D, box(236, 52, 504, 92, "#fff", C.green) +
      txt(488, 80, "P" + sub("h∈H") + "[ h(u" + sub("i") + ") = h(u" + sub("j") + ") ] ≤ 1/n", 17, C.green, ' font-weight="700"') +
      txt(488, 104, "→ 기대 버킷 크기 O(1) (u 의 버킷 기대 원소 수 ≤ 2)", 13, C.ink) +
      txt(488, 126, "h 저장 = (a, b) 두 수 → log|H| = O(log M) 비트", 13, C.ink));

    // ---- U 원, f 원 ----
    s += '<circle cx="' + UC[0] + '" cy="' + UC[1] + '" r="' + R + '" fill="' + C.blueL + '" stroke="' + C.blue + '" stroke-width="2"/>';
    s += txt(UC[0], UC[1] + R + 22, "U = {0, …, 4}", 13, C.blue, ' font-weight="700"');
    s += '<circle cx="' + FC[0] + '" cy="' + FC[1] + '" r="' + R + '" fill="none" stroke="#333" stroke-width="3"/>';
    for (var k = 0; k < P; k++) {
      var q = onCircle(FC, k, R + 20);
      s += txt(q[0], q[1] + 5, String(k), 14, C.or, ' font-weight="700"');
    }
    s += '<line x1="' + (UC[0] + R + 8) + '" y1="' + UC[1] + '" x2="' + (FC[0] - R - 26) + '" y2="' + FC[1] + '" stroke="' + C.blue + '" stroke-width="2.5" marker-end="url(#universal_hash_pick_arr)"/>';
    s += txt((UC[0] + FC[0]) / 2 + 2, UC[1] - 12, F21 + "(x)", 14, C.blue, ' font-weight="700"');
    s += vis(6.8, D, txt((UC[0] + FC[0]) / 2 + 2, UC[1] + 26, "충돌 없음", 12, C.blue));
    s += '<line x1="' + (FC[0] + R + 30) + '" y1="' + FC[1] + '" x2="' + (BKX - 40) + '" y2="' + FC[1] + '" stroke="' + C.green + '" stroke-width="2.5" marker-end="url(#universal_hash_pick_arr)"/>';
    s += txt((FC[0] + R + 30 + BKX - 40) / 2, FC[1] - 12, "mod 3", 14, C.green, ' font-weight="700"');
    // 버킷
    var coll = {};
    for (var x = 0; x < P; x++) coll[hh(x)] = (coll[hh(x)] || 0) + 1;
    for (var b = 0; b < NB; b++) {
      var y = bucketY(b), isC = coll[b] > 1;
      s += '<g>' + box(BKX, y - 22, 100, 44, C.purL, C.pur) +
        (isC ? '<rect x="' + BKX + '" y="' + (y - 22) + '" width="100" height="44" rx="6" fill="none" stroke="' + C.red + '" stroke-width="3.5" opacity="0">' + anim("opacity", [[9.5, 0], [9.6, 1]]) + '</rect>' : "") + '</g>';
      s += txt(BKX - 10, y + 5, String(b), 14, C.pur, ' text-anchor="end" font-weight="700"');
      if (isC) s += vis(9.6, D, txt(BKX + 108, y + 5, "충돌!", 13, C.red, ' text-anchor="start" font-weight="700"'));
    }
    s += txt(BKX + 50, bucketY(2) + 42, "버킷 (n = 3)", 12, C.pur, ' font-weight="700"');

    // ---- 원소 x ----
    var slot = [0, 0, 0];
    for (x = 0; x < P; x++) {
      var u = onCircle(UC, x, 36), fp = onCircle(FC, f(x), R), bb2 = hh(x), sl = slot[bb2]++;
      var bp = [BKX + 28 + 44 * sl, bucketY(bb2)];
      var t1 = 4 + 0.5 * x, t2 = 7.5 + 0.4 * x, red = coll[bb2] > 1;
      s += '<g><circle r="13" stroke-width="2" fill="#fff" stroke="' + C.blue + '">' +
        (red ? anim("stroke", [[9.5, C.blue], [9.6, C.red]]) + anim("fill", [[9.5, "#fff"], [9.6, C.redL]]) : anim("stroke", [[9.5, C.blue], [9.6, C.green]])) + '</circle>' +
        txt(0, 5, String(x), 14, C.ink, ' font-weight="700"') +
        move([[t1, u[0] + "," + u[1]], [t1 + 0.7, fp[0] + "," + fp[1]], [t2, fp[0] + "," + fp[1]], [t2 + 0.7, bp[0] + "," + bp[1]]]) + '</g>';
    }

    s += txt(380, 360, "h 를 입력과 무관하게 H 에서 무작위로 고르면 적도 충돌을 강요할 수 없다 — 저장은 O(log M) 비트", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
