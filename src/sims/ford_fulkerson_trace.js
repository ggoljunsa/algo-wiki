// ford_fulkerson_trace — L17 p.43–53. 검산: _check_L16_L17.py (max flow 11, min cut {s,B,C,F} 4+3+4)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

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



  // 그래프: L17 p.43 의 예제(간선 11개). 정점 이름 A–F 는 이 위키가 붙였다(슬라이드에는 이름이 없다).
  //   A = 위 왼쪽, B = 가운데 왼쪽, C = 아래 왼쪽, D = 위 오른쪽, E = 가운데 오른쪽, F = 아래 오른쪽.
  // 경로 순서는 슬라이드(p.44, 46, 48, 50)가 칠한 순서. 검산은 _check_L16_L17.py.
  //   s→A→E→t (4) · s→C→F→t (4) · s→B→E⇢A→D→t (2, E→A 는 backward) · s→C→F→B→E⇢A→D→t (1) → max flow 11
  //   마지막 Gf 에서 s 가 닿는 정점 {s,B,C,F} → cut 간선 s→A 4, B→E 3, F→t 4 = 11 (p.53)
  var POS = { s: { x: 40, y: 150 }, A: { x: 190, y: 55 }, B: { x: 190, y: 150 }, C: { x: 190, y: 245 },
    D: { x: 400, y: 55 }, E: { x: 400, y: 150 }, F: { x: 400, y: 245 }, t: { x: 550, y: 150 } };
  var EDGES = [["s", "A", 4], ["s", "B", 2], ["s", "C", 6], ["A", "D", 3], ["A", "E", 6], ["B", "E", 3],
    ["F", "B", 3], ["C", "F", 10], ["D", "t", 4], ["E", "t", 4], ["F", "t", 4]];
  var PATHS = [["s", "A", "E", "t"], ["s", "C", "F", "t"], ["s", "B", "E", "A", "D", "t"], ["s", "C", "F", "B", "E", "A", "D", "t"]];
  var SLIDE = ["p.44–45", "p.46–47", "p.48–49", "p.50–51"];
  var CODE = [
    "Ford-Fulkerson(G):",
    "  f ← all zero flow",
    "  Gf ← G",
    "  while t is reachable from s in Gf:",
    "    Find a path P from s to t in Gf      // eg, use BFS",
    "    f ← increaseFlow(P, f)",
    "    update Gf",
    "  return f",
    "",
    "increaseFlow(path P in Gf, flow f):",
    "  x = min weight on any edge in P",
    "  for (u,v) in P:",
    "    if (u,v) in E: f'(u,v) ← f(u,v) + x",
    "    if (v,u) in E: f'(v,u) ← f(v,u) − x",
    "  return f'"
  ];

  global.SIMS["ford_fulkerson_trace"] = {
    title: "Ford-Fulkerson — augmenting path 로 flow 늘리기 (L17 p.43–53)",
    desc: "L17 p.43–53 의 예제. 위 그림은 원래 그래프 G 에 '''flow/capacity''' 를 적은 것, 아래 그림은 [[residual graph]] Gf 다. " +
      "Gf 의 파란 간선은 아직 더 보낼 수 있는 양(forward), 초록 간선은 이미 보낸 양이라 되돌릴 수 있는 양(backward)이다. s 에서 t 로 가는 경로가 Gf 에 있으면 그 길로 더 보낸다.",
    options: [],
    build: function () {
      var f = {}; EDGES.forEach(function (e) { f[e[0] + e[1]] = 0; });
      function capOf(u, v) { for (var i = 0; i < EDGES.length; i++) if (EDGES[i][0] === u && EDGES[i][1] === v) return EDGES[i][2]; return null; }
      function res(u, v) { var c = capOf(u, v); if (c !== null) return c - f[u + v]; c = capOf(v, u); if (c !== null) return f[v + u]; return 0; }
      function value() { return f.sA + f.sB + f.sC; }
      var steps = [], path = null, showCut = null;
      function onPath(u, v) { if (!path) return false; for (var i = 0; i + 1 < path.length; i++) if (path[i] === u && path[i + 1] === v) return true; return false; }
      function draw(msg, mc) {
        var pos = {}, label = {}, node = {}, es = [];
        Object.keys(POS).forEach(function (k) {
          pos[k] = POS[k]; pos[k + "_"] = { x: POS[k].x, y: POS[k].y + 315 };
          label[k] = k; label[k + "_"] = k;
          var cutSide = showCut && showCut.indexOf(k) >= 0;
          var st = k === "s" ? { fill: "#f6b26b", stroke: "#c77d1a" } : k === "t" ? { fill: "#5b8def", stroke: "#1d4fb3", tc: "#fff" } : { fill: "#e0f4f1", stroke: "#1f8a7a" };
          if (cutSide && k !== "s") st = { fill: "#2e9e4f", stroke: "#1d6b35", tc: "#fff" };
          node[k] = st; node[k + "_"] = st;
        });
        EDGES.forEach(function (e) {
          var u = e[0], v = e[1], fl = f[u + v], full = fl === e[2];
          var hl = onPath(u, v) || onPath(v, u);
          var cutE = showCut && showCut.indexOf(u) >= 0 && showCut.indexOf(v) < 0;
          es.push({ u: u, v: v, arrow: "end", w: fl + "/" + e[2], color: cutE ? "#d6465f" : hl ? "#e07a10" : full ? "#3b2f4a" : "#1d65b3", width: hl || cutE ? 4 : fl > 0 ? 3 : 1.6 });
          var fw = e[2] - fl, bw = fl;
          if (fw > 0) es.push({ u: u + "_", v: v + "_", arrow: "end", w: fw, off: bw > 0 ? -6 : 0, wside: -1, color: onPath(u, v) ? "#e07a10" : "#1d65b3", width: onPath(u, v) ? 4 : 1.8 });
          if (bw > 0) es.push({ u: v + "_", v: u + "_", arrow: "end", w: bw, off: fw > 0 ? -6 : 0, wside: -1, wc: "#2e7d32", color: onPath(v, u) ? "#e07a10" : "#43a047", width: onPath(v, u) ? 4 : 1.8 });
        });
        var s = '<text x="8" y="16" font-size="12.5" font-weight="700" fill="#3b2f4a">G: flow / capacity — flow 값 ' + value() + '</text>' +
          '<text x="8" y="300" font-size="12.5" font-weight="700" fill="#3b2f4a">Gf: 파랑 = 더 보낼 수 있는 양, 초록 = 되돌릴 수 있는 양</text>';
        if (msg) s += '<text x="590" y="610" text-anchor="end" font-size="13" font-weight="700" fill="' + (mc || "#3b2f4a") + '">' + esc(msg) + '</text>';
        return graphSvg("ff", { w: 600, h: 620, pos: pos, label: label, edges: es, node: node, extra: s });
      }
      function snap(desc, line, note, msg, mc, x) {
        steps.push({ desc: desc, pc: { F: line },
          vars: { path: path ? path.join("→") : "-", x: x === undefined ? "-" : x, value: value(),
            flows: EDGES.filter(function (e) { return f[e[0] + e[1]] > 0; }).map(function (e) { return e[0] + e[1] + ":" + f[e[0] + e[1]]; }).join(" ") || "모두 0" },
          note: note, svg: draw(msg, mc) });
      }
      snap("L17 p.43 의 그래프. 처음 flow 는 모두 0 이다(`f ← all zero flow`).", 2);
      snap("`Gf ← G` — flow 가 0 이니 residual graph 는 원래 그래프와 같다. 간선마다 capacity 만큼 보낼 수 있다.", 3);
      PATHS.forEach(function (P, i) {
        path = P;
        var back = [];
        for (var j = 0; j + 1 < P.length; j++) if (capOf(P[j], P[j + 1]) === null) back.push(P[j] + "→" + P[j + 1]);
        var x = Infinity; for (j = 0; j + 1 < P.length; j++) x = Math.min(x, res(P[j], P[j + 1]));
        snap("t 가 아직 s 에서 닿는다. " + SLIDE[i] + " 의 경로 '''" + P.join("→") + "''' 를 고른다." + (back.length ? " 이 경로는 backward 간선 " + back.join(", ") + " 을 지난다." : ""), 5,
          back.length ? "backward 간선을 지난다는 것은 그 간선의 원래 방향(" + back.map(function (b) { return b.split("→").reverse().join("→"); }).join(", ") + ")으로 보내던 flow 를 그만큼 '''줄인다'''는 뜻이다(p.48 \"We will remove flow from this edge\")." : null);
        snap("`x = min weight on any edge in P` — 경로 위 residual 값 중 가장 작은 것은 '''" + x + "'''. 이 경로로는 " + x + " 만큼 더 보낼 수 있다.", 11, null, null, null, x);
        for (j = 0; j + 1 < P.length; j++) {
          var u = P[j], v = P[j + 1];
          if (capOf(u, v) !== null) f[u + v] += x; else f[v + u] -= x;
        }
        snap("`increaseFlow` — forward 간선은 +" + x + ", backward 간선은 원래 간선에서 −" + x + ". flow 값이 '''" + value() + "''' 가 됐다. 정점마다 들어온 양 = 나간 양은 그대로 지켜진다.", back.length ? 14 : 13, null, "flow = " + value(), "#2e9e4f", x);
        path = null;
        snap("`update Gf` — 꽉 찬 간선은 forward 가 사라지고, flow 가 생긴 간선에는 backward 간선이 생긴다.", 7);
      });
      showCut = ["s", "B", "C", "F"];
      snap("이제 Gf 에서 s 가 닿는 정점은 {s, B, C, F} 뿐이고 t 에는 못 간다. 루프가 끝난다. max flow = '''" + value() + "'''.", 8,
        "닿는 정점 {s,B,C,F} 와 나머지로 나눈 cut 을 건너는 간선은 s→A 4, B→E 3, F→t 4 로 모두 꽉 차 있다. cut 의 cost 4+3+4 = 11 = flow 값. max-flow min-cut theorem 이 말하는 그대로다(p.53).",
        "max flow = min cut = 11", "#2e9e4f");
      return {
        panels: [{ id: "F", title: "Ford-Fulkerson (L17 p.35, p.41)", lang: "txt", lines: CODE }],
        vars: [
          { name: "path", label: "augmenting path P", group: "이번 단계" },
          { name: "x", label: "x (bottleneck)", group: "이번 단계" },
          { name: "value", label: "flow 값", group: "flow" },
          { name: "flows", label: "flow 가 있는 간선", group: "flow" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
