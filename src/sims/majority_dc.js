window.SIMS = window.SIMS || {};
// majority_dc — L6 p.55–66 (PNG 52–63): 분할정복 majority. 슬라이드 코드의 mid 인덱스(A[mid] 누락)는 CONTRACT §1 대로 반으로 나누기로 수정
(function (global) {
  "use strict";

  var CODE = [
    "def majority_element(A):",
    "  # divide and conquer",
    "  n = len(A), mid = n/2        # 슬라이드: mid = (n-1)/2",
    "  if n <= 1:",
    "    return A[0]",
    "  m1 = majority_element(A[:mid])",
    "  m2 = majority_element(A[mid:])  # 슬라이드: A[mid+1:]",
    "  count = 0",
    "  for a in A:",
    "    if equals(m1, a): count += 1",
    "  if count > n/2: return m1",
    "  else: return m2"
  ];

  var CASES = {
    full8: { A: [2, 1, 2, 3, 2, 2, 4, 2], label: "n=8 [2,1,2,3,2,2,4,2] 전체 재귀" },
    slide: { A: [0, 1, 2, 3, 4, 5, 2, 2, 2, 2, 2, 2], label: "슬라이드 p.63 최상위 한 번만 (m_left=5, m_right=2)" }
  };

  function svgFor(v) {
    var s = '<svg viewBox="0 0 760 300" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    var n = v.A.length, cw = Math.min(56, Math.floor(700 / n));
    // 재귀 트리의 각 레벨 (full 모드) 또는 한 레벨
    for (var r = 0; r < v.nodes.length; r++) {
      var nd = v.nodes[r];
      var y = 20 + nd.depth * 62;
      var x = 30 + nd.lo * cw;
      var w = (nd.hi - nd.lo) * cw;
      var active = v.active === nd.id;
      s += '<rect x="' + (x + 2) + '" y="' + y + '" width="' + (w - 4) + '" height="34" rx="4" fill="' + (active ? "#fde2e6" : (nd.ret !== null ? "#dff3e4" : "#fff")) +
        '" stroke="' + (active ? "#d6465f" : "#8a93a8") + '" stroke-width="' + (active ? 2.5 : 1.2) + '"/>';
      for (var i = nd.lo; i < nd.hi; i++) {
        var hit = active && v.m1 !== null && v.A[i] === v.m1 && v.counting;
        s += '<text x="' + (30 + i * cw + cw / 2) + '" y="' + (y + 22) + '" text-anchor="middle" font-size="14"' + (hit ? ' fill="#d6465f" font-weight="700"' : "") + ">" + v.A[i] + "</text>";
      }
      if (nd.ret !== null) {
        s += '<text x="' + (x + w / 2) + '" y="' + (y + 50) + '" text-anchor="middle" font-size="11" fill="#2f7a38" font-weight="700">→ ' + nd.ret + "</text>";
      }
    }
    s += '<text x="740" y="290" text-anchor="end" font-size="12" font-weight="700">equals 호출 누적: ' + v.eq + "</text>";
    s += "</svg>";
    return s;
  }

  global.SIMS["majority_dc"] = {
    title: "분할정복 majority element",
    desc: "L6 p.55–66. 전체의 [[majority element]] 가 있다면 반드시 왼쪽 절반 또는 오른쪽 절반의 majority 다(아니면 많아야 ⌊n/2⌋ 번). " +
      "그래서 두 후보 m1, m2 를 재귀로 얻고, m1 을 전체에서 [[equals]] 로 세어 > n/2 면 m1, 아니면 m2. T(n) = 2T(n/2) + O(n) = O(n log n).",
    options: [
      { key: "ex", label: "예제", values: Object.keys(CASES).map(function (k) { return { value: k, label: CASES[k].label }; }) }
    ],
    build: function (opts) {
      var key = CASES[opts.ex] ? opts.ex : "full8";
      var A = CASES[key].A;
      var steps = [];
      var nodes = [];
      var eq = 0;
      var cur = { sub: "-", n: "-", m1: "-", m2: "-", count: "-", ret: "-", depth: "-" };
      var vis = { active: null, m1: null, counting: false };
      var fixNote = "슬라이드 p.66 코드는 `mid = (n-1)/2`, `A[:mid]`, `A[mid+1:]` 라서 '''A[mid] 가 어느 쪽에도 안 들어간다'''. " +
        "의도는 반으로 나누기 → 여기서는 `A[:n/2]`, `A[n/2:]` 로 고쳐서 실행한다.";

      function snap() {
        return {
          A: cur.sub, n: cur.n, depth: cur.depth, m1: cur.m1, m2: cur.m2,
          count: cur.count, "n/2": cur.n === "-" ? "-" : cur.n / 2, "반환": cur.ret, "equals 누적": eq
        };
      }
      function push(desc, pc, note) {
        steps.push({ desc: desc, pc: { M: pc }, vars: snap(), note: note,
          svg: svgFor({ A: A, nodes: nodes.map(function (x) { return Object.assign({}, x); }), active: vis.active, m1: vis.m1, counting: vis.counting, eq: eq }) });
      }
      function setCur(lo, hi, depth) {
        cur = { sub: A.slice(lo, hi), n: hi - lo, m1: "-", m2: "-", count: "-", ret: "-", depth: depth };
      }

      function rec(lo, hi, depth) {
        var node = { id: nodes.length, lo: lo, hi: hi, depth: depth, ret: null };
        nodes.push(node);
        var n = hi - lo;
        setCur(lo, hi, depth);
        vis = { active: node.id, m1: null, counting: false };
        if (n <= 1) {
          node.ret = A[lo];
          cur.ret = A[lo];
          push("[" + A[lo] + "] : n = 1 → `return A[0]` = " + A[lo] + ". 원소 하나짜리 리스트의 majority 는 그 원소.", 5);
          return A[lo];
        }
        var mid = n / 2;
        push("depth " + depth + ": A = [" + A.slice(lo, hi).join(", ") + "], n = " + n + ", mid = " + mid + " → 왼쪽 [" + A.slice(lo, lo + mid).join(", ") +
          "], 오른쪽 [" + A.slice(lo + mid, hi).join(", ") + "] 로 재귀.", 3, depth === 0 ? fixNote : undefined);
        var m1 = rec(lo, lo + mid, depth + 1);
        var m2 = rec(lo + mid, hi, depth + 1);
        return combine(node, lo, hi, depth, m1, m2);
      }

      function combine(node, lo, hi, depth, m1, m2) {
        var n = hi - lo;
        setCur(lo, hi, depth);
        cur.m1 = m1; cur.m2 = m2;
        vis = { active: node.id, m1: m1, counting: false };
        push("A = [" + A.slice(lo, hi).join(", ") + "] 로 돌아옴: m1 = " + m1 + ", m2 = " + m2 + ". 이제 m1 이 전체에서 몇 번 나오는지 센다.", 8);
        var count = 0;
        for (var i = lo; i < hi; i++) { eq += 1; if (A[i] === m1) count += 1; }
        cur.count = count;
        vis.counting = true;
        push("`for a in A: equals(m1, a)` — equals '''" + n + "''' 번 (누적 " + eq + "). count(" + m1 + ") = " + count + ".", 10);
        var ret = count > n / 2 ? m1 : m2;
        cur.ret = ret; node.ret = ret;
        push(count > n / 2
          ? "count = " + count + " > n/2 = " + (n / 2) + " → `return m1` = '''" + m1 + "'''."
          : "count = " + count + " ≤ n/2 = " + (n / 2) + " → m1 은 majority 가 아니다 → `return m2` = '''" + m2 + "'''." +
            (A.slice(lo, hi).filter(function (x) { return x === m2; }).length > n / 2 ? "" : " (이 부분리스트엔 majority 가 없어서 반환값은 '후보'일 뿐 — 위에서 다시 검증된다.)"),
          count > n / 2 ? 11 : 12);
        return ret;
      }

      var answer;
      if (key === "full8") {
        answer = rec(0, A.length, 0);  // cur 에는 최상위 합치기 값이 남아 있다
        vis = { active: null, m1: null, counting: false };
        push("최종 답 '''" + answer + "''' (2 는 8 개 중 5 개 > 4). equals 총 '''" + eq + "''' 회 = 레벨마다 n = 8 번 × 레벨 3 개(log2 8) = n log2 n. " +
          "점화식 T(n) = 2T(n/2) + n.", 12, "시험 포인트: 합치는 단계에서 '''m1 하나만''' 세도 된다 — m1 이 아니면 답은 m2 이거나 majority 가 없는 경우뿐.");
      } else {
        // 최상위 한 번만: 재귀 결과는 슬라이드 값 m_left = 5, m_right = 2 를 그대로 받는다
        var root = { id: 0, lo: 0, hi: A.length, depth: 0, ret: null };
        nodes.push(root);
        nodes.push({ id: 1, lo: 0, hi: 6, depth: 1, ret: 5 });
        nodes.push({ id: 2, lo: 6, hi: 12, depth: 1, ret: 2 });
        setCur(0, A.length, 0);
        vis = { active: 0, m1: null, counting: false };
        push("슬라이드 p.63: A = [0,1,2,3,4,5,2,2,2,2,2,2] (n = 12) 를 반으로 나눈 두 재귀 호출이 m_left = 5, m_right = 2 를 돌려줬다고 하자(슬라이드가 준 값). " +
          "왼쪽 [0,1,2,3,4,5] 에는 사실 majority 가 없어서 5 는 '후보'일 뿐이다.", 3, fixNote);
        answer = combine(root, 0, A.length, 0, 5, 2);
        vis = { active: null, m1: null, counting: false };
        push("답 m_right = '''" + answer + "'''. 실제로 2 는 12 개 중 7 번 등장(7 ≥ ⌊12/2⌋+1 = 7) — Key insight(p.64): 전체 majority 는 반드시 두 후보 중 하나다.", 12);
      }

      return {
        panels: [{ id: "M", title: "majority_element (L6 p.66, mid 수정)", lang: "c", lines: CODE }],
        vars: [
          { name: "A", group: "현재 호출" }, { name: "n", group: "현재 호출" }, { name: "depth", group: "현재 호출" },
          { name: "m1", group: "합치기" }, { name: "m2", group: "합치기" }, { name: "count", group: "합치기" }, { name: "n/2", group: "합치기" },
          { name: "반환", group: "합치기" }, { name: "equals 누적", group: "비용" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
