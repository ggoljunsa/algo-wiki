// ============================================================
// prim_vs_kruskal_grow — L15 p.28–35 (Prim) 과 p.75–84 / p.98–105 (Kruskal) 을 나란히
// 같은 그래프(p.4)에서 간선이 MST 에 들어가는 순서 (src/sims/_check_L15.txt 와 같음):
//   Prim    (A 시작, tree 하나가 자람): A–B 4, B–C 8, C–I 2, C–F 4, F–G 2, G–H 1, C–D 7, D–E 9
//   Kruskal (가벼운 간선부터, forest 가 합쳐짐): H–G 1, C–I 2, G–F 2, A–B 4, C–F 4, C–D 7, B–C 8, D–E 9
//     (사이에 I–G 6, H–I 7, A–H 8 은 cycle 이라 버림 — 빨간 X 로 잠깐 표시)
// 두 결과는 같은 MST, cost 37.
// 시간축(초): 0–1.5 소개 → 1.5–14.3 간선 8개 (1.6초 간격, 두 쪽 동시) → 14.3–17 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["prim_vs_kruskal_grow"] = {
  title: "Prim 은 tree 하나, Kruskal 은 forest — 같은 MST 가 자라는 두 방식 (17초)",
  desc: "L15 p.28–35, p.75–105. 왼쪽 [[Prim's algorithm]] 은 A 에서 시작한 '''한 덩어리 tree''' 에 가장 가벼운 간선을 붙여 나간다. " +
    "오른쪽 [[Kruskal's algorithm]] 은 연결 여부와 상관없이 '''가장 가벼운 간선'''부터 넣어서 여러 조각([[forest]])이 점점 합쳐진다. 같은 색 정점 = 같은 tree. 끝나면 둘 다 cost 37 인 같은 MST 다. → [[Prim vs Kruskal 비교표]]",
  duration: 17,
  build: function () {
    var D = 17, T0 = 1.5, DT = 1.6;
    var C = { blue: "#9db3d1", green: "#2e9e4f", or: "#e09a40", pur: "#3b2f4a", red: "#d6465f", muted: "#777", ink: "#222", w: "#1d65b3" };
    var PAL = ["#f6c86b", "#8ec6f0", "#c7a6e8", "#f29aa8", "#89d4c3", "#d9d27a", "#bdbdbd", "#f5ae86", "#a9cf86"];
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.15 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function disc(attr, pts) {   // pts: [[t, value], …] 계단식
      var ks = [0], vs = [pts[0][1]];
      pts.forEach(function (p) { if (p[0] > 0) { ks.push(r4(p[0] / D)); vs.push(p[1]); } else vs[0] = p[1]; });
      ks.push(1); vs.push(pts[pts.length - 1][1]);
      return '<animate attributeName="' + attr + '" calcMode="discrete" values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }

    var V = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    var BASE = { A: [20, 110], B: [70, 40], C: [140, 40], D: [210, 40], E: [265, 110], I: [120, 110], H: [70, 180], G: [140, 180], F: [210, 180] };
    var EDGES = [["A", "B", 4], ["A", "H", 8], ["B", "C", 8], ["B", "H", 11], ["C", "D", 7], ["C", "I", 2], ["C", "F", 4],
      ["D", "E", 9], ["D", "F", 14], ["E", "F", 10], ["H", "I", 7], ["I", "G", 6], ["H", "G", 1], ["G", "F", 2]];
    var PRIM = [["A", "B"], ["B", "C"], ["C", "I"], ["C", "F"], ["F", "G"], ["G", "H"], ["C", "D"], ["D", "E"]];
    var KRU = [["H", "G"], ["C", "I"], ["G", "F"], ["A", "B"], ["C", "F"], ["C", "D"], ["B", "C"], ["D", "E"]];
    // Kruskal 이 버리는 간선: 직전 추가 간선 뒤에 잠깐 X (I–G 6 은 C–F 뒤, H–I 7 은 C–D 뒤, A–H 8 은 B–C 뒤)
    var KSKIP = [[4, "I", "G"], [5, "H", "I"], [6, "A", "H"]];
    function same(e, a, b) { return (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a); }
    function idx(list, e) { for (var i = 0; i < list.length; i++) if (same(e, list[i][0], list[i][1])) return i; return -1; }
    function tAdd(i) { return T0 + i * DT; }

    function panel(ox, oy, title, list, mode) {
      var s = '<rect x="' + (ox - 14) + '" y="' + (oy - 52) + '" width="320" height="270" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
      s += txt(ox + 143, oy - 30, title, 14, C.pur, ' font-weight="700"');
      function P(v) { return [ox + BASE[v][0], oy + BASE[v][1] - 20]; }
      // 간선
      EDGES.forEach(function (e) {
        var a = P(e[0]), b = P(e[1]), i = idx(list, e);
        var base = '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C.blue + '" stroke-width="2"/>';
        s += base;
        if (i >= 0) {
          var t = tAdd(i);
          s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C.green + '" stroke-width="6" stroke-linecap="round" opacity="0">' +
            show(t, D) + '</line>';
          s += vis(t, t + DT, '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C.or + '" stroke-width="10" stroke-linecap="round" opacity="0.6"/>');
        }
        var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, off = (e[0] === "C" && e[1] === "I") || (e[0] === "I" && e[1] === "G") ? 10 : -7;
        s += txt(mx + (a[1] === b[1] ? 0 : off), my + (a[1] === b[1] ? -6 : 4), e[2], 11, C.w, ' font-weight="700"');
      });
      if (mode === "kru") {
        KSKIP.forEach(function (k) {
          var a = P(k[1]), b = P(k[2]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, t = tAdd(k[0]) + DT * 0.55;
          s += vis(t, Math.min(D, t + 0.9), txt(mx, my + 7, "✕", 22, C.red, ' font-weight="900"'));
        });
      }
      // 정점 색: Prim = tree 에 들어온 순간 초록, Kruskal = 속한 집합 색 (합쳐지면 바뀜)
      var colorPts = {};
      V.forEach(function (v) { colorPts[v] = [[0, "#fff"]]; });
      if (mode === "prim") {
        colorPts.A.push([T0 - 0.4, C.green]);
        list.forEach(function (e, i) { colorPts[e[1]].push([tAdd(i), C.green]); });
      } else {
        var par = {}; V.forEach(function (v) { par[v] = v; });
        function find(x) { while (par[x] !== x) x = par[x]; return x; }
        V.forEach(function (v, i) { colorPts[v] = [[0, "#fff"], [T0 - 0.4, PAL[i]]]; });
        var col = {}; V.forEach(function (v, i) { col[v] = PAL[i]; });
        list.forEach(function (e, i) {
          var ra = find(e[0]), rb = find(e[1]);
          par[rb] = ra;
          V.forEach(function (v) { if (find(v) === ra) colorPts[v].push([tAdd(i), col[ra]]); });
        });
      }
      V.forEach(function (v) {
        var p = P(v);
        s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="13" fill="#fff" stroke="' + C.pur + '" stroke-width="1.6">' + disc("fill", colorPts[v]) + '</circle>' +
          txt(p[0], p[1] + 4.5, v, 12, mode === "prim" ? C.ink : C.ink, ' font-weight="700"');
      });
      // 추가 순서 목록
      list.forEach(function (e, i) {
        var w = EDGES.filter(function (x) { return same(x, e[0], e[1]); })[0][2], t = tAdd(i);
        s += vis(t, D, txt(ox + 2 + (i % 4) * 74, oy + 192 + Math.floor(i / 4) * 20, (i + 1) + ". " + e[0] + "–" + e[1] + " " + w, 11.5, C.green, ' text-anchor="start" font-weight="700"'));
      });
      return s;
    }

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Prim 과 Kruskal 이 MST 를 키우는 방식 비교 애니메이션">';
    var caps = [
      [0, T0, "같은 그래프(p.4)에서 두 greedy 알고리즘이 MST 를 만든다"],
      [T0, tAdd(3), "Prim: A 에 붙은 간선만 본다 · Kruskal: 그래프 전체에서 가장 가벼운 간선"],
      [tAdd(3), tAdd(6), "Kruskal 은 같은 tree 안을 잇는 간선(✕)을 버린다 = cycle 방지"],
      [tAdd(6), tAdd(8), "Prim 은 처음부터 끝까지 한 덩어리, Kruskal 은 조각들이 합쳐진다"],
      [tAdd(8), D, "결과는 같은 MST: 간선 8개, cost 37 (p.8)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });
    s += panel(46, 112, "Prim — tree 하나가 자란다", PRIM, "prim");
    s += panel(420, 112, "Kruskal — forest 가 합쳐진다", KRU, "kru");
    s += vis(tAdd(8), D, txt(195, 360, "cost 37 ✓", 14, C.green, ' font-weight="700"') + txt(569, 360, "cost 37 ✓", 14, C.green, ' font-weight="700"'));
    s += '</svg>';
    return s;
  }
};
