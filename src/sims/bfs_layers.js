// bfs_layers — L9 p.86 의 layer 버전 BFS 를 한 줄씩: L_0, L_1, … 리스트, parent(BFS tree), 옵션으로 bipartite 판별(p.100–111).
//
// 그래프는 슬라이드 PNG 에서 복원 (정점 이름은 p.89 / p.100 의 A–G).
//  bfs / bip_no : L9 p.81–89, p.101–110 의 그래프 (무방향, 간선 9개)
//                 A:[B,E] B:[A,C,F] C:[B,D,G] D:[C,E,G] E:[A,D] F:[B,G] G:[C,D,F]
//                 (DFS 예제 p.49 그래프와 다르다: B–D 대신 D–E 가 있다)
//  bip_yes      : p.100 "Solution using BFS" 그림의 그래프 = 위 그래프에서 C–D 를 뺀 것 (C–D 점선이 없다)
//
// 기대 최종값 (src/sims/_check_final.py → _check_final.txt):
//  bfs    : L0=[A], L1=[B,E], L2=[C,F,D], L3=[G]; parent B,E←A, C,F←B, D←E, G←C (p.89 BFS tree 와 같음)
//           거리 d(A,·): B 1, E 1, C 2, F 2, D 2, G 3
//  bip_no : L2 의 C 를 처리하다가 이웃 D 가 같은 layer(L2, 같은 색) → NOT bipartite. odd cycle A–B–C–D–E–A (길이 5). G 는 아직 미방문 (p.110 그림과 같음)
//  bip_yes: 같은 layer 안 간선 없음 → bipartite. 색 0 = {A, C, F, D}, 색 1 = {B, E, G}
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var BASE = [
    "Set L_i = [] for i = 1, ..., n",
    "L_0 = {w}, where w is the start node",
    "For i = 0, ..., n-1:",
    "    For u in L_i:",
    "        For each v which is a neighbor of u:",
    "            If v isn't yet visited:",
    "                mark v as visited, and put it in L_{i+1}"
  ];
  var PLAIN = BASE.concat(["dist(w, v) = i  for every v in L_i    # p.92"]);
  var CHECK = BASE.concat([
    "            elif color(v) == color(u):    # color = i mod 2 (p.100)",
    "                return NOT bipartite      # odd cycle 발견",
    "return bipartite                          # 짝수 layer 한 색, 홀수 layer 다른 색"
  ]);

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


  var G1 = { A: ["B", "E"], B: ["A", "C", "F"], C: ["B", "D", "G"], D: ["C", "E", "G"], E: ["A", "D"], F: ["B", "G"], G: ["C", "D", "F"] };
  var G2 = { A: ["B", "E"], B: ["A", "C", "F"], C: ["B", "G"], D: ["E", "G"], E: ["A", "D"], F: ["B", "G"], G: ["C", "D", "F"] };
  var POS = { A: { x: 80, y: 165 }, D: { x: 210, y: 75 }, E: { x: 360, y: 80 }, F: { x: 455, y: 150 }, B: { x: 270, y: 215 }, G: { x: 395, y: 285 }, C: { x: 120, y: 310 } };
  var EX = {
    bfs: { label: "BFS layer (L9 p.81–92)", adj: G1, check: false },
    bip_no: { label: "bipartite 판별 — p.101–110 그래프 (C–D 있음)", adj: G1, check: true },
    bip_yes: { label: "bipartite 판별 — p.100 그래프 (C–D 없음)", adj: G2, check: true }
  };
  var LAYER_C = [[C.purL, C.pur], [C.blueL, C.blue], [C.orL, C.or], [C.greenL, C.green], [C.redL, C.red]];
  var PAR_C = [[C.orL, C.or], [C.blueL, C.blue]];

  global.SIMS["bfs_layers"] = {
    title: "BFS — layer L₀, L₁, L₂, … 와 bipartite 판별 (L9 p.86, p.100)",
    desc: "L9 p.81–111. [[BFS]] 는 큐 대신 '''[[layer]] 리스트'''로 생각한다: $L_i$ 의 정점들의 아직 안 간 이웃이 $L_{i+1}$. 그래서 $L_i$ 에 든 정점까지의 [[무가중치 최단거리]]는 정확히 i 다. " +
      "bipartite 옵션은 layer 를 번갈아 두 색으로 칠하다가(i mod 2) '''같은 색 두 정점을 잇는 간선'''(= 같은 layer 안 간선)을 만나면 [[odd cycle]] 이 있으므로 [[bipartite graph]] 가 아니라고 답한다. " +
      "그래프는 슬라이드 그림에서 복원했다(이웃 순서 = 알파벳, 슬라이드 layer 순서와 같다).",
    options: [
      { key: "ex", label: "모드", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.bfs, adj = ex.adj, ids = Object.keys(adj);
      var lines = ex.check ? CHECK : PLAIN;
      var L = [], layerOf = {}, parent = {}, steps = [];
      var ci = "-", cu = "-", cv = "-", hot = null, bad = null, result = "-", cycle = null;

      var edges = [];
      ids.forEach(function (u) { adj[u].forEach(function (v) { if (u < v) edges.push({ u: u, v: v }); }); });

      function layersStr() { return L.map(function (l, i) { return "L" + i + "=[" + l.join(",") + "]"; }).join(" "); }
      function parentStr() { return ids.filter(function (v) { return parent[v]; }).map(function (v) { return v + "←" + parent[v]; }).join(", ") || "-"; }
      function colorStr() {
        if (!ex.check) return "-";
        var c0 = [], c1 = [];
        ids.forEach(function (v) { if (layerOf[v] !== undefined) (layerOf[v] % 2 ? c1 : c0).push(v); });
        return "색0={" + c0.join(",") + "} 색1={" + c1.join(",") + "}";
      }
      function draw(msg, msgColor) {
        var node = {}, tag = {};
        ids.forEach(function (v) {
          if (layerOf[v] === undefined) { node[v] = { fill: "#fff", stroke: C.muted }; return; }
          var k = layerOf[v], pc = ex.check ? PAR_C[k % 2] : LAYER_C[Math.min(k, 4)];
          node[v] = { fill: pc[0], stroke: pc[1], sw: 2.5 };
          if (v === cu) node[v].sw = 4.5;
          tag[v] = { t: "L" + k, c: pc[1], up: v === "D" || v === "E" || v === "F" };
        });
        var es = edges.map(function (e) {
          var isBad = bad && ((bad[0] === e.u && bad[1] === e.v) || (bad[0] === e.v && bad[1] === e.u));
          var isHot = hot && ((hot[0] === e.u && hot[1] === e.v) || (hot[0] === e.v && hot[1] === e.u));
          var tree = parent[e.v] === e.u || parent[e.u] === e.v;
          var child = parent[e.v] === e.u ? e.v : e.u;
          var tc = tree ? (ex.check ? PAR_C[layerOf[child] % 2][1] : LAYER_C[Math.min(layerOf[child], 4)][1]) : C.edge;
          return { u: e.u, v: e.v, arrow: "none", color: isBad ? C.red : isHot ? C.or : tc, width: isBad ? 6 : isHot || tree ? 4 : 2, dash: isHot && !tree && !isBad };
        });
        var extra = '<rect x="545" y="40" width="205" height="' + (34 + Math.max(1, L.length) * 26) + '" rx="6" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="1"/>' +
          '<text x="557" y="60" font-size="12.5" font-weight="700" fill="' + C.pur + '">layer 리스트</text>';
        L.forEach(function (l, i) {
          var pc = ex.check ? PAR_C[i % 2] : LAYER_C[Math.min(i, 4)];
          extra += '<rect x="557" y="' + (70 + i * 26) + '" width="181" height="21" rx="4" fill="' + pc[0] + '" stroke="' + pc[1] + '"' + (ci === i ? ' stroke-width="3"' : "") + '/>' +
            '<text x="565" y="' + (85 + i * 26) + '" font-size="12.5" font-weight="700" fill="#222">L' + i + ' = [' + esc(l.join(", ")) + ']' + (ci === i ? "  ← i" : "") + '</text>';
        });
        extra += '<text x="12" y="22" font-size="12.5" font-weight="700" fill="' + C.pur + '">' + (ex.check ? "색 = layer 번호 mod 2 (주황 = 짝수, 파랑 = 홀수)" : "색 = layer (보라 L0 · 파랑 L1 · 주황 L2 · 초록 L3)") + '</text>';
        if (msg) extra += '<text x="12" y="362" font-size="13" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        var label = {}; ids.forEach(function (v) { label[v] = v; });
        return graphSvg("bfs", { w: 760, h: 375, pos: POS, label: label, edges: es, node: node, tag: tag, extra: extra });
      }
      function snap(desc, line, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { B: line },
          vars: { i: ci, u: cu, v: cv, L_i: ci === "-" || !L[ci] ? "-" : L[ci].slice(), L_next: ci === "-" || !L[ci + 1] ? "-" : L[ci + 1].slice(),
            layers: layersStr() || "-", parent: parentStr(), color: colorStr(), result: result },
          note: note, svg: draw(msg, msgColor)
        });
      }

      snap("`Set L_i = []` — 빈 layer 리스트를 준비한다. 시작 정점 w = A.", 1);
      L.push(["A"]); layerOf.A = 0;
      snap("`L_0 = {w}` → L0 = [A]. A 는 0 걸음에 갈 수 있는 유일한 정점(visited 표시).", 2);

      var stop = false;
      for (var i = 0; i < ids.length && !stop; i++) {
        ci = i; cu = "-"; cv = "-"; hot = null;
        if (!L[i] || !L[i].length) {
          snap("i = " + i + ": L" + i + " 가 비어 있다 → 남은 반복은 할 일이 없다(모든 도달 가능 정점을 찾았다).", 3);
          break;
        }
        L[i + 1] = [];
        snap("`For i = " + i + "` — L" + i + " = [" + L[i].join(", ") + "] 의 정점들에서 한 걸음 더 간 정점을 L" + (i + 1) + " 에 모은다.", 3);
        for (var a = 0; a < L[i].length && !stop; a++) {
          var u = L[i][a];
          cu = u; cv = "-"; hot = null;
          snap("`For u in L_" + i + "` → u = " + u + ".", 4);
          for (var b = 0; b < adj[u].length; b++) {
            var v = adj[u][b];
            cv = v; hot = [u, v];
            if (layerOf[v] === undefined) {
              snap("v = " + v + " (u = " + u + " 의 이웃): 아직 visited 아님.", 6);
              layerOf[v] = i + 1; parent[v] = u; L[i + 1].push(v);
              snap("`mark v as visited, and put it in L_" + (i + 1) + "` → L" + (i + 1) + " = [" + L[i + 1].join(", ") + "]. parent(" + v + ") = " + u + " (BFS tree 간선)" +
                (ex.check ? ", 색 = " + ((i + 1) % 2) + "." : "."), 7);
            } else if (ex.check && layerOf[v] % 2 === layerOf[u] % 2) {
              snap("v = " + v + ": 이미 visited (L" + layerOf[v] + ").", 6);
              bad = [u, v];
              // odd cycle: u 와 v 에서 parent 를 따라 올라가 만나는 곳까지
              var pu = [u], pv = [v];
              while (pu[pu.length - 1] !== pv[pv.length - 1]) { pu.push(parent[pu[pu.length - 1]]); pv.push(parent[pv[pv.length - 1]]); }
              cycle = pu.concat(pv.slice(0, -1).reverse());
              result = "NOT bipartite";
              snap("`elif color(v) == color(u)` → " + u + " 와 " + v + " 가 '''둘 다 L" + layerOf[u] + "''' (같은 색) 인데 간선으로 이어져 있다!", 8, null, "WHOA NOT BIPARTITE!", C.red);
              snap("`return NOT bipartite`. BFS tree 를 따라 " + u + " 와 " + v + " 에서 위로 올라가 만나는 정점까지 잇고 간선 " + u + "–" + v + " 를 더하면 사이클 " +
                cycle.join("–") + "–" + cycle[0] + " (길이 " + cycle.length + ", 홀수). [[odd cycle]] 이 있으면 어떻게 칠해도 2-coloring 이 불가능 → 이 그래프는 [[bipartite graph]] 가 아니다.", 9,
                "두 경로의 길이가 같으므로(둘 다 L" + layerOf[u] + " 까지 " + layerOf[u] + " 걸음) 사이클 길이 = 2·" + (cycle.length - 1) / 2 + " + 1 = 홀수. 아직 방문 안 한 정점(G)이 있어도 바로 끝낸다(p.110).",
                "odd cycle " + cycle.join("–") + "–" + cycle[0] + " (길이 " + cycle.length + ")", C.red);
              stop = true;
              break;
            } else {
              snap("v = " + v + ": 이미 visited (L" + layerOf[v] + ") → 건너뜀" + (ex.check ? " (색이 다르므로 문제 없음)." : "."), 6);
            }
          }
        }
        if (!stop && L[i + 1].length === 0) { L.pop(); ci = i; cu = "-"; cv = "-"; hot = null;
          snap("L" + i + " 의 모든 정점을 봤는데 새 정점이 없다 → L" + (i + 1) + " 은 비어 있다. 탐색 끝.", 3);
          break;
        }
      }
      cu = "-"; cv = "-"; hot = null;
      if (!stop) {
        if (ex.check) {
          result = "bipartite";
          snap("`return bipartite` — 같은 layer 안 간선이 하나도 없다. " + colorStr() + " 로 칠하면 모든 간선이 서로 다른 색을 잇는다.", 10, null,
            "bipartite! (모든 간선이 이웃 layer 끼리)", C.green);
        } else {
          result = ids.map(function (v) { return v + ":" + layerOf[v]; }).join(" ");
          snap("`dist(w, v) = i` — 결과 " + layersStr() + ". 거리: " + ids.filter(function (v) { return v !== "A"; }).map(function (v) { return "d(A," + v + ")=" + layerOf[v]; }).join(", ") +
            ". 색 간선만 남기면 p.89 의 BFS tree. 각 정점 한 번, 각 간선 두 번 보므로 [[O(n+m)]].", 8,
            "BFS 의 거리는 '''간선 개수''' 기준이다. 가중치가 있는 그래프의 최단경로는 BFS 로 구할 수 없다 → [[Dijkstra]].", "L3 = [G] 까지: d(A, G) = 3", C.green);
        }
      }

      return {
        panels: [{ id: "B", title: ex.check ? "BFS + bipartite 판별 (L9 p.86, p.100)" : "BFS (L9 p.86) + 거리 (p.92)", lang: "txt", lines: lines }],
        vars: [
          { name: "i", label: "i (layer 번호)", group: "반복" },
          { name: "u", label: "u ∈ L_i", group: "반복" },
          { name: "v", label: "v (u 의 이웃)", group: "반복" },
          { name: "L_i", label: "L_i", group: "layer" },
          { name: "L_next", label: "L_{i+1}", group: "layer" },
          { name: "layers", label: "전체 layer", group: "layer" },
          { name: "parent", label: "parent (BFS tree)", group: "결과" },
          { name: "color", label: "색 (i mod 2)", group: "결과" },
          { name: "result", label: "결과", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
