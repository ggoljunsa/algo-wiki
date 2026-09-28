// ============================================================
// stable_sort — L5 p.42 (PNG 40) stable sort [1(a), 3, 2, 1(b)] + p.57 radix sort 정확성 증명이 stable 에 기대는 이유
// 시간축(초): 0 입력 → 1.5 stable 결과 → 3 unstable 결과(1ᵃ·1ᵇ 뒤바뀜) → 6.3 장면 전환
//   → radix 2 라운드: [21, 13, 25] 를 십의 자리로 → 8 stable [13,21,25] → 9.7 unstable [13,25,21] 틀림 → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["stable_sort"] = {
  title: "Stable sort — 같은 값의 순서 유지가 radix sort 를 살린다 (13초)",
  desc: "[[stable sort]] 는 같은 key 의 원소를 입력 순서대로 둔다: [1ᵃ, 3, 2, 1ᵇ] → [1ᵃ, 1ᵇ, 2, 3]. [[radix sort]] 의 둘째 라운드가 unstable 하면 첫 라운드의 순서가 깨져 결과가 틀린다",
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
    function move(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kf(pts) + '/>'; }


    var XS = [300, 370, 440, 510], Y0 = 82, YS = 172, YU = 252;
    function lab(v, tag) { return tag ? v + '<tspan baseline-shift="super" font-size="70%">' + tag + '</tspan>' : v; }
    // 블록: 라벨, 색(강조 여부), 키프레임
    function block(label, hot, pts, extra) {
      return '<g>' + box(-26, -15, 52, 30, hot ? C.orL : C.blueL, hot ? C.or : C.blue) +
        txt(0, 6, label, 16, C.ink, ' font-weight="700"') + (extra || "") + move(pts) + '</g>';
    }
    function rowFrame(y, label, color, n) {
      var g = txt(262, y + 5, label, 13, color, ' text-anchor="end" font-weight="700"');
      XS.slice(0, n || 4).forEach(function (x) { g += box(x - 31, y - 19, 62, 38, "#fff", "#c9d2e0"); });
      return g;
    }
    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stable sort 애니메이션">';
    var caps = [
      [0, 1.5, "stable sort: 같은 값(key)의 원소는 입력에서의 순서를 그대로 유지한다"],
      [1.5, 3, "stable: [1ᵃ, 3, 2, 1ᵇ] → [1ᵃ, 1ᵇ, 2, 3] — 1ᵃ 가 여전히 1ᵇ 앞"],
      [3, 6.3, "unstable 이면 [1ᵇ, 1ᵃ, 2, 3] 처럼 같은 1 끼리 뒤바뀔 수 있다"],
      [6.3, 8, "왜 중요? radix sort 둘째 라운드 — 십의 자리가 같은 21 과 25"],
      [8, 9.7, "stable 한 bucket sort: 21 이 25 앞 그대로 → [13, 21, 25] 정답"],
      [9.7, D, "unstable 이면 [13, 25, 21] — 일의 자리로 맞춰 둔 순서가 깨져 결과가 틀린다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ===== 장면 1: [1ᵃ, 3, 2, 1ᵇ] =====
    var P1 = rowFrame(Y0, "입력", C.blue) + rowFrame(YS, "stable sort", C.green) + rowFrame(YU, "unstable sort", C.red);
    var items = [["1", "a", 1], ["3", "", 0], ["2", "", 0], ["1", "b", 1]];
    var stableTo = [0, 3, 2, 1], unstableTo = [1, 3, 2, 0];     // 입력 i 가 가는 자리
    items.forEach(function (it, i) {
      var p0 = XS[i] + "," + Y0;
      P1 += block(lab(it[0], it[1]), it[2], [[1.5, p0], [2.7, XS[stableTo[i]] + "," + YS]]);
      P1 += block(lab(it[0], it[1]), it[2], [[3, p0], [4.2, XS[unstableTo[i]] + "," + YU]]);
      P1 += block(lab(it[0], it[1]), it[2], [[0, p0]]);                 // 입력 줄에 남는 원본
    });
    P1 += vis(2.8, 6.3, txt(560, YS + 5, "✓ 1ᵃ → 1ᵇ 순서 그대로", 13, C.green, ' text-anchor="start" font-weight="700"'));
    P1 += vis(4.3, 6.3, txt(560, YU + 5, "✗ 1ᵇ 가 1ᵃ 앞으로", 13, C.red, ' text-anchor="start" font-weight="700"') +
      '<path d="M300,' + (YU + 24) + ' C320,' + (YU + 40) + ' 350,' + (YU + 40) + ' 370,' + (YU + 24) + '" fill="none" stroke="' + C.red + '" stroke-width="2"/>');
    s += '<g>' + P1 + '<animate attributeName="opacity" ' + kf([[0, 1], [6.1, 1], [6.3, 0]]) + '/></g>';

    // ===== 장면 2: radix 둘째 라운드 =====
    var P2 = rowFrame(Y0, "1 라운드 후", C.blue, 3) + rowFrame(YS, "stable", C.green, 3) + rowFrame(YU, "unstable", C.red, 3);
    P2 += txt(380, Y0 - 28, "(일의 자리로 이미 정렬됨: 1 &lt; 3 &lt; 5)", 11, C.muted);
    function two(v) { var t = String(v); return '<tspan fill="' + C.or + '">' + t.charAt(0) + '</tspan>' + t.charAt(1); }
    var R = [21, 13, 25];
    var XR = [XS[0], XS[1], XS[2]];
    var st2 = [1, 0, 2], un2 = [2, 0, 1];
    R.forEach(function (v, i) {
      var hot = v !== 13, p0 = XR[i] + "," + Y0;
      P2 += block(two(v), hot, [[8, p0], [9.2, XR[st2[i]] + "," + YS]]);
      P2 += block(two(v), hot, [[9.7, p0], [10.9, XR[un2[i]] + "," + YU]]);
      P2 += block(two(v), hot, [[0, p0]]);
    });
    P2 += vis(9.3, D, txt(560, YS + 5, "✓ 13, 21, 25", 13, C.green, ' text-anchor="start" font-weight="700"'));
    P2 += vis(11, D, txt(560, YU + 5, "✗ 25 가 21 앞 — 틀림", 13, C.red, ' text-anchor="start" font-weight="700"') +
      '<path d="M370,' + (YU + 24) + ' C390,' + (YU + 40) + ' 420,' + (YU + 40) + ' 440,' + (YU + 24) + '" fill="none" stroke="' + C.red + '" stroke-width="2"/>');
    P2 += txt(620, Y0 + 5, "key = 십의 자리", 12, C.or, ' font-weight="700"');
    s += '<g opacity="0">' + P2 + '<animate attributeName="opacity" ' + kf([[6.3, 0], [6.5, 1]]) + '/></g>';

    s += txt(380, 336, "radix sort 의 정확성 증명은 'bucket_sort is stable' 에 기댄다 — 매 라운드가 stable 해야 한다", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
