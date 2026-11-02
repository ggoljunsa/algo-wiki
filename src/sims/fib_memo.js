// fib_memo — L12 p.22–37: Fibonacci(8) 을 세 가지로. 순수 재귀(p.23, 호출 수) / top-down memoization(p.35, F 가 채워지는 순서) / bottom-up(p.25).
//   슬라이드 정의 F(0) = F(1) = 1 → 1, 1, 2, 3, 5, 8, 13, 21, 34. 재귀 트리 노드 색 = 인자 n (같은 부분문제 = 같은 색, p.24 "a lot of repeated computation").
//
// 기대 최종값 (src/sims/_check_final.py → _check_final.txt):
//  naive : Fib(8) = 34, 호출 67 번 (C(n) = 1 + C(n-1) + C(n-2), C(0)=C(1)=1). n 별 호출 수 8:1 7:1 6:2 5:3 4:5 3:8 2:13 1:21 0:13
//  memo  : Fib(8) = 34, 호출 15 번 (계산 7 번 + F 에서 바로 꺼냄 8 번), F 채우는 순서 F[2], F[3], …, F[8]
//  bottom: F = [1, 1, 2, 3, 5, 8, 13, 21, 34], 덧셈 7 번 (i = 2..8)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var NAIVE = [
    "def Fibonacci(n):",
    "    if n == 0 or n == 1:",
    "        return 1",
    "    return Fibonacci(n-1) + Fibonacci(n-2)"
  ];
  var MEMO = [
    "define a global list F = [1,1,None, None, …, None]",
    "def Fibonacci(n):",
    "    if F[n] != None:",
    "        return F[n]",
    "    else:",
    "        F[n] = Fibonacci(n-1) + Fibonacci(n-2)",
    "    return F[n]"
  ];
  var BOTTOM = [
    "def fasterFibonacci(n):",
    "    F = [1, 1, None, None, …, None]   # F has length n+1",
    "    for i = 2, …, n:",
    "        F[i] = F[i-1] + F[i-2]",
    "    return F[n]"
  ];
  var N = 8;
  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", edge: "#8aa6c8" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function nFill(n) { return "hsl(" + (n * 41 % 360) + ",70%,88%)"; }
  function nStroke(n) { return "hsl(" + (n * 41 % 360) + ",55%,38%)"; }

  var MODES = {
    naive: { label: "순수 재귀 (p.23) — 호출 수 세기" },
    memo: { label: "top-down + memoization (p.35)" },
    bottom: { label: "bottom-up (p.25)" }
  };

  // 호출 트리 만들기 (memo 여부)
  function makeTree(memo) {
    var nodes = [], F = memo ? [1, 1] : null;
    if (memo) for (var k = 2; k <= N; k++) F[k] = null;
    function call(n, depth, parent) {
      var nd = { id: nodes.length, n: n, depth: depth, parent: parent, kids: [], hit: false };
      nodes.push(nd);
      if (parent) parent.kids.push(nd);
      if (memo) {
        if (F[n] !== null) { nd.hit = true; nd.val = F[n]; return nd.val; }
        var a = call(n - 1, depth + 1, nd), b = call(n - 2, depth + 1, nd);
        F[n] = a + b; nd.val = F[n]; return nd.val;
      }
      if (n <= 1) { nd.val = 1; return 1; }
      nd.val = call(n - 1, depth + 1, nd) + call(n - 2, depth + 1, nd);
      return nd.val;
    }
    call(N, 0, null);
    // 배치: 잎은 왼→오 순서로 균등, 내부 노드는 자식 평균
    var leaves = nodes.filter(function (x) { return !x.kids.length; });
    var maxD = Math.max.apply(null, nodes.map(function (x) { return x.depth; }));
    var gap = Math.min(60, 720 / Math.max(1, leaves.length - 1));
    var startX = 380 - gap * (leaves.length - 1) / 2;
    var li = 0;
    (function place(nd) {
      if (!nd.kids.length) { nd.x = startX + gap * li++; }
      else { nd.kids.forEach(place); nd.x = nd.kids.reduce(function (s, k) { return s + k.x; }, 0) / nd.kids.length; }
      nd.y = 52 + nd.depth * (maxD > 6 ? 37 : 42);
    })(nodes[0]);
    return { nodes: nodes, maxD: maxD, r: leaves.length > 20 ? 10 : 14 };
  }

  global.SIMS["fib_memo"] = {
    title: "Fibonacci(8) — 순수 재귀 vs memoization vs bottom-up (L12 p.22–37)",
    desc: "L12 p.22–37. [[Fibonacci 수 계산]]은 [[dynamic programming]] 의 첫 예다. 순수 재귀는 같은 부분문제(같은 색 노드)를 '''수없이 다시''' 푼다 → 호출 67 번, 지수 시간([[overlapping subproblems]]). " +
      "[[top-down과 memoization|memoization]] 은 한 번 푼 F[n] 을 적어 두고 다시 오면 꺼내기만 한다 → 호출 15 번. [[bottom-up]] 은 작은 것부터 F[2], F[3], … 을 채운다 → 덧셈 7 번, O(n). " +
      "슬라이드 정의대로 F(0) = F(1) = 1 이라 Fib(8) = 34.",
    options: [
      { key: "mode", label: "방법", values: Object.keys(MODES).map(function (k) { return { value: k, label: MODES[k].label }; }) }
    ],
    build: function (opts) {
      var mode = MODES[opts.mode] ? opts.mode : "naive";
      var steps = [];
      var F = [1, 1]; for (var k = 2; k <= N; k++) F[k] = null;
      var calls = 0, adds = 0, stack = [], result = "-", perN = {};
      for (var q = 0; q <= N; q++) perN[q] = 0;
      var tree = mode === "bottom" ? null : makeTree(mode === "memo");
      var shown = {}, done = {}, cur = null, hiF = null, srcF = null;

      function perNStr() { var a = []; for (var x = N; x >= 0; x--) if (perN[x]) a.push(x + ":" + perN[x]); return a.join(" ") || "-"; }
      function arraySvg(y0) {
        var s = '<text x="12" y="' + (y0 + 18) + '" font-size="13" font-weight="700" fill="' + C.pur + '">F =</text>';
        for (var i = 0; i <= N; i++) {
          var x = 50 + i * 54, isHi = hiF === i, isSrc = srcF && srcF.indexOf(i) >= 0;
          s += '<rect x="' + x + '" y="' + y0 + '" width="50" height="28" rx="3" fill="' + (isHi ? C.orL : isSrc ? C.blueL : F[i] === null ? "#fafafa" : C.greenL) + '" stroke="' + (isHi ? C.or : isSrc ? C.blue : F[i] === null ? "#bbb" : C.green) + '" stroke-width="' + (isHi ? 2.5 : 1.2) + '"/>' +
            '<text x="' + (x + 25) + '" y="' + (y0 + 19) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#222">' + (F[i] === null ? "None" : F[i]) + '</text>' +
            '<text x="' + (x + 25) + '" y="' + (y0 + 42) + '" text-anchor="middle" font-size="11" fill="' + C.muted + '">[' + i + ']</text>';
        }
        return s;
      }
      function draw(msg, msgColor) {
        var H, s = "";
        if (tree) {
          var r = tree.r;
          H = 52 + tree.maxD * (tree.maxD > 6 ? 37 : 42) + 40 + (mode === "memo" ? 70 : 30);
          tree.nodes.forEach(function (nd) {
            if (!shown[nd.id] || !nd.parent) return;
            s += '<line x1="' + nd.parent.x.toFixed(1) + '" y1="' + nd.parent.y + '" x2="' + nd.x.toFixed(1) + '" y2="' + nd.y + '" stroke="' + (stack.indexOf(nd) >= 0 ? C.or : "#bbb") + '" stroke-width="' + (stack.indexOf(nd) >= 0 ? 2.5 : 1.2) + '"/>';
          });
          tree.nodes.forEach(function (nd) {
            if (!shown[nd.id]) return;
            var isCur = cur === nd, onStack = stack.indexOf(nd) >= 0;
            s += '<circle cx="' + nd.x.toFixed(1) + '" cy="' + nd.y + '" r="' + r + '" fill="' + (nd.hit ? "#fff" : nFill(nd.n)) + '" stroke="' + (isCur ? C.or : nd.hit ? C.green : nStroke(nd.n)) + '" stroke-width="' + (isCur ? 3.5 : onStack ? 2.5 : 1.3) + '"' + (nd.hit ? ' stroke-dasharray="3 2"' : "") + '/>' +
              '<text x="' + nd.x.toFixed(1) + '" y="' + (nd.y + (r > 10 ? 5 : 4)) + '" text-anchor="middle" font-size="' + (r > 10 ? 13 : 11) + '" font-weight="700" fill="#222">' + nd.n + '</text>';
            if (done[nd.id] && (r > 10 || nd.depth < 4)) s += '<text x="' + (nd.x + r + 2).toFixed(1) + '" y="' + (nd.y - r + 4) + '" font-size="10.5" font-weight="700" fill="' + (nd.hit ? C.green : C.blue) + '">=' + nd.val + '</text>';
          });
          s += '<text x="12" y="22" font-size="12.5" font-weight="700" fill="' + C.pur + '">호출 트리 (숫자 = n, 색 = 같은 부분문제' + (mode === "memo" ? ", 점선 = F 에서 바로 꺼냄" : "") + ')</text>' +
            '<text x="748" y="22" font-size="13" text-anchor="end" font-weight="700" fill="' + C.or + '">호출 ' + calls + ' 번</text>';
          if (mode === "memo") s += arraySvg(H - 66);
          else s += '<text x="12" y="' + (H - 12) + '" font-size="12" fill="#333">n 별 호출 수: ' + esc(perNStr()) + '</text>';
        } else {
          H = 200;
          s += '<text x="12" y="22" font-size="12.5" font-weight="700" fill="' + C.pur + '">bottom-up: 작은 문제부터 표를 채운다 (재귀 없음)</text>' + arraySvg(60);
          if (hiF !== null && srcF) {
            [srcF[0], srcF[1]].forEach(function (j) {
              var x1 = 50 + j * 54 + 25, x2 = 50 + hiF * 54 + 25;
              s += '<path d="M' + x1 + ',58 Q' + ((x1 + x2) / 2) + ',' + (j === hiF - 1 ? 34 : 22) + ' ' + x2 + ',58" fill="none" stroke="' + C.blue + '" stroke-width="2"/>';
            });
          }
          s += '<text x="12" y="140" font-size="13" fill="#333">덧셈 횟수: ' + adds + ' 번 (n − 1 = 7 이면 끝 → O(n))</text>';
        }
        if (msg) s += '<text x="748" y="' + (H - 12) + '" font-size="13" text-anchor="end" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        return '<svg viewBox="0 0 760 ' + H + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">' + s + '</svg>';
      }
      function snap(desc, pcLine, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { P: pcLine },
          vars: { n: cur ? cur.n : (mode === "bottom" ? N : "-"), stack: stack.map(function (x) { return "Fib(" + x.n + ")"; }), calls: calls, per_n: perNStr(), adds: adds,
            F: F.map(function (x) { return x === null ? "None" : x; }), result: result },
          note: note, svg: draw(msg, msgColor)
        });
      }

      if (mode === "bottom") {
        snap("`F = [1, 1, None, …]` — F[0] = F[1] = 1 (base case) 만 알고 시작.", 2);
        for (var i = 2; i <= N; i++) {
          hiF = i; srcF = [i - 1, i - 2];
          F[i] = F[i - 1] + F[i - 2]; adds++;
          snap("i = " + i + ": `F[" + i + "] = F[" + (i - 1) + "] + F[" + (i - 2) + "]` = " + F[i - 1] + " + " + F[i - 2] + " = '''" + F[i] + "'''. 필요한 두 값은 이미 표에 있다(작은 것부터 채웠으니까).", 4);
        }
        hiF = N; srcF = null; result = F[N];
        snap("`return F[8]` = '''34'''. 덧셈 7 번, 재귀 호출 0 번 → O(n). Bellman-Ford 도 d(0) → d(1) → … 를 이렇게 아래에서부터 채운다(L12 p.33).", 5, null, "Fib(8) = 34 · 덧셈 7 번", C.green);
      } else if (mode === "naive") {
        snap("`Fibonacci(8)` 을 부른다. 슬라이드 정의: F(0) = F(1) = 1.", 1);
        (function run(nd) {
          calls++; perN[nd.n]++; shown[nd.id] = 1; stack.push(nd); cur = nd;
          if (nd.n <= 1) {
            done[nd.id] = 1;
            snap("Fib(" + nd.n + ") 호출 (" + calls + " 번째): `n == 0 or n == 1` → `return 1`.", 3);
          } else {
            snap("Fib(" + nd.n + ") 호출 (" + calls + " 번째): base case 아님 → Fib(" + (nd.n - 1) + ") 과 Fib(" + (nd.n - 2) + ") 를 '''둘 다''' 부른다." +
              (perN[nd.n] > 1 ? " Fib(" + nd.n + ") 은 벌써 " + perN[nd.n] + " 번째 — 같은 계산을 처음부터 다시 한다!" : ""), 4,
              perN[nd.n] === 2 && nd.n === 6 ? "같은 색 노드가 또 나왔다 = overlapping subproblems. 기억해 두기만 하면 이 서브트리 전체를 건너뛸 수 있다 → memoization." : null);
            nd.kids.forEach(run);
            cur = nd; done[nd.id] = 1;
            snap("Fib(" + nd.n + ") = Fib(" + (nd.n - 1) + ") + Fib(" + (nd.n - 2) + ") = " + nd.kids[0].val + " + " + nd.kids[1].val + " = '''" + nd.val + "''' → return.", 4);
          }
          stack.pop();
        })(tree.nodes[0]);
        cur = null; result = 34;
        snap("결과 Fib(8) = '''34''', 호출 '''67 번'''. n 별 호출 수 " + perNStr() + " — Fib(1) 만 21 번. T(n) = T(n−1) + T(n−2) + O(1) ≥ Fib(n) 이라 지수적으로(≈ φ^n) 커진다(p.23).", 4, null,
          "호출 67 번 (memo 는 15 번)", C.red);
      } else {
        snap("`define a global list F = [1, 1, None, …]` — 메모 표. F[0] = F[1] = 1 은 미리 적혀 있다.", 1);
        (function run(nd) {
          calls++; perN[nd.n]++; shown[nd.id] = 1; stack.push(nd); cur = nd; hiF = nd.n;
          if (nd.hit) {
            done[nd.id] = 1;
            snap("Fib(" + nd.n + ") 호출 (" + calls + " 번째): `F[" + nd.n + "] != None` → 이미 " + F[nd.n] + " 이 적혀 있다 → '''계산 없이''' `return F[" + nd.n + "]`.", 4);
          } else {
            snap("Fib(" + nd.n + ") 호출 (" + calls + " 번째): F[" + nd.n + "] 가 None → `else:` 로 가서 Fib(" + (nd.n - 1) + ") + Fib(" + (nd.n - 2) + ") 를 계산한다.", 6);
            nd.kids.forEach(run);
            cur = nd; hiF = nd.n; F[nd.n] = nd.val; done[nd.id] = 1;
            snap("`F[" + nd.n + "] = " + nd.kids[0].val + " + " + nd.kids[1].val + "` = '''" + nd.val + "''' 를 표에 적고 `return F[" + nd.n + "]`. 이제 Fib(" + nd.n + ") 을 다시 부르면 바로 꺼낸다.", 7);
          }
          stack.pop();
        })(tree.nodes[0]);
        cur = null; hiF = null; result = 34;
        snap("결과 Fib(8) = '''34''', 호출 '''15 번''' (계산 7 번 = F[2]…F[8] 한 번씩, 꺼내기 8 번). 트리가 왼쪽 사슬로 쪼그라들었다(p.37) → O(n).", 7, null,
          "호출 15 번 (순수 재귀는 67 번)", C.green);
      }

      return {
        panels: [{ id: "P", title: mode === "naive" ? "Fibonacci (L12 p.23)" : mode === "memo" ? "top-down Fibonacci (L12 p.35)" : "fasterFibonacci (L12 p.25)", lang: "c",
          lines: mode === "naive" ? NAIVE : mode === "memo" ? MEMO : BOTTOM }],
        vars: [
          { name: "n", label: "지금 n", group: "현재" },
          { name: "stack", label: "호출 스택", group: "현재" },
          { name: "calls", label: "호출 수", group: "비용" },
          { name: "per_n", label: "n 별 호출 수", group: "비용" },
          { name: "adds", label: "덧셈 수 (bottom-up)", group: "비용" },
          { name: "F", label: "F 표", group: "표" },
          { name: "result", label: "결과", group: "표" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
