// bellman_ford_table — L12 p.18 Bellman-Ford*(G,s) 를 표 한 칸씩: d^(0) … d^(n) 행을 채우고 d^(n-1) ≠ d^(n) 이면 NEGATIVE CYCLE.
//   (L11 p.70–75 의 "u 의 out-neighbor 갱신" 형태와 같은 계산을, L12 p.8·18 의 "v 의 in-neighbor 중 최소" 형태로 칸마다 보인다.)
//
// 그래프 (열 순서 Gates, R1, E3, Park, HG — 슬라이드 표와 같음, s = Gates, n = 5):
//  pos : L11 p.70–75 / L12 p.9–14 그림 (음수 없음, 양방향) Gates–R1 1, Gates–HG 25, R1–E3 1, R1–HG 22, E3–Park 4, Park–HG 20
//  neg : 직접 만든 변형 — p.81 모양에서 Gates→HG = +3, HG→R1 = −3 (유향), Gates–R1 1, R1–E3 1, E3–Park 4, Park–HG 10 (양방향). negative cycle 없음.
//  cyc : L11 p.81–82 / L12 p.17 그림 그대로 — Gates→HG −3, HG→R1 −2 (유향), Gates–R1 1, R1–E3 1, E3–Park 4, Park–HG 10 (양방향)
//        → cycle Gates→HG→R1→Gates = −3 −2 +1 = −4 (negative cycle)
//
// 기대 최종값 (src/sims/_check_final.py → _check_final.txt):
//  pos : d0 [0,∞,∞,∞,∞] d1 [0,1,∞,∞,25] d2 [0,1,2,45,23] d3 [0,1,2,6,23] d4 = d5 = [0,1,2,6,23] → OK (슬라이드 표와 같음)
//  neg : d1 [0,1,∞,∞,3] d2 [0,0,2,13,3] d3 [0,0,1,6,3] d4 = d5 = [0,0,1,5,3] → OK
//  cyc : d1 [0,1,∞,∞,−3] d2 [0,−5,2,7,−3] d3 [−4,−5,−4,6,−3] d4 [−4,−5,−4,0,−7] d5 [−4,−9,−4,0,−7] → d4 ≠ d5 → NEGATIVE CYCLE
//        (슬라이드 p.81 표는 d4·d5 의 Park 를 6·3 으로 적었다 — d3[E3] = −4 에서 E3→Park 4 를 반영하지 않은 슬라이드 쪽 실수.
//         그림의 간선대로 계산하면 0. R1 이 −5 → −9 로 바뀌어 "Some stuff changed!" 결론은 같다.)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "Bellman-Ford*(G,s):",
    "  d(0)[v] = ∞ for all v in V",
    "  d(0)[s] = 0",
    "  For i=0,…,n-1:",
    "    For v in V:",
    "      d(i+1)[v] ← min( d(i)[v] , min_{u in v.inNeighbors} {d(i)[u] + w(u,v)} )",
    "  If d(n-1) != d(n) :",
    "    Return NEGATIVE CYCLE",
    "  Otherwise, dist(s,v) = d(n-1)[v]"
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
  var POS = { Gates: { x: 560, y: 60 }, E3: { x: 730, y: 120 }, R1: { x: 500, y: 190 }, Park: { x: 700, y: 255 }, HG: { x: 590, y: 320 } };
  function mk(bi, di) {
    var inn = {}, edges = [];
    V.forEach(function (v) { inn[v] = []; });
    bi.forEach(function (e) { inn[e[1]].push([e[0], e[2]]); inn[e[0]].push([e[1], e[2]]); edges.push({ u: e[0], v: e[1], w: e[2], both: true }); });
    di.forEach(function (e) { inn[e[1]].push([e[0], e[2]]); edges.push({ u: e[0], v: e[1], w: e[2], both: false }); });
    V.forEach(function (v) { inn[v].sort(function (a, b) { return V.indexOf(a[0]) - V.indexOf(b[0]); }); });
    return { inn: inn, edges: edges };
  }
  var EX = {
    pos: { label: "음수 간선 없음 (L11 p.70–75, L12 p.9–14)", g: mk([["Gates", "R1", 1], ["Gates", "HG", 25], ["R1", "E3", 1], ["R1", "HG", 22], ["E3", "Park", 4], ["Park", "HG", 20]], []), directed: false },
    neg: { label: "음수 간선 있음, cycle 없음 (직접 만든 변형)", g: mk([["Gates", "R1", 1], ["R1", "E3", 1], ["E3", "Park", 4], ["Park", "HG", 10]], [["Gates", "HG", 3], ["HG", "R1", -3]]), directed: true },
    cyc: { label: "negative cycle (L11 p.80–82, L12 p.17)", g: mk([["Gates", "R1", 1], ["R1", "E3", 1], ["E3", "Park", 4], ["Park", "HG", 10]], [["Gates", "HG", -3], ["HG", "R1", -2]]), directed: true }
  };

  global.SIMS["bellman_ford_table"] = {
    title: "Bellman-Ford — d⁽⁰⁾ … d⁽ⁿ⁾ 표를 한 칸씩 (L11 p.70–84, L12 p.8–18)",
    desc: "L11 p.63–85, L12 p.4–20. [[Bellman-Ford]] 는 Dijkstra 처럼 u 를 똑똑하게 고르지 않고 '''모든 간선을 매 라운드 다 본다'''. " +
      "[[d^(i) 배열]] $d^{(i)}[v]$ = s 에서 v 까지 '''간선을 최대 i 개''' 쓰는 경로 중 최소 비용. 그래서 $d^{(i+1)}[v] = \\min(d^{(i)}[v], \\min_u \\{d^{(i)}[u] + w(u,v)\\})$ — 직전 행만 보고 다음 행을 채운다(이것이 DP). " +
      "n−1 라운드면 충분하고(단순 경로는 간선 ≤ n−1 개), n 번째 행이 또 바뀌면 [[negative cycle]]. 그래프는 슬라이드 Gates 그림(음수 없음 / p.81 음수 그림)과 직접 만든 변형 하나.",
    options: [
      { key: "ex", label: "그래프", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.pos, inn = ex.g.inn, n = V.length;
      var rows = [], steps = [];
      var ci = "-", cv = "-", cands = "-", result = "-", hotV = null, curCell = null, changedCells = {};

      function f(x) { return x === undefined ? "" : x === Infinity ? "∞" : String(x); }
      function rowArr(i) { return rows[i] ? V.map(function (v) { return f(rows[i][v]); }) : "-"; }
      function draw(msg, msgColor) {
        var x0 = 70, y0 = 58, cw = 62, rh = 31, s = "";
        V.forEach(function (v, j) { s += '<text x="' + (x0 + j * cw + cw / 2) + '" y="' + (y0 - 9) + '" text-anchor="middle" font-size="12.5" font-weight="700" fill="' + C.pur + '">' + v + '</text>'; });
        for (var i = 0; i <= n; i++) {
          var y = y0 + i * rh;
          var isCheck = i === n;
          s += '<text x="' + (x0 - 10) + '" y="' + (y + 19) + '" text-anchor="end" font-size="13" font-weight="700" fill="' + (isCheck ? C.red : C.pur) + '">d(' + i + ')</text>';
          V.forEach(function (v, j) {
            var val = rows[i] ? rows[i][v] : undefined;
            var isCur = curCell && curCell[0] === i && curCell[1] === v;
            var ch = changedCells[i + "," + v];
            var fill = isCur ? C.orL : ch ? "#fff3a8" : val === undefined ? "#fafafa" : (isCheck ? C.redL : "#fbe9e0");
            s += '<rect x="' + (x0 + j * cw) + '" y="' + y + '" width="' + cw + '" height="' + (rh - 4) + '" fill="' + fill + '" stroke="' + (isCur ? C.or : isCheck ? C.red : C.pur) + '" stroke-width="' + (isCur ? 2.5 : 1) + '"/>' +
              '<text x="' + (x0 + j * cw + cw / 2) + '" y="' + (y + 18) + '" text-anchor="middle" font-size="14" font-weight="' + (ch ? 700 : 400) + '" fill="' + (typeof val === "number" && val < 0 ? C.red : "#222") + '">' + f(val) + '</text>';
          });
          if (i === n - 1) s += '<line x1="' + (x0 - 40) + '" y1="' + (y + rh - 1.5) + '" x2="' + (x0 + n * cw) + '" y2="' + (y + rh - 1.5) + '" stroke="' + C.red + '" stroke-dasharray="4 3"/>';
        }
        s += '<text x="' + (x0 + n * cw + 8) + '" y="' + (y0 + n * rh + 18) + '" font-size="11" fill="' + C.red + '">← 검사 행</text>';
        s += '<text x="12" y="22" font-size="12.5" font-weight="700" fill="' + C.pur + '">s = Gates, n = 5 → d(0)…d(4) 가 본 계산, d(5) 는 negative cycle 검사</text>';
        if (msg) s += '<text x="12" y="' + (y0 + (n + 1) * rh + 22) + '" font-size="13" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';

        var node = {}, tag = {}, label = {};
        var lastRow = rows.length - 1;
        V.forEach(function (v) {
          label[v] = v;
          node[v] = v === hotV ? { fill: C.orL, stroke: C.or, sw: 4 } : { fill: "#fff", stroke: C.muted };
          var cur = curCell && rows[curCell[0]] && rows[curCell[0]][v] !== undefined ? rows[curCell[0]][v] : rows[lastRow][v];
          tag[v] = { t: "d=" + f(cur), c: C.pur, up: v === "Gates" || v === "E3" };
        });
        var es = ex.g.edges.map(function (e) {
          var hot = hotV && (e.v === hotV || (e.both && e.u === hotV));
          var arrow = e.both ? (ex.directed ? "both" : "none") : "end";
          return { u: e.u, v: e.v, w: e.w, arrow: arrow, color: hot ? C.or : C.edge, width: hot ? 3.5 : 2, wc: e.w < 0 ? C.red : C.pur };
        });
        return graphSvg("bf", { w: 760, h: 300 + 80, pos: POS, label: label, edges: es, node: node, tag: tag, extra: s });
      }
      function snap(desc, line, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { B: line },
          vars: { i: ci, v: cv, cands: cands, d_i: ci === "-" ? "-" : rowArr(ci), d_next: ci === "-" ? "-" : rowArr(ci + 1), result: result },
          note: note, svg: draw(msg, msgColor)
        });
      }

      rows.push({});
      V.forEach(function (v) { rows[0][v] = Infinity; });
      snap("`d(0)[v] = ∞` — 간선을 0 개 쓰는 경로로는 s 말고 아무 데도 못 간다.", 2);
      rows[0].Gates = 0; changedCells["0,Gates"] = 1;
      snap("`d(0)[s] = 0` → d(0)[Gates] = 0.", 3);
      changedCells = {};

      for (var i = 0; i < n; i++) {
        ci = i; rows.push({}); changedCells = {};
        cv = "-"; cands = "-"; hotV = null; curCell = null;
        snap("`For i = " + i + "` — d(" + i + ") 행만 보고 d(" + (i + 1) + ") 행을 채운다 (= 간선을 최대 " + (i + 1) + " 개 쓰는 최단 비용)" + (i === n - 1 ? ". '''이 라운드는 검사용'''(n 번째 행)." : "."), 4);
        for (var j = 0; j < n; j++) {
          var v = V[j];
          cv = v; hotV = v; curCell = [i + 1, v];
          var parts = ["d(" + i + ")[" + v + "] = " + f(rows[i][v])], best = rows[i][v];
          inn[v].forEach(function (p) {
            var c = rows[i][p[0]] + p[1];
            parts.push(p[0] + ": " + f(rows[i][p[0]]) + (p[1] < 0 ? " − " + (-p[1]) : " + " + p[1]) + " = " + f(c));
            if (c < best) best = c;
          });
          cands = parts.join(" | ");
          rows[i + 1][v] = best;
          var ch = best !== rows[i][v];
          if (ch) changedCells[(i + 1) + "," + v] = 1;
          var note = null;
          if (ex === EX.cyc && v === "Park" && (i + 1 === 4 || i + 1 === 5)) {
            note = "슬라이드 p.81 표에는 d(" + (i + 1) + ")[Park] = " + (i + 1 === 4 ? "6" : "3") + " 으로 적혀 있지만, d(" + i + ")[E3] = −4 이고 E3→Park = 4 이므로 −4 + 4 = 0 이 맞다(슬라이드 쪽 계산 누락). 결론(d(4) ≠ d(5) → negative cycle)은 같다.";
          }
          snap("d(" + (i + 1) + ")[" + v + "] = min( " + parts.join(", ") + " ) = '''" + f(best) + "'''" + (ch ? " ← 바뀜" : " (그대로)") + ".", 6, note);
        }
        cv = "-"; cands = "-"; hotV = null; curCell = null;
        var same = V.every(function (v) { return rows[i + 1][v] === rows[i][v]; });
        snap("d(" + (i + 1) + ") = [" + rowArr(i + 1).join(", ") + "]" + (same ? " — d(" + i + ") 와 '''똑같다'''(안정됨)." : " — 바뀐 칸 " + Object.keys(changedCells).length + "개(노란색)."), 5);
      }
      ci = n - 1; cv = "-"; cands = "-"; hotV = null; curCell = null;
      var diff = V.filter(function (v) { return rows[n][v] !== rows[n - 1][v]; });
      changedCells = {};
      diff.forEach(function (v) { changedCells[n + "," + v] = 1; });
      if (diff.length) {
        result = "NEGATIVE CYCLE";
        snap("`If d(n-1) != d(n)` — d(4) 와 d(5) 가 " + diff.join(", ") + " 에서 다르다!", 7);
        snap("`Return NEGATIVE CYCLE`. 간선을 5 개(= n 개) 쓰니 더 싸졌다는 것은 어떤 정점이 경로에 두 번 나온다는 것 = 사이클을 한 바퀴 돌았더니 비용이 줄었다. 사이클 Gates→HG→R1→Gates = −3 + (−2) + 1 = '''−4'''.", 8,
          "negative cycle 이 있으면 최단경로 자체가 정의되지 않는다(계속 돌면 −∞). Bellman-Ford 는 답을 내는 대신 그 사실을 '''감지'''한다.", "d(4) ≠ d(5) → NEGATIVE CYCLE", C.red);
      } else {
        result = "dist = [" + rowArr(n - 1).join(", ") + "]";
        snap("`If d(n-1) != d(n)` — d(4) = d(5) (변화 없음) → negative cycle 없음.", 7);
        snap("`Otherwise, dist(s,v) = d(n-1)[v]` → " + V.map(function (v) { return v + " " + f(rows[n - 1][v]); }).join(", ") + ". 수행 시간 O(nm): 라운드 n 번 × 간선 m 개.", 9,
          ex === EX.neg ? "같은 그래프에서 Dijkstra 는 E3 = 2, Park = 6 이라는 틀린 답을 낸다(dijkstra_trace 의 함정 옵션). 음수 간선은 Bellman-Ford 로." : "표 한 행은 직전 행만 쓴다 → 메모리는 두 행이면 충분하다(L12 p.15).",
          "dist = [" + rowArr(n - 1).join(", ") + "]", C.green);
      }

      return {
        panels: [{ id: "B", title: "Bellman-Ford* (L12 p.18)", lang: "txt", lines: CODE }],
        vars: [
          { name: "i", label: "i (라운드)", group: "반복" },
          { name: "v", label: "v (채우는 칸)", group: "반복" },
          { name: "cands", label: "후보 (자기 자신 | in-neighbor u)", group: "반복" },
          { name: "d_i", label: "d(i) 행", group: "표" },
          { name: "d_next", label: "d(i+1) 행", group: "표" },
          { name: "result", label: "결과", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
