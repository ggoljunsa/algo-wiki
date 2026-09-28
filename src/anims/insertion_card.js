// ============================================================
// insertion_card — L1 p.10–21 삽입 정렬 예제 [4,3,1,5,2] 를 카드 놀이로
// 칸 k 의 x = 200 + 80k, 바닥 y = 150, 집어 든 카드 y = 70.
// 시간축(초): 0 [4] 가 왼손 → 1.5 3 삽입 → 3.5 1 삽입 → 6 5 (밀기 없음) → 7.8 2 삽입 → 10.2 완료 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["insertion_card"] = {
  title: "삽입 정렬 — 카드를 한 장씩 왼손에 끼우기",
  desc: "[[insertion sort]]: 왼손(정렬된 [4])에 3, 1, 5, 2 를 한 장씩 집어 올바른 자리에 끼운다. cur_value 보다 큰 카드는 오른쪽으로 한 칸씩 밀린다 (A[j+1] = A[j]). 슬라이드 예제 [4,3,1,5,2] → [1,2,3,4,5]",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + (extra || "") + '/>';
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
    function mv(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kv(pts) + '/>'; }
    function an(attr, pts) { return '<animate attributeName="' + attr + '" ' + kv(pts) + '/>'; }

    var s = '<svg viewBox="0 0 760 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="삽입 정렬 카드 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "The first element, [4], is a sorted list — 왼손에 카드 한 장"],
      [1.5, 3.5, "3 을 집어(cur_value) 4 를 오른쪽으로 한 칸 밀고 끼운다 → [3, 4]"],
      [3.5, 6, "1 을 집어 4, 3 을 한 칸씩 밀고 맨 앞에 끼운다 → [1, 3, 4]"],
      [6, 7.8, "5 를 집었지만 4 &lt; 5 — 밀 카드가 없으니 제자리 → [1, 3, 4, 5]"],
      [7.8, 10.2, "2 를 집어 5, 4, 3 을 밀고 1 의 바로 오른쪽에 끼운다 → [1, 2, 3, 4, 5]"],
      [10.2, 14, "1 2 3 4 5 — Then we’re done!"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 왼손(정렬된 구간) 괄호 ----
    s += '<rect x="196" y="240" height="8" rx="4" fill="' + C.green + '" width="68">' +
      an("width", [[2.9, 68], [2.95, 148], [5.4, 148], [5.45, 228], [7.3, 228], [7.35, 308], [10.1, 308], [10.15, 388]]) + '</rect>';
    s += txt(196, 266, "왼손 = 정렬된 카드 A[:i+1]", 12, C.green, ' text-anchor="start" font-weight="700"');
    s += vis(0, 10.1, txt(584, 266, "테이블 위 카드", 12, C.blue, ' text-anchor="end"'));
    for (var k = 0; k < 5; k++) s += '<rect x="' + (200 + k * 80) + '" y="150" width="60" height="80" rx="8" fill="none" stroke="#ccc" stroke-dasharray="4 3"/>';

    // ---- 카드 ----
    function P(slot, up) { return (200 + slot * 80) + "," + (up ? 70 : 150); }
    function card(v, way, fillPts, strokePts) {
      var g = '<g transform="translate(' + P(way[0][1], way[0][2]) + ')">';
      g += mv(way.map(function (w) { return [w[0], P(w[1], w[2])]; }));
      g += '<rect width="60" height="80" rx="8" stroke-width="2.5" fill="' + fillPts[0][1] + '" stroke="' + strokePts[0][1] + '">' + an("fill", fillPts) + an("stroke", strokePts) + '</rect>';
      g += txt(30, 50, String(v), 26, "#222", ' font-weight="700"');
      return g + '</g>';
    }
    function col(t1, t2) { // 파랑 → (t1) 주황 → (t2) 초록
      return [[[t1, C.blueL], [t1 + 0.05, C.orL], [t2, C.orL], [t2 + 0.05, C.greenL]],
              [[t1, C.blue], [t1 + 0.05, C.or], [t2, C.or], [t2 + 0.05, C.green]]];
    }
    var c4 = [[[0, C.greenL]], [[0, C.green]]];
    var c3 = col(1.5, 2.9), c1 = col(3.5, 5.4), c5 = col(6.0, 7.3), c2 = col(7.8, 10.1);
    s += card(4, [[0, 0, 0], [1.9, 0, 0], [2.3, 1, 0], [3.9, 1, 0], [4.3, 2, 0], [8.6, 2, 0], [9.0, 3, 0]], c4[0], c4[1]);
    s += card(3, [[0, 1, 0], [1.5, 1, 0], [1.9, 1, 1], [2.3, 1, 1], [2.6, 0, 1], [2.9, 0, 0], [4.3, 0, 0], [4.7, 1, 0], [9.0, 1, 0], [9.4, 2, 0]], c3[0], c3[1]);
    s += card(5, [[0, 3, 0], [6.0, 3, 0], [6.4, 3, 1], [6.9, 3, 1], [7.3, 3, 0], [8.2, 3, 0], [8.6, 4, 0]], c5[0], c5[1]);
    s += card(1, [[0, 2, 0], [3.5, 2, 0], [3.9, 2, 1], [4.7, 2, 1], [5.1, 0, 1], [5.4, 0, 0]], c1[0], c1[1]);
    s += card(2, [[0, 4, 0], [7.8, 4, 0], [8.2, 4, 1], [9.4, 4, 1], [9.75, 1, 1], [10.1, 1, 0]], c2[0], c2[1]);

    // ---- 밀기 화살표 (한 칸 오른쪽) ----
    function push(t, fromSlot) {
      var x = 200 + fromSlot * 80 + 30;
      return vis(t, t + 0.45, '<path d="M' + (x - 14) + ',140 L' + (x + 66) + ',140" stroke="' + C.red + '" stroke-width="2" fill="none"/>' +
        '<path d="M' + (x + 66) + ',135 L' + (x + 74) + ',140 L' + (x + 66) + ',145 z" fill="' + C.red + '"/>');
    }
    s += push(1.85, 0) + push(3.85, 1) + push(4.25, 0) + push(8.15, 3) + push(8.55, 2) + push(8.95, 1);

    // ---- 상태 상자 (오른쪽) ----
    s += box(612, 70, 136, 118, "#fff", C.pur);
    s += txt(680, 90, "insertion_sort", 12, C.pur, ' font-weight="700"');
    var st = [
      [0, 1.5, "i = 0", "A[:1] = [4]", "정렬됨 ✓"],
      [1.5, 3.5, "i = 1", "cur_value = 3", "밀린 카드: 4"],
      [3.5, 6, "i = 2", "cur_value = 1", "밀린 카드: 4, 3"],
      [6, 7.8, "i = 3", "cur_value = 5", "밀린 카드: 없음"],
      [7.8, 10.2, "i = 4", "cur_value = 2", "밀린 카드: 5, 4, 3"],
      [10.2, 14, "끝", "A[:5] 정렬됨", "= 전체 정렬 ✓"]
    ];
    st.forEach(function (r) {
      s += vis(r[0], r[1], txt(680, 116, r[2], 13, "#222", ' font-weight="700"') + txt(680, 140, r[3], 12, (r[0] === 1.5 || r[0] === 3.5 || r[0] === 6 || r[0] === 7.8) ? C.or : C.green, ' font-weight="700"') + txt(680, 164, r[4], 12, r[4].indexOf("밀린") === 0 ? C.red : C.green));
    });

    // ---- 요점 ----
    s += txt(380, 302, "A[j] &gt; cur_value 인 동안 A[j+1] = A[j] (오른쪽으로 한 칸) — 매 단계 정렬된 왼손이 한 장씩 길어진다", 12.5, C.muted);
    s += '</svg>';
    return s;
  }
};
