// cut_from_residual — L17 p.38–40 (⇒ 방향): Gf 에서 s 가 닿는 집합 S 로 cut 을 긋고, 건너는 간선이 꽉 찼거나(S→T) 0 인지(T→S) 확인. 검산 _check_cut.py
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



  // 예제 1: L17 p.38–40 의 그림(s, a, b, t). G 의 flow 는 p.39 왼쪽 그림 그대로:
  //   s→a 4/4, s→b 1/8, a→b 2/6, a→t 2/2, b→t 3/3, 값 5.
  //   (p.39 오른쪽 Gf 의 a–b 두 간선 5·1 은 p.22 의 옛 flow(a→b 1) 값이 남은 것. 지금 f 로 계산하면 a→b 4, b→a 2.)
  //   Gf 에서 s 가 닿는 집합 S = {s, b, a} (s→b 7, b→a 2). cut 간선 a→t 2 + b→t 3 = 5 = flow 값.
  // 예제 2: L17 p.4 그래프 + p.14 의 max flow(값 11). 정점 이름 A–F 는 위키가 붙임.
  //   S = {s, C, F, B}. 앞으로 건너는 간선 s→A 4/4, B→E 3/3, F→t 4/4 (모두 꽉 참) = 11.
  //   거꾸로 건너는 간선(T 쪽 → S 쪽) A→B 0/2, E→F 0/6 은 flow 0.
  //   검산: src/sims/_check_cut.py
  var EX = {
    p39: {
      title: "L17 p.38–40 예제 (s, a, b, t)",
      pos: { s: { x: 50, y: 150 }, a: { x: 220, y: 55 }, b: { x: 220, y: 245 }, t: { x: 390, y: 150 } },
      order: ["s", "a", "b", "t"],
      edges: [["s", "a", 4, 4], ["s", "b", 8, 1], ["a", "b", 6, 2], ["a", "t", 2, 2], ["b", "t", 3, 3]],
      w: 450
    },
    p14: {
      title: "L17 p.4 그래프 + p.14 max flow (A–F 는 위키가 붙인 이름)",
      pos: { s: { x: 40, y: 150 }, A: { x: 190, y: 55 }, B: { x: 190, y: 150 }, C: { x: 190, y: 245 },
        D: { x: 400, y: 55 }, E: { x: 400, y: 150 }, F: { x: 400, y: 245 }, t: { x: 550, y: 150 } },
      order: ["s", "A", "B", "C", "D", "E", "F", "t"],
      edges: [["s", "A", 4, 4], ["s", "B", 2, 2], ["s", "C", 6, 5], ["A", "D", 3, 3], ["A", "B", 2, 0], ["A", "E", 6, 1],
        ["B", "E", 3, 3], ["B", "C", 2, 0], ["D", "E", 6, 0], ["D", "t", 4, 3], ["E", "t", 4, 4], ["E", "F", 6, 0],
        ["F", "B", 3, 1], ["C", "F", 10, 5], ["F", "t", 4, 4]],
      w: 600
    }
  };
  var CODE = [
    "가정: Gf 에서 s → t 경로가 없다.",
    "1. f 로부터 residual graph Gf 를 만든다",
    "     forward  u→v : c(u,v) − f(u,v)   (남은 양)",
    "     backward v→u : f(u,v)            (보낸 양)",
    "2. Gf 에서 s 부터 BFS: 닿는 정점을 S 에 넣는다",
    "3. S = {Gf 에서 s 가 닿는 정점}, T = 나머지 (t ∈ T)",
    "4. S 와 T 사이에 cut 선을 긋는다",
    "5. S→T 로 건너는 원래 간선: f = c (꽉 참)",
    "     아니면 Gf 에 forward 간선이 있어 머리 정점이 S 에 들어왔을 것",
    "6. T→S 로 건너는 원래 간선: f = 0",
    "     아니면 Gf 에 backward 간선이 있어 꼬리 정점이 S 에 들어왔을 것",
    "7. flow 값 = (S→T 의 flow 합) − (T→S 의 flow 합) = Σ c(S→T) − 0 = cut cost",
    "8. value(f) = cost(이 cut) ≥ min cut ≥ max flow ≥ value(f)",
    "     → 모두 같다: f 는 max flow, 이 cut 은 min cut"
  ];

  global.SIMS["cut_from_residual"] = {
    title: "max-flow min-cut 증명 — residual graph 에서 cut 선 긋기 (L17 p.38–40)",
    desc: "L17 p.38–40 의 ⇒ 방향 증명을 한 단계씩. 위 그림은 원래 그래프 G(flow/capacity), 아래 그림은 residual graph Gf 다. " +
      "Gf 에서 s 부터 갈 수 있는 정점을 하나씩 칠해 S 를 만들고, S 와 나머지 T 사이를 가르는 간선들을 하나씩 확인한다. 자세한 설명은 [[max-flow min-cut 증명 (cut 선 긋기)]].",
    options: [
      { key: "ex", label: "예제", values: [
        { value: "p39", label: "p.38–40 그림 (s, a, b, t) — 값 5" },
        { value: "p14", label: "p.4 그래프의 max flow — 값 11, 거꾸로 건너는 간선 있음" }
      ] }
    ],
    build: function (opts) {
      var X = EX[opts.ex] || EX.p39;
      var E = X.edges, V = X.order;
      function capOf(u, v) { for (var i = 0; i < E.length; i++) if (E[i][0] === u && E[i][1] === v) return E[i]; return null; }
      function res(u, v) { var e = capOf(u, v); if (e) return e[2] - e[3]; e = capOf(v, u); if (e) return e[3]; return 0; }
      var value = 0; E.forEach(function (e) { if (e[0] === "s") value += e[3]; });
      var steps = [];
      var showGf = false, S = {}, frontier = null, via = null, showCut = false, focus = null, sumTxt = null;
      function draw(msg, mc) {
        var pos = {}, label = {}, node = {}, es = [], dy = 300;
        V.forEach(function (k) {
          pos[k] = X.pos[k]; label[k] = k;
          if (showGf) { pos[k + "_"] = { x: X.pos[k].x, y: X.pos[k].y + dy }; label[k + "_"] = k; }
          var st;
          if (S[k]) st = { fill: "#f6b26b", stroke: "#c4600f", sw: k === frontier ? 4 : 2.5 };
          else if (showCut) st = { fill: "#cfe0fb", stroke: "#1d4fb3", sw: 2.5 };
          else st = { fill: "#fff", stroke: "#777" };
          if (k === "t" && !S[k] && !showCut) st = { fill: "#5b8def", stroke: "#1d4fb3", tc: "#fff" };
          node[k] = st; if (showGf) node[k + "_"] = st;
        });
        E.forEach(function (e) {
          var u = e[0], v = e[1], c = e[2], f = e[3];
          var cross = showCut && S[u] && !S[v], back = showCut && !S[u] && S[v];
          var isF = focus && focus[0] === u && focus[1] === v;
          var col = isF ? "#e07a10" : cross ? "#d6465f" : back ? "#7b5ea7" : f === c ? "#3b2f4a" : "#1d65b3";
          es.push({ u: u, v: v, arrow: "end", w: f + "/" + c, color: col, width: isF ? 5 : (cross || back) ? 3.5 : 1.8, dash: back && !isF });
          if (showGf) {
            var fw = c - f, bw = f;
            var viaF = via && via[0] === u && via[1] === v, viaB = via && via[0] === v && via[1] === u;
            if (fw > 0) es.push({ u: u + "_", v: v + "_", arrow: "end", w: fw, off: bw > 0 ? -6 : 0, wside: -1, color: viaF ? "#e07a10" : "#1d65b3", width: viaF ? 4.5 : 1.8 });
            if (bw > 0) es.push({ u: v + "_", v: u + "_", arrow: "end", w: bw, off: fw > 0 ? -6 : 0, wside: -1, wc: "#2e7d32", color: viaB ? "#e07a10" : "#43a047", width: viaB ? 4.5 : 1.8 });
          }
        });
        var s = '<text x="8" y="16" font-size="12.5" font-weight="700" fill="#3b2f4a">G: flow / capacity — flow 값 ' + value + '</text>';
        if (showGf) s += '<text x="8" y="' + (dy - 6) + '" font-size="12.5" font-weight="700" fill="#3b2f4a">Gf: 파랑 = 남은 양(forward), 초록 = 보낸 양(backward)</text>';
        // cut 선: 건너는 간선마다 중점에 빨간 점선 가로막대
        if (showCut) {
          E.forEach(function (e) {
            if (!!S[e[0]] === !!S[e[1]]) return;
            var a = X.pos[e[0]], b = X.pos[e[1]], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dyy = b.y - a.y, L = Math.sqrt(dx * dx + dyy * dyy);
            var nx = -dyy / L * 22, ny = dx / L * 22;
            s += '<line x1="' + r1(mx - nx) + '" y1="' + r1(my - ny) + '" x2="' + r1(mx + nx) + '" y2="' + r1(my + ny) + '" stroke="#d6465f" stroke-width="3" stroke-dasharray="5 3"/>';
          });
          s += '<text x="8" y="' + (showGf ? 2 * dy - 20 : dy - 20) + '" font-size="12.5" font-weight="700" fill="#c4600f">S (주황) = {' + V.filter(function (k) { return S[k]; }).join(", ") + '}</text>';
          s += '<text x="8" y="' + (showGf ? 2 * dy - 4 : dy - 4) + '" font-size="12.5" font-weight="700" fill="#1d4fb3">T (파랑) = {' + V.filter(function (k) { return !S[k]; }).join(", ") + '}</text>';
        }
        if (sumTxt) s += '<text x="' + (X.w - 8) + '" y="' + (showGf ? 2 * dy - 4 : dy - 4) + '" text-anchor="end" font-size="13" font-weight="700" fill="#2e9e4f">' + esc(sumTxt) + '</text>';
        if (msg) s += '<text x="' + (X.w - 8) + '" y="16" text-anchor="end" font-size="13" font-weight="700" fill="' + (mc || "#3b2f4a") + '">' + esc(msg) + '</text>';
        return graphSvg("cr", { w: X.w, h: showGf ? 2 * dy : dy, pos: pos, label: label, edges: es, node: node, extra: s });
      }
      function sList() { return "{" + V.filter(function (k) { return S[k]; }).join(", ") + "}"; }
      function snap(desc, line, note, msg, mc) {
        steps.push({ desc: desc, pc: { P: line },
          vars: { S: sList(), frontier: frontier || "-", edge: focus ? focus[0] + "→" + focus[1] + " (" + focus[3] + "/" + focus[2] + ")" : "-", sum: sumTxt || "-" },
          note: note, svg: draw(msg, mc) });
      }
      snap(X.title + ". 지금 flow 의 값은 '''" + value + "''' 이다. 이 flow 가 max flow 인지, 그리고 min cut 이 어디인지 알고 싶다.", 1);
      showGf = true;
      snap("residual graph Gf 를 그린다. 간선마다 forward(남은 양 c − f)와 backward(보낸 양 f)를 따로 그린다. 꽉 찬 간선은 forward 가 없고, flow 가 0 인 간선은 backward 가 없다.", 2,
        opts.ex === "p39" ? "슬라이드 p.39 오른쪽 Gf 의 a–b 사이 값은 5·1 로 적혀 있는데, 왼쪽 그림의 flow(a→b 2)로 계산하면 a→b 4, b→a 2 가 맞다. p.22 의 옛 flow 값이 남은 것으로 보인다. 결론(S = {s,a,b})은 같다." : null);
      // BFS
      var q = ["s"]; S.s = true; frontier = "s";
      snap("Gf 에서 s 부터 BFS 를 시작한다. s 는 당연히 S 에 들어간다.", 5);
      while (q.length) {
        var u = q.shift(); frontier = u;
        for (var i = 0; i < V.length; i++) {
          var v = V[i];
          if (S[v]) continue;
          var r = res(u, v);
          if (r > 0) {
            S[v] = true; q.push(v);
            var fwd = !!capOf(u, v);
            via = [u, v];
            snap("Gf 의 " + (fwd ? "forward" : "'''backward'''") + " 간선 " + u + "→" + v + " (" + r + ") 를 타고 '''" + v + "''' 에 닿는다. S 에 넣는다." +
              (fwd ? "" : " 원래 그래프에는 " + v + "→" + u + " 방향 간선이 있고 거기 flow 가 " + r + " 흐르고 있어서, Gf 에서는 거꾸로 갈 수 있다."), 5,
              fwd ? null : "backward 간선도 길이다. 그래서 '원래 그래프에서 이어져 있나' 가 아니라 'Gf 에서 갈 수 있나' 로 S 를 정한다.");
            via = null;
          }
        }
      }
      frontier = null;
      snap("더 닿는 정점이 없다. t 는 S 에 없다 — Gf 에 s → t 경로가 없다는 가정 그대로다. S = " + sList() + ".", 6, null, "t 에 못 감", "#1d4fb3");
      showCut = true;
      snap("S(주황)와 T(파랑) 사이에 cut 선(빨간 점선)을 긋는다. s ∈ S, t ∈ T 이니 이건 s-t cut 이다.", 7);
      var sumF = 0, list = [];
      E.forEach(function (e) {
        if (S[e[0]] && !S[e[1]]) {
          focus = e; sumF += e[2]; list.push(e[2]);
          snap("S→T 로 건너는 간선 '''" + e[0] + "→" + e[1] + "''' : flow " + e[3] + " / capacity " + e[2] + " — '''꽉 차 있다'''.", 8,
            "왜? 남은 양 c − f 가 0 보다 컸다면 Gf 에 forward 간선 " + e[0] + "→" + e[1] + " 이 있었을 것이고, " + e[0] + " 가 S 에 있으니 BFS 가 " + e[1] + " 까지 갔을 것이다. 그런데 " + e[1] + " 은 T 에 있다. 그러니 c − f = 0.", "f = c", "#d6465f");
        }
      });
      var anyBack = false;
      E.forEach(function (e) {
        if (!S[e[0]] && S[e[1]]) {
          anyBack = true; focus = e;
          snap("T→S 로 거꾸로 건너는 간선 '''" + e[0] + "→" + e[1] + "''' : flow '''" + e[3] + "'''.", 10,
            "왜 0 인가? flow 가 0 보다 컸다면 Gf 에 backward 간선 " + e[1] + "→" + e[0] + " 이 있었을 것이고, " + e[1] + " 이 S 에 있으니 BFS 가 " + e[0] + " 까지 갔을 것이다. 그런데 " + e[0] + " 은 T 에 있다. 그러니 f = 0. 슬라이드는 이 사실을 말로 적지 않았다.", "f = 0", "#7b5ea7");
        }
      });
      focus = null;
      if (!anyBack) snap("T→S 로 거꾸로 건너는 간선은 이 그래프에 없다(t 는 들어오는 간선만 있다). 있었다면 flow 가 0 이어야 한다 — 두 번째 예제에서 확인할 수 있다.", 10);
      sumTxt = "cut cost = " + list.join(" + ") + " = " + sumF + " = flow 값 " + value;
      snap("s 에서 나온 물건은 t 에 가려면 반드시 선을 넘는다. 선을 넘는 순수한 양 = (S→T flow) − (T→S flow) = " + list.join(" + ") + " − 0 = '''" + sumF + "'''. 이게 flow 값이고, 동시에 이 cut 의 cost 다.", 11);
      snap("value(f) = " + value + " = cost(이 cut) ≥ min cut ≥ max flow ≥ value(f). 양 끝이 같으니 전부 같다. 그래서 '''f 는 max flow''' 이고 '''이 cut 은 min cut''' 이다.", 13,
        "Ford-Fulkerson 이 끝난 직후 Gf 에서 s 부터 BFS 한 번만 더 하면 min cut 이 이렇게 바로 나온다.", "max flow = min cut = " + value, "#2e9e4f");
      return {
        panels: [{ id: "P", title: "⇒ 방향 증명 (L17 p.38–40)", lang: "txt", lines: CODE }],
        vars: [
          { name: "S", label: "S (Gf 에서 s 가 닿는 정점)", group: "BFS" },
          { name: "frontier", label: "지금 꺼낸 정점", group: "BFS" },
          { name: "edge", label: "보고 있는 건너는 간선", group: "cut" },
          { name: "sum", label: "합", group: "cut" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
