window.SIMS = window.SIMS || {};
// counting_sort — L5 p.17–34 (PNG 15–32): counts 배열 채우기 → counts[i] 개씩 extend
(function (global) {
  "use strict";

  var CODE = [
    "def counting_sort(A, k):",
    "  # A consists of n integers ranging from 0 to k-1",
    "  counts = [0] * k",
    "  for i in range(len(A)):",
    "    counts[A[i]] += 1",
    "  result = []",
    "  for i in range(k):",
    "    # Extends result by counts[i] i's",
    "    result.extend([i] * counts[i])",
    "  return result"
  ];

  var A = [0, 0, 3, 1, 1, 3, 1, 0];
  var K = 4;

  function cell(x, y, w, txt, fill, stroke, bold) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="34" rx="3" fill="' + fill +
      '" stroke="' + (stroke || "#667") + '" stroke-width="' + (stroke === "#d6465f" ? 3 : 1.2) + '"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + 22) + '" text-anchor="middle" font-size="15"' +
      (bold ? ' font-weight="700"' : "") + ">" + txt + "</text>";
  }

  function svgFor(st) {
    var s = '<svg viewBox="0 0 760 300" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">';
    // A
    s += '<text x="10" y="42" font-weight="700">A</text>';
    for (var i = 0; i < A.length; i++) {
      var x = 50 + i * 44;
      var hot = st.phase === "count" && st.i === i;
      var done = st.phase !== "count" || (st.i !== null && i < st.i);
      s += cell(x, 20, 40, A[i], hot ? "#fde2e6" : (done && st.phase !== "init" ? "#eef0f4" : "#fff"), hot ? "#d6465f" : null, hot);
      s += '<text x="' + (x + 20) + '" y="68" text-anchor="middle" font-size="10" fill="#888">' + i + "</text>";
    }
    // counts 막대 + 칸
    s += '<text x="420" y="42" font-weight="700">counts</text>';
    for (var v = 0; v < K; v++) {
      var cx = 480 + v * 66;
      var hotc = (st.phase === "count" && st.i !== null && A[st.i] === v) || (st.phase === "extend" && st.j === v);
      s += cell(cx, 20, 58, st.counts[v], hotc ? "#fde2e6" : "#fff", hotc ? "#d6465f" : null, hotc);
      s += '<text x="' + (cx + 29) + '" y="68" text-anchor="middle" font-size="10" fill="#888">값 ' + v + "</text>";
      var h = st.counts[v] * 26;
      s += '<rect x="' + (cx + 12) + '" y="' + (190 - h) + '" width="34" height="' + h + '" fill="' + (hotc ? "#d6465f" : "#8aa4c8") + '"/>';
      s += '<text x="' + (cx + 29) + '" y="206" text-anchor="middle" font-size="11">' + v + "</text>";
    }
    s += '<line x1="480" y1="190" x2="740" y2="190" stroke="#667"/>';
    // result
    s += '<text x="10" y="262" font-weight="700">result</text>';
    for (var r = 0; r < A.length; r++) {
      var rx = 70 + r * 44;
      var has = r < st.result.length;
      s += cell(rx, 240, 40, has ? st.result[r] : "", has ? "#dff3e4" : "#fafafa", null, false);
    }
    s += "</svg>";
    return s;
  }

  global.SIMS["counting_sort"] = {
    title: "counting sort — 값을 인덱스로 세기",
    desc: "L5 p.17–34. [[counting sort]] 는 원소끼리 '''한 번도 비교하지 않는다'''. 값을 [[counts 배열]] 의 인덱스로 써서 개수만 세고, " +
      "0 부터 k−1 까지 counts[i] 개씩 이어붙인다 → [[Θ(n+k)]]. A=[0,0,3,1,1,3,1,0], k=4.",
    options: [],
    build: function () {
      var st = { phase: "init", i: null, j: null, counts: [0, 0, 0, 0], result: [], work: 0 };
      var steps = [];
      function snap() {
        return {
          A: A.slice(), k: K, i: st.i !== null ? st.i : (st.j !== null ? st.j : "-"),
          "A[i]": st.phase === "count" && st.i !== null ? A[st.i] : "-",
          counts: st.counts.slice(), result: st.result.slice(),
          "단계 수": st.work, "원소끼리 비교": 0
        };
      }
      function push(desc, pc, note) {
        var copy = { phase: st.phase, i: st.i, j: st.j, counts: st.counts.slice(), result: st.result.slice() };
        steps.push({ desc: desc, pc: { C: pc }, vars: snap(), note: note, svg: svgFor(copy) });
      }

      push("입력 A 는 0 이상 k−1 = 3 이하의 정수 n = 8 개. `counts = [0] * k` 로 길이 k = 4 짜리 [[counts 배열]]을 0 으로 만든다.", 3);
      st.phase = "count";
      for (var i = 0; i < A.length; i++) {
        st.i = i;
        st.counts[A[i]] += 1;
        st.work += 1;
        push("i = " + i + ": A[" + i + "] = " + A[i] + " → '''값 " + A[i] + " 을 인덱스로''' 써서 `counts[" + A[i] + "] += 1` → counts = [" +
          st.counts.join(", ") + "]. 다른 원소와 비교하지 않는다.", 5);
      }
      st.phase = "extend"; st.i = null;
      push("첫 루프 끝: counts = [" + st.counts.join(", ") + "] — 0 이 3 개, 1 이 3 개, 2 가 0 개, 3 이 2 개. 이제 `result = []`.", 6);
      for (var j = 0; j < K; j++) {
        st.j = j;
        for (var c = 0; c < st.counts[j]; c++) st.result.push(j);
        st.work += 1;
        push("i = " + j + ": `result.extend([" + j + "] * " + st.counts[j] + ")` → " +
          (st.counts[j] ? "값 " + j + " 을 " + st.counts[j] + " 개 붙임." : "counts[2] = 0 이라 아무것도 안 붙지만 '''이 칸도 방문해야 한다''' (그래서 +k)."), 9);
      }
      st.j = null;
      push("`return result` → '''[" + st.result.join(", ") + "]'''. 첫 루프 n = 8 번 + 둘째 루프 k = 4 번 = '''n + k = 12''' 단계, 원소끼리 비교 '''0 회'''. " +
        "비교를 안 하니 [[Ω(n log n) 하한]] 에 걸리지 않는다. 대신 k 가 크면(예: k = 2^64) counts 배열 자체가 감당 불가.", 10,
        "시험 포인트: 수행 시간 Θ(n+k) — k 가 n 에 비해 크면 선형이 아니다. 그래서 값 범위를 쪼개는 [[bucket sort]], 자리별로 여러 번 도는 [[radix sort]] 가 나온다.");

      return {
        panels: [{ id: "C", title: "counting_sort (L5 p.17)", lang: "c", lines: CODE }],
        vars: [
          { name: "A", group: "입력" }, { name: "k", group: "입력" },
          { name: "i", group: "루프" }, { name: "A[i]", group: "루프" },
          { name: "counts", group: "상태" }, { name: "result", group: "상태" },
          { name: "단계 수", group: "비용" }, { name: "원소끼리 비교", group: "비용" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
