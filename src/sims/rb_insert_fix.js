// rb_insert_fix — L8 p.41–57: rb_insert (p.56) + recolor (p.57) 를 한 줄씩. 대칭(mirror) 경우까지 구현해 BUILD 1..7 도 올바른 RB 트리가 되게
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var RBI = [
    "def rb_insert(root, key_to_insert):",
    "    x = search(root, key_to_insert)",
    "    v = new red vertex with key_to_insert",
    "    if key_to_insert > x.key:",
    "       x.right = v",
    "       recolor(v)",
    "    if key_to_insert < x.key:",
    "       x.left = v",
    "       recolor(v)",
    "    if key_to_insert == x.key:",
    "       return"
  ];
  var REC = [
    "def recolor(v):",
    "   p = parent(v)",
    "   if p.color == black:",
    "       return",
    "   grand_p = p.parent",
    "   uncle = grand_p.right",
    "   if uncle.color == red:",
    "       p.color = black",
    "       uncle.color = black",
    "       grand_p.color = red",
    "       recolor(grand_p)",
    "   else: # uncle.color == black",
    "       p.color = black",
    "       grand_p.color = red",
    "       right_rotate(grand_p) # yoink"
  ];

  var RED = "#c00", BLK = "#222";
  var C = { or: "#e09a40", green: "#2e9e4f", red: "#d6465f", pur: "#3b2f4a", muted: "#777" };
  var TRI = { gray: "#aaa", orange: "#f0a020", green: "#8bc34a" };

  // 트리 노드: {id, key, color:"R"|"B", left, right, parent, tri:null|"gray"|...}
  function Tree() { return { root: null, nextId: 1 }; }
  function N(tr, key, color, l, r) {
    var n = { id: tr.nextId++, key: key, color: color, left: l || null, right: r || null, parent: null, tri: null };
    if (n.left) n.left.parent = n;
    if (n.right) n.right.parent = n;
    return n;
  }
  function T(tr, c, below) { return { id: tr.nextId++, key: null, color: "B", left: null, right: null, parent: null, tri: c, below: !!below }; }
  function colorOf(n) { return n && !n.tri ? n.color : "B"; }   // NIL 은 black
  function name(n) { return n ? (n.tri ? "△" : n.key + (n.color === "R" ? "R" : "B")) : "NIL(B)"; }
  function levels(n) { return n && !n.tri ? 1 + Math.max(levels(n.left), levels(n.right)) : 0; }
  function shape(n) {
    if (!n) return "·";
    if (n.tri) return "△";
    var s = n.key + n.color;
    if (!n.left && !n.right) return s;
    return s + "(" + shape(n.left) + ", " + shape(n.right) + ")";
  }
  // 규칙 ②④⑤ 검사 (삼각형 부분 트리는 검사에서 제외 — 슬라이드처럼 "알맞은 부분 트리"로 가정)
  function hasTri(n) { return !!n && (!!n.tri || hasTri(n.left) || hasTri(n.right)); }
  function valid(tr) {
    var ok = true, tri = hasTri(tr.root);
    if (tr.root && tr.root.color !== "B") ok = false;
    (function bh(n) {
      if (!n || n.tri) return 1;
      if (n.color === "R" && (colorOf(n.left) === "R" || colorOf(n.right) === "R")) ok = false;
      var a = bh(n.left), b = bh(n.right);
      if (!tri && a !== b) ok = false;   // 삼각형(임의 부분 트리)이 있으면 black 수는 "알맞다"고 가정
      return a + (n.color === "B" ? 1 : 0);
    })(tr.root);
    return ok;
  }
  function rotate(tr, g, dir) {   // dir "right": g.left 이 올라온다
    var o = dir === "right" ? "left" : "right", y = g[o];
    g[o] = y[dir]; if (g[o]) g[o].parent = g;
    y.parent = g.parent;
    if (!g.parent) tr.root = y; else if (g.parent.left === g) g.parent.left = y; else g.parent.right = y;
    y[dir] = g; g.parent = y;
    return y;
  }

  // hl: {v, p, g, u, title, msg, msgColor, fresh}
  function draw(tr, hl) {
    var order = [], depth = {};
    var solo = [];   // below 표시가 있고 형제가 NIL 인 삼각형은 슬라이드처럼 부모 바로 아래에 (자기 칸 없이)
    (function walk(n, d) {
      if (!n) return;
      depth[n.id] = d;
      if (n.tri && n.below && n.parent && !(n.parent.left === n ? n.parent.right : n.parent.left)) { solo.push(n); return; }
      walk(n.left, d + 1); order.push(n); walk(n.right, d + 1);
    })(tr.root, 0);
    var maxD = 0; order.concat(solo).forEach(function (n) { maxD = Math.max(maxD, depth[n.id] + (n.tri ? 1 : 0)); });
    var dy = 56, B = 34, Hh = Math.max(250, 64 + maxD * dy + 70);
    var n = order.length, sp = n > 1 ? Math.min(74, 620 / (n - 1)) : 0, x0 = 380 - (n - 1) * sp / 2;
    var pos = {};
    order.forEach(function (nd, i) { pos[nd.id] = { x: x0 + i * sp, y: 60 + depth[nd.id] * dy }; });
    solo.forEach(function (nd) { pos[nd.id] = { x: pos[nd.parent.id].x, y: 60 + depth[nd.id] * dy }; });
    order = order.concat(solo);
    var s = '<svg viewBox="0 0 760 ' + Hh + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="15">';
    s += '<text x="12" y="22" font-size="13" font-weight="700" fill="' + C.pur + '">' + (hl.title || "") + '</text>';
    var L = levels(tr.root);
    s += '<text x="748" y="22" font-size="13" text-anchor="end" font-weight="700" fill="' + C.pur + '">height = ' + (L ? L - 1 : "-") + ' (간선) · ' + (valid(tr) ? "RB 규칙 ✓" : "RB 규칙 ✗") + (hasTri(tr.root) ? " (△ 는 알맞은 부분 트리로 가정)" : "") + '</text>';
    order.forEach(function (nd) {
      ["left", "right"].forEach(function (side) {
        var c = nd[side]; if (!c) return;
        var a = pos[nd.id], b = pos[c.id];
        s += '<line x1="' + a.x + '" y1="' + (a.y + B / 2) + '" x2="' + b.x + '" y2="' + (b.y - (c.tri ? 20 : B / 2)) + '" stroke="#333" stroke-width="2"/>';
      });
    });
    order.forEach(function (nd) {
      var p = pos[nd.id];
      if (nd.tri) {
        var w = nd.tri === "gray" ? 34 : 24;
        s += '<polygon points="' + p.x + ',' + (p.y - 20) + ' ' + (p.x - w) + ',' + (p.y + 40) + ' ' + (p.x + w) + ',' + (p.y + 40) + '" fill="' + TRI[nd.tri] + '" stroke="#7a4a2a" stroke-width="1"/>';
        return;
      }
      var tag = hl.v === nd ? "v" : hl.p === nd ? "p" : hl.g === nd ? "grand_p" : hl.u === nd ? "uncle" : "";
      if (tag) s += '<rect x="' + (p.x - B / 2 - 4) + '" y="' + (p.y - B / 2 - 4) + '" width="' + (B + 8) + '" height="' + (B + 8) + '" rx="6" fill="none" stroke="' + C.or + '" stroke-width="3"' + (tag === "v" ? "" : ' stroke-dasharray="5 3"') + '/>';
      s += '<rect x="' + (p.x - B / 2) + '" y="' + (p.y - B / 2) + '" width="' + B + '" height="' + B + '" fill="' + (nd.color === "R" ? RED : BLK) + '"/>';
      s += '<text x="' + p.x + '" y="' + (p.y + 6) + '" text-anchor="middle" font-weight="700" font-size="16" fill="#fff">' + nd.key + '</text>';
      if (tag) s += '<text x="' + (p.x + B / 2 + 6) + '" y="' + (p.y - B / 2 + 4) + '" font-size="12" font-weight="700" fill="' + C.or + '">' + tag + '</text>';
    });
    if (hl.msg) s += '<text x="380" y="' + (Hh - 14) + '" text-anchor="middle" font-size="13" font-weight="700" fill="' + (hl.msgColor || C.pur) + '">' + hl.msg + '</text>';
    s += '</svg>';
    return s;
  }

  var CASES = {
    p41: { label: "p.41 부모 black → 바로 끝", keys: [0],
      init: function (tr) { return N(tr, 6, "B", N(tr, 3, "B"), N(tr, 7, "B")); } },
    p47: { label: "p.47 uncle red → 색 뒤집기(flip)", keys: [0],
      init: function (tr) { var t3 = N(tr, 3, "R", null, T(tr, "orange")), t7 = N(tr, 7, "R", null, T(tr, "green", true)); return N(tr, -1, "B", T(tr, "gray"), N(tr, 6, "B", t3, t7)); } },
    p54: { label: "p.54 uncle black → rotate(YOINK)", keys: [0],
      init: function (tr) { return N(tr, 6, "B", N(tr, 3, "R", null, T(tr, "orange")), N(tr, 7, "B", null, T(tr, "green", true))); } },
    build: { label: "BUILD 1,2,3,4,5,6,7 (빈 트리에서)", keys: [1, 2, 3, 4, 5, 6, 7], init: function () { return null; } }
  };

  global.SIMS["rb_insert_fix"] = {
    title: "rb_insert + recolor — 빨강으로 넣고 고친다",
    desc: "L8 p.41–57. [[rb_insert]] 는 보통 BST 처럼 넣되 새 노드를 '''red''' 로 만들고, [[recolor]] 가 위로 올라가며 고친다 — [[RB 삽입 세 경우]]: 부모 black 이면 끝 / 부모 red·[[uncle]] red 면 색 뒤집기 후 grand_p 에서 재귀 / 부모 red·uncle black 이면 회전(YOINK) + 색 교환. " +
      "코드 패널은 슬라이드 p.56·p.57 그대로다. 슬라이드 코드는 '''한쪽 경우(p 가 grand_p 의 왼쪽 자식)만''' 적었으므로, BUILD 에서 대칭 경우(uncle = grand_p.left, left_rotate)·루트 경우가 나오면 빨간 박스로 알려 준다. 빨강/검정 네모가 노드, 색 삼각형은 슬라이드의 '임의의 부분 트리', NIL 은 그리지 않는다(black 으로 친다).",
    options: [
      { key: "case", label: "경우", values: Object.keys(CASES).map(function (k) { return { value: k, label: CASES[k].label }; }) }
    ],
    build: function (opts) {
      var cs = CASES[opts["case"]] || CASES.p41;
      var tr = Tree();
      tr.root = cs.init(tr);
      var steps = [];
      var st = { key: "-", v: "-", p: "-", grand_p: "-", uncle: "-", colors: "-", action: "-", height: "-", tree: shape(tr.root) };
      var hl = {};
      function setRoles(v, p, g, u) {
        hl = { v: v, p: p, g: g, u: u };
        st.v = v ? v.key : "-"; st.p = p ? p.key : "-"; st.grand_p = g ? g.key : "-"; st.uncle = u === undefined ? "-" : (u ? (u.tri ? "△" : u.key) : "NIL");
        refreshColors();
      }
      function refreshColors() {
        var parts = [];
        if (hl.v) parts.push("v=" + name(hl.v));
        if (hl.p) parts.push("p=" + name(hl.p));
        if (hl.g) parts.push("grand_p=" + name(hl.g));
        if (hl.u !== undefined && (hl.g)) parts.push("uncle=" + name(hl.u));
        st.colors = parts.length ? parts.join(", ") : "-";
      }
      function push(desc, pc, msg, msgColor, note) {
        refreshColors();
        var L = levels(tr.root); st.height = L ? L - 1 : "-"; st.tree = shape(tr.root);
        var v = {}; for (var k in st) v[k] = st[k];
        var h2 = {}; for (var k2 in hl) h2[k2] = hl[k2];
        h2.title = cs.label + (cs.keys.length > 1 ? " — 지금 " + st.key + " 삽입" : ""); h2.msg = msg; h2.msgColor = msgColor;
        steps.push({ desc: desc, pc: pc, vars: v, note: note, svg: draw(tr, h2) });
      }

      function recolor(v, callLine) {
        var pcR = function (ln) { return { RBI: callLine, REC: ln }; };
        var p = v.parent;
        setRoles(v, p, null);
        if (!p) {
          v.color = "B"; st.action = "v 가 루트 → black";
          push("`p = parent(v)` → '''v = " + v.key + " 가 루트'''라 parent 가 없다. 루트는 black(규칙 ②)이므로 v 를 black 으로 칠하고 끝.", pcR(2), "루트 " + v.key + " → black", C.green,
            "슬라이드 코드에는 이 경우가 없다(p 가 None 이면 p.color 에서 멈춘다). 표준 구현(CLRS 13.3)은 마지막에 root.color = black 을 한다.");
          return;
        }
        push("`p = parent(v)` → p = " + p.key + " (" + (p.color === "R" ? "red" : "black") + ").", pcR(2));
        if (p.color === "B") {
          st.action = "부모 black → 끝";
          push("`p.color == black` → v 가 red 여도 '''red-red 가 없다'''. black 수도 안 바뀌었다(red 를 넣었으니) → 규칙 5개 모두 성립, `return`.", pcR(4), "부모 black → 아무것도 안 해도 RB 트리", C.green);
          return;
        }
        var g = p.parent;
        var pLeft = g.left === p;
        var u = pLeft ? g.right : g.left;
        setRoles(v, p, g, undefined);
        push("`p.color == red` → v 와 p 가 둘 다 red (규칙 ④ 위반). `grand_p = p.parent` → grand_p = " + g.key + " (p 가 red 이므로 루트가 아니고, grand_p 는 반드시 black).", pcR(5), "red-red: " + p.key + " – " + v.key, C.red);
        setRoles(v, p, g, u);
        push("`uncle = grand_p." + (pLeft ? "right" : "left") + "` → uncle = " + (u ? (u.tri ? "부분 트리" : u.key) : "NIL") + " (" + (colorOf(u) === "R" ? "red" : "black") + ").", pcR(6), null, null,
          pLeft ? null : "대칭 경우: p 가 grand_p 의 '''오른쪽''' 자식이라 uncle = grand_p.left 이다. 슬라이드 코드(uncle = grand_p.right)는 왼쪽 경우만 적었다 — 아래 회전도 left_rotate 로 바뀐다.");
        if (colorOf(u) === "R") {
          st.action = "uncle red → flip";
          p.color = "B"; push("`uncle.color == red` → 색 뒤집기. `p.color = black`: " + p.key + " → black.", pcR(8));
          u.color = "B"; push("`uncle.color = black`: " + u.key + " → black. 이제 grand_p 아래 두 갈래 모두 black 이 하나씩 늘었다.", pcR(9));
          g.color = "R"; push("`grand_p.color = red`: " + g.key + " → red. 그 대신 grand_p 를 red 로 바꿔서 grand_p 를 지나는 경로의 black 수는 '''그대로'''(규칙 ⑤ 유지) — p.47 \"Flip colors!\"", pcR(10), "flip: " + p.key + "·" + u.key + " → black, " + g.key + " → red", C.or);
          push("`recolor(grand_p)`: 이제 grand_p = " + g.key + " 가 red 라서 '''그 부모와''' red-red 일 수 있다 → 문제를 두 층 위로 올려 같은 절차를 반복(재귀 깊이 ≤ height → O(log n)).", pcR(11));
          recolor(g, callLine);
          return;
        }
        // uncle black → rotate
        var inner = pLeft ? p.right === v : p.left === v;
        if (inner) {
          st.action = "꺾인 모양 → p 에서 먼저 회전";
          rotate(tr, p, pLeft ? "left" : "right");
          var t = v; v = p; p = t;
          setRoles(v, p, g, u);
          push("v 가 p 의 '''안쪽''' 자식(꺾인 모양)이라 먼저 p 에서 " + (pLeft ? "left" : "right") + "_rotate 를 해 일자로 편다. 이제 p = " + p.key + ", v = " + v.key + ".", pcR(12), null, null,
            "슬라이드 p.54 는 일자(v 가 바깥쪽) 경우만 그렸다. 꺾인 경우는 회전 한 번을 더 한다(CLRS 13.3 case 2).");
        }
        st.action = "uncle black → rotate";
        p.color = "B"; push("`uncle.color == black` → 회전으로 고친다. `p.color = black`: " + p.key + " → black.", pcR(13));
        g.color = "R"; push("`grand_p.color = red`: " + g.key + " → red.", pcR(14));
        var dir = pLeft ? "right" : "left";
        rotate(tr, g, dir);
        setRoles(v, p, g, u);
        push("`" + dir + "_rotate(grand_p)` — YOINK! " + p.key + " 를 잡아 올리면 " + g.key + " 가 " + (pLeft ? "오른쪽" : "왼쪽") + " 아래로 내려간다(p.54). " + p.key + " 는 black 이라 위와 red-red 가 없고, 양쪽 경로의 black 수도 그대로 → 끝(재귀 없음).",
          pcR(15), "rotate: " + p.key + " 가 위로, " + g.key + " 는 red 자식", C.green,
          pLeft ? null : "대칭 경우이므로 슬라이드의 right_rotate 대신 left_rotate(grand_p) 를 했다.");
      }

      function insert(key) {
        st.key = key; st.action = "-";
        setRoles(null, null, null);
        if (!tr.root) {
          push("`x = search(root, " + key + ")`: 트리가 비어 있다 → x 가 없다.", { RBI: 2, REC: null }, null, null, "빈 트리: 새 노드가 바로 루트가 된다(슬라이드 코드에 없는 경우).");
          var r = N(tr, key, "R"); tr.root = r;
          setRoles(r, null, null);
          push("`v = new red vertex with " + key + "` → v 가 루트.", { RBI: 3, REC: null });
          recolor(r, 3);
          return;
        }
        var x = tr.root, path = [];
        for (;;) { path.push(x.key); if (key === x.key) break; var nx = key < x.key ? x.left : x.right; if (!nx || nx.tri) break; x = nx; }
        hl = { p: x };
        st.v = "-"; st.p = "-";
        push("`x = search(root, " + key + ")` → path " + path.join(" → ") + ", 트리 밖으로 나가기 직전 노드 x = '''" + x.key + "'''.", { RBI: 2, REC: null });
        if (key === x.key) { push("이미 있는 키 → `return`.", { RBI: 11, REC: null }); return; }
        var v = N(tr, key, "R");
        var big = key > x.key;
        st.action = "새 노드는 red";
        push("`v = new red vertex with " + key + "` — 새 노드는 '''항상 red'''. black 으로 넣으면 그 경로만 black 수가 1 늘어 규칙 ⑤ 가 바로 깨지기 때문(p.41).", { RBI: 3, REC: null });
        v.parent = x; if (big) x.right = v; else x.left = v;
        setRoles(v, null, null);
        push("`" + (big ? "x.right = v" : "x.left = v") + "` (" + key + (big ? " > " : " < ") + x.key + ") — 보통 BST INSERT 와 똑같이 매단다.", { RBI: big ? 5 : 8, REC: null });
        push("`recolor(v)` 호출 — 규칙이 깨졌는지 보고 고친다.", { RBI: big ? 6 : 9, REC: 1 });
        recolor(v, big ? 6 : 9);
      }

      cs.keys.forEach(function (k) { insert(k); });
      setRoles(null, null, null);
      var L = levels(tr.root);
      st.action = valid(tr) ? "완료 · RB 규칙 성립" : "완료 · 규칙 위반?!";
      var fin = shape(tr.root);
      var tail = opts["case"] === "build" ? "1..7 을 순서대로 넣었는데도 height = " + (L - 1) + " (층 " + L + ") — 그냥 BST 였다면 사슬로 height 6 이었다. 보장: height ≤ 2 log(n+1) = 2 log 8 = 6. 회전 3번(3·5·7 삽입), 색 뒤집기 2번(4·6 삽입)이 일어났다." :
        "결과 트리 " + fin + ".";
      push("완료: " + tail + " 규칙 5개 모두 성립 → [[red-black tree]].", { RBI: null, REC: null }, "최종: " + fin, C.green);

      return {
        panels: [
          { id: "RBI", title: "rb_insert (L8 p.56)", lang: "c", lines: RBI },
          { id: "REC", title: "recolor (L8 p.57)", lang: "c", lines: REC }
        ],
        vars: [
          { name: "key", label: "삽입 키", group: "입력" },
          { name: "v", group: "역할" },
          { name: "p", group: "역할" },
          { name: "grand_p", group: "역할" },
          { name: "uncle", group: "역할" },
          { name: "colors", label: "각 색", group: "색" },
          { name: "action", label: "판정", group: "색" },
          { name: "height", label: "height (간선)", group: "트리" },
          { name: "tree", label: "트리 (key색(왼, 오))", group: "트리" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
