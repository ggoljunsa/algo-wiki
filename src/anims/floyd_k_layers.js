// ============================================================
// floyd_k_layers — L12 p.42 예제 그래프로 Floyd-Warshall: 경유 허용 정점을 s, u, v, t 순서로 하나씩 늘릴 때 바뀌는 칸
// 그래프 (p.42): s→u 2, u→s 1, s→v 5, u→v 2, v→t −2   (정점 번호 1 = s, 2 = u, 3 = v, 4 = t)
// 검산(Python Floyd-Warshall):
//   k = s : 바뀌는 칸 없음
//   k = u : D[s,v] 5 → 4   (s→u→v = 2 + 2)
//   k = v : D[s,t] ∞ → 2   (D[s,v] + D[v,t] = 4 − 2),  D[u,t] ∞ → 0   (2 − 2)
//   k = t : 바뀌는 칸 없음
//   최종 D = [[0,2,4,2],[1,0,2,0],[∞,∞,0,−2],[∞,∞,∞,0]]  (p.42 표와 같음)
// 시간축(초): 0–2.2 D(0) → 2.2 k=s → 4.2 k=u → 7.2 k=v → 10.6 k=t → 12.2–14 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["floyd_k_layers"] = {
  title: "Floyd-Warshall — 경유지를 하나씩 허용할 때 바뀌는 칸 (14초)",
  desc: "L12 p.42–53. [[D^(k)[u,v]]] = 중간 정점이 {1, …, k} 안에 있는 u→v 최단 비용. k 를 허용했을 때 '''k 를 거치는 쪽이 더 짧으면'''(Case 2) $D^{(k-1)}[u,k] + D^{(k-1)}[k,v]$ 로 바뀌고, 아니면(Case 1) 그대로 — [[Floyd-Warshall]] $O(n^3)$.",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", ink: "#222", line: "#b9c4d8", w: "#b5541c" };
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
    function num(v) { return v === Infinity ? "∞" : (v < 0 ? "−" + (-v) : String(v)); }
    function sup(k, rest) { return 'D<tspan font-size="9" dy="-6">(' + k + ')</tspan><tspan dy="6">' + (rest || "") + '</tspan>'; }

    var N = ["s", "u", "v", "t"];
    var W = { "s,u": 2, "u,s": 1, "s,v": 5, "u,v": 2, "v,t": -2 };
    // Floyd-Warshall (build 안에서 계산 → 머리 주석의 검산값과 같다)
    var Ms = [], cur = {};
    N.forEach(function (a) { N.forEach(function (b) { cur[a + "," + b] = a === b ? 0 : (W[a + "," + b] !== undefined ? W[a + "," + b] : Infinity); }); });
    Ms.push(cur);
    N.forEach(function (k) {
      var nx = {};
      N.forEach(function (a) { N.forEach(function (b) { var via = cur[a + "," + k] + cur[k + "," + b]; nx[a + "," + b] = Math.min(cur[a + "," + b], via); }); });
      Ms.push(nx); cur = nx;
    });
    var KT = [0, 2.2, 4.2, 7.2, 10.6, 12.2];   // Ms[i] 가 보이기 시작하는 시각 (i = 0..4), 마지막은 정리 시작

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Floyd-Warshall 애니메이션">';
    s += '<defs><marker id="fw_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.blue + '"/></marker>' +
      '<marker id="fw_arrow_o" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="' + C.or + '"/></marker></defs>';
    var caps = [
      [0, KT[1], "D(0)[x,y] = weight(x,y): 경유 정점 없이 바로 가는 edge 만"],
      [KT[1], KT[2], "k = s 허용: x→s→y 가 더 짧은 칸? 없음 → 전부 Case 1"],
      [KT[2], KT[3], "k = u 허용: s→u→v = 2 + 2 = 4 &lt; 5 → Case 2, D[s,v] = 4"],
      [KT[3], KT[4], "k = v 허용: s→…→v→t = 4 − 2 = 2, u→v→t = 2 − 2 = 0"],
      [KT[4], KT[5], "k = t 허용: t 에서 나가는 edge 가 없다 → 바뀌는 칸 없음"],
      [KT[5], D, "D(n) = 모든 쌍 최단거리 (p.42 표와 같다)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 그래프 (왼쪽) ----
    var P = { s: [150, 92], u: [312, 136], v: [244, 246], t: [62, 230] };
    function seg(a, b, off) {
      var pa = P[a], pb = P[b], dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
      var nx = -uy * off, ny = ux * off;
      return [Math.round(pa[0] + ux * 21 + nx), Math.round(pa[1] + uy * 21 + ny), Math.round(pb[0] - ux * 21 + nx), Math.round(pb[1] - uy * 21 + ny)];
    }
    var EG = { "s,u": seg("s", "u", -5), "u,s": seg("u", "s", -5), "s,v": seg("s", "v", 0), "u,v": seg("u", "v", 0), "v,t": seg("v", "t", 0) };
    var LBL = { "s,u": [236, 98], "u,s": [222, 136], "s,v": [184, 176], "u,v": [292, 198], "v,t": [152, 254] };
    Object.keys(EG).forEach(function (k) {
      var g = EG[k];
      s += '<line x1="' + g[0] + '" y1="' + g[1] + '" x2="' + g[2] + '" y2="' + g[3] + '" stroke="' + C.blue + '" stroke-width="2.2" marker-end="url(#fw_arrow)"/>';
      s += txt(LBL[k][0], LBL[k][1], num(W[k]), 13, C.w, ' font-weight="700"');
    });
    function path(keys, from, to) {
      var g = "";
      keys.forEach(function (k) { var e = EG[k]; g += '<line x1="' + e[0] + '" y1="' + e[1] + '" x2="' + e[2] + '" y2="' + e[3] + '" stroke="' + C.or + '" stroke-width="6" stroke-opacity="0.75" stroke-linecap="round" marker-end="url(#fw_arrow_o)"/>'; });
      return vis(from, to, g);
    }
    s += vis(KT[2] + 0.4, KT[3], '<line x1="' + EG["s,v"][0] + '" y1="' + EG["s,v"][1] + '" x2="' + EG["s,v"][2] + '" y2="' + EG["s,v"][3] + '" stroke="' + C.red + '" stroke-width="3" stroke-dasharray="4 4"/>' +
      txt(178, 196, "5 ✗", 12, C.red, ' text-anchor="end" font-weight="700"'));
    s += path(["s,u", "u,v"], KT[2] + 0.4, KT[3]);
    s += path(["s,u", "u,v", "v,t"], KT[3] + 0.4, KT[3] + 2.0);
    s += path(["u,v", "v,t"], KT[3] + 2.0, KT[4]);
    // 정점 (허용된 경유지는 보라 채움)
    N.forEach(function (v, i) {
      var p = P[v], t = KT[i + 1];
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="19" fill="' + C.greenL + '" stroke="' + C.pur + '" stroke-width="2">' +
        '<animate attributeName="fill" calcMode="discrete" values="' + C.greenL + ';' + C.purL + '" keyTimes="0;' + r4(t / D) + '" dur="' + D + 's" fill="freeze"/>' +
        '<animate attributeName="stroke-width" calcMode="discrete" values="2;4" keyTimes="0;' + r4(t / D) + '" dur="' + D + 's" fill="freeze"/></circle>';
      s += txt(p[0], p[1] + 6, v, 16, C.ink, ' font-weight="700"');
    });
    var allow = ["{ }", "{ s }", "{ s, u }", "{ s, u, v }", "{ s, u, v, t }"];
    allow.forEach(function (a, i) {
      s += vis(KT[i], i < 4 ? KT[i + 1] : D, txt(24, 300, "경유 허용 정점: " + a, 13, C.pur, ' text-anchor="start" font-weight="700"'));
    });

    // ---- 행렬 (오른쪽) ----
    var MX = 446, MY = 78, CW = 62, CH = 32;
    s += txt(MX - 34, MY - 22, "행 = 출발, 열 = 도착", 10, C.muted, ' text-anchor="start"');
    N.forEach(function (v, j) { s += txt(MX + CW * j + CW / 2, MY - 8, v, 14, C.ink, ' font-weight="700"'); });
    N.forEach(function (v, r) { s += txt(MX - 16, MY + CH * r + 21, v, 14, C.ink, ' font-weight="700"'); });
    // k 행·열 (D[x,k], D[k,y]) 음영
    N.forEach(function (k, i) {
      var g = "";
      N.forEach(function (o, j) {
        g += '<rect x="' + (MX + CW * j) + '" y="' + (MY + CH * i) + '" width="' + CW + '" height="' + CH + '" fill="' + C.purL + '"/>';
        if (j !== i) g += '<rect x="' + (MX + CW * i) + '" y="' + (MY + CH * j) + '" width="' + CW + '" height="' + CH + '" fill="' + C.purL + '"/>';
      });
      s += vis(KT[i + 1], KT[i + 2], g);
    });
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      s += '<rect x="' + (MX + CW * c) + '" y="' + (MY + CH * r) + '" width="' + CW + '" height="' + CH + '" fill="none" stroke="' + C.pur + '" stroke-width="1.2"/>';
    }
    Ms.forEach(function (M, i) {
      var from = KT[i], to = i < 4 ? KT[i + 1] : D;
      var g = "";
      N.forEach(function (a, r) {
        N.forEach(function (b, c) {
          var key = a + "," + b, ch = i > 0 && M[key] !== Ms[i - 1][key];
          var x = MX + CW * c, y = MY + CH * r;
          if (ch) g += '<rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (CW - 6) + '" height="' + (CH - 6) + '" rx="3" fill="' + C.orL + '" stroke="' + C.or + '" stroke-width="2"/>' +
            txt(x + 12, y + 20, num(Ms[i - 1][key]), 10, C.muted, ' text-decoration="line-through"');
          g += txt(x + CW / 2 + (ch ? 8 : 0), y + 21, num(M[key]), 14, ch ? C.ink : C.ink, ch ? ' font-weight="800"' : '');
        });
      });
      s += vis(from, to, g);
      var lab = i === 0 ? "0" : String(i);
      s += vis(from, to, txt(MX + CW * 2, MY + CH * 4 + 22, sup(lab, " (k = " + (i === 0 ? "0" : N[i - 1]) + ")"), 14, C.pur, ' font-weight="700"'));
    });
    // 계산식
    var notes = [
      [KT[1], KT[2], ["u→s→v = 1 + 5 = 6 &gt; 2 → 그대로", "t→s, v→s 는 ∞ → 그대로"]],
      [KT[2], KT[3], ["D[s,v] = min{ 5, D[s,u] + D[u,v] }", "        = min{ 5, 2 + 2 } = 4  (Case 2)"]],
      [KT[3], KT[4], ["D[s,t] = min{ ∞, D[s,v] + D[v,t] } = 4 − 2 = 2", "D[u,t] = min{ ∞, D[u,v] + D[v,t] } = 2 − 2 = 0"]],
      [KT[4], KT[5], ["D[t,·] 이 ∞ (t 는 막다른 곳)", "→ x→t→y 가 더 짧을 수 없다 (Case 1)"]],
      [KT[5], D, ["최종 행렬 = p.42 표: s 행 0 2 4 2", "n = 4 번 × n² 칸 = O(n³)"]]
    ];
    notes.forEach(function (nt) {
      s += vis(nt[0], nt[1], txt(MX - 30, 264, nt[2][0], 12, C.ink, ' text-anchor="start" font-weight="700"') + txt(MX - 30, 284, nt[2][1], 12, C.ink, ' text-anchor="start" font-weight="700"'));
    });

    s += '<line x1="20" y1="316" x2="740" y2="316" stroke="' + C.line + '"/>';
    s += txt(380, 337, sup("k", "[u,v] = min{ ") + sup("k−1", "[u,v],  ") + sup("k−1", "[u,k] + ") + sup("k−1", "[k,v] }"), 14, C.pur, ' font-weight="700"');
    s += txt(380, 355, "Case 1: k 를 안 거치는 게 최단 → 그대로 / Case 2: u→k→v 로 이어 붙이기", 11.5, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
