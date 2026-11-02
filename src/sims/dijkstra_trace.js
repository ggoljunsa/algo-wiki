// dijkstra_trace — L11 p.38 Dijkstra(G,s) 를 한 줄씩. d[v] 표, sure / not-sure, 매 반복 "가장 작은 not-sure 선택 → 이웃 갱신 → sure".
//
// 그래프는 L11 PNG 24–37 (인쇄 p.24–37) "Dijkstra by example" 그림 그대로 (무방향, 간선 6개):
//   Gates–R1 1, Gates–HG 25, R1–E3 1, R1–HG 22, E3–Park 4, Park–HG 20   (HG = Halmae Gomtang)
// 옵션 neg 는 슬라이드에 없는 '''직접 만든 변형''': p.81 음수 간선 그림의 모양에서 Gates→HG = +3, HG→R1 = −3 (유향),
//   나머지 Gates–R1 1, R1–E3 1, E3–Park 4, Park–HG 10 (양방향). negative cycle 은 없다(Gates→HG→R1→Gates = +1).
//   슬라이드 코드처럼 sure 인 이웃도 min 갱신한다(코드에 not-sure 조건이 없다).
//
// 기대 최종값 (src/sims/_check_final.py → _check_final.txt):
//  slide: sure 순서 Gates, R1, E3, Park, HG; d = Gates 0, R1 1, E3 2, Park 6, HG 23 (p.37 그림과 같음)
//         HG 는 25 → 23 (R1 경유)으로 한 번 줄어든다.
//  neg  : sure 순서 Gates, R1, E3, HG, Park; 끝난 d = Gates 0, R1 0, E3 2, Park 6, HG 3
//         진짜 거리(Bellman-Ford) = 0, 0, 1, 5, 3 → E3, Park 가 틀림 (R1 은 sure 가 된 '''뒤에''' 1 → 0 으로 바뀜 = Claim 2 붕괴)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "Dijkstra(G,s):",
    "  Set all vertices to not-sure",
    "  d[v] = ∞ for all v in V",
    "  d[s] = 0",
    "  While there are not-sure nodes:",
    "    Pick the not-sure node u with the smallest estimate d[u].",
    "    For v in u.neighbors:",
    "      d[v] ← min( d[v] , d[u] + edgeWeight(u,v) )",
    "    Mark u as sure.",
    "  Now d(s, v) = d[v]"
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


  var V = ["Gates", "R1", "E3", "Park", "HG"];
  var POS = { Gates: { x: 480, y: 60 }, E3: { x: 680, y: 115 }, R1: { x: 430, y: 195 }, Park: { x: 650, y: 255 }, HG: { x: 520, y: 330 } };
  function mk(bi, di) {
    var adj = {}, edges = [];
    V.forEach(function (v) { adj[v] = []; });
    bi.forEach(function (e) { adj[e[0]].push([e[1], e[2]]); adj[e[1]].push([e[0], e[2]]); edges.push({ u: e[0], v: e[1], w: e[2], both: true }); });
    di.forEach(function (e) { adj[e[0]].push([e[1], e[2]]); edges.push({ u: e[0], v: e[1], w: e[2], both: false }); });
    return { adj: adj, edges: edges };
  }
  var EX = {
    slide: { label: "슬라이드 그래프 (L11 p.24–37)", g: mk([["Gates", "R1", 1], ["Gates", "HG", 25], ["R1", "E3", 1], ["R1", "HG", 22], ["E3", "Park", 4], ["Park", "HG", 20]], []), directed: false, truth: null },
    neg: { label: "함정: 음수 간선 변형 (직접 만든 예)", g: mk([["Gates", "R1", 1], ["R1", "E3", 1], ["E3", "Park", 4], ["Park", "HG", 10]], [["Gates", "HG", 3], ["HG", "R1", -3]]), directed: true,
      truth: { Gates: 0, R1: 0, E3: 1, Park: 5, HG: 3 } }
  };

  global.SIMS["dijkstra_trace"] = {
    title: "Dijkstra — d[v] 표와 sure / not-sure (L11 p.24–38)",
    desc: "L11 p.24–38. [[Dijkstra]] 는 매번 '''not-sure 중 d[u] 가 가장 작은 u''' 를 골라 이웃을 [[relaxation|갱신]]하고 u 를 sure 로 만든다. " +
      "d[v] 는 진짜 거리 [[d(s,v)]] 의 '''over-estimate''' 이고, sure 가 되는 순간 둘이 같아진다(Claim 2). 그래프는 슬라이드 Gates/R1/E3/Park/Halmae Gomtang 그림 그대로. " +
      "'''함정''' 옵션은 직접 만든 [[음수 간선 가중치|음수 간선]] 변형으로, 이미 sure 인 정점의 값이 나중에 바뀌어 답이 틀리는 것을 보여 준다 → [[Bellman-Ford]] 가 필요한 이유.",
    options: [
      { key: "ex", label: "그래프", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.slide, adj = ex.g.adj;
      var d = {}, sure = {}, parent = {}, order = [], steps = [];
      var cu = "-", cv = "-", hot = null, cand = "-", changed = null;
      V.forEach(function (v) { d[v] = null; sure[v] = false; });

      function f(x) { return x === null ? "∞" : x === Infinity ? "∞" : String(x); }
      function dStr() { return V.map(function (v) { return v + ":" + (d[v] === null ? "-" : f(d[v])); }).join(" "); }
      function draw(msg, msgColor) {
        var node = {}, tag = {}, label = {};
        V.forEach(function (v) {
          label[v] = v;
          node[v] = v === cu ? { fill: C.orL, stroke: C.or, sw: 4 } : sure[v] ? { fill: C.greenL, stroke: C.green, sw: 2.5 } : { fill: "#fff", stroke: C.muted };
          if (d[v] !== null) tag[v] = { t: "d=" + f(d[v]), c: sure[v] ? C.green : v === changed ? C.red : C.pur, up: v === "Gates" || v === "E3" };
        });
        var es = ex.g.edges.map(function (e) {
          var isHot = hot && ((hot[0] === e.u && hot[1] === e.v) || (e.both && hot[0] === e.v && hot[1] === e.u));
          var tree = parent[e.v] === e.u || (e.both && parent[e.u] === e.v);
          return { u: e.u, v: e.v, w: e.w, arrow: e.both ? (ex.directed ? "both" : "none") : "end", color: isHot ? C.or : tree ? C.green : C.edge, width: isHot || tree ? 4 : 2, wc: e.w < 0 ? C.red : C.pur };
        });
        // 왼쪽 d 표
        var x0 = 12, y0 = 52, cw = [70, 62, 92, 70], s = "";
        var heads = ["v", "d[v]", "상태", "parent"];
        var xx = x0;
        heads.forEach(function (h, i) { s += '<text x="' + (xx + cw[i] / 2) + '" y="' + (y0 - 8) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + C.pur + '">' + h + '</text>'; xx += cw[i]; });
        V.forEach(function (v, r) {
          var y = y0 + r * 30, xx2 = x0;
          var fill = v === cu ? C.orL : sure[v] ? C.greenL : "#fff", stroke = v === cu ? C.or : sure[v] ? C.green : "#bbb";
          var cells = [v, d[v] === null ? "-" : f(d[v]), sure[v] ? "sure" : "not-sure", parent[v] || "-"];
          cells.forEach(function (c, i) {
            var hl = i === 1 && v === changed;
            s += '<rect x="' + xx2 + '" y="' + y + '" width="' + cw[i] + '" height="26" fill="' + (hl ? "#fff3a8" : fill) + '" stroke="' + stroke + '"/>' +
              '<text x="' + (xx2 + cw[i] / 2) + '" y="' + (y + 18) + '" text-anchor="middle" font-size="' + (i === 1 ? 14 : 12) + '" font-weight="' + (i < 2 ? 700 : 400) + '" fill="' + (i === 2 && sure[v] ? C.green : "#222") + '">' + esc(c) + '</text>';
            xx2 += cw[i];
          });
        });
        if (ex.truth) {
          s += '<text x="' + x0 + '" y="' + (y0 + 5 * 30 + 20) + '" font-size="12" fill="' + C.red + '">진짜 거리(Bellman-Ford): ' + V.map(function (v) { return v + " " + ex.truth[v]; }).join(", ") + '</text>';
        }
        s += '<text x="12" y="22" font-size="12.5" font-weight="700" fill="' + C.pur + '">sure 순서: ' + (order.length ? esc(order.join(" → ")) : "(아직 없음)") + '</text>';
        s += legend(12, 300, [["#fff", C.muted, "not-sure"], [C.greenL, C.green, "sure"], [C.orL, C.or, "current node u"]]);
        if (msg) s += '<text x="748" y="368" font-size="13" text-anchor="end" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        return graphSvg("dij", { w: 760, h: 378, pos: POS, label: label, edges: es, node: node, tag: tag, extra: s });
      }
      function snap(desc, line, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { D: line },
          vars: { u: cu, v: cv, cand: cand, d: dStr(), sure: V.filter(function (v) { return sure[v]; }), not_sure: V.filter(function (v) { return !sure[v]; }),
            parent: V.filter(function (v) { return parent[v]; }).map(function (v) { return v + "←" + parent[v]; }).join(", ") || "-" },
          note: note, svg: draw(msg, msgColor)
        });
      }

      snap("`Set all vertices to not-sure` — 시작점 s = Gates. 아직 아무것도 확실하지 않다.", 2);
      V.forEach(function (v) { d[v] = Infinity; });
      snap("`d[v] = ∞` — 모든 추정치를 ∞ 로(아직 길을 모름 = 가장 비관적인 over-estimate).", 3);
      d.Gates = 0; changed = "Gates";
      snap("`d[s] = 0` → d[Gates] = 0.", 4);
      changed = null;

      while (V.some(function (v) { return !sure[v]; })) {
        cv = "-"; hot = null; cand = "-"; changed = null;
        var u = null;
        V.forEach(function (v) { if (!sure[v] && (u === null || d[v] < d[u])) u = v; });
        cu = u;
        var ns = V.filter(function (v) { return !sure[v]; });
        snap("`Pick the not-sure node u with the smallest estimate` — not-sure " + ns.map(function (v) { return v + "(" + f(d[v]) + ")"; }).join(", ") + " 중 최소 → '''u = " + u + "''' (d = " + f(d[u]) + ").", 6);
        adj[u].forEach(function (p) {
          var v = p[0], w = p[1];
          cv = v; hot = [u, v];
          var nd = d[u] + w;
          cand = f(d[u]) + " + " + w + " = " + f(nd);
          if (nd < d[v]) {
            var old = d[v];
            d[v] = nd; parent[v] = u; changed = v;
            snap("v = " + v + ": `min(d[" + v + "], d[" + u + "] + " + w + ")` = min(" + f(old) + ", " + f(nd) + ") = '''" + f(nd) + "''' → 줄었다! parent(" + v + ") = " + u + "." +
              (sure[v] ? " (그런데 " + v + " 는 '''이미 sure''' 였다!)" : ""), 8,
              sure[v] ? "sure 로 확정한 값이 나중에 바뀌었다 = \"sure 가 되는 순간 d[u] = d(s,u)\" (Claim 2) 가 깨졌다. 음수 간선 HG→R1 = −3 때문. " + v + " 를 거쳐 이미 확정된 정점들(E3, Park …)은 다시 고쳐지지 않는다." : null,
              sure[v] ? v + " 가 sure 인데 값이 바뀜!" : null, C.red);
          } else {
            changed = null;
            snap("v = " + v + ": `min(d[" + v + "], d[" + u + "] + " + w + ")` = min(" + f(d[v]) + ", " + f(nd) + ") = " + f(d[v]) + " → 그대로.", 8);
          }
        });
        cv = "-"; hot = null; cand = "-"; changed = null;
        sure[u] = true; order.push(u);
        snap("`Mark u as sure` — '''" + u + "''' 확정 (d = " + f(d[u]) + "). 줄과 중력 비유로는 " + u + " 가 땅에서 떨어진 순간.", 9);
        cu = "-";
      }
      cu = "-";
      if (ex.truth) {
        var wrong = V.filter(function (v) { return d[v] !== ex.truth[v]; });
        snap("`Now d(s, v) = d[v]` 라고 주장하지만 — 결과 " + dStr() + " vs 진짜 거리 " + V.map(function (v) { return v + ":" + ex.truth[v]; }).join(" ") + ". '''" + wrong.join(", ") + "''' 가 틀렸다.", 10,
          "Dijkstra 는 음수 간선이 있으면 쓸 수 없다(L11 p.62 Drawbacks: needs non-negative edge weights). 음수 간선은 [[Bellman-Ford]] 로 — bellman_ford_table sim 의 같은 그래프에서 0, 0, 1, 5, 3 이 나온다.",
          "틀린 답: " + wrong.join(", "), C.red);
      } else {
        snap("`Now d(s, v) = d[v]` — 결과 " + dStr() + " (p.37 그림과 같다). 초록 간선 = 최단경로 트리(Gates–R1–E3–Park, R1–HG). Gates→Park 최단경로 Gates–R1–E3–Park, 비용 6.", 10,
          "수행 시간은 \"not-sure 중 최소 찾기\" 자료구조에 달렸다: 배열 O(n²), red-black tree O((n+m) log n), Fibonacci heap O(n log n + m) — [[Dijkstra 수행 시간]].",
          "d = 0, 1, 2, 6, 23", C.green);
      }

      return {
        panels: [{ id: "D", title: "Dijkstra(G,s) (L11 p.38)", lang: "txt", lines: CODE }],
        vars: [
          { name: "u", label: "u (current node)", group: "현재" },
          { name: "v", label: "v (이웃)", group: "현재" },
          { name: "cand", label: "d[u] + w(u,v)", group: "현재" },
          { name: "d", label: "d[v]", group: "추정치" },
          { name: "sure", label: "sure", group: "상태" },
          { name: "not_sure", label: "not-sure", group: "상태" },
          { name: "parent", label: "parent (최단경로 트리)", group: "상태" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
