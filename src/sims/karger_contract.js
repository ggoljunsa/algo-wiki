// karger_contract — L16 p.20–35 (운 좋은 실행), p.41–43 (min cut 간선을 고른 실행). 검산: _check_L16_L17.py
//   슬라이드 순서: a–b, e–h, c–d, {a,b}–{c,d}, {e,h}–g, {e,h,g}–f → {a,b,c,d} | {e,f,g,h}, cut 2 (min)
//   unlucky: b–e, a–c, f–g, f–h, c–d, a–b → {a,b,c,d,e} | {f,g,h}, cut 3
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



  // 그래프: L16 p.20 (8 정점 14 간선). 위치는 슬라이드 배치를 줄인 것.
  var V = ["a", "b", "c", "d", "e", "f", "g", "h"];
  var POS = { a: { x: 110, y: 90 }, b: { x: 275, y: 68 }, c: { x: 50, y: 225 }, d: { x: 262, y: 250 },
    e: { x: 395, y: 172 }, f: { x: 435, y: 45 }, g: { x: 610, y: 88 }, h: { x: 585, y: 282 } };
  var E = [["a", "b"], ["a", "c"], ["a", "d"], ["b", "c"], ["b", "d"], ["b", "e"], ["c", "d"], ["d", "e"],
    ["e", "f"], ["e", "g"], ["e", "h"], ["f", "g"], ["f", "h"], ["g", "h"]];
  // 슬라이드 순서(p.21–34): a–b → e–h → c–d → {a,b}–{c,d} → {e,h}–g → {e,h,g}–f
  var SEQ = {
    slide: [["a", "b"], ["e", "h"], ["c", "d"], ["b", "d"], ["e", "g"], ["f", "g"]],
    unlucky: [["b", "e"], ["a", "c"], ["f", "g"], ["f", "h"], ["c", "d"], ["a", "b"]]
  };
  var CODE = [
    "Karger( G=(V,E) ):",
    "  Γ = { SuperNode(v) : v in V }      // one supernode for each vertex",
    "  E_{u,v} = {(u,v)} for (u,v) in E   // one superedge for each edge",
    "  F = copy of E                      // we'll choose randomly from F",
    "  while |Γ| > 2:",
    "    (u,v) ← uniformly random edge in F",
    "    merge( u, v )                    // merge the two SuperNodes",
    "    F ← F \\ E_{ū,v̄}                 // remove the edges inside the new SuperNode",
    "  return the cut given by the remaining two SuperNodes"
  ];
  var PAL = [["#dbe8f7", "#1d65b3"], ["#fdeec2", "#c77d1a"], ["#efe9f6", "#6b4fa0"], ["#fbe3e7", "#c23a52"],
    ["#e0f4f1", "#1f8a7a"], ["#f3f0d8", "#8a7d1a"], ["#e8e8e8", "#555"], ["#fde4d4", "#b5541c"]];

  global.SIMS["karger_contract"] = {
    title: "Karger — 간선을 골라 super node 로 합치기 (L16 p.20–43)",
    desc: "L16 p.20–35 의 예제. [[Karger's algorithm]] 은 남은 간선 중 하나를 무작위로 골라 두 끝을 한 super node 로 합치고(contract), super node 가 둘 남으면 멈춘다. " +
      "같은 색 정점 = 같은 super node. 점선 회색 간선은 super node 안으로 들어가 사라진 간선(F 에서 빠짐). 무작위 대신 '''슬라이드가 고른 순서'''와 '''p.41 처럼 min cut 간선을 먼저 고른 순서''' 두 가지를 고정해 보여 준다.",
    options: [
      { key: "seq", label: "고르는 간선 순서", values: [
        { value: "slide", label: "슬라이드 순서 (운이 좋은 경우, p.21–34)" },
        { value: "unlucky", label: "처음에 b–e 를 고른 경우 (p.41–42)" }
      ] }
    ],
    build: function (opts) {
      var seq = SEQ[opts.seq] || SEQ.slide;
      var par = {}; V.forEach(function (v) { par[v] = v; });
      function find(x) { while (par[x] !== x) x = par[x]; return x; }
      function groups() {
        var m = {};
        V.forEach(function (v) { var r = find(v); (m[r] = m[r] || []).push(v); });
        return Object.keys(m).map(function (r) { return m[r]; }).sort(function (a, b) { return V.indexOf(a[0]) - V.indexOf(b[0]); });
      }
      function gstr() { return groups().map(function (g) { return "{" + g.join(",") + "}"; }).join(" "); }
      function alive() { return E.filter(function (e) { return find(e[0]) !== find(e[1]); }); }
      function superEdges() {
        var m = {};
        alive().forEach(function (e) {
          var a = find(e[0]), b = find(e[1]);
          var ga = groups().filter(function (g) { return g.indexOf(e[0]) >= 0; })[0].join(""), gb = groups().filter(function (g) { return g.indexOf(e[1]) >= 0; })[0].join("");
          var k = ga < gb ? ga + "–" + gb : gb + "–" + ga;
          m[k] = (m[k] || 0) + 1;
        });
        return Object.keys(m).map(function (k) { return k + "×" + m[k]; }).join(", ");
      }
      var steps = [], cur = null;
      function draw(msg, mc) {
        var node = {}, label = {};
        var gs = groups();
        V.forEach(function (v) {
          label[v] = v;
          var gi = 0; gs.forEach(function (g, i) { if (g.indexOf(v) >= 0) gi = i; });
          var single = gs[gi].length === 1, c = single ? ["#fff", "#777"] : PAL[V.indexOf(gs[gi][0]) % PAL.length];
          node[v] = { fill: c[0], stroke: c[1], sw: cur && (cur[0] === v || cur[1] === v) ? 4 : 2 };
        });
        var es = E.map(function (e) {
          var inside = find(e[0]) === find(e[1]);
          var isCur = cur && ((cur[0] === e[0] && cur[1] === e[1]) || (cur[0] === e[1] && cur[1] === e[0]));
          return { u: e[0], v: e[1], arrow: "none", color: isCur ? "#e07a10" : inside ? "#d0d0d0" : "#1d65b3", width: isCur ? 5 : 2, dash: inside && !isCur };
        });
        var s = '<text x="10" y="328" font-size="12.5" font-weight="700" fill="#3b2f4a">super node ' + groups().length + '개: ' + esc(gstr()) + '</text>';
        s += '<text x="10" y="348" font-size="12" fill="#3b2f4a">남은 간선 F: ' + alive().length + '개</text>';
        if (msg) s += '<text x="680" y="348" text-anchor="end" font-size="13" font-weight="700" fill="' + (mc || "#3b2f4a") + '">' + esc(msg) + '</text>';
        return graphSvg("kg", { w: 690, h: 358, pos: POS, label: label, edges: es, node: node, extra: s });
      }
      function snap(desc, line, note, msg, mc) {
        steps.push({ desc: desc, pc: { K: line },
          vars: { pick: cur ? cur[0] + "–" + cur[1] : "-", nodes: gstr(), count: groups().length, F: alive().length, se: superEdges() || "-" },
          note: note, svg: draw(msg, mc) });
      }
      snap("L16 p.20 의 그래프. 정점 8개, 간선 14개. global minimum cut 은 {a,b,c,d} | {e,f,g,h} 이고 건너는 간선은 b–e, d–e 두 개다.", 1);
      snap("정점마다 super node 하나, 간선마다 super edge 하나로 시작한다. 고를 후보 F 는 간선 14개 전부다.", 4);
      var minCutEdges = { "b–e": 1, "d–e": 1 };
      seq.forEach(function (p, i) {
        cur = p;
        var crossing = minCutEdges[p[0] + "–" + p[1]];
        snap("`(u,v) ← uniformly random edge in F` — 이번에 뽑힌 간선은 '''" + p[0] + "–" + p[1] + "'''. (F 에 " + alive().length + "개 중 하나, 확률 1/" + alive().length + ")", 6,
          crossing ? "이 간선은 minimum cut 을 건너는 간선이다. 이걸 합치면 b 와 e 가 한 super node 가 되어, 그 둘을 가르는 cut 은 더 이상 돌려줄 수 없다(p.42)." : null,
          crossing ? "min cut 간선!" : null, "#d6465f");
        var before = alive().length;
        par[find(p[1])] = find(p[0]);
        var removed = before - alive().length;
        snap("`merge(u, v)` 와 `F ← F \\ E` — 두 super node 를 합치고, 그 사이에 있던 간선 " + removed + "개를 F 에서 지운다. 다른 super node 로 가던 간선은 새 super node 에 그대로 붙는다(super edge).", 8,
          i === 3 && opts.seq !== "unlucky" ? "{a,b} 와 {c,d} 사이에는 간선이 a–c, a–d, b–c, b–d 네 개라 super edge 의 굵기가 4 다. 어느 것을 뽑아도 결과는 같다." : null);
        cur = null;
      });
      var cut = alive().length;
      snap("`while |Γ| > 2` 가 끝났다. 반복은 n − 2 = 6 번. 남은 두 super node " + gstr() + " 가 cut 이고, 건너는 간선은 " + cut + "개다.", 9,
        cut === 2 ? "운 좋게 minimum cut(크기 2)을 찾았다(p.34–35). 같은 그래프로 10,000 번 돌리면 이렇게 맞는 경우는 약 20% 다(p.44)." :
          "처음에 min cut 간선 b–e 를 골랐기 때문에 크기 2 짜리 cut 은 나올 수 없었다. 이번 실행은 크기 " + cut + " 인 cut 을 돌려준다(틀린 답). 그래서 여러 번 돌려 가장 작은 것을 고른다(p.51).",
        cut === 2 ? "cut = 2 (min cut)" : "cut = " + cut + " (틀림)", cut === 2 ? "#2e9e4f" : "#d6465f");
      return {
        panels: [{ id: "K", title: "Karger (L16 p.37)", lang: "txt", lines: CODE }],
        vars: [
          { name: "pick", label: "뽑은 간선", group: "이번 단계" },
          { name: "nodes", label: "super node 들", group: "상태" },
          { name: "count", label: "|Γ|", group: "상태" },
          { name: "F", label: "|F| (남은 간선)", group: "상태" },
          { name: "se", label: "super edge (간선 수)", group: "상태" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
