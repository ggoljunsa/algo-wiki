// median_of_medians — L4 p.76–93 : 5개씩 그룹 → sub-median → median of sub-medians → partition, 3n/10 보장
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var MOM = [
    "median_of_medians(A):",
    "  A 를 g = ⌈n/5⌉ 개 그룹(각 5개 이하)으로 나눈다",
    "  for i = 1..g: 그룹 i 의 median p_i (sub-median) — 그룹당 O(1)",
    "  p = SELECT([p_1, …, p_g], g/2)      # sub-median 들의 median, 재귀",
    "  return p",
    "pivot = median_of_medians(A);  left, right = partition_about_pivot(A, pivot)"
  ];
  var ANAL = [
    "그룹 안은 sub-median 기준으로, 그룹들은 sub-median 순으로 늘어놓는다",
    "sub-median < pivot 인 그룹: 원소 3 개씩(자기 median 이하) pivot 보다 작다",
    "pivot 이 든 그룹: pivot 아래 2 개가 더 작다",
    "보장 개수 ≥ 3·(⌈g/2⌉ − 1 − 1) + 2   (pivot 그룹, 모자랄 수 있는 마지막 그룹 제외)",
    "≥ 3·(n/10 − 2) + 2 = 3n/10 − 4  ⇒  len(left), len(right) ≤ 7n/10 + 3",
    "⇒ T(n) ≤ T(n/5) + T(7n/10) + O(n)"
  ];

  var A = [2, 11, 9, 3, 13, 5, 16, 4, 6, 12, 17, 23, 10, 7, 21, 8, 18, 15, 1, 20, 22, 19, 14];

  function list(a) { return "[" + a.join(", ") + "]"; }
  function sortN(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function medOf(g) { return sortN(g)[Math.floor((g.length - 1) / 2)]; }

  // v: {cols: [[..]], medRow: per col index of median, hiMed: set of col idx whose median shown, cur, mom, guaranteed: set of values, arranged, subs, sel}
  function draw(v) {
    var C = 46, s = '<svg viewBox="0 0 760 320" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="15">';
    var x0 = 30, y0 = 40;
    s += '<text x="' + x0 + '" y="24" font-size="12" fill="#555">' + (v.arranged ? "그룹 안 정렬 + 그룹을 sub-median 순으로 (L4 p.85)" : "5개씩 그룹, 한 열 = 한 그룹 (L4 p.78)") + "</text>";
    v.cols.forEach(function (col, ci) {
      var x = x0 + ci * (C + 8);
      if (v.cur === ci) s += '<rect x="' + (x - 4) + '" y="' + (y0 - 4) + '" width="' + (C + 8) + '" height="' + (5 * C + 8) + '" rx="6" fill="none" stroke="#3b2f4a" stroke-width="2" stroke-dasharray="5 3"/>';
      col.forEach(function (val, ri) {
        var y = y0 + ri * C;
        var fill = "#dbe8f7", stroke = "#1d65b3", sw = 1.5;
        var isMed = v.showMed[ci] && val === v.medVal[ci];
        if (v.guaranteed && v.guaranteed.indexOf(val) >= 0) { fill = "#dff3e4"; stroke = "#2e9e4f"; sw = 2; }
        if (isMed) { fill = "#fff3bf"; stroke = "#d6a017"; sw = 2.5; }
        if (v.mom !== null && val === v.mom) { fill = "#fdeec2"; stroke = "#e09a40"; sw = 3.5; }
        if (v.side && v.mom !== null && val !== v.mom) {
          if (!(v.guaranteed && v.guaranteed.indexOf(val) >= 0) && !isMed) { fill = val < v.mom ? "#e8f0fa" : "#f6f6f6"; stroke = val < v.mom ? "#1d65b3" : "#bbb"; }
        }
        s += '<rect x="' + x + '" y="' + y + '" width="' + (C - 4) + '" height="' + (C - 4) + '" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
        s += '<text x="' + (x + (C - 4) / 2) + '" y="' + (y + 27) + '" text-anchor="middle" font-weight="700" fill="' + (v.side && v.mom !== null && val > v.mom && val !== v.mom && !isMed ? "#999" : "#222") + '">' + val + "</text>";
      });
    });
    // 오른쪽 패널
    var rx = 330;
    s += '<text x="' + rx + '" y="60" font-size="13" fill="#555">sub-medians (노랑):</text>';
    s += '<text x="' + rx + '" y="84" font-size="16" font-weight="700" fill="#b8860b">' + (v.subs.length ? list(v.subs) : "…") + "</text>";
    if (v.sel) {
      s += '<text x="' + rx + '" y="118" font-size="13" fill="#555">SELECT(sub-medians, g/2 = 2) → 정렬 ' + list(sortN(v.subs)) + "</text>";
      s += '<text x="' + rx + '" y="144" font-size="17" font-weight="700" fill="#e09a40">median of medians = ' + v.mom + "</text>";
      s += '<text x="' + rx + '" y="168" font-size="13" fill="#777">(실제 median 은 12 — 같지 않지만 가깝다)</text>';
    }
    if (v.part) {
      s += '<text x="' + rx + '" y="202" font-size="14" fill="#1d65b3">len(left) = ' + v.part[0] + "  (pivot 보다 작은 원소)</text>";
      s += '<text x="' + rx + '" y="224" font-size="14" fill="#777">len(right) = ' + v.part[1] + "  (pivot 보다 큰 원소)</text>";
    }
    if (v.guaranteed) {
      s += '<text x="' + rx + '" y="258" font-size="14" font-weight="700" fill="#2e9e4f">초록 = pivot 보다 작다고 보장된 원소 ' + v.guaranteed.length + " 개</text>";
      if (v.formula) s += '<text x="' + rx + '" y="282" font-size="13" fill="#2e9e4f">공식 하한 3(⌈g/2⌉−2)+2 = ' + v.formula + "  (≤ " + v.guaranteed.length + ")</text>";
    }
    s += '<text x="' + x0 + '" y="314" font-size="11" fill="#777">노랑 = sub-median, 주황 = median of medians (pivot), 초록 = 보장된 작은 원소</text>';
    s += "</svg>";
    return s;
  }

  global.SIMS["median_of_medians"] = {
    title: "median of medians — 좋은 pivot 고르기",
    desc: "L4 p.76–93. [[median of medians]]: A 를 [[5개씩 그룹]] 으로 나눠 각 그룹의 [[sub-median]] 을 구하고, sub-median 들의 median 을 재귀 SELECT 로 찾아 pivot 으로 쓴다. " +
      "이 pivot 은 진짜 median(12)과 같지 않아도 '''양쪽에 최소 3n/10 − 4 개씩'''을 보장한다 — [[3n/10 논증]]. 그래서 select 가 T(n) ≤ T(n/5) + T(7n/10) + O(n) = O(n).",
    options: [],
    build: function () {
      var n = A.length, g = Math.ceil(n / 5);
      var groups = [];
      for (var i = 0; i < g; i++) groups.push(A.slice(i * 5, i * 5 + 5));
      var meds = groups.map(medOf);
      var steps = [];
      var st = { n: n, g: "?", groups: "-", cur: "-", subs: [], mom: "?", med: "?", ll: "?", lr: "?", guar: "?", pic: "?", lower: "?", upper: "?" };
      var showMed = groups.map(function () { return false; });

      function push(desc, pc, viz, note) {
        steps.push({
          desc: desc, pc: pc,
          vars: { n: st.n, g: st.g, groups: st.groups, cur_group: st.cur, sub_medians: st.subs.slice(), mom: st.mom, true_median: st.med, len_left: st.ll, len_right: st.lr, guaranteed: st.guar, counted: st.pic, lower: st.lower, upper: st.upper },
          note: note,
          svg: draw({
            cols: viz.cols, showMed: viz.showMed || showMed.slice(), medVal: viz.medVal || meds, cur: viz.cur, mom: viz.mom === undefined ? null : viz.mom,
            guaranteed: viz.guaranteed || null, arranged: !!viz.arranged, subs: st.subs.slice(), sel: !!viz.sel, part: viz.part || null, side: !!viz.side, formula: viz.formula
          })
        });
      }

      push("입력 A (n = " + n + "): " + list(A) + ". 목표: 진짜 median 에 '''가까운''' pivot 을 O(n) 에 구하기(L4 p.76 'Ideal pivot' 의 근사).",
        { MOM: 1, ANAL: null }, { cols: groups.map(function (x) { return x.slice(); }), showMed: groups.map(function () { return false; }) });
      st.g = g; st.groups = groups.map(function (x) { return x.slice(); });
      push("g = ⌈n/5⌉ = ⌈23/5⌉ = '''" + g + "''' 개 그룹. 앞에서부터 5개씩 끊어 한 열에 하나씩 세운다(마지막 그룹은 3개).",
        { MOM: 2, ANAL: null }, { cols: groups });
      for (var k = 0; k < g; k++) {
        showMed[k] = true; st.cur = groups[k].slice(); st.subs.push(meds[k]);
        push("그룹 " + (k + 1) + " = " + list(groups[k]) + " → 정렬하면 " + list(sortN(groups[k])) + ", sub-median '''" + meds[k] + "'''. 크기 5 이하라 그룹당 O(1), 전체 O(n).",
          { MOM: 3, ANAL: null }, { cols: groups, cur: k });
      }
      st.cur = "-";
      var mom = sortN(meds)[Math.floor(g / 2)];
      st.mom = mom;
      push("`SELECT([9, 6, 17, 15, 19], g/2 = 2)` — 크기 g = n/5 인 리스트에 select 를 '''재귀 호출'''(점화식의 T(n/5) 항). 정렬하면 [6, 9, 15, 17, 19] 의 인덱스 2 = '''15'''.",
        { MOM: 4, ANAL: null }, { cols: groups, mom: mom, sel: true });
      st.med = sortN(A)[Math.floor((n - 1) / 2)];
      push("`return 15` — median of medians = '''15'''. 실제 median 은 " + st.med + "(23 개 중 12 번째)라 같지 않다. 그래도 '''가깝다는 것이 보장'''된다(p.84).",
        { MOM: 5, ANAL: null }, { cols: groups, mom: mom, sel: true });
      var left = A.filter(function (x) { return x < mom; }), right = A.filter(function (x) { return x > mom; });
      st.ll = left.length; st.lr = right.length;
      push("pivot = 15 로 partition: left = " + list(left) + " ('''" + left.length + "''' 개), right = " + list(right) + " ('''" + right.length + "''' 개).",
        { MOM: 6, ANAL: null }, { cols: groups, mom: mom, sel: true, part: [left.length, right.length], side: true });

      // p.85 배치: 그룹 내부 정렬, 그룹을 sub-median 순으로
      var order = groups.map(function (gr, i) { return i; }).sort(function (x, y) { return meds[x] - meds[y]; });
      var cols = order.map(function (i) { return sortN(groups[i]); });
      var cmeds = order.map(function (i) { return meds[i]; });
      var allMed = cols.map(function () { return true; });
      push("왜 가까운가(p.85): 그룹 안을 작은 것이 위로 오게 정렬하고, 그룹들을 sub-median 순서로 늘어놓는다. pivot 15 의 열이 가운데.",
        { MOM: null, ANAL: 1 }, { cols: cols, showMed: allMed, medVal: cmeds, mom: mom, sel: true, part: [left.length, right.length], arranged: true });
      var gset = [];
      cols.forEach(function (c, ci) { if (cmeds[ci] < mom) c.forEach(function (x) { if (x <= cmeds[ci]) gset.push(x); }); });
      push("sub-median 이 15 보다 작은 그룹(median 6, 9): 각 그룹의 median 이하 '''3 개'''는 median < 15 이므로 모두 15 보다 작다 → " + list(sortN(gset)) + ".",
        { MOM: null, ANAL: 2 }, { cols: cols, showMed: allMed, medVal: cmeds, mom: mom, sel: true, part: [left.length, right.length], arranged: true, guaranteed: gset.slice() });
      var momCol = cols[cmeds.indexOf(mom)];
      momCol.forEach(function (x) { if (x < mom) gset.push(x); });
      st.pic = gset.length;
      push("pivot 15 가 든 그룹에서 15 아래 '''2 개'''(1, 8) 추가 → 보장된 원소 " + list(sortN(gset)) + " = '''" + gset.length + " 개''' (슬라이드 p.86: 'At least these (1, 2, 3, 4, 5, 6, 8, 9)'). 7, 11, 12, 13, 14 도 작지만 '''보장'''은 안 된다.",
        { MOM: null, ANAL: 3 }, { cols: cols, showMed: allMed, medVal: cmeds, mom: mom, sel: true, part: [left.length, right.length], arranged: true, guaranteed: gset.slice() });
      var formula = 3 * (Math.ceil(g / 2) - 2) + 2;
      st.guar = formula;
      push("n 의 함수로(p.88): 보장 개수 ≥ 3·(⌈g/2⌉ − 1 − 1) + 2 = 3·(3 − 2) + 2 = '''" + formula + "'''. −1 은 pivot 자신의 그룹(2 개로 따로 셈), 또 −1 은 5 개가 안 될 수도 있는 마지막 그룹을 빼는 보수적 계산. 그래서 그림의 " + gset.length + " 개보다 작은 하한이다.",
        { MOM: null, ANAL: 4 }, { cols: cols, showMed: allMed, medVal: cmeds, mom: mom, sel: true, part: [left.length, right.length], arranged: true, guaranteed: gset.slice(), formula: formula });
      st.lower = Math.round((3 * n / 10 - 4) * 10) / 10; st.upper = Math.round((7 * n / 10 + 3) * 10) / 10;
      push("⌈g/2⌉ ≥ n/10 이므로 보장 개수 ≥ 3(n/10 − 2) + 2 = '''3n/10 − 4''' = 6.9 − 4 = " + st.lower + ". 큰 쪽도 대칭이라 양쪽 모두 ≥ " + st.lower + ", 따라서 어느 쪽도 n − 1 − (3n/10 − 4) ≤ '''7n/10 + 3''' = " + st.upper + " 을 넘지 않는다. 실제: len(right) = " + right.length + " ≥ " + st.lower + ", len(left) = " + left.length + " ≤ " + st.upper + " ✓",
        { MOM: null, ANAL: 5 }, { cols: cols, showMed: allMed, medVal: cmeds, mom: mom, sel: true, part: [left.length, right.length], arranged: true, guaranteed: gset.slice(), formula: formula });
      push("결론: select 의 재귀는 sub-median 들에 한 번(크기 n/5) + 한쪽 부분(크기 ≤ 7n/10 + 3) → '''T(n) ≤ T(n/5) + T(7n/10) + O(n)'''. 크기 합 9n/10 < n 이라 substitution method 로 O(n) (C = max{7, 10d}).",
        { MOM: null, ANAL: 6 }, { cols: cols, showMed: allMed, medVal: cmeds, mom: mom, sel: true, part: [left.length, right.length], arranged: true, guaranteed: gset.slice(), formula: formula },
        "시험 포인트: 보장 개수 공식 3(⌈g/2⌉ − 2) + 2 를 유도할 수 있어야 한다.");

      return {
        panels: [
          { id: "MOM", title: "median_of_medians (L4 p.80)", lang: "txt", lines: MOM },
          { id: "ANAL", title: "얼마나 가까운가 (L4 p.85–93)", lang: "txt", lines: ANAL }
        ],
        vars: [
          { name: "n", group: "입력" },
          { name: "g", label: "g = ⌈n/5⌉", group: "그룹" },
          { name: "groups", label: "그룹들", group: "그룹" },
          { name: "cur_group", label: "현재 그룹", group: "그룹" },
          { name: "sub_medians", label: "sub-medians", group: "pivot" },
          { name: "mom", label: "median of medians", group: "pivot" },
          { name: "true_median", label: "실제 median", group: "pivot" },
          { name: "len_left", label: "len(left)", group: "partition" },
          { name: "len_right", label: "len(right)", group: "partition" },
          { name: "guaranteed", label: "보장 개수 3(⌈g/2⌉−2)+2", group: "3n/10 논증" },
          { name: "counted", label: "그림에서 센 보장 원소", group: "3n/10 논증" },
          { name: "lower", label: "3n/10 − 4", group: "3n/10 논증" },
          { name: "upper", label: "7n/10 + 3", group: "3n/10 논증" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
