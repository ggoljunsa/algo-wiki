window.SIMS = window.SIMS || {};
// close_pair_bucket — HW2 2번: 서로 다른 정수 A(1..M), 거리 T 이내 쌍이 있는가
//   (c) 폭 T 버킷 O(n) / (b) mergesort + 인접 O(n log n) / (a) 모든 쌍 O(n^2)
(function (global) {
  "use strict";

  var CODE = {
    c: [
      "def close_pair(A, T):",
      "    B = [None] * (M // T + 1)        # 폭 T 버킷",
      "    for x in A:",
      "        i = x // T",
      "        if B[i] is not None: return True   # 같은 버킷 → 거리 ≤ T-1",
      "        B[i] = x",
      "    for i in range(len(B) - 1):",
      "        if B[i] is not None and B[i+1] is not None and B[i+1] - B[i] <= T:",
      "            return True",
      "    return False"
    ],
    b: [
      "def close_pair_sort(A, T):",
      "    S = mergesort(A)                 # O(n log n)",
      "    for i in range(len(S) - 1):",
      "        if S[i+1] - S[i] <= T:       # 가까운 쌍은 정렬 후 반드시 이웃",
      "            return True",
      "    return False"
    ],
    a: [
      "def close_pair_all(A, T):",
      "    n = len(A)",
      "    for i in range(n):",
      "        for j in range(i + 1, n):",
      "            if abs(A[i] - A[j]) <= T:",
      "                return True",
      "    return False"
    ]
  };

  var DATA = {
    hw: { A: [10, 5, 15, 25, 20, 26, 5000, 500], T: 2, M: 5000 },
    nopair: { A: [3, 30, 11, 50, 22], T: 3, M: 50 },
    same: { A: [14, 9, 40, 15, 33], T: 4, M: 40 }
  };

  var COL = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222" };

  function rect(x, y, w, h, fill, stroke, sw) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (sw || 1.2) + '"/>';
  }
  function txt(x, y, s, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 12) + '" fill="' + (fill || COL.ink) + '"' + (extra || "") + '>' + s + '</text>';
  }
  function svgOpen(h) {
    return '<svg viewBox="0 0 760 ' + h + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
  }
  // 입력 배열 A 한 줄 (hot: 인덱스→색 역할)
  function arrayRow(A, y, label, hot) {
    var s = '<text x="8" y="' + (y + 20) + '" font-weight="700" font-size="13">' + label + '</text>';
    var w = Math.min(70, Math.floor(680 / A.length)) - 6;
    for (var k = 0; k < A.length; k++) {
      var x = 60 + k * (w + 6), role = hot[k];
      var fill = "#fff", stroke = "#667", sw = 1.2, fg = COL.ink;
      if (role === "cur") { fill = COL.orL; stroke = COL.or; sw = 3; }
      else if (role === "cur2") { fill = COL.blueL; stroke = COL.blue; sw = 3; }
      else if (role === "done") { fill = "#eef0f4"; fg = COL.muted; }
      else if (role === "hit") { fill = COL.redL; stroke = COL.red; sw = 3; fg = COL.red; }
      s += rect(x, y, w, 30, fill, stroke, sw) + txt(x + w / 2, y + 20, A[k], 13, fg, role === "hit" ? ' font-weight="700"' : "");
      s += txt(x + w / 2, y + 44, k, 10, COL.muted);
    }
    return s;
  }

  // 화면에 그릴 버킷 슬롯: 비어 있지 않은(을) 인덱스 + 그 사이 공백 2칸 이하면 빈 버킷, 더 길면 "…"
  function slotsFor(idxs, nB) {
    var u = idxs.slice().sort(function (p, q) { return p - q; }).filter(function (v, k, arr) { return k === 0 || arr[k - 1] !== v; });
    var out = [], prev = -1;
    u.forEach(function (v) {
      var gap = v - prev - 1;
      if (gap > 0 && gap <= 2) for (var g = prev + 1; g < v; g++) out.push({ idx: g });
      else if (gap > 2) out.push({ ell: true });
      out.push({ idx: v });
      prev = v;
    });
    if (prev < nB - 1) {
      if (nB - 1 - prev <= 1) out.push({ idx: prev + 1 }); else { out.push({ idx: prev + 1 }); out.push({ ell: true }); }
    }
    return out;
  }

  function bucketSvg(c, st) {
    var T = c.T, s = svgOpen(330);
    var hot = {};
    for (var k = 0; k < c.A.length; k++) {
      if (st.placed > k) hot[k] = "done";
    }
    if (st.k !== null) hot[st.k] = "cur";
    (st.hitK || []).forEach(function (q) { hot[q] = "hit"; });
    s += arrayRow(c.A, 8, "A", hot);
    s += txt(700, 70, "T = " + T + ", M = " + c.M, 12, COL.muted);
    var nE = 0, nS = 0;
    st.slots.forEach(function (sl) { if (sl.ell) nE++; else nS++; });
    var EW = 22, sw = Math.min(70, Math.floor((744 - nE * EW) / nS)), bw = sw - 4;
    var x = 8, pos = {};
    var y0 = 120;
    s += '<text x="8" y="' + (y0 - 14) + '" font-weight="700" font-size="13" fill="' + COL.pur + '">버킷 B (폭 T = ' + T + ', index = ⌊x/T⌋)</text>';
    st.slots.forEach(function (sl) {
      if (sl.ell) {
        s += txt(x + EW / 2, y0 + 34, "…", 16, COL.muted);
        x += EW;
        return;
      }
      var i = sl.idx, v = st.B[i];
      var fill = COL.purL, stroke = COL.pur, swd = 1.4;
      if (st.cur === i) { fill = COL.orL; stroke = COL.or; swd = 3; }
      if (st.hitB && st.hitB.indexOf(i) >= 0) { fill = COL.redL; stroke = COL.red; swd = 3; }
      pos[i] = x;
      s += rect(x, y0, bw, 56, fill, stroke, swd);
      if (v !== null && v !== undefined) {
        var hitV = st.hitB && st.hitB.indexOf(i) >= 0;
        s += txt(x + bw / 2, y0 + 34, v, bw < 40 ? 11 : 13, hitV ? COL.red : COL.blue, ' font-weight="700"');
      }
      s += txt(x + bw / 2, y0 + 74, i, 11, COL.pur, ' font-weight="700"');
      s += txt(x + bw / 2, y0 + 88, (i * T) + "–" + (i * T + T - 1), 9, COL.muted);
      x += sw;
    });
    // 같은 버킷 충돌: 들어오려는 x 를 버킷 위에 빨간 칸으로
    if (st.collide !== null && pos[st.cur] !== undefined) {
      var cx = pos[st.cur];
      s += rect(cx, y0 - 2 - 30 + 0, bw, 26, COL.redL, COL.red, 2.5) + txt(cx + bw / 2, y0 - 12, st.collide, 12, COL.red, ' font-weight="700"');
    }
    // 인접 검사 괄호
    if (st.pair && pos[st.pair[0]] !== undefined && pos[st.pair[1]] !== undefined) {
      var lx = pos[st.pair[0]] - 3, rx = pos[st.pair[1]] + bw + 3, by = y0 + 98;
      var pc = st.pairHit ? COL.red : COL.or;
      s += '<rect x="' + lx + '" y="' + (y0 - 5) + '" width="' + (rx - lx) + '" height="66" rx="6" fill="none" stroke="' + pc + '" stroke-width="2.5" stroke-dasharray="' + (st.pairHit ? "0" : "6 3") + '"/>';
      s += '<path d="M' + lx + ',' + by + ' L' + lx + ',' + (by + 8) + ' L' + rx + ',' + (by + 8) + ' L' + rx + ',' + by + '" fill="none" stroke="' + pc + '" stroke-width="2"/>';
      s += txt((lx + rx) / 2, by + 24, st.pairText, 12, pc, ' font-weight="700"');
    } else if (st.pair && pos[st.pair[0]] !== undefined) {
      var ex = pos[st.pair[0]];
      s += '<rect x="' + (ex - 3) + '" y="' + (y0 - 5) + '" width="' + (bw + 6) + '" height="66" rx="6" fill="none" stroke="' + COL.or + '" stroke-width="2.5" stroke-dasharray="6 3"/>';
      s += txt(ex + bw / 2, y0 + 122, st.pairText, 11, COL.muted);
    }
    s += '<text x="8" y="300" font-size="13" font-weight="700" fill="' + (st.result === "True" ? COL.red : st.result === "False" ? COL.green : COL.muted) + '">' +
      (st.result ? "return " + st.result : "진행 중") + '</text>';
    s += '<text x="140" y="300" font-size="12" fill="' + COL.muted + '">연산 수 ' + st.ops + '  (버킷 삽입 ' + st.ins + ' + 인접 검사 ' + st.adj + ')</text>';
    s += '<text x="8" y="322" font-size="11" fill="' + COL.muted + '">같은 칸 → 거리 ≤ T−1 (비둘기집) · 칸 i 와 i+2 → 거리 ≥ T+1 이라 볼 필요 없음 · 이웃 칸 i, i+1 만 확인</text>';
    s += "</svg>";
    return s;
  }

  function sortSvg(c, S, st) {
    var s = svgOpen(250);
    s += arrayRow(c.A, 8, "A", {});
    s += '<text x="8" y="92" font-size="12" fill="' + COL.muted + '">mergesort ↓  (비교 ' + st.sortOps + ' 회)</text>';
    var hot = {};
    for (var k = 0; k < S.length; k++) hot[k] = "done";
    if (st.i !== null) {
      if (st.hit) { hot[st.i] = "hit"; hot[st.i + 1] = "hit"; } else { hot[st.i] = "cur"; hot[st.i + 1] = "cur"; }
    }
    if (st.i === null) hot = {};
    s += arrayRow(S, 104, "S", hot);
    if (st.i !== null) {
      var w = Math.min(70, Math.floor(680 / S.length)) - 6;
      var lx = 60 + st.i * (w + 6), rx = 60 + (st.i + 1) * (w + 6) + w;
      var pc = st.hit ? COL.red : COL.or;
      s += '<path d="M' + lx + ',160 L' + lx + ',168 L' + rx + ',168 L' + rx + ',160" fill="none" stroke="' + pc + '" stroke-width="2"/>';
      s += txt((lx + rx) / 2, 186, "S[" + (st.i + 1) + "] − S[" + st.i + "] = " + (S[st.i + 1] - S[st.i]) + (st.hit ? " ≤ " : " &gt; ") + c.T, 12, pc, ' font-weight="700"');
    }
    s += '<text x="8" y="226" font-size="13" font-weight="700" fill="' + (st.result === "True" ? COL.red : st.result === "False" ? COL.green : COL.muted) + '">' +
      (st.result ? "return " + st.result : "진행 중") + '</text>';
    s += '<text x="140" y="226" font-size="12" fill="' + COL.muted + '">연산 수 ' + st.ops + '  (mergesort 비교 ' + st.sortOps + ' + 인접 비교 ' + st.adj + ')</text>';
    s += "</svg>";
    return s;
  }

  function allSvg(c, st) {
    var n = c.A.length, s = svgOpen(330);
    var hot = {};
    if (st.i !== null) { hot[st.i] = st.hit ? "hit" : "cur"; hot[st.j] = st.hit ? "hit" : "cur2"; }
    s += arrayRow(c.A, 8, "A", hot);
    // 상삼각 쌍 격자
    var cell = Math.min(26, Math.floor(210 / n)), gx = 120, gy = 90;
    s += '<text x="8" y="' + (gy + 12) + '" font-size="12" font-weight="700">쌍 (i, j)</text>';
    s += '<text x="8" y="' + (gy + 28) + '" font-size="11" fill="' + COL.muted + '">C(n,2) = ' + (n * (n - 1) / 2) + ' 칸</text>';
    for (var j = 0; j < n; j++) s += txt(gx + j * cell + cell / 2, gy - 4, j, 10, COL.muted);
    for (var i = 0; i < n; i++) {
      s += txt(gx - 10, gy + i * cell + cell / 2 + 4, i, 10, COL.muted);
      for (j = i + 1; j < n; j++) {
        var key = i + "," + j, fill = "#fff", stroke = "#bbb";
        if (st.seen[key]) fill = "#e3e6ec";
        if (st.i === i && st.j === j) { fill = st.hit ? COL.red : COL.or; stroke = fill; }
        s += '<rect x="' + (gx + j * cell + 1) + '" y="' + (gy + i * cell + 1) + '" width="' + (cell - 2) + '" height="' + (cell - 2) + '" fill="' + fill + '" stroke="' + stroke + '"/>';
      }
    }
    if (st.i !== null) {
      var d = Math.abs(c.A[st.i] - c.A[st.j]);
      s += txt(560, 160, "|A[" + st.i + "] − A[" + st.j + "]| = |" + c.A[st.i] + " − " + c.A[st.j] + "| = " + d, 13, st.hit ? COL.red : COL.or, ' font-weight="700"');
      s += txt(560, 182, d + (st.hit ? " ≤ " : " &gt; ") + c.T, 13, st.hit ? COL.red : COL.muted);
    }
    s += '<text x="8" y="310" font-size="13" font-weight="700" fill="' + (st.result === "True" ? COL.red : st.result === "False" ? COL.green : COL.muted) + '">' +
      (st.result ? "return " + st.result : "진행 중") + '</text>';
    s += '<text x="140" y="310" font-size="12" fill="' + COL.muted + '">연산 수(비교) ' + st.ops + ' / 최악 C(n,2) = ' + (n * (n - 1) / 2) + '</text>';
    s += "</svg>";
    return s;
  }

  function mergesortCount(arr) {
    var cnt = 0;
    function ms(a) {
      if (a.length <= 1) return a.slice();
      var m = Math.floor(a.length / 2), L = ms(a.slice(0, m)), R = ms(a.slice(m)), out = [], l = 0, r = 0;
      while (l < L.length && r < R.length) { cnt++; if (L[l] <= R[r]) out.push(L[l++]); else out.push(R[r++]); }
      return out.concat(L.slice(l), R.slice(r));
    }
    var S = ms(arr);
    return { S: S, cnt: cnt };
  }

  global.SIMS["close_pair_bucket"] = {
    title: "거리 T 이내 쌍 찾기 — 폭 T 버킷으로 O(n) (HW2 2번)",
    desc: "서로 다른 정수 A(값 1..M, M 고정)에서 거리 ≤ T 인 쌍이 있는가. (c) 폭 T [[bucket sort|버킷]]에 넣다가 같은 칸이면 즉시 True([[비둘기집 원리]]: 같은 칸 → 거리 ≤ T−1), " +
      "다 넣은 뒤 이웃 칸 i, i+1 만 확인 → O(n). (b) 정렬 후 인접 O(n log n), (a) 모든 쌍 O(n²) 과 '''연산 수'''를 비교해 볼 것. [[HW2 복기]]",
    options: [
      { key: "mode", label: "방법", values: [
        { value: "c", label: "(c) 폭 T 버킷 O(n)" },
        { value: "b", label: "(b) 정렬 + 인접 O(n log n)" },
        { value: "a", label: "(a) 모든 쌍 O(n²)" }
      ] },
      { key: "data", label: "입력", values: [
        { value: "hw", label: "과제 예제 A=[10,5,15,25,20,26,5000,500], T=2" },
        { value: "nopair", label: "쌍 없음 [3,30,11,50,22], T=3" },
        { value: "same", label: "같은 버킷 [14,9,40,15,33], T=4" }
      ] }
    ],
    build: function (opts) {
      var mode = CODE[opts.mode] ? opts.mode : "c";
      var c = DATA[opts.data] || DATA.hw;
      var A = c.A, T = c.T, n = A.length;
      var steps = [];
      var vars = [
        { name: "x", group: "현재" }, { name: "i", group: "현재" },
        { name: "B", label: mode === "c" ? "B (비어 있지 않은 버킷 idx:값)" : mode === "b" ? "S (정렬된 A)" : "A", group: "상태" },
        { name: "checked_pairs", label: "차를 계산한 쌍", group: "상태" },
        { name: "comparisons", label: "연산 수", group: "비용" },
        { name: "bound", label: "최악 연산 수", group: "비용" },
        { name: "result", group: "결과" }
      ];
      if (mode === "a") vars.splice(2, 0, { name: "j", group: "현재" });
      var pairs = [];

      if (mode === "c") {
        var nB = Math.floor(c.M / T) + 1, B = {}, ins = 0, adj = 0;
        var idxs = A.map(function (v) { return Math.floor(v / T); });
        var slots = slotsFor(idxs, nB);
        var st = { k: null, placed: 0, cur: null, collide: null, hitB: null, hitK: null, pair: null, pairHit: false, pairText: "", result: null, ops: 0, ins: 0, adj: 0 };
        var bstr = function () {
          var ks = Object.keys(B).map(Number).sort(function (p, q) { return p - q; });
          return ks.length ? ks.map(function (k) { return k + ":" + B[k]; }).join("  ") : "(모두 None)";
        };
        var push = function (desc, line, xv, iv, note) {
          st.ops = ins + adj; st.ins = ins; st.adj = adj;
          var copy = JSON.parse(JSON.stringify(st)); copy.B = JSON.parse(JSON.stringify(B)); copy.slots = slots;
          steps.push({ desc: desc, pc: { P: line }, note: note,
            vars: { x: xv, i: iv, B: bstr(), checked_pairs: pairs.length ? pairs.join(" ") : "-", comparisons: ins + adj,
              bound: "n + ⌈M/T⌉ = " + n + " + " + nB + " (M 고정 → O(n))", result: st.result || "-" },
            svg: bucketSvg(c, copy) });
        };
        push("버킷 배열 `B = [None] * (M // T + 1)` — M = " + c.M + ", T = " + T + " → 버킷 " + nB + " 개. 버킷 i 는 값 [iT, iT+T−1] 을 받는다. M 이 고정 상수이므로 버킷 수도 상수다.", 2, "-", "-");
        var done = false;
        for (var k = 0; k < n && !done; k++) {
          var x = A[k], i = Math.floor(x / T);
          st.k = k; st.cur = i; st.pair = null;
          push("x = " + x + " → `i = x // T` = " + x + " // " + T + " = '''" + i + "'''.", 4, x, i);
          ins++;
          if (B[i] !== undefined) {
            st.collide = x; st.hitB = [i]; st.hitK = [A.indexOf(B[i]), k]; st.result = "True";
            pairs.push("(" + B[i] + "," + x + ")");
            push("B[" + i + "] 에 이미 '''" + B[i] + "''' 가 있다 → 같은 버킷 → |" + x + " − " + B[i] + "| = " + Math.abs(x - B[i]) + " ≤ T−1 = " + (T - 1) + ". '''즉시 return True'''. 나머지 원소는 보지도 않는다.", 5, x, i,
              "같은 버킷 = 같은 폭 T 칸 → 두 수의 차는 최대 T−1 (비둘기집 원리). 인접 검사까지 갈 필요가 없다.");
            done = true;
            break;
          }
          B[i] = x; st.placed = k + 1;
          push("B[" + i + "] 는 비어 있다 → `B[" + i + "] = " + x + "`. (지금까지 모든 버킷에 원소 ≤ 1 개)", 6, x, i);
        }
        if (!done) {
          st.k = null; st.cur = null;
          var ks = Object.keys(B).map(Number).sort(function (p, q) { return p - q; });
          push("삽입 끝: 같은 버킷에 둘이 든 적이 없다 → 각 버킷 ≤ 1 개. 이제 '''이웃 버킷 i, i+1''' 만 본다(버킷 i 와 i+2 의 두 수는 차 ≥ T+1). 빈 버킷 B[i] 는 조건의 첫 항에서 바로 넘어가므로, 비어 있지 않은 버킷만 따라간다.", 7, "-", "-");
          for (var q = 0; q < ks.length && !done; q++) {
            var bi = ks[q];
            if (bi >= nB - 1) break;
            adj++;
            if (B[bi + 1] !== undefined) {
              var d = B[bi + 1] - B[bi];
              pairs.push("(" + B[bi] + "," + B[bi + 1] + ")");
              st.pair = [bi, bi + 1];
              st.pairHit = d <= T;
              st.pairText = B[bi + 1] + " − " + B[bi] + " = " + d + (d <= T ? " ≤ " : " &gt; ") + T;
              if (d <= T) {
                st.hitB = [bi, bi + 1]; st.hitK = [A.indexOf(B[bi]), A.indexOf(B[bi + 1])]; st.result = "True";
                push("i = " + bi + ": B[" + bi + "] = " + B[bi] + ", B[" + (bi + 1) + "] = " + B[bi + 1] + " 둘 다 있다 → 차 " + d + " ≤ T = " + T + " → '''return True''' (" + B[bi] + ", " + B[bi + 1] + ").", 9, B[bi + 1], bi);
                done = true;
              } else {
                push("i = " + bi + ": 이웃 B[" + (bi + 1) + "] = " + B[bi + 1] + " → 차 " + d + " > T = " + T + " → 다음.", 8, B[bi + 1], bi);
              }
            } else {
              st.pair = [bi, bi + 1]; st.pairHit = false; st.pairText = "B[" + (bi + 1) + "] = None";
              push("i = " + bi + ": B[" + bi + "] = " + B[bi] + " 이지만 이웃 B[" + (bi + 1) + "] 가 비어 있다 → 넘어감.", 8, B[bi], bi);
            }
          }
          if (!done) {
            st.pair = null; st.result = "False";
            push("모든 이웃 쌍을 봤지만 차 ≤ T 인 것이 없다 → '''return False'''. 같은 칸도 이웃 칸도 아니면 거리 ≥ T+1 이므로 이것으로 충분하다.", 10, "-", "-");
          }
        }
        steps[steps.length - 1].note = steps[steps.length - 1].note ||
          "연산 수 = 버킷 삽입 " + ins + " + 인접 검사 " + adj + " = " + (ins + adj) + ". 실제 for 루프는 ⌈M/T⌉ 번 돌지만 M 이 고정 상수라 O(1)·(n 과 무관) → 전체 O(n).";
      } else if (mode === "b") {
        var ms = mergesortCount(A), S = ms.S, adjB = 0;
        var sb = { i: null, hit: false, result: null, ops: 0, sortOps: ms.cnt, adj: 0 };
        var pushB = function (desc, line, xv, iv, note) {
          sb.ops = ms.cnt + adjB; sb.adj = adjB;
          steps.push({ desc: desc, pc: { P: line }, note: note,
            vars: { x: xv, i: iv, B: "[" + S.join(", ") + "]", checked_pairs: pairs.length ? pairs.join(" ") : "-", comparisons: sb.ops,
              bound: "n log n + (n−1) ≈ " + Math.round(n * Math.log2(n)) + " + " + (n - 1), result: sb.result || "-" },
            svg: sortSvg(c, S, JSON.parse(JSON.stringify(sb))) });
        };
        pushB("`S = mergesort(A)` → [" + S.join(", ") + "]. mergesort 의 원소 비교 '''" + ms.cnt + "''' 회 (O(n log n)). 정렬하면 가까운 두 수는 반드시 '''이웃'''이 된다.", 2, "-", "-");
        var hitB = false;
        for (var p = 0; p < n - 1; p++) {
          adjB++;
          var dd = S[p + 1] - S[p];
          pairs.push("(" + S[p] + "," + S[p + 1] + ")");
          sb.i = p; sb.hit = dd <= T;
          if (dd <= T) {
            sb.result = "True";
            pushB("i = " + p + ": S[" + (p + 1) + "] − S[" + p + "] = " + S[p + 1] + " − " + S[p] + " = " + dd + " ≤ " + T + " → '''return True'''.", 5, S[p + 1], p);
            hitB = true; break;
          }
          pushB("i = " + p + ": S[" + (p + 1) + "] − S[" + p + "] = " + dd + " > " + T + " → 다음 이웃.", 4, S[p + 1], p);
        }
        if (!hitB) { sb.i = null; sb.result = "False"; pushB("이웃 " + (n - 1) + " 쌍 모두 차 > T → '''return False'''.", 6, "-", "-"); }
        steps[steps.length - 1].note = "연산 수 = mergesort " + ms.cnt + " + 인접 비교 " + adjB + " = " + (ms.cnt + adjB) + ". 정렬이 Ω(n log n) 이라 (c) 의 O(n) 보다 느리다.";
      } else {
        var seen = {}, opsA = 0, sa = { i: null, j: null, hit: false, result: null, ops: 0, seen: seen };
        var pushA = function (desc, line, note) {
          sa.ops = opsA;
          steps.push({ desc: desc, pc: { P: line }, note: note,
            vars: { x: sa.i === null ? "-" : A[sa.i] + ", " + A[sa.j], i: sa.i === null ? "-" : sa.i, j: sa.j === null ? "-" : sa.j, B: "[" + A.join(", ") + "]",
              checked_pairs: opsA + " 쌍", comparisons: opsA, bound: "C(n,2) = " + (n * (n - 1) / 2), result: sa.result || "-" },
            svg: allSvg(c, JSON.parse(JSON.stringify(sa))) });
        };
        pushA("n = " + n + ". 모든 쌍 (i, j), i < j 를 차례로 본다 — 최악 C(n,2) = " + (n * (n - 1) / 2) + " 번.", 2);
        var hitA = false;
        for (var ii = 0; ii < n && !hitA; ii++) {
          for (var jj = ii + 1; jj < n; jj++) {
            opsA++;
            sa.i = ii; sa.j = jj;
            var da = Math.abs(A[ii] - A[jj]);
            if (da <= T) {
              sa.hit = true; sa.result = "True";
              pushA("i = " + ii + ", j = " + jj + ": |" + A[ii] + " − " + A[jj] + "| = " + da + " ≤ " + T + " → '''return True''' (" + Math.min(A[ii], A[jj]) + ", " + Math.max(A[ii], A[jj]) + ").", 6);
              hitA = true; break;
            }
            pushA("i = " + ii + ", j = " + jj + ": |" + A[ii] + " − " + A[jj] + "| = " + da + " > " + T + ".", 5);
            seen[ii + "," + jj] = true;
          }
        }
        if (!hitA) { sa.i = null; sa.j = null; sa.result = "False"; pushA("C(n,2) = " + opsA + " 쌍을 전부 봤지만 없다 → '''return False'''.", 7); }
        steps[steps.length - 1].note = "연산 수(쌍 비교) = " + opsA + " / 최악 C(n,2) = " + (n * (n - 1) / 2) + " → Θ(n²).";
      }

      return {
        panels: [{ id: "P", title: mode === "c" ? "(c) 폭 T 버킷 — O(n)" : mode === "b" ? "(b) 정렬 + 인접 — O(n log n)" : "(a) 모든 쌍 — O(n²)", lang: "c", lines: CODE[mode] }],
        vars: vars,
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
