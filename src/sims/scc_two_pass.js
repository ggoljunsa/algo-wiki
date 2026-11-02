// scc_two_pass — L10 p.12(알고리즘) + p.13–47(예제): 1차 DFS 로 finish 시각 → 간선 뒤집기(G^T) → finish 내림차순으로 2차 DFS → 2차 DFS forest 의 tree 하나 = SCC 하나.
//
// 그래프는 L10 PNG 12–47 (인쇄 p.13–47) 그림에서 복원 (유향, 간선 11개):
//   DGIST→Wiki, Wiki→DGIST, DGIST→Puppy, Wiki→Puppy, Wiki→YouTube, YouTube→DGIST, YouTube→Puppy,
//   KAIST→DGIST, KAIST→Puppy, Puppy→Google, Google→Puppy
//   1차 DFS 이웃 순서: DGIST:[Wiki, Puppy] Wiki:[DGIST, Puppy, YouTube] Puppy:[Google] Google:[Puppy] YouTube:[DGIST, Puppy] KAIST:[DGIST, Puppy]
//   (슬라이드 순서: DGIST → Wiki → Puppy → Google, 그다음 Wiki → YouTube, 마지막에 KAIST)
//   2차 DFS 의 G^T 이웃은 1차 finish 내림차순으로 본다.
//
// 기대 최종값 (src/sims/_check_final.py → _check_final.txt):
//  slide : 1차 DGIST 0/9, Wiki 1/8, Puppy 2/5, Google 3/4, YouTube 6/7, KAIST 10/11
//          (슬라이드 그림은 YouTube 7/8, Wiki 9, DGIST 10, KAIST 11/12 — Puppy 가 5 에 끝난 뒤 시각 6 을 건너뛴 슬라이드 쪽 셈 실수. p.67 코드대로 세면 위 값. 순서는 같다)
//          2차 순서 KAIST, DGIST, Wiki, YouTube, Puppy, Google → SCC {KAIST}, {DGIST, Wiki, YouTube}, {Puppy, Google}
//  google: 1차를 Google, YouTube, KAIST, DGIST, Wiki, Puppy 순으로 시작 → Google 0/3, Puppy 1/2, YouTube 4/9, DGIST 5/8, Wiki 6/7, KAIST 10/11
//          2차 순서 KAIST, YouTube, DGIST, Wiki, Google, Puppy → SCC {KAIST}, {YouTube, Wiki, DGIST}, {Google, Puppy} (같은 SCC — 시작점은 아무거나)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var ALG = [
    "Do DFS to create a DFS forest.",
    "    Choose starting vertices in any order.",
    "    Keep track of finishing times.",
    "Reverse all the edges in the graph.",
    "Do DFS again to create another DFS forest.",
    "    This time, order the nodes in the reverse order of",
    "    the finishing times that they had from the first DFS run.",
    "The SCCs are the different trees in the second DFS forest."
  ];
  var DFS = [
    "def dfs(u, cur_time):",
    "    u.start_time = cur_time",
    "    cur_time += 1",
    "    u.status = \"in_progress\"",
    "    for v in u.neighbors:",
    "        if v.status is \"unvisited\":",
    "            cur_time = dfs(v, cur_time)",
    "            cur_time += 1",
    "    u.end_time = cur_time",
    "    u.status = \"done\"",
    "    return cur_time"
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


  var G = { DGIST: ["Wiki", "Puppy"], Wiki: ["DGIST", "Puppy", "YouTube"], Puppy: ["Google"], Google: ["Puppy"], YouTube: ["DGIST", "Puppy"], KAIST: ["DGIST", "Puppy"] };
  var IDS = ["DGIST", "Wiki", "Puppy", "Google", "YouTube", "KAIST"];
  var POS = { DGIST: { x: 560, y: 75 }, Wiki: { x: 330, y: 135 }, YouTube: { x: 670, y: 225 }, KAIST: { x: 480, y: 310 }, Puppy: { x: 240, y: 270 }, Google: { x: 90, y: 318 } };
  var SCC_C = [[C.redL, C.red], [C.blueL, C.blue], [C.greenL, C.green], [C.purL, C.pur], [C.orL, C.or], ["#eee", "#555"]];
  var EX = {
    slide: { label: "슬라이드 순서 (DGIST 부터, p.15–27)", order: ["DGIST", "Wiki", "Puppy", "Google", "YouTube", "KAIST"] },
    google: { label: "다른 시작 순서 (Google, YouTube, KAIST, …)", order: ["Google", "YouTube", "KAIST", "DGIST", "Wiki", "Puppy"] }
  };

  global.SIMS["scc_two_pass"] = {
    title: "SCC 알고리즘 — DFS 두 번 (L10 p.12, 예제 p.13–47)",
    desc: "L10 p.12–47. [[SCC 알고리즘]]: ① 아무 데서나 DFS 해서 finish 시각을 기록 → ② 모든 간선을 뒤집어 [[G^T]] → ③ '''finish 가 큰 정점부터''' $G^T$ 에서 DFS. " +
      "$G^T$ 에서는 finish 가 가장 큰 [[strongly connected component|SCC]] 가 [[sink SCC와 source SCC|sink]] 가 되어 DFS 가 그 덩어리 밖으로 못 나가므로, 2차 DFS forest 의 tree 하나하나가 정확히 SCC 하나다([[SCC finish time 보조정리]]). " +
      "그래프(DGIST·Wiki·YouTube·KAIST·Puppy·Google)는 슬라이드 그림에서 복원. 시각은 0 부터, L9 p.67 코드 규약(자식에서 돌아오면 +1, 다음 tree 는 finish+1 에서 시작).",
    options: [
      { key: "ex", label: "1차 시작 순서", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.slide;
      var steps = [];
      var status = {}, st = {}, fi = {}, parent = {}, comp = {};
      var phase = "1차 DFS", t = 0, cu = "-", cv = "-", hot = null, stack = [], reversed = false, sccs = [], curScc = [];
      var adj = G;
      var order2 = "-";

      function finStr() { return IDS.filter(function (v) { return fi[v] !== undefined; }).map(function (v) { return v + ":" + st[v] + "/" + fi[v]; }).join(", ") || "-"; }
      function draw(msg, msgColor) {
        var node = {}, tag = {}, es = [], label = {};
        IDS.forEach(function (v) {
          label[v] = v;
          if (reversed) {
            if (comp[v] !== undefined) { var cc = SCC_C[comp[v] % SCC_C.length]; node[v] = { fill: cc[0], stroke: cc[1], sw: status[v] === "in_progress" ? 3.5 : 2.5 }; }
            else node[v] = { fill: "#fff", stroke: C.muted };
          } else {
            var s = status[v];
            node[v] = !s || s === "unvisited" ? { fill: "#fff", stroke: C.muted } : s === "in_progress" ? { fill: C.orL, stroke: C.or, sw: 2.5 } : { fill: C.greenL, stroke: C.green, sw: 2.5 };
          }
          if (v === cu) node[v].sw = 4.5;
          if (st[v] !== undefined) tag[v] = { t: (reversed ? "f:" + fi[v] : "s:" + st[v] + (fi[v] !== undefined ? " f:" + fi[v] : "")), c: reversed ? C.pur : fi[v] !== undefined ? C.green : C.or, up: v === "DGIST" || v === "YouTube" || v === "Google" };
        });
        IDS.forEach(function (a) {
          G[a].forEach(function (b) {
            var u = reversed ? b : a, w = reversed ? a : b;
            var both = G[b].indexOf(a) >= 0;
            var isHot = hot && hot[0] === u && hot[1] === w;
            var tree = parent[w] === u;
            es.push({ u: u, v: w, arrow: "end", off: both ? 5 : 0, color: isHot ? C.or : tree ? (reversed ? SCC_C[comp[w] % SCC_C.length][1] : C.red) : C.edge, width: isHot || tree ? 3.5 : 1.8 });
          });
        });
        var extra = '<text x="12" y="20" font-size="13" font-weight="700" fill="' + (reversed ? C.blue : C.pur) + '">' + esc(phase) + (reversed ? " — 간선이 뒤집힌 G^T" : " — 원래 그래프 G") + '</text>' +
          '<text x="748" y="20" font-size="12.5" text-anchor="end" font-weight="700" fill="' + C.or + '">' + (reversed ? "" : "cur_time = " + t) + '</text>' +
          '<text x="12" y="40" font-size="12" fill="#333">호출 스택: ' + (stack.length ? esc(stack.map(function (x) { return "dfs(" + x + ")"; }).join(" → ")) : "(비어 있음)") + '</text>';
        var y = 382;
        if (sccs.length) {
          var xx = 12;
          extra += '<text x="12" y="' + (y - 16) + '" font-size="12" font-weight="700" fill="' + C.pur + '">2차 DFS forest 의 tree = SCC:</text>';
          sccs.forEach(function (s, i) {
            var cc = SCC_C[i % SCC_C.length], txt = "{" + s.join(", ") + "}", w = txt.length * 7.2 + 12;
            extra += '<rect x="' + xx + '" y="' + (y - 7) + '" width="' + r1(w) + '" height="20" rx="4" fill="' + cc[0] + '" stroke="' + cc[1] + '"/>' +
              '<text x="' + (xx + 6) + '" y="' + (y + 7) + '" font-size="12" font-weight="700" fill="#222">' + esc(txt) + '</text>';
            xx += w + 8;
          });
        }
        if (msg) extra += '<text x="748" y="' + (y + 7) + '" font-size="12.5" text-anchor="end" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        return graphSvg("scc", { w: 760, h: 400, pos: POS, label: label, edges: es, node: node, tag: tag, extra: extra });
      }
      function snap(desc, pa, pd, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { A: pa, D: pd },
          vars: { phase: phase, cur_time: reversed ? "-" : t, u: cu, v: cv, stack: stack.slice(), finish: finStr(), order2: order2,
            cur_tree: curScc.length ? curScc.slice() : "-", sccs: sccs.length ? sccs.map(function (s) { return "{" + s.join(",") + "}"; }) : "-" },
          note: note, svg: draw(msg, msgColor)
        });
      }

      // ---- 1차 DFS ----
      function dfs1(u) {
        stack.push(u); cu = u; cv = "-"; hot = null;
        st[u] = t; t += 1; status[u] = "in_progress";
        snap("`dfs(" + u + ", " + st[u] + ")`: " + u + ".start = " + st[u] + ", cur_time → " + t + ", in_progress.", 3, 2);
        adj[u].forEach(function (v) {
          cu = u; cv = v; hot = [u, v];
          if (status[v] === "unvisited") {
            parent[v] = u;
            snap(u + " → " + v + ": " + v + " 는 unvisited → 재귀 `dfs(" + v + ", " + t + ")`.", 3, 7);
            dfs1(v);
            cu = u; cv = v; hot = [u, v]; t += 1;
            snap("dfs(" + v + ") 가 " + (t - 1) + " 를 돌려줌 → `cur_time += 1` = " + t + ".", 3, 8);
          } else {
            snap(u + " → " + v + ": " + v + " 는 이미 " + status[v] + " → 건너뜀.", 3, 6);
          }
        });
        cu = u; cv = "-"; hot = null;
        fi[u] = t; status[u] = "done";
        snap("'''" + u + ".finish = " + t + "''' (done). `return " + t + "`.", 3, 9);
        stack.pop();
      }
      IDS.forEach(function (v) { status[v] = "unvisited"; });
      snap("① '''1차 DFS''' — 시작 정점은 아무거나(이 옵션: " + ex.order.join(", ") + " 순으로 아직 unvisited 인 정점에서 시작). finish 시각을 기록하는 것이 목적이다.", 1, null);
      var first = true;
      ex.order.forEach(function (s) {
        if (status[s] !== "unvisited") return;
        if (!first) { t += 1; cu = s; snap("DFS tree 하나가 끝났지만 unvisited 정점이 남았다 → '''" + s + "''' 에서 새 DFS tree 시작 (cur_time = " + t + "). \"Repeat until done.\"", 2, null); }
        first = false;
        dfs1(s);
      });
      cu = "-"; cv = "-"; hot = null;
      order2 = IDS.slice().sort(function (a, b) { return fi[b] - fi[a]; });
      snap("1차 DFS 끝. finish: " + finStr() + ". finish 내림차순 = '''" + order2.join(", ") + "'''.", 3, null,
        ex === EX.slide ? "슬라이드 그림(p.27)은 YouTube 7/8, Wiki 9, DGIST 10, KAIST 11/12 로 적혀 있다 — Puppy 가 5 에 끝난 뒤 Wiki 에서 cur_time += 1 = 6 인데 6 을 건너뛴 것. p.67 코드대로 세면 YouTube 6/7, Wiki 8, DGIST 9, KAIST 10/11. finish 의 '''순서'''는 똑같으므로 SCC 결과는 같다." : null);

      // ---- 간선 뒤집기 ----
      reversed = true; phase = "간선 뒤집기";
      IDS.forEach(function (v) { status[v] = "unvisited"; parent[v] = undefined; });
      snap("② '''Reverse all the edges''' → [[G^T]]. 같은 SCC 안의 정점들은 뒤집어도 서로 오갈 수 있다(SCC 는 그대로). 바뀌는 것은 SCC 사이 간선의 방향뿐 — finish 가 가장 큰 SCC 가 이제 '''나가는 간선이 없는''' sink 가 된다.", 4, null);

      // ---- 2차 DFS ----
      var GT = {};
      IDS.forEach(function (v) { GT[v] = []; });
      IDS.forEach(function (u) { G[u].forEach(function (v) { GT[v].push(u); }); });
      IDS.forEach(function (v) { GT[v].sort(function (a, b) { return fi[b] - fi[a]; }); });
      phase = "2차 DFS";
      function dfs2(u, k) {
        stack.push(u); cu = u; cv = "-"; hot = null;
        status[u] = "in_progress"; comp[u] = k; curScc.push(u);
        snap("G^T 에서 `dfs(" + u + ")` — " + u + " 를 현재 tree(SCC #" + (k + 1) + ")에 넣는다.", 5, 2);
        GT[u].forEach(function (v) {
          cu = u; cv = v; hot = [u, v];
          if (status[v] === "unvisited") {
            parent[v] = u;
            snap("G^T 간선 " + u + " → " + v + " (원래 " + v + " → " + u + "): " + v + " 는 unvisited → 내려간다.", 5, 7);
            dfs2(v, k);
            cu = u; cv = v; hot = [u, v];
          } else {
            snap("G^T 간선 " + u + " → " + v + ": " + v + " 는 이미 " + (comp[v] === k ? "이 tree 에 있음" : "'''앞의 SCC #" + (comp[v] + 1) + " 에 속함'''") + " → 건너뜀" +
              (comp[v] !== k ? " (먼저 끝난 SCC 로 새어 나가지 못하는 이유)." : "."), 5, 6);
          }
        });
        cu = u; cv = "-"; hot = null; status[u] = "done";
        snap(u + " 의 G^T 이웃을 다 봤다 → done.", 5, 10);
        stack.pop();
      }
      var k = 0;
      order2.forEach(function (s) {
        if (status[s] !== "unvisited") return;
        cu = s; curScc = [];
        snap("③ finish 내림차순 [" + order2.join(", ") + "] 에서 아직 unvisited 인 첫 정점 = '''" + s + "''' (finish " + fi[s] + ") → 여기서 새 DFS tree 시작.", 6, null);
        dfs2(s, k);
        sccs.push(curScc.slice());
        snap("tree 완성: '''{" + curScc.join(", ") + "}''' — 이것이 SCC #" + (k + 1) + ". (\"This is one DFS tree in the DFS forest!\")", 8, null, null,
          "SCC #" + (k + 1) + " = {" + curScc.join(", ") + "}", SCC_C[k % SCC_C.length][1]);
        k += 1; curScc = [];
      });
      phase = "완료"; cu = "-"; cv = "-"; hot = null;
      snap("④ 2차 DFS forest 의 tree " + sccs.length + "개 = SCC " + sccs.length + "개: " + sccs.map(function (s) { return "{" + s.join(", ") + "}"; }).join(", ") +
        ". DFS 두 번 + 간선 뒤집기 = [[O(n+m)]].", 8, null,
        "2차 DFS 를 finish '''오름차순'''(작은 것부터)으로 하면 sink 가 아니라 source 에서 시작해 여러 SCC 를 한 tree 로 삼켜 버린다 — 반드시 finish 내림차순.",
        "SCC " + sccs.length + "개", C.green);

      return {
        panels: [
          { id: "A", title: "SCC 알고리즘 (L10 p.12)", lang: "txt", lines: ALG },
          { id: "D", title: "dfs (L9 p.67 코드)", lang: "c", lines: DFS }
        ],
        vars: [
          { name: "phase", label: "단계", group: "단계" },
          { name: "cur_time", group: "1차 DFS" },
          { name: "u", label: "u", group: "현재" },
          { name: "v", label: "v (이웃)", group: "현재" },
          { name: "stack", label: "호출 스택", group: "현재" },
          { name: "finish", label: "start/finish (1차)", group: "1차 DFS" },
          { name: "order2", label: "2차 순서 (finish 내림차순)", group: "2차 DFS" },
          { name: "cur_tree", label: "지금 tree", group: "2차 DFS" },
          { name: "sccs", label: "찾은 SCC", group: "2차 DFS" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
