// substitution_method — L3 p.108–116, L4 p.101–104, HW1 6-b : guess → IH → C 조건 추출 → C 확정 → "Pretend we knew C"
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var LINES = [
    "Step 1: 답을 추측한다 (guess)",
    "Inductive hypothesis: T(k) ≤ C·k  for all 1 ≤ k < n   (C 는 아직 미정)",
    "Base case: 작은 n 에서 C 가 만족해야 할 조건",
    "Inductive step: 점화식의 T(·) 자리에 가설을 대입",
    "정리해서 (계수)·n ≤ C·n 이 되는 C 의 조건을 뽑는다",
    "모든 조건을 만족하는 C 를 확정한다",
    "Conclusion: 귀납법으로 모든 n 에서 T(n) ≤ C·n → T(n) = O(n)",
    "Step 3: profit — \"Pretend like we knew it all along\" 으로 다시 쓴다"
  ];

  // 막대: 길이 C·n, 부분 문제 몫 (C·s_i)·n 들, 여유 (1 - Σs)·C·n 에 추가 일 e·n 이 들어가야 한다
  function bar(parts, extra, C, dLabel) {
    var s = '<svg viewBox="0 0 760 170" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    var scale = 560 / Math.max(C, extra + parts.reduce(function (x, p) { return x + p.f * C; }, 0), 1);
    var x = 150, y = 40;
    s += '<text x="20" y="' + (y + 18) + '" font-weight="700" fill="#d6465f">C·n  (C = ' + C + ")</text>";
    s += '<rect x="' + x + '" y="' + y + '" width="' + (C * scale) + '" height="28" fill="#fff" stroke="#d6465f" stroke-width="2.5"/>';
    y = 90;
    s += '<text x="20" y="' + (y + 18) + '" font-weight="700" fill="#1d65b3">대입한 우변</text>';
    var cx = x;
    parts.forEach(function (p, i) {
      var w = p.f * C * scale;
      s += '<rect x="' + cx + '" y="' + y + '" width="' + w + '" height="28" fill="' + (i % 2 ? "#dbe8f7" : "#c7daf1") + '" stroke="#1d65b3"/>';
      if (w > 34) s += '<text x="' + (cx + w / 2) + '" y="' + (y + 18) + '" text-anchor="middle" fill="#1d65b3">' + p.name + "</text>";
      cx += w;
    });
    var ew = extra * scale, fits = cx + ew <= x + C * scale + 1e-6;
    s += '<rect x="' + cx + '" y="' + y + '" width="' + ew + '" height="28" fill="' + (fits ? "#fdeec2" : "#fbe3e7") + '" stroke="' + (fits ? "#e09a40" : "#d6465f") + '"/>';
    s += '<text x="' + (cx + ew / 2) + '" y="' + (y + 18) + '" text-anchor="middle" fill="#8a5a12">' + dLabel + "</text>";
    s += '<line x1="' + (x + C * scale) + '" y1="30" x2="' + (x + C * scale) + '" y2="128" stroke="#d6465f" stroke-dasharray="4 3"/>';
    s += '<text x="150" y="150" font-size="13" font-weight="700" fill="' + (fits ? "#2e9e4f" : "#d6465f") + '">' +
      (fits ? "✓ 우변 ≤ C·n — 여유분이 추가 일을 흡수한다" : "✗ 우변 > C·n — C 가 너무 작다") + "</text>";
    s += "</svg>";
    return s;
  }

  var EX = {
    warm: {
      label: "L3 워밍업 2T(n/2) + n",
      rec: "T(1) ≤ 1, T(n) ≤ 2T(n/2) + n"
    },
    l3: {
      label: "L3 3n + T(n/5) + T(n/2)",
      rec: "T(n) = 10n (1 ≤ n ≤ 10); T(n) = 3n + T(n/5) + T(n/2)",
      parts: [{ f: 1 / 5, name: "C·n/5" }, { f: 1 / 2, name: "C·n/2" }], extra: 3, dLabel: "3n", trial: 5, C: 10
    },
    l4: {
      label: "L4 T(n/5) + T(7n/10) + dn",
      rec: "T(n) = n log n (n ≤ 100); T(n) ≤ T(n/5) + T(7n/10) + dn",
      parts: [{ f: 1 / 5, name: "C·n/5" }, { f: 7 / 10, name: "C·7n/10" }], extra: 1, dLabel: "dn", trial: 7, C: 10
    },
    hw6b: {
      label: "HW1 6-b T(n/2) + T(n/4) + T(n/8) + n",
      rec: "T(1) = 1; T(n) = T(n/2) + T(n/4) + T(n/8) + n",
      parts: [{ f: 1 / 2, name: "C·n/2" }, { f: 1 / 4, name: "C·n/4" }, { f: 1 / 8, name: "C·n/8" }], extra: 1, dLabel: "n", trial: 4, C: 8
    }
  };

  global.SIMS["substitution_method"] = {
    title: "substitution method — C 를 찾아가는 3단계",
    desc: "[[substitution method]]: ① 답을 추측 ② 귀납 가설 T(k) ≤ C·k 의 [[미정 상수 C]] 를 비워 둔 채 base case 와 inductive step 에서 C 의 조건을 뽑아 C 확정 ③ '''Pretend like we knew it all along''' — 처음부터 C 를 안 척 깔끔하게 다시 쓴다. " +
      "부분 문제 크기가 달라 master method 가 안 되는 점화식([[master method의 한계]])에 쓴다. 막대 그림: [[부분 문제 크기의 합]] 이 n 보다 작으면 남는 여유가 추가 일을 흡수 — [[T(n/5) + T(7n/10) + O(n)]] 가 O(n) 인 이유.",
    options: [
      { key: "ex", label: "예제", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var key = EX[opts.ex] ? opts.ex : "warm";
      var ex = EX[key];
      var steps = [];
      var st = { rec: ex.rec, guess: "?", ih: "?", base: "?", step: "?", stepCond: "?", C: "?", concl: "?" };
      function push(desc, line, svg, note) {
        steps.push({
          desc: desc, pc: { P: line },
          vars: { rec: st.rec, guess: st.guess, ih: st.ih, base: st.base, step: st.step, stepCond: st.stepCond, C: st.C, concl: st.concl },
          note: note, svg: svg
        });
      }

      if (key === "warm") {
        push("워밍업(L3 p.109): 이미 답을 아는 mergesort 점화식 '''T(1) ≤ 1, T(n) ≤ 2T(n/2) + n''' 에 방법을 먼저 적용해 본다.", 1);
        st.guess = "T(n) = n(log n + 1)";
        push("Step 1 guess(p.110): 몇 번 전개하면 2T(n/2)+n → 4T(n/4)+2n → 8T(n/8)+3n → … → nT(1) + n log n. 추측 '''T(n) = n(log n + 1)'''.", 1);
        st.ih = "T(k) ≤ k(log k + 1), 1 ≤ k < n";
        push("Inductive hypothesis(p.111): '''모든 1 ≤ k < n 에 대해 T(k) ≤ k(log k + 1)''' — n 보다 작은 모든 크기에 대한 가설([[강한 귀납법]]).", 2);
        st.base = "T(1) = 1 = 1·(log 1 + 1) ✓";
        push("Base case: T(1) = 1 = 1·(log 1 + 1) = 1·(0 + 1). ✓", 3);
        st.step = "2(n/2)(log(n/2) + 1) + n = 2(n/2)(log n − 1 + 1) + n = n(log n + 1)";
        push("Inductive step: T(n) ≤ 2T(n/2) + n ≤ 2·(n/2)(log(n/2) + 1) + n = 2·(n/2)(log n − 1 + 1) + n = n log n + n = '''n(log n + 1)'''. (log(n/2) = log n − 1 이 핵심.)", 4);
        st.stepCond = "(조건 없음 — 등호로 딱 맞는다)"; st.C = "(없음 — 정확한 식을 추측)";
        st.concl = "T(n) ≤ n(log n + 1) for all n ≥ 1";
        push("Conclusion: 귀납법에 의해 모든 n ≥ 1 에서 '''T(n) ≤ n(log n + 1)''' → O(n log n).", 7);
        push("교수 말: '지금까지는 같은 일을 다른 방법으로 한 것뿐'(p.112). 이 방법의 진짜 쓸모는 '''크기가 다른 부분 문제''' — 다음 예제(L3 3n + T(n/5) + T(n/2))에서 미정 상수 C 가 등장한다.", 8, undefined,
          "여기서는 정확한 식을 추측해서 C 가 필요 없었다. O(n) 만 추측할 때는 T(k) ≤ Ck 처럼 상수를 비워 둔다.");
      } else {
        var trial = ex.trial, C = ex.C;
        if (key === "l3") {
          push("점화식(L3 p.112): '''" + ex.rec + "'''. 부분 문제 크기가 n/5, n/2 로 '''다르다''' → master method 불가.", 1);
          st.guess = "O(n)";
          push("Step 1 guess(p.113): 전개는 금방 지저분해진다. 위아래로 끼운다 — T(n) ≥ 3n 이고, T(n/5) ≤ T(n/2) 로 키우면 T(n) ≤ 3n + 2T(n/2) = O(n log n). 답은 그 사이 → '''O(n) 으로 추측'''.", 1);
          st.ih = "T(k) ≤ C·k, 1 ≤ k < n";
          push("Inductive hypothesis(p.114): '''모든 1 ≤ k < n 에 대해 T(k) ≤ Ck'''. C 는 '''나중에 채울 상수'''(C is some constant we'll have to fill in later!).", 2);
          st.base = "10k ≤ Ck (k ≤ 10) → C ≥ 10";
          push("Base case: 1 ≤ k ≤ 10 에서 T(k) = 10k 이므로 10k ≤ Ck 이려면 '''C ≥ 10'''.", 3);
          st.step = "3n + C(n/5) + C(n/2) = (3 + 7C/10)n";
          push("Inductive step: T(n) = 3n + T(n/5) + T(n/2) ≤ 3n + C(n/5) + C(n/2) = '''(3 + 7C/10)·n'''. 부분 문제 크기의 합이 n/5 + n/2 = 7n/10 < n 이라 C·n 중 3C/10·n 이 남는다.", 4, bar(ex.parts, ex.extra, trial, ex.dLabel));
          st.stepCond = "(3 + 7C/10)n ≤ Cn ⟺ 3 ≤ 3C/10 ⟺ C ≥ 10";
          push("(3 + 7C/10)n ≤ Cn ⟺ 3 ≤ (3/10)C ⟺ '''C ≥ 10'''. 막대로 보면: C = 5 는 여유 1.5n 이 추가 일 3n 을 못 담는다.", 5, bar(ex.parts, ex.extra, trial, ex.dLabel));
          st.C = 10;
          push("두 조건(base C ≥ 10, step C ≥ 10)을 모두 만족하는 가장 작은 값 → '''C = 10''' (C = 10 works). 3n + 2n + 5n = 10n 으로 딱 맞는다.", 6, bar(ex.parts, ex.extra, C, ex.dLabel));
          st.concl = "T(n) ≤ 10n → T(n) = O(n)";
          push("Conclusion: C = 10 이 존재하므로 모든 n ≥ 1 에서 T(n) ≤ 10n → '''T(n) = O(n)'''.", 7, bar(ex.parts, ex.extra, C, ex.dLabel));
          push("Step 3 profit(p.115): '''Pretend like we knew it all along''' — 답안에는 처음부터 'T(k) ≤ 10k' 로 쓰고 3n + 10(n/5) + 10(n/2) = 3n + 2n + 5n ≤ 10n 만 보인다. C 를 찾는 과정은 답안에 안 써도 된다.", 8, bar(ex.parts, ex.extra, C, ex.dLabel),
            "시험 포인트: C 조건은 base 와 step 두 곳에서 나온다 — 둘 다 만족해야 한다.");
        } else if (key === "l4") {
          push("L4 p.101: median of medians 를 쓴 select 의 점화식 '''" + ex.rec + "'''. 부분 문제 크기 n/5, 7n/10 이 달라 master method 불가 → substitution.", 1);
          st.guess = "O(n)";
          push("Step 1 guess(p.102): 이름이 linear-time select 이고, mergesort 점화식보다 작다(부분 문제 크기 합 9n/10 < n) → '''O(n) 추측'''.", 1);
          st.ih = "T(k) ≤ C·k, 1 ≤ k < n";
          push("Inductive hypothesis(p.103): '''모든 1 ≤ k < n 에 대해 T(k) ≤ Ck''', C 는 미정.", 2);
          st.base = "k log k ≤ Ck (k ≤ 100) → C ≥ log 100 ≈ 6.64 → C ≥ 7";
          push("Base case: k ≤ 100 에서 T(k) = k log k ≤ Ck 이려면 C ≥ log k, 가장 큰 k = 100 에서 log₂100 ≈ 6.64 → '''C ≥ 7'''.", 3);
          st.step = "C(n/5) + C(7n/10) + dn = (9C/10)n + dn";
          push("Inductive step: T(n) ≤ T(n/5) + T(7n/10) + dn ≤ C(n/5) + C(7n/10) + dn = '''(9C/10)n + dn'''. (그림은 d = 1 로.)", 4, bar(ex.parts, ex.extra, trial, ex.dLabel));
          st.stepCond = "(9C/10)n + dn ≤ Cn ⟺ d ≤ C/10 ⟺ C ≥ 10d";
          push("(9C/10)n + dn ≤ Cn ⟺ dn ≤ (C/10)n ⟺ '''C ≥ 10d'''. d = 1 일 때 C = 7 은 여유 0.7n 이 dn = n 을 못 담는다.", 5, bar(ex.parts, ex.extra, trial, ex.dLabel));
          st.C = "max{7, 10d}";
          push("base 는 C ≥ 7, step 은 C ≥ 10d → 둘 다 만족: '''C = max{7, 10d}'''. (d = 1 이면 C = 10.)", 6, bar(ex.parts, ex.extra, C, ex.dLabel));
          st.concl = "T(n) ≤ max{7, 10d}·n → T(n) = O(n)";
          push("Conclusion: C = max{7, 10d} 가 존재 → 모든 n ≥ 1 에서 T(n) ≤ max{7, 10d}·n → '''T(n) = O(n)''' — [[linear-time selection]].", 7, bar(ex.parts, ex.extra, C, ex.dLabel));
          push("Step 3(p.104): 답안에는 처음부터 'T(k) ≤ max{7, 10d}k' 로 쓴다 — Pretend we knew C all along.", 8, bar(ex.parts, ex.extra, C, ex.dLabel),
            "시험 포인트: C 가 d 에 의존해도 된다 — d 는 입력 크기 n 과 무관한 상수이기 때문.");
        } else {
          push("HW1 6-b: '''" + ex.rec + "'''. 부분 문제 크기 n/2, n/4, n/8 이 모두 달라 master method 의 전제 위반 → substitution.", 1);
          st.guess = "O(n)";
          push("Step 1 guess: 크기 합 n/2 + n/4 + n/8 = 7n/8 < n. 레벨마다 일이 7/8 배로 줄어 합이 ≤ n·Σ(7/8)^k = 8n → '''O(n) 추측'''.", 1);
          st.ih = "T(k) ≤ C·k, 1 ≤ k < n";
          push("Inductive hypothesis: '''모든 1 ≤ k < n 에 대해 T(k) ≤ Ck'''.", 2);
          st.base = "T(1) = 1 ≤ C → C ≥ 1";
          push("Base case: T(1) = 1 ≤ C·1 → C ≥ 1.", 3);
          st.step = "C(n/2) + C(n/4) + C(n/8) + n = (7C/8)n + n";
          push("Inductive step: T(n) ≤ C(n/2) + C(n/4) + C(n/8) + n = '''(7C/8)n + n'''.", 4, bar(ex.parts, ex.extra, trial, ex.dLabel));
          st.stepCond = "(7C/8)n + n ≤ Cn ⟺ 1 ≤ C/8 ⟺ C ≥ 8";
          push("(7C/8)n + n ≤ Cn ⟺ n ≤ (C/8)n ⟺ '''C ≥ 8'''. C = 4 면 여유 0.5n 이 추가 일 n 을 못 담는다.", 5, bar(ex.parts, ex.extra, trial, ex.dLabel));
          st.C = 8;
          push("C ≥ 1 과 C ≥ 8 을 모두 만족 → '''C = 8'''. 패턴: C = (추가 일 계수)/(1 − 크기 합 비율) = 1/(1 − 7/8) = 8.", 6, bar(ex.parts, ex.extra, C, ex.dLabel));
          st.concl = "T(n) ≤ 8n → T(n) = O(n)";
          push("Conclusion: 모든 n ≥ 1 에서 '''T(n) ≤ 8n''' → O(n). (T(n) ≥ n 이므로 Θ(n).)", 7, bar(ex.parts, ex.extra, C, ex.dLabel));
          push("Step 3 답안: 'T(k) ≤ 8k 를 가정하면 T(n) ≤ 4n + 2n + n + n = 8n' — 처음부터 C = 8 을 안 척.", 8, bar(ex.parts, ex.extra, C, ex.dLabel),
            "같은 패턴: L3 은 1 − 7/10 = 3/10 이 3n 을 흡수 → C = 10, L4 는 1 − 9/10 이 dn 을 흡수 → C = 10d, HW1 6-b 는 1 − 7/8 이 n 을 흡수 → C = 8.");
        }
      }
      return {
        panels: [{ id: "P", title: "substitution method (L3 p.109–116)", lang: "txt", lines: LINES }],
        vars: [
          { name: "rec", label: "점화식", group: "문제" },
          { name: "guess", label: "추측", group: "Step 1" },
          { name: "ih", label: "귀납 가설", group: "Step 2" },
          { name: "base", label: "base case 조건", group: "Step 2" },
          { name: "step", label: "대입한 우변", group: "Step 2" },
          { name: "stepCond", label: "step 조건", group: "Step 2" },
          { name: "C", label: "C", group: "결과" },
          { name: "concl", label: "결론", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
