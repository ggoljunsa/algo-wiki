// ============================================================
// loop_invariant_flow — L1 p.44–53 Loop invariant(i): A[:i+1] is sorted → 귀납법 4요소
// 시간축(초): 0 invariant 소개 → 1.5 Initialization(A[:1]) → 3.5 Maintenance (4.3/5.6/6.9/8.2 에 초록 구간 +1)
//   → 9.2 Termination (A[:n] 전체 초록) → 13 끝. 오른쪽 귀납법 4요소가 단계에 맞춰 켜짐.
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["loop_invariant_flow"] = {
  title: "Loop invariant — Initialization → Maintenance → Termination",
  desc: "[[loop invariant]] \"A[:i+1] is sorted\" 로 [[insertion sort]] 의 정확성을 증명하는 3단 흐름. Initialization = Base case, Maintenance = Inductive step, Termination = Conclusion ([[귀납법 4요소]])",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function kv(pts) {
      var p = pts.slice();
      if (p[0][0] > 0) p.unshift([0, p[0][1]]);
      if (p[p.length - 1][0] < D) p.push([D, p[p.length - 1][1]]);
      return 'values="' + p.map(function (q) { return q[1]; }).join(";") + '" keyTimes="' + p.map(function (q) { return r4(q[0] / D); }).join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function an(attr, pts) { return '<animate attributeName="' + attr + '" ' + kv(pts) + '/>'; }
    // 색 계단: [[t, 색], …] → t 에서 0.05초 만에 바뀜
    function steps(first, list) {
      var p = [[0, first]], prev = first;
      list.forEach(function (q) { p.push([q[0], prev]); p.push([q[0] + 0.05, q[1]]); prev = q[1]; });
      return p;
    }

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="loop invariant 증명 흐름 애니메이션">';
    s += '<defs><marker id="li_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "Loop invariant — 반복의 앞뒤에서 변하지 않는 조건"],
      [1.5, 3.5, "① Initialization: 첫 반복 전에 invariant 가 성립한다 (Base case)"],
      [3.5, 9.2, "② Maintenance: i 번째 반복 뒤 성립하면 i+1 번째 뒤에도 성립한다 (Inductive step)"],
      [9.2, 13, "③ Termination: 마지막 반복 뒤 invariant ⇒ 알고리즘이 정확하다 (Conclusion)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 3단 흐름 알약 ----
    var ph = [["Initialization", 1.5, 3.5], ["Maintenance", 3.5, 9.2], ["Termination", 9.2, 13]];
    ph.forEach(function (p, i) {
      var x = 30 + i * 142;
      var fillL = [[p[1], C.orL]]; if (p[2] < D) fillL.push([p[2], C.greenL]);
      var strL = [[p[1], C.or]]; if (p[2] < D) strL.push([p[2], C.green]);
      s += '<rect x="' + x + '" y="46" width="124" height="30" rx="15" stroke-width="2" fill="#f2f2f2" stroke="#bbb">' +
        an("fill", steps("#f2f2f2", fillL)) + an("stroke", steps("#bbb", strL)) + '</rect>';
      s += txt(x + 62, 66, p[0], 13, "#333", ' font-weight="700"');
      if (i < 2) s += '<line x1="' + (x + 126) + '" y1="61" x2="' + (x + 140) + '" y2="61" stroke="#555" stroke-width="1.5" marker-end="url(#li_arrow)"/>';
    });

    // ---- 배열 (삽입 정렬 [4,3,1,5,2]) ----
    s += txt(226, 110, "Loop invariant(i):  A[:i+1] is sorted.", 13, C.pur, ' font-weight="700"');
    var T = [1.5, 4.3, 5.6, 6.9, 8.2];                     // 칸 k 가 초록이 되는 시각
    var states = [[0, 4.3, [4, 3, 1, 5, 2]], [4.3, 5.6, [3, 4, 1, 5, 2]], [5.6, 8.2, [1, 3, 4, 5, 2]], [8.2, 13, [1, 2, 3, 4, 5]]];
    for (var k = 0; k < 5; k++) {
      var x = 60 + k * 68;
      var fl = [], st = [];
      if (k > 0) { fl.push([T[k] - 0.8, C.orL]); st.push([T[k] - 0.8, C.or]); }   // 끼워 넣을 원소 A[i] (cur_value)
      fl.push([T[k], C.greenL]); st.push([T[k], C.green]);
      s += '<rect x="' + x + '" y="126" width="60" height="52" rx="6" stroke-width="2.5" fill="' + C.blueL + '" stroke="' + C.blue + '">' +
        an("fill", steps(C.blueL, fl)) + an("stroke", steps(C.blue, st)) + '</rect>';
      // 값: 같은 값이 이어지는 구간은 하나로 합침
      var runs = [];
      states.forEach(function (q) {
        var v = q[2][k];
        if (runs.length && runs[runs.length - 1][2] === v) runs[runs.length - 1][1] = q[1];
        else runs.push([q[0], q[1], v]);
      });
      runs.forEach(function (r) { s += vis(r[0], r[1], txt(x + 30, 160, String(r[2]), 22, "#222", ' font-weight="700"')); });
      s += txt(x + 30, 196, "A[" + k + "]", 11, C.muted);
    }
    // 초록 구간 괄호
    s += '<rect x="58" y="118" height="5" rx="2.5" fill="' + C.green + '" width="0">' +
      an("width", [[1.5, 0], [1.55, 64], [4.3, 64], [4.35, 132], [5.6, 132], [5.65, 200], [6.9, 200], [6.95, 268], [8.2, 268], [8.25, 336]]) + '</rect>';

    // ---- 상태 줄 ----
    var lines = [
      [0, 1.5, "초록 = invariant 가 보장하는 정렬된 구간", ""],
      [1.5, 3.5, "i = 0 : A[:1] = [4] — 원소 하나는 정렬되어 있다 ✓", ""],
      [3.5, 4.3, "invariant(0) 이 성립한다고 두고 cur_value = 3 을 끼운다", ""],
      [4.3, 5.6, "i = 1 : A[:2] = [3, 4] 정렬 ✓", "invariant 유지"],
      [5.6, 6.9, "i = 2 : A[:3] = [1, 3, 4] 정렬 ✓", "invariant 유지"],
      [6.9, 8.2, "i = 3 : A[:4] = [1, 3, 4, 5] 정렬 ✓", "invariant 유지"],
      [8.2, 9.2, "i = 4 : A[:5] = [1, 2, 3, 4, 5] 정렬 ✓", "invariant 유지"],
      [9.2, 13, "마지막 반복(i = n−1) 뒤 A[:n] 이 정렬 —", "A[:n] 은 A 전체이므로 insertion sort 는 정확하다 ✓"]
    ];
    lines.forEach(function (l) {
      s += vis(l[0], l[1], txt(226, 232, l[2], 12.5, "#222", ' font-weight="700"') + (l[3] ? txt(226, 254, l[3], 12, C.green, ' font-weight="700"') : ""));
    });

    // ---- 귀납법 4요소 (오른쪽) ----
    s += txt(608, 110, "proof by induction 의 4요소", 13, C.pur, ' font-weight="700"');
    var rows = [
      ["Inductive Hypothesis", "invariant 가 i 번째 반복 뒤 성립", 3.5],
      ["Base case", "= Initialization: 첫 반복 전 성립", 1.5],
      ["Inductive step", "= Maintenance: i 번째 → i+1 번째", 3.5],
      ["Conclusion", "= Termination: 마지막 뒤 성립 ⇒ 정답", 9.2]
    ];
    rows.forEach(function (r, i) {
      var y = 120 + i * 50;
      s += '<rect x="468" y="' + y + '" width="280" height="44" rx="6" stroke-width="2" fill="#f4f4f4" stroke="#ccc">' +
        an("fill", steps("#f4f4f4", [[r[2], C.greenL]])) + an("stroke", steps("#ccc", [[r[2], C.green]])) + '</rect>';
      s += txt(478, y + 18, r[0], 12.5, "#222", ' text-anchor="start" font-weight="700"');
      s += txt(478, y + 36, r[1], 11.5, "#444", ' text-anchor="start"');
    });

    // ---- 요점 ----
    s += txt(380, 328, "Initialization + Maintenance ⇒ Termination — 무한히 많은 입력을 하나씩 확인하지 않고 귀납법으로 정확성 증명", 12, C.muted);
    s += '</svg>';
    return s;
  }
};
