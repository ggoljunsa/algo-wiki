// select_partition — L4 p.6, 9–25 select(A, k): pivot → partition_about_pivot → 한쪽만 재귀
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var SEL = [
    "def select(A, k, c=100):",
    "  if len(A) <= c:",
    "    return naive_select(A, k)",
    "  pivot = random.choice(A)",
    "  left, right = partition_about_pivot(A, pivot)",
    "  if len(left) == k:",
    "    # The pivot is the kth smallest element!",
    "    return pivot",
    "  elif len(left) > k:",
    "    # The kth smallest element is left of the pivot",
    "    return select(left, k, c)",
    "  else:",
    "    # The kth smallest element is right of the pivot",
    "    return select(right, k-len(left)-1, c)"
  ];
  var PART = [
    "def partition_about_pivot(A, pivot):",
    "  left, right = [], []",
    "  for i in range(len(A)):",
    "    if A[i] == pivot: continue",
    "    elif A[i] < pivot:",
    "      left.append(A[i])",
    "    else:",
    "      right.append(A[i])",
    "  return left, right"
  ];

  var A0 = [1, 64, 9, 49, 16, 4, 0, 25, 36, 81], K0 = 3;
  var SLIDE_PIVOTS = [36, 1, 9];

  function list(a) { return "[" + a.join(", ") + "]"; }

  // v: {A, pivot, left, right, go: "left"|"right"|"found"|null, scan, stack}
  function draw(v) {
    var W = 40, G = 6, s = '<svg viewBox="0 0 760 250" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="15">';
    s += '<text x="12" y="20" font-size="12" fill="#3b2f4a">호출 스택: ' + v.stack.join("  →  ") + "</text>";
    function cells(arr, x0, y, style) {
      for (var i = 0; i < arr.length; i++) {
        var st = style(i, arr[i]), x = x0 + i * (W + G);
        s += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + W + '" rx="4" fill="' + st.f + '" stroke="' + st.s + '" stroke-width="' + (st.w || 2) + '"/>';
        s += '<text x="' + (x + W / 2) + '" y="' + (y + 26) + '" text-anchor="middle" font-weight="700" fill="' + (st.t || "#222") + '">' + arr[i] + "</text>";
      }
      return x0 + arr.length * (W + G);
    }
    s += '<text x="12" y="68" font-size="12" fill="#555">A</text>';
    var x0 = (760 - v.A.length * (W + G)) / 2;
    cells(v.A, x0, 44, function (i, val) {
      if (val === v.pivot) return { f: "#fdeec2", s: "#e09a40", w: 3 };
      if (v.scan === i) return { f: "#fff", s: "#d6465f", w: 3 };
      return { f: "#dbe8f7", s: "#1d65b3" };
    });
    if (v.left) {
      var total = v.left.length + 1 + v.right.length;
      var xs = (760 - total * (W + G) - 30) / 2, y = 140;
      var dimL = v.go === "right" || v.go === "found", dimR = v.go === "left" || v.go === "found";
      s += '<text x="12" y="' + (y + 26) + '" font-size="12" fill="#555">partition</text>';
      var xl = cells(v.left, xs, y, function () { return dimL ? { f: "#f2f2f2", s: "#ccc", t: "#aaa" } : { f: "#dbe8f7", s: "#1d65b3" }; });
      var xp = xl + 10;
      if (v.pivotPlaced) {
        cells([v.pivot], xp, y, function () { return v.go === "found" ? { f: "#dff3e4", s: "#2e9e4f", w: 3 } : { f: "#fdeec2", s: "#e09a40", w: 3 }; });
      } else {
        s += '<rect x="' + xp + '" y="' + y + '" width="' + W + '" height="' + W + '" rx="4" fill="#fff" stroke="#e09a40" stroke-dasharray="4 3"/>';
      }
      cells(v.right, xp + W + G + 10, y, function () { return dimR ? { f: "#f2f2f2", s: "#ccc", t: "#aaa" } : { f: "#dbe8f7", s: "#1d65b3" }; });
      s += '<text x="' + (xs + (xl - xs) / 2) + '" y="' + (y + 64) + '" text-anchor="middle" font-size="12" fill="#1d65b3">left (' + v.left.length + ")</text>";
      s += '<text x="' + (xp + W / 2) + '" y="' + (y + 64) + '" text-anchor="middle" font-size="12" fill="#e09a40">pivot</text>';
      s += '<text x="' + (xp + W + G + 10 + v.right.length * (W + G) / 2) + '" y="' + (y + 64) + '" text-anchor="middle" font-size="12" fill="#1d65b3">right (' + v.right.length + ")</text>";
      if (v.go === "left" || v.go === "right") s += '<text x="380" y="236" text-anchor="middle" font-size="13" font-weight="700" fill="#3b2f4a">' + (v.go === "left" ? "← 왼쪽만 재귀, 오른쪽(회색)은 버린다" : "오른쪽만 재귀 →, 왼쪽(회색)과 pivot 은 버린다") + "</text>";
      if (v.go === "found") s += '<text x="380" y="236" text-anchor="middle" font-size="14" font-weight="700" fill="#2e9e4f">len(left) == k → pivot 이 답!</text>';
    }
    s += "</svg>";
    return s;
  }

  global.SIMS["select_partition"] = {
    title: "select(A, k) — pivot 으로 나누고 한쪽만",
    desc: "L4 p.9–25. [[select]] 는 [[pivot]] 을 고르고 [[partition_about_pivot]] 으로 left│pivot│right 로 나눈 뒤, len(left) 와 k 를 비교해 '''답이 있는 한쪽만''' 재귀한다([[한쪽만 재귀]]). " +
      "오른쪽으로 갈 때는 버린 left 와 pivot 만큼 k 를 줄인다 — [[k-len(left)-1 보정]]. 예제는 A = [1,64,9,49,16,4,0,25,36,81], k = 3 (0-indexed, 정렬하면 [0,1,4,9,…] 의 인덱스 3 = 9). " +
      "슬라이드 예제처럼 base case 의 c 는 무시하고(작은 리스트도 그대로 재귀) 돌린다. 피벗이 매번 최댓값이면 비용이 n + (n−1) + … 로 커진다 — [[L4 Divide and Conquer II]] 의 worst-case Θ(n²).",
    options: [
      { key: "pivot", label: "pivot 고르기", values: [
        { value: "slide", label: "슬라이드 순서 36 → 1 → 9" },
        { value: "unlucky", label: "불운: 매번 최댓값" },
        { value: "median", label: "(참고) 매번 진짜 median" }
      ] }
    ],
    build: function (opts) {
      var mode = opts.pivot === "unlucky" || opts.pivot === "median" ? opts.pivot : "slide";
      var steps = [];
      var st = { depth: 0, A: A0.slice(), k: K0, pivot: "-", left: "-", right: "-", len_left: "-", decision: "-", cost: 0, costs: [], answer: "?" };
      var stack = [];
      var callNo = 0;

      function push(desc, pcS, pcP, viz, note) {
        steps.push({
          desc: desc, pc: { SEL: pcS, PART: pcP },
          vars: { depth: st.depth, A: st.A.slice(), k: st.k, pivot: st.pivot, left: st.left, right: st.right, len_left: st.len_left, decision: st.decision, cost: st.cost, answer: st.answer },
          status: { SEL: "running", PART: pcP ? "running" : "ready" },
          note: note, svg: draw({ A: st.A.slice(), pivot: viz.pivot, left: viz.left, right: viz.right, go: viz.go || null, scan: viz.scan, pivotPlaced: viz.pivotPlaced, stack: stack.slice() })
        });
      }
      function choose(A) {
        if (mode === "slide") return SLIDE_PIVOTS[callNo];
        if (mode === "unlucky") return Math.max.apply(null, A);
        var s = A.slice().sort(function (x, y) { return x - y; });
        return s[Math.floor((s.length - 1) / 2)];
      }

      function select(A, k) {
        st.A = A.slice(); st.k = k; st.pivot = "-"; st.left = "-"; st.right = "-"; st.len_left = "-"; st.decision = "-";
        stack.push("select(" + A.length + "개, k=" + k + ")");
        push("깊이 " + st.depth + ": `select(" + list(A) + ", k=" + k + ")` 호출 — 이 리스트에서 " + k + " 번째로 작은 원소(0부터 셈)를 찾는다.", 1, null, {});
        push("`len(A) = " + A.length + "` — 슬라이드 예제처럼 base case 크기 c 는 무시하고 계속 진행(실제 코드는 c = 100 이하면 [[naive_select]]).", 2, null, {});
        var pv = choose(A);
        st.pivot = pv;
        var why = mode === "slide" ? "슬라이드가 고른 pivot" : (mode === "unlucky" ? "불운 — 현재 리스트의 '''최댓값'''" : "현재 리스트의 진짜 median");
        push("`pivot = random.choice(A)` → '''" + pv + "''' (" + why + ").", 4, null, { pivot: pv });

        var left = [], right = [];
        if (callNo === 0) {
          push("`partition_about_pivot(A, " + pv + ")` 진입: `left, right = [], []`. A 를 처음부터 끝까지 한 번 훑는다 — 비용 len(A) = " + A.length + ".", 5, 2, { pivot: pv, left: [], right: [], pivotPlaced: false });
          for (var i = 0; i < A.length; i++) {
            var line, txt;
            if (A[i] === pv) { line = 4; txt = "`A[" + i + "] = " + pv + "` 는 pivot 자신 → continue."; }
            else if (A[i] < pv) { left.push(A[i]); line = 6; txt = "`A[" + i + "] = " + A[i] + " < " + pv + "` → left 에 추가."; }
            else { right.push(A[i]); line = 8; txt = "`A[" + i + "] = " + A[i] + " > " + pv + "` → right 에 추가."; }
            st.left = left.slice(); st.right = right.slice();
            push(txt, 5, line, { pivot: pv, left: left.slice(), right: right.slice(), scan: i, pivotPlaced: false });
          }
        } else {
          for (var j = 0; j < A.length; j++) { if (A[j] < pv) left.push(A[j]); else if (A[j] > pv) right.push(A[j]); }
        }
        st.cost += A.length; st.costs.push(A.length);
        st.left = left.slice(); st.right = right.slice(); st.len_left = left.length;
        push("`return left, right` → left = " + list(left) + ", right = " + list(right) + ". '''순서는 원래 순서 그대로'''(정렬되지 않음), pivot 은 그 사이에 선다. partition 비용 " + A.length + ", 누적 " + st.cost + ".",
          5, 9, { pivot: pv, left: left, right: right, pivotPlaced: true });
        callNo++;

        if (left.length === k) {
          st.decision = "len(left) = " + k + " == k → pivot";
          st.answer = pv;
          push("`len(left) = " + left.length + " == k = " + k + "` → pivot 앞에 정확히 " + k + " 개가 있다 → '''pivot " + pv + " 이 답'''.", 8, null, { pivot: pv, left: left, right: right, go: "found", pivotPlaced: true });
          stack.pop();
          return pv;
        } else if (left.length > k) {
          st.decision = "len(left) = " + left.length + " > k = " + k + " → 왼쪽, k 그대로";
          push("`len(left) = " + left.length + " > k = " + k + "` → 답은 pivot 왼쪽에 있다. `select(left, " + k + ")` — 왼쪽에서는 순위가 그대로이므로 '''k 그대로'''.", 11, null, { pivot: pv, left: left, right: right, go: "left", pivotPlaced: true });
          st.depth++;
          var r1 = select(left, k);
          stack.pop();
          return r1;
        } else {
          var nk = k - left.length - 1;
          st.decision = "len(left) = " + left.length + " < k = " + k + " → 오른쪽, k = " + k + "-" + left.length + "-1 = " + nk;
          push("`len(left) = " + left.length + " < k = " + k + "` → 답은 pivot 오른쪽. left " + left.length + " 개와 pivot 1 개를 버렸으니 새 k = " + k + " − " + left.length + " − 1 = '''" + nk + "''' ([[k-len(left)-1 보정]]).", 14, null, { pivot: pv, left: left, right: right, go: "right", pivotPlaced: true });
          st.depth++;
          var r2 = select(right, nk);
          stack.pop();
          return r2;
        }
      }

      var ans = select(A0.slice(), K0);
      var sorted = A0.slice().sort(function (x, y) { return x - y; });
      var tail = mode === "slide" ? "슬라이드 p.9–15 와 같은 결과. partition 비용 " + st.costs.join(" + ") + " = '''" + st.cost + "'''." :
        (mode === "unlucky" ? "pivot 이 81, 64, 49, 36, 25, 16, 9 순으로 매번 하나씩만 떼어 냈다. 비용 " + st.costs.join(" + ") + " = '''" + st.cost + "''' — n 이 커지면 n + (n−1) + … = Θ(n²)." :
          "진짜 median 을 매번 고르면 크기가 매번 절반 → 비용 " + st.costs.join(" + ") + " = '''" + st.cost + "''' ≤ 2n. 이것이 O(n) 의 이상(L4 p.49) — 문제는 median 을 싸게 구하는 법([[median of medians]]).");
      push("답: '''" + ans + "'''. 확인: sorted(A) = " + list(sorted) + ", 인덱스 3 = " + sorted[3] + ". " + tail, 8, null, { pivot: ans },
        mode === "unlucky" ? "시험 포인트: 이 worst-case 는 '''입력이 아니라 pivot(난수)이 나빠서''' 생긴다 — 삽입 정렬의 worst-case 와 종류가 다르다." : null);

      return {
        panels: [
          { id: "SEL", title: "select (L4 p.16)", lang: "c", lines: SEL },
          { id: "PART", title: "partition_about_pivot (L4 p.25)", lang: "c", lines: PART }
        ],
        vars: [
          { name: "depth", label: "재귀 깊이", group: "현재 호출" },
          { name: "A", group: "현재 호출" },
          { name: "k", group: "현재 호출" },
          { name: "pivot", group: "partition" },
          { name: "left", group: "partition" },
          { name: "right", group: "partition" },
          { name: "len_left", label: "len(left)", group: "partition" },
          { name: "decision", label: "판정", group: "partition" },
          { name: "cost", label: "partition 비용 누적", group: "결과" },
          { name: "answer", label: "답", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
