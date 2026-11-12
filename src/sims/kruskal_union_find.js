// kruskal_union_find — L15 p.74–84 (아이디어), p.96 (의사코드), p.97–105 (forest 가 합쳐지는 장면) 을 한 단계씩.
//   정렬된 간선을 하나씩 보고 find(u) ≠ find(v) 이면 MST 에 넣고 union, 같으면 cycle 이라 버린다. union-find 의 집합을 색으로 보여 준다.
//
// 그래프는 L15 p.4 (CONTRACT §11.1). 같은 무게 간선의 순서는 슬라이드(p.75–84, p.98–105)가 칠한 순서:
//   H–G 1, C–I 2, G–F 2, A–B 4, C–F 4, I–G 6, C–D 7, H–I 7, B–C 8, A–H 8, D–E 9, E–F 10, B–H 11, D–F 14
//   (2: C–I → G–F, 4: A–B → C–F, 7: C–D → H–I, 8: B–C → A–H). p.80 은 I–G 6 을 칠했다가 "!!!!!" 로 cycle 을 보여 주고 버린다.
//
// 기대 최종값 (src/sims/_check_L15.py → _check_L15.txt):
//   add  : H–G 1, C–I 2, G–F 2, A–B 4, C–F 4, C–D 7, B–C 8, D–E 9 → cost 37 (p.8 과 같은 MST)
//   skip : I–G 6, H–I 7, A–H 8 (그리고 stop=all 이면 E–F 10, B–H 11, D–F 14 도 cycle 로 skip)
//   집합 변화: {GH} → {CI} → {FGH} → {AB} → {CFGHI} → {CDFGHI} → {ABCDFGHI} → {ABCDEFGHI}
//   B–C 8 이 A–H 8 보다 먼저라서 B–C 가 들어간다. 순서가 반대였다면 A–H 가 들어가고 B–C 가 skip 된다(그 MST 도 cost 37).
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "kruskal(G = (V,E)):",
    "  Sort E by weight in non-decreasing order",
    "  MST = {}                      // initialize an empty tree",
    "  for v in V:",
    "    makeSet(v)                  // put each vertex in its own tree in the forest",
    "  for (u,v) in E:               // go through the edges in sorted order",
    "    if find(u) != find(v):      // if u and v are not in the same tree",
    "      add (u,v) to MST",
    "      union(u,v)                // merge u's tree with v's tree",
    "  return MST"
  ];

  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", edge: "#8aa6c8" };

  // ---------- 공용 그래프 그리기 ----------
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function nodeR(lab) { var n = String(lab).length; return { rx: n <= 2 ? 14 : 6 + n * 4.2, ry: 14 }; }
  function clip(p, R, dx, dy) {
    var L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
    var t = 1 / Math.sqrt((ux / R.rx) * (ux / R.rx) + (uy / R.ry) * (uy / R.ry));
    return { x: p.x + ux * t, y: p.y + uy * t };
  }
  function r1(x) { return Math.round(x * 10) / 10; }
  function graphSvg(P, g) {
    var defs = "", seen = {}, body = "", wl = "";
    function marker(c) {
      var id = P + "_ar" + c.replace(/[^0-9a-zA-Z]/g, "");
      if (!seen[id]) { seen[id] = 1; defs += '<marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + c + '"/></marker>'; }
      return id;
    }
    (g.edges || []).forEach(function (e) {
      var a = g.pos[e.u], b = g.pos[e.v], dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / L, ny = dx / L, off = e.off || 0;
      var A = clip(a, nodeR(g.label[e.u]), dx, dy), B = clip(b, nodeR(g.label[e.v]), -dx, -dy);
      A.x += nx * off; A.y += ny * off; B.x += nx * off; B.y += ny * off;
      var c = e.color || C.edge, m = (e.arrow === "end" || e.arrow === "both") ? marker(c) : null;
      body += '<line x1="' + r1(A.x) + '" y1="' + r1(A.y) + '" x2="' + r1(B.x) + '" y2="' + r1(B.y) + '" stroke="' + c + '" stroke-width="' + (e.width || 2) + '"' +
        (e.dash ? ' stroke-dasharray="5 4"' : "") + (m ? ' marker-end="url(#' + m + ')"' : "") + (m && e.arrow === "both" ? ' marker-start="url(#' + m + ')"' : "") + '/>';
      if (e.w !== undefined && e.w !== null) {
        var t = e.wt === undefined ? 0.5 : e.wt, sd = e.wside || 1;
        var mx = A.x + (B.x - A.x) * t + nx * 12 * sd, my = A.y + (B.y - A.y) * t + ny * 12 * sd, tw = String(e.w).length * 7.5 + 6;
        wl += '<rect x="' + r1(mx - tw / 2) + '" y="' + r1(my - 9) + '" width="' + r1(tw) + '" height="17" rx="3" fill="#fff" fill-opacity="0.85"/>' +
          '<text x="' + r1(mx) + '" y="' + r1(my + 4.5) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="' + (e.wc || C.pur) + '">' + esc(e.w) + '</text>';
      }
    });
    body += wl;
    Object.keys(g.pos).forEach(function (id) {
      var p = g.pos[id], R = nodeR(g.label[id]), st = (g.node && g.node[id]) || {};
      body += '<ellipse cx="' + p.x + '" cy="' + p.y + '" rx="' + r1(R.rx) + '" ry="' + R.ry + '" fill="' + (st.fill || "#fff") + '" stroke="' + (st.stroke || C.muted) + '" stroke-width="' + (st.sw || 1.5) + '"/>';
      body += '<text x="' + p.x + '" y="' + (p.y + 4.5) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + (st.tc || "#222") + '">' + esc(g.label[id]) + '</text>';
      var tg = g.tag && g.tag[id];
      if (tg) body += '<text x="' + p.x + '" y="' + (tg.up ? p.y - 20 : p.y + 28) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + (tg.c || C.pur) + '">' + esc(tg.t) + '</text>';
    });
    return '<svg viewBox="0 0 ' + g.w + ' ' + g.h + '" width="' + g.w + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">' +
      (defs ? "<defs>" + defs + "</defs>" : "") + (g.pre || "") + body + (g.extra || "") + "</svg>";
  }
  function legend(x, y, items) {
    var s = "";
    items.forEach(function (it, i) {
      s += '<circle cx="' + (x + 7) + '" cy="' + (y + i * 18) + '" r="6" fill="' + it[0] + '" stroke="' + it[1] + '" stroke-width="1.5"/>' +
        '<text x="' + (x + 18) + '" y="' + (y + i * 18 + 4) + '" font-size="11.5" fill="#333">' + esc(it[2]) + '</text>';
    });
    return s;
  }


  var V = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  var POS = { A: { x: 330, y: 200 }, B: { x: 420, y: 85 }, C: { x: 530, y: 85 }, D: { x: 640, y: 85 }, E: { x: 735, y: 200 },
    I: { x: 490, y: 200 }, H: { x: 420, y: 315 }, G: { x: 530, y: 315 }, F: { x: 640, y: 315 } };
  var SORTED = [["H", "G", 1], ["C", "I", 2], ["G", "F", 2], ["A", "B", 4], ["C", "F", 4], ["I", "G", 6], ["C", "D", 7],
    ["H", "I", 7], ["B", "C", 8], ["A", "H", 8], ["D", "E", 9], ["E", "F", 10], ["B", "H", 11], ["D", "F", 14]];
  var PAL = [["#dbe8f7", "#1d65b3"], ["#fdeec2", "#c77d1a"], ["#efe9f6", "#6b4fa0"], ["#fbe3e7", "#c23a52"], ["#e0f4f1", "#1f8a7a"],
    ["#f3f0d8", "#8a7d1a"], ["#e8e8e8", "#555"], ["#fde4d4", "#b5541c"], ["#e4ecd9", "#4d7a24"]];

  global.SIMS["kruskal_union_find"] = {
    title: "Kruskal — 정렬된 간선과 union-find (L15 p.74–105)",
    desc: "L15 p.74–105. [[Kruskal's algorithm]] 은 간선을 무게 순으로 하나씩 보면서, 두 끝점이 '''다른 tree''' 에 있으면 넣고 같은 tree 에 있으면 버린다(넣으면 cycle). " +
      "tree 들의 모임([[forest]])은 [[union-find]] 로 관리한다. `find(u)` 는 u 가 속한 집합, `union(u,v)` 는 두 집합 합치기다. 같은 색 정점 = 같은 집합.",
    options: [
      { key: "stop", label: "끝내는 시점", values: [
        { value: "all", label: "p.96 코드 그대로: 간선을 끝까지 본다" },
        { value: "early", label: "p.105: 간선 n−1 = 8 개가 모이면 멈춘다" }
      ] }
    ],
    build: function (opts) {
      var early = opts.stop === "early";
      var parent = {}, mst = [], status = SORTED.map(function () { return "pending"; }), steps = [];
      var ci = -1, cu = "-", cv = "-", fu = "-", fv = "-", sorted = false, made = false;
      function find(x) { while (parent[x] !== x) x = parent[x]; return x; }
      function sets() {
        var m = {};
        V.forEach(function (v) { var r = made ? find(v) : v; (m[r] = m[r] || []).push(v); });
        return Object.keys(m).map(function (r) { return m[r]; }).sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
      }
      function setsStr() { return made ? sets().map(function (s) { return "{" + s.join("") + "}"; }).join(" ") : "-"; }
      function cost() { return mst.reduce(function (a, e) { return a + e[2]; }, 0); }
      function draw(msg, msgColor) {
        var node = {}, label = {}, col = {};
        // 색은 집합의 루트(find) 정점 기준 → 합쳐져도 큰 쪽 색이 유지돼 따라가기 쉽다
        V.forEach(function (v) { col[v] = PAL[V.indexOf(made ? find(v) : v) % PAL.length]; });
        V.forEach(function (v) {
          label[v] = v;
          var c = made ? col[v] : ["#fff", "#777"];
          node[v] = { fill: c[0], stroke: c[1], sw: (v === cu || v === cv) ? 4 : 2 };
        });
        var es = SORTED.map(function (e, i) {
          var st = status[i], isCur = i === ci;
          var color = st === "add" ? C.green : st === "skip" ? "#d9b3ba" : C.edge;
          if (isCur) color = st === "skip" ? C.red : C.or;
          return { u: e[0], v: e[1], w: e[2], arrow: "none", color: color, width: isCur || st === "add" ? 5 : 2, dash: st === "skip" };
        });
        var x0 = 10, y0 = 50, s = "";
        s += '<text x="' + x0 + '" y="' + (y0 - 10) + '" font-size="12" font-weight="700" fill="' + C.pur + '">' + (sorted ? "정렬된 간선 (무게 오름차순)" : "간선 (아직 정렬 전)") + '</text>';
        SORTED.forEach(function (e, i) {
          var y = y0 + i * 21, st = status[i], cur = i === ci;
          var fill = cur ? (st === "skip" ? C.redL : C.orL) : st === "add" ? C.greenL : st === "skip" ? "#f4f4f4" : "#fff";
          var stroke = cur ? (st === "skip" ? C.red : C.or) : st === "add" ? C.green : "#ccc";
          var tx = st === "add" ? "추가" : st === "skip" ? "cycle → 버림" : cur ? "검사 중" : "";
          s += '<rect x="' + x0 + '" y="' + y + '" width="210" height="19" fill="' + fill + '" stroke="' + stroke + '"/>' +
            '<text x="' + (x0 + 8) + '" y="' + (y + 14) + '" font-size="12" font-weight="700" fill="#222">' + e[0] + "–" + e[1] + '</text>' +
            '<text x="' + (x0 + 62) + '" y="' + (y + 14) + '" font-size="12" font-weight="700" fill="' + C.pur + '">' + e[2] + '</text>' +
            '<text x="' + (x0 + 92) + '" y="' + (y + 14) + '" font-size="11.5" fill="' + (st === "skip" ? C.red : st === "add" ? C.green : C.muted) + '"' + (st === "skip" && !cur ? ' text-decoration="line-through"' : "") + '>' + tx + '</text>';
        });
        s += '<text x="300" y="22" font-size="12.5" font-weight="700" fill="' + C.pur + '">집합(forest): ' + esc(setsStr()) + '</text>';
        s += '<text x="300" y="368" font-size="12.5" font-weight="700" fill="' + C.green + '">MST cost = ' + cost() + ' (간선 ' + mst.length + '/8)</text>';
        if (msg) s += '<text x="752" y="350" font-size="13" text-anchor="end" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        return graphSvg("kru", { w: 760, h: 378, pos: POS, label: label, edges: es, node: node, extra: s });
      }
      function snap(desc, line, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { K: line },
          vars: { e: ci >= 0 ? SORTED[ci][0] + "–" + SORTED[ci][1] + " (" + SORTED[ci][2] + ")" : "-", fu: fu, fv: fv, sets: setsStr(),
            mst: mst.map(function (e) { return e[0] + "–" + e[1] + " " + e[2]; }).join(", ") || "-", cost: cost() },
          note: note, svg: draw(msg, msgColor)
        });
      }

      snap("그래프 L15 p.4. 간선 14개를 아직 정렬하지 않았다.", 1);
      sorted = true;
      snap("`Sort E by weight in non-decreasing order` — 1, 2, 2, 4, 4, 6, 7, 7, 8, 8, 9, 10, 11, 14. 같은 무게는 슬라이드가 칠한 순서대로 둔다.", 2,
        "정렬이 O(m log n) 으로 Kruskal 시간의 대부분이다. 가중치가 작은 정수면 radixSort 로 O(m) 에 끝낼 수 있다(p.106).");
      snap("`MST = {}` — 빈 간선 집합에서 시작한다.", 3);
      V.forEach(function (v) { parent[v] = v; });
      made = true;
      snap("`makeSet(v)` 를 9번 — 모든 정점이 자기 혼자인 tree 다(p.97 \"To start, every vertex is in its own tree\").", 5,
        "Kruskal 은 매 순간 forest(서로 겹치지 않는 tree 들의 모임)를 들고 있다(p.87). 색이 같은 정점이 같은 tree 다.");

      for (var i = 0; i < SORTED.length; i++) {
        if (early && mst.length === V.length - 1) break;
        var e = SORTED[i];
        ci = i; cu = e[0]; cv = e[1];
        fu = "-"; fv = "-";
        snap("다음 간선 '''" + e[0] + "–" + e[1] + " (" + e[2] + ")'''.", 6);
        fu = "{" + sets().filter(function (s) { return s.indexOf(e[0]) >= 0; })[0].join("") + "}";
        fv = "{" + sets().filter(function (s) { return s.indexOf(e[1]) >= 0; })[0].join("") + "}";
        if (find(e[0]) !== find(e[1])) {
          status[i] = "add"; mst.push(e);
          snap("`find(" + e[0] + ") = " + fu + "`, `find(" + e[1] + ") = " + fv + "` → 다른 tree 다. `add (" + e[0] + "," + e[1] + ") to MST`.", 8,
            "이 간선은 cut {" + fu.slice(1, -1) + ", 나머지} 를 건너는 간선 중 가장 가볍다. 더 가벼운 간선은 이미 다 봤고, 그중 이 cut 을 건너는 것은 없었기 때문이다(p.111). 그래서 [[MST 보조정리]] 로 안전하다.");
          parent[find(e[1])] = find(e[0]);
          snap("`union(" + e[0] + "," + e[1] + ")` — 두 tree 를 합친다. 이제 집합은 " + setsStr() + ".", 9, null,
            mst.length === V.length - 1 ? "한 덩어리 tree 완성" : null, C.green);
        } else {
          status[i] = "skip";
          snap("`find(" + e[0] + ") = find(" + e[1] + ") = " + fu + "` → 같은 tree 다. 넣으면 cycle 이 생기므로 '''버린다'''." +
            (e[0] === "I" && e[1] === "G" ? " (p.80 의 \"!!!!!\" 장면)" : ""), 7,
            e[0] === "A" && e[1] === "H" ? "A–H 도 무게 8 이지만 B–C 를 먼저 넣어서 A 와 H 가 이미 같은 tree 다. 동점 순서가 반대였다면 A–H 가 들어가고 B–C 가 버려진다. 그 MST 도 cost 37 이다." : null,
            "cycle → skip", C.red);
        }
      }
      ci = -1; cu = "-"; cv = "-"; fu = "-"; fv = "-";
      snap("`return MST` — " + mst.map(function (e) { return e[0] + "–" + e[1]; }).join(", ") + ", cost '''" + cost() + "'''. p.8 의 MST 와 같다." +
        (early ? " 간선 8개가 모여서 나머지는 보지 않았다." : " 마지막 세 간선(E–F, B–H, D–F)은 모두 cycle 이라 버렸다."), 10,
        "union-find 연산은 makeSet n 번, find 2m 번, union n−1 번이다. 각각 amortized O(α(n)) 이고 α 는 [[inverse Ackermann function]] 이다. 그래서 정렬이 병목이고 전체 O(m log n) 이다(p.106).",
        "MST cost 37", C.green);

      return {
        panels: [{ id: "K", title: "kruskal(G) (L15 p.96)", lang: "txt", lines: CODE }],
        vars: [
          { name: "e", label: "지금 간선 (u,v)", group: "현재" },
          { name: "fu", label: "find(u)", group: "현재" },
          { name: "fv", label: "find(v)", group: "현재" },
          { name: "sets", label: "union-find 집합", group: "forest" },
          { name: "mst", label: "MST 간선", group: "forest" },
          { name: "cost", label: "MST cost", group: "forest" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
