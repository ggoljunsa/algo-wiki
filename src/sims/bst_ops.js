// bst_ops — L8 p.10, 19–25: 슬라이드 트리 {5,3,7,2,4,8,1} 위에서 BST SEARCH / INSERT / DELETE 를 한 줄씩
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var SEARCH = [
    "def search(root, key):",
    "  x = root",
    "  while True:",
    "    if key == x.key: return x",
    "    if key < x.key:",
    "      if x.left == NIL: return x    # 트리 밖으로 나가기 직전 노드",
    "      x = x.left",
    "    else:",
    "      if x.right == NIL: return x   # 트리 밖으로 나가기 직전 노드",
    "      x = x.right"
  ];
  var INSERT = [
    "def insert(root, key):",
    "  if root == NIL:                   # 빈 트리",
    "    return Node(key)                # 새 노드가 root",
    "  x = search(root, key)",
    "  if key > x.key:",
    "    x.right = Node(key)             # x 의 오른쪽 자식으로",
    "  if key < x.key:",
    "    x.left = Node(key)              # x 의 왼쪽 자식으로",
    "  if key == x.key:",
    "    return                          # 이미 있음"
  ];
  var DELETE = [
    "def delete(root, key):",
    "  x = search(root, key)",
    "  if x.key != key: return           # 없는 키",
    "  if x.left == NIL and x.right == NIL:   # Case 1: leaf",
    "    replace(x, NIL)                 # 그냥 지운다",
    "  elif x.left == NIL or x.right == NIL:  # Case 2: 자식 하나",
    "    replace(x, x.left or x.right)   # 그 자식을 위로",
    "  else:                             # Case 3: 자식 둘",
    "    s = search(x.right, key)        # immediate successor",
    "    x.key = s.key                   # x 자리에 s 의 키",
    "    replace(s, s.right)             # s 는 왼쪽 자식이 없다 → Case 1/2"
  ];

  var SLIDE = [5, 3, 7, 2, 4, 8, 1];
  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777" };

  function Tree() { return { root: null, nextId: 1 }; }
  function mk(tr, key, parent) { return { id: tr.nextId++, key: key, left: null, right: null, parent: parent || null }; }
  function rawInsert(tr, key) {
    if (!tr.root) { tr.root = mk(tr, key); return; }
    var x = tr.root;
    for (;;) {
      if (key === x.key) return;
      var side = key < x.key ? "left" : "right";
      if (!x[side]) { x[side] = mk(tr, key, x); return; }
      x = x[side];
    }
  }
  function height(n) { return n ? 1 + Math.max(height(n.left), height(n.right)) : 0; }
  function replace(tr, x, y) {
    if (y) y.parent = x.parent;
    if (!x.parent) tr.root = y;
    else if (x.parent.left === x) x.parent.left = y;
    else x.parent.right = y;
  }
  function keys(list) { return list.map(function (n) { return n.key; }); }

  // hl: {cur, path:[node], fresh, del, succ, ghost:{parent, side}, title, msg}
  function draw(tr, hl) {
    var order = [], depth = {};
    (function walk(n, d) { if (!n) return; walk(n.left, d + 1); order.push(n); depth[n.id] = d; walk(n.right, d + 1); })(tr.root, 0);
    var h = height(tr.root), levels = Math.max(h, 1) + (hl.ghost ? 1 : 0);
    var dy = levels > 5 ? 42 : 52, B = 34;
    var Hh = Math.max(230, 70 + (levels - 1) * dy + B + 50);
    var n = order.length, sp = n > 1 ? Math.min(80, 640 / (n - 1)) : 0, x0 = 380 - (n - 1) * sp / 2;
    var pos = {};
    order.forEach(function (nd, i) { pos[nd.id] = { x: x0 + i * sp, y: 62 + depth[nd.id] * dy }; });
    var onPath = {};
    (hl.path || []).forEach(function (nd, i) { onPath[nd.id] = i + 1; });

    var s = '<svg viewBox="0 0 760 ' + Hh + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="15">';
    s += '<text x="12" y="22" font-size="13" font-weight="700" fill="' + C.pur + '">' + (hl.title || "") + '</text>';
    s += '<text x="748" y="22" font-size="13" text-anchor="end" font-weight="700" fill="' + C.pur + '">height = ' + (h ? h - 1 : "-") + ' (간선) · 층 수 ' + h + '</text>';
    if (!tr.root) s += '<text x="380" y="100" text-anchor="middle" font-size="14" fill="' + C.muted + '">(빈 트리 — root = NIL)</text>';
    // edges
    order.forEach(function (nd) {
      ["left", "right"].forEach(function (side) {
        var c = nd[side]; if (!c) return;
        var a = pos[nd.id], b = pos[c.id];
        var hot = onPath[nd.id] && onPath[c.id] && onPath[c.id] === onPath[nd.id] + 1;
        s += '<line x1="' + a.x + '" y1="' + (a.y + B / 2) + '" x2="' + b.x + '" y2="' + (b.y - B / 2) + '" stroke="' + (hot ? C.or : "#8aa6c8") + '" stroke-width="' + (hot ? 4 : 2) + '"/>';
      });
    });
    // ghost (NIL 로 나가는 자리)
    if (hl.ghost) {
      var gp = pos[hl.ghost.parent.id], gx = gp.x + (hl.ghost.side === "left" ? -1 : 1) * Math.max(30, sp / 2), gy = gp.y + dy;
      var isNew = hl.ghost.label !== "NIL";
      s += '<line x1="' + gp.x + '" y1="' + (gp.y + B / 2) + '" x2="' + gx + '" y2="' + (gy - 13) + '" stroke="' + C.muted + '" stroke-width="1.5" stroke-dasharray="4 3"/>';
      s += '<rect x="' + (gx - 20) + '" y="' + (gy - 13) + '" width="40" height="26" rx="5" fill="#fff" stroke="' + (isNew ? C.green : C.muted) + '" stroke-dasharray="4 3"/>';
      s += '<text x="' + gx + '" y="' + (gy + 5) + '" text-anchor="middle" font-size="12" fill="' + (isNew ? C.green : C.muted) + '">' + hl.ghost.label + '</text>';
    }
    // nodes
    order.forEach(function (nd) {
      var p = pos[nd.id], f = C.blueL, st = C.blue, w = 2, tc = "#222";
      if (onPath[nd.id]) { f = C.orL; st = C.or; }
      if (hl.succ === nd) { f = C.purL; st = C.pur; w = 3; }
      if (hl.cur === nd) { f = C.orL; st = C.or; w = 4; }
      if (hl.fresh === nd) { f = C.greenL; st = C.green; w = 3; }
      if (hl.del === nd) { f = C.redL; st = C.red; w = 3; tc = C.red; }
      s += '<rect x="' + (p.x - B / 2) + '" y="' + (p.y - B / 2) + '" width="' + B + '" height="' + B + '" rx="5" fill="' + f + '" stroke="' + st + '" stroke-width="' + w + '"/>';
      s += '<text x="' + p.x + '" y="' + (p.y + 5) + '" text-anchor="middle" font-weight="700" font-size="' + (String(nd.key).length > 2 ? 12 : 15) + '" fill="' + tc + '">' + nd.key + '</text>';
      if (hl.cur === nd) s += '<text x="' + (p.x + B / 2 + 4) + '" y="' + (p.y - B / 2 + 2) + '" font-size="12" font-weight="700" fill="' + C.or + '">x</text>';
      if (hl.succ === nd) s += '<text x="' + (p.x + B / 2 + 4) + '" y="' + (p.y - B / 2 + 2) + '" font-size="12" font-weight="700" fill="' + C.pur + '">s</text>';
    });
    if (hl.msg) s += '<text x="380" y="' + (Hh - 14) + '" text-anchor="middle" font-size="13" font-weight="700" fill="' + (hl.msgColor || C.pur) + '">' + hl.msg + '</text>';
    s += '</svg>';
    return s;
  }

  var OPS = {
    s4: { label: "SEARCH 4 (p.19)", kind: "search", key: 4 },
    s45: { label: "SEARCH 4.5 (p.19, 없는 키 → 4 반환)", kind: "search", key: 4.5 },
    i45: { label: "INSERT 4.5 (p.20)", kind: "insert", key: 4.5 },
    d2: { label: "DELETE 2 (p.21, Case 2 자식 하나)", kind: "delete", key: 2 },
    d1: { label: "DELETE 1 (Case 1 leaf)", kind: "delete", key: 1 },
    d3: { label: "DELETE 3 (p.23, Case 3 자식 둘)", kind: "delete", key: 3 },
    bskew: { label: "BUILD 2,3,4,5,6,7,8 (p.25 편향)", kind: "build", seq: [2, 3, 4, 5, 6, 7, 8] },
    bbal: { label: "BUILD 5,3,7,2,4,8,1 (균형)", kind: "build", seq: [5, 3, 7, 2, 4, 8, 1] }
  };

  global.SIMS["bst_ops"] = {
    title: "BST SEARCH / INSERT / DELETE — 슬라이드 트리에서 한 줄씩",
    desc: "L8 p.10, 19–25. [[binary search tree]] 의 세 연산은 모두 [[BST SEARCH]] 로 내려간 뒤 O(1) 일을 더 할 뿐이다 → 시간 = O(height). " +
      "SEARCH 는 키가 없으면 '''트리 밖으로 나가기 직전 마지막 노드'''를 돌려준다(4.5 → 4) — [[BST INSERT]] 가 바로 그 노드에 새 노드를 매단다. " +
      "[[BST DELETE]] 는 leaf / 자식 하나 / 자식 둘(immediate successor 로 교체) 세 경우. BUILD 옵션은 빈 트리에서 순서대로 INSERT 해서 [[편향 트리]] 와 균형 트리의 height 를 비교한다. " +
      "height 는 '''가장 긴 root→leaf 경로의 길이(간선 수)''', 층 수 = 그 경로의 노드 수 = height + 1 도 함께 보인다(p.25 의 \"depth n\" 은 층 수로 센 것: 2..8 사슬은 층 7 = n, height 6).",
    options: [
      { key: "op", label: "연산", values: Object.keys(OPS).map(function (k) { return { value: k, label: OPS[k].label }; }) }
    ],
    build: function (opts) {
      var op = OPS[opts.op] || OPS.s4;
      var tr = Tree();
      if (op.kind !== "build") SLIDE.forEach(function (k) { rawInsert(tr, k); });
      var steps = [];
      var st = { op: op.label, key: "-", cur: "-", path: [], "case": "-", comparisons: 0, total: 0, height: "-", levels: 0 };
      var panels;
      if (op.kind === "search") panels = [{ id: "S", title: "search (L8 p.19)", lang: "c", lines: SEARCH }];
      else if (op.kind === "delete") panels = [{ id: "D", title: "delete (L8 p.21–23)", lang: "c", lines: DELETE }, { id: "S", title: "search (L8 p.19)", lang: "c", lines: SEARCH }];
      else panels = [{ id: "I", title: "insert (L8 p.20)", lang: "c", lines: INSERT }, { id: "S", title: "search (L8 p.19)", lang: "c", lines: SEARCH }];

      function push(desc, pc, hl, note) {
        st.levels = height(tr.root); st.height = st.levels ? st.levels - 1 : "-";
        var v = {}; for (var k in st) v[k] = Array.isArray(st[k]) ? st[k].slice() : st[k];
        hl = hl || {};
        if (!hl.title) hl.title = op.kind === "build" ? "BUILD " + op.seq.join(",") : op.label;
        steps.push({ desc: desc, pc: pc, vars: v, note: note, svg: draw(tr, hl) });
      }
      function outer(extra) { var o = {}; if (op.kind === "delete") o.D = extra; else if (op.kind !== "search") o.I = extra; return o; }
      function pcs(outerLine, sLine) { var o = outer(outerLine); o.S = sLine; return o; }

      // search 를 한 노드씩. 반환: {x, ghost}
      function search(start, key, outerLine, label) {
        var x = start, path = [x];
        st.cur = x.key; st.path = keys(path);
        push("`" + (label || "x = root") + "` → x = '''" + x.key + "'''. 여기서부터 key " + key + " 를 찾아 내려간다.", pcs(outerLine, 2), { cur: x, path: path.slice() });
        for (;;) {
          st.comparisons++; st.total++;
          if (key === x.key) {
            push("key " + key + " == x.key " + x.key + " → '''찾았다''', `return x` (" + x.key + "). 비교 " + st.comparisons + "회.", pcs(outerLine, 4), { cur: x, path: path.slice() });
            return { x: x, path: path };
          }
          var side = key < x.key ? "left" : "right", ln = side === "left" ? 6 : 9;
          var rel = key < x.key ? key + " < " + x.key + " → 왼쪽" : key + " > " + x.key + " → 오른쪽";
          if (!x[side]) {
            var g = { parent: x, side: side, label: "NIL" };
            push(rel + ", 그런데 x." + side + " == NIL → 트리 밖으로 나가기 직전 노드 '''" + x.key + "''' 를 반환 (p.19 \"return the last node before we went off the tree\"). 비교 " + st.comparisons + "회.",
              pcs(outerLine, ln), { cur: x, path: path.slice(), ghost: g });
            return { x: x, path: path, ghost: g };
          }
          x = x[side]; path.push(x);
          st.cur = x.key; st.path = keys(path);
          push(rel + ": `x = x." + side + "` → x = '''" + x.key + "'''.", pcs(outerLine, ln + 1), { cur: x, path: path.slice() });
        }
      }

      function insert(key) {
        st.key = key; st.comparisons = 0; st["case"] = "-"; st.path = []; st.cur = "-";
        if (!tr.root) {
          push("`insert(" + key + ")`: root == NIL (빈 트리).", outer(2), {});
          tr.root = mk(tr, key);
          st.cur = key; st["case"] = "빈 트리 → root";
          push("`return Node(" + key + ")` → '''" + key + "''' 가 root. 비교 0회.", outer(3), { fresh: tr.root, msg: "insert(" + key + "): 비교 0회", msgColor: C.green });
          return;
        }
        var r = search(tr.root, key, 4);
        var x = r.x;
        if (key === x.key) { st["case"] = "이미 있음"; push("key == x.key → 이미 있으므로 `return`.", outer(10), { cur: x, path: r.path }); return; }
        var side = key > x.key ? "right" : "left";
        var nd = mk(tr, key, x); x[side] = nd;
        st["case"] = "x." + side + " = " + key;
        push((side === "right" ? "key " + key + " > x.key " + x.key + " → `x.right = Node(" + key + ")`" : "key " + key + " < x.key " + x.key + " → `x.left = Node(" + key + ")`") +
          ": search 가 돌려준 노드 " + x.key + " 의 " + (side === "right" ? "오른쪽" : "왼쪽") + " 자식으로 매단다(초록). 이번 삽입의 비교 " + st.comparisons + "회.",
          outer(side === "right" ? 6 : 8), { fresh: nd, path: r.path, msg: "insert(" + key + "): 비교 " + st.comparisons + "회 · 새 노드 depth " + (r.path.length + 1), msgColor: C.green });
      }

      if (op.kind === "search") {
        st.key = op.key;
        var r = search(tr.root, op.key, null);
        st["case"] = r.x.key === op.key ? "found" : "not found → 마지막 노드";
        push("결과: path " + keys(r.path).join(" → ") + ", 비교 " + st.comparisons + "회. " + (r.x.key === op.key ? "key " + op.key + " 를 찾았다." :
          "키 " + op.key + " 는 없다 → 마지막 노드 '''" + r.x.key + "''' 를 반환. [[BST INSERT]] 는 여기에 새 노드를 매단다.") + " 시간 = 지나온 노드 수 ≤ height = O(height).",
          { S: r.x.key === op.key ? 4 : 9 }, { cur: r.x, path: r.path, ghost: r.ghost, msg: "path " + keys(r.path).join(" → ") + " · 비교 " + st.comparisons + "회" });
      } else if (op.kind === "insert") {
        insert(op.key);
        push("완료: 4.right = 4.5. 새 노드는 '''항상 leaf''' 로 붙는다 — 기존 노드는 하나도 움직이지 않는다. 시간 = search 시간 + O(1) = O(height).", outer(6),
          { fresh: tr.root.left.right.right, msg: "4.right = 4.5", msgColor: C.green });
      } else if (op.kind === "delete") {
        st.key = op.key;
        var rd = search(tr.root, op.key, 2);
        var x = rd.x;
        push("`x.key == " + op.key + "` → 지울 노드를 찾았다. 자식 수로 경우를 나눈다.", { D: 3, S: null }, { del: x, path: rd.path });
        if (!x.left && !x.right) {
          st["case"] = "Case 1: leaf";
          push("x = " + x.key + " 는 자식이 없다 → '''Case 1: leaf''' → 그냥 지운다.", { D: 4, S: null }, { del: x });
          var par = x.parent, sd = par.left === x ? "left" : "right"; replace(tr, x, null);
          st.cur = "-";
          push("`replace(x, NIL)`: " + par.key + "." + sd + " = NIL. 나머지 트리는 그대로.", { D: 5, S: null }, { cur: par, msg: "Case 1: " + x.key + " 삭제 → " + par.key + "." + sd + " = NIL" });
        } else if (!x.left || !x.right) {
          st["case"] = "Case 2: 자식 하나";
          var ch = x.left || x.right;
          push("x = " + x.key + " 는 자식이 하나(" + ch.key + ") → '''Case 2: 그 자식을 위로 올린다'''.", { D: 6, S: null }, { del: x, succ: ch });
          var pp = x.parent, sideP = pp.left === x ? "left" : "right";
          replace(tr, x, ch);
          st.cur = ch.key;
          push("`replace(x, x." + (x.left ? "left" : "right") + ")`: " + pp.key + "." + sideP + " = " + ch.key + ". " + ch.key + " 의 부분 트리 전체가 한 칸 올라온다 — " + ch.key + " < " + pp.key + " 이므로 BST property 유지.",
            { D: 7, S: null }, { cur: ch, msg: "Case 2: " + pp.key + "." + sideP + " = " + ch.key });
        } else {
          st["case"] = "Case 3: 자식 둘";
          push("x = " + x.key + " 는 자식이 둘 → '''Case 3''': x 를 immediate successor(\"next biggest thing after " + x.key + "\")로 교체한다.", { D: 8, S: null }, { del: x });
          st.comparisons = 0;
          var rs = search(x.right, x.key, 9, "x = x.right (" + x.right.key + ") 에서 search(" + x.key + ")");
          var s = rs.x;
          st["case"] = "Case 3: successor = " + s.key;
          push("search 가 x.right 아래에서 '''" + s.key + "''' 를 돌려줬다 = min(" + x.key + ".right) = immediate successor. " + x.key + " 보다 크면서 가장 작은 키다.", { D: 9, S: null }, { del: x, succ: s, path: rs.path });
          var old = x.key; x.key = s.key; st.cur = x.key;
          push("`x.key = s.key`: " + old + " 자리에 " + s.key + " 를 쓴다. 왼쪽 부분 트리(< " + old + " < " + s.key + ")와 오른쪽 나머지(> " + s.key + ") 사이에 들어가므로 BST property 유지(p.23 \"Yes\").", { D: 10, S: null }, { cur: x, del: s });
          var spar = s.parent;
          replace(tr, s, s.right);
          push("`replace(s, s.right)`: 원래 " + s.key + " 노드를 지운다. successor 는 왼쪽 자식이 없으므로(있었다면 그쪽이 더 작다) 자식 0개 또는 1개 → Case 1/2 — \"What if it has two children? It doesn't.\"",
            { D: 11, S: null }, { cur: x, msg: "Case 3: " + old + " 자리에 successor " + s.key, msgColor: C.green });
          void spar;
        }
        push("완료. 트리: " + (function () { var o = []; (function w(n) { if (!n) return; w(n.left); o.push(n.key); w(n.right); })(tr.root); return "in-order " + o.join(", "); })() + " — 여전히 정렬 순서. 시간 = O(height).",
          { D: 11, S: null }, { msg: "DELETE " + op.key + " 완료 · height " + (height(tr.root) - 1) });
      } else {
        var per = [];
        op.seq.forEach(function (k) { insert(k); per.push(st.comparisons); });
        st["case"] = "비교 " + per.join(",") + " (합 " + st.total + ")";
        st.cur = "-"; st.path = [];
        var skew = op.seq[0] === 2;
        push(skew ? "2,3,4,5,6,7,8 순서로 넣으면 매번 오른쪽으로만 붙어 '''사슬'''이 된다: 층 수 7 = n (height 6 = n−1), 삽입마다 비교 " + per.join(", ") + " (합 " + st.total + " = n(n−1)/2). 이것도 올바른 BST 지만 연산이 O(n) — [[편향 트리]] (p.25)."
          : "5,3,7,2,4,8,1 순서로 넣으면 height 3 (층 4) 의 균형 트리(p.10 그림). 삽입마다 비교 " + per.join(", ") + " (합 " + st.total + "). 같은 키라도 '''넣는 순서'''가 height 를 정한다 → self-balancing 이 필요한 이유.",
          outer(skew ? 6 : 8), { msg: "height = " + (height(tr.root) - 1) + " · 층 수 " + height(tr.root) + " · 비교 합 " + st.total, msgColor: skew ? C.red : C.green },
          skew ? "height 를 n 으로 만들 수 있으므로 BST 연산의 worst-case 는 O(n). \"Trees have depth O(log n). Done!\" (p.24) 는 틀린 말이었다." : null);
      }

      return {
        panels: panels,
        vars: [
          { name: "op", label: "연산", group: "입력" },
          { name: "key", group: "입력" },
          { name: "cur", label: "cur (x)", group: "탐색" },
          { name: "path", label: "path (지나온 키)", group: "탐색" },
          { name: "comparisons", label: "비교 (이번 연산)", group: "탐색" },
          { name: "total", label: "비교 누적", group: "탐색" },
          { name: "case", group: "결과" },
          { name: "height", label: "height (간선)", group: "결과" },
          { name: "levels", label: "층 수 (노드)", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
