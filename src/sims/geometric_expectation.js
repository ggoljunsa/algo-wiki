window.SIMS = window.SIMS || {};
// geometric_expectation — L6 p.6–9 (bogosort, PNG 6–8), p.73–77 (랜덤 majority, PNG 70–74): 성공할 때까지 반복 → 기대 시행 1/p
(function (global) {
  "use strict";

  var PROC = [
    "1. 한 번의 시행(iteration)이 성공할 확률 p 를 구한다",
    "2. i 번째 시행에서 처음 성공할 확률 = (1-p)^(i-1) * p  (기하분포)",
    "3. i = 1, 2, 3, ... 을 표로 쌓아 누적 확률이 1 로 가는 것을 본다",
    "4. E[#iterations] = sum_i i*(1-p)^(i-1)*p = 1/p",
    "5. 한 번 시행의 비용을 구한다",
    "6. E[비용] = (한 번 비용) * E[#iterations]  (기대값의 선형성)"
  ];

  function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }

  var CASES = {
    bogo3: { kind: "bogo", n: 3 },
    bogo4: { kind: "bogo", n: 4 },
    bogo5: { kind: "bogo", n: 5 },
    majority: { kind: "maj" }
  };

  function fmt(x) {
    if (x === 0) return "0";
    if (x >= 0.01) return (Math.round(x * 10000) / 10000).toString();
    return x.toExponential(3);
  }

  function svgFor(v) {
    var s = '<svg viewBox="0 0 760 280" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    s += '<text x="10" y="18" font-size="12" fill="#555">P(i 번째 시행에서 처음 성공) = (1−p)^(i−1)·p  (막대) · 누적 (선)</text>';
    var base = 230, H = 190, x0 = 40, bw = 50;
    s += '<line x1="' + x0 + '" y1="' + base + '" x2="740" y2="' + base + '" stroke="#667"/>';
    s += '<line x1="' + x0 + '" y1="' + (base - H) + '" x2="' + x0 + '" y2="' + base + '" stroke="#667"/>';
    s += '<text x="' + (x0 - 6) + '" y="' + (base - H + 4) + '" text-anchor="end" font-size="10">1</text>';
    s += '<text x="' + (x0 - 6) + '" y="' + (base + 4) + '" text-anchor="end" font-size="10">0</text>';
    var pts = [];
    for (var i = 0; i < v.rows.length; i++) {
      var r = v.rows[i], x = x0 + 10 + i * (bw + 6);
      var h = Math.max(1, r.pi * H);
      s += '<rect x="' + x + '" y="' + (base - h) + '" width="' + bw + '" height="' + h + '" fill="' + (i === v.rows.length - 1 ? "#d6465f" : "#8aa4c8") + '"/>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (base + 16) + '" text-anchor="middle" font-size="11">i=' + r.i + "</text>";
      pts.push((x + bw / 2) + "," + (base - r.cum * H));
    }
    if (pts.length > 1) s += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#2f8a5b" stroke-width="2"/>';
    pts.forEach(function (p) { var q = p.split(","); s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="3" fill="#2f8a5b"/>'; });
    s += '<text x="740" y="' + (base + 38) + '" text-anchor="end" font-size="12" font-weight="700">' + v.caption + "</text>";
    s += "</svg>";
    return s;
  }

  global.SIMS["geometric_expectation"] = {
    title: "성공할 때까지 반복 — 기대 시행 횟수 1/p",
    desc: "L6 p.6–9, 73–77. 성공 확률 p 인 시행을 성공할 때까지 반복하면 시행 횟수는 [[기하분포]]를 따르고 기대값은 '''1/p'''. " +
      "[[bogosort]] 는 p = 1/n! 이라 절망적이고, [[랜덤 majority]] 는 p ≥ 1/2 라 기대 2 번이면 끝난다([[등비급수]]).",
    options: [
      { key: "ex", label: "예제", values: [
        { value: "bogo3", label: "bogosort n=3" },
        { value: "bogo4", label: "bogosort n=4" },
        { value: "bogo5", label: "bogosort n=5" },
        { value: "majority", label: "랜덤 majority p ≥ 1/2" }
      ] }
    ],
    build: function (opts) {
      var c = CASES[opts.ex] || CASES.bogo3;
      var bogo = c.kind === "bogo";
      var n = c.n;
      var p = bogo ? 1 / fact(n) : 0.5;
      var pStr = bogo ? "1/" + fact(n) : "≥ 1/2";
      var rows = [];
      var steps = [];
      var st = { p: pStr, i: "-", pi: "-", cum: "-", E_iter: "?", cost1: "?", E_cost: "?" };
      function snap() {
        return {
          "문제": bogo ? "bogosort n=" + n : "랜덤 majority", p: st.p, i: st.i,
          "(1-p)^(i-1)*p": st.pi, "누적 P(≤ i 번에 성공)": st.cum,
          "E[#iterations]": st.E_iter, "한 번 비용": st.cost1, "E[비용]": st.E_cost
        };
      }
      function push(desc, pc, cap, note) {
        steps.push({ desc: desc, pc: { P: pc }, vars: snap(), note: note,
          svg: svgFor({ rows: rows.map(function (r) { return Object.assign({}, r); }), caption: cap || "" }) });
      }

      if (bogo) {
        push("[[bogosort]] (n = " + n + "): 매 iteration 마다 `random.shuffle(A)` 후 정렬됐는지 확인. 서로 다른 원소 " + n + " 개의 순열은 " + n + "! = " + fact(n) +
          " 가지이고 정렬된 것은 1 가지 → 한 번 성공 확률 '''p = 1/" + fact(n) + "'''.", 1);
      } else {
        push("[[랜덤 majority]]: 매 iteration 마다 `guess = random.choice(A)`. majority element 는 ⌊n/2⌋+1 번 이상 등장하므로 한 번에 그것을 뽑을 확률 '''p ≥ 1/2'''. " +
          "(슬라이드 p.76 코드 기준, 정의대로 `count > n/2`.) 가장 나쁜 p = 1/2 로 계산한다.", 1);
      }
      var cum = 0;
      var shown = 6;
      for (var i = 1; i <= shown; i++) {
        var pi = Math.pow(1 - p, i - 1) * p;
        cum += pi;
        rows.push({ i: i, pi: pi, cum: cum });
        st.i = i; st.pi = fmt(pi); st.cum = fmt(cum);
        push("i = " + i + ": 앞의 " + (i - 1) + " 번은 실패((1−p)^" + (i - 1) + "), " + i + " 번째에 성공(p) → " + fmt(pi) + ". 누적 " + fmt(cum) + ".",
          i === 1 ? 2 : 3, "누적 " + fmt(cum));
      }
      st.E_iter = bogo ? String(fact(n)) : "≤ 2";
      push(bogo
        ? "누적이 1 에 가려면 한참 걸린다. 기하분포의 기대값 E[#iterations] = 1/p = '''" + fact(n) + "''' 번 셔플."
        : "슬라이드 p.77: E[#iterations] ≤ Σ_{i=0}^{∞} (1/2)^i = '''2''' ([[등비급수]] 1/(1 − 1/2)). 기하분포로 봐도 1/p ≤ 2.", 4,
        "E[#iter] = " + st.E_iter);
      if (bogo) {
        st.cost1 = n + " (셔플 n + 정렬 확인 ≈ n)";
        push("한 iteration 비용: shuffle 과 정렬 확인이 각각 Θ(n) → 한 번에 ≈ '''n = " + n + "'''.", 5, "E[#iter] = " + st.E_iter);
        st.E_cost = n + " × " + fact(n) + " = " + (n * fact(n));
        push("E[비용] = n · n! = " + n + " × " + fact(n) + " = '''" + (n * fact(n)) + "'''. n 이 조금만 커져도 폭발한다(n = 10 이면 3,628,800 번 셔플). " +
          "그리고 worst-case 는 '''O(∞)''' — 영원히 성공 못 할 수도 있다.", 6, "E[비용] = " + (n * fact(n)),
          "비교: n=3 → 6 번·18, n=4 → 24 번·96, n=5 → 120 번·600. 같은 '반복해서 운에 맡기기'인데 p 가 1/n! 이냐 1/2 냐가 생사를 가른다.");
      } else {
        st.cost1 = "n (equals n 번)";
        push("한 iteration 비용: `for a in A: equals(guess, a)` → equals '''n 번'''.", 5, "E[#iter] ≤ 2");
        st.E_cost = "≤ 2n";
        push("E[#checks] ≤ n × 2 = '''2n''' → 기대 수행 시간 '''O(n)'''. 하지만 worst-case 는 '''O(∞)''' (매번 틀린 guess 를 뽑을 수도 있다) — [[Las Vegas와 Monte Carlo|Las Vegas]] 알고리즘.", 6,
          "E[#checks] ≤ 2n",
          "슬라이드 p.75 코드의 `count > n/2+1` 은 정의(⌊n/2⌋+1 번 이상)와 한 칸 어긋난다. 정의대로는 `count > n/2` (p.76 에서 고쳐짐).");
      }

      return {
        panels: [{ id: "P", title: "기대 시행 횟수 구하는 순서", lang: "txt", lines: PROC }],
        vars: [
          { name: "문제", group: "설정" }, { name: "p", label: "p (한 번 성공 확률)", group: "설정" },
          { name: "i", group: "기하분포 표" }, { name: "(1-p)^(i-1)*p", group: "기하분포 표" }, { name: "누적 P(≤ i 번에 성공)", group: "기하분포 표" },
          { name: "E[#iterations]", group: "결과" }, { name: "한 번 비용", group: "결과" }, { name: "E[비용]", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
