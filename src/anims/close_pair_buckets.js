// ============================================================
// close_pair_buckets — HW2 2번 (c): 폭 T 버킷으로 거리 T 이내 쌍을 O(n) 에 찾기
// 시간축(초): 0 수직선 위 A=[10,5,15,25,20,26,5000,500], T=2 → 2 폭 T 격자 + index 라벨, 점들이 버킷으로
//   → 5 "같은 bucket 에 둘?" 없음 (같은 칸이면 거리 ≤ T−1) → 7 괄호가 이웃 버킷 쌍을 훑음
//   → 9 버킷 12·13 의 25·26 빨강, 26 − 25 = 1 ≤ 2 → True → 10 요점 O(n) → 12
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["close_pair_buckets"] = {
  title: "거리 T 이내 쌍 — 폭 T 버킷에 넣고 이웃 칸만 본다 (12초)",
  desc: "HW2 2번 (c). bucket 폭을 T 로 잡으면 같은 칸의 두 수는 거리 ≤ T−1([[비둘기집 원리]]), 칸 i 와 i+2 는 거리 ≥ T+1 → '''같은 칸 또는 이웃 칸'''만 보면 O(n). [[HW2 복기]]",
  duration: 12,
  build: function () {
    var D = 12;
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
    function move(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kf(pts) + '/>'; }

    var A = [10, 5, 15, 25, 20, 26, 5000, 500], T = 2;
    var LY = 100, BY = 150, BH = 54, U = 18, X0 = 40, BW = 2 * U;   // 수직선 y, 버킷 y·높이, 값 1 당 px
    // 버킷 i 의 왼쪽 x: 0..13 은 실제 축척, 250 · 2500 은 오른쪽에 압축
    function bx(i) { return i === 250 ? 594 : i === 2500 ? 676 : X0 + 2 * U * i; }
    // 값 v 의 점 x (버킷 안 가운데쯤)
    function px(v) { var i = Math.floor(v / T); return v >= 500 ? bx(i) + BW / 2 : bx(i) + (v % T === 0 ? 11 : 25); }
    
    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="폭 T 버킷으로 거리 T 이내 쌍 찾기 애니메이션">';
    var caps = [
      [0, 2, "입력 A = [10, 5, 15, 25, 20, 26, 5000, 500], T = 2 — 거리 ≤ T 인 쌍이 있는가?"],
      [2, 5, "bucket 폭을 T 로: index = ⌊x/T⌋ 에 하나씩 넣는다 (버킷 수 ⌈M/T⌉+1, M 고정 → O(1))"],
      [5, 7, "pigeonhole principle: 같은 bucket 의 두 수는 거리 ≤ T−1 → 있으면 즉시 True. 여기선 없음"],
      [7, 10, "이제 이웃 bucket i, i+1 만 본다 (i 와 i+2 는 거리 ≥ T+1) → 12·13 에서 26 − 25 = 1 ≤ 2"],
      [10, D, "True! 버킷 넣기 n 번 + 이웃 검사 → 전체 O(n)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 수직선 ----
    s += '<line x1="' + X0 + '" y1="' + LY + '" x2="' + (X0 + 28 * U) + '" y2="' + LY + '" stroke="#555" stroke-width="1.5"/>';
    for (var v = 0; v <= 28; v += 2) {
      s += '<line x1="' + (X0 + v * U) + '" y1="' + (LY - 4) + '" x2="' + (X0 + v * U) + '" y2="' + (LY + 4) + '" stroke="#999"/>';
      if (v % 10 === 0) s += txt(X0 + v * U, LY + 18, v, 10, C.muted);
    }
    // 끊김 표시 + 500, 5000
    s += txt(568, LY + 5, "≈", 18, C.muted);
    s += '<line x1="584" y1="' + LY + '" x2="724" y2="' + LY + '" stroke="#555" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += txt(616, LY + 18, "…500", 10, C.muted) + txt(698, LY + 18, "…5000", 10, C.muted);
    s += txt(52, 60, "T = 2", 14, C.or, ' font-weight="700"');
    // 버킷 번호 공식 — 2s 부터 끝까지 고정 표시 (왜 5 가 i=2 인지)
    s += vis(2, D, txt(380, 262, "i = ⌊x / T⌋   예) 5 → ⌊5/2⌋ = 2,  10 → ⌊10/2⌋ = 5,  26 → 13", 12, C.or, ' font-weight="700"'));

    // ---- 폭 T 격자 (2s 부터) ----
    var g = "";
    var idxs = [];
    for (var i = 0; i <= 13; i++) idxs.push(i);
    idxs.push(250, 2500);
    idxs.forEach(function (i, k) {
      var x = bx(i), hit = i === 12 || i === 13;
      g += '<rect x="' + x + '" y="' + BY + '" width="' + BW + '" height="' + BH + '" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="1.5">' +
        (hit ? anim("fill", [[9, C.purL], [9.2, C.redL]]) + anim("stroke", [[9, C.pur], [9.2, C.red]]) : "") + '</rect>';
      g += txt(x + BW / 2, BY + BH + 16, i, 12, hit ? C.red : C.pur, ' font-weight="700"');
    });
    g += txt(568, BY + 32, "…", 18, C.muted) + txt(658, BY + 32, "…", 18, C.muted);
    g += txt(X0 - 22, BY + BH + 16, "i", 12, C.pur, ' font-style="italic"');
    s += vis(2, D, g);
    s += vis(2.2, 7, txt(X0 + BW / 2, BY - 8, "[0, 1]", 10, C.muted) + txt(X0 + 3 * BW / 2, BY - 8, "[2, 3]", 10, C.muted));

    // ---- 점: 수직선 → 버킷 ----
    A.forEach(function (v, k) {
      var x = px(v), t = 2.4 + 0.3 * k, red = v === 25 || v === 26;
      s += '<g>' + move([[t, "0,0"], [t + 0.4, "0," + (BY + 30 - LY)]]) +
        '<circle cx="' + x + '" cy="' + LY + '" r="7" fill="' + C.blue + '">' + (red ? anim("fill", [[9, C.blue], [9.2, C.red]]) : "") + '</circle>' +
        '<text x="' + x + '" y="' + (LY - 12) + '" font-size="12" text-anchor="middle" font-weight="700" fill="' + C.blue + '">' + v +
        (red ? anim("fill", [[9, C.blue], [9.2, C.red]]) : "") + '</text></g>';
    });

    // ---- 5–7s: 같은 버킷 검사 ----
    var occ = [2, 5, 7, 10, 12, 13, 250, 2500];
    var chk = "";
    occ.forEach(function (i) { chk += txt(bx(i) + BW / 2, BY + BH + 34, "1", 12, C.green, ' font-weight="700"'); });
    chk += txt(X0 - 22, BY + BH + 34, "개수", 10, C.green);
    s += vis(5, 7, chk);
    s += vis(5.3, 7, txt(380, 290, "같은 칸 = 폭 T 구간 [iT, iT+T−1] → 두 수의 차 ≤ T−1. 모든 bucket 에 1 개뿐 → 같은 칸 충돌 없음", 13, C.green, ' font-weight="700"'));

    // ---- 7–10s: 이웃 버킷 쌍 괄호 ----
    var scan = [[7.2, 2], [7.7, 5], [8.2, 7], [8.7, 10], [9.1, 12]];
    var bpts = [];
    scan.forEach(function (p) { bpts.push([p[0], (bx(p[1]) - X0) + ",0"]); });
    var brk = '<rect x="' + (X0 - 4) + '" y="' + (BY - 6) + '" width="' + (2 * BW + 8) + '" height="' + (BH + 12) + '" rx="7" fill="none" stroke-width="3" stroke-dasharray="7 3" stroke="' + C.or + '">' +
      anim("stroke", [[9.1, C.or], [9.2, C.red]]) + '</rect>';
    s += '<g opacity="0">' + '<g>' + move(bpts) + brk + '</g>' + show(7, D) + '</g>';
    s += vis(7.2, 9.1, txt(380, 290, "칸 i 와 i+2 사이는 한 칸(폭 T)이 끼어 거리 ≥ T+1 → 이웃 i, i+1 만 확인", 13, C.or, ' font-weight="700"'));
    s += vis(9.2, D, txt(bx(12) + BW, 296, "26 − 25 = 1 ≤ T = 2 → True", 15, C.red, ' font-weight="700"'));
    s += vis(9.2, D, '<line x1="' + (bx(12) + BW) + '" y1="280" x2="' + (bx(12) + BW) + '" y2="' + (BY + BH + 24) + '" stroke="' + C.red + '" stroke-width="1.5"/>');

    // ---- 10–12s: 요점 강조 ----
    s += vis(10, D, '<rect x="50" y="262" width="200" height="52" rx="8" fill="' + C.greenL + '" stroke="' + C.green + '" stroke-width="2"/>' +
      txt(150, 283, "삽입 n + 이웃 검사", 13, C.green, ' font-weight="700"') + txt(150, 303, "= O(n)", 15, C.green, ' font-weight="700"'));

    s += txt(380, 345, "bucket 폭 = T → 같은 칸 또는 이웃 칸만 보면 된다 → O(n)", 13, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
