// ============================================================
// hash_pigeonhole — L7 p.30–31 (PNG 30–31) 결정론적 해시 함수의 한계 (비둘기집 원리 → 적이 한 버킷만 채움)
// 시간축(초): 0 U(M=32) · h · 버킷 5 개 → 1.5~4.7 모든 원소가 h 를 거쳐 버킷으로 (h(u) = u mod 5)
//   → 4.8 개수 7,7,6,6,6 → 5 버킷 1 이 ≥ M/n, 적이 그 원소들을 빨강으로 → 6.5 버킷 비움
//   → 7.5~10 빨강 5 개가 INSERT → 체인 하나에 n 개 → 10.5~12 SEARCH 가 끝까지 → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["hash_pigeonhole"] = {
  title: "비둘기집 원리 — 결정론적 해시는 적에게 진다 (13초)",
  desc: "universe 가 버킷보다 훨씬 크면 어떤 버킷에는 ≥ M/n 개가 몰린다([[비둘기집 원리]]). h 를 아는 적은 그 원소들만 넣어 체인 하나를 n 길이로 → SEARCH O(n). [[결정론적 해시 함수의 한계]]",
  duration: 13,
  build: function () {
    var D = 13;
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


    var M = 32, NB = 5, HX = 330, HY = 200, BKX = 440;
    function bucketY(b) { return 100 + 50 * b; }
    // U 안의 점 위치: 6×6 격자에서 네 귀퉁이 제외
    var UP = [];
    for (var r = 0; r < 6; r++) for (var c = 0; c < 6; c++) {
      if ((r === 0 || r === 5) && (c === 0 || c === 5)) continue;
      UP.push([75 + 30 * c, 125 + 30 * r]);
    }
    function h(u) { return u % NB; }
    var BAD = 1, picks = [1, 6, 11, 16, 21];

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="비둘기집 원리와 해싱 게임 애니메이션">';
    s += '<defs><marker id="hash_pigeonhole_arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';
    var caps = [
      [0, 1.5, "결정론적 h: U → 버킷 n 개, universe 크기 M ≫ n (여기서 M = 32, n = 5)"],
      [1.5, 5, "U 의 원소를 모두 h 로 보내면 — 비둘기집 원리: 어떤 버킷에는 ≥ M/n 개가 몰린다"],
      [5, 7.5, "적(bad guy)은 h 를 안다 → 그 버킷으로 가는 원소들만 골라 입력으로"],
      [7.5, 10.5, "n 개를 INSERT 하면 모두 같은 버킷 — 체인 하나에 n 개가 매달린다"],
      [10.5, D, "SEARCH 가 체인을 끝까지 훑는다 → O(n): 결정론적 h 는 반드시 진다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- U, h, 버킷 틀 ----
    s += '<ellipse cx="150" cy="200" rx="122" ry="118" fill="' + C.blueL + '" fill-opacity="0.45" stroke="' + C.blue + '" stroke-width="2"/>';
    s += txt(150, 340, "Universe U (M 개)", 13, C.blue, ' font-weight="700"');
    s += '<line x1="274" y1="200" x2="' + (HX - 32) + '" y2="200" stroke="#555" stroke-width="2" marker-end="url(#hash_pigeonhole_arr)"/>';
    s += box(HX - 30, HY - 26, 60, 52, C.purL, C.pur) + txt(HX, HY + 7, "h", 22, C.pur, ' font-weight="700" font-style="italic"');
    s += txt(HX, HY + 44, "u mod 5", 11, C.muted);
    for (var b = 0; b < NB; b++) {
      var y = bucketY(b);
      s += '<line x1="' + (HX + 32) + '" y1="' + HY + '" x2="' + (BKX - 4) + '" y2="' + y + '" stroke="#c9d2e0" stroke-width="1.5"/>';
      var bb = box(BKX, y - 17, 40, 34, C.purL, C.pur) + txt(BKX + 20, y + 5, String(b), 14, C.pur, ' font-weight="700"');
      if (b === BAD) {
        bb = '<g>' + bb + '<rect x="' + BKX + '" y="' + (y - 17) + '" width="40" height="34" rx="6" fill="none" stroke="' + C.red + '" stroke-width="3.5" opacity="0">' +
          anim("opacity", [[5, 0], [5.1, 1]]) + '</rect></g>';
      }
      s += bb;
    }
    s += txt(BKX + 20, 70, "버킷", 12, C.pur, ' font-weight="700"');

    // ---- U 의 정적인 점 (적이 고르는 원소는 5초에 빨강) ----
    UP.forEach(function (p, u) {
      var bad = h(u) === BAD;
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="' + C.blue + '">' + (bad ? anim("fill", [[5.2, C.blue], [5.4, C.red]]) : "") + '</circle>';
    });

    // ---- 1 막: 모든 원소가 h 를 거쳐 버킷으로 (복사본) ----
    var cnt = [0, 0, 0, 0, 0];
    UP.forEach(function (p, u) {
      var b = h(u), k = cnt[b]++, t = 1.5 + 0.08 * u;
      var tx = BKX + 56 + 13 * k, ty = bucketY(b);
      var bad = b === BAD;
      s += '<circle r="5.5" fill="' + C.blue + '" opacity="0">' +
        (bad ? anim("fill", [[5, C.blue], [5.2, C.red]]) : "") +
        move([[t, p[0] + "," + p[1]], [t + 0.35, HX + "," + HY], [t + 0.7, tx + "," + ty]]) +
        anim("opacity", [[t, 0], [t + 0.02, 1], [6.4, 1], [6.8, 0]]) + '</circle>';
    });
    for (b = 0; b < NB; b++) {
      s += vis(4.8, 6.8, txt(BKX + 56 + 13 * 7 + 6, bucketY(b) + 5, cnt[b] + " 개", 12, b === BAD ? C.red : C.muted, ' text-anchor="start" font-weight="700"'));
    }
    s += vis(5, 7.5, txt(BKX + 196, bucketY(BAD) + 5, "≥ M/n = 6.4", 13, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(5.4, 7.5, txt(150, 70, "적: h(u) = 1 인 u 만 고르자", 13, C.red, ' font-weight="700"'));

    // ---- 3 막: 빨강 5 개 INSERT → 체인 ----
    var CX0 = BKX + 62, CY = bucketY(BAD), NW = 34, GAP = 14;
    picks.forEach(function (u, k) {
      var t = 7.5 + 0.55 * k, p = UP[u], nx = CX0 + (NW + GAP) * k;
      // 체인 노드 (도착하면 나타남) + 앞 노드에서 오는 화살표
      var node = box(nx, CY - 14, NW, 28, C.redL, C.red) + txt(nx + NW / 2, CY + 5, String(u), 13, C.red, ' font-weight="700"');
      var ax = k === 0 ? BKX + 40 : nx - GAP;
      node += '<line x1="' + ax + '" y1="' + CY + '" x2="' + (nx - 2) + '" y2="' + CY + '" stroke="#555" stroke-width="1.8" marker-end="url(#hash_pigeonhole_arr)"/>';
      s += vis(t + 0.6, D, node);
      s += '<circle r="7" fill="' + C.red + '" opacity="0">' +
        move([[t, p[0] + "," + p[1]], [t + 0.3, HX + "," + HY], [t + 0.6, (nx + NW / 2) + "," + CY]]) +
        anim("opacity", [[t, 0], [t + 0.02, 1], [t + 0.58, 1], [t + 0.62, 0]]) + '</circle>';
    });
    s += vis(9, D, txt(CX0 + 140, CY + 40, "길이 n 인 체인 하나", 13, C.red, ' font-weight="700"'));
    // SEARCH 훑기
    var sp = [];
    picks.forEach(function (u, k) { sp.push([10.6 + 0.35 * k, (CX0 + (NW + GAP) * k + NW / 2) + "," + CY]); });
    s += '<g opacity="0"><rect x="-21" y="-18" width="42" height="36" rx="7" fill="none" stroke="' + C.or + '" stroke-width="3"/>' + move(sp) + show(10.5, D) + '</g>';
    s += vis(10.6, D, txt(CX0 + 140, CY - 26, "SEARCH(21): n 칸을 모두 봄 → O(n)", 13, C.or, ' font-weight="700"'));
    // 다른 버킷은 텅
    s += vis(8, D, txt(BKX + 64, bucketY(3) + 5, "나머지 버킷은 텅 빔", 12, C.muted, ' text-anchor="start"'));

    s += txt(380, 360, "그래서 h 를 입력을 보기 전에 무작위로 고른다 → universal hash family", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
