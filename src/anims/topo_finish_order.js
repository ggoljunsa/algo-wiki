// ============================================================
// topo_finish_order — L9 p.54–59 패키지 의존 DAG 에서 DFS 가 끝나는(finish) 정점을 리스트 맨 앞에 끼운다
// 간선 (p.55): dpkg→libbz2, dpkg→tar, dpkg→coreutils, dpkg→multiarch-support, coreutils→libbz2,
//   coreutils→libselinux1, libbz2→libselinux1, libselinux1→multiarch-support
// 검산(Python, 슬라이드 DFS, 시각 0 부터, dpkg 이웃 순서 libbz2, tar, coreutils, multiarch):
//   dpkg 0/11 · libbz2 1/6 · libselinux1 2/5 · multiarch 3/4 · tar 7/8 · coreutils 9/10  (p.59 그림 수치와 같음)
//   finish 내림차순 = dpkg, coreutils, tar, libbz2, libselinux1, multiarch → 8개 간선 모두 왼→오
// 시간축(초): 0–1.2 초기 → 1.2 + 0.75k 에 사건 k (k = 0..11) → 10.2–13 화살표 검사
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["topo_finish_order"] = {
  title: "topological sort — 끝난 정점을 리스트 맨 앞에 (13초)",
  desc: "L9 p.54–61. [[DAG]] 에서 [[DFS]] 를 돌며 정점이 finish 될 때마다 리스트 '''맨 앞'''에 끼운다 = [[start time과 finish time|finish time]] 내림차순. 완성된 리스트에서는 모든 간선이 왼쪽 → 오른쪽 — [[topological ordering]].",
  duration: 13,
  build: function () {
    var D = 13;
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
    function step(attr, pts) { return '<animate attributeName="' + attr + '" calcMode="discrete" ' + kf(pts) + '/>'; }

    var N = ["dpkg", "libbz2", "libselinux1", "multiarch", "tar", "coreutils"];
    var LABEL = { dpkg: "dpkg", libbz2: "libbz2", libselinux1: "libselinux1", multiarch: "multiarch-support", tar: "tar", coreutils: "coreutils" };
    var P = { coreutils: [175, 68], tar: [58, 128], multiarch: [452, 104], dpkg: [258, 168], libselinux1: [418, 220], libbz2: [92, 238] };
    var RX = { coreutils: 40, tar: 26, multiarch: 62, dpkg: 30, libselinux1: 46, libbz2: 34 };
    var ST = { dpkg: 0, libbz2: 1, libselinux1: 2, multiarch: 3, tar: 7, coreutils: 9 };
    var FN = { multiarch: 4, libselinux1: 5, libbz2: 6, tar: 8, coreutils: 10, dpkg: 11 };
    var PAR = { libbz2: "dpkg", libselinux1: "libbz2", multiarch: "libselinux1", tar: "dpkg", coreutils: "dpkg" };
    var E = [["dpkg", "libbz2"], ["dpkg", "tar"], ["dpkg", "coreutils"], ["dpkg", "multiarch"], ["coreutils", "libbz2"],
      ["coreutils", "libselinux1"], ["libbz2", "libselinux1"], ["libselinux1", "multiarch"]];
    var ORDER = ["dpkg", "coreutils", "tar", "libbz2", "libselinux1", "multiarch"];   // finish 내림차순
    function T(k) { return 1.2 + 0.75 * k; }
    var TEND = T(12);   // 10.2
    var ev = [];
    N.forEach(function (v) { ev[ST[v]] = { v: v, open: true }; ev[FN[v]] = { v: v, open: false }; });

    // 타원 경계까지 줄인 선분
    function clip(a, b) {
      var pa = P[a], pb = P[b], dx = pb[0] - pa[0], dy = pb[1] - pa[1];
      function k(v) { var rx = RX[v] + 3, ry = 17; return 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry)); }
      var ka = k(a), kb = k(b);
      return [Math.round(pa[0] + dx * ka), Math.round(pa[1] + dy * ka), Math.round(pb[0] - dx * kb), Math.round(pb[1] - dy * kb)];
    }

    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="topological sort 애니메이션">';
    s += '<defs><marker id="topo_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.blue + '"/></marker>' +
      '<marker id="topo_arrow_g" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.green + '"/></marker></defs>';
    var caps = [[0, T(0), "패키지 의존 DAG — dpkg 에서 DFS 시작 (시각 0)"]];
    ev.forEach(function (e, k) {
      caps.push([T(k), T(k + 1), "시각 " + k + ": " + LABEL[e.v] + (e.open ? " start" : " finish → 리스트 맨 앞에 끼운다")]);
    });
    caps.push([TEND, D, "모든 화살표가 왼쪽 → 오른쪽: topological ordering 완성"]);
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 그래프 ----
    E.forEach(function (e) {
      var c = clip(e[0], e[1]);
      var tree = PAR[e[1]] === e[0];
      s += '<line x1="' + c[0] + '" y1="' + c[1] + '" x2="' + c[2] + '" y2="' + c[3] + '" stroke="' + C.blue + '" stroke-width="2.2" marker-end="url(#topo_arrow)"' +
        (tree ? '>' + step("stroke-width", [[0, 2.2], [T(ST[e[1]]), 4]]) + '</line>' : '/>');
    });
    N.forEach(function (v) {
      var p = P[v];
      s += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + RX[v] + '" ry="14" fill="#fff" stroke="' + C.blue + '" stroke-width="2">' +
        step("fill", [[0, "#fff"], [T(ST[v]), C.orL], [T(FN[v]), C.greenL]]) + step("stroke", [[0, C.blue], [T(ST[v]), C.or], [T(FN[v]), C.green]]) + '</ellipse>';
      s += txt(p[0], p[1] + 4, LABEL[v], 12, C.ink, ' font-weight="700"');
      var below = ["coreutils", "libbz2", "multiarch"].indexOf(v) < 0;
      var lx = p[0], ly = below ? p[1] + 30 : p[1] - 20;
      s += vis(T(ST[v]), D, txt(lx - 1, ly, "start " + ST[v], 11, C.or, ' text-anchor="end" font-weight="700"'));
      s += vis(T(FN[v]), D, txt(lx + 3, ly, "finish " + FN[v], 11, C.green, ' text-anchor="start" font-weight="700"'));
    });

    // ---- 오른쪽 설명 ----
    s += '<rect x="530" y="48" width="220" height="214" rx="8" fill="#fafbfd" stroke="' + C.line + '"/>';
    s += txt(546, 72, "규칙", 13, C.pur, ' text-anchor="start" font-weight="700"');
    s += txt(546, 96, "정점이 finish 되면", 12, C.ink, ' text-anchor="start"');
    s += txt(546, 116, "→ 리스트 맨 앞에 끼운다", 12, C.ink, ' text-anchor="start" font-weight="700"');
    s += txt(546, 140, "= finish time 내림차순", 12, C.green, ' text-anchor="start" font-weight="700"');
    s += txt(546, 170, "왜? A→B 이면", 12, C.muted, ' text-anchor="start"');
    s += txt(546, 190, "A.finish &gt; B.finish (p.60)", 12, C.muted, ' text-anchor="start"');
    s += txt(546, 216, "start time 순은 반례가 있다", 12, C.red, ' text-anchor="start" font-weight="700"');
    s += txt(546, 234, "libbz2(start 1) 이 coreutils(start 9) 앞", 10.5, C.red, ' text-anchor="start"');
    s += txt(546, 250, "인데 간선은 coreutils → libbz2 ✗", 10.5, C.red, ' text-anchor="start"');

    // ---- 리스트 (오른쪽 칸부터 채워짐 = 맨 앞에 끼우기) ----
    var LX = 34, LW = 112, LG = 8, LY = 284;
    function slotX(i) { return LX + i * (LW + LG) + LW / 2; }
    s += txt(LX, LY - 10, "리스트 (앞 ← … → 뒤)", 12, C.muted, ' text-anchor="start" font-weight="700"');
    for (var i = 0; i < 6; i++) s += '<rect x="' + (LX + i * (LW + LG)) + '" y="' + LY + '" width="' + LW + '" height="26" rx="5" fill="none" stroke="' + C.line + '" stroke-dasharray="4 3"/>';
    ORDER.forEach(function (v, i) {
      var t0 = T(FN[v]), p = P[v], x1 = slotX(i), y1 = LY + 13;
      var tr = '<animateTransform attributeName="transform" type="translate" values="' + p[0] + ',' + p[1] + ';' + p[0] + ',' + p[1] + ';' + x1 + ',' + y1 + ';' + x1 + ',' + y1 +
        '" keyTimes="0;' + r4(t0 / D) + ';' + r4((t0 + 0.55) / D) + ';1" dur="' + D + 's" fill="freeze"/>';
      s += '<g opacity="0">' + show(t0, D) + '<g>' + tr + '<rect x="' + (-LW / 2) + '" y="-13" width="' + LW + '" height="26" rx="5" fill="' + C.greenL + '" stroke="' + C.green + '" stroke-width="2"/>' +
        txt(0, 4, LABEL[v], 12, C.ink, ' font-weight="700"') + '</g></g>';
      s += vis(t0 + 0.55, D, txt(x1, LY + 42, "finish " + FN[v], 10, C.green));
    });
    // 완성 후: 모든 간선을 리스트 위 호로
    var arcs = "";
    E.forEach(function (e) {
      var i = ORDER.indexOf(e[0]), j = ORDER.indexOf(e[1]);
      var xa = slotX(i) + 14, xb = slotX(j) - 14, h = 8 + 7 * (j - i);
      arcs += '<path d="M' + xa + ',' + (LY - 1) + ' Q' + ((xa + xb) / 2) + ',' + (LY - 1 - 2 * h) + ' ' + xb + ',' + (LY - 1) + '" fill="none" stroke="' + C.green + '" stroke-width="1.8" marker-end="url(#topo_arrow_g)"/>';
    });
    s += vis(TEND + 0.2, D, '<rect x="20" y="' + (LY - 98) + '" width="720" height="94" fill="#fff" opacity="0.88"/>' + arcs +
      txt(380, LY - 76, "간선 8개 전부 왼 → 오  (거꾸로 가는 화살표 0개)", 13, C.green, ' font-weight="700"'));

    s += txt(380, 370, "topological sort = DFS 후 finish time 내림차순 — O(n + m)", 13, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
