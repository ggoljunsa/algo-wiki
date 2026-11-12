// ============================================================
// mst_cut_swap — L15 p.16–24: MST 보조정리의 교환 논증
// 그림은 p.18–23 의 도식 그대로: 정점 u, x (cut 왼쪽) / y, a, v, b (cut 오른쪽)
//   S (굵은 주황, cut 을 안 건넘) = u–x, y–a, v–b
//   MST T = S + x–y + a–b (노랑 형광),  T 밖 간선 = x–v, a–v,  light edge = (u,v) (자홍)
//   (u,v) 를 T 에 넣으면 cycle u–x–y–a–b–v–u. 그 cycle 에서 cut 을 건너는 다른 간선 = (x,y).
//   T' = T − (x,y) + (u,v): 여전히 spanning tree, w(u,v) ≤ w(x,y) 라서 cost(T') ≤ cost(T) → T' 도 MST, S ∪ {(u,v)} 포함.
// 시간축(초): 0–2 그래프·S → 2–4 cut, respects S → 4–6 crossing 간선 중 light (u,v) → 6–8 T 표시, (u,v) 는 T 밖
//   → 8–10 (u,v) 를 넣으면 cycle → 10–12 cycle 위 다른 crossing edge (x,y) 를 뺀다 → 12–16 T' 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["mst_cut_swap"] = {
  title: "MST 보조정리 — light edge 로 바꿔 끼우기 (16초)",
  desc: "L15 p.16–24. cut 이 S 를 respect 하고 S 를 포함하는 MST T 가 있을 때, cut 을 건너는 light edge (u,v) 를 넣어도 되는 이유를 보여 준다. " +
    "(u,v) 를 T 에 넣으면 cycle 이 생기고, 그 cycle 에는 cut 을 건너는 다른 간선 (x,y) 가 꼭 있다. (x,y) 를 빼면 다시 tree 이고, (u,v) 가 가장 가벼우니 cost 는 늘지 않는다. → [[MST 보조정리]]",
  duration: 16,
  build: function () {
    var D = 16;
    var C = { blue: "#1d65b3", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", pur: "#3b2f4a", red: "#d6465f", mag: "#d14fd6",
      yel: "#f3e24a", muted: "#777", ink: "#222", teal: "#1f8a6e", tealL: "#c9efe3" };
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
    function blink(from, to) {
      // from–to 동안 깜빡이고 그 뒤 사라짐
      var ks = [0], vs = [0], n = 4, step = (to - from) / (2 * n);
      ks.push(r4((from - 0.01) / D)); vs.push(0);
      ks.push(r4(from / D)); vs.push(1);
      for (var i = 1; i <= 2 * n; i++) { ks.push(r4((from + i * step) / D)); vs.push(i % 2 ? 0.25 : 1); }
      ks.push(r4(Math.min(D, to + 0.3) / D)); vs.push(0); ks.push(1); vs.push(0);
      return '<animate attributeName="opacity" values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"/>';
    }

    var P = { x: [520, 110], y: [690, 110], u: [370, 215], a: [610, 215], v: [520, 320], b: [690, 320] };
    function line(a, b, color, w, extra) {
      return '<line x1="' + P[a][0] + '" y1="' + P[a][1] + '" x2="' + P[b][0] + '" y2="' + P[b][1] + '" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round"' + (extra || "") + '/>';
    }
    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MST 보조정리 교환 논증 애니메이션">';

    var caps = [
      [0, 2, "S (굵은 주황) = 지금까지 고른 간선. S 를 포함하는 MST T 가 있다고 하자"],
      [2, 4, "cut 이 S 를 respect 한다 = S 의 어떤 간선도 cut 을 건너지 않는다"],
      [4, 6, "cut 을 건너는 간선 중 가장 가벼운 것 = light edge (u,v)"],
      [6, 8, "T (노랑) 에 (u,v) 가 없다고 하자"],
      [8, 10, "(u,v) 를 T 에 넣으면 cycle 이 생긴다 (u, v 는 이미 T 로 이어져 있다)"],
      [10, 12, "그 cycle 은 cut 을 한 번 더 건넌다 → 그 간선 (x,y) 를 뺀다"],
      [12, D, "T' = T − (x,y) + (u,v): 여전히 tree, cost(T') ≤ cost(T) → T' 도 MST"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 왼쪽 설명 상자 ----
    s += '<rect x="12" y="52" width="290" height="270" rx="10" fill="#fafbfd" stroke="#c9d2e3"/>';
    s += txt(157, 76, "Lemma (p.16)", 14, C.pur, ' font-weight="700"');
    var lem = ["cut 이 S 를 respect 하고", "S 를 포함하는 MST 가 있으면,", "cut 을 건너는 light edge (u,v) 에 대해", "S ∪ {(u,v)} 를 포함하는 MST 도 있다."];
    lem.forEach(function (l, i) { s += txt(28, 102 + i * 20, l, 12.5, C.ink, ' text-anchor="start"'); });
    s += vis(10, D, txt(28, 196, "• (x,y) 도 cut 을 건넌다", 12.5, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(11, D, txt(28, 218, "• (u,v) 는 light → w(u,v) ≤ w(x,y)", 12.5, C.mag, ' text-anchor="start" font-weight="700"'));
    s += vis(12.5, D, txt(28, 244, "cost(T') = cost(T) − w(x,y) + w(u,v)", 12.5, C.ink, ' text-anchor="start"') +
      txt(28, 264, "            ≤ cost(T)", 12.5, C.ink, ' text-anchor="start"'));
    s += vis(13.5, D, txt(28, 294, "T 가 최소였으니 T' 도 MST ✓", 13, C.green, ' text-anchor="start" font-weight="700"') +
      txt(28, 312, "\"It's safe to add this edge!\" (p.17)", 11.5, C.muted, ' text-anchor="start"'));

    // ---- cut 쪽 배경 ----
    s += vis(2, D, '<path d="M 335,60 L 600,60 C 600,150 470,190 455,360 L 335,360 Z" fill="#e8f0fb" opacity="0.7"/>' +
      txt(352, 352, "visited 쪽", 11, C.blue, ' text-anchor="start" font-weight="700"'));

    // ---- 간선 ----
    // T 밖 일반 간선
    s += line("x", "v", C.blue, 2) + line("a", "v", C.blue, 2);
    // T 형광 (노랑 halo): x–y 는 12 초에 사라짐, 나머지 유지
    s += vis(6, D, line("u", "x", C.yel, 14, ' opacity="0.8"') + line("y", "a", C.yel, 14, ' opacity="0.8"') + line("a", "b", C.yel, 14, ' opacity="0.8"') + line("v", "b", C.yel, 14, ' opacity="0.8"'));
    s += vis(6, 12, line("x", "y", C.yel, 14, ' opacity="0.8"'));
    // x–y 기본선 (T 의 얇은 간선) — 10–12 빨강 깜빡, 12 이후 점선 회색
    s += vis(0, 10, line("x", "y", C.blue, 2.5));
    s += '<g opacity="0">' + line("x", "y", C.red, 5) + blink(10, 12) + '</g>';
    s += vis(12, D, line("x", "y", "#b8b8b8", 2, ' stroke-dasharray="5 5"') + txt(640, 96, "뺀다", 12, C.red, ' font-weight="700"'));
    s += line("a", "b", C.blue, 2.5);
    // S (굵은 주황)
    s += line("u", "x", C.or, 7) + line("y", "a", C.or, 7) + line("v", "b", C.or, 7);
    // light edge (u,v)
    s += vis(0, 4, line("u", "v", C.blue, 2.5));
    s += vis(4, 8, line("u", "v", C.mag, 7, ' stroke-dasharray="9 6"'));
    s += vis(8, D, line("u", "v", C.mag, 8));
    s += vis(4, 8, txt(418, 288, "light", 12.5, C.mag, ' font-weight="700"'));
    s += vis(12, D, line("u", "v", C.yel, 16, ' opacity="0.55"'));
    // cycle 표시 (8–12): 점선 빨강 테두리 경로
    s += vis(8, 12, '<path d="M 370,215 L 520,110 L 690,110 L 610,215 L 690,320 L 520,320 Z" fill="none" stroke="' + C.red + '" stroke-width="2" stroke-dasharray="4 4"/>' +
      txt(600, 170, "cycle", 13, C.red, ' font-weight="700"'));

    // ---- cut 곡선 ----
    s += vis(2, D, '<path d="M 600,48 C 600,150 470,190 455,362" fill="none" stroke="' + C.red + '" stroke-width="3" stroke-dasharray="9 7"/>' + txt(612, 58, "cut", 13, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(4, 6, txt(560, 362, "cut 을 건너는 간선: (x,y), (u,v), (x,v)", 12, C.pur, ' text-anchor="start" font-weight="700"'));

    // ---- 정점 ----
    Object.keys(P).forEach(function (k) {
      var left = k === "u" || k === "x";
      s += '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="18" fill="' + C.tealL + '" stroke="' + C.teal + '" stroke-width="2">' +
        (left ? '<animate attributeName="fill" calcMode="discrete" values="' + C.tealL + ';' + C.teal + ';' + C.teal + '" keyTimes="0;' + r4(2 / D) + ';1" dur="' + D + 's" fill="freeze"/>' : "") + '</circle>';
      s += '<text x="' + P[k][0] + '" y="' + (P[k][1] + 5) + '" font-size="15" text-anchor="middle" font-weight="700" fill="' + C.ink + '">' +
        (left ? '<animate attributeName="fill" calcMode="discrete" values="' + C.ink + ';#fff;#fff" keyTimes="0;' + r4(2 / D) + ';1" dur="' + D + 's" fill="freeze"/>' : "") + k + '</text>';
    });
    s += vis(12, D, txt(530, 352, "T' (노랑) = 여전히 모든 정점을 잇는 tree", 12.5, C.green, ' font-weight="700"'));
    s += '</svg>';
    return s;
  }
};
