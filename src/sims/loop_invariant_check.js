// loop_invariant_check — L1 p.44–52 insertion sort 의 loop invariant, HW1 3번 selection sort 의 invariant 를 반복마다 검사
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var INS_CODE = [
    "def insertion_sort(A):",
    "  for i in range(1, len(A)):",
    "    cur_value = A[i]",
    "    j = i - 1",
    "    while j >= 0 and A[j] > cur_value:",
    "      A[j+1] = A[j]",
    "      j -= 1",
    "    A[j+1] = cur_value"
  ];
  var SEL_CODE = [
    "def selection_sort(A):",
    "  for i in range(len(A)-1):",
    "    min_idx = i",
    "    for j in range(i+1, len(A)):",
    "      if A[j] < A[min_idx]:",
    "        min_idx = j",
    "    swap(min_idx, i)"
  ];
  var INS_PROOF = [
    "Loop invariant(i): A[:i+1] is sorted",
    "Inductive Hypothesis: 바깥 루프 i 번째 반복 끝에 invariant(i) 성립",
    "Base case (i = 0): A[:1] 은 원소 1개 → sorted  [Initialization]",
    "Inductive step: invariant(i-1) + A[i] 를 올바르게 삽입 → A[:i+1] sorted  [Maintenance]",
    "(검사) 실제 배열에서 A[:i+1] 이 sorted 인지 확인",
    "Conclusion: i = n-1 에서 A[:n] = A 전체가 sorted → correct  [Termination]"
  ];
  var SEL_PROOF = [
    "Inv(i): i 번째 반복 시작 시 A[:i] sorted, 그리고 A[:i] <= A[i:] (모든 원소끼리)",
    "Inductive Hypothesis: Inv(i) 성립",
    "Base case (i = 0): A[:0] 은 빈 리스트 → 공허하게(vacuously) 참  [Initialization]",
    "Inductive step: 내부 루프가 min(A[i:]) 위치를 찾아 swap → Inv(i+1)  [Maintenance]",
    "(검사) 실제 배열에서 두 조건을 확인",
    "Conclusion: i = n-1 에서 A[:n-1] sorted, A[:n-1] <= A[n-1] → A 전체 sorted  [Termination]"
  ];

  function isSorted(a) {
    for (var k = 1; k < a.length; k++) if (a[k - 1] > a[k]) return false;
    return true;
  }
  function list(a) { return "[" + a.join(", ") + "]"; }

  // v: {A, green, split, phase, ok, mark}
  function draw(v) {
    var n = v.A.length, W = 40, G = 6;
    var x0 = (760 - (n * W + (n - 1) * G)) / 2, y = 90;
    var s = '<svg viewBox="0 0 760 200" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="16">';
    var pc = v.ok === false ? "#d6465f" : "#2e9e4f";
    s += '<rect x="230" y="14" width="300" height="34" rx="17" fill="' + (v.ok === false ? "#fbe3e7" : "#dff3e4") + '" stroke="' + pc + '" stroke-width="2"/>';
    s += '<text x="380" y="37" text-anchor="middle" font-size="15" font-weight="700" fill="' + pc + '">' + v.phase + "</text>";
    for (var k = 0; k < n; k++) {
      var x = x0 + k * (W + G);
      var inG = k < v.green;
      var fill = inG ? "#dff3e4" : "#dbe8f7", stroke = inG ? "#2e9e4f" : "#1d65b3";
      if (v.mark && v.mark.indexOf(k) >= 0) { fill = "#fdeec2"; stroke = "#e09a40"; }
      s += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + W + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>';
      s += '<text x="' + (x + W / 2) + '" y="' + (y + 26) + '" text-anchor="middle" font-weight="700">' + v.A[k] + "</text>";
      s += '<text x="' + (x + W / 2) + '" y="' + (y + 58) + '" text-anchor="middle" font-size="11" fill="#777">' + k + "</text>";
    }
    if (v.green > 0) {
      var gx = x0 + v.green * (W + G) - G / 2;
      s += '<line x1="' + gx + '" y1="' + (y - 12) + '" x2="' + gx + '" y2="' + (y + W + 12) + '" stroke="#2e9e4f" stroke-width="2" stroke-dasharray="4 3"/>';
      s += '<text x="' + x0 + '" y="' + (y - 18) + '" font-size="12" fill="#2e9e4f">' + v.label + "</text>";
      if (v.split) s += '<text x="' + gx + '" y="' + (y + W + 42) + '" text-anchor="middle" font-size="13" fill="#2e9e4f">왼쪽 ≤ 오른쪽</text>';
    } else if (v.label) {
      s += '<text x="' + x0 + '" y="' + (y - 18) + '" font-size="12" fill="#2e9e4f">' + v.label + "</text>";
    }
    s += "</svg>";
    return s;
  }

  global.SIMS["loop_invariant_check"] = {
    title: "loop invariant 를 반복마다 검사",
    desc: "[[loop invariant]] 증명은 반복 횟수에 대한 [[귀납법 4요소]] 다. 바깥 루프가 한 번 돌 때마다 invariant 가 실제 배열에서 참인지 확인하고, " +
      "지금이 Base case / Inductive step / Conclusion 중 어디인지 표시한다(CLRS 이름은 [[Initialization/Maintenance/Termination]]). " +
      "selection sort 는 HW1 3번 — '''sorted 만으로는 부족하고 A[:i] ≤ A[i:] 가 함께 있어야''' 귀납이 굴러간다([[selection sort]]).",
    options: [
      { key: "algo", label: "알고리즘", values: [
        { value: "insertion", label: "insertion sort — A[:i+1] is sorted (L1 p.47)" },
        { value: "selection", label: "selection sort — A[:i] sorted ∧ A[:i] ≤ A[i:] (HW1 3번)" }
      ] }
    ],
    build: function (opts) {
      var sel = opts.algo === "selection";
      var A = [4, 3, 1, 5, 2], n = A.length;
      var steps = [];
      var st = { i: "-", phase: "시작", inv: "-", region: "-", holds: "-", min_idx: "-" };

      function push(desc, pc, viz, note) {
        var vars = { i: st.i, phase: st.phase, invariant: st.inv, region: st.region, holds: st.holds, A: A.slice() };
        if (sel) vars.min_idx = st.min_idx;
        steps.push({
          desc: desc, pc: pc, vars: vars, note: note,
          svg: draw({ A: A.slice(), green: viz.green, split: viz.split, phase: st.phase, ok: st.holds === "-" ? null : st.holds, mark: viz.mark, label: viz.label || "" })
        });
      }

      if (!sel) {
        st.inv = "A[:i+1] is sorted";
        push("입력 `A = [4, 3, 1, 5, 2]`. 교수의 출발점: '''find things that don't change'''. 삽입 정렬에서 바깥 루프가 돌아도 변하지 않는 것 = " +
          "'''앞부분 `A[:i+1]` 은 항상 정렬돼 있다''' (L1 p.45). 이것을 [[loop invariant]] 로 삼는다.",
          { CODE: 1, PROOF: 1 }, { green: 0 });
        st.i = 0; st.phase = "Base case"; st.region = "A[:1] = [4]"; st.holds = isSorted(A.slice(0, 1));
        push("'''Base case (i = 0)''': 알고리즘이 시작하기 전, `A[:1] = [4]` 는 원소가 하나뿐이라 당연히 sorted. → invariant(0) 참.",
          { CODE: 2, PROOF: 3 }, { green: 1, label: "A[:1] sorted ✓" });
        for (var i = 1; i < n; i++) {
          var cur = A[i], j = i - 1;
          while (j >= 0 && A[j] > cur) { A[j + 1] = A[j]; j--; }
          A[j + 1] = cur;
          st.i = i; st.phase = "Inductive step"; st.holds = "-"; st.region = "-";
          push("반복 i = " + i + " 실행: 가설 invariant(" + (i - 1) + ") 에 의해 `A[:" + i + "]` 는 sorted 였다. 거기에 `A[" + i + "] = " + cur + "` 를 올바른 자리(인덱스 " + (j + 1) + ")에 끼워 넣었다 → `A = " + list(A) + "`.",
            { CODE: 8, PROOF: 4 }, { green: i, mark: [j + 1], label: "가설: A[:" + i + "] sorted" });
          st.region = "A[:" + (i + 1) + "] = " + list(A.slice(0, i + 1));
          st.holds = isSorted(A.slice(0, i + 1));
          push("검사: `A[:" + (i + 1) + "] = " + list(A.slice(0, i + 1)) + "` → sorted '''" + st.holds + "'''. invariant(" + (i - 1) + ") ⇒ invariant(" + i + ") 가 이 반복에서도 성립." +
            (i === 2 ? " (L1 p.51 의 그림: `[3, 4]` 에 1 을 넣어 `[1, 3, 4]` — 한 칸 더 긴 정렬 리스트.)" : ""),
            { CODE: 2, PROOF: 5 }, { green: i + 1, label: "A[:" + (i + 1) + "] sorted ✓" });
        }
        st.i = n - 1; st.phase = "Conclusion"; st.region = "A[:" + n + "] = " + list(A); st.holds = isSorted(A);
        push("'''Conclusion''': 마지막 반복 i = n−1 = " + (n - 1) + " 이 끝났을 때 invariant 에 의해 `A[:n] = " + list(A) + "` 이 sorted. A[:n] 이 곧 A 전체이므로 insertion sort 는 '''correct'''.",
          { CODE: 2, PROOF: 6 }, { green: n, label: "A[:n] = A 전체 sorted ✓" },
          "시험 포인트: 4요소 — Inductive Hypothesis / Base case / Inductive step / Conclusion 을 이름 그대로 쓸 것.");
      } else {
        st.inv = "A[:i] sorted ∧ A[:i] <= A[i:]";
        push("입력 `A = [4, 3, 1, 5, 2]`. selection sort 는 매 반복 남은 구간의 최솟값을 앞으로 가져온다. invariant 후보 '''A[:i] 가 sorted''' 만으로는 부족하다 — " +
          "예: `A[:2] = [1, 9]` 가 sorted 여도 뒤에 5 가 남아 있으면 `[1, 9, 5]` 가 된다. 그래서 '''A[:i] 의 모든 원소 ≤ A[i:] 의 모든 원소''' 를 같이 넣는다.",
          { CODE: 1, PROOF: 1 }, { green: 0 });
        st.i = 0; st.phase = "Base case"; st.region = "A[:0] = []"; st.holds = true;
        push("'''Base case (i = 0)''': `A[:0]` 은 빈 리스트 → sorted 이고, '빈 집합의 모든 원소 ≤ …' 는 공허하게(vacuously) 참. Inv(0) 성립.",
          { CODE: 2, PROOF: 3 }, { green: 0, label: "A[:0] = [] (공허하게 참)" });
        for (var t = 0; t < n - 1; t++) {
          var m = t;
          for (var q = t + 1; q < n; q++) if (A[q] < A[m]) m = q;
          st.i = t; st.min_idx = m; st.phase = "Inductive step"; st.holds = "-"; st.region = "-";
          push("반복 i = " + t + ": 내부 루프가 `A[" + t + ":] = " + list(A.slice(t)) + "` 를 훑어 최솟값 " + A[m] + " 의 위치 `min_idx = " + m + "` 를 찾았다.",
            { CODE: 6, PROOF: 4 }, { green: t, split: t > 0, mark: [m], label: t > 0 ? "가설: A[:" + t + "] sorted, ≤ 오른쪽" : "" });
          var tmp = A[t]; A[t] = A[m]; A[m] = tmp;
          push("`swap(" + m + ", " + t + ")` → `A = " + list(A) + "`. swap 은 인덱스 ≥ " + t + " 만 건드리므로 `A[:" + t + "]` 는 그대로다.",
            { CODE: 7, PROOF: 4 }, { green: t, split: t > 0, mark: [t, m], label: t > 0 ? "가설: A[:" + t + "] sorted, ≤ 오른쪽" : "" });
          var lp = A.slice(0, t + 1), rp = A.slice(t + 1);
          var ok = isSorted(lp) && Math.max.apply(null, lp) <= Math.min.apply(null, rp);
          st.i = t + 1; st.region = "A[:" + (t + 1) + "] = " + list(lp) + " | A[" + (t + 1) + ":] = " + list(rp); st.holds = ok;
          push("검사 Inv(" + (t + 1) + "): `A[:" + (t + 1) + "] = " + list(lp) + "` sorted, 그리고 max " + Math.max.apply(null, lp) + " ≤ 오른쪽 min " + Math.min.apply(null, rp) + " → '''" + ok + "'''. (i = " + t + " 반복 결과 A = " + list(A) + ")",
            { CODE: 2, PROOF: 5 }, { green: t + 1, split: true, label: "A[:" + (t + 1) + "] sorted, ≤ 오른쪽 ✓" });
        }
        st.i = n - 1; st.phase = "Conclusion"; st.min_idx = "-"; st.region = "A[:" + (n - 1) + "] ≤ A[" + (n - 1) + "] = " + A[n - 1]; st.holds = isSorted(A);
        push("'''Conclusion''': 바깥 루프는 i = n−1 = " + (n - 1) + " 에서 끝난다. Inv(n−1): `A[:4]` 는 sorted 이고 모두 `A[4] = " + A[n - 1] + "` 이하 → A 전체 `" + list(A) + "` 가 sorted. " +
          "마지막 원소를 따로 처리하지 않아도 되는 이유가 바로 두 번째 조건이다.",
          { CODE: 2, PROOF: 6 }, { green: n, label: "A 전체 sorted ✓" },
          "시험 포인트(HW1 3번): invariant 에 '''A[:i] ≤ A[i:]''' 를 빠뜨리면 Inductive step 이 성립하지 않는다.");
      }

      var vars = [
        { name: "i", group: "루프" },
        { name: "phase", label: "귀납 단계", group: "증명" },
        { name: "invariant", group: "증명" },
        { name: "region", label: "검사 구간", group: "증명" },
        { name: "holds", label: "성립?", group: "증명" },
        { name: "A", group: "배열" }
      ];
      if (sel) vars.splice(1, 0, { name: "min_idx", group: "루프" });
      return {
        panels: [
          { id: "CODE", title: sel ? "selection_sort (HW1 3번)" : "insertion_sort (L1 p.10)", lang: "c", lines: sel ? SEL_CODE : INS_CODE },
          { id: "PROOF", title: "귀납법 4요소 (L1 p.46–52)", lang: "txt", lines: sel ? SEL_PROOF : INS_PROOF }
        ],
        vars: vars,
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
