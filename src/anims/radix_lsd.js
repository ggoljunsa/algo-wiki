// ============================================================
// radix_lsd — L5 p.53–58 (PNG 51–56) radix_sort(A, 3, 10), A = [31,5,210,14,95,477,555,125]
// 시간축(초): 0 초기 → 라운드 r (r=0,1,2) 시작 1.5+3.8r: 0.1초 간격으로 bucket 에 떨어짐(0.6초)
//   → +2.0 부터 bucket 0 부터 모음 → 12.8 정렬 완료(초록) → 14
// 라운드 결과 (슬라이드와 같음): 210 031 014 005 095 555 125 477 / 005 210 014 125 031 555 477 095 / 005 014 031 095 125 210 477 555
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["radix_lsd"] = {
  title: "Radix sort — 일의 자리부터 bucket 에 넣고 모으기 (14초)",
  desc: "[31, 5, 210, 14, 95, 477, 555, 125] 를 [[least-significant digit]] 부터 한 자리씩 stable 한 bucket sort 로 3 번 → 정렬. [[radix sort]] = Θ(d(n + k))",
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


    var A = [31, 5, 210, 14, 95, 477, 555, 125], NB = 10;
    var X0 = 76, CW = 76, RY = 66, BW = 64, BX0 = 60, BASE = 300;
    function rowX(p) { return X0 + CW * p + CW / 2; }
    function bucketX(b) { return BX0 + BW * b + BW / 2; }
    function pad(v) { return ("00" + v).slice(-3); }
    function digit(v, i) { return Math.floor(v / Math.pow(10, i)) % 10; }
    function T0(r) { return 1.5 + 3.8 * r; }

    // 라운드별 위치 계산
    var pos = A.map(function (v, i) { return i; });          // 현재 행에서의 자리
    var keys = A.map(function () { return []; });            // 원소별 키프레임 [초, "x,y"]
    A.forEach(function (v, i) { keys[i].push([0, rowX(i) + "," + RY]); });
    for (var r = 0; r < 3; r++) {
      var t0 = T0(r), buckets = [];
      for (var b = 0; b < NB; b++) buckets.push([]);
      var byPos = [];
      A.forEach(function (v, i) { byPos[pos[i]] = i; });
      byPos.forEach(function (i) { buckets[digit(A[i], r)].push(i); });   // 행 순서대로 넣음 = stable
      var q = 0, newPos = [];
      buckets.forEach(function (bk, b) {
        bk.forEach(function (i, k) {
          var p = pos[i], bx = bucketX(b), by = BASE - 14 - 28 * k;
          keys[i].push([t0 + 0.1 * p, rowX(p) + "," + RY]);
          keys[i].push([t0 + 0.1 * p + 0.6, bx + "," + by]);
          keys[i].push([t0 + 2.0 + 0.1 * q, bx + "," + by]);
          keys[i].push([t0 + 2.0 + 0.1 * q + 0.6, rowX(q) + "," + RY]);
          newPos[i] = q++;
        });
      });
      pos = newPos;
    }
    var TEND = T0(2) + 3.3;

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Radix sort 애니메이션">';
    var caps = [
      [0, 1.5, "A = [31, 5, 210, 14, 95, 477, 555, 125] — 3자리로 맞춰 031, 005, …"],
      [1.5, T0(1), "i = 0: 일의 자리(least-significant digit)로 bucket 0–9 에 넣고 0 번부터 모은다"],
      [T0(1), T0(2), "i = 1: 십의 자리로 다시 — 같은 bucket 안에서는 앞 라운드 순서를 유지(stable)"],
      [T0(2), TEND, "i = 2: 백의 자리로 마지막 — 이제 세 자리 모두로 정렬됨"],
      [TEND, D, "A = [5, 14, 31, 95, 125, 210, 477, 555] — d = 3 라운드, 각 Θ(n + k)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 행 틀, 버킷 ----
    s += txt(X0 - 10, RY + 5, "A", 14, C.blue, ' text-anchor="end" font-weight="700"');
    for (var i = 0; i < 8; i++) s += box(X0 + CW * i + 4, RY - 17, CW - 8, 34, "#fff", "#b9c4d8");
    for (b = 0; b < NB; b++) {
      s += box(BX0 + BW * b + 2, 170, BW - 4, 130, C.purL, C.pur);
      s += txt(bucketX(b), 318, String(b), 13, C.pur, ' font-weight="700"');
    }
    s += txt(BX0 - 6, 318, "bucket", 11, C.pur, ' text-anchor="end"');
    var names = ["일의 자리", "십의 자리", "백의 자리"];
    for (r = 0; r < 3; r++) {
      s += vis(T0(r), r < 2 ? T0(r + 1) : TEND, txt(380, 156, "i = " + r + " · key = " + names[r] + " 숫자", 13, C.or, ' font-weight="700"'));
    }

    // ---- 원소 ----
    A.forEach(function (v, i) {
      var str = pad(v), sp = "";
      for (var c = 0; c < 3; c++) {
        var r = 2 - c, t0 = T0(r), t1 = r < 2 ? T0(r + 1) - 0.3 : TEND;
        sp += '<tspan>' + str.charAt(c) + anim("fill", [[t0, C.ink], [t0 + 0.05, C.or], [t1 - 0.05, C.or], [t1, C.ink]]) + '</tspan>';
      }
      s += '<g><rect x="-28" y="-13" width="56" height="26" rx="5" stroke-width="2">' +
        anim("fill", [[TEND - 0.1, C.blueL], [TEND, C.greenL]]) + anim("stroke", [[TEND - 0.1, C.blue], [TEND, C.green]]) + '</rect>' +
        '<text x="0" y="5" font-size="15" font-weight="700" text-anchor="middle" fill="' + C.ink + '" font-family="monospace">' + sp + '</text>' +
        move(keys[i]) + '</g>';
    });

    s += txt(380, 352, "LSD 부터 d 번 stable bucket sort → Θ(d · (n + k)) — d 와 k 가 상수면 Θ(n)", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
