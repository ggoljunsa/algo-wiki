// ============================================================
// dfs_parenthesis — L9 p.49 그래프(A–G)에서 DFS 의 start/finish 가 괄호처럼 중첩된다 (p.60 parenthesis theorem)
// 검산(Python, 슬라이드 의사코드 DFS(w, currentTime) 그대로, 시각 0 부터):
//   A 0/13 · B 1/10 · C 2/9 · G 3/8 · F 4/5 · D 6/7 · E 11/12  (DFS tree = p.49 오른쪽 그림: A–B–C–G–{F, D}, A–E)
// 시간축(초): 0–1 초기 → 1 + 0.8k 에 사건 k (k = 0..13) → 12.2–14 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["dfs_parenthesis"] = {
  title: "DFS 의 start/finish — 괄호처럼 열리고 닫힌다 (14초)",
  desc: "L9 p.49·p.60. [[DFS]] 가 정점에 들어갈 때 '''(''' 를 열고(start time), 다 끝내고 나올 때 ''')''' 를 닫는다(finish time). 두 정점의 구간은 '''중첩되거나 분리될 뿐, 엇갈리지 않는다''' — [[parenthesis theorem]].",
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
    function step(attr, pts) { return '<animate attributeName="' + attr + '" calcMode="discrete" ' + kf(pts) + '/>'; }

    var P = { A: [42, 142], B: [150, 197], C: [63, 266], D: [112, 74], E: [202, 78], F: [252, 129], G: [225, 237] };
    var ST = { A: 0, B: 1, C: 2, G: 3, F: 4, D: 6, E: 11 };
    var FN = { A: 13, B: 10, C: 9, G: 8, F: 5, D: 7, E: 12 };
    var PAR = { B: "A", C: "B", G: "C", F: "G", D: "G", E: "A" };
    var DEP = { A: 0, B: 1, C: 2, G: 3, F: 4, D: 4, E: 1 };
    var EDGES = ["AB", "AE", "BC", "BD", "BF", "CD", "CG", "DG", "FG"];
    function T(k) { return 1 + 0.8 * k; }
    // 사건 목록 (시각 k 에 정확히 하나)
    var ev = [];
    Object.keys(ST).forEach(function (v) { ev[ST[v]] = { v: v, open: true }; ev[FN[v]] = { v: v, open: false }; });

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DFS parenthesis theorem 애니메이션">';
    // ---- 자막 ----
    var caps = [[0, T(0), "DFS(A, 0): 모든 정점이 unvisited — 시각 0 에서 출발"]];
    ev.forEach(function (e, k) {
      caps.push([T(k), T(k + 1), "시각 " + k + ": " + e.v + (e.open ? " start — '(' 를 연다 (in progress)" : " finish — ')' 를 닫는다 (all done)")]);
    });
    caps.push([T(14), D, "parenthesis theorem: 구간은 중첩 또는 분리 — 엇갈림은 없다"]);
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 그래프 (왼쪽) ----
    EDGES.forEach(function (e) {
      var a = P[e[0]], b = P[e[1]];
      var tree = PAR[e[1]] === e[0] || PAR[e[0]] === e[1];
      var child = PAR[e[1]] === e[0] ? e[1] : e[0];
      var at = tree ? T(ST[child]) : null;
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C.line + '" stroke-width="2.5"' +
        (tree ? '>' + step("stroke", [[0, C.line], [at, C.pur]]) + step("stroke-width", [[0, 2.5], [at, 5]]) + '</line>' : '/>');
    });
    // 현재 위치 고리
    var ringX = [[0, P.A[0]]], ringY = [[0, P.A[1]]];
    ev.forEach(function (e, k) {
      var w = e.open ? e.v : (PAR[e.v] || e.v);
      ringX.push([T(k), P[w][0]]); ringY.push([T(k), P[w][1]]);
    });
    s += '<circle cx="' + P.A[0] + '" cy="' + P.A[1] + '" r="21" fill="none" stroke="' + C.or + '" stroke-width="2.5" stroke-dasharray="5 3" opacity="0">' +
      step("cx", ringX) + step("cy", ringY) + show(T(0), T(14)) + '</circle>';
    Object.keys(P).forEach(function (v) {
      var p = P[v];
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" stroke="' + C.blue + '" stroke-width="2" fill="#fff">' +
        step("fill", [[0, "#fff"], [T(ST[v]), C.or], [T(FN[v]), C.green]]) + '</circle>';
      s += txt(p[0], p[1] + 5, v, 14, C.ink, ' font-weight="700"');
      var above = (v === "D" || v === "E"), right = (v === "F");
      var lx = right ? p[0] + 22 : p[0], ly = above ? p[1] - 22 : (right ? p[1] + 4 : p[1] + 31);
      if (right) {
        s += vis(T(ST[v]), D, txt(lx, ly, ST[v], 12, C.or, ' text-anchor="start" font-weight="700"'));
        s += vis(T(FN[v]), D, txt(lx + 8, ly, "/" + FN[v], 12, C.green, ' text-anchor="start" font-weight="700"'));
      } else {
        s += vis(T(ST[v]), D, txt(lx - 1, ly, ST[v], 12, C.or, ' text-anchor="end" font-weight="700"'));
        s += vis(T(FN[v]), D, txt(lx - 1, ly, "/" + FN[v], 12, C.green, ' text-anchor="start" font-weight="700"'));
      }
    });
    // 범례
    s += '<circle cx="40" cy="322" r="6" fill="#fff" stroke="' + C.blue + '" stroke-width="1.5"/>' + txt(50, 326, "unvisited", 11, C.muted, ' text-anchor="start"');
    s += '<circle cx="120" cy="322" r="6" fill="' + C.or + '"/>' + txt(130, 326, "in progress", 11, C.muted, ' text-anchor="start"');
    s += '<circle cx="210" cy="322" r="6" fill="' + C.green + '"/>' + txt(220, 326, "all done", 11, C.muted, ' text-anchor="start"');

    // ---- 괄호 문자열 + 시간축 (오른쪽) ----
    function X(k) { return 340 + k * 29; }
    s += '<rect x="310" y="50" width="440" height="250" rx="8" fill="#fafbfd" stroke="' + C.line + '"/>';
    s += txt(320, 72, "괄호 문자열 (시각 순서)", 12, C.muted, ' text-anchor="start" font-weight="700"');
    ev.forEach(function (e, k) {
      var col = e.open ? C.or : C.green;
      s += vis(T(k), D, txt(X(k), 104, e.open ? "(" + e.v : e.v + ")", 15, col, ' font-weight="700"'));
    });
    s += txt(320, 132, "구간 [start, finish]", 12, C.muted, ' text-anchor="start" font-weight="700"');
    // 축
    s += '<line x1="' + (X(0) - 10) + '" y1="262" x2="' + (X(13) + 10) + '" y2="262" stroke="' + C.muted + '" stroke-width="1.5"/>';
    for (var k = 0; k <= 13; k++) {
      s += '<line x1="' + X(k) + '" y1="258" x2="' + X(k) + '" y2="266" stroke="' + C.muted + '"/>' + txt(X(k), 280, k, 11, C.muted);
    }
    // 열린 구간(진행 중): 주황 점선이 start 에서 시작 → finish 에서 실선 막대
    Object.keys(ST).forEach(function (v) {
      var y = 248 - DEP[v] * 24, a = X(ST[v]), b = X(FN[v]);
      s += vis(T(ST[v]), T(FN[v]), '<line x1="' + a + '" y1="' + y + '" x2="' + a + '" y2="' + y + '" stroke="' + C.or + '" stroke-width="3" stroke-dasharray="4 3">' +
        '<animate attributeName="x2" values="' + a + ';' + a + ';' + b + ';' + b + '" keyTimes="0;' + r4(T(ST[v]) / D) + ';' + r4(T(FN[v]) / D) + ';1" dur="' + D + 's" fill="freeze"/></line>' +
        '<line x1="' + a + '" y1="' + (y - 6) + '" x2="' + a + '" y2="' + (y + 6) + '" stroke="' + C.or + '" stroke-width="2.5"/>');
      s += vis(T(FN[v]), D, '<line x1="' + a + '" y1="' + y + '" x2="' + b + '" y2="' + y + '" stroke="' + C.green + '" stroke-width="5" stroke-linecap="round"/>' +
        '<line x1="' + a + '" y1="' + (y - 6) + '" x2="' + a + '" y2="' + (y + 6) + '" stroke="' + C.green + '" stroke-width="2.5"/>' +
        '<line x1="' + b + '" y1="' + (y - 6) + '" x2="' + b + '" y2="' + (y + 6) + '" stroke="' + C.green + '" stroke-width="2.5"/>');
      s += vis(T(ST[v]), D, txt(a - 6, y + 4, v, 11, C.ink, ' text-anchor="end" font-weight="700"'));
    });
    // 정리 장면
    s += vis(T(14), D, txt(530, 294, "불가능: (B … (E … B) … E) — 엇갈림", 12, C.red, ' font-weight="700"'));
    s += vis(T(14), D, '<rect x="' + (X(1) - 22) + '" y="136" width="' + (X(10) - X(1) + 30) + '" height="96" rx="6" fill="none" stroke="' + C.blue + '" stroke-width="2" stroke-dasharray="5 3"/>' +
      txt(X(10) + 6, 130, "B 의 자손 C·G·F·D = B 구간 안", 11, C.blue, ' text-anchor="end" font-weight="700"'));

    s += txt(380, 348, "v 가 w 의 자손 ⇔ [v.start, v.finish] ⊂ [w.start, w.finish] — 아니면 두 구간은 분리", 13, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
