// ============================================================
// quicksort_random_pivot — L6 p.14 (PNG 13) 배열, p.30–34 X_{a,b} 와 P(X_{6,10}=1) = 2/5
// 시간축(초): 0 배열, {6..10} 강조 → 2.5 피벗 7 → 2.8~3.8 분할: 6 은 left, 10 은 right (X=0) → 6.3 원위치
//   → 7 피벗 6 → 7.4~8.4 분할, 6 과 10 비교됨 (X=1) → 11 원위치 → 11.6 {6,7,8,9,10} 중 먼저 → 2/5 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["quicksort_random_pivot"] = {
  title: "Randomized quicksort — 6 과 10 이 비교될 확률 2/5 (14초)",
  desc: "[[randomized quicksort]] 에서 두 원소는 둘 중 하나가 피벗일 때만 비교된다. 사이 값 7, 8, 9 가 먼저 피벗이 되면 갈라져 영원히 비교 안 됨 → [[P(X_{a,b}=1)]] = 2/(b − a + 1)",
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


    var A = [0, 6, 8, 11, 1, 10, 2, 7, 3, 9, 4, 5];
    var CW = 52, Y0 = 84, Y1 = 196;
    function rowX(i) { return 94 + CW * i; }
    // 분할 후 자리: left 는 원래 순서대로, pivot, right 원래 순서대로 (partition_about_pivot)
    function layout(p) {
      var left = [], right = [], pos = {};
      A.forEach(function (v) { if (v < p) left.push(v); else if (v > p) right.push(v); });
      left.forEach(function (v, j) { pos[v] = rowX(j); });
      var px = rowX(left.length - 1) + CW + 20;
      pos[p] = px;
      right.forEach(function (v, k) { pos[v] = px + CW + 20 + CW * k; });
      return { pos: pos, px: px, nl: left.length, nr: right.length };
    }
    var LA = layout(7), LB = layout(6);
    function sub(t) { return '<tspan baseline-shift="sub" font-size="72%">' + t + '</tspan>'; }
    var X610 = "X" + sub("6,10");
    function color(v) { return v === 6 || v === 10 ? [C.orL, C.or] : (v > 6 && v < 10 ? [C.greenL, C.green] : [C.blueL, C.blue]); }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Randomized quicksort 비교 확률 애니메이션">';
    var caps = [
      [0, 2.5, "6 과 10 이 비교될 확률은? — 사이 값 {6, 7, 8, 9, 10} 에 주목"],
      [2.5, 6.6, "7 (또는 8, 9) 이 먼저 피벗 → 6 은 left, 10 은 right 로 갈라져 영원히 비교 안 됨"],
      [6.6, 11.3, "6 (또는 10) 이 먼저 피벗 → 모든 원소가 피벗과 비교되므로 6 과 10 은 비교됨"],
      [11.3, D, "6 과 10 이 비교될 확률 = 7, 8, 9 보다 먼저 피벗 = 2/5"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // 원래 줄 틀
    s += txt(60, Y0 + 5, "A", 14, C.blue, ' text-anchor="end" font-weight="700"');
    A.forEach(function (v, i) { s += box(rowX(i) - 25, Y0 - 18, 50, 36, "#fff", "#c9d2e0"); });

    // 분할 표시 (장면별)
    function groups(L, p, t0, t1) {
      var lx0 = rowX(0) - 24, lx1 = rowX(L.nl - 1) + 24, rx0 = L.px + CW + 20 - 24, rx1 = rx0 + CW * L.nr - 4;
      var yb = Y1 + 26;
      return vis(t0, t1,
        '<path d="M' + lx0 + ',' + yb + ' v6 H' + lx1 + ' v-6" fill="none" stroke="' + C.muted + '" stroke-width="1.5"/>' +
        txt((lx0 + lx1) / 2, yb + 22, "left (&lt; " + p + ")", 12, C.muted) +
        '<path d="M' + rx0 + ',' + yb + ' v6 H' + rx1 + ' v-6" fill="none" stroke="' + C.muted + '" stroke-width="1.5"/>' +
        txt((rx0 + rx1) / 2, yb + 22, "right (&gt; " + p + ")", 12, C.muted));
    }
    s += groups(LA, 7, 3.8, 6.3);
    s += groups(LB, 6, 8.4, 11);
    // 장면 A: 6 과 10 이 갈라짐
    var a6 = LA.pos[6], a10 = LA.pos[10];
    s += vis(4, 6.3, '<path d="M' + a6 + ',' + (Y1 - 20) + ' C' + a6 + ',' + (Y1 - 58) + ' ' + a10 + ',' + (Y1 - 58) + ' ' + a10 + ',' + (Y1 - 20) + '" fill="none" stroke="' + C.red + '" stroke-width="2.5" stroke-dasharray="6 5"/>' +
      '<rect x="' + ((a6 + a10) / 2 - 150) + '" y="' + (Y1 - 72) + '" width="300" height="22" rx="4" fill="#fff"/>' +
      txt((a6 + a10) / 2, Y1 - 56, "✗ 서로 다른 sub-array → " + X610 + " = 0", 13, C.red, ' font-weight="700"'));
    // 장면 B: 6 과 10 비교됨
    var b6 = LB.pos[6], b10 = LB.pos[10];
    s += vis(8.6, 11, '<path d="M' + b6 + ',' + (Y1 - 20) + ' C' + b6 + ',' + (Y1 - 58) + ' ' + b10 + ',' + (Y1 - 58) + ' ' + b10 + ',' + (Y1 - 20) + '" fill="none" stroke="' + C.green + '" stroke-width="2.5"/>' +
      '<rect x="' + ((b6 + b10) / 2 - 150) + '" y="' + (Y1 - 72) + '" width="300" height="22" rx="4" fill="#fff"/>' +
      txt((b6 + b10) / 2, Y1 - 56, "✓ 피벗 6 과 비교됨 → " + X610 + " = 1", 13, C.green, ' font-weight="700"'));

    // 원소 블록
    A.forEach(function (v, i) {
      var c = color(v), home = rowX(i) + "," + Y0;
      var keys = [[2.8, home], [3.8, LA.pos[v] + "," + Y1], [6.3, LA.pos[v] + "," + Y1], [6.9, home],
        [7.4, home], [8.4, LB.pos[v] + "," + Y1], [11, LB.pos[v] + "," + Y1], [11.6, home]];
      var pivotT = v === 7 ? [2.5, 6.6] : (v === 6 ? [7, 11.3] : null);
      var fillPts = [[0, c[0]]], txtPts = [[0, C.ink]];
      if (pivotT) {
        fillPts = [[pivotT[0], c[0]], [pivotT[0] + 0.1, C.or], [pivotT[1] - 0.1, C.or], [pivotT[1], c[0]]];
        txtPts = [[pivotT[0], C.ink], [pivotT[0] + 0.1, "#fff"], [pivotT[1] - 0.1, "#fff"], [pivotT[1], C.ink]];
      }
      var g = '<g><rect x="-22" y="-16" width="44" height="32" rx="5" stroke="' + c[1] + '" stroke-width="2" fill="' + c[0] + '">' +
        (pivotT ? anim("fill", fillPts) : "") + '</rect>' +
        '<text x="0" y="6" font-size="16" font-weight="700" text-anchor="middle" fill="' + C.ink + '">' + v + (pivotT ? anim("fill", txtPts) : "") + '</text>';
      if (pivotT) g += vis(pivotT[0], pivotT[1], txt(0, 34, "pivot", 12, C.or, ' font-weight="700"'));
      g += move(keys) + '</g>';
      s += g;
    });

    // 마지막 장면: {6,7,8,9,10}
    var E = [6, 7, 8, 9, 10], fin = "";
    E.forEach(function (v, k) {
      var x = 250 + 65 * k, c = color(v);
      fin += '<circle cx="' + x + '" cy="186" r="22" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2.5"/>' + txt(x, 192, String(v), 16, C.ink, ' font-weight="700"');
    });
    fin += txt(380, 236, "이 5 개 중 가장 먼저 피벗이 되는 것이 6 또는 10 → 비교됨 · 7, 8, 9 → 갈라짐", 13, C.ink);
    fin += box(250, 250, 260, 34, C.greenL, C.green) + txt(380, 273, "P(" + X610 + " = 1) = 2 / 5", 17, C.green, ' font-weight="700"');
    s += vis(11.7, D, fin);

    s += txt(380, 340, "일반화: P(X" + sub("a,b") + " = 1) = 2 / (b − a + 1) — n 에 무관하게 a 와 b 의 거리만으로 정해진다", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
