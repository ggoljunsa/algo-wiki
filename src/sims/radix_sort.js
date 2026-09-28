window.SIMS = window.SIMS || {};
// radix_sort — L5 p.47–58 (PNG 45–56): 자리 i = 0,1,2 마다 make_pairs → 안정 bucket sort
(function (global) {
  "use strict";

  var CODE = [
    "def radix_sort(A, d, k):",
    "  # A consists of n d-digit integers",
    "  # with digits ranging from 0 to k-1.",
    "  for i in range(d):",
    "    # Creates list of (value's digit i, value) pairs",
    "    A_pairs = make_pairs(A, k, i)",
    "    # Bucket sorts according to first element of",
    "    # pair and returns a list of values",
    "    A_new = bucket_sort_with_pairs(A_pairs, k, k)",
    "    A = A_new",
    "  return result"
  ];
  var MP = [
    "def make_pairs(A, k, i):",
    "  result = []",
    "  for a in A:",
    "    # e.g. a=1023, k=10, i=1: (1023/(10**1))%10 = 2",
    "    key = (a / (k ** i)) % k",
    "    result.append((key, a))",
    "  return result"
  ];

  var A0 = [31, 5, 210, 14, 95, 477, 555, 125];
  var D = 3, K = 10;
  var COLORS = ["#4b6fa8", "#2f8a5b", "#9a5bb0", "#c07a2c", "#3b8f9a", "#8a6d3b", "#b0476a", "#5f6f2f"];

  function pad3(v) { var s = String(v); while (s.length < D) s = "0" + s; return s; }
  function digit(a, i) { return Math.floor(a / Math.pow(K, i)) % K; }

  function svgFor(st) {
    var s = '<svg viewBox="0 0 760 300" width="760" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="15">';
    function row(arr, y, label, hiDigit) {
      var out = '<text x="8" y="' + (y + 22) + '" font-family="sans-serif" font-size="12" font-weight="700">' + label + "</text>";
      for (var t = 0; t < arr.length; t++) {
        var x = 110 + t * 80, v = arr[t], p = pad3(v);
        out += '<rect x="' + x + '" y="' + y + '" width="72" height="34" rx="3" fill="#fff" stroke="' + COLORS[A0.indexOf(v)] + '" stroke-width="2"/>';
        // 자리별 글자, 현재 자리 강조
        for (var c = 0; c < D; c++) {
          var pos = D - 1 - c; // c 번째 글자의 자리 번호
          var hot = hiDigit !== null && pos === hiDigit;
          out += '<text x="' + (x + 18 + c * 18) + '" y="' + (y + 23) + '" text-anchor="middle"' +
            (hot ? ' fill="#d6465f" font-weight="700"' : ' fill="#333"') + ">" + p[c] + "</text>";
        }
      }
      return out;
    }
    s += row(st.before, 20, st.i === null ? "A" : "A (i=" + st.i + " 전)", st.i);
    if (st.after) {
      // 버킷 0..9 요약 (같은 자릿값끼리 순서 유지)
      s += '<text x="8" y="100" font-family="sans-serif" font-size="12" font-weight="700">digit ' + st.i + " 버킷</text>";
      for (var b = 0; b < K; b++) {
        var bx = 110 + b * 64;
        s += '<rect x="' + bx + '" y="84" width="58" height="96" rx="4" fill="#f7f8fb" stroke="#8a93a8"/>';
        s += '<text x="' + (bx + 29) + '" y="196" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#555">' + b + "</text>";
        var inB = st.before.filter(function (v) { return digit(v, st.i) === b; });
        for (var t = 0; t < inB.length; t++) {
          s += '<text x="' + (bx + 29) + '" y="' + (104 + t * 20) + '" text-anchor="middle" font-size="13" fill="' + COLORS[A0.indexOf(inB[t])] + '">' + pad3(inB[t]) + "</text>";
        }
        if (inB.length > 1) s += '<text x="' + (bx + 29) + '" y="176" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#d6465f">순서 유지</text>';
      }
      s += row(st.after, 214, "A_new", st.i);
      if (st.done) {
        s += '<rect x="106" y="210" width="' + (A0.length * 80) + '" height="42" fill="none" stroke="#2f8a5b" stroke-width="2" stroke-dasharray="5 3"/>';
      }
    }
    s += "</svg>";
    return s;
  }

  global.SIMS["radix_sort"] = {
    title: "radix sort — 낮은 자리부터 안정 정렬",
    desc: "L5 p.47–58. [[radix sort]] 는 [[least-significant digit]](일의 자리)부터 한 자리씩, [[make_pairs]] 로 (자릿값, 값) 쌍을 만들어 " +
      "그 자릿값으로 '''안정(stable)''' bucket sort 를 d 번 한다. 같은 자릿값끼리 이전 순서가 유지되는 것이 핵심 → [[Θ(d(n+k))]]. radix_sort(A, 3, 10).",
    options: [],
    build: function () {
      var A = A0.slice();
      var steps = [];
      var st = { i: null, pairs: "-", A_new: "-" };

      function snap(A) {
        return {
          A: A.map(pad3), d: D, k: K, i: st.i === null ? "-" : st.i,
          A_pairs: st.pairs, A_new: st.A_new, "비용 d(n+k)": st.i === null ? "-" : (st.cost || "-")
        };
      }
      function push(desc, pc, vis, note) {
        steps.push({ desc: desc, pc: pc, vars: snap(A), note: note, svg: svgFor(vis) });
      }

      push("A = [31, 5, 210, 14, 95, 477, 555, 125] 는 '''3 자리''' 정수 n = 8 개, 자릿값 0–9 (k = 10). 짧은 수는 앞에 0 을 채워 005, 014 처럼 본다.",
        { R: 1, M: null }, { i: null, before: A.slice(), after: null });
      for (var i = 0; i < D; i++) {
        st.i = i;
        var pairs = A.map(function (a) { return [digit(a, i), a]; });
        st.pairs = pairs.map(function (p) { return "(" + p[0] + "," + pad3(p[1]) + ")"; }).join(" ");
        st.A_new = "-";
        st.cost = (i + 1) + "×(8+10) = " + ((i + 1) * 18) + " 누적";
        push("i = " + i + " (" + ["일의", "십의", "백의"][i] + " 자리): `make_pairs(A, 10, " + i + ")` — 각 a 에 대해 key = (a / 10^" + i + ") % 10. " +
          "쌍 목록: " + st.pairs + ".", { R: 6, M: 5 }, { i: i, before: A.slice(), after: null });
        var newA = [];
        for (var b = 0; b < K; b++) pairs.forEach(function (p) { if (p[0] === b) newA.push(p[1]); });
        st.A_new = newA.map(pad3);
        push("`bucket_sort_with_pairs(A_pairs, 10, 10)` — 자릿값 0–9 버킷에 '''도착 순서대로''' 담고 0 번 버킷부터 이어붙인다. 버킷 수 = k 이므로 버킷 안 재정렬은 없다. " +
          "결과 [" + st.A_new.join(", ") + "]." + (i > 0 ? " 같은 자릿값끼리는 '''이전 라운드 순서가 유지'''된다(그래서 낮은 자리 정렬이 보존됨)." : ""),
          { R: 9, M: null }, { i: i, before: A.slice(), after: newA.slice() });
        var prev = A.slice();
        A = newA;
        push("`A = A_new` → A = [" + A.map(pad3).join(", ") + "]." + (i === D - 1 ? "" : " 다음 자리로."), { R: 10, M: null },
          { i: i, before: prev, after: A.slice(), done: i === D - 1 });
      }
      st.cost = "3×(8+10) = 54";
      push("루프 끝: '''[" + A.map(pad3).join(", ") + "]''' 정렬 완료. 라운드마다 make_pairs Θ(n) + bucket sort Θ(n + k) → 총 '''d(n + k) = 3(8 + 10) = 54'''. " +
        "d, k 가 상수면 Θ(n).", { R: 11, M: null }, { i: D - 1, before: A.slice(), after: A.slice(), done: true },
        "슬라이드 코드 마지막 줄 `return result` 는 오타다 — 반환해야 하는 것은 마지막 라운드의 `A` 다.");

      return {
        panels: [
          { id: "R", title: "radix_sort (L5 p.47)", lang: "c", lines: CODE },
          { id: "M", title: "make_pairs (L5 p.52)", lang: "c", lines: MP }
        ],
        vars: [
          { name: "A", group: "상태" }, { name: "d", group: "입력" }, { name: "k", group: "입력" },
          { name: "i", group: "루프" }, { name: "A_pairs", group: "루프" }, { name: "A_new", group: "루프" },
          { name: "비용 d(n+k)", group: "비용" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
