// ============================================================
// matching_as_flow — L17 p.66–70: bipartite matching 을 max flow 로. s, t 를 붙이고 capacity 는 모두 1
//   학생 1–5, 동아리 가–마 (p.68 그림의 간선 그대로: 1→가·나, 2→가, 3→가·라, 4→다·라·마, 5→나)
//   augmenting path (검산 src/sims/_check_L17_anims.py):
//     s→1→가→t,  s→2→가⇢1→나→t (학생 1 이 가→나 로 옮김),  s→3→라→t,  s→4→다→t
//   학생 5: s→5→나⇢1→가⇢2 에서 막힘 → 끝. matching 크기 4 = flow 값 4 (p.70 의 답과 크기 같음)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["matching_as_flow"] = {
  title: "bipartite matching = capacity 1 짜리 max flow (18초)",
  desc: "L17 p.66–70. 학생→동아리 그래프 앞뒤에 s, t 를 붙이고 모든 capacity 를 1 로 둔 뒤 Ford-Fulkerson 을 돌린다. 주황 간선이 flow 1 이다. " +
    "두 번째 경로는 연두(backward) 간선을 타서 학생 1 을 '가' 에서 '나' 로 옮기고 학생 2 에게 '가' 를 준다. → [[maximum bipartite matching]]",
  duration: 18,
  build: function () {
    var D = 18, K = FLOWKIT(D, "maf"), C = K.C;
    var P = { s: [50, 206], t: [598, 206] };
    var X = ["1", "2", "3", "4", "5"], Y = ["가", "나", "다", "라", "마"];
    X.forEach(function (k, i) { P[k] = [205, 86 + i * 60]; });
    Y.forEach(function (k, i) { P[k] = [440, 86 + i * 60]; });
    var M = { "1": ["가", "나"], "2": ["가"], "3": ["가", "라"], "4": ["다", "라", "마"], "5": ["나"] };
    var on = {   // flow 1 인 구간
      "s-1": [[3, D]], "1-가": [[3, 6.6]], "가-t": [[3, D]],
      "s-2": [[6.6, D]], "2-가": [[6.6, D]], "1-나": [[6.6, D]], "나-t": [[6.6, D]],
      "s-3": [[9.4, D]], "3-라": [[9.4, D]], "라-t": [[9.4, D]],
      "s-4": [[12, D]], "4-다": [[12, D]], "다-t": [[12, D]]
    };
    var paths = [
      { t: 1.6, end: 4, segs: [["s", "1"], ["1", "가"], ["가", "t"]] },
      { t: 4, end: 7.8, segs: [["s", "2"], ["2", "가"], ["가", "1", "back"], ["1", "나"], ["나", "t"]] },
      { t: 7.8, end: 10.4, segs: [["s", "3"], ["3", "라"], ["라", "t"]] },
      { t: 10.4, end: 13, segs: [["s", "4"], ["4", "다"], ["다", "t"]] }
    ];
    var s = '<svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="bipartite matching 을 max flow 로 푸는 애니메이션">' + K.defs();
    s += K.captions([
      [0, 1.6, "학생 → 원하는 동아리. 앞에 s, 뒤에 t 를 붙이고 capacity 를 모두 1 로"],
      [1.6, 4, "경로 s→1→가→t: 학생 1 을 동아리 가 에"],
      [4, 7.8, "경로 s→2→가 ⇢ 1→나→t: 연두를 타서 학생 1 을 나 로 옮기고, 2 가 가 를 받는다"],
      [7.8, 10.4, "경로 s→3→라→t"],
      [10.4, 13, "경로 s→4→다→t"],
      [13, 15.6, "학생 5: s→5→나 ⇢ 1→가 ⇢ 2 … 2 는 가 말고 원하는 곳이 없다. 막힘"],
      [15.6, D, "Gf 에 s→t 길 없음 → max flow 4 = maximum matching 4"]
    ]);
    s += K.txt(205, 52, "학생", 13, C.pur, ' font-weight="700"') + K.txt(440, 52, "동아리", 13, C.pur, ' font-weight="700"');
    // 경로 강조
    paths.forEach(function (p) {
      p.segs.forEach(function (g, i) {
        var tt = p.t + 0.12 * i;
        if (g[2]) s += K.vis(tt, p.end, K.halo(P, g[0], g[1], "#f3c623", 14, 7) + K.edge(P, g[0], g[1], { color: "lime", w: 3, off: 7, dash: "6 4" }));
        else s += K.vis(tt, p.end, K.halo(P, g[0], g[1], "#f3c623", 14));
      });
    });
    // 실패한 시도 (학생 5)
    s += K.vis(13, 15.6, K.halo(P, "s", "5", "#c9ced8", 14) + K.halo(P, "5", "나", "#c9ced8", 14) +
      K.edge(P, "나", "1", { color: "lime", w: 3, off: 7, dash: "6 4" }) + K.halo(P, "1", "가", "#c9ced8", 14) +
      K.edge(P, "가", "2", { color: "lime", w: 3, off: 7, dash: "6 4" }) +
      '<circle cx="' + P["2"][0] + '" cy="' + P["2"][1] + '" r="22" fill="none" stroke="' + C.red + '" stroke-width="3"/>' +
      K.txt(P["2"][0] - 44, P["2"][1] + 5, "막힘", 13, C.red, ' font-weight="700"'));
    // 간선
    var all = [];
    X.forEach(function (x) { all.push(["s", x]); M[x].forEach(function (y) { all.push([x, y]); }); });
    Y.forEach(function (y) { all.push([y, "t"]); });
    all.forEach(function (e) {
      s += K.edge(P, e[0], e[1], { color: "blue", w: 1.8, r: 16 });
      (on[e[0] + "-" + e[1]] || []).forEach(function (w) {
        s += K.vis(w[0], w[1], K.edge(P, e[0], e[1], { color: "or", w: 4.5, r: 16 }));
      });
    });
    s += K.txt(110, 360, "모든 capacity = 1", 12.5, C.blue, ' font-weight="700"');
    // 정점
    Object.keys(P).forEach(function (k) {
      var st = k === "s" ? "src" : k === "t" ? "sink" : "t";
      s += K.nodeSt(P, k, k, [[0, st]], 15);
    });
    // 오른쪽: 지금 matching
    var X0 = 640;
    s += '<rect x="' + (X0 - 6) + '" y="64" width="122" height="250" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
    s += K.txt(X0 + 55, 88, "지금 matching", 13, C.pur, ' font-weight="700"');
    var rows = [[3, 6.6, "학생 1 – 가", 0], [6.6, D, "학생 1 – 나", 0], [6.6, D, "학생 2 – 가", 1], [9.4, D, "학생 3 – 라", 2], [12, D, "학생 4 – 다", 3]];
    rows.forEach(function (r) { s += K.vis(r[0], r[1], K.txt(X0 + 55, 120 + r[3] * 28, r[2], 13.5, C.or, ' font-weight="700"')); });
    s += K.vis(6.6, 8.6, K.txt(X0 + 55, 120 - 14, "옮김!", 11, C.lime, ' font-weight="700"'));
    s += K.seq(X0 + 55, 270, [[0, "크기 0"], [3, "크기 1"], [6.6, "크기 2"], [9.4, "크기 3"], [12, "크기 4"]], 15, C.ink, ' font-weight="700"');
    s += K.vis(15.6, D, K.txt(X0 + 55, 296, "= flow 값 4", 13, C.red, ' font-weight="700"'));
    s += K.txt(380, 392, "capacity 가 1 이라 flow 는 0 아니면 1, 학생·동아리마다 들어온 만큼만 나가니 한 명당 한 곳 (p.70)", 12.5, C.pur, ' font-weight="700"');
    return s + '</svg>';
  }
};
