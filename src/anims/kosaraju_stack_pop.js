// ============================================================
// kosaraju_stack_pop — Kosaraju: 1차 DFS 에서 finish 순서로 스택에 쌓고 → 간선을 뒤집고 → 스택 맨 위부터 꺼내 G^T 에서 DFS
// 그래프: CLRS 그림 22.9 (h→h self-loop 제외)
//   a→b, b→c, b→e, b→f, c→d, c→g, d→c, d→h, e→a, e→f, f→g, g→f, g→h   (이웃 알파벳 순, a 부터)
// 검산 (src/sims/kosaraju_stack.js 와 같은 값):
//   1차 방문 a b c d h | finish h d, 방문 g f | finish f g c, 방문 e | finish e b a
//   스택(아래→위) = h d f g c e b a
//   G^T: a:[e] b:[a] c:[b,d] d:[c] e:[b] f:[b,e,g] g:[c,f] h:[d,g]
//   pop a → {a,e,b} · b,e skip · pop c → {c,d} · pop g → {g,f} · f,d skip · pop h → {h}
// 시간축(초): 0.8–7.5 1차 DFS (사건 16개 × 0.42) → 8.0–9.2 간선 뒤집기 → 9.6–16.8 꺼내기 → 17–20 정리
// 사건 시각은 build() 안에서 그래프를 실제로 DFS 해서 계산한다 (손으로 적은 시각 없음).
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["kosaraju_stack_pop"] = {
  title: "Kosaraju — finish 스택 쌓기 → 뒤집기 → 위에서부터 꺼내기 (20초)",
  desc: "[[Kosaraju 알고리즘]] = L10 [[SCC 알고리즘]]. ① 1차 DFS 에서 정점이 '''finish 하는 순간''' 스택에 쌓는다 → ② 간선을 전부 뒤집어 [[G^T]] → ③ 스택 '''맨 위'''(finish 최대)부터 꺼내며, 아직 안 본 정점이면 $G^T$ 에서 DFS 를 열어 닿는 정점을 한 색으로 칠한다. 한 번 칠한 덩어리가 SCC 하나다. 그래프는 CLRS 그림 22.9.",
  duration: 20,
  build: function () {
    var D = 20;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222", line: "#b9c4d8", edge: "#8aa6c8" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function r1(v) { return Math.round(v * 10) / 10; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function kf(pts) {
      var ks = [], vs = [];
      if (pts[0][0] > 0) { ks.push(0); vs.push(pts[0][1]); }
      pts.forEach(function (p) { ks.push(r4(p[0] / D)); vs.push(p[1]); });
      if (pts[pts.length - 1][0] < D) { ks.push(1); vs.push(pts[pts.length - 1][1]); }
      return 'values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function anim(attr, pts) { return '<animate attributeName="' + attr + '" ' + kf(pts) + '/>'; }
    function step(attr, pts) { return '<animate attributeName="' + attr + '" calcMode="discrete" ' + kf(pts) + '/>'; }

    var G = { a: ["b"], b: ["c", "e", "f"], c: ["d", "g"], d: ["c", "h"], e: ["a", "f"], f: ["g"], g: ["f", "h"], h: [] };
    var IDS = Object.keys(G).sort();
    var P = { a: [70, 110], b: [215, 110], c: [360, 110], d: [505, 110], e: [70, 270], f: [215, 270], g: [360, 270], h: [505, 270] };
    var SC = [[C.red, C.redL], [C.blue, C.blueL], [C.green, C.greenL], [C.or, C.orL]];
    var R = 19;

    // ---- 1차 DFS: 사건 시각 계산 ----
    var ev = [], seen = {}, order = [];
    function dfs1(u) { seen[u] = 1; ev.push(["v", u]); G[u].forEach(function (v) { if (!seen[v]) dfs1(v); }); order.push(u); ev.push(["f", u]); }
    IDS.forEach(function (u) { if (!seen[u]) dfs1(u); });
    var T1 = {}, TF = {};
    ev.forEach(function (e, k) { var t = r4(0.8 + 0.42 * k); if (e[0] === "v") T1[e[1]] = t; else TF[e[1]] = t; });
    var END1 = 0.8 + 0.42 * ev.length;
    var FLIP0 = 8.0, FLIP1 = 9.2;
    // ---- G^T, 2차 DFS: 사건 시각 계산 ----
    var GT = {}; IDS.forEach(function (v) { GT[v] = []; });
    IDS.forEach(function (u) { G[u].forEach(function (v) { GT[v].push(u); }); });
    var seen2 = {}, TC = {}, KC = {}, pops = [], t = 9.6, k = 0, comps = [];
    function dfs2(u) { seen2[u] = 1; TC[u] = r4(t); KC[u] = k; comps[k].push(u); t += 0.4; GT[u].forEach(function (v) { if (!seen2[v]) dfs2(v); }); }
    for (var i = order.length - 1; i >= 0; i--) {
      var s = order[i], fresh = !seen2[s];
      pops.push({ i: i, v: s, t: r4(t), fresh: fresh, k: k });
      t += 0.5;
      if (fresh) { comps[k] = []; dfs2(s); k += 1; }
    }
    var END3 = t; // ≈ 16.8

    var o = '<svg viewBox="0 0 760 400" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">';
    o += '<defs><marker id="ksp_a" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.edge + '"/></marker>' +
      '<marker id="ksp_b" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.blue + '"/></marker></defs>';
    o += '<rect width="760" height="400" fill="#fff"/>';
    // 제목 (단계별)
    o += vis(0, FLIP0, txt(12, 24, "① 1차 DFS (G) — finish 하는 순간 스택에 push", 14, C.pur, ' text-anchor="start" font-weight="700"'));
    o += vis(FLIP0, 9.6, txt(12, 24, "② 간선을 전부 뒤집는다 → G^T", 14, C.blue, ' text-anchor="start" font-weight="700"'));
    o += vis(9.6, 17, txt(12, 24, "③ 스택 맨 위부터 pop → 안 본 정점이면 G^T 에서 DFS, 닿는 곳 = SCC", 14, C.blue, ' text-anchor="start" font-weight="700"'));
    o += vis(17, D, txt(12, 24, "④ 칠해진 덩어리 하나 = SCC 하나 (4개)", 14, C.green, ' text-anchor="start" font-weight="700"'));

    // ---- 간선: G (뒤집기 전) / G^T (뒤집은 뒤) ----
    function line(a, b, off, col, mk, w) {
      var x1 = P[a][0], y1 = P[a][1], x2 = P[b][0], y2 = P[b][1], dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / L, uy = dy / L, nx = -uy * off, ny = ux * off;
      return '<line x1="' + r1(x1 + ux * R + nx) + '" y1="' + r1(y1 + uy * R + ny) + '" x2="' + r1(x2 - ux * R + nx) + '" y2="' + r1(y2 - uy * R + ny) + '" stroke="' + col + '" stroke-width="' + (w || 2) + '" marker-end="url(#' + mk + ')"/>';
    }
    var eG = "", eT = "";
    IDS.forEach(function (a) {
      G[a].forEach(function (b) {
        var both = G[b].indexOf(a) >= 0, off = both ? 5 : 0;
        eG += line(a, b, off, C.edge, "ksp_a");
        eT += line(b, a, off, C.blue, "ksp_b");
      });
    });
    o += '<g>' + eG + anim("opacity", [[0, 1], [FLIP0, 1], [FLIP0 + 0.6, 0]]) + '</g>';
    o += '<g opacity="0">' + eT + anim("opacity", [[0, 0], [FLIP0 + 0.5, 0], [FLIP1, 1]]) + '</g>';
    o += vis(FLIP0 + 0.3, 9.6, txt(290, 195, "모든 화살표 방향 반대로 (SCC 안은 그대로 서로 닿음)", 12.5, C.blue, ' font-weight="700"'));

    // ---- 정점 ----
    IDS.forEach(function (v) {
      var p = P[v], sc = SC[KC[v] % SC.length];
      o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + R + '" fill="#fff" stroke="' + C.muted + '" stroke-width="2">' +
        step("fill", [[0, "#fff"], [T1[v], C.orL], [TF[v], C.greenL], [FLIP0, "#fff"], [TC[v], sc[1]]]) +
        step("stroke", [[0, C.muted], [T1[v], C.or], [TF[v], C.green], [FLIP0, C.muted], [TC[v], sc[0]]]) +
        step("stroke-width", [[0, 2], [T1[v], 3], [FLIP0, 2], [TC[v], 3.5]]) + '</circle>';
      o += txt(p[0], p[1] + 5, v, 15, C.ink, ' font-weight="700"');
      var ly = p[1] < 200 ? p[1] - 26 : p[1] + 36;
      o += vis(TF[v], D, txt(p[0], ly, "finish #" + (order.indexOf(v) + 1), 11, C.green, ' font-weight="700"'));
    });
    // 1차: 지금 방문 중 표시
    o += vis(0.8, END1, txt(290, 345, "주황 = 방문 중 · 초록 = finish (스택에 들어감)", 12, C.muted, ' font-weight="700"'));

    // ---- 스택 ----
    var SX = 600, SW = 120, BOT = 352, H = 30;
    o += txt(SX + SW / 2, 60, "order 스택", 13, C.pur, ' font-weight="700"');
    o += '<path d="M' + SX + ',72 L' + SX + ',' + (BOT + 2) + ' L' + (SX + SW) + ',' + (BOT + 2) + ' L' + (SX + SW) + ',72" fill="none" stroke="#999" stroke-width="2"/>';
    order.forEach(function (v, i) {
      var y = BOT - (i + 1) * H, pp = pops.filter(function (q) { return q.i === i; })[0], sc = SC[KC[v] % SC.length];
      var fillPts = [[0, C.greenL]], strokePts = [[0, C.green]];
      if (pp.fresh) { fillPts.push([pp.t, sc[1]]); strokePts.push([pp.t, sc[0]]); }
      else { fillPts.push([pp.t, "#f0f0f0"]); strokePts.push([pp.t, "#bbb"]); }
      o += vis(TF[v], D, '<rect x="' + (SX + 6) + '" y="' + (y + 3) + '" width="' + (SW - 12) + '" height="' + (H - 6) + '" rx="5" stroke-width="2" fill="' + C.greenL + '" stroke="' + C.green + '">' +
        step("fill", fillPts) + step("stroke", strokePts) + '</rect>' +
        txt(SX + 22, y + 20, v, 14, C.ink, ' text-anchor="start" font-weight="700"') + txt(SX + SW - 14, y + 20, "#" + (i + 1), 11, C.muted, ' text-anchor="end"'));
      // pop 순간: 화살표 + 건너뛰기 표시
      o += vis(pp.t, pp.t + 0.5 + (pp.fresh ? 0.4 * comps[pp.k].length : 0), txt(SX - 8, y + 21, "▶ pop", 12.5, C.red, ' text-anchor="end" font-weight="700"'));
      if (!pp.fresh) o += vis(pp.t, D, txt(SX + 62, y + 20, "skip", 11, "#999", ' text-anchor="start" font-style="italic"'));
    });
    o += vis(0.8, 7.6, txt(SX + SW / 2, BOT + 22, "아래부터 쌓임", 11, C.muted));
    o += vis(9.6, D, txt(SX + SW / 2, BOT + 22, "위에서부터 꺼냄", 11, C.red, ' font-weight="700"'));

    // ---- 2차: 갇히는 이유 한 줄 ----
    pops.forEach(function (q) {
      if (!q.fresh) return;
      var cp = comps[q.k], tEnd = q.t + 0.5 + 0.4 * cp.length;
      var msg = q.k === 0 ? "a 에서 G^T 로: e → b → (a 이미 봄) — 밖으로 가는 길이 없음"
        : "G^T 에서 " + q.v + " → 이미 칠한 덩어리로 가는 간선은 skip → {" + cp.join(", ") + "} 에 갇힘";
      o += vis(q.t, tEnd + 0.1, txt(290, 345, msg, 12, SC[q.k % SC.length][0], ' font-weight="700"'));
    });
    // ---- 결과 칩 ----
    var xx = 30;
    comps.forEach(function (cp, i) {
      var label = "{" + cp.join(", ") + "}", w = label.length * 8 + 26, sc = SC[i % SC.length];
      var tc = TC[cp[cp.length - 1]] + 0.4;
      o += vis(tc, D, '<rect x="' + xx + '" y="364" width="' + w + '" height="26" rx="13" fill="' + sc[1] + '" stroke="' + sc[0] + '" stroke-width="2"/>' + txt(xx + w / 2, 382, label, 13, C.ink, ' font-weight="700"'));
      xx += w + 12;
    });
    o += vis(17, D, txt(290, 345, "finish 최대 a 의 SCC 는 G^T 에서 sink → 2차 DFS 가 그 안에 갇힌다", 12, C.green, ' font-weight="700"'));
    o += '</svg>';
    return o;
  }
};
