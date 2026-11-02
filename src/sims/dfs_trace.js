// dfs_trace — L9 p.67 의 dfs(u, cur_time) 코드를 한 줄씩. 정점 색(unvisited / in_progress / done), 호출 스택, start/finish 시각(0 부터).
//
// 그래프는 슬라이드 PNG 를 보고 복원했다 (인접 리스트 순서 = 슬라이드 애니메이션이 간 순서).
//  lab : L9 p.23–38 미로 애니메이션 = p.49 "DFS tree" 의 A–G 그래프 (무방향, 간선 9개).
//        A:[B,E] B:[A,C,D,F] C:[B,G,D] D:[B,C,G] E:[A] F:[B,G] G:[C,F,D]
//        (p.49 DFS tree A→B→C→G→{F,D}, A→E 와 미로 그림의 방문 순서가 이 순서를 정한다)
//  topo: L9 p.68–75 DAG A→C, C→D, C→B, D→B (슬라이드 Start/Leave 값 그대로 나옴)
//  pkg : L9 p.59 패키지 DAG dpkg→{libbz2, tar, coreutils, multiarch}, coreutils→{libbz2, libselinux1},
//        libbz2→libselinux1, libselinux1→multiarch (슬라이드 start/finish 값 그대로 나옴)
//
// 기대 최종값 (src/sims/_check_final.py → _check_final.txt):
//  lab : A 0/13, B 1/10, C 2/9, G 3/8, F 4/5, D 6/7, E 11/12 · finish 내림차순 A E B C G D F
//  topo: A 0/7, C 1/6, D 2/5, B 3/4 · topological order A C D B (p.75 "Do them in this order")
//  pkg : dpkg 0/11, libbz2 1/6, libselinux1 2/5, multiarch 3/4, tar 7/8, coreutils 9/10
//        · topological order dpkg coreutils tar libbz2 libselinux1 multiarch (p.65 목록과 같음)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "reversed_topological_list = []",
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
    "    reversed_topological_list.append(u)",
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

  // ---------- 예제 ----------
  var EX = {
    lab: {
      label: "미로 그래프 A–G (L9 p.23–38, p.49 · 무방향)", directed: false, start: "A", h: 380,
      adj: { A: ["B", "E"], B: ["A", "C", "D", "F"], C: ["B", "G", "D"], D: ["B", "C", "G"], E: ["A"], F: ["B", "G"], G: ["C", "F", "D"] },
      pos: { A: { x: 110, y: 160 }, D: { x: 240, y: 70 }, E: { x: 400, y: 75 }, F: { x: 500, y: 150 }, B: { x: 310, y: 215 }, G: { x: 440, y: 275 }, C: { x: 150, y: 300 } },
      up: { D: 1, E: 1, F: 1 }
    },
    topo: {
      label: "topological sort DAG A–D (L9 p.68–75)", directed: true, start: "A", h: 360, topo: true,
      adj: { A: ["C"], B: [], C: ["D", "B"], D: ["B"] },
      pos: { B: { x: 360, y: 70 }, A: { x: 140, y: 165 }, C: { x: 380, y: 210 }, D: { x: 190, y: 290 } },
      up: { B: 1 }
    },
    pkg: {
      label: "패키지 의존 DAG (L9 p.59 · dpkg 에서 시작)", directed: true, start: "dpkg", h: 360, topo: true,
      adj: { dpkg: ["libbz2", "tar", "coreutils", "multiarch"], libbz2: ["libselinux1"], libselinux1: ["multiarch"], multiarch: [], tar: [], coreutils: ["libbz2", "libselinux1"] },
      pos: { coreutils: { x: 300, y: 85 }, tar: { x: 95, y: 150 }, multiarch: { x: 640, y: 110 }, dpkg: { x: 440, y: 185 }, libbz2: { x: 150, y: 285 }, libselinux1: { x: 620, y: 280 } },
      up: { coreutils: 1, multiarch: 1, tar: 1 }
    }
  };

  global.SIMS["dfs_trace"] = {
    title: "DFS — start/finish 시각과 세 가지 색 (L9 p.67 코드)",
    desc: "L9 p.23–75. [[DFS]] 를 슬라이드 코드 그대로 한 줄씩 돌린다. 정점은 '''unvisited(흰색) → in_progress(주황) → done(초록)''' 으로 바뀌고, " +
      "[[start time과 finish time]] 은 '''슬라이드 규약대로 0 부터''' 센다(자식에서 돌아올 때마다 `cur_time += 1`). 빨간 선이 [[DFS tree와 DFS forest|DFS tree]] 간선이다. " +
      "DAG 예제(topo · pkg)는 done 이 되는 순서대로 `reversed_topological_list` 에 붙고, 그것을 뒤집은 것(= finish 내림차순)이 [[topological sort]] 결과다. " +
      "그래프는 슬라이드 그림에서 복원했고, 인접 리스트 순서는 슬라이드 애니메이션이 간 순서에 맞췄다.",
    options: [
      { key: "ex", label: "예제", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.lab;
      var ids = Object.keys(ex.adj);
      var status = {}, st = {}, fi = {}, parent = {};
      ids.forEach(function (v) { status[v] = "unvisited"; });
      var stack = [], list = [], t = 0, cu = "-", cv = "-", hot = null;
      var steps = [];

      var edges = [];
      ids.forEach(function (u) {
        ex.adj[u].forEach(function (v) {
          if (!ex.directed && ids.indexOf(v) < ids.indexOf(u) && ex.adj[v].indexOf(u) >= 0) return;
          edges.push({ u: u, v: v });
        });
      });

      function times(map) {
        return ids.filter(function (v) { return map[v] !== undefined; })
          .sort(function (a, b) { return st[a] - st[b]; })
          .map(function (v) { return v + ":" + map[v]; }).join(", ") || "-";
      }
      function draw(msg, msgColor) {
        var node = {}, tag = {};
        ids.forEach(function (v) {
          var s = status[v];
          node[v] = s === "unvisited" ? { fill: "#fff", stroke: C.muted } :
            s === "in_progress" ? { fill: C.orL, stroke: C.or, sw: 2.5 } : { fill: C.greenL, stroke: C.green, sw: 2.5 };
          if (v === cu) node[v].sw = 4.5;
          if (st[v] !== undefined) tag[v] = { t: "s:" + st[v] + (fi[v] !== undefined ? " f:" + fi[v] : ""), c: fi[v] !== undefined ? C.green : C.or, up: !!ex.up[v] };
        });
        var es = edges.map(function (e) {
          var tree = parent[e.v] === e.u || (!ex.directed && parent[e.u] === e.v);
          var isHot = hot && ((hot[0] === e.u && hot[1] === e.v) || (!ex.directed && hot[0] === e.v && hot[1] === e.u));
          return { u: e.u, v: e.v, arrow: ex.directed ? "end" : "none", color: isHot ? C.or : tree ? C.red : C.edge, width: isHot || tree ? 4 : 2, dash: isHot && !tree };
        });
        var H = ex.h;
        var extra = '<text x="12" y="20" font-size="12.5" font-weight="700" fill="' + C.pur + '">호출 스택: ' +
          (stack.length ? esc(stack.map(function (x) { return "dfs(" + x + ")"; }).join(" → ")) : "(비어 있음)") + '</text>' +
          '<text x="748" y="20" font-size="12.5" text-anchor="end" font-weight="700" fill="' + C.or + '">cur_time = ' + t + '</text>' +
          legend(632, 40, [["#fff", C.muted, "unvisited"], [C.orL, C.or, "in_progress"], [C.greenL, C.green, "done"]]) +
          '<text x="12" y="' + (H - 30) + '" font-size="12" fill="#333">reversed_topological_list = [' + esc(list.join(", ")) + ']</text>';
        if (ex.topo) extra += '<text x="12" y="' + (H - 12) + '" font-size="12.5" font-weight="700" fill="' + C.green + '">뒤집으면(finish 내림차순) → [' + esc(list.slice().reverse().join(", ")) + ']</text>';
        if (msg) extra += '<text x="748" y="' + (H - 12) + '" font-size="12.5" text-anchor="end" font-weight="700" fill="' + (msgColor || C.pur) + '">' + esc(msg) + '</text>';
        var label = {}; ids.forEach(function (v) { label[v] = v; });
        return graphSvg("dfs", { w: 760, h: H, pos: ex.pos, label: label, edges: es, node: node, tag: tag, extra: extra });
      }
      function snap(desc, line, note, msg, msgColor) {
        steps.push({
          desc: desc, pc: { D: line },
          vars: { cur_time: t, u: cu, v: cv, stack: stack.slice(), start_time: times(st), end_time: times(fi), rev_list: list.slice(),
            topo: ex.topo ? list.slice().reverse() : "-" },
          note: note, svg: draw(msg, msgColor)
        });
      }

      snap("시작: 모든 정점이 '''unvisited'''. `reversed_topological_list = []`, cur_time = 0 으로 `dfs(" + ex.start + ", 0)` 을 부른다.", 1);

      function dfs(u) {
        stack.push(u); cu = u; cv = "-"; hot = null;
        st[u] = t;
        snap("`dfs(" + u + ", " + t + ")` 진입. `u.start_time = cur_time` → '''" + u + ".start = " + t + "'''.", 3);
        t += 1; status[u] = "in_progress";
        snap("`cur_time += 1` → " + t + ". `u.status = \"in_progress\"` — " + u + " 는 주황(들어갔지만 아직 다 못 봄).", 5);
        ex.adj[u].forEach(function (v) {
          cu = u; cv = v; hot = [u, v];
          if (status[v] === "unvisited") {
            snap("`for v in " + u + ".neighbors` → v = " + v + ". " + v + " 는 '''unvisited''' → 내려간다.", 7);
            parent[v] = u;
            snap("`cur_time = dfs(" + v + ", " + t + ")` — 재귀 호출(간선 " + u + "–" + v + " 가 DFS tree 간선이 된다).", 8);
            dfs(v);
            cu = u; cv = v; hot = [u, v];
            t += 1;
            snap("dfs(" + v + ") 가 " + (t - 1) + " 을 돌려줬다(= " + v + ".finish). 돌아와서 `cur_time += 1` → " + t + ".", 9);
          } else {
            snap("`for v in " + u + ".neighbors` → v = " + v + ". 이미 '''" + status[v] + "''' → 건너뜀" +
              (status[v] === "in_progress" && !ex.directed ? " (" + v + " 는 아직 스택 위에 있는 조상)." : "."), 7);
          }
        });
        cu = u; cv = "-"; hot = null;
        fi[u] = t;
        snap("이웃을 다 봤다. `u.end_time = cur_time` → '''" + u + ".finish = " + t + "'''.", 10);
        status[u] = "done"; list.push(u);
        snap("`u.status = \"done\"` (초록) 그리고 `reversed_topological_list.append(" + u + ")` — done 이 된 순서대로 뒤에 붙는다.", 12);
        snap("`return cur_time` → " + t + " 를 호출한 쪽으로 돌려준다.", 13);
        stack.pop();
      }
      dfs(ex.start);
      cu = "-"; cv = "-"; hot = null;

      var summary = ids.slice().sort(function (a, b) { return st[a] - st[b]; }).map(function (v) { return v + " " + st[v] + "/" + fi[v]; }).join(", ");
      if (ex.topo) {
        snap("완료: start/finish = " + summary + ". 리스트를 뒤집은 '''" + list.slice().reverse().join(" → ") + "''' 가 [[topological ordering]] — 모든 화살표 A→B 에서 A.finish > B.finish 이므로 왼→오 방향과 일치한다.",
          13, "start 시각 순서로 줄 세우면 틀릴 수 있다 — topological sort 는 반드시 finish 내림차순.", "finish 내림차순 = topological order", C.green);
      } else {
        snap("완료: start/finish = " + summary + ". 각 정점은 한 번씩, 각 간선은 양 끝에서 한 번씩(≤ 2번) 본다 → [[O(n+m)]]. 빨간 선 = DFS tree (p.49 의 A→B→C→G→{F, D}, A→E).",
          13, "괄호 정리: 구간 [start, finish] 는 중첩되거나 서로소다 — 예) B [1,10] ⊃ C [2,9] ⊃ G [3,8] ⊃ F [4,5], D [6,7]; E [11,12] 는 B 와 서로소.", "모든 정점 done", C.green);
      }

      return {
        panels: [{ id: "D", title: "dfs (L9 p.67 · Topological Ordering)", lang: "c", lines: CODE }],
        vars: [
          { name: "cur_time", group: "시각" },
          { name: "u", label: "u (현재 정점)", group: "현재" },
          { name: "v", label: "v (보는 이웃)", group: "현재" },
          { name: "stack", label: "호출 스택", group: "현재" },
          { name: "start_time", label: "start_time", group: "기록" },
          { name: "end_time", label: "end_time (finish)", group: "기록" },
          { name: "rev_list", label: "reversed_topological_list", group: "리스트" },
          { name: "topo", label: "뒤집은 것 (topological order)", group: "리스트" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
