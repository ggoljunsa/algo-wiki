// ============================================================
// scc_reverse_edges — L10 p.27–48 예제: 간선을 뒤집으면(G^T) finish 최대 SCC 에서 시작한 DFS 가 그 SCC 에 갇힌다
// 그래프 (p.27–28): DGIST→Wiki, Wiki→DGIST, DGIST→강아지, Wiki→강아지, Wiki→YouTube, YouTube→DGIST,
//   YouTube→강아지, KAIST→DGIST, KAIST→강아지, 강아지→Google, Google→강아지
// 검산(Python): 1차 DFS (DGIST 부터) start/finish = DGIST 0/10, Wiki 1/9, 강아지 2/5, Google 3/4, YouTube 7/8, KAIST 11/12 (슬라이드와 같음)
//   SCC = {KAIST}, {DGIST, Wiki, YouTube}, {강아지, Google}; SCC DAG: KAIST → 큰 덩어리 → {강아지, Google}, KAIST → {강아지, Google}
//   G^T 에서 finish 내림차순 DFS: KAIST(12) 단독 → DGIST(10): Wiki, YouTube → 강아지(5): Google  (p.32–48 과 같음)
// (슬라이드 예제는 SCC 3개 — 덩어리 4개짜리 가상 예 대신 슬라이드 그대로 썼다)
// 시간축(초): 0–2.2 finish → 2.2–3.6 SCC DAG → 3.6–4.9 뒤집기 → 4.9 / 6.6 / 9.2 2차 DFS 세 번 → 11.6–14 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["scc_reverse_edges"] = {
  title: "SCC 알고리즘 — 간선을 뒤집고 finish 큰 쪽부터 DFS (14초)",
  desc: "L10 p.27–55. ① DFS 로 finish time → ② 간선을 모두 뒤집어 [[G^T]] → ③ finish 내림차순으로 $G^T$ 에서 DFS. finish 가 가장 큰 SCC 는 원래 그래프의 source SCC 라서, 뒤집으면 나가는 간선이 없는 sink 가 되어 DFS 가 그 안에 갇힌다 — [[SCC 알고리즘]].",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", ink: "#222", line: "#b9c4d8" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
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

    var P = { DGIST: [440, 72], Wiki: [250, 98], YouTube: [556, 152], KAIST: [400, 248], Pup: [190, 214], Google: [72, 280] };
    var NAME = { DGIST: "DGIST", Wiki: "Wiki", YouTube: "YouTube", KAIST: "KAIST", Pup: "강아지", Google: "Google" };
    var FIN = { DGIST: 10, Wiki: 9, YouTube: 8, KAIST: 12, Pup: 5, Google: 4 };
    var SCC = { KAIST: 0, DGIST: 1, Wiki: 1, YouTube: 1, Pup: 2, Google: 2 };
    var SC = [[C.or, C.orL], [C.blue, C.blueL], [C.green, C.greenL]];
    var VT = { KAIST: 5.2, DGIST: 7.0, Wiki: 7.6, YouTube: 8.2, Pup: 10.0, Google: 10.6 };   // 2차 DFS 방문 시각
    var DONE = [5.6, 8.7, 11.0];                                                          // SCC 확정 시각
    var E = [["DGIST", "Wiki"], ["Wiki", "DGIST"], ["DGIST", "Pup"], ["Wiki", "Pup"], ["Wiki", "YouTube"], ["YouTube", "DGIST"],
      ["YouTube", "Pup"], ["KAIST", "DGIST"], ["KAIST", "Pup"], ["Pup", "Google"], ["Google", "Pup"]];
    var TREE2 = { "Wiki>DGIST": 7.6, "YouTube>DGIST": 8.2, "Google>Pup": 10.6 };   // 원래 간선 a>b 가 G^T 에서 b→a tree edge
    var F0 = 3.6, F1 = 4.6;   // 뒤집기 구간

    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SCC 알고리즘 간선 뒤집기 애니메이션">';
    s += '<defs><marker id="scc_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.blue + '"/></marker>' +
      '<marker id="scc_arrow_p" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.pur + '"/></marker></defs>';
    var caps = [
      [0, 2.2, "① 1차 DFS 의 finish time (p.27): KAIST 12, DGIST 10, 강아지 5 …"],
      [2.2, F0, "SCC 로 묶으면 DAG: KAIST → {DGIST, Wiki, YouTube} → {강아지, Google}"],
      [F0, 4.9, "② 모든 간선을 뒤집는다 (G^T) — SCC 사이 간선만 방향이 바뀐 셈"],
      [4.9, 6.6, "③ finish 최대 KAIST(12) 에서 DFS — 나가는 간선이 없다 → SCC #1"],
      [6.6, 9.2, "다음 미방문 최대 DGIST(10): Wiki, YouTube 까지만 → SCC #2"],
      [9.2, 11.6, "다음 미방문 최대 강아지(5): Google — 나머지는 이미 끝 → SCC #3"],
      [11.6, D, "2차 DFS 의 tree 하나 = SCC 하나 — 덩어리 밖으로 새지 않는다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- SCC 덩어리 ----
    var blobs = [
      '<circle cx="400" cy="248" r="46"',
      '<ellipse cx="405" cy="110" rx="202" ry="64" transform="rotate(10 405 110)"',
      '<ellipse cx="130" cy="248" rx="108" ry="36" transform="rotate(-28 130 248)"'
    ];
    blobs.forEach(function (b, i) {
      s += '<g opacity="0">' + show(2.2, D) + b + ' fill="#fff" stroke="' + C.pur + '" stroke-width="2" stroke-dasharray="6 4">' +
        step("fill", [[0, "#fff"], [DONE[i], SC[i][1]]]) + step("stroke", [[0, C.pur], [DONE[i], SC[i][0]]]) + '</' + (i === 0 ? "circle" : "ellipse") + '></g>';
    });

    // ---- 간선 (뒤집기 = 양 끝점이 서로 자리를 바꿈) ----
    function seg(a, b, off) {
      var pa = P[a], pb = P[b], dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / L, uy = dy / L, nx = -uy * off, ny = ux * off;
      function cut() { var rx = 37, ry = 18; return 1 / Math.sqrt((ux * ux) / (rx * rx) + (uy * uy) / (ry * ry)); }
      var k = cut();
      return [Math.round(pa[0] + ux * k + nx), Math.round(pa[1] + uy * k + ny), Math.round(pb[0] - ux * k + nx), Math.round(pb[1] - uy * k + ny)];
    }
    E.forEach(function (e) {
      var a = e[0], b = e[1];
      var bi = E.some(function (f) { return f[0] === b && f[1] === a; });
      var g = seg(a, b, bi ? 5 : 0);
      var inter = SCC[a] !== SCC[b];
      var col = inter ? C.pur : C.blue, w = inter ? 2.8 : 2;
      var tk = TREE2[a + ">" + b];
      s += '<line x1="' + g[0] + '" y1="' + g[1] + '" x2="' + g[2] + '" y2="' + g[3] + '" stroke="' + C.blue + '" stroke-width="2" marker-end="url(#scc_arrow)">' +
        step("stroke", [[0, C.blue], [2.2, col]].concat(tk ? [[tk, SC[SCC[a]][0]]] : [])) + step("stroke-width", [[0, 2], [2.2, w]].concat(tk ? [[tk, 4.5]] : [])) +
        step("marker-end", [[0, "url(#scc_arrow)"], [2.2, inter ? "url(#scc_arrow_p)" : "url(#scc_arrow)"]]) +
        anim("x1", [[F0, g[0]], [F1, g[2]]]) + anim("y1", [[F0, g[1]], [F1, g[3]]]) + anim("x2", [[F0, g[2]], [F1, g[0]]]) + anim("y2", [[F0, g[3]], [F1, g[1]]]) +
        '</line>';
    });
    s += vis(F0, F1 + 0.3, txt(330, 186, "↻ 뒤집는 중", 13, C.red, ' font-weight="700"'));

    // ---- 정점 ----
    Object.keys(P).forEach(function (v) {
      var p = P[v], k = SCC[v];
      s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="34" ry="15" fill="#fff" stroke="' + C.pur + '" stroke-width="2">' +
        step("fill", [[0, "#fff"], [VT[v], SC[k][1]]]) + step("stroke", [[0, C.pur], [VT[v], SC[k][0]]]) + step("stroke-width", [[0, 2], [VT[v], 3.5]]) + '</ellipse>';
      s += txt(p[0], p[1] + 4, NAME[v], 12, C.ink, ' font-weight="700"');
      var ly = v === "DGIST" ? p[1] - 21 : p[1] + 31;
      s += txt(p[0], ly, "finish " + FIN[v], 11, C.muted, ' font-weight="700"');
    });
    s += vis(4.9, 6.6, txt(400, 316, "G^T 에서 KAIST 의 나가는 간선 = 0개", 12, C.or, ' font-weight="700"'));
    s += vis(7.6, 9.2, txt(500, 214, "DGIST→KAIST: 이미 끝남", 11, C.muted, ' font-weight="700"'));
    s += vis(10.0, 11.6, txt(250, 300, "강아지 → DGIST·Wiki·YouTube·KAIST: 전부 이미 끝남", 11, C.muted, ' font-weight="700"'));

    // ---- 오른쪽: 2차 DFS 시작 순서 ----
    s += '<rect x="618" y="48" width="132" height="210" rx="8" fill="#fafbfd" stroke="' + C.line + '"/>';
    s += txt(684, 68, "finish 내림차순", 12, C.pur, ' font-weight="700"');
    s += txt(684, 84, "(2차 DFS 를 여는 순서)", 10, C.muted);
    var ord = ["KAIST", "DGIST", "Wiki", "YouTube", "Pup", "Google"];
    ord.forEach(function (v, i) {
      var y = 110 + i * 24, k = SCC[v];
      s += '<rect x="630" y="' + (y - 15) + '" width="108" height="20" rx="4" fill="#fff" stroke="' + C.line + '">' +
        step("fill", [[0, "#fff"], [VT[v], SC[k][1]]]) + step("stroke", [[0, C.line], [VT[v], SC[k][0]]]) + '</rect>';
      s += txt(640, y, NAME[v], 12, C.ink, ' text-anchor="start" font-weight="700"') + txt(730, y, FIN[v], 12, C.muted, ' text-anchor="end"');
    });
    [[4.9, 6.6, 0], [6.6, 9.2, 1], [9.2, 11.6, 4]].forEach(function (r) {
      s += vis(r[0], r[1], txt(626, 110 + r[2] * 24, "▶", 12, C.red, ' text-anchor="end"'));
    });

    // ---- 아래: 찾은 SCC ----
    var chips = [["SCC #1  {KAIST}", 30, 150], ["SCC #2  {DGIST, Wiki, YouTube}", 196, 270], ["SCC #3  {강아지, Google}", 482, 220]];
    chips.forEach(function (c, i) {
      s += vis(DONE[i], D, '<rect x="' + c[1] + '" y="330" width="' + c[2] + '" height="24" rx="12" fill="' + SC[i][1] + '" stroke="' + SC[i][0] + '" stroke-width="2"/>' +
        txt(c[1] + c[2] / 2, 347, c[0], 12, C.ink, ' font-weight="700"'));
    });
    s += txt(380, 372, "finish 가 가장 큰 SCC = source → 뒤집으면 sink: 거기서 연 DFS 는 그 SCC 만 돈다", 12, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
