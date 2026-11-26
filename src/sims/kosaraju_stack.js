// kosaraju_stack — Kosaraju(= L10 SCC 알고리즘) 를 A7 문서의 파이썬 코드 그대로 한 줄씩 돌리는 디버거.
//   finish 순서 list `order` 를 '스택' 으로 그려서, 1차 DFS 에서 쌓이고 2차 DFS 에서 위에서부터 꺼내지는 모습을 보여 준다.
//   버그 옵션 2개(2차를 G 에서 / finish 오름차순)는 틀린 결과가 어떻게 나오는지 보여 준다.
//
// 그래프:
//   clrs : CLRS 그림 22.9 (self-loop h→h 는 결과에 영향이 없어 뺐다)
//          a→b, b→c, b→e, b→f, c→d, c→g, d→c, d→h, e→a, e→f, f→g, g→f, g→h
//   small: A→B, B→C, C→A, B→D, D→E, E→D
//   이웃·정점 순회 순서 = 알파벳 순. GT 의 이웃 순서는 코드대로(u 를 알파벳 순으로 돌며 GT[v].append(u)).
//
// 기대 최종값 (손 검산):
//  clrs  ok  : order = [h, d, f, g, c, e, b, a] → reversed = a, b, e, c, g, f, d, h
//              GT: a:[e] b:[a] c:[b,d] d:[c] e:[b] f:[b,e,g] g:[c,f] h:[d,g]
//              comps = [a,e,b], [c,d], [g,f], [h]
//  clrs  onG : 2차를 G 에서 → a 에서 전부 도달 → comps = [[a,b,c,d,h,g,f,e]] (1개, 틀림)
//  clrs  asc : 오름차순(h 부터) GT 에서 → h 가 d,c,b,a,e,g,f 를 다 삼킴 → comps = [[h,d,c,b,a,e,g,f]] (1개, 틀림)
//  small ok  : order = [C, E, D, B, A] → comps = [A,C,B], [D,E]
//  small onG : [[A,B,C,D,E]] (틀림) / small asc: 우연히 [C,B,A], [E,D] 로 맞음 → sim 이 "우연히 맞음" 표시
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", edge: "#8aa6c8" };

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


  var GRAPHS = {
    clrs: {
      label: "CLRS 그림 22.9 (정점 8개, SCC 4개)",
      adj: { a: ["b"], b: ["c", "e", "f"], c: ["d", "g"], d: ["c", "h"], e: ["a", "f"], f: ["g"], g: ["f", "h"], h: [] },
      pos: { a: { x: 70, y: 95 }, b: { x: 215, y: 95 }, c: { x: 360, y: 95 }, d: { x: 505, y: 95 },
             e: { x: 70, y: 255 }, f: { x: 215, y: 255 }, g: { x: 360, y: 255 }, h: { x: 505, y: 255 } },
      up: { a: 1, b: 1, c: 1, d: 1 }
    },
    small: {
      label: "작은 예 (정점 5개, SCC 2개)",
      adj: { A: ["B"], B: ["C", "D"], C: ["A"], D: ["E"], E: ["D"] },
      pos: { A: { x: 90, y: 95 }, B: { x: 260, y: 95 }, C: { x: 175, y: 255 }, D: { x: 430, y: 95 }, E: { x: 430, y: 255 } },
      up: { A: 1, B: 1, D: 1 }
    }
  };
  var MODES = {
    ok: { label: "정상: 2차는 G^T 에서, finish 내림차순" },
    onG: { label: "버그 ①: 2차 DFS 도 원래 G 에서" },
    asc: { label: "버그 ②: 2차 시작 순서를 finish 오름차순으로" }
  };
  var SCC_C = [[C.redL, C.red], [C.blueL, C.blue], [C.greenL, C.green], [C.orL, C.or], [C.purL, C.pur], ["#eee", "#555"]];

  function codeLines(mode) {
    return [
      "def scc(G):",
      "    visited, order = set(), []",
      "    def dfs1(u):",
      "        visited.add(u)",
      "        for v in G[u]:",
      "            if v not in visited:",
      "                dfs1(v)",
      "        order.append(u)        # finish 하는 순간 push",
      "    for u in G:",
      "        if u not in visited:",
      "            dfs1(u)",
      "    GT = {u: [] for u in G}",
      "    for u in G:",
      "        for v in G[u]:",
      "            GT[v].append(u)    # 간선 뒤집기",
      "    visited, comps = set(), []",
      "    def dfs2(u, comp):",
      "        visited.add(u); comp.append(u)",
      mode === "onG" ? "        for v in G[u]:         # ✗ 버그: GT 가 아니라 G" : "        for v in GT[u]:",
      "            if v not in visited:",
      "                dfs2(v, comp)",
      mode === "asc" ? "    for u in order:            # ✗ 버그: 오름차순" : "    for u in reversed(order):  # 스택 맨 위부터 pop",
      "        if u not in visited:",
      "            comp = []",
      "            dfs2(u, comp)",
      "            comps.append(comp)     # tree 하나 = SCC 하나",
      "    return comps"
    ];
  }

  global.SIMS["kosaraju_stack"] = {
    title: "Kosaraju 디버거 — finish 스택 쌓기 → 뒤집기 → 위에서부터 꺼내기",
    desc: "[[SCC 알고리즘]] 문서의 파이썬 코드를 한 줄씩 실행한다. 오른쪽 '''order 스택'''은 1차 DFS 에서 정점이 finish 하는 순간 아래부터 쌓인다. 2차 DFS 는 이 스택을 '''맨 위(finish 가 가장 큰 것)부터''' 꺼내며 [[G^T]] 에서 DFS 하고, tree 하나가 SCC 하나가 된다. " +
      "'''버그 옵션'''으로 2차를 $G$ 에서 돌리거나 오름차순으로 돌리면 SCC 가 한 덩어리로 뭉개지는 것을 볼 수 있다. 이웃 순서는 알파벳 순.",
    options: [
      { key: "g", label: "그래프", values: Object.keys(GRAPHS).map(function (k) { return { value: k, label: GRAPHS[k].label }; }) },
      { key: "mode", label: "실행", values: Object.keys(MODES).map(function (k) { return { value: k, label: MODES[k].label }; }) }
    ],
    build: function (opts) {
      var gr = GRAPHS[opts.g] || GRAPHS.clrs, mode = MODES[opts.mode] ? opts.mode : "ok";
      var G = gr.adj, IDS = Object.keys(G).sort();
      var steps = [];
      var visited = {}, order = [], stack = [], GT = null, gtDone = {}, comps = [], comp = null, compOf = {};
      var phase = "1차 DFS (G)", cu = "-", cv = "-", hot = null, popIdx = -1, treeEdge = {};
      var pass2 = false;

      function adj2(u) { return mode === "onG" ? G[u] : GT[u]; }
      function draw(msg, msgColor) {
        var node = {}, tag = {}, es = [], label = {};
        IDS.forEach(function (v) {
          label[v] = v;
          if (pass2) {
            if (compOf[v] !== undefined) { var cc = SCC_C[compOf[v] % SCC_C.length]; node[v] = { fill: cc[0], stroke: cc[1], sw: 2.5 }; }
            else node[v] = { fill: "#fff", stroke: C.muted };
          } else {
            var fin = order.indexOf(v) >= 0;
            node[v] = fin ? { fill: C.greenL, stroke: C.green, sw: 2.5 } : visited[v] ? { fill: C.orL, stroke: C.or, sw: 2.5 } : { fill: "#fff", stroke: C.muted };
          }
          if (v === cu) node[v].sw = 4.5;
          var k = order.indexOf(v);
          if (k >= 0) tag[v] = { t: "#" + (k + 1) + " finish", c: pass2 ? C.pur : C.green, up: !!gr.up[v] };
        });
        var rev = pass2 && mode !== "onG";
        IDS.forEach(function (a) {
          G[a].forEach(function (b) {
            var flipped = rev || (GT && gtDone[a] && !pass2);
            var u = flipped ? b : a, w = flipped ? a : b;
            var both = G[b].indexOf(a) >= 0;
            var isHot = hot && hot[0] === u && hot[1] === w;
            var tree = treeEdge[u + ">" + w];
            var col = isHot ? C.or : tree ? (pass2 ? SCC_C[compOf[w] % SCC_C.length][1] : C.red) : flipped ? C.blue : C.edge;
            es.push({ u: u, v: w, arrow: "end", off: both ? 5 : 0, color: col, width: isHot || tree ? 3.5 : 1.8, dash: flipped && !pass2 ? 1 : 0 });
          });
        });
        var extra = '<text x="12" y="22" font-size="13" font-weight="700" fill="' + (rev ? C.blue : C.pur) + '">' + esc(phase) + '</text>' +
          '<text x="12" y="42" font-size="12" fill="#333">호출 스택: ' + (stack.length ? esc(stack.map(function (x) { return (pass2 ? "dfs2(" : "dfs1(") + x + ")"; }).join(" → ")) : "(비어 있음)") + '</text>';
        // order 스택 그림
        var SX = 600, SW = 120, BOT = 330, H = 26;
        extra += '<text x="' + (SX + SW / 2) + '" y="62" text-anchor="middle" font-size="12.5" font-weight="700" fill="' + C.pur + '">order 스택</text>';
        extra += '<text x="' + (SX + SW / 2) + '" y="77" text-anchor="middle" font-size="10.5" fill="' + C.muted + '">' + (pass2 ? (mode === "asc" ? "✗ 아래부터 꺼냄" : "위에서부터 꺼냄") : "finish 하면 위에 쌓임") + '</text>';
        extra += '<path d="M' + SX + ',84 L' + SX + ',' + (BOT + 2) + ' L' + (SX + SW) + ',' + (BOT + 2) + ' L' + (SX + SW) + ',84" fill="none" stroke="#999" stroke-width="2"/>';
        order.forEach(function (v, i) {
          var y = BOT - (i + 1) * H, used = pass2 && (mode === "asc" ? i <= popIdx : i >= popIdx && popIdx >= 0);
          var isCur = pass2 && i === popIdx;
          var cc = compOf[v] !== undefined && pass2 ? SCC_C[compOf[v] % SCC_C.length] : [C.greenL, C.green];
          extra += '<rect x="' + (SX + 6) + '" y="' + (y + 2) + '" width="' + (SW - 12) + '" height="' + (H - 4) + '" rx="4" fill="' + (used && !isCur ? "#f3f3f3" : cc[0]) + '" stroke="' + (isCur ? C.red : used ? "#ccc" : cc[1]) + '" stroke-width="' + (isCur ? 3 : 1.5) + '"/>';
          extra += '<text x="' + (SX + 16) + '" y="' + (y + 18) + '" font-size="12.5" font-weight="700" fill="' + (used && !isCur ? "#aaa" : "#222") + '">' + esc(v) + '</text>';
          extra += '<text x="' + (SX + SW - 14) + '" y="' + (y + 18) + '" text-anchor="end" font-size="10.5" fill="' + C.muted + '">#' + (i + 1) + '</text>';
          if (isCur) extra += '<text x="' + (SX - 6) + '" y="' + (y + 18) + '" text-anchor="end" font-size="13" font-weight="700" fill="' + C.red + '">▶</text>';
        });
        if (order.length) extra += '<text x="' + (SX + SW + 6) + '" y="' + (BOT - order.length * H + 16) + '" font-size="10.5" fill="' + C.muted + '">top</text>';
        var y0 = 372;
        if (comps.length || comp) {
          var xx = 12, all = comps.slice(); if (comp && comps.indexOf(comp) < 0) all.push(comp);
          extra += '<text x="12" y="' + (y0 - 14) + '" font-size="12" font-weight="700" fill="' + C.pur + '">comps (2차 DFS forest 의 tree):</text>';
          all.forEach(function (s, i) {
            var cc = SCC_C[i % SCC_C.length], txt = "[" + s.join(", ") + "]", w = txt.length * 7.4 + 12;
            extra += '<rect x="' + xx + '" y="' + (y0 - 6) + '" width="' + r1(w) + '" height="20" rx="4" fill="' + cc[0] + '" stroke="' + cc[1] + '"' + (s === comp ? ' stroke-dasharray="4 3"' : "") + '/>' +
              '<text x="' + (xx + 6) + '" y="' + (y0 + 8) + '" font-size="12" font-weight="700" fill="#222">' + esc(txt) + '</text>';
            xx += w + 8;
          });
        }
        if (msg) extra += '<text x="750" y="' + (y0 + 34) + '" font-size="12.5" text-anchor="end" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        return graphSvg("ks", { w: 760, h: 415, pos: gr.pos, label: label, edges: es, node: node, tag: tag, extra: extra });
      }
      function gtStr() {
        if (!GT) return "-";
        return IDS.map(function (v) { return v + ":[" + GT[v].join(",") + "]"; }).join(" ");
      }
      function snap(desc, pc, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { K: pc },
          vars: { phase: phase, u: cu, v: cv, call: stack.slice(), visited: IDS.filter(function (x) { return visited[x]; }),
            order: order.slice(), GT: gtStr(), comp: comp ? comp.slice() : "-",
            comps: comps.length ? comps.map(function (s) { return "[" + s.join(",") + "]"; }) : "-" },
          note: note, svg: draw(msg, msgColor)
        });
      }

      // ---------- 1차 DFS ----------
      snap("시작. `visited` 는 비었고 `order` 스택도 비었다. 1차 DFS 는 '''시작점 아무거나'''이며, 여기서는 `for u in G` 가 알파벳 순으로 돈다.", 2);
      function dfs1(u) {
        stack.push(u); cu = u; cv = "-"; hot = null;
        visited[u] = true;
        snap("`dfs1(" + u + ")`: " + u + " 를 visited 에 넣는다 (주황 = 아직 안 끝남).", 4);
        G[u].forEach(function (v) {
          cu = u; cv = v; hot = [u, v];
          if (!visited[v]) {
            treeEdge[u + ">" + v] = 1;
            snap(u + " → " + v + ": " + v + " 는 처음 본다 → `dfs1(" + v + ")` 로 내려간다.", 7);
            dfs1(v);
            cu = u; cv = v; hot = [u, v];
          } else {
            snap(u + " → " + v + ": " + v + " 는 이미 visited → 건너뛴다.", 6);
          }
        });
        cu = u; cv = "-"; hot = null;
        order.push(u);
        snap("'''" + u + " 의 이웃을 다 봤다 → finish.''' `order.append(" + u + ")` → 스택 #" + order.length + " 에 쌓인다." +
          (order.length === 1 ? " 처음 finish 하는 정점은 더 갈 데가 없는 곳(가장 아래쪽 SCC)에 있다." : ""), 8);
        stack.pop();
      }
      IDS.forEach(function (s) {
        cu = s; cv = "-"; hot = null;
        if (visited[s]) return;
        snap("`for u in G`: " + s + " 는 아직 unvisited → 여기서 새 DFS tree 를 연다.", 11);
        dfs1(s);
      });
      cu = "-";
      snap("1차 DFS 끝. 스택(아래→위) = [" + order.join(", ") + "]. '''맨 위 " + order[order.length - 1] + "''' 가 finish 가 가장 크다. 이 정점이 든 SCC 는 원래 그래프에서 다른 SCC 로 나가기만 하는 source SCC 다([[SCC finish time 보조정리]]).", 9);

      // ---------- G^T ----------
      phase = "간선 뒤집기 (G → G^T)";
      GT = {}; IDS.forEach(function (v) { GT[v] = []; });
      snap("`GT = {u: [] for u in G}` — 빈 인접 리스트를 만든다.", 12);
      IDS.forEach(function (u) {
        if (!G[u].length) { gtDone[u] = 1; return; }
        G[u].forEach(function (v) { GT[v].push(u); });
        gtDone[u] = 1;
        snap(u + " 의 간선 " + G[u].map(function (v) { return u + "→" + v; }).join(", ") + " 를 뒤집어 " + G[u].map(function (v) { return v + "→" + u; }).join(", ") + " (`GT[v].append(u)`). 파란 점선 = 뒤집힌 간선.", 15);
      });
      snap("[[G^T]] 완성: " + gtStr() + ". 같은 SCC 안은 뒤집어도 여전히 서로 오갈 수 있고, SCC 사이 간선만 방향이 바뀐다.", 15,
        mode === "onG" ? "버그 ① 실행: 지금 GT 를 만들었지만 2차 DFS 는 이것을 쓰지 않고 G 를 그대로 쓴다." : null);

      // ---------- 2차 DFS ----------
      pass2 = true; visited = {}; treeEdge = {}; stack = [];
      phase = mode === "onG" ? "2차 DFS — ✗ 원래 G 에서" : "2차 DFS (G^T)";
      cu = "-"; cv = "-"; hot = null;
      snap("`visited, comps = set(), []` — visited 를 비우고 2차를 시작한다." +
        (mode === "asc" ? " ✗ 버그 ②: `for u in order` 라서 스택 '''아래'''(finish 가 가장 작은 것)부터 꺼낸다." : " 스택 '''맨 위'''부터 꺼낸다 = `reversed(order)` = finish 내림차순."), 16);
      function dfs2(u, k) {
        stack.push(u); cu = u; cv = "-"; hot = null;
        visited[u] = true; comp.push(u); compOf[u] = k;
        snap("`dfs2(" + u + ")`: " + u + " 를 지금 comp 에 넣는다 → comp = [" + comp.join(", ") + "].", 18);
        adj2(u).forEach(function (v) {
          cu = u; cv = v; hot = [u, v];
          if (!visited[v]) {
            treeEdge[u + ">" + v] = 1;
            snap((mode === "onG" ? "G" : "G^T") + " 간선 " + u + " → " + v + (mode === "onG" ? "" : " (원래 " + v + " → " + u + ")") + ": " + v + " 는 unvisited → 내려간다." +
              (compOf[v] === undefined && mode !== "ok" && order.indexOf(v) >= 0 ? "" : ""), 21);
            dfs2(v, k);
            cu = u; cv = v; hot = [u, v];
          } else {
            var mine = compOf[v] === k;
            snap((mode === "onG" ? "G" : "G^T") + " 간선 " + u + " → " + v + ": " + v + " 는 이미 " + (mine ? "이 comp 에 있다" : "'''앞에서 찾은 comp 에 속한다'''") + " → 건너뛴다." +
              (!mine && mode === "ok" ? " 이렇게 이미 끝난 SCC 로는 새어 나가지 못해서 tree 가 SCC 하나에서 멈춘다." : ""), 20);
          }
        });
        cu = u; cv = "-"; hot = null;
        stack.pop();
      }
      var seq = mode === "asc" ? order.map(function (v, i) { return i; }) : order.map(function (v, i) { return order.length - 1 - i; });
      var k = 0;
      seq.forEach(function (i) {
        var s = order[i]; popIdx = i; cu = s; cv = "-"; hot = null;
        if (visited[s]) {
          snap("스택에서 " + s + " (#" + (i + 1) + ") 를 꺼냈지만 이미 visited → 건너뛴다.", 23);
          return;
        }
        comp = [];
        snap("스택에서 '''" + s + "''' (#" + (i + 1) + ") 를 꺼냈다. unvisited → `comp = []` 로 새 tree 를 연다.", 24);
        dfs2(s, k);
        comps.push(comp);
        cu = s;
        snap("`comps.append(comp)`: '''[" + comp.join(", ") + "]''' 완성 — " + (mode === "ok" ? "SCC 하나다." : "이 tree 가 SCC 라고 내놓는다."), 26, null,
          "tree #" + (k + 1) + " = [" + comp.join(", ") + "]", SCC_C[k % SCC_C.length][1]);
        k += 1; comp = null;
      });
      popIdx = -1; cu = "-"; phase = "완료";
      var okNote = null, msg = "SCC " + comps.length + "개", mc = C.green;
      // 정답 SCC (서로 도달 가능) 와 비교 — 버그 모드가 우연히 맞는 경우를 가려낸다
      function reach(x) { var seen = {}, st2 = [x]; seen[x] = 1; while (st2.length) { var y = st2.pop(); G[y].forEach(function (z) { if (!seen[z]) { seen[z] = 1; st2.push(z); } }); } return seen; }
      var R = {}; IDS.forEach(function (x) { R[x] = reach(x); });
      var right = IDS.every(function (x) { return IDS.every(function (y) { return !!(R[x][y] && R[y][x]) === (compOf[x] === compOf[y]); }); });
      if (mode !== "ok" && right) {
        msg = "이번엔 우연히 맞음"; mc = C.or;
        okNote = "버그가 있는 코드인데 이 그래프에서는 우연히 SCC 가 맞게 나왔다. 버그는 늘 틀리는 게 아니라 '''틀릴 수 있는''' 것이다. 그래프를 CLRS 그림으로 바꾸면 한 덩어리로 뭉개진다.";
      } else if (mode !== "ok") {
        msg = "✗ 틀림: tree " + comps.length + "개"; mc = C.red;
        okNote = mode === "onG"
          ? "버그 ①: 원래 G 에서는 finish 최대 정점이 '''source''' SCC 에 있다. source 에서 출발하면 나가는 간선을 따라 아래 SCC 들까지 전부 도달하므로 tree 하나가 여러 SCC 를 삼킨다. 그래서 반드시 간선을 뒤집은 G^T 에서 돌려야 한다."
          : "버그 ②: finish 가 가장 작은 정점은 G^T 에서 '''source''' 쪽 SCC 에 있다. 거기서 출발하면 G^T 의 간선을 따라 다른 SCC 로 흘러 들어가 한 tree 로 뭉친다. 반드시 finish 내림차순(스택 맨 위부터)이어야 한다.";
      }
      snap("`return comps` → " + comps.map(function (s) { return "[" + s.join(", ") + "]"; }).join(", ") + "." +
        (mode === "ok" ? " 1차 DFS, GT 만들기, 2차 DFS 모두 [[O(n+m)]] 이므로 전체도 O(n+m) 이다." : ""), 27, okNote, msg, mc);

      return {
        panels: [{ id: "K", title: "scc(G) — SCC 알고리즘 문서의 코드", lang: "c", lines: codeLines(mode) }],
        vars: [
          { name: "phase", label: "단계", group: "단계" },
          { name: "u", group: "현재" },
          { name: "v", label: "v (이웃)", group: "현재" },
          { name: "call", label: "호출 스택", group: "현재" },
          { name: "visited", group: "상태" },
          { name: "order", label: "order (스택, 아래→위)", group: "상태" },
          { name: "GT", label: "GT 인접 리스트", group: "상태" },
          { name: "comp", label: "지금 comp", group: "2차 DFS" },
          { name: "comps", group: "2차 DFS" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
