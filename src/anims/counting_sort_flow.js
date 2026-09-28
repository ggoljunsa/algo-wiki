// ============================================================
// counting_sort_flow — L5 p.22–34 (PNG 20–32) counting sort, A = [0,0,3,1,1,3,1,0]
// 시간축(초): 0 초기 A → 1.5~8.1 원소가 하나씩 counts[값] 칸으로 떨어짐 (0.8초 간격, 막대 3,3,0,2)
//   → 8.3~11.3 counts 를 왼쪽부터 풀어 result [0,0,0,1,1,1,3,3] → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["counting_sort_flow"] = {
  title: "Counting sort — counts 칸에 떨어뜨리고 왼쪽부터 풀기 (13초)",
  desc: "A = [0,0,3,1,1,3,1,0] 의 원소가 하나씩 [[counts 배열|counts]][값] 에 쌓여 3,3,0,2 → 왼쪽부터 풀면 정렬 끝. 비교 없이 [[Θ(n+k)]]",
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

    var A = [0, 0, 3, 1, 1, 3, 1, 0], K = 4;
    var X0 = 180, CW = 50, AY = 64, RY = 314, BASE = 250;
    var BX = [230, 330, 430, 530];
    function cellX(i) { return X0 + CW * i + CW / 2; }
    function drop(i) { return 1.5 + 0.8 * i; }

    var s = '<svg viewBox="0 0 760 375" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Counting sort 애니메이션">';
    var caps = [
      [0, 1.5, "A = [0, 0, 3, 1, 1, 3, 1, 0] — 값이 0~3 (k = 4) 인 정수 n = 8 개"],
      [1.5, 8.2, "① A 를 한 번 훑으며 counts[A[i]] 를 1 씩 올린다 — 비교는 한 번도 없음"],
      [8.2, 11.3, "② counts 를 왼쪽부터 풀어 result 에 이어 쓴다 — 0 을 3 번, 1 을 3 번, 3 을 2 번"],
      [11.3, D, "result = [0, 0, 0, 1, 1, 1, 3, 3] — n 개 훑기 + k 칸 풀기 = Θ(n + k)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- A 행, result 행 틀 ----
    s += txt(160, AY + 5, "A", 14, C.blue, ' text-anchor="end" font-weight="700"');
    s += txt(160, RY + 5, "result", 14, C.green, ' text-anchor="end" font-weight="700"');
    for (var i = 0; i < 8; i++) {
      s += box(X0 + CW * i, AY - 16, CW, 32, "#fff", "#b9c4d8");
      s += txt(cellX(i), AY + 5, String(A[i]), 13, "#bbb");
      s += txt(cellX(i), AY - 21, String(i), 10, C.muted);
      s += box(X0 + CW * i, RY - 16, CW, 32, "#fff", "#b9c4d8");
    }
    // ---- counts 칸 (버킷) ----
    s += txt(160, 205, "counts", 14, C.pur, ' text-anchor="end" font-weight="700"');
    var arrive = [[], [], [], []];      // 버킷별 도착 시각
    A.forEach(function (v, i) { arrive[v].push(drop(i) + 0.6); });
    for (var b = 0; b < K; b++) {
      s += box(BX[b] - 30, 150, 60, 100, C.purL, C.pur);
      s += txt(BX[b], 268, "counts[" + b + "]", 12, C.pur);
      // 개수 숫자: 0 → 1 → 2 → 3
      var times = [0].concat(arrive[b]);
      times.forEach(function (t0, k) {
        var t1 = k + 1 < times.length ? times[k + 1] : D;
        var inner = txt(BX[b], 142, String(k), 16, k ? C.or : C.muted, ' font-weight="700"');
        s += t0 === 0 ? '<g>' + inner + '<animate attributeName="opacity" ' + kf([[0, 1], [t1 - 0.02, 1], [t1, 0]]) + '/></g>' : vis(t0, t1, inner);
      });
    }

    // ---- 원소 블록 ----
    var order = [];                      // result 순서 = 버킷 0 쌓인 순 → 버킷 1 → …
    var stackPos = [];
    var cnt = [0, 0, 0, 0];
    A.forEach(function (v, i) { stackPos[i] = cnt[v]++; });
    for (b = 0; b < K; b++) A.forEach(function (v, i) { if (v === b) order.push(i); });
    order.forEach(function (i, j) {
      var v = A[i], t = drop(i), u = 8.3 + 0.38 * j;
      var ax = cellX(i), bx = BX[v], by = BASE - 13 - 26 * stackPos[i], rx = cellX(j);
      var g = '<g>' + '<rect x="-22" y="-12" width="44" height="24" rx="5" stroke-width="2">' +
        anim("fill", [[t, C.blueL], [t + 0.05, C.orL], [t + 0.75, C.orL], [t + 0.8, C.blueL], [u + 0.35, C.blueL], [u + 0.4, C.greenL]]) +
        anim("stroke", [[t, C.blue], [t + 0.05, C.or], [t + 0.75, C.or], [t + 0.8, C.blue], [u + 0.35, C.blue], [u + 0.4, C.green]]) +
        '</rect>' + txt(0, 5, String(v), 14, C.ink, ' font-weight="700"') +
        move([[t, ax + "," + AY], [t + 0.6, bx + "," + by], [u, bx + "," + by], [u + 0.35, rx + "," + RY]]) + '</g>';
      s += g;
    });
    s += txt(380, 362, "비교를 하지 않으므로 Ω(n log n) 하한에 걸리지 않는다 — 대신 값의 범위 k 가 작아야 한다", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
