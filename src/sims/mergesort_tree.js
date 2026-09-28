// mergesort_tree — L3 p.9–13, 25–32 mergesort 재귀 호출 트리 (Recurse! 로 내려가고 Merge! 로 올라온다)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "def mergesort(A):",
    "  if len(A) <= 1:",
    "    return A",
    "  L = mergesort(A[0:n/2])",
    "  R = mergesort(A[n/2:n])",
    "  return merge(L, R)"
  ];

  var INPUTS = {
    slide: [8, 4, 1, 5, 3, 2, 6, 7],
    clrs: [5, 2, 4, 7, 1, 3, 2, 6]
  };

  function merge(L, R, cnt) {
    var res = [], l = 0, r = 0;
    while (l < L.length && r < R.length) {
      cnt.c++;
      if (L[l] < R[r]) res.push(L[l++]); else res.push(R[r++]);
    }
    return res.concat(L.slice(l), R.slice(r));
  }
  function list(a) { return "[" + a.join(", ") + "]"; }

  // nodes: key "l,k" → {state: idle|active|done, arr, sorted}
  function draw(nodes, n, cur, levels, mode) {
    var s = '<svg viewBox="0 0 760 ' + (levels * 62 + 40) + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">';
    var l, k, cnt, w, x, y, key, nd;
    // edges
    for (l = 1; l < levels; l++) {
      cnt = Math.pow(2, l);
      for (k = 0; k < cnt; k++) {
        var cx = (k + 0.5) * 760 / cnt, px = (Math.floor(k / 2) + 0.5) * 760 / (cnt / 2);
        s += '<line x1="' + px + '" y1="' + ((l - 1) * 62 + 44) + '" x2="' + cx + '" y2="' + (l * 62 + 16) + '" stroke="#bbb" stroke-width="1.5"/>';
      }
    }
    for (l = 0; l < levels; l++) {
      cnt = Math.pow(2, l);
      w = Math.min(760 / cnt - 10, 22 * (n / cnt) + 16);
      y = l * 62 + 16;
      for (k = 0; k < cnt; k++) {
        key = l + "," + k; nd = nodes[key];
        x = (k + 0.5) * 760 / cnt - w / 2;
        var fill = "#fff", stroke = "#ccc", sw = 1.5, tcol = "#999", txt = list(nd.arr).replace(/[\[\]]/g, "");
        if (nd.state === "active") { fill = "#efe9f6"; stroke = "#3b2f4a"; tcol = "#333"; }
        if (nd.state === "done") { fill = "#dff3e4"; stroke = "#2e9e4f"; tcol = "#1c5e30"; txt = nd.sorted.join(", "); }
        if (key === cur) { stroke = "#e09a40"; sw = 3.5; }
        s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="28" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
        s += '<text x="' + (x + w / 2) + '" y="' + (y + 19) + '" text-anchor="middle" fill="' + tcol + '" font-weight="700">' + txt + "</text>";
      }
      s += '<text x="4" y="' + (y + 42) + '" font-size="10" fill="#777">깊이 ' + l + "</text>";
    }
    var yb = levels * 62 + 28;
    if (mode) s += '<text x="380" y="' + yb + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + (mode === "Merge!" ? "#2e9e4f" : "#3b2f4a") + '">' + mode + "</text>";
    s += '<rect x="560" y="' + (yb - 11) + '" width="12" height="12" fill="#efe9f6" stroke="#3b2f4a"/><text x="576" y="' + yb + '" font-size="11" fill="#555">호출 스택 위</text>';
    s += '<rect x="660" y="' + (yb - 11) + '" width="12" height="12" fill="#dff3e4" stroke="#2e9e4f"/><text x="676" y="' + yb + '" font-size="11" fill="#555">정렬 완료</text>';
    s += "</svg>";
    return s;
  }

  global.SIMS["mergesort_tree"] = {
    title: "mergesort 재귀 호출 트리",
    desc: "L3 p.25–32. [[mergesort]] 는 반으로 쪼개 내려가고(Recurse!) 올라오면서 [[merge]] 한다(Merge!). 보라 = 아직 끝나지 않은 호출(스택 위), 초록 = 정렬된 결과를 돌려준 호출, 주황 테두리 = 지금 실행 중. " +
      "각 호출은 '''자기 크기의 리스트를 정렬해 돌려준다'''는 [[recursion invariant]] 가 트리의 아래에서 위로 전파된다([[divide and conquer]]).",
    options: [
      { key: "input", label: "입력", values: [
        { value: "slide", label: "슬라이드 [8,4,1,5,3,2,6,7]" },
        { value: "clrs", label: "[5,2,4,7,1,3,2,6] (CLRS 그림)" }
      ] }
    ],
    build: function (opts) {
      var A = (INPUTS[opts.input] || INPUTS.slide).slice(), n = A.length;
      var levels = Math.round(Math.log(n) / Math.LN2) + 1;
      var nodes = {};
      for (var l = 0; l < levels; l++) {
        var cnt = Math.pow(2, l), sz = n / cnt;
        for (var k = 0; k < cnt; k++) nodes[l + "," + k] = { state: "idle", arr: A.slice(k * sz, (k + 1) * sz), sorted: null };
      }
      var steps = [];
      var st = { call: "-", depth: "-", L: "-", R: "-", result: "-", merges: 0, comparisons: 0, max_depth: 0 };
      var counter = { c: 0 };
      var midResults = [];

      function push(desc, line, cur, mode, note) {
        steps.push({
          desc: desc, pc: { MS: line },
          vars: { call: st.call, depth: st.depth, L: st.L, R: st.R, result: st.result, merges: st.merges, comparisons: st.comparisons, max_depth: st.max_depth },
          note: note, svg: draw(JSON.parse(JSON.stringify(nodes)), n, cur, levels, mode)
        });
      }

      function rec(lv, k) {
        var key = lv + "," + k, nd = nodes[key];
        nd.state = "active";
        st.call = nd.arr.slice(); st.depth = lv; st.L = "-"; st.R = "-"; st.result = "-";
        if (lv > st.max_depth) st.max_depth = lv;
        if (nd.arr.length <= 1) {
          nd.state = "done"; nd.sorted = nd.arr.slice(); st.result = nd.sorted.slice();
          push("깊이 " + lv + ": `mergesort(" + list(nd.arr) + ")` — 원소 1개 → base case, 그대로 `return A`. 원소 하나짜리 리스트는 이미 정렬돼 있다.", 3, key, "Recurse!");
          return nd.sorted;
        }
        push("깊이 " + lv + ": `mergesort(" + list(nd.arr) + ")` 호출. `len(A) = " + nd.arr.length + " > 1` 이므로 반으로 쪼갠다 — '''Recurse!'''", 2, key, "Recurse!");
        var L = rec(lv + 1, 2 * k);
        st.call = nd.arr.slice(); st.depth = lv; st.L = L.slice(); st.R = "-"; st.result = "-";
        push("깊이 " + lv + " 로 복귀: 왼쪽 절반이 정렬돼 돌아왔다 → `L = " + list(L) + "`. 이제 오른쪽 절반을 재귀.", 4, key, "Recurse!");
        var R = rec(lv + 1, 2 * k + 1);
        st.call = nd.arr.slice(); st.depth = lv; st.L = L.slice(); st.R = R.slice(); st.result = "-";
        push("깊이 " + lv + " 로 복귀: `R = " + list(R) + "`. 두 절반 모두 정렬돼 있다([[recursion invariant]] 의 가설).", 5, key, "Recurse!");
        var before = counter.c;
        var res = merge(L, R, counter);
        st.merges++; st.comparisons = counter.c; st.result = res.slice();
        nd.state = "done"; nd.sorted = res;
        if (lv >= 1) midResults.push(list(res));
        push("`merge(" + list(L) + ", " + list(R) + ")` → '''" + list(res) + "''' — '''Merge!''' (비교 " + (counter.c - before) + " 회, 누적 " + counter.c + " 회, merge " + st.merges + " 번째)", 6, key, "Merge!");
        return res;
      }

      push("입력 `A = " + list(A) + "`, n = " + n + ". 트리의 각 칸은 하나의 `mergesort` 호출이다. 회색 칸은 아직 호출되지 않은 부분 문제.", 1, null, null);
      var out = rec(0, 0);
      st.depth = 0;
      push("완료: '''" + list(out) + "'''. 트리 깊이 = log₂" + n + " = " + st.max_depth + ", merge 호출 = n − 1 = " + st.merges + " 번, 비교 총 " + st.comparisons + " 회. " +
        "각 깊이에서 merge 하는 원소 수의 합은 n = " + n + " 으로 같다 → 깊이마다 O(n), 깊이 log n 개 → O(n log n).",
        6, "0,0", "Merge!",
        "시험 포인트: 중간 결과 " + midResults.join(", ") + " 를 손으로 재현할 수 있어야 한다.");

      return {
        panels: [{ id: "MS", title: "mergesort (L3 p.13)", lang: "c", lines: CODE }],
        vars: [
          { name: "call", label: "현재 호출의 A", group: "현재 호출" },
          { name: "depth", label: "깊이", group: "현재 호출" },
          { name: "L", group: "현재 호출" },
          { name: "R", group: "현재 호출" },
          { name: "result", label: "반환값", group: "현재 호출" },
          { name: "merges", label: "merge 횟수", group: "누적" },
          { name: "comparisons", label: "비교 횟수", group: "누적" },
          { name: "max_depth", label: "최대 깊이", group: "누적" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
