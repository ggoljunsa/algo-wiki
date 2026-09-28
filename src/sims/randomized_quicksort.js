window.SIMS = window.SIMS || {};
// randomized_quicksort — L6 p.11–17 (PNG 10–16), p.23–29, p.32–41: 피벗 규칙을 고정해 비교 횟수와 X_{a,b} 를 센다
(function (global) {
  "use strict";

  var CODE = [
    "def randomized_quicksort(A):",
    "  if len(A) <= 1:",
    "    return",
    "  pivot = random.choice(A)",
    "  left, right = partition_about_pivot(A, pivot)",
    "  quicksort(left)",
    "  quicksort(right)"
  ];

  var SLIDE_A = [0, 11, 7, 4, 8, 3, 2, 9, 6, 10, 5, 1];
  var SORTED_A = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var N = 12;

  var RULES = {
    slide: { label: "슬라이드: 첫 호출 5, 이후 부분리스트 첫 원소", input: SLIDE_A },
    first: { label: "항상 첫 원소", input: SLIDE_A },
    median: { label: "매번 median (짝수 길이는 아래쪽)", input: SLIDE_A },
    sorted_first: { label: "정렬된 입력 [0..11] + 첫 원소 (worst)", input: SORTED_A }
  };

  function choosePivot(rule, A, top) {
    if (rule === "slide" && top) return 5;
    if (rule === "median") {
      var s = A.slice().sort(function (a, b) { return a - b; });
      return s[Math.floor((s.length - 1) / 2)];
    }
    return A[0];
  }

  // 기대 비교 횟수 sum_{a<b} 2/(b-a+1), n = 12
  function expected() {
    var e = 0;
    for (var a = 0; a < N; a++) for (var b = a + 1; b < N; b++) e += 2 / (b - a + 1);
    return e;
  }

  function svgFor(v) {
    var s = '<svg viewBox="0 0 760 300" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    // 전체 배열 (분할이 반영된 위치)
    s += '<text x="10" y="14" font-size="11" fill="#555">배열 (분할 결과가 제자리에 반영됨)</text>';
    for (var i = 0; i < N; i++) {
      var x = 10 + i * 44, val = v.arr[i];
      var inSeg = v.seg && i >= v.seg[0] && i < v.seg[1];
      var fill = v.fixed[val] ? "#dff3e4" : (val === v.pivot && inSeg ? "#e09a40" : "#fff");
      s += '<rect x="' + x + '" y="22" width="40" height="34" rx="3" fill="' + fill + '" stroke="' + (inSeg ? "#d6465f" : "#8a93a8") +
        '" stroke-width="' + (inSeg ? 2.5 : 1.2) + '"/>';
      s += '<text x="' + (x + 20) + '" y="44" text-anchor="middle" font-size="15"' + (val === v.pivot && inSeg ? ' font-weight="700"' : "") + ">" + val + "</text>";
    }
    s += '<rect x="10" y="66" width="12" height="12" fill="#e09a40"/><text x="26" y="76" font-size="10">pivot</text>';
    s += '<rect x="70" y="66" width="12" height="12" fill="#fff" stroke="#d6465f" stroke-width="2"/><text x="86" y="76" font-size="10">현재 호출 구간</text>';
    s += '<rect x="170" y="66" width="12" height="12" fill="#dff3e4"/><text x="186" y="76" font-size="10">자리 확정</text>';
    // 호출 기록
    s += '<text x="10" y="102" font-size="11" fill="#555">호출 기록 (최근 8 개)</text>';
    var log = v.log.slice(-8);
    for (var t = 0; t < log.length; t++) {
      s += '<text x="10" y="' + (120 + t * 18) + '" font-family="monospace" font-size="11"' + (t === log.length - 1 ? ' fill="#d6465f"' : ' fill="#333"') + ">" + log[t] + "</text>";
    }
    // X_{a,b} 행렬 (a 행 < b 열)
    var mx = 548, my = 104, c = 16;
    s += '<text x="' + mx + '" y="' + (my - 22) + '" font-size="11" fill="#555">X_{a,b} (a 행, b 열) 빨강 = 1</text>';
    for (var k = 0; k < N; k++) {
      s += '<text x="' + (mx + k * c + 8) + '" y="' + (my - 4) + '" text-anchor="middle" font-size="8" fill="#777">' + k + "</text>";
      s += '<text x="' + (mx - 4) + '" y="' + (my + k * c + 11) + '" text-anchor="end" font-size="8" fill="#777">' + k + "</text>";
    }
    for (var a = 0; a < N; a++) {
      for (var b = 0; b < N; b++) {
        var cx = mx + b * c, cy = my + a * c;
        if (b <= a) { s += '<rect x="' + cx + '" y="' + cy + '" width="' + c + '" height="' + c + '" fill="#eceef2"/>'; continue; }
        var on = v.X[a][b];
        var special = (a === 3 && b === 5) || (a === 4 && b === 6);
        s += '<rect x="' + cx + '" y="' + cy + '" width="' + c + '" height="' + c + '" fill="' + (on ? "#d6465f" : "#fff") + '" stroke="' +
          (special ? "#1f3b73" : "#d0d4dc") + '" stroke-width="' + (special ? 2 : 0.6) + '"/>';
      }
    }
    s += "</svg>";
    return s;
  }

  global.SIMS["randomized_quicksort"] = {
    title: "randomized quicksort — 비교 횟수와 X_{a,b}",
    desc: "L6 p.11–41. [[quicksort]] 는 피벗을 고르고 나머지 전부를 피벗과 한 번씩 비교해 left/right 로 나눈 뒤 양쪽을 재귀한다. " +
      "난수 대신 '''피벗 규칙을 옵션으로 고정'''해 [[비교 횟수 세기|비교 횟수]]를 세고, 비교된 쌍마다 [[X_{a,b}]] = 1 을 표시한다. " +
      "마지막 step 에서 규칙별 결과를 랜덤 피벗의 기대값 Σ 2/(b−a+1) ≈ 32.68 과 비교한다.",
    options: [
      { key: "rule", label: "피벗 규칙", values: Object.keys(RULES).map(function (k) { return { value: k, label: RULES[k].label }; }) }
    ],
    build: function (opts) {
      var rule = RULES[opts.rule] ? opts.rule : "slide";
      var arr = RULES[rule].input.slice();
      var X = [];
      for (var a = 0; a < N; a++) { X.push([]); for (var b = 0; b < N; b++) X[a].push(0); }
      var fixed = {};
      var total = 0, calls = 0;
      var log = [];
      var steps = [];
      var cur = { seg: null, pivot: null, sub: "-", left: "-", right: "-", thisCmp: "-", depth: "-" };

      function countX() {
        var c = 0;
        for (var a = 0; a < N; a++) for (var b = a + 1; b < N; b++) c += X[a][b];
        return c;
      }
      function snap() {
        return {
          "피벗 규칙": RULES[rule].label, A: cur.sub, depth: cur.depth,
          pivot: cur.pivot === null ? "-" : cur.pivot, left: cur.left, right: cur.right,
          "이번 호출 비교": cur.thisCmp, "비교 누적": total, "X=1 인 쌍 수": countX(),
          "X_{3,5}": X[3][5], "X_{4,6}": X[4][6], "호출 수": calls
        };
      }
      function push(desc, pc, note) {
        var vis = {
          arr: arr.slice(), seg: cur.seg ? cur.seg.slice() : null, pivot: cur.pivot,
          fixed: Object.assign({}, fixed), log: log.slice(),
          X: X.map(function (r) { return r.slice(); })
        };
        steps.push({ desc: desc, pc: { Q: pc }, vars: snap(), note: note, svg: svgFor(vis) });
      }

      function rec(lo, hi, depth, top) {
        var A = arr.slice(lo, hi);
        if (A.length === 0) return;
        calls += 1;
        cur = { seg: [lo, hi], pivot: null, sub: A.slice(), left: "-", right: "-", thisCmp: 0, depth: depth };
        if (A.length === 1) {
          fixed[A[0]] = true;
          log.push(new Array(depth + 1).join("  ") + "[" + A[0] + "] → 원소 1 개, 비교 0");
          push("부분리스트 [" + A[0] + "] 는 원소가 1 개 → `return`. 비교 0 회, 자리 확정.", 3);
          return;
        }
        var p = choosePivot(rule, A, top);
        cur.pivot = p;
        var why = rule === "slide" ? (top ? "슬라이드 p.12 가 고른(chosen) 피벗 5" : "부분리스트의 첫 원소 A[0]")
          : rule === "median" ? "부분리스트의 median" : "첫 원소 A[0]";
        push("depth " + depth + ": A = [" + A.join(", ") + "] 에서 pivot = '''" + p + "''' (" + why + ").", 4);
        var L = A.filter(function (x) { return x < p; });
        var R = A.filter(function (x) { return x > p; });
        A.forEach(function (x) {
          if (x === p) return;
          var s = Math.min(x, p), t = Math.max(x, p);
          X[s][t] = 1;
        });
        cur.thisCmp = A.length - 1;
        total += A.length - 1;
        cur.left = L.slice(); cur.right = R.slice();
        var seg = L.concat([p]).concat(R);
        for (var i = 0; i < seg.length; i++) arr[lo + i] = seg[i];
        fixed[p] = true;
        log.push(new Array(depth + 1).join("  ") + "pivot " + p + ": [" + L.join(",") + "] " + p + " [" + R.join(",") + "]  +" + (A.length - 1));
        var extra = "";
        if (rule !== "sorted_first" && top) {
          extra = " 슬라이드 p.28: 3 과 5 는 비교됐으므로 '''X_{3,5} = 1''', 4 와 6 은 서로 다른 쪽으로 갈라져 '''다시는 만나지 않으므로 X_{4,6} = 0''' 으로 확정.";
          if (p !== 5) extra = " 이 규칙에서는 X_{3,5}, X_{4,6} 가 슬라이드와 다르게 정해질 수 있다(피벗 선택에 따라 달라지는 random variable).";
        }
        push("`partition_about_pivot`: 나머지 " + (A.length - 1) + " 개를 모두 pivot " + p + " 와 '''한 번씩''' 비교 → left = [" + L.join(", ") + "], right = [" + R.join(", ") +
          "]. 비교 +" + (A.length - 1) + " → 누적 " + total + "." + extra, 5);
        if (L.length) {
          cur.seg = [lo, lo + L.length];
          rec(lo, lo + L.length, depth + 1, false);
        }
        if (R.length) {
          rec(lo + L.length + 1, hi, depth + 1, false);
        }
      }

      cur.sub = arr.slice();
      push("입력 A = [" + arr.join(", ") + "] (n = 12). " +
        (rule === "sorted_first" ? "이미 정렬된 입력에 '''항상 첫 원소'''를 피벗으로 쓰면 매번 한쪽이 비어 버린다 — 적이 피벗 규칙을 아는 경우의 worst-case."
          : "슬라이드 p.12 의 예제. 실제 randomized quicksort 는 `random.choice(A)` 지만, 여기서는 결과를 재현하려고 피벗 규칙을 고정했다."), 1);
      rec(0, N, 0, true);

      var E = expected();
      cur = { seg: null, pivot: null, sub: arr.slice(), left: "-", right: "-", thisCmp: "-", depth: "-" };
      var verdict = {
        slide: "기대값 32.68 과 거의 같다 — 운이 평범한 경우.",
        first: "기대값보다 많다 — 첫 원소 0, 11 처럼 극단 피벗이 자주 걸렸다.",
        median: "매번 반으로 나누는 최선 — 기대값보다 적다(≈ n log2 n 규모).",
        sorted_first: "n(n−1)/2 = 12·11/2 = 66 — 모든 쌍이 비교되는 최악 Θ(n^2)."
      }[rule];
      push("정렬 완료 [" + arr.join(", ") + "]. 비교 총 '''" + total + "''' 회 = X=1 인 쌍 수(각 쌍은 '''많아야 한 번''' 비교되므로 둘이 같다). " + verdict +
        " 랜덤 피벗이면 E[Σ X_{a,b}] = Σ E[X_{a,b}] = Σ_{a < b} 2/(b−a+1) ≈ '''" + E.toFixed(2) + "''' ([[기대값의 선형성]]).", 3,
        "계산 근거: [[P(X_{a,b}=1)]] = 2/(b−a+1) — a..b 사이 b−a+1 개 값 중 '''a 나 b 가 가장 먼저 피벗이 될''' 확률. n = 12 에서 거리 d = b−a 인 쌍이 12−d 개이므로 " +
        "Σ_{d=1}^{11} (12−d)·2/(d+1) ≈ " + E.toFixed(2) + ". 규칙별: 슬라이드 33 / 첫 원소 42 / median 25 / 정렬+첫 원소 66.");

      return {
        panels: [{ id: "Q", title: "randomized_quicksort (L6 p.18)", lang: "c", lines: CODE }],
        vars: [
          { name: "피벗 규칙", group: "설정" },
          { name: "A", group: "현재 호출" }, { name: "depth", group: "현재 호출" }, { name: "pivot", group: "현재 호출" },
          { name: "left", group: "현재 호출" }, { name: "right", group: "현재 호출" }, { name: "이번 호출 비교", group: "현재 호출" },
          { name: "비교 누적", group: "비교 세기" }, { name: "X=1 인 쌍 수", group: "비교 세기" },
          { name: "X_{3,5}", group: "비교 세기" }, { name: "X_{4,6}", group: "비교 세기" }, { name: "호출 수", group: "비교 세기" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
