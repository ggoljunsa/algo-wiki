window.SIMS = window.SIMS || {};
// collinear_points — HW2 4번: x·y 좌표가 모두 다른 n 점에서 최대 collinear 부분집합
//   (a) 한 점 고정 + 기울기 mergesort O(n^2 log n) / (b) 랜덤 두 점 → O(n) 세기, expected O(k^2 n)
//   고정 데이터: n = 8, k = 2, 직선 y = 2x 위 4 점 (P0, P2, P4, P6)
(function (global) {
  "use strict";

  var P = [[1, 2], [4, 1], [2, 4], [6, 3], [3, 6], [7, 9], [5, 10], [8, 5]];
  var N = P.length, K = 2, NK = N / K;

  var CODE = {
    a: [
      "def max_collinear(P):",
      "    best = [P[0]]",
      "    for i in range(n):                                   # n 번",
      "        S = [(slope(P[i], P[j]), P[j]) for j in range(n) if j != i]   # O(n)",
      "        S = mergesort(S, key=slope)                      # O(n log n)",
      "        run = longest_equal_slope_run(S)                 # O(n) 한 번 훑기",
      "        if len(run) + 1 > len(best):",
      "            best = [P[i]] + [q for (m, q) in run]",
      "    return best"
    ],
    b: [
      "def random_collinear(P, k):",
      "    while True:",
      "        p, q = two distinct points chosen uniformly at random",
      "        m, b = line(p, q)                                # O(1)",
      "        S = [r for r in P if r.y == m * r.x + b]         # O(n)",
      "        if len(S) == n / k:",
      "            return S"
    ]
  };

  var COL = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222" };

  // ---------- 유리수 기울기 ----------
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function frac(num, den) {
    if (den < 0) { num = -num; den = -den; }
    var g = gcd(num, den);
    return { n: num / g, d: den / g };
  }
  function fstr(f) { return f.d === 1 ? String(f.n) : f.n + "/" + f.d; }
  function slope(i, j) { return frac(P[j][1] - P[i][1], P[j][0] - P[i][0]); }
  function fcmp(a, b) { return a.n * b.d - b.n * a.d; }
  function feq(a, b) { return fcmp(a, b) === 0; }
  function nm(i) { return "P" + i; }
  function pt(i) { return "(" + P[i][0] + "," + P[i][1] + ")"; }
  function setStr(idx) { return "{" + idx.slice().sort(function (a, b) { return a - b; }).map(nm).join(", ") + "}"; }

  // 두 점을 지나는 직선 위 점들 (정수 교차곱, 해싱 없음)
  function onLine(i, j) {
    var dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1], out = [];
    for (var r = 0; r < N; r++) if ((P[r][1] - P[i][1]) * dx === dy * (P[r][0] - P[i][0])) out.push(r);
    return out;
  }
  function lineStr(i, j) {
    var m = slope(i, j);
    var b = frac(P[i][1] * m.d - m.n * P[i][0], m.d);   // b = y1 − m·x1
    var ms = m.d === 1 ? (m.n === 1 ? "" : m.n === -1 ? "-" : String(m.n)) : "(" + fstr(m) + ")";
    var bs = b.n === 0 ? "" : (b.n > 0 ? " + " + fstr(b) : " − " + fstr({ n: -b.n, d: b.d }));
    return "y = " + ms + "x" + bs;
  }

  // ---------- 그림 ----------
  var X0 = 60, UX = 42, Y0 = 296, UY = 24;   // x 0..9, y 0..11
  function X(x) { return X0 + x * UX; }
  function Y(y) { return Y0 - y * UY; }
  function txt(x, y, s, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 12) + '" fill="' + (fill || COL.ink) + '"' + (extra || "") + '>' + s + '</text>';
  }
  function ltxt(x, y, s, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" fill="' + (fill || COL.ink) + '"' + (extra || "") + '>' + s + '</text>';
  }
  // 직선 (i, j) 를 x∈[0,9], y∈[0,11] 상자 안으로 잘라 그린다
  function clipLine(i, j) {
    var x1 = P[i][0], y1 = P[i][1], dx = P[j][0] - x1, dy = P[j][1] - y1, ts = [];
    function add(t) { var x = x1 + t * dx, y = y1 + t * dy; if (x >= -1e-9 && x <= 9 + 1e-9 && y >= -1e-9 && y <= 11 + 1e-9) ts.push(t); }
    add((0 - x1) / dx); add((9 - x1) / dx);
    if (dy !== 0) { add((0 - y1) / dy); add((11 - y1) / dy); }
    ts.sort(function (a, b) { return a - b; });
    var a = ts[0], b = ts[ts.length - 1];
    return [X(x1 + a * dx), Y(y1 + a * dy), X(x1 + b * dx), Y(y1 + b * dy)];
  }
  function plot(st) {
    var s = "";
    for (var gx = 0; gx <= 9; gx++) {
      s += '<line x1="' + X(gx) + '" y1="' + Y(0) + '" x2="' + X(gx) + '" y2="' + Y(11) + '" stroke="#eceef2"/>';
      s += txt(X(gx), Y(0) + 15, gx, 10, COL.muted);
    }
    for (var gy = 0; gy <= 11; gy++) {
      s += '<line x1="' + X(0) + '" y1="' + Y(gy) + '" x2="' + X(9) + '" y2="' + Y(gy) + '" stroke="#eceef2"/>';
      s += '<text x="' + (X(0) - 6) + '" y="' + (Y(gy) + 4) + '" text-anchor="end" font-size="10" fill="' + COL.muted + '">' + gy + '</text>';
    }
    s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(9) + '" y2="' + Y(0) + '" stroke="#667" stroke-width="1.3"/>';
    s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(0) + '" y2="' + Y(11) + '" stroke="#667" stroke-width="1.3"/>';
    (st.lines || []).forEach(function (L) {
      var c = clipLine(L.i, L.j);
      s += '<line x1="' + c[0] + '" y1="' + c[1] + '" x2="' + c[2] + '" y2="' + c[3] + '" stroke="' + L.color + '" stroke-width="' + (L.w || 2.5) + '"' + (L.dash ? ' stroke-dasharray="' + L.dash + '"' : "") + '/>';
      // 라벨: 잘린 선분의 70% 지점, 선 오른쪽 아래 (점 라벨과 겹치지 않게)
      var sx = c[0] + 0.7 * (c[2] - c[0]), sy = c[1] + 0.7 * (c[3] - c[1]);
      if (L.label) s += ltxt(sx + 10, sy + 16, L.label, 12, L.color, ' font-weight="700"');
    });
    if (st.pi !== null && st.pi !== undefined && st.pj !== null && st.pj !== undefined) {
      s += '<line x1="' + X(P[st.pi][0]) + '" y1="' + Y(P[st.pi][1]) + '" x2="' + X(P[st.pj][0]) + '" y2="' + Y(P[st.pj][1]) + '" stroke="' + COL.blue + '" stroke-width="1.6" stroke-dasharray="5 3"/>';
    }
    for (var k = 0; k < N; k++) {
      var cx = X(P[k][0]), cy = Y(P[k][1]);
      var fill = "#fff", stroke = COL.blue, sw = 2, r = 6, fg = COL.blue;
      var counted = st.counted && st.counted.indexOf(k) >= 0;
      if (st.green && st.green.indexOf(k) >= 0) { fill = COL.green; stroke = COL.green; fg = COL.green; }
      if (counted) { fill = st.countColor === COL.green ? COL.green : COL.redL; stroke = st.countColor; fg = st.countColor; sw = 2.5; }
      if (st.pj === k) { fill = COL.blue; stroke = COL.blue; r = 7; fg = COL.blue; }
      if (st.picked && st.picked.indexOf(k) >= 0) { fill = COL.or; stroke = COL.or; r = 8; fg = COL.or; }
      if (st.pi === k) { fill = COL.or; stroke = COL.or; r = 8; fg = COL.or; }
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
      if (counted) s += '<circle cx="' + cx + '" cy="' + cy + '" r="12" fill="none" stroke="' + st.countColor + '" stroke-width="1.5"/>';
      s += ltxt(cx + 10, cy - 8, nm(k) + " " + pt(k), 10.5, fg, ' font-weight="700" stroke="#fff" stroke-width="3" paint-order="stroke"');
    }
    return s;
  }
  function svgOpen(h) {
    return '<svg viewBox="0 0 760 ' + h + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
  }
  // 오른쪽 정보 패널 (x 482..750)
  function sidePanel(title, rows) {
    var s = '<rect x="482" y="20" width="268" height="' + (34 + rows.length * 22) + '" rx="8" fill="#f7f8fb" stroke="#d5d9e2"/>';
    s += ltxt(496, 42, title, 13, COL.pur, ' font-weight="700"');
    rows.forEach(function (r, k) { s += ltxt(496, 66 + k * 22, r[0], 12, r[1] || COL.ink, r[2] ? ' font-weight="700"' : ""); });
    return s;
  }
  // 기울기 상자 줄 (그림 아래)
  function slopeRow(y, label, items, hiFrom, hiTo, hiColor, curK) {
    var s = ltxt(8, y + 21, label, 12, COL.pur, ' font-weight="700"');
    var w = 84, gap = 6, x0 = 96;
    items.forEach(function (it, k) {
      var x = x0 + k * (w + gap), inRun = k >= hiFrom && k <= hiTo;
      var fill = "#fff", stroke = "#99a", sw = 1.2, fg = COL.ink;
      if (it.pending) { fill = "#f3f4f7"; fg = "#aaa"; }
      if (k === curK) { fill = COL.blueL; stroke = COL.blue; sw = 2.5; fg = COL.blue; }
      if (inRun) { fill = hiColor === COL.green ? COL.greenL : "#eef0f4"; stroke = hiColor; sw = 2.5; fg = hiColor; }
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="34" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
      s += txt(x + w / 2, y + 16, it.pending ? "?" : it.s, 13, fg, ' font-weight="700"');
      s += txt(x + w / 2, y + 29, nm(it.j), 9.5, it.pending ? "#aaa" : COL.muted);
    });
    if (hiFrom >= 0 && hiTo >= hiFrom) {
      var lx = x0 + hiFrom * (w + gap), rx = x0 + hiTo * (w + gap) + w;
      s += '<path d="M' + lx + ',' + (y + 40) + ' L' + lx + ',' + (y + 46) + ' L' + rx + ',' + (y + 46) + ' L' + rx + ',' + (y + 40) + '" fill="none" stroke="' + hiColor + '" stroke-width="2"/>';
      s += txt((lx + rx) / 2, y + 62, "같은 기울기 run 길이 " + (hiTo - hiFrom + 1) + " → 집합 크기 " + (hiTo - hiFrom + 2), 12, hiColor, ' font-weight="700"');
    }
    return s;
  }

  // 정렬된 목록에서 최장 equal run [시작, 끝]
  function longestRun(sorted) {
    var bs = 0, be = 0, s = 0;
    for (var k = 1; k <= sorted.length; k++) {
      if (k === sorted.length || !feq(sorted[k].f, sorted[s].f)) {
        if (k - 1 - s > be - bs) { bs = s; be = k - 1; }
        s = k;
      }
    }
    return [bs, be];
  }
  function listStr(items) { return "[" + items.map(function (it) { return it.s; }).join(", ") + "]"; }

  function buildA() {
    var steps = [];
    var vars = [
      { name: "i", group: "고정 점" }, { name: "j", group: "고정 점" },
      { name: "slope(P_i,P_j)", group: "기울기" }, { name: "slopes 목록", group: "기울기" }, { name: "정렬 결과", group: "기울기" }, { name: "최장 run", group: "기울기" },
      { name: "best 크기", group: "결과" }, { name: "best 집합", group: "결과" }
    ];
    var best = [0], cur = { i: "-", j: "-", sl: "-", list: "-", sorted: "-", run: "-" };
    var bestLine = null;
    function push(desc, line, svg, note) {
      var st = { desc: desc, pc: { P: line },
        vars: { "i": cur.i, "j": cur.j, "slope(P_i,P_j)": cur.sl, "slopes 목록": cur.list, "정렬 결과": cur.sorted, "최장 run": cur.run,
          "best 크기": best.length, "best 집합": setStr(best) },
        svg: svg };
      if (note) st.note = note;
      steps.push(st);
    }
    function frame(st, row, side) {
      if (bestLine && !st.noBest) st.lines = [bestLine].concat(st.lines || []);
      return svgOpen(400) + plot(st) + side + (row || "") + '</svg>';
    }
    push("n = 8 점. x 좌표가 모두 달라 기울기가 항상 정의된다(수직선 없음). `best = [P0]` 으로 시작.", 2,
      frame({}, "", sidePanel("입력", [["n = 8, x·y 좌표 모두 다름"], ["해싱 금지 → 정렬로 같은 값 묶기"], ["기울기 계산·비교 O(1)"]])));

    [0, 1].forEach(function (i) {
      var others = [];
      for (var j = 0; j < N; j++) if (j !== i) others.push({ j: j, f: slope(i, j), s: fstr(slope(i, j)) });
      cur.i = i + " → " + nm(i) + " " + pt(i); cur.j = "-"; cur.sl = "-"; cur.list = "-"; cur.sorted = "-"; cur.run = "-";
      var sideI = function (extra) {
        return sidePanel(nm(i) + " 를 지나는 직선 찾기", [["기울기가 같다 ⇔ " + nm(i) + " 와 한 직선"], ["기울기 n − 1 = 7 개"]].concat(extra || []));
      };
      var pend = others.map(function (o) { return { j: o.j, s: o.s, pending: true }; });
      if (i === 0) {
        push("i = 0: '''P0 = (1,2)''' 를 고정(주황). 나머지 7 점까지 기울기를 차례로 구한다 — 각 O(1).", 3,
          frame({ pi: i }, slopeRow(326, "slopes", pend, -1, -2, COL.muted, -1), sideI()));
        var shown = pend.slice();
        others.forEach(function (o, k) {
          shown[k] = { j: o.j, s: o.s };
          cur.j = o.j + " → " + nm(o.j) + " " + pt(o.j);
          cur.sl = "(" + P[o.j][1] + "−" + P[i][1] + ")/(" + P[o.j][0] + "−" + P[i][0] + ") = " + o.s;
          cur.list = listStr(shown.slice(0, k + 1));
          push("j = " + o.j + ": slope(P0, " + nm(o.j) + ") = (" + P[o.j][1] + " − " + P[i][1] + ") / (" + P[o.j][0] + " − " + P[i][0] + ") = '''" + o.s + "'''.", 4,
            frame({ pi: i, pj: o.j }, slopeRow(326, "slopes", shown.slice(), -1, -2, COL.muted, k), sideI()));
        });
      } else {
        cur.list = listStr(others);
        push("i = 1: '''P1 = (4,1)''' 고정. 7 개 기울기를 한 번에 구한다: " + listStr(others) + ".", 4,
          frame({ pi: i }, slopeRow(326, "slopes", others, -1, -2, COL.muted, -1), sideI()));
      }
      cur.j = "-"; cur.sl = "-";
      var sorted = others.slice().sort(function (a, b) { return fcmp(a.f, b.f); });
      cur.sorted = listStr(sorted);
      push("[[mergesort]] 로 기울기 정렬 → " + listStr(sorted) + ". 같은 기울기가 이제 '''연속'''으로 붙는다 — O(n log n). (해시로 묶는 대신 정렬)", 5,
        frame({ pi: i }, slopeRow(326, "정렬", sorted, -1, -2, COL.muted, -1), sideI()));
      var rr = longestRun(sorted), len = rr[1] - rr[0] + 1;
      var runIdx = sorted.slice(rr[0], rr[1] + 1).map(function (o) { return o.j; });
      var cand = [i].concat(runIdx);
      cur.run = "기울기 " + sorted[rr[0]].s + " × " + len + " → " + setStr(cand);
      var better = cand.length > best.length;
      var runColor = better ? COL.green : COL.muted;
      var candLine = { i: i, j: runIdx[0], color: runColor, dash: better ? null : "6 4", label: lineStr(i, runIdx[0]) };
      push("한 번 훑어 최장 equal run 을 찾는다(O(n)): 기울기 '''" + sorted[rr[0]].s + "''' 가 " + len + " 개 → " + nm(i) + " 포함 '''" + cand.length + " 점''' " + setStr(cand) + " 이 한 직선 " + lineStr(i, runIdx[0]) + " 위.", 6,
        frame({ pi: i, green: better ? cand : best, lines: [candLine], noBest: better }, slopeRow(326, "정렬", sorted, rr[0], rr[1], runColor, -1),
          sideI([["run " + len + " + 1 = " + cand.length + " 점", runColor, true]])));
      if (better) {
        best = cand; bestLine = { i: i, j: runIdx[0], color: COL.green, label: lineStr(i, runIdx[0]) };
        push("len(run) + 1 = " + cand.length + " > len(best) = 1 → '''best = " + setStr(best) + "''' (크기 " + best.length + ").", 8,
          frame({ pi: i, green: best }, slopeRow(326, "정렬", sorted, rr[0], rr[1], COL.green, -1),
            sideI([["best 갱신 → 크기 " + best.length, COL.green, true]])));
      } else {
        push("len(run) + 1 = " + cand.length + " > " + best.length + " ? '''아니오''' → best 유지 " + setStr(best) + ". " + setStr(cand) + " 도 collinear 지만 더 작다.", 7,
          frame({ pi: i, green: best, lines: [candLine] }, slopeRow(326, "정렬", sorted, rr[0], rr[1], COL.muted, -1),
            sideI([[cand.length + " ≤ " + best.length + " → best 유지", COL.muted, true]])));
      }
    });
    // 나머지 i 도 실제로 계산해 최댓값 확인
    var maxAll = 0;
    for (var ii = 0; ii < N; ii++) {
      var o2 = [];
      for (var jj = 0; jj < N; jj++) if (jj !== ii) o2.push({ j: jj, f: slope(ii, jj) });
      o2.sort(function (a, b) { return fcmp(a.f, b.f); });
      var r2 = longestRun(o2);
      maxAll = Math.max(maxAll, r2[1] - r2[0] + 2);
    }
    cur.i = "2..7"; cur.j = "-"; cur.sl = "-"; cur.list = "-"; cur.sorted = "-"; cur.run = "-";
    push("i = 2..7 도 같은 방식, 최대 " + maxAll + ". 최대 집합의 아무 점이 P_i 로 잡히는 순간 그 집합을 찾으므로 정답. 시간 n × (n + n log n) = '''O(n² log n)'''.", 9,
      frame({ green: best },
        ltxt(8, 350, "return best = " + setStr(best) + "  (크기 " + best.length + ", 직선 y = 2x)", 14, COL.green, ' font-weight="700"') +
        ltxt(8, 378, "시간: 점마다 기울기 O(n) + mergesort O(n log n) + run 훑기 O(n), 이것을 n 번 → O(n² log n)", 12, COL.muted),
        sidePanel("결과", [["max over i = " + maxAll, COL.green, true], ["P1 기준 최댓값은 3 {P1, P3, P7}"], ["해싱 금지 → 정렬이 핵심"]])),
      "n 번 × 정렬 O(n log n) = O(n² log n). 해시를 쓸 수 있으면 O(n²) 이지만 문제에서 금지.");
    return { panels: [{ id: "P", title: "(a) 한 점 고정 + 기울기 정렬 — O(n² log n)", lang: "c", lines: CODE.a }], vars: vars, steps: steps };
  }

  function buildB() {
    var steps = [];
    var vars = [
      { name: "시도", group: "시도" }, { name: "p, q", group: "시도" }, { name: "직선", group: "시도" }, { name: "직선 위 점 S", group: "시도" },
      { name: "|S|", group: "시도" }, { name: "n/k", group: "시도" }, { name: "판정", group: "시도" },
      { name: "성공 확률 q", group: "분석" }, { name: "1/k²", group: "분석" }, { name: "기대 시도 1/q", group: "분석" }, { name: "시도당 비용", group: "분석" },
      { name: "expected 시간", group: "분석" }, { name: "worst-case", group: "분석" }, { name: "분류", group: "분석" }
    ];
    var TR = [[1, 3], [0, 3], [2, 6]];   // 고정 난수열 (Math.random 사용 안 함)
    var SSTAR = [0, 2, 4, 6];
    var v = { t: "-", pq: "-", ln: "-", S: "-", c: "-", ok: "-" };
    var A = { q: "-", ik: "-", e: "-", per: "-", ex: "-", wc: "-", cls: "-" };
    var history = [];
    function push(desc, line, svg, note) {
      var st = { desc: desc, pc: { P: line },
        vars: { "시도": v.t, "p, q": v.pq, "직선": v.ln, "직선 위 점 S": v.S, "|S|": v.c, "n/k": NK + " (n = " + N + ", k = " + K + ")", "판정": v.ok,
          "성공 확률 q": A.q, "1/k²": A.ik, "기대 시도 1/q": A.e, "시도당 비용": A.per, "expected 시간": A.ex, "worst-case": A.wc, "분류": A.cls },
        svg: svg };
      if (note) st.note = note;
      steps.push(st);
    }
    function frame(st, trial) {
      var rows = [["목표 |S| = n/k = " + N + "/" + K + " = " + NK]];
      history.forEach(function (h) { rows.push(h); });
      return svgOpen(330) + plot(st) + sidePanel("시도 기록 (시도 " + trial + ")", rows) + '</svg>';
    }
    v.t = 0;
    push("최대 collinear 집합 S* 의 크기가 정확히 n/k = " + NK + " 임을 안다. 무작위로 두 점을 골라 직선을 만들고, O(n) 으로 직선 위 점을 센다. (재현을 위해 난수열 고정: (P1,P3) → (P0,P3) → (P2,P6))", 2,
      frame({}, 0));
    TR.forEach(function (pr, t) {
      var a = pr[0], b = pr[1], S = onLine(a, b), ok = S.length === NK;
      var col = ok ? COL.green : COL.red;
      var inS = function (x) { return SSTAR.indexOf(x) >= 0; };
      v.t = t + 1; v.pq = nm(a) + " " + pt(a) + ", " + nm(b) + " " + pt(b);
      v.ln = "-"; v.S = "-"; v.c = "-"; v.ok = "-";
      push("시도 " + (t + 1) + ": 랜덤 두 점 '''" + nm(a) + ", " + nm(b) + "''' (" + (inS(a) ? "S* 안" : "S* 밖") + " / " + (inS(b) ? "S* 안" : "S* 밖") + ").", 3,
        frame({ picked: [a, b] }, t + 1));
      v.ln = lineStr(a, b);
      push("두 점으로 직선 " + v.ln + " — O(1).", 4,
        frame({ picked: [a, b], lines: [{ i: a, j: b, color: col, label: v.ln }] }, t + 1));
      v.S = setStr(S); v.c = S.length;
      push("n = 8 점을 하나씩 대입해 직선 위인지 검사(O(n)): " + setStr(S) + " → '''|S| = " + S.length + "'''." +
        (S.length === 3 ? " (P1, P3, P7 은 y = x − 3 위의 3 점 — collinear 지만 크기가 n/k 가 아니다)" : ""), 5,
        frame({ picked: [a, b], counted: S, countColor: col, lines: [{ i: a, j: b, color: col, label: v.ln }] }, t + 1));
      v.ok = ok ? S.length + " == n/k → return" : S.length + " ≠ " + NK + " → 다시";
      history.push(["시도 " + (t + 1) + " (" + nm(a) + "," + nm(b) + "): |S| = " + S.length + (ok ? " = n/k ✓" : " ≠ " + NK + " ✗"), col, true]);
      if (ok) {
        push("|S| = " + S.length + " == n/k → '''return " + setStr(S) + "'''. 크기가 알려진 최댓값과 같을 때만 반환하므로 '''항상 정답'''.", 7,
          frame({ picked: [a, b], green: S, counted: S, countColor: COL.green, lines: [{ i: a, j: b, color: COL.green, label: v.ln }] }, t + 1));
      } else {
        push("|S| = " + S.length + " ≠ n/k = " + NK + " → 버리고 while 루프 다시.", 6,
          frame({ picked: [a, b], counted: S, countColor: COL.red, lines: [{ i: a, j: b, color: COL.red, label: v.ln, dash: "7 4" }] }, t + 1));
      }
    });
    var qn = NK * (NK - 1), qd = N * (N - 1), q = qn / qd;
    var q2 = Math.round(q * 100) / 100, e1 = Math.round(10 / q) / 10;
    A.q = "(n/k)(n/k−1)/(n(n−1)) = " + qn + "/" + qd + " = " + fstr(frac(qn, qd)) + " ≈ " + q2;
    A.ik = "1/" + (K * K) + " = " + (1 / (K * K));
    A.e = "1/q = " + fstr(frac(qd, qn)) + " ≈ " + e1 + " (≤ 2k² = " + (2 * K * K) + ")";
    A.per = "O(n) (직선 위 점 세기)";
    A.ex = "O(k²) × O(n) = O(k²n) = O(n)";
    A.wc = "∞ (난수가 최악이면 끝없이 빗나감)";
    A.cls = "Las Vegas (항상 정답, 시간이 random)";
    history.push(["q = " + qn + "/" + qd + " ≈ " + q2 + " ≈ 1/k² = 0.25", COL.pur, false]);
    history.push(["기대 시도 1/q ≈ " + e1 + " ≤ 2k² = " + (2 * K * K), COL.pur, false]);
    history.push(["시도당 O(n) → expected O(k²n) = O(n)", COL.pur, false]);
    history.push(["worst-case ∞ → Las Vegas", COL.red, true]);
    push("분석: 두 점이 모두 S* 안일 확률 q = (n/k)(n/k−1)/(n(n−1)) = " + qn + "/" + qd + " ≈ " + q2 + " ≈ 1/k² (n ≥ 2k−1 이면 q ≥ 1/(2k²)). 성공까지 시도 수는 [[기하분포]] → 기대 1/q ≤ 2k². 시도당 O(n) → [[expected running time]] '''O(k²n) = O(n)'''. [[randomized worst-case]]: 계속 빗나갈 확률 (1−q)^t > 0 → 상한 없음(∞). 항상 정답·시간만 random → [[Las Vegas와 Monte Carlo|Las Vegas]]. [[랜덤 majority]] 와 같은 틀.", 7,
      frame({ green: SSTAR, lines: [{ i: 0, j: 2, color: COL.green, label: "y = 2x" }] }, 3),
      "worst-case 는 입력이 아니라 randomness 가 최악인 경우로 정의한다 → 무한.");
    return { panels: [{ id: "P", title: "(b) 랜덤 두 점 — expected O(k²n)", lang: "c", lines: CODE.b }], vars: vars, steps: steps };
  }

  SIMS["collinear_points"] = {
    title: "최대 collinear 집합 — 기울기 정렬 vs 랜덤 두 점 (HW2 4번)",
    desc: "x·y 좌표가 모두 다른 n = 8 점, 최대 collinear 집합 = 직선 y = 2x 위 4 점. (a) 각 점을 고정하고 기울기를 [[mergesort]] 해 같은 기울기 run 을 찾는다(해싱 금지). (b) 크기 n/k 를 알 때 랜덤 두 점 → 직선 → O(n) 세기 → n/k 이면 반환: [[randomized algorithm]] · [[Las Vegas와 Monte Carlo]] · [[기하분포]] · [[expected running time]] · [[randomized worst-case]] — [[랜덤 majority]] 와 같은 틀.",
    options: [
      { key: "mode", label: "모드", values: [
        { value: "a", label: "(a) 한 점 고정 + 기울기 정렬 O(n² log n)" },
        { value: "b", label: "(b) 랜덤 두 점 expected O(k²n)" }
      ] }
    ],
    build: function (opts) {
      return ((opts && opts.mode) || "a") === "b" ? buildB() : buildA();
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
