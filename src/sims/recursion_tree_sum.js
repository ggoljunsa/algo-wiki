// recursion_tree_sum — L3 p.66–84 recursion tree / iteration method, n = 8, c = 1, T(1) = 1
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var N = 8, K = 3; // log2 8
  var RECS = {
    a2: { a: 2, label: "2T(n/2) + n (mergesort, 균형)", name: "2T(n/2) + n" },
    a4: { a: 4, label: "4T(n/2) + n (bushy — 리프 지배)", name: "4T(n/2) + n" },
    a1: { a: 1, label: "T(n/2) + n (tall and skinny — 루트 지배)", name: "T(n/2) + n" }
  };

  var TREE = [
    "T(n) = a·T(n/2) + c·n,  T(1) = 1,  n = 8, c = 1",
    "레벨 i: 노드 a^i 개, 각 크기 n/2^i, 노드 비용 c·n/2^i",
    "레벨 합 = a^i · c·n/2^i = c·n·(a/2)^i",
    "리프 레벨 i = log2(n): 노드 a^log2(n) = n^log2(a) 개 × T(1)",
    "총합 = 모든 레벨 합을 더한다",
    "누가 지배? a<2 루트 / a=2 모든 레벨 같음 / a>2 리프"
  ];
  var ITER = [
    "T(n) = a·T(n/2) + c·n,  T(1) = 1,  n = 8, c = 1",
    "T(n/2) 를 대입: a^2·T(n/4) + cn(1 + a/2)",
    "한 번 더: a^3·T(n/8) + cn(1 + a/2 + (a/2)^2)",
    "패턴: a^k·T(n/2^k) + cn·Σ_{i<k} (a/2)^i   (a=2 이면 2^k·T(n/2^k) + k·cn)",
    "k = log2(n) 이면 n/2^k = 1 → T(1) 을 대입",
    "숫자를 넣어 계산"
  ];

  function frac(x) {
    if (x === Math.floor(x)) return String(x);
    if (x * 2 === Math.floor(x * 2)) return (x * 2) + "/2";
    if (x * 4 === Math.floor(x * 4)) return (x * 4) + "/4";
    return String(x);
  }

  function drawTree(a, shown, sums) {
    var s = '<svg viewBox="0 0 760 300" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    var maxSum = Math.pow(a, K) > N ? Math.pow(a, K) : N;
    for (var i = 0; i <= K; i++) {
      var y = 30 + i * 66, cnt = Math.pow(a, i), size = N / Math.pow(2, i), leaf = i === K;
      var on = i < shown, col = leaf ? "#2e9e4f" : "#3b2f4a", bg = leaf ? "#dff3e4" : "#efe9f6";
      s += '<text x="6" y="' + (y + 4) + '" font-size="11" fill="#777">레벨 ' + i + "</text>";
      s += '<text x="6" y="' + (y + 18) + '" font-size="10" fill="#777">크기 ' + size + "</text>";
      var cost = leaf ? "1" : String(size);
      if (cnt <= 16) {
        var span = 470, x0 = 70;
        for (var k = 0; k < cnt; k++) {
          var cx = x0 + (k + 0.5) * span / cnt;
          if (i > 0) {
            var pcnt = Math.pow(a, i - 1), pk = Math.floor(k / a);
            s += '<line x1="' + (x0 + (pk + 0.5) * span / pcnt) + '" y1="' + (y - 52) + '" x2="' + cx + '" y2="' + (y - 14) + '" stroke="' + (on ? "#bbb" : "#eee") + '"/>';
          }
          var r = cnt <= 4 ? 16 : 12;
          s += '<circle cx="' + cx + '" cy="' + y + '" r="' + r + '" fill="' + (on ? bg : "#fff") + '" stroke="' + (on ? col : "#ddd") + '" stroke-width="2"/>';
          if (on) s += '<text x="' + cx + '" y="' + (y + 4) + '" text-anchor="middle" font-weight="700" fill="' + col + '">' + cost + "</text>";
        }
      } else {
        s += '<rect x="70" y="' + (y - 14) + '" width="470" height="28" rx="6" fill="' + (on ? bg : "#fff") + '" stroke="' + (on ? col : "#ddd") + '" stroke-width="2" stroke-dasharray="' + (on ? "0" : "4 3") + '"/>';
        for (var d = 0; d < 64; d++) s += '<circle cx="' + (80 + d * 7.2) + '" cy="' + y + '" r="2.6" fill="' + (on ? col : "#eee") + '"/>';
        if (on) s += '<text x="305" y="' + (y + 26) + '" text-anchor="middle" font-size="11" fill="' + col + '">리프 ' + cnt + " 개 × T(1) = 1</text>";
      }
      // 레벨 합 막대
      if (on) {
        var bw = sums[i] / maxSum * 170;
        s += '<rect x="560" y="' + (y - 10) + '" width="' + Math.max(bw, 2) + '" height="20" fill="' + (leaf ? "#2e9e4f" : "#1d65b3") + '" opacity="0.8"/>';
        s += '<text x="' + (566 + Math.max(bw, 2)) + '" y="' + (y + 5) + '" font-weight="700" fill="#333">' + sums[i] + "</text>";
      }
    }
    s += '<text x="560" y="14" font-size="11" fill="#777">레벨 합</text>';
    var tot = 0; for (var q = 0; q < shown; q++) tot += sums[q];
    s += '<text x="70" y="292" font-size="13" fill="#333">지금까지 합 = ' + tot + "</text>";
    s += "</svg>";
    return s;
  }

  function drawIter(lines) {
    var s = '<svg viewBox="0 0 760 ' + (40 + lines.length * 28) + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="15">';
    lines.forEach(function (ln, k) {
      var last = k === lines.length - 1;
      s += '<text x="20" y="' + (32 + k * 28) + '" fill="' + (last ? "#1d65b3" : "#555") + '" font-weight="' + (last ? "700" : "400") + '">' + ln.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</text>";
    });
    s += "</svg>";
    return s;
  }

  global.SIMS["recursion_tree_sum"] = {
    title: "recursion tree 레벨 합 / iteration 전개",
    desc: "L3 p.66–84. n = 8, c = 1, T(1) = 1 로 숫자를 넣어 [[recursion tree method]] 의 레벨 합을 채우거나, [[iteration method]] 로 대입을 반복해 패턴을 찾는다. " +
      "a = 2 는 모든 레벨이 같고, a = 4 는 아래로 갈수록 커져 리프가 지배(bushy), a = 1 은 위가 지배(tall and skinny) — [[bushy tree와 tall and skinny tree]], [[eternal struggle]]. 점화식은 [[T(n)]] 의 정의 그대로.",
    options: [
      { key: "rec", label: "점화식", values: [
        { value: "a2", label: RECS.a2.label },
        { value: "a4", label: RECS.a4.label },
        { value: "a1", label: RECS.a1.label }
      ] },
      { key: "method", label: "방법", values: [
        { value: "tree", label: "recursion tree" },
        { value: "iter", label: "iteration (대입 반복)" }
      ] }
    ],
    build: function (opts) {
      var R = RECS[opts.rec] || RECS.a2, a = R.a;
      var iter = opts.method === "iter";
      var sums = [];
      for (var i = 0; i < K; i++) sums.push(Math.pow(a, i) * N / Math.pow(2, i));
      sums.push(Math.pow(a, K)); // 리프: a^K × T(1)
      var total = sums.reduce(function (x, y) { return x + y; }, 0);
      var dom = a < 2 ? "루트 지배 (위가 무겁다)" : (a === 2 ? "모든 레벨 같음" : "리프 지배 (아래가 무겁다)");
      var closed = a === 2 ? "n log2(n) + n = 8·3 + 8 = 32" : (a === 4 ? "리프 n^2 = 64 가 과반 → O(n^2)" : "루트 cn = 8 이 과반 → O(n)");
      var steps = [];

      if (!iter) {
        var st = { level: "-", nodes: "-", size: "-", node_cost: "-", level_sum: "-", level_sums: [], total: 0, dominant: "?" };
        var push = function (desc, line, shown, note) {
          steps.push({
            desc: desc, pc: { P: line },
            vars: { level: st.level, nodes: st.nodes, size: st.size, node_cost: st.node_cost, level_sum: st.level_sum, level_sums: st.level_sums.slice(), total: st.total, dominant: st.dominant },
            note: note, svg: drawTree(a, shown, sums)
          });
        };
        push("점화식 '''T(n) = " + R.name + "''', n = 8, c = 1, T(1) = 1. 한 번의 호출이 하는 일(c·크기)을 노드에 적고, 레벨마다 더한다. 부분 문제 수 a = " + a + ", 크기는 매번 절반.", 1, 0);
        for (var lv = 0; lv <= K; lv++) {
          var leaf = lv === K;
          st.level = lv; st.nodes = Math.pow(a, lv); st.size = N / Math.pow(2, lv);
          st.node_cost = leaf ? "T(1) = 1" : st.size;
          st.level_sum = sums[lv]; st.level_sums.push(sums[lv]); st.total += sums[lv];
          if (!leaf) {
            push("레벨 " + lv + ": 노드 a^" + lv + " = '''" + st.nodes + "''' 개, 각 크기 " + st.size + ", 노드당 비용 c·" + st.size + " = " + st.size + ". 레벨 합 = " + st.nodes + " × " + st.size + " = '''" + sums[lv] + "'''" +
              (lv > 0 ? " (위 레벨의 " + frac(a / 2) + " 배)." : "."), lv === 0 ? 2 : 3, lv + 1);
          } else {
            push("리프 레벨 " + lv + " = log₂8: 크기 1 인 부분 문제가 a^3 = '''" + st.nodes + "''' 개(= n^log2(a)), 각각 T(1) = 1 → 레벨 합 '''" + sums[lv] + "'''.", 4, lv + 1);
          }
        }
        push("모든 레벨 합: " + sums.join(" + ") + " = '''" + total + "'''." + (a === 2 ? " = n log₂n + n = 24 + 8. 슬라이드 p.73 의 cn log₂n + cn." : ""), 5, K + 1);
        st.dominant = dom;
        push("누가 지배하나? 레벨 합이 " + sums.join(", ") + " → '''" + dom + "'''. " + closed + ". 이것이 [[eternal struggle]] — 가지 수 a 와 크기 축소 b^d = 2 의 줄다리기.",
          6, K + 1, a === 2 ? "시험 포인트: 매 레벨 cn, 레벨 log₂n + 1 개 → cn log₂n + cn = O(n log n)." : null);
      } else {
        var lines = [];
        var st2 = { k: 0, expr: "T(8)", accum: 0, total: "?" };
        var push2 = function (desc, line, note) {
          steps.push({ desc: desc, pc: { P: line }, vars: { k: st2.k, expr: st2.expr, accum: st2.accum, total: st2.total }, note: note, svg: drawIter(lines.slice()) });
        };
        var A = function (p) { return p === 0 ? "" : (Math.pow(a, p) === 1 ? "" : Math.pow(a, p) + "·"); };
        lines.push("T(8) = " + A(1) + "T(4) + 8");
        st2.k = 1; st2.expr = A(1) + "T(4) + 8"; st2.accum = 8;
        push2("대입 1 회(k = 1): T(8) = " + st2.expr + ". 앞부분(재귀 몫)과 뒷부분(이미 계산된 일)을 따로 본다.", 1);
        var acc = 8;
        acc += a * 4;
        lines.push("     = " + A(1) + "(" + A(1) + "T(2) + 4) + 8 = " + A(2) + "T(2) + " + acc);
        st2.k = 2; st2.expr = A(2) + "T(2) + " + acc; st2.accum = acc;
        push2("T(4) = " + A(1) + "T(2) + 4 를 대입(k = 2): " + st2.expr + ". 뒷부분 = 8 + " + a + "·4 = " + acc + ".", 2);
        acc += a * a * 2;
        lines.push("     = " + A(2) + "(" + A(1) + "T(1) + 2) + " + (acc - a * a * 2) + " = " + A(3) + "T(1) + " + acc);
        st2.k = 3; st2.expr = A(3) + "T(1) + " + acc; st2.accum = acc;
        push2("T(2) = " + A(1) + "T(1) + 2 를 대입(k = 3): " + st2.expr + ".", 3);
        var pat = a === 2 ? "2^k·T(n/2^k) + k·c·n" : (a === 4 ? "4^k·T(n/2^k) + c·n·(1 + 2 + … + 2^(k-1))" : "T(n/2^k) + c·n·(1 + 1/2 + … + (1/2)^(k-1))");
        lines.push("패턴: T(n) = " + pat);
        push2("패턴: '''" + pat + "'''" + (a === 2 ? " — 슬라이드 p.84 의 2^k T(n/2^k) + kcn." : "."), 4);
        var exprK = a === 2 ? "8T(1) + 3·8" : (a === 4 ? "64T(1) + 8(1 + 2 + 4)" : "1·T(1) + 8(1 + 1/2 + 1/4)");
        lines.push("k = log2(8) = 3:  T(8) = " + exprK);
        st2.expr = exprK;
        push2("k = log₂8 = 3 이면 n/2^k = 1 → T(1) 이 나온다: '''T(8) = " + exprK + "'''.", 5);
        st2.total = total;
        lines.push("        = " + Math.pow(a, K) + " + " + (total - Math.pow(a, K)) + " = " + total);
        push2("T(1) = 1 을 넣으면 " + Math.pow(a, K) + " + " + (total - Math.pow(a, K)) + " = '''" + total + "''' — recursion tree 의 총합과 같다. " + closed + ".", 6,
          a === 2 ? "일반형: 2^(log2 n)·T(1) + cn log2 n = nT(1) + cn log2 n ≤ cn + cn log2 n = O(n log n) (p.84)." : null);
      }

      var vars = iter ? [
        { name: "k", label: "대입 횟수 k", group: "전개" },
        { name: "expr", label: "T(8) =", group: "전개" },
        { name: "accum", label: "쌓인 일(뒷부분)", group: "전개" },
        { name: "total", label: "T(8) 값", group: "결과" }
      ] : [
        { name: "level", label: "레벨 i", group: "현재 레벨" },
        { name: "nodes", label: "노드 수", group: "현재 레벨" },
        { name: "size", label: "부분 문제 크기", group: "현재 레벨" },
        { name: "node_cost", label: "노드당 비용", group: "현재 레벨" },
        { name: "level_sum", label: "레벨 합", group: "현재 레벨" },
        { name: "level_sums", label: "레벨 합 목록", group: "누적" },
        { name: "total", label: "총합", group: "누적" },
        { name: "dominant", label: "지배하는 쪽", group: "누적" }
      ];
      return { panels: [{ id: "P", title: iter ? "iteration method (L3 p.78–84)" : "recursion tree method (L3 p.66–73)", lang: "txt", lines: iter ? ITER : TREE }], vars: vars, steps: steps };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
