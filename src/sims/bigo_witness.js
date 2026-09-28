// bigo_witness — L2 p.17–20 (O 증명 / 반증), p.25 Claim I, p.26 Claim II : c, n0 를 고르고 n 을 늘려 가며 부등식 확인
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  function log2(x) { return Math.log(x) / Math.LN2; }
  function r3(x) { return Math.round(x * 1000) / 1000; }

  var CASES = {
    p17: {
      label: "p.17 — n = O(n log n) (c=1, n0=2)",
      T: function (n) { return n; }, Ts: "n",
      g: function (n) { return n * log2(n); }, gs: "n log2(n)",
      lines: [
        "정의: T(n) = O(g(n))  ⟺  ∃ c, n0 > 0  s.t.  ∀ n ≥ n0,  0 ≤ T(n) ≤ c·g(n)",
        "T(n) = n,  g(n) = n log(n)",
        "c 와 n0 를 고른다: c = 1, n0 = 2",
        "n = n0, n0+1, … 에서 n ≤ c·n log(n) 확인",
        "왜 모든 n ≥ 2 에서? n > 0 이고 n ≥ 2 이면 1 ≤ log(n)",
        "결론: 정의를 만족하는 c, n0 가 존재 → n = O(n log n)"
      ],
      xmax: 8
    },
    p19: {
      label: "p.18–20 — n² ≠ O(n) 반증 (c=5, n0=3 가정)",
      T: function (n) { return n * n; }, Ts: "n^2",
      g: function (n) { return n; }, gs: "n",
      lines: [
        "정의: T(n) = O(g(n))  ⟺  ∃ c, n0 > 0  s.t.  ∀ n ≥ n0,  0 ≤ T(n) ≤ c·g(n)",
        "T(n) = n^2,  g(n) = n.  귀류법: 어떤 c, n0 가 있다고 가정",
        "예로 c = 5, n0 = 3 이라 하자: ∀ n ≥ 3, n^2 ≤ 5n 이어야 한다",
        "n = max{c, n0} + 1 을 고른다",
        "n ≥ n0 이므로 가정대로라면 n^2 ≤ c·n 이어야 한다",
        "그런데 n > c 이므로 n^2 = n·n > c·n — 모순!",
        "어떤 c, n0 를 가정해도 같은 n 이 모순을 만든다 → n^2 ≠ O(n)"
      ],
      xmax: 8
    },
    claim1: {
      label: "p.25 Claim I — (3/2)n² + (5/2)n − 3 = O(n²)",
      T: function (n) { return 1.5 * n * n + 2.5 * n - 3; }, Ts: "(3/2)n^2 + (5/2)n - 3",
      g: function (n) { return n * n; }, gs: "n^2",
      lines: [
        "Claim I: (3/2)n^2 + (5/2)n - 3 = O(n^2)",
        "동치: (3/2)n^2 + (5/2)n - 3 ≤ c·n^2 인 c, n0 찾기",
        "항마다 n^2 로 키운다 (n ≥ 1): (5/2)n ≤ 5n^2,  -3 < n^2",
        "(3/2)n^2 + (5/2)n - 3 < (3/2)n^2 + 5n^2 + n^2 = (15/2)n^2",
        "c = 15/2, n0 = 1 로 n = 1, 2, … 확인",
        "결론: c = 15/2, n0 = 1 이 조건을 만족"
      ],
      xmax: 6
    },
    claim2: {
      label: "p.26 Claim II — (1/2)n² − 3n = Θ(n²)",
      T: function (n) { return 0.5 * n * n - 3 * n; }, Ts: "(1/2)n^2 - 3n",
      g: function (n) { return n * n; }, gs: "n^2",
      lines: [
        "Claim II: (1/2)n^2 - 3n = Θ(n^2)",
        "동치: c1·n^2 ≤ (1/2)n^2 - 3n ≤ c2·n^2 인 c1, c2, n0 찾기",
        "n^2 으로 나눈다: c1 ≤ 1/2 - 3/n ≤ c2",
        "오른쪽: 1/2 - 3/n ≤ c2 → n ≥ 1 이면 c2 = 1/2 로 충분",
        "왼쪽: c1 ≤ 1/2 - 3/n → n ≥ 7 이면 1/2 - 3/7 = 1/14 → c1 = 1/14",
        "n = 7, 8, … 에서 양쪽 부등식 확인",
        "결론: c1 = 1/14, c2 = 1/2, n0 = 7 이 조건을 만족"
      ],
      xmax: 14
    }
  };

  // 곡선 그림: T(n) 파랑, c·g(n) 빨강, (claim2) c1·g 보조
  function plot(cs, par, cur, n0) {
    var X0 = 70, X1 = 720, Y0 = 210, Y1 = 20, N = cs.xmax;
    var fs = [
      { f: cs.T, col: "#1d65b3", name: "T(n) = " + cs.Ts },
      { f: function (n) { return par.c * cs.g(n); }, col: "#d6465f", name: (par.cLabel || "c") + "·g(n)" }
    ];
    if (par.c1 !== undefined) fs.push({ f: function (n) { return par.c1 * cs.g(n); }, col: "#777", name: "c1·g(n)", dash: true });
    var ymax = 0, ymin = 0, n;
    fs.forEach(function (o) { for (n = 1; n <= N; n += 0.25) { var v = o.f(n); if (v > ymax) ymax = v; if (v < ymin) ymin = v; } });
    ymax *= 1.05;
    function px(nn) { return X0 + (nn - 1) / (N - 1) * (X1 - X0); }
    function py(v) { return Y0 - (v - ymin) / (ymax - ymin) * (Y0 - Y1); }
    var s = '<svg viewBox="0 0 760 260" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    s += '<line x1="' + X0 + '" y1="' + py(0) + '" x2="' + X1 + '" y2="' + py(0) + '" stroke="#999"/>';
    s += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X0 + '" y2="' + Y1 + '" stroke="#999"/>';
    for (n = 1; n <= N; n++) s += '<text x="' + px(n) + '" y="' + (Y0 + 16) + '" text-anchor="middle" fill="#777">' + n + "</text>";
    s += '<text x="' + X1 + '" y="' + (Y0 + 32) + '" text-anchor="end" fill="#777">n</text>';
    if (n0 !== null && n0 !== undefined) {
      s += '<rect x="' + px(n0) + '" y="' + Y1 + '" width="' + (X1 - px(n0)) + '" height="' + (Y0 - Y1) + '" fill="#dff3e4" opacity="0.45"/>';
      s += '<line x1="' + px(n0) + '" y1="' + Y1 + '" x2="' + px(n0) + '" y2="' + Y0 + '" stroke="#2e9e4f" stroke-dasharray="5 4" stroke-width="2"/>';
      s += '<text x="' + (px(n0) + 4) + '" y="' + (Y1 + 12) + '" fill="#2e9e4f">n0 = ' + n0 + " (여기부터 검사)</text>";
    }
    fs.forEach(function (o, k) {
      var d = "";
      for (var m = 1; m <= N + 1e-9; m += 0.1) d += (d ? " L" : "M") + r3(px(m)) + " " + r3(py(o.f(m)));
      s += '<path d="' + d + '" fill="none" stroke="' + o.col + '" stroke-width="2.5"' + (o.dash ? ' stroke-dasharray="6 4"' : "") + "/>";
      s += '<line x1="' + (90 + k * 230) + '" y1="248" x2="' + (116 + k * 230) + '" y2="248" stroke="' + o.col + '" stroke-width="3"' + (o.dash ? ' stroke-dasharray="6 4"' : "") + "/>";
      s += '<text x="' + (122 + k * 230) + '" y="252" fill="#333">' + o.name + "</text>";
    });
    if (cur !== null && cur !== undefined && cur >= 1 && cur <= N) {
      var tv = cs.T(cur), cv = par.c * cs.g(cur);
      var bad = tv > cv + 1e-9 || (par.c1 !== undefined && tv < par.c1 * cs.g(cur) - 1e-9);
      s += '<line x1="' + px(cur) + '" y1="' + Y1 + '" x2="' + px(cur) + '" y2="' + Y0 + '" stroke="#e09a40" stroke-width="1.5"/>';
      s += '<circle cx="' + px(cur) + '" cy="' + py(tv) + '" r="5" fill="#1d65b3"/>';
      s += '<circle cx="' + px(cur) + '" cy="' + py(cv) + '" r="5" fill="#d6465f"/>';
      s += '<text x="' + (px(cur) + (cur > N * 0.7 ? -8 : 8)) + '" y="' + (Y1 + 30) + '" text-anchor="' + (cur > N * 0.7 ? "end" : "start") + '" font-weight="700" fill="' + (bad ? "#d6465f" : "#2e9e4f") + '">n = ' + cur + (bad ? " ✗" : " ✓") + "</text>";
    }
    s += "</svg>";
    return s;
  }

  global.SIMS["bigo_witness"] = {
    title: "Big-O 증인 c, n₀ 찾기",
    desc: "[[Big-O]] 를 증명한다는 것은 '''증인 [[c와 n₀]] 를 실제로 내놓는 것'''이다. 파란 곡선 T(n) 이 초록 영역(n ≥ n₀)에서 빨간 곡선 c·g(n) 아래에 있으면 성립. " +
      "반증은 귀류법 — 아무 c, n₀ 를 가정해도 n = max{c, n₀}+1 에서 모순([[max{c, n₀}+1 트릭]]). Claim II 는 [[Big-Θ]] 라 c₁, c₂ 두 개.",
    options: [
      { key: "ex", label: "예제", values: [
        { value: "p17", label: CASES.p17.label },
        { value: "p19", label: CASES.p19.label },
        { value: "claim1", label: CASES.claim1.label },
        { value: "claim2", label: CASES.claim2.label }
      ] }
    ],
    build: function (opts) {
      var key = CASES[opts.ex] ? opts.ex : "p17";
      var cs = CASES[key];
      var steps = [];
      var theta = key === "claim2";
      var st = { c: "?", n0: "?", n: "-", Tn: "-", cgn: "-", ok: "-", verdict: "?" };
      if (theta) { st.c1 = "?"; st.c2 = "?"; }
      var par = { c: 1 };

      function push(desc, line, curN, n0, note) {
        var v = { T: cs.Ts, g: cs.gs };
        if (theta) { v.c1 = st.c1; v.c2 = st.c2; } else v.c = st.c;
        v.n0 = st.n0; v.n = st.n; v.T_n = st.Tn; v.cg_n = st.cgn; v.ok = st.ok; v.verdict = st.verdict;
        steps.push({ desc: desc, pc: { P: line }, vars: v, note: note, svg: plot(cs, par, curN, n0) });
      }
      function check(n) {
        st.n = n; st.Tn = r3(cs.T(n));
        if (theta) {
          var lo = r3(par.c1 * cs.g(n)), hi = r3(par.c * cs.g(n));
          st.cgn = lo + " ~ " + hi;
          st.ok = cs.T(n) >= par.c1 * cs.g(n) - 1e-9 && cs.T(n) <= par.c * cs.g(n) + 1e-9;
        } else {
          st.cgn = r3(par.c * cs.g(n));
          st.ok = cs.T(n) <= par.c * cs.g(n) + 1e-9 && cs.T(n) >= 0;
        }
        return st.ok;
      }

      if (key === "p17") {
        push("정의부터: T(n) = O(g(n)) 이려면 '''어떤 c, n₀ > 0''' 가 있어서 n ≥ n₀ 인 모든 n 에서 0 ≤ T(n) ≤ c·g(n). 증명 = 그 c, n₀ 를 찾아 보여 주기.", 1, null, null);
        push("T(n) = n, g(n) = n log(n). 두 곡선을 그려 보면 n = 1 에서 log 1 = 0 이라 c·g(1) = 0 < T(1) = 1 — 처음 한두 점에서는 안 될 수도 있다.", 2, 1, null);
        st.c = 1; st.n0 = 2; par.c = 1;
        push("슬라이드의 선택: '''c = 1, n₀ = 2'''. n₀ 는 '이 지점 이후만 본다'는 선언이라 n = 1 의 실패는 상관없다.", 3, null, 2);
        for (var n = 2; n <= 6; n++) {
          check(n);
          push("n = " + n + ": T(n) = " + st.Tn + " ≤ c·g(n) = 1·" + n + "·log2(" + n + ") = " + st.cgn + " → '''" + st.ok + "'''", 4, n, 2);
        }
        push("몇 개 점검은 증명이 아니다. 모든 n ≥ 2 에 대해: n > 0 이고 n ≥ 2 이면 '''1 ≤ log(n)''' 이므로 양변에 n 을 곱해 n ≤ n log(n) = c·g(n).", 5, 6, 2);
        st.verdict = "성립: n = O(n log n) (c = 1, n0 = 2)";
        push("결론: c = 1, n₀ = 2 가 정의를 만족 → '''n = O(n log n)'''. c 와 n₀ 는 유일하지 않다(c = 2, n₀ = 5 도 된다) — 하나만 보이면 된다.", 6, 6, 2,
          "시험 포인트: O 증명 답안 = ① c, n₀ 값을 명시 ② n ≥ n₀ 에서 부등식이 성립하는 이유.");
      } else if (key === "p19") {
        push("반증은 [[귀류법]]: 'n² = O(n)' 이라고 가정하고 모순을 끌어낸다.", 1, null, null);
        push("가정: 어떤 c, n₀ 가 있어서 n ≥ n₀ 이면 n² ≤ c·n. 우리는 c, n₀ 를 '''고를 수 없다''' — 상대가 준 아무 값에 대해 모순을 보여야 한다.", 2, null, null);
        st.c = 5; st.n0 = 3; par.c = 5;
        push("구체적으로 상대가 '''c = 5, n₀ = 3''' 을 내밀었다고 하자. 처음 몇 점은 괜찮아 보인다.", 3, null, 3);
        for (var m = 3; m <= 5; m++) {
          check(m);
          push("n = " + m + ": n² = " + st.Tn + " ≤ 5·" + m + " = " + st.cgn + " → " + st.ok + (m === 5 ? " (딱 같음 — 경계)" : ""), 3, m, 3);
        }
        st.n = 6;
        push("[[max{c, n₀}+1 트릭]]: '''n = max{5, 3} + 1 = 6'''. 이렇게 고르면 n ≥ n₀ (가정이 적용되는 구간) 이고 동시에 n > c.", 4, 6, 3);
        st.Tn = 36; st.cgn = 30; st.ok = "-";
        push("n = 6 ≥ n₀ = 3 이므로 가정대로라면 36 = n² ≤ c·n = 30 이어야 한다.", 5, 6, 3);
        st.ok = false;
        push("그런데 n = 6 > c = 5 이므로 n² = n·n > c·n: '''36 > 30'''. 가정에서 가정의 반대가 나왔다 — '''모순'''.", 6, 6, 3,
          "여기가 모순 지점: n² ≤ c·n 을 가정했는데 n² > c·n 이 나온다.");
        st.verdict = "n^2 ≠ O(n) (모순: 36 > 30)";
        push("c = 5, n₀ = 3 은 예일 뿐이다. 어떤 c, n₀ 든 n = max{c, n₀}+1 이 똑같이 모순을 만든다 → '''n² ≠ O(n)'''.", 7, 6, 3);
      } else if (key === "claim1") {
        push("Claim I: (3/2)n² + (5/2)n − 3 = O(n²). 최고차항이 n² 이니 참일 것 — 증인 c, n₀ 를 찾자.", 1, null, null);
        push("동치 문제: (3/2)n² + (5/2)n − 3 ≤ c·n² 을 만족하는 c, n₀.", 2, null, null);
        push("요령: 모든 항을 n² 으로 '''키운다'''. n ≥ 1 이면 (5/2)n ≤ 5n², 그리고 −3 < n² (음수는 버리거나 키워도 됨).", 3, null, null);
        st.c = "15/2"; st.n0 = 1; par.c = 7.5;
        push("더하면 (3/2)n² + (5/2)n − 3 < (3/2)n² + 5n² + n² = '''(15/2)n²''' (n ≥ 1). → c = 15/2, n₀ = 1.", 4, null, 1);
        for (var q = 1; q <= 5; q++) {
          check(q);
          push("n = " + q + ": T(n) = " + st.Tn + " ≤ (15/2)·" + (q * q) + " = " + st.cgn + " → '''" + st.ok + "'''", 5, q, 1);
        }
        st.verdict = "성립: c = 15/2, n0 = 1";
        push("결론: '''c = 15/2, n₀ = 1''' 이 조건을 만족 → O(n²). (더 작은 c = 3, n₀ = 2 등도 되지만 슬라이드 풀이 값은 15/2, 1.)", 6, 5, 1,
          "해설본의 'c=3, n₀=2' 도 성립은 하지만, 슬라이드 풀이는 c = 15/2, n₀ = 1 이다.");
      } else {
        push("Claim II: (1/2)n² − 3n = Θ(n²). [[Big-Θ]] 는 위아래 두 쪽 — c₁·n² ≤ T(n) ≤ c₂·n².", 1, null, null);
        push("동치: c₁n² ≤ (1/2)n² − 3n ≤ c₂n² 인 c₁, c₂, n₀ 를 찾는다.", 2, null, null);
        push("양변을 n² 으로 나누면 c₁ ≤ 1/2 − 3/n ≤ c₂. 가운데 값은 n 이 커질수록 1/2 로 올라간다.", 3, null, null);
        st.c2 = "1/2"; par.c = 0.5; par.cLabel = "c2";
        push("오른쪽: 1/2 − 3/n ≤ 1/2 은 n ≥ 1 이면 항상 참 → '''c₂ = 1/2'''.", 4, null, null);
        st.c1 = "1/14"; st.n0 = 7; par.c1 = 1 / 14;
        push("왼쪽: n ≤ 6 이면 1/2 − 3/n ≤ 0 이라 양수 c₁ 가 불가능. n ≥ 7 이면 1/2 − 3/n ≥ 1/2 − 3/7 = '''1/14''' → c₁ = 1/14, n₀ = 7.", 5, 6, 7);
        for (var r = 7; r <= 11; r++) {
          check(r);
          push("n = " + r + ": c₁n² ~ c₂n² = " + st.cgn + ", T(n) = " + st.Tn + " → '''" + st.ok + "'''" + (r === 7 ? " (n = 7 에서 아래쪽이 딱 같음)" : ""), 6, r, 7);
        }
        st.verdict = "성립: c1 = 1/14, c2 = 1/2, n0 = 7";
        push("결론: '''c₁ = 1/14, c₂ = 1/2, n₀ = 7''' → (1/2)n² − 3n = Θ(n²).", 7, 11, 7,
          "시험 포인트: Θ 증명은 상수 두 개(c₁, c₂)와 n₀ 하나. n₀ 는 두 부등식이 '''동시에''' 성립하는 시작점(여기선 아래쪽 조건이 결정).");
      }

      var vars = [{ name: "T", label: "T(n)", group: "문제" }, { name: "g", label: "g(n)", group: "문제" }];
      if (theta) { vars.push({ name: "c1", group: "증인" }); vars.push({ name: "c2", group: "증인" }); }
      else vars.push({ name: "c", group: "증인" });
      vars.push({ name: "n0", label: "n₀", group: "증인" });
      vars.push({ name: "n", group: "검사" });
      vars.push({ name: "T_n", label: "T(n) 값", group: "검사" });
      vars.push({ name: "cg_n", label: theta ? "c1·g(n) ~ c2·g(n)" : "c·g(n) 값", group: "검사" });
      vars.push({ name: "ok", label: "부등식 성립?", group: "검사" });
      vars.push({ name: "verdict", label: "결론", group: "결론" });
      return { panels: [{ id: "P", title: "손으로 푸는 순서 (L2 p.17–26)", lang: "txt", lines: cs.lines }], vars: vars, steps: steps };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
