// ============================================================
// two_questions — L1 p.7–9 "You might have two questions at this point…"
// 시간축(초): 0 알고리즘 상자 → 1.5 ① Does this actually work? 카드 → 3.5 증명 도구 3개
//   → 5 ② Is it fast? 카드 → 6.5 분석 도구 3개 → 8 L1~L7 알고리즘이 두 칸에 채워짐 → 12 끝
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["two_questions"] = {
  title: "두 가지 질문 — Does it work? / Is it fast?",
  desc: "모든 알고리즘에 던지는 두 질문: ① '''Does this actually work?''' → [[loop invariant]]·[[recursion invariant]]·[[귀납법]] / ② '''Is it fast?''' → [[asymptotic analysis]]·[[점화식]]·[[expected running time]]",
  duration: 12,
  build: function () {
    var D = 12;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function box(x, y, w, h, fill, stroke, extra) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"' + (extra || "") + '/>';
    }
    // from~to 초에만 보이기 (0.12초 페이드, to >= D 이면 끝까지 유지)
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    // [[t, 값], …] → values/keyTimes (0 과 D 를 자동으로 채움)
    function kv(pts) {
      var p = pts.slice();
      if (p[0][0] > 0) p.unshift([0, p[0][1]]);
      if (p[p.length - 1][0] < D) p.push([D, p[p.length - 1][1]]);
      return 'values="' + p.map(function (q) { return q[1]; }).join(";") + '" keyTimes="' + p.map(function (q) { return r4(q[0] / D); }).join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function mv(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kv(pts) + '/>'; }

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="두 가지 질문 애니메이션">';
    s += '<defs><marker id="tq_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "Insertion sort 를 보고 나면 — You might have two questions at this point…"],
      [1.5, 3.5, "① Does this actually work? — 모든 입력에서 정말 정렬되는가"],
      [3.5, 5, "→ 증명 도구: loop invariant · recursion invariant · 귀납법 (proof by induction)"],
      [5, 6.5, "② Is it fast? — 입력 크기 n 이 커질 때 수행 시간이 어떻게 늘어나는가"],
      [6.5, 8, "→ 분석 도구: asymptotic analysis · 점화식 (recurrence) · expected running time"],
      [8, 12, "L1~L7 의 알고리즘마다 두 칸이 모두 채워진다"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 알고리즘 상자 ----
    s += box(270, 42, 220, 40, C.purL, C.pur);
    s += txt(380, 67, "Algorithm  (예: insertion_sort)", 13, C.pur, ' font-weight="700"');

    // ---- 카드 두 장 ----
    function card(x, col, colL, head, from) {
      var g = '<g opacity="0">' + mv([[from, "0,-40"], [from + 0.6, "0,0"]]);
      g += '<line x1="380" y1="82" x2="' + (x + 170) + '" y2="98" stroke="#555" stroke-width="1.5" marker-end="url(#tq_arrow)"/>';
      g += box(x, 100, 340, 208, colL, col);
      g += txt(x + 170, 124, head, 15, col, ' font-weight="700"');
      g += show(from, D) + '</g>';
      return g;
    }
    s += card(30, C.green, C.greenL, "① Does this actually work?", 1.5);
    s += card(390, C.blue, C.blueL, "② Is it fast?", 5);

    // ---- 도구 알약 ----
    function pills(x0, list, col, t0) {
      var g = "", x = x0;
      list.forEach(function (p, i) {
        g += vis(t0 + i * 0.4, D, box(x, 136, p[1], 24, "#fff", col, ' rx="12"') + txt(x + p[1] / 2, 152, p[0], 11.5, col, ' font-weight="700"'));
        x += p[1] + 6;
      });
      return g;
    }
    s += pills(40, [["loop invariant", 100], ["recursion invariant", 128], ["귀납법", 70]], C.green, 3.6);
    s += pills(398, [["asymptotic analysis", 122], ["점화식", 56], ["expected running time", 132]], C.blue, 6.6);
    s += vis(3.6, D, txt(200, 180, "증명 (correctness)", 11, C.muted));
    s += vis(6.6, D, txt(560, 180, "수행 시간 분석 (runtime)", 11, C.muted));

    // ---- L1~L7 알고리즘 채우기 ----
    var left = [
      "L1 insertion sort — loop invariant",
      "L3 mergesort — recursion invariant",
      "L4 select — 귀납법 (입력 크기)",
      "L5 radix sort — 귀납법 (자릿수, stable)",
      "L6 quicksort — 귀납법",
      "L7 universal hashing — P(충돌) ≤ 1/n"
    ];
    var right = [
      "L1–L2 insertion sort — Θ(n²)",
      "L3 mergesort — Θ(n log n)",
      "L4 select — O(n)  (median of medians)",
      "L5 counting sort — Θ(n+k)",
      "L6 quicksort — 기대 O(n log n)",
      "L7 hashing — search 기대 O(1)"
    ];
    left.forEach(function (t, i) { s += vis(8.2 + i * 0.4, D, txt(48, 204 + i * 18, "✓ " + t, 12, "#1f5f33", ' text-anchor="start"')); });
    right.forEach(function (t, i) { s += vis(8.2 + i * 0.4, D, txt(408, 204 + i * 18, "⏱ " + t, 12, "#174f8c", ' text-anchor="start"')); });

    // ---- 요점 ----
    s += txt(380, 330, "새 알고리즘을 볼 때마다 같은 두 질문: Does it work? (증명) · Is it fast? (분석)", 12.5, C.muted);
    s += '</svg>';
    return s;
  }
};
