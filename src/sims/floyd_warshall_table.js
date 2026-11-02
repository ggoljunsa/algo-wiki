// floyd_warshall_table — L12 p.53 Floyd-Warshall: k = 1..n 마다 D(k) 행렬, 바뀐 칸 강조 (Case 2: k 를 거치는 쪽이 더 쌈).
//
// L12 슬라이드(p.41–55)에는 수치가 붙은 Floyd-Warshall 예제 그래프가 없다. 그래서:
//  gates: L11/L12 의 Gates 그래프(슬라이드 그림, 무방향 = 양방향 간선)에 번호 1=Gates 2=R1 3=E3 4=Park 5=HG 를 붙여 돌린다.
//         Gates–R1 1, Gates–HG 25, R1–E3 1, R1–HG 22, E3–Park 4, Park–HG 20
//  dir4 : '''직접 만든''' 4정점 유향 그래프 (음수 간선 있음, negative cycle 없음)
//         1→2 3, 1→3 8, 2→4 1, 3→2 4, 4→1 2, 4→3 −5      (사이클 3→2→4→3 = 4+1−5 = 0)
//  cyc4 : dir4 에서 4→3 = −6 으로 바꾼 것 → cycle 3→2→4→3 = −1 (negative cycle, p.55: D(n)[v,v] < 0 으로 감지)
//
// 기대 최종값 (src/sims/_check_final.py → _check_final.txt), 바뀐 칸 수는 D(1)…D(n) 순:
//  gates: 바뀐 칸 0, 6, 4, 0, 0 → D(5) = [[0,1,2,6,23],[1,0,1,5,22],[2,1,0,4,23],[6,5,4,0,20],[23,22,23,20,0]]
//         (첫 행 = Dijkstra/Bellman-Ford 의 Gates 출발 거리 0,1,2,6,23 과 같음)
//  dir4 : 바뀐 칸 1, 2, 1, 4 → D(4) = [[0,3,−1,4],[3,0,−4,1],[7,4,0,5],[2,−1,−5,0]], 대각선 음수 없음
//  cyc4 : 바뀐 칸 1, 2, 2, 15 → D(4) = [[0,2,−2,3],[3,−1,−5,0],[7,3,−1,4],[1,−3,−7,−2]], 대각선 D[2,2]=−1, D[3,3]=−1, D[4,4]=−2 < 0 → negative cycle
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "Initialize n-by-n arrays D(k) for k = 0,…,n",
    "  D(k)[u,u] = 0 for all u, for all k",
    "  D(k)[u,v] = ∞ for all u ≠ v, for all k",
    "  D(0)[u,v] = weight(u,v) for all (u,v) in E.",
    "For k = 1, …, n:",
    "  For pairs u,v in V^2:",
    "    D(k)[u,v] = min{ D(k-1)[u,v], D(k-1)[u,k] + D(k-1)[k,v] }",
    "Return D(n)"
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


  var EX = {
    gates: {
      label: "Gates 그래프 5정점 (L11/L12 슬라이드 그림)", names: ["Gates", "R1", "E3", "Park", "HG"], directed: false,
      edges: [["Gates", "R1", 1], ["Gates", "HG", 25], ["R1", "E3", 1], ["R1", "HG", 22], ["E3", "Park", 4], ["Park", "HG", 20]],
      pos: { Gates: { x: 560, y: 70 }, E3: { x: 725, y: 125 }, R1: { x: 500, y: 190 }, Park: { x: 700, y: 255 }, HG: { x: 590, y: 315 } }
    },
    dir4: {
      label: "4정점 유향, 음수 간선 (직접 만든 예)", names: ["1", "2", "3", "4"], directed: true,
      edges: [["1", "2", 3], ["1", "3", 8], ["2", "4", 1], ["3", "2", 4], ["4", "1", 2], ["4", "3", -5]],
      pos: { "1": { x: 480, y: 90 }, "2": { x: 700, y: 90 }, "3": { x: 480, y: 290 }, "4": { x: 700, y: 290 } }
    },
    cyc4: {
      label: "4정점, negative cycle (직접 만든 예, 4→3 = −6)", names: ["1", "2", "3", "4"], directed: true,
      edges: [["1", "2", 3], ["1", "3", 8], ["2", "4", 1], ["3", "2", 4], ["4", "1", 2], ["4", "3", -6]],
      pos: { "1": { x: 480, y: 90 }, "2": { x: 700, y: 90 }, "3": { x: 480, y: 290 }, "4": { x: 700, y: 290 } }
    }
  };

  global.SIMS["floyd_warshall_table"] = {
    title: "Floyd-Warshall — k 마다 D⁽ᵏ⁾ 행렬 (L12 p.41–55)",
    desc: "L12 p.41–55. [[Floyd-Warshall]] 은 [[all-pairs shortest path]] 를 구하는 bottom-up [[dynamic programming]]. " +
      "$D^{(k)}[u,v]$ = 중간 정점이 {1, …, k} 안에만 있는 u→v 최단 비용. 정점 k 를 \"경유 허용\"에 넣을 때 각 칸은 Case 1(k 안 거침: 그대로) 과 Case 2(u→k→v: $D^{(k-1)}[u,k] + D^{(k-1)}[k,v]$) 중 작은 쪽. " +
      "k 행·k 열(파랑)만 보고 나머지 칸을 고치므로 한 단계 $O(n^2)$, 전체 $O(n^3)$. " +
      "'''슬라이드에는 수치 예제가 없어서''' Gates 그래프(슬라이드 그림)와 직접 만든 4정점 그래프 두 개를 쓴다.",
    options: [
      { key: "ex", label: "그래프", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.gates, names = ex.names, n = names.length;
      var steps = [], Ds = [];
      var ck = "-", cu = "-", cv = "-", c1 = "-", c2 = "-", nChanged = "-", result = "-";
      var hiCell = null, changed = {}, showK = null;

      function f(x) { return x === Infinity ? "∞" : String(x); }
      var W = {};
      ex.edges.forEach(function (e) { W[e[0] + ">" + e[1]] = e[2]; if (!ex.directed) W[e[1] + ">" + e[0]] = e[2]; });
      function curD() { return Ds[Ds.length - 1]; }
      function matStr(D) { return D.map(function (row, i) { return (i + 1) + ":[" + row.map(f).join(",") + "]"; }); }

      function draw(msg, msgColor) {
        var D = curD(), cw = n > 4 ? 54 : 60, rh = 30, x0 = 92, y0 = 66, s = "";
        var kIdx = showK === null ? -1 : showK - 1;
        s += '<text x="12" y="22" font-size="13" font-weight="700" fill="' + C.pur + '">D(' + (Ds.length - 1) + ')' + (kIdx >= 0 ? " ← D(" + (kIdx) + ") 에서 k = " + showK + " (" + names[kIdx] + ") 경유 허용" : "") + '</text>';
        s += '<text x="' + (x0 - 6) + '" y="' + (y0 - 10) + '" text-anchor="end" font-size="11" fill="' + C.muted + '">u \\ v</text>';
        names.forEach(function (nm, j) {
          s += '<text x="' + (x0 + j * cw + cw / 2) + '" y="' + (y0 - 10) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + (j === kIdx ? C.blue : C.pur) + '">' + (j + 1) + (n > 4 ? "" : "") + '</text>';
        });
        names.forEach(function (nm, i) {
          var y = y0 + i * rh;
          s += '<text x="' + (x0 - 6) + '" y="' + (y + 19) + '" text-anchor="end" font-size="11.5" font-weight="700" fill="' + (i === kIdx ? C.blue : C.pur) + '">' + (n > 4 ? (i + 1) + " " + nm : nm) + '</text>';
          names.forEach(function (nm2, j) {
            var isCur = hiCell && hiCell[0] === i && hiCell[1] === j;
            var isSrc = hiCell && ((hiCell[0] === i && j === kIdx) || (hiCell[1] === j && i === kIdx));
            var inK = i === kIdx || j === kIdx;
            var ch = changed[i + "," + j];
            var val = D[i][j];
            var fill = isCur ? C.orL : ch ? "#fff3a8" : isSrc ? "#b9d3f0" : inK ? C.blueL : i === j ? "#f2f2f2" : "#fff";
            s += '<rect x="' + (x0 + j * cw) + '" y="' + y + '" width="' + cw + '" height="' + (rh - 3) + '" fill="' + fill + '" stroke="' + (isCur ? C.or : "#aaa") + '" stroke-width="' + (isCur ? 2.5 : 1) + '"/>' +
              '<text x="' + (x0 + j * cw + cw / 2) + '" y="' + (y + 18) + '" text-anchor="middle" font-size="14" font-weight="' + (ch || isCur ? 700 : 400) + '" fill="' + (val < 0 ? C.red : "#222") + '">' + f(val) + '</text>';
          });
        });
        var yb = y0 + n * rh + 18;
        s += '<text x="12" y="' + yb + '" font-size="11.5" fill="#333">파랑 = k 행·k 열 (Case 2 재료) · 노랑 = 이번 k 에서 바뀐 칸 · 회색 = 대각선</text>';
        if (msg) s += '<text x="12" y="' + (yb + 22) + '" font-size="13" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';

        var node = {}, tag = {}, label = {};
        names.forEach(function (nm, i) {
          label[nm] = nm;
          var isK = i === kIdx, isU = hiCell && hiCell[0] === i, isV = hiCell && hiCell[1] === i;
          node[nm] = isK ? { fill: C.blueL, stroke: C.blue, sw: 3.5 } : isU || isV ? { fill: C.orL, stroke: C.or, sw: 3 } : { fill: "#fff", stroke: C.muted };
          if (n > 4) tag[nm] = { t: "#" + (i + 1), c: isK ? C.blue : C.pur, up: nm === "Gates" || nm === "E3" };
        });
        var es = ex.edges.map(function (e) {
          return { u: e[0], v: e[1], w: e[2], arrow: ex.directed ? "end" : "none", color: C.edge, width: 2, wc: e[2] < 0 ? C.red : C.pur,
            wside: ex.directed && ((e[0] === "3" && e[1] === "2") || (e[0] === "4" && e[1] === "1")) ? -1 : 1, wt: ex.directed && (e[0] === "3" || e[0] === "4") && (e[1] === "2" || e[1] === "1") ? 0.3 : 0.5 };
        });
        var H = Math.max(360, yb + 40);
        return graphSvg("fw", { w: 760, h: H, pos: ex.pos, label: label, edges: es, node: node, tag: tag, extra: s });
      }
      function snap(desc, line, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { F: line },
          vars: { k: ck, u: cu, v: cv, case1: c1, case2: c2, changed: nChanged, D: matStr(curD()), result: result },
          note: note, svg: draw(msg, msgColor)
        });
      }

      var D0 = [];
      for (var i = 0; i < n; i++) { D0.push([]); for (var j = 0; j < n; j++) D0[i].push(i === j ? 0 : Infinity); }
      Ds.push(D0);
      snap("`D(k)[u,u] = 0`, `D(k)[u,v] = ∞ (u ≠ v)` — 처음에는 자기 자신까지 0, 나머지는 모름.", 3);
      for (i = 0; i < n; i++) for (j = 0; j < n; j++) if (W[names[i] + ">" + names[j]] !== undefined) { D0[i][j] = W[names[i] + ">" + names[j]]; changed[i + "," + j] = 1; }
      snap("`D(0)[u,v] = weight(u,v)` — 중간 정점을 '''하나도''' 안 쓰는 경로 = 간선 하나뿐(\"The base case checks out\"). 간선이 없으면 ∞.", 4);
      changed = {};

      for (var k = 1; k <= n; k++) {
        var P = curD(), K = k - 1, Dn = P.map(function (r) { return r.slice(); });
        ck = k + " (" + names[K] + ")"; showK = k; hiCell = null; changed = {}; cu = cv = c1 = c2 = "-";
        var list = [];
        for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
          var via = P[i][K] + P[K][j];
          if (via < P[i][j]) { Dn[i][j] = via; list.push([i, j, P[i][j], P[i][K], P[K][j], via]); }
        }
        nChanged = list.length;
        var shownD = P.map(function (r) { return r.slice(); });
        Ds.push(shownD);
        snap("`For k = " + k + "` — 이제 정점 " + k + " (" + names[K] + ") 를 중간 경유지로 허용. 각 칸 [u,v] 를 `D(" + K + ")[u," + k + "] + D(" + K + ")[" + k + ",v]` (파랑 k 행 + k 열) 와 비교한다." +
          (list.length ? " 이번에 줄어드는 칸은 " + list.length + " 개." : " '''줄어드는 칸이 없다''' — " + names[K] + " 를 거쳐 가면 더 싸지는 쌍이 없다."), 5);
        // 바뀐 칸만 하나씩 보여 준다 (나머지는 Case 1: 그대로)
        list.forEach(function (c) {
          cu = String(c[0] + 1); cv = String(c[1] + 1); c1 = f(c[2]); c2 = f(c[3]) + " + " + f(c[4]) + " = " + f(c[5]);
          hiCell = [c[0], c[1]];
          shownD[c[0]][c[1]] = c[5]; changed[c[0] + "," + c[1]] = 1;
          snap("D(" + k + ")[" + (c[0] + 1) + "," + (c[1] + 1) + "] = min{ D(" + K + ")[" + (c[0] + 1) + "," + (c[1] + 1) + "] = " + f(c[2]) + ", D(" + K + ")[" + (c[0] + 1) + "," + k + "] + D(" + K + ")[" + k + "," + (c[1] + 1) + "] = " +
            f(c[3]) + " + " + f(c[4]) + " = " + f(c[5]) + " } = '''" + f(c[5]) + "''' — Case 2: " + names[c[0]] + " → " + names[K] + " → " + names[c[1]] + " 가 더 싸다.", 7,
            c[0] === c[1] ? "대각선 칸이 0 보다 작아졌다: " + names[c[0]] + " 에서 출발해 " + names[c[0]] + " 로 돌아오는 비용 < 0 = negative cycle (p.55)." : null);
        });
        hiCell = null; cu = cv = c1 = c2 = "-";
        snap("D(" + k + ") 완성 (바뀐 칸 " + list.length + " 개, 나머지 " + (n * n - list.length) + " 칸은 Case 1 = D(" + K + ") 그대로).", 6);
      }
      ck = "-"; showK = null; changed = {}; nChanged = "-";
      var Dn2 = curD(), negs = [];
      for (i = 0; i < n; i++) if (Dn2[i][i] < 0) negs.push(names[i]);
      if (negs.length) {
        result = "negative cycle (" + negs.join(", ") + ")";
        for (i = 0; i < n; i++) if (Dn2[i][i] < 0) changed[i + "," + i] = 1;
        snap("`Return D(" + n + ")` — 그런데 대각선 " + negs.map(function (v) { var x = names.indexOf(v); return "D[" + (x + 1) + "," + (x + 1) + "] = " + Dn2[x][x]; }).join(", ") + " 가 음수다 → '''negative cycle'''. 이때 D(n) 의 값들은 최단거리가 아니다.", 8,
          "Negative cycle ⇔ ∃v, D(n)[v,v] < 0 (L12 p.55). 사이클 3→2→4→3 = 4 + 1 − 6 = −1.", "대각선 < 0 → NEGATIVE CYCLE", C.red);
      } else {
        result = "D(" + n + ") = 모든 쌍 최단거리";
        snap("`Return D(" + n + ")` — 모든 쌍 u→v 의 최단 비용. 대각선이 모두 0 → negative cycle 없음. 3중 for 문 → O(n³)." +
          (ex === EX.gates ? " 1 행(Gates) = 0, 1, 2, 6, 23 은 Dijkstra·Bellman-Ford 결과와 같다." : ""), 8,
          ex === EX.gates ? "n 번 Dijkstra(음수 불가) 나 n 번 Bellman-Ford(O(n²m)) 대신, 음수 간선도 되는 O(n³) 한 방." : "음수 간선(4→3 = −5)이 있어도 negative cycle 만 없으면 맞다.",
          "완료: D(" + n + ")", C.green);
      }

      return {
        panels: [{ id: "F", title: "Floyd-Warshall (L12 p.53)", lang: "txt", lines: CODE }],
        vars: [
          { name: "k", label: "k (경유 허용 정점)", group: "반복" },
          { name: "u", group: "칸" },
          { name: "v", group: "칸" },
          { name: "case1", label: "Case 1: D(k-1)[u,v]", group: "칸" },
          { name: "case2", label: "Case 2: D(k-1)[u,k] + D(k-1)[k,v]", group: "칸" },
          { name: "changed", label: "이번 k 에서 바뀐 칸 수", group: "반복" },
          { name: "D", label: "현재 D 행렬 (행별)", group: "행렬" },
          { name: "result", label: "결과", group: "행렬" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
