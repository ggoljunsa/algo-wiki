// ============================================================
// job_swap — L14 p.50 "Head-to-head": 두 job 의 순서를 바꿔 비용을 비교한다
//   Job A: x 시간, 끝날 때까지 시간당 z.  Job B: y 시간, 시간당 w.
//   Cost(A then B) = x·z + (x+y)·w,  Cost(B then A) = y·w + (x+y)·z
//   A then B 가 낫다 ⇔ xz + (x+y)w ≤ yw + (x+y)z ⇔ xz + xw + yw ≤ yw + xz + yz ⇔ wx ≤ yz ⇔ w/y ≤ z/x
// 그림 길이: x = 180px, y = 90px (슬라이드처럼 A 가 B 보다 길다)
// 시간축(초): 0–1 두 job → 1–3.4 A then B → 4–6.4 B then A → 7, 8.2, 9.4, 10.6 부등식 → 12–14 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["job_swap"] = {
  title: "Job 두 개 맞바꾸기 — 비율 z/x 가 큰 쪽이 먼저 (14초)",
  desc: "L14 p.50. 이웃한 두 job 의 순서만 바꾸면 나머지 job 의 비용은 그대로다. 두 순서의 비용을 빼 보면 $w/y \\le z/x$ 일 때 A 가 먼저인 쪽이 싸다. 그래서 [[cost/time 비율]] 이 큰 job 부터 한다. [[job scheduling]].",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", ink: "#222", line: "#b9c4d8", bOr: "#b8741a" };
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
    // 왼쪽에서 자라는 막대
    function bar(x, y, w, h, fill, label, t0, t1) {
      return '<rect x="' + x + '" y="' + y + '" width="0" height="' + h + '" rx="4" fill="' + fill + '">' +
        '<animate attributeName="width" values="0;0;' + w + ';' + w + '" keyTimes="0;' + r4(t0 / D) + ';' + r4(t1 / D) + ';1" dur="' + D + 's" fill="freeze"/></rect>' +
        vis(t1 - 0.2, D, txt(x + 10, y + h / 2 + 5, label, 13, "#fff", ' text-anchor="start" font-weight="700"'));
    }
    // 0 부터 끝나는 시각까지의 괄호 + 비용
    function span(x0, x1, y, label, col, t) {
      return vis(t, D, '<path d="M' + x0 + ',' + (y - 6) + ' L' + x0 + ',' + y + ' L' + x1 + ',' + y + ' L' + x1 + ',' + (y - 6) + '" fill="none" stroke="' + col + '" stroke-width="1.6"/>' +
        txt(x1 + 8, y + 4, label, 12.5, col, ' text-anchor="start" font-weight="700"'));
    }
    function frac(cx, y, num, den, col) {
      return txt(cx, y - 6, num, 15, col, ' font-weight="700" font-style="italic"') +
        '<line x1="' + (cx - 9) + '" y1="' + y + '" x2="' + (cx + 9) + '" y2="' + y + '" stroke="' + col + '" stroke-width="1.5"/>' +
        txt(cx, y + 16, den, 15, col, ' font-weight="700" font-style="italic"');
    }

    var X0 = 40, XA = 180, XB = 90;      // 막대 시작, A 길이(x), B 길이(y)
    var R1 = 92, R2 = 210, BH = 24;       // 두 줄의 막대 y
    var TL = [7, 8.2, 9.4, 10.6], TS = 12;

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="두 job 순서 바꾸기 애니메이션">';
    var caps = [
      [0, 1, "Job A 는 x 시간, 끝날 때까지 시간당 z. Job B 는 y 시간, 시간당 w"],
      [1, 4, "A then B: A 는 x 에 끝나 xz, B 는 x+y 에 끝나 (x+y)w"],
      [4, TL[0], "B then A: B 는 y 에 끝나 yw, A 는 x+y 에 끝나 (x+y)z"],
      [TL[0], TL[2], "A then B 가 싼 조건을 쓰고 양변을 전개한다"],
      [TL[2], TS, "같은 항 xz, yw 를 지우면 wx ≤ yz, 양변을 xy 로 나누면 w/y ≤ z/x"],
      [TS, D, "z/x (시간당 비용 ÷ 걸리는 시간) 가 큰 job 을 먼저 한다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // 범례
    s += '<rect x="' + X0 + '" y="42" width="14" height="12" rx="2" fill="' + C.blue + '"/>' + txt(X0 + 20, 53, "Job A: x 시간, 시간당 z", 12, C.ink, ' text-anchor="start"');
    s += '<rect x="' + (X0 + 200) + '" y="42" width="14" height="12" rx="2" fill="' + C.pur + '"/>' + txt(X0 + 220, 53, "Job B: y 시간, 시간당 w", 12, C.ink, ' text-anchor="start"');

    // ---- A then B ----
    s += txt(X0, R1 - 8, "A then B", 14, C.green, ' text-anchor="start" font-weight="800"');
    s += bar(X0, R1, XA, BH, C.blue, "A", 1, 2.4);
    s += bar(X0 + XA, R1, XB, BH, C.pur, "B", 2.4, 3.4);
    s += span(X0, X0 + XA, R1 + BH + 16, "x · z", C.blue, 2.4);
    s += span(X0, X0 + XA + XB, R1 + BH + 36, "(x + y) · w", C.pur, 3.4);
    s += vis(3.6, D, txt(X0, R1 + BH + 62, "Cost = xz + (x + y)w", 13, C.green, ' text-anchor="start" font-weight="700"'));

    // ---- B then A ----
    s += txt(X0, R2 - 8, "B then A", 14, C.bOr, ' text-anchor="start" font-weight="800"');
    s += bar(X0, R2, XB, BH, C.pur, "B", 4, 5);
    s += bar(X0 + XB, R2, XA, BH, C.blue, "A", 5, 6.4);
    s += span(X0, X0 + XB, R2 + BH + 16, "y · w", C.pur, 5);
    s += span(X0, X0 + XA + XB, R2 + BH + 36, "(x + y) · z", C.blue, 6.4);
    s += vis(6.6, D, txt(X0, R2 + BH + 62, "Cost = yw + (x + y)z", 13, C.bOr, ' text-anchor="start" font-weight="700"'));

    // ---- 부등식 (오른쪽) ----
    var IX = 600;
    s += vis(TL[0], D, '<rect x="450" y="66" width="295" height="190" rx="8" fill="#fff" stroke="' + C.or + '" stroke-width="1.5"/>');
    s += vis(TL[0], D, txt(IX, 88, "A then B 가 B then A 보다 싸다 ⇔", 12.5, C.ink, ' font-weight="700"'));
    s += vis(TL[0], D, txt(IX, 116, "xz + (x+y)w  ≤  yw + (x+y)z", 14, C.ink, ' font-weight="700"'));
    s += vis(TL[1], D, txt(IX, 146, '<tspan fill="' + C.muted + '" text-decoration="line-through">xz</tspan> + xw + <tspan fill="' + C.muted + '" text-decoration="line-through">yw</tspan>  ≤  <tspan fill="' + C.muted + '" text-decoration="line-through">yw</tspan> + <tspan fill="' + C.muted + '" text-decoration="line-through">xz</tspan> + yz', 14, C.ink, ' font-weight="700"'));
    s += vis(TL[2], D, txt(IX, 176, "wx  ≤  yz", 15, C.ink, ' font-weight="700"'));
    s += vis(TL[3], D, frac(IX - 22, 214, "w", "y", C.pur) + txt(IX, 219, "≤", 16, C.ink, ' font-weight="700"') + frac(IX + 22, 214, "z", "x", C.blue) +
      txt(IX - 40, 219, "B", 11, C.pur, ' text-anchor="end" font-weight="700"') + txt(IX + 40, 219, "A", 11, C.blue, ' text-anchor="start" font-weight="700"'));

    // ---- 정리 ----
    s += vis(TS, D, '<rect x="450" y="268" width="295" height="46" rx="8" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="1.5"/>' +
      txt(597, 287, "비율 = cost of delay / time it takes", 12.5, C.pur, ' font-weight="700"') +
      txt(597, 305, "비율이 가장 큰 job 부터 (내림차순 정렬)", 12.5, C.pur, ' font-weight="700"'));

    s += '<line x1="20" y1="332" x2="740" y2="332" stroke="' + C.line + '"/>';
    s += txt(380, 355, "이웃한 두 job 만 바꾸면 다른 job 의 끝나는 시각은 그대로다. 그래서 두 job 의 비용만 비교하면 된다", 12.5, C.pur, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
