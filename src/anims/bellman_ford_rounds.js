// ============================================================
// bellman_ford_rounds — L11 p.71–75 / p.80–85: d^(i) 행을 라운드마다 채운다. 음수 간선 없음 → n−1 라운드 후 고정,
//   negative cycle → n 번째 라운드에서도 값이 바뀐다
// 장면 A (p.71, 무방향 = 양방향): Gates–R1 1, R1–E3 1, E3–Park 4, R1–HG 22, Park–HG 20, Gates–HG 25
//   검산(Python): d0 = 0 ∞ ∞ ∞ ∞ / d1 = 0 1 ∞ ∞ 25 / d2 = 0 1 2 45 23 / d3 = 0 1 2 6 23 / d4 = d3   (슬라이드와 같음)
// 장면 B (p.82): Gates↔R1 1, R1↔E3 1, E3↔Park 4, Park↔HG 10, Gates→HG −3, HG→R1 −2
//   검산(Python, d^(i+1)[v] = min(d^(i)[v], min_u d^(i)[u] + w(u,v))):
//   d0 = 0 ∞ ∞ ∞ ∞ / d1 = 0 1 ∞ ∞ −3 / d2 = 0 −5 2 7 −3 / d3 = −4 −5 −4 6 −3 / d4 = −4 −5 −4 0 −7 / d5 = −4 −9 −4 0 −7
//   ※ 슬라이드 p.82 표는 Park 칸을 d4 = 6, d5 = 3 으로 적었지만 E3→Park(−4 + 4 = 0) 갱신이 빠진 값이다. 여기서는 정의대로 계산한 값을 쓴다.
//   negative cycle: Gates→HG→R1→Gates = −3 −2 +1 = −4
// 시간축(초): 장면 A 0–7.4 (행 0.8/1.9/3.0/4.1/5.2) → 장면 B 7.6–15 (행 8.2/9.0/9.8/10.6/11.4, n 번째 행 12.4)
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bellman_ford_rounds"] = {
  title: "Bellman-Ford — 라운드마다 간선 하나씩 더 멀리 (15초)",
  desc: "L11 p.71–85. [[d^(i) 배열]] $d^{(i)}[v]$ = 간선 '''i 개 이하'''를 쓰는 경로 중 최단 비용. 음수 간선이 있어도 n−1 라운드면 고정되고([[Bellman-Ford]]), n 번째 라운드에서 값이 또 바뀌면 [[negative cycle]] 이다.",
  duration: 15,
  build: function () {
    var D = 15;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222", line: "#b9c4d8", w: "#b5541c", cell: "#f8dccd" };
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

    var V = ["Gates", "R1", "E3", "Park", "HG"];
    var P = { Gates: [622, 64], E3: [696, 112], R1: [540, 154], Park: [678, 218], HG: [602, 296] };
    // 간선: [u, v, w, 양방향?, 곡선?]
    var SA = [["Gates", "R1", 1, 1], ["R1", "E3", 1, 1], ["E3", "Park", 4, 1], ["R1", "HG", 22, 1], ["Park", "HG", 20, 1], ["Gates", "HG", 25, 1, 1]];
    var SB = [["Gates", "R1", 1, 1], ["R1", "E3", 1, 1], ["E3", "Park", 4, 1], ["Park", "HG", 10, 1], ["Gates", "HG", -3, 0, 1], ["HG", "R1", -2, 0]];
    function bf(E, rounds) {
      var d = {}; V.forEach(function (v) { d[v] = Infinity; }); d.Gates = 0;
      var rows = [d], why = [[]];
      for (var i = 0; i < rounds; i++) {
        var prev = rows[rows.length - 1], nx = {}, used = [];
        V.forEach(function (v) { nx[v] = prev[v]; });
        E.forEach(function (e) {
          [[e[0], e[1]]].concat(e[3] ? [[e[1], e[0]]] : []).forEach(function (uv) {
            var c = prev[uv[0]] + e[2];
            if (c < nx[uv[1]]) { nx[uv[1]] = c; used = used.filter(function (x) { return x[1] !== uv[1]; }); used.push([uv[0], uv[1], e]); }
          });
        });
        rows.push(nx); why.push(used);
      }
      return { rows: rows, why: why };
    }
    function geom(e) {   // 간선 모양: 곡선이면 2차 베지어
      var a = P[e[0]], b = P[e[1]];
      if (e[4]) return { d: "M" + (a[0] - 30) + "," + (a[1] + 6) + " Q440,190 " + (b[0] - 26) + "," + (b[1] - 8), lx: 500, ly: 190 };
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
      var x1 = a[0] + ux * 22, y1 = a[1] + uy * 14, x2 = b[0] - ux * 22, y2 = b[1] - uy * 14;
      return { d: "M" + Math.round(x1) + "," + Math.round(y1) + " L" + Math.round(x2) + "," + Math.round(y2), lx: Math.round((a[0] + b[0]) / 2 + uy * 13), ly: Math.round((a[1] + b[1]) / 2 - ux * 13 + 4) };
    }

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bellman-Ford 라운드 애니메이션">';
    s += '<defs><marker id="bf_arrow" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + C.blue + '"/></marker></defs>';

    function scene(E, rounds, RT, start, end, capTexts, finalCap, directed) {
      var R = bf(E, rounds), g = "";
      var caps = [[start, RT[1], capTexts[0]]];
      for (var i = 1; i < RT.length; i++) caps.push([RT[i], i + 1 < RT.length ? RT[i + 1] : RT[i] + 0.8, capTexts[i]]);
      caps.push([RT[RT.length - 1] + 0.8, end, finalCap]);
      caps.forEach(function (c) { g += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });
      // 표 머리
      V.forEach(function (v, j) { g += txt(109 + 58 * j, 60, v, 12, C.ink, ' font-weight="700"'); });
      R.rows.forEach(function (row, i) {
        var y = 70 + i * 32, t = RT[i];
        var extra = i === rounds && rounds === 5;
        g += txt(48, y + 19, 'd<tspan font-size="9" dy="-6">(' + i + ')</tspan>', 15, extra ? C.red : C.ink, ' font-weight="700"');
        V.forEach(function (v, j) {
          var x = 80 + 58 * j, ch = i > 0 && row[v] !== R.rows[i - 1][v];
          g += '<rect x="' + x + '" y="' + y + '" width="58" height="26" fill="' + C.cell + '" stroke="' + C.pur + '" stroke-width="1.5"/>';
          g += vis(t, end, (ch ? '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="54" height="22" fill="' + (extra ? C.redL : C.orL) + '" stroke="' + (extra ? C.red : C.or) + '" stroke-width="2"/>' : "") +
            txt(x + 29, y + 18, num(row[v]), 13, ch ? (extra ? C.red : C.ink) : C.ink, ch ? ' font-weight="800"' : ''));
        });
      });
      // 그래프
      E.forEach(function (e) {
        var G = geom(e);
        g += '<path d="' + G.d + '" fill="none" stroke="' + C.blue + '" stroke-width="2.2"' + (directed ? ' marker-end="url(#bf_arrow)"' + (e[3] ? ' marker-start="url(#bf_arrow)"' : "") : "") + '/>';
        g += txt(G.lx, G.ly, num(e[2]), 13, C.w, ' font-weight="700"');
      });
      // 라운드마다 갱신에 쓰인 간선
      for (var i = 1; i < R.rows.length; i++) {
        var hl = "";
        R.why[i].forEach(function (w) { hl += '<path d="' + geom(w[2]).d + '" fill="none" stroke="' + C.or + '" stroke-width="7" stroke-opacity="0.55" stroke-linecap="round"/>'; });
        if (hl) g += vis(RT[i], i + 1 < RT.length ? RT[i + 1] : RT[i] + 0.8, hl);
      }
      V.forEach(function (v) {
        var p = P[v];
        g += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="26" ry="13" fill="' + C.greenL + '" stroke="' + C.pur + '" stroke-width="1.5"/>' + txt(p[0], p[1] + 4, v, 11, C.ink, ' font-weight="700"');
        R.rows.forEach(function (row, i) {
          var to = i + 1 < RT.length ? RT[i + 1] : end;
          var bx = v === "R1" ? p[0] - 58 : p[0] + (v === "HG" ? 30 : 24), by = v === "HG" ? p[1] - 9 : p[1] - 26;
          g += vis(RT[i], to, '<rect x="' + bx + '" y="' + by + '" width="34" height="18" rx="3" fill="#fff" stroke="' + C.pur + '"/>' +
            txt(bx + 17, by + 14, num(row[v]), 12, C.pur, ' font-weight="700"'));
        });
      });
      return '<g opacity="0">' + g + show(start, end) + '</g>';
    }

    var A_RT = [0.8, 1.9, 3.0, 4.1, 5.2];
    s += scene(SA, 4, A_RT, 0, 7.5, [
      "d(0): 시작점 Gates 만 0, 나머지 ∞",
      "d(1): 간선 1개까지 — R1 = 1, HG = 25",
      "d(2): 간선 2개까지 — E3 = 2, Park = 25 + 20 = 45, HG = 1 + 22 = 23",
      "d(3): 간선 3개까지 — Park = 2 + 4 = 6",
      "d(4): 바뀐 칸 없음 — n−1 = 4 라운드 후 고정"
    ], "dist(Gates, v) = d(n−1)[v] = 0, 1, 2, 6, 23", false);
    s += vis(0.8, 7.5, txt(30, 296, "d(i)[v] = 간선 i 개 이하 경로 중 최단 비용", 12, C.pur, ' text-anchor="start" font-weight="700"') +
      txt(30, 316, "simple path 는 간선 ≤ n−1 개 → n−1 라운드면 충분", 12, C.muted, ' text-anchor="start"'));

    var B_RT = [8.2, 9.0, 9.8, 10.6, 11.4, 12.4];
    s += scene(SB, 5, B_RT, 7.6, D, [
      "음수 간선이 있는 그래프 (p.80–82): 같은 규칙으로 채운다",
      "d(1): R1 = 1, HG = −3",
      "d(2): R1 = −3 −2 = −5, E3 = 2, Park = −3 + 10 = 7",
      "d(3): Gates = −5 + 1 = −4 — 시작점까지 줄어든다!",
      "d(4) = d(n−1): Park = −4 + 4 = 0, HG = −4 −3 = −7",
      "n 번째 라운드 d(5): R1 = −7 −2 = −9 — 또 바뀌었다"
    ], "d(n−1) ≠ d(n) → NEGATIVE CYCLE 반환", true);
    var cyc = "";
    [SB[4], SB[5], SB[0]].forEach(function (e) { cyc += '<path d="' + geom(e).d + '" fill="none" stroke="' + C.red + '" stroke-width="7" stroke-opacity="0.6" stroke-linecap="round"/>'; });
    s += vis(13.2, D, cyc + txt(600, 340, "Gates→HG→R1→Gates = −3 −2 +1 = −4 &lt; 0", 12, C.red, ' font-weight="700"'));
    s += vis(8.2, D, txt(30, 280, "※ p.82 표의 Park 칸(d(4)=6, d(5)=3)은 E3→Park 갱신이", 10.5, C.muted, ' text-anchor="start"') +
      txt(30, 294, "    빠진 값 — 정의대로 계산하면 0, 0", 10.5, C.muted, ' text-anchor="start"'));
    s += vis(13.2, D, txt(30, 318, "한 라운드 더 돌려서 바뀌면 negative cycle", 12, C.red, ' text-anchor="start" font-weight="700"'));

    s += txt(380, 362, "Bellman-Ford: n−1 라운드 × 모든 간선 = O(nm) — 음수 간선 OK, negative cycle 은 n 번째 라운드로 검출", 12, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
