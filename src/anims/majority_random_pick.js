// ============================================================
// majority_random_pick — L6 p.73–77 (PNG 70–74) 랜덤 majority element, 기대 시도 횟수 ≤ 2
// 시간축(초): 0 배열(7 이 5/9) → 1.5 시도 1: 화살이 1 에 떨어짐 → 2.2~3.8 n 번 세기 count=1 → 실패(빨강)
//   → 5 시도 2: 7 에 떨어짐 → 5.7~7.3 세기 count=5 > n/2 → return 7 → 9.5 E[#iter] ≤ 2, O(n) → 13
// 오른쪽: 누적 막대 1 + 1/2 + 1/4 + … = 2
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["majority_random_pick"] = {
  title: "랜덤 majority — 뽑고 세고, 기대 2 번이면 끝 (13초)",
  desc: "[[majority element]] 가 절반 넘게 있으니 무작위로 뽑으면 성공 확률 ≥ 1/2 → 기대 시도 ≤ Σ(1/2)^i = 2 ([[등비급수]]), 매번 n 번 세므로 expected O(n) — [[랜덤 majority]]",
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


    var A = [3, 7, 7, 1, 7, 5, 7, 7, 2], n = A.length;
    var CW = 50, RY = 112;
    function cx(i) { return 65 + CW * i; }
    function isM(v) { return v === 7; }
    // 시도: [화살 떨어지는 시각, index, 세기 시작, 세기 끝, 성공?]
    // 페이드 없이 t0~t1 에만 보이기 (빠르게 바뀌는 숫자용)
    function win(t0, t1, inner) { var p = [[t0, 0], [t0 + 0.01, 1]]; if (t1 < D) { p.push([t1 - 0.01, 1]); p.push([t1, 0]); } return '<g opacity="0">' + inner + anim("opacity", p) + '</g>'; }
    var tries = [[1.5, 3, 2.2, 3.8, false], [5, 4, 5.7, 7.3, true]];

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="랜덤 majority element 애니메이션">';
    var caps = [
      [0, 1.5, "majority element 7 이 ⌊n/2⌋ + 1 = 5 번 이상 — 칸의 절반 넘게 초록"],
      [1.5, 5, "시도 1: 무작위 index → 1 을 뽑음 → n 번 세어 보니 count = 1 → 실패, 다시"],
      [5, 9.5, "시도 2: 무작위로 7 을 뽑음 → count = 5 &gt; n/2 → return 7"],
      [9.5, D, "성공 확률 ≥ 1/2 → 기대 시도 ≤ 2 번, 매번 n 번 비교 → expected O(n)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 배열 ----
    s += txt(30, RY + 5, "A", 14, C.blue, ' text-anchor="end" font-weight="700"');
    A.forEach(function (v, i) {
      var m = isM(v), fill = m ? C.greenL : C.blueL, st = m ? C.green : C.blue;
      var fillPts = null;
      if (i === 3) fillPts = [[3.8, fill], [3.9, C.redL], [5, C.redL], [5.1, fill]];
      s += '<rect x="' + (cx(i) - 23) + '" y="' + (RY - 18) + '" width="46" height="36" rx="5" fill="' + fill + '" stroke="' + st + '" stroke-width="2">' +
        (fillPts ? anim("fill", fillPts) + anim("stroke", [[3.8, st], [3.9, C.red], [5, C.red], [5.1, st]]) : "") + '</rect>';
      s += txt(cx(i), RY + 6, String(v), 16, C.ink, ' font-weight="700"');
      s += txt(cx(i), RY + 34, String(i), 10, C.muted);
    });

    // ---- 코드 ----
    var code = ["guess = random.choice(A)", "count = A 안에서 guess 와 같은 개수", "if count &gt; n/2: return guess"];
    var lineT = [ // 줄별 강조 구간
      [[1.5, 2.2], [5, 5.7]], [[2.2, 3.8], [5.7, 7.3]], [[3.8, 5], [7.3, D]]];
    code.forEach(function (c, k) {
      var y = 196 + 26 * k;
      lineT[k].forEach(function (w) { s += vis(w[0], w[1], '<rect x="36" y="' + (y - 17) + '" width="420" height="24" rx="4" fill="' + C.orL + '"/>'); });
      s += txt(44, y, c, 13, C.pur, ' text-anchor="start" font-family="monospace"');
    });
    s += txt(36, 166, "while True:", 13, C.pur, ' text-anchor="start" font-family="monospace" font-weight="700"');

    tries.forEach(function (tr, k) {
      var t = tr[0], idx = tr[1], s0 = tr[2], s1 = tr[3], ok = tr[4], g = A[idx];
      var tEnd = k === 0 ? 5 : D;
      // 떨어지는 화살
      s += '<g opacity="0">' + '<line x1="0" y1="-30" x2="0" y2="-6" stroke="' + C.or + '" stroke-width="3"/><polygon points="-8,-10 8,-10 0,2" fill="' + C.or + '"/>' +
        move([[t, cx(idx) + ",40"], [t + 0.5, cx(idx) + "," + (RY - 20)]]) + show(t, tEnd) + '</g>';
      // 훑는 틀 (세기)
      var sp = [], step = (s1 - s0) / n;
      for (var i = 0; i < n; i++) sp.push([s0 + step * i, cx(i) + "," + RY]);
      sp.push([s1, cx(n - 1) + "," + RY]);
      s += '<g opacity="0"><rect x="-26" y="-21" width="52" height="42" rx="6" fill="none" stroke="' + C.pur + '" stroke-width="3"/>' + move(sp) + show(s0, s1) + '</g>';
      // count 숫자 증가
      var marks = [];
      A.forEach(function (v, i) { if (v === g) marks.push(s0 + step * i + 0.05); });
      var ts = [s0].concat(marks);
      ts.forEach(function (tt, c) {
        var t1 = c + 1 < ts.length ? ts[c + 1] : tEnd;
        s += win(tt, t1, txt(330, 166, "count(" + g + ") = " + c, 15, c ? C.pur : C.muted, ' text-anchor="start" font-weight="700"'));
      });
      // 판정
      var verdict = ok ? "5 &gt; 4.5 → return 7 ✓" : "1 ≤ 4.5 → 실패, 다시 ✗";
      s += vis(s1, tEnd, txt(470, 166, verdict, 13, ok ? C.green : C.red, ' text-anchor="start" font-weight="700"'));
    });
    s += vis(7.4, D, box(160, 280, 150, 36, C.greenL, C.green) + txt(235, 304, "return 7", 16, C.green, ' font-weight="700"'));

    // ---- 오른쪽: 누적 막대 ----
    var BX = 620, BASE = 312, U = 70;
    s += txt(640, 112, "E[# iterations]", 13, C.pur, ' font-weight="700"');
    s += txt(640, 130, '≤ Σ (1/2)<tspan baseline-shift="super" font-size="72%">i</tspan>', 12, C.muted);
    s += '<rect x="' + BX + '" y="' + (BASE - 2 * U) + '" width="40" height="' + 2 * U + '" fill="none" stroke="#c9d2e0" stroke-dasharray="3 3"/>';
    var segs = [[1, "1", 2], [0.5, "+ 1/2", 3.5], [0.25, "+ 1/4", 5], [0.125, "+ 1/8", 6.5], [0.0625, "", 8]];
    var acc = 0;
    segs.forEach(function (sg, k) {
      var h = sg[0] * U, y = BASE - acc - h;
      acc += h;
      var col = k % 2 ? C.greenL : "#bfe3c8";
      s += vis(sg[2], D, '<rect x="' + BX + '" y="' + r4(y) + '" width="40" height="' + r4(h) + '" fill="' + col + '" stroke="' + C.green + '" stroke-width="1.5"/>' +
        txt(BX + 48, r4(y + h / 2 + 4), sg[1], k < 3 ? 12 : 10, C.green, ' text-anchor="start" font-weight="700"'));
    });
    s += vis(9, D, '<line x1="' + (BX - 16) + '" y1="' + (BASE - 2 * U) + '" x2="' + (BX + 56) + '" y2="' + (BASE - 2 * U) + '" stroke="' + C.or + '" stroke-width="2.5" stroke-dasharray="6 3"/>' +
      txt(BX + 60, BASE - 2 * U + 5, "= 2", 15, C.or, ' text-anchor="start" font-weight="700"'));
    s += txt(BX + 20, BASE + 18, "기하분포", 11, C.muted);
    s += vis(9.5, D, box(340, 280, 240, 36, C.orL, C.or) + txt(460, 303, "E[# checks] ≤ 2n = O(n)", 15, C.ink, ' font-weight="700"'));

    s += txt(380, 346, "Expected O(n) · Worst-case O(∞) — 적이 주사위까지 고정하면 영원히 틀린 것만 뽑는다", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
