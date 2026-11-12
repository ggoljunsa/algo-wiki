// prim_trace — L15 p.49–65 "Efficient implementation" 을 한 단계씩. 정점마다 key k[x] 와 parent p[x],
//   unreached / active / reached 세 상태, 매 반복 "가장 작은 key 의 unreached 정점 활성화 → 이웃 k 갱신 → reached, (p[u],u) 를 MST 에".
//
// 그래프는 L15 p.4 그림 그대로 (무방향 9정점 14간선, CONTRACT §11.1):
//   A–B 4, A–H 8, B–C 8, B–H 11, C–D 7, C–I 2, C–F 4, D–E 9, D–F 14, E–F 10, H–I 7, I–G 6, H–G 1, G–F 2.  시작 s = A (p.50 의 새).
// 동점: B 를 넣은 뒤 C(8, B 에서) 와 H(8, A 에서) 가 같다 → 슬라이드(p.29, p.55–56)는 C. 여기서는 "key 같으면 이름 알파벳순" 으로 같은 결과.
// 갱신은 unreached 이웃만 한다(CLRS 23.2 와 같음). 슬라이드 코드 그대로 reached 이웃까지 min 하면
//   H 를 활성화할 때 이미 reached 인 G 의 key 가 2 → 1, p[G] 가 F → H 로 바뀌어 트리 기록이 깨진다(MST 에는 이미 F–G 를 넣었다).
//
// 기대 최종값 (src/sims/_check_L15.py → _check_L15.txt):
//   reached 순서 A B C I F G H D E
//   MST 에 들어가는 순서: A–B 4, B–C 8, C–I 2, C–F 4, F–G 2, G–H 1, C–D 7, D–E 9 → cost 37 (p.8 그림과 같음)
//   최종 k: A0 B4 C8 D7 E9 F4 G2 H1 I2, 최종 p: B←A, C←B, D←C, E←D, F←C, G←F, H←G, I←C
//   key 가 두 번 이상 줄어드는 정점: H (8 → 7 → 1), G (6 → 2), E (10 → 9)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "Prim(G,s):",
    "  Set all vertices to unreached",
    "  k[v] = ∞ for all v in V",
    "  k[s] = 0",
    "  While there are unreached nodes:",
    "    Pick the unreached vertex u with the smallest key.   (activate u)",
    "    For v in u.neighbors:          (unreached v 만)",
    "      k[v] = min( k[v], weight(u,v) )",
    "      if k[v] updated, p[v] = u",
    "    Mark u as reached, and add (p[u],u) to MST."
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
  var EDGES = [["A", "B", 4], ["A", "H", 8], ["B", "C", 8], ["B", "H", 11], ["C", "D", 7], ["C", "I", 2], ["C", "F", 4],
    ["D", "E", 9], ["D", "F", 14], ["E", "F", 10], ["H", "I", 7], ["I", "G", 6], ["H", "G", 1], ["G", "F", 2]];
  var ADJ = {};
  V.forEach(function (v) { ADJ[v] = []; });
  EDGES.forEach(function (e) { ADJ[e[0]].push([e[1], e[2]]); ADJ[e[1]].push([e[0], e[2]]); });
  V.forEach(function (v) { ADJ[v].sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }); });

  global.SIMS["prim_trace"] = {
    title: "Prim — key k[x] 와 parent p[x] 표 (L15 p.49–65)",
    desc: "L15 p.49–65. [[Prim's algorithm]] 은 A 에서 tree 를 하나 키운다. 정점마다 [[k(v)와 p(v) (Prim)|key k[x]]](자라는 tree 까지 간선 하나로 가는 가장 싼 비용)와 " +
      "parent p[x](그 비용이 어느 정점에서 왔는지)를 들고 있다. 매번 '''unreached 중 key 가 가장 작은 정점'''을 활성화하고, 이웃의 key 를 `min(k[v], weight(u,v))` 로 줄인 뒤 " +
      "(p[u], u) 간선을 MST 에 넣는다. [[Dijkstra]] 와 코드가 거의 같다. 다른 점은 갱신 식에 d[u] 를 더하지 않는다는 것이다 → [[Dijkstra vs Prim]].",
    options: [],
    build: function () {
      var k = {}, p = {}, state = {}, mst = [], order = [], steps = [];
      var cu = "-", cv = "-", hot = null, changed = null, cmp = "-";
      V.forEach(function (v) { k[v] = null; p[v] = null; state[v] = "unreached"; });
      function f(x) { return x === null || x === Infinity ? "∞" : String(x); }
      function kStr() { return V.map(function (v) { return v + ":" + (k[v] === null ? "-" : f(k[v])); }).join(" "); }
      function cost() { return mst.reduce(function (a, e) { return a + e[2]; }, 0); }
      function inMst(a, b) { return mst.some(function (e) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); }); }
      function draw(msg, msgColor) {
        var node = {}, tag = {}, label = {};
        V.forEach(function (v) {
          label[v] = v;
          node[v] = v === cu ? { fill: C.orL, stroke: C.or, sw: 4 } : state[v] === "reached" ? { fill: C.green, stroke: C.green, sw: 2, tc: "#fff" } : { fill: "#fff", stroke: C.muted };
          if (k[v] !== null) tag[v] = { t: "k=" + f(k[v]), c: state[v] === "reached" ? C.green : v === changed ? C.red : C.pur, up: POS[v].y < 150 };
        });
        var es = EDGES.map(function (e) {
          var isHot = hot && ((hot[0] === e[0] && hot[1] === e[1]) || (hot[0] === e[1] && hot[1] === e[0]));
          var t = inMst(e[0], e[1]);
          var cand = !t && ((p[e[1]] === e[0] && state[e[1]] !== "reached") || (p[e[0]] === e[1] && state[e[0]] !== "reached"));
          return { u: e[0], v: e[1], w: e[2], arrow: "none", color: isHot ? C.or : t ? C.green : C.edge, width: isHot || t ? 5 : 2, dash: cand };
        });
        var x0 = 10, y0 = 52, cw = [36, 50, 46, 92], s = "", xx = x0;
        ["v", "k[v]", "p[v]", "상태"].forEach(function (h, i) { s += '<text x="' + (xx + cw[i] / 2) + '" y="' + (y0 - 8) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + C.pur + '">' + h + '</text>'; xx += cw[i]; });
        V.forEach(function (v, r) {
          var y = y0 + r * 26, x2 = x0, st = state[v];
          var fill = v === cu ? C.orL : st === "reached" ? C.greenL : "#fff", stroke = v === cu ? C.or : st === "reached" ? C.green : "#bbb";
          [v, k[v] === null ? "-" : f(k[v]), p[v] || "-", v === cu ? "active" : st].forEach(function (c, i) {
            var hl = (i === 1 || i === 2) && v === changed;
            s += '<rect x="' + x2 + '" y="' + y + '" width="' + cw[i] + '" height="23" fill="' + (hl ? "#fff3a8" : fill) + '" stroke="' + stroke + '"/>' +
              '<text x="' + (x2 + cw[i] / 2) + '" y="' + (y + 16) + '" text-anchor="middle" font-size="' + (i === 1 ? 13.5 : 12) + '" font-weight="' + (i < 2 ? 700 : 400) + '" fill="#222">' + esc(c) + '</text>';
            x2 += cw[i];
          });
        });
        s += '<text x="10" y="20" font-size="12.5" font-weight="700" fill="' + C.pur + '">reached 순서: ' + (order.length ? esc(order.join(" → ")) : "(아직 없음)") + '</text>';
        s += '<text x="10" y="300" font-size="12.5" font-weight="700" fill="' + C.green + '">MST cost = ' + cost() + ' (간선 ' + mst.length + '/8)</text>';
        s += legend(10, 318, [["#fff", C.muted, "unreached"], [C.orL, C.or, "active (방금 고른 u)"], [C.green, C.green, "reached"]]);
        s += '<text x="300" y="368" font-size="11" fill="' + C.muted + '">점선 = 지금 key 가 가리키는 후보 간선 (p[v]–v)</text>';
        if (msg) s += '<text x="752" y="368" font-size="13" text-anchor="end" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        return graphSvg("prim", { w: 760, h: 378, pos: POS, label: label, edges: es, node: node, tag: tag, extra: s });
      }
      function snap(desc, line, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { P: line },
          vars: { u: cu, v: cv, cmp: cmp, k: kStr(),
            p: V.filter(function (v) { return p[v]; }).map(function (v) { return v + "←" + p[v]; }).join(", ") || "-",
            reached: V.filter(function (v) { return state[v] === "reached"; }),
            mst: mst.map(function (e) { return e[0] + "–" + e[1] + " " + e[2]; }).join(", ") || "-", cost: cost() },
          note: note, svg: draw(msg, msgColor)
        });
      }

      snap("`Set all vertices to unreached` — 아직 tree 에 들어간 정점이 없다. 시작점 s = A (슬라이드의 새).", 2);
      V.forEach(function (v) { k[v] = Infinity; });
      snap("`k[v] = ∞` — 모든 정점이 \"tree 에 간선 하나로 닿을 수 없다\" 에서 출발한다(p.49).", 3);
      k.A = 0; changed = "A";
      snap("`k[s] = 0` → k[A] = 0. A 를 맨 먼저 고르게 하려는 장치다.", 4);
      changed = null;

      while (V.some(function (v) { return state[v] === "unreached"; })) {
        cv = "-"; hot = null; changed = null; cmp = "-";
        var u = null;
        V.forEach(function (v) { if (state[v] === "unreached" && (u === null || k[v] < k[u])) u = v; });
        cu = u;
        var un = V.filter(function (v) { return state[v] === "unreached" && k[v] !== Infinity; });
        var tie = un.filter(function (v) { return v !== u && k[v] === k[u]; });
        snap("`Pick the unreached vertex u with the smallest key` — 후보 " + un.map(function (v) { return v + "(" + f(k[v]) + ")"; }).join(", ") +
          " 중 최소 → '''u = " + u + "''' (k = " + f(k[u]) + ")." + (tie.length ? " " + tie.join(", ") + " 도 " + f(k[u]) + " 로 같다. 슬라이드는 " + u + " 를 먼저 골랐다(p.29)." : ""), 6,
          tie.length ? "동점이면 어느 쪽을 골라도 MST 가 나온다. 보조정리는 light edge 가 여러 개면 그중 아무거나 safe 하다고 말하기 때문이다. 다만 고르는 쪽에 따라 MST 모양은 달라질 수 있다. H 를 골랐다면 B–C 대신 A–H 가 들어간 다른 MST(역시 cost 37)가 나온다." : null);
        ADJ[u].forEach(function (pr) {
          var v = pr[0], w = pr[1];
          cv = v; hot = [u, v];
          if (state[v] === "reached") {
            cmp = "-"; changed = null;
            snap("v = " + v + ": 이미 reached 라 건너뛴다. tree 안의 정점은 key 를 더 바꾸지 않는다.", 7);
            return;
          }
          cmp = "min(" + f(k[v]) + ", " + w + ")";
          if (w < k[v]) {
            var old = k[v];
            k[v] = w; p[v] = u; changed = v;
            snap("v = " + v + ": `k[" + v + "] = min(k[" + v + "], weight(" + u + "," + v + "))` = min(" + f(old) + ", " + w + ") = '''" + w + "''' → 줄었다. `p[" + v + "] = " + u + "`.", 9,
              old !== Infinity ? v + " 의 key 가 " + old + " → " + w + " 로 다시 줄었다. 더 가까운 tree 정점(" + u + ")이 생겼기 때문이다. Dijkstra 라면 d[" + u + "] + " + w + " 와 비교했겠지만 Prim 은 간선 무게 " + w + " 만 본다." : null);
          } else {
            changed = null;
            snap("v = " + v + ": min(" + f(k[v]) + ", " + w + ") = " + f(k[v]) + " → 그대로.", 8);
          }
        });
        cv = "-"; hot = null; changed = null; cmp = "-";
        state[u] = "reached"; order.push(u);
        if (p[u]) {
          mst.push([p[u], u, k[u]]);
          snap("`Mark u as reached, and add (p[u],u) to MST` — " + u + " reached, 간선 '''" + p[u] + "–" + u + " (" + k[u] + ")''' 추가. 지금까지 cost " + cost() + ".", 10,
            "이 간선은 cut {reached, unreached} 를 건너는 간선 중 가장 가볍다(light edge). 그래서 [[MST 보조정리]] 에 의해 넣어도 안전하다(p.40–41).");
        } else {
          snap("`Mark u as reached` — A 는 시작점이라 p[A] 가 없고, 추가할 간선도 없다.", 10);
        }
        cu = "-";
      }
      snap("끝. MST = " + mst.map(function (e) { return e[0] + "–" + e[1]; }).join(", ") + ", cost '''" + cost() + "'''. p.8 의 MST 와 같다.", 5,
        "수행 시간은 Dijkstra 와 같다(p.71). red-black tree 를 priority queue 로 쓰면 O(m log n), Fibonacci heap 이면 O(m + n log n) amortized 다. 처음 아이디어(slowPrim)는 매번 간선을 전부 봐서 O(nm) 이었다(p.36).",
        "MST cost 37", C.green);

      return {
        panels: [{ id: "P", title: "Prim(G,s) (L15 p.49–52, p.67)", lang: "txt", lines: CODE }],
        vars: [
          { name: "u", label: "u (active)", group: "현재" },
          { name: "v", label: "v (이웃)", group: "현재" },
          { name: "cmp", label: "min(k[v], w(u,v))", group: "현재" },
          { name: "k", label: "k[v]", group: "key" },
          { name: "p", label: "p[v]", group: "key" },
          { name: "reached", label: "reached", group: "tree" },
          { name: "mst", label: "MST 간선", group: "tree" },
          { name: "cost", label: "MST cost", group: "tree" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
