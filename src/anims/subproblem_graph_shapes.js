// ============================================================
// subproblem_graph_shapes — L14 p.39–42 "Sub-problem graph view" 세 그림을 차례로
//   D&C (p.39): Big → sub 2개 → sub-sub 3 + 2개. 각 sub-sub 의 부모는 하나 (트리, 겹치지 않음)
//   DP  (p.40): Big → sub 3개 → sub-sub 4개. sub1→{1,2,3}, sub2→{1,2,3,4}, sub3→{3,4} (DAG, 공유)
//   Greedy (p.41–42): Big → sub → sub-sub 사슬 (문제 하나당 sub-problem 하나)
// 시간축(초): 0–1 틀 → 1 D&C → 4.4 DP (4.4–6.4 간선, 6.6 공유 강조) → 8.4 Greedy → 11–13 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["subproblem_graph_shapes"] = {
  title: "Sub-problem graph — D&C 트리, DP DAG, Greedy 사슬 (13초)",
  desc: "L14 p.39–42. 큰 문제가 어떤 sub-problem 에 기대는지를 그래프로 그리면 모양이 셋으로 갈린다. [[divide and conquer]] 는 겹치지 않는 트리, DP 는 sub-problem 을 공유하는 DAG, [[greedy algorithm]] 은 문제마다 sub-problem 이 하나뿐인 사슬이다. [[sub-problem graph 비교]].",
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
    function node(x, y, rx, label, fill, stroke) {
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="15" fill="' + (fill || C.green) + '" stroke="' + (stroke || "#1d6b3a") + '" stroke-width="1.5"/>' +
        txt(x, y + 4, label, 11, "#fff", ' font-weight="700"');
    }
    function edge(a, b, col, w) {
      return '<line x1="' + a[0] + '" y1="' + (a[1] + 15) + '" x2="' + b[0] + '" y2="' + (b[1] - 15) + '" stroke="' + (col || C.blue) + '" stroke-width="' + (w || 2) + '"/>';
    }
    var Y0 = 92, Y1 = 162, Y2 = 232;
    var T = { dc: 1, dp: 4.4, dpShare: 6.6, gr: 8.4, sum: 11 };

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sub-problem graph 비교 애니메이션">';
    var caps = [
      [0, T.dc, "큰 문제가 어떤 sub-problem 의 답을 쓰는지 화살표로 잇는다"],
      [T.dc, T.dp, "Divide-and-conquer: sub-problem 끼리 겹치지 않는다 (트리)"],
      [T.dp, T.dpShare, "Dynamic programming: 여러 문제가 같은 sub-problem 을 쓴다"],
      [T.dpShare, T.gr, "공유되는 sub-sub-problem 은 한 번만 풀어 표에 적어 둔다 (DAG)"],
      [T.gr, T.sum, "Greedy: 문제 하나가 sub-problem 하나에만 기댄다 (사슬)"],
      [T.sum, D, "셋 다 optimal sub-structure 가 있고, sub-problem 그래프 모양이 다르다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // 칸 제목 + 구분선
    var PX = [130, 380, 630];
    s += '<line x1="255" y1="50" x2="255" y2="300" stroke="' + C.line + '" stroke-dasharray="4 4"/>';
    s += '<line x1="505" y1="50" x2="505" y2="300" stroke="' + C.line + '" stroke-dasharray="4 4"/>';
    s += vis(T.dc, D, txt(PX[0], 60, "Divide-and-conquer", 13, C.pur, ' font-weight="700"'));
    s += vis(T.dp, D, txt(PX[1], 60, "Dynamic programming", 13, C.pur, ' font-weight="700"'));
    s += vis(T.gr, D, txt(PX[2], 60, "Greedy", 13, C.pur, ' font-weight="700"'));

    // ---- D&C 트리 (p.39) ----
    var dcB = [130, Y0], dcS = [[75, Y1], [190, Y1]], dcL = [[30, Y2], [75, Y2], [120, Y2], [168, Y2], [218, Y2]];
    var dcPar = [0, 0, 0, 1, 1];
    var g1 = "", g2 = "";
    dcS.forEach(function (p) { g1 += edge(dcB, p); });
    dcL.forEach(function (p, i) { g2 += edge(dcS[dcPar[i]], p); });
    s += vis(T.dc, D, node(dcB[0], dcB[1], 38, "Big"));
    s += vis(T.dc + 0.8, D, g1 + dcS.map(function (p) { return node(p[0], p[1], 26, "sub"); }).join(""));
    s += vis(T.dc + 1.6, D, g2 + dcL.map(function (p) { return node(p[0], p[1], 20, "ss"); }).join(""));
    s += vis(T.dc + 2.2, D, txt(PX[0], 270, "부모가 하나씩 → 따로 푼다", 12, C.ink, ' font-weight="700"'));

    // ---- DP DAG (p.40) ----
    var dpB = [380, Y0], dpS = [[300, Y1], [380, Y1], [460, Y1]], dpL = [[290, Y2], [350, Y2], [410, Y2], [470, Y2]];
    var dpE = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [1, 3], [2, 2], [2, 3]];
    var h1 = "", h2 = "";
    dpS.forEach(function (p) { h1 += edge(dpB, p); });
    dpE.forEach(function (e) { h2 += edge(dpS[e[0]], dpL[e[1]], C.blue, 1.6); });
    s += vis(T.dp, D, node(dpB[0], dpB[1], 38, "Big"));
    s += vis(T.dp + 0.7, D, h1 + dpS.map(function (p) { return node(p[0], p[1], 26, "sub"); }).join(""));
    s += vis(T.dp + 1.4, D, h2 + dpL.map(function (p) { return node(p[0], p[1], 22, "ss"); }).join(""));
    // 공유 강조: 세 군데서 쓰는 ss3
    var sh = "";
    dpE.forEach(function (e) { if (e[1] === 2) sh += edge(dpS[e[0]], dpL[2], C.or, 3.5); });
    sh += '<ellipse cx="' + dpL[2][0] + '" cy="' + Y2 + '" rx="27" ry="20" fill="none" stroke="' + C.or + '" stroke-width="3"/>';
    s += vis(T.dpShare, T.gr, sh);
    s += vis(T.dpShare, D, txt(PX[1], 270, "부모가 여럿 → 표에 한 번만", 12, C.ink, ' font-weight="700"'));
    s += vis(T.dpShare, T.gr, txt(dpL[2][0] + 34, Y2 + 30, "3번 쓰임", 11, C.or, ' font-weight="700"'));

    // ---- Greedy 사슬 (p.41–42) ----
    var gr = [[630, Y0], [630, Y1], [630, Y2]];
    s += vis(T.gr, D, node(gr[0][0], gr[0][1], 38, "Big"));
    s += vis(T.gr + 0.7, D, edge(gr[0], gr[1]) + node(gr[1][0], gr[1][1], 30, "sub"));
    s += vis(T.gr + 1.4, D, edge(gr[1], gr[2]) + node(gr[2][0], gr[2][1], 26, "ss"));
    // 버려진 선택지 (회색 점선): greedy 는 하나만 남긴다
    var ghost = "";
    [[560, Y1], [700, Y1]].forEach(function (p) {
      ghost += '<line x1="' + gr[0][0] + '" y1="' + (Y0 + 15) + '" x2="' + p[0] + '" y2="' + (p[1] - 15) + '" stroke="#bbb" stroke-width="1.5" stroke-dasharray="4 4"/>' +
        '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="22" ry="13" fill="none" stroke="#bbb" stroke-dasharray="4 3"/>';
    });
    s += vis(T.gr + 0.7, D, ghost + txt(560, Y1 + 30, "고르지 않은 쪽", 10, C.muted));
    s += vis(T.gr + 2.0, D, txt(PX[2], 270, "부모마다 자식 하나 → 고르고 내려간다", 12, C.ink, ' font-weight="700"'));

    // ---- 정리 ----
    var sum = txt(PX[0], 292, "Mergesort, Select", 11, C.muted) +
      txt(PX[1], 292, "LCS, knapsack, Floyd-Warshall", 11, C.muted) +
      txt(PX[2], 292, "activity selection, Huffman", 11, C.muted);
    s += vis(T.sum, D, sum);

    s += '<line x1="20" y1="316" x2="740" y2="316" stroke="' + C.line + '"/>';
    s += txt(380, 340, "Greedy 는 sub-problem 이 하나만 남는 DP 다. 남길 하나를 고르는 규칙이 맞는지는 따로 증명한다", 12.5, C.pur, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
