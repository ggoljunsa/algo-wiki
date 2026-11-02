// ============================================================
// dijkstra_yoink — L11 p.15–22: 공(정점)을 줄(간선)로 묶고 Gates 를 들어 올리면 가까운 공부터 바닥에서 뜬다
// 그래프 (p.15, 무방향): Gates–R1 1, R1–E3 1, E3–Park 4, R1–Halmae Gomtang 22, Park–Halmae Gomtang 20, Gates–Halmae Gomtang 25
// 검산(Python heapq Dijkstra): sure 순서 Gates 0 → R1 1 → E3 2 → Park 6 → Halmae Gomtang 23 (= 1 + 22; 25 와 2+4+20=26 보다 작음)
//   최단경로 트리 = Gates–R1, R1–E3, E3–Park, R1–Halmae (p.21–22 그림과 같음)
// 높이는 슬라이드처럼 "순서만 맞춘" 그림 (축척 아님): 매단 깊이 R1 50 < E3 100 < Park 160 < Halmae 215 (px)
// 시간축(초): 0–1.5 바닥 → 1.5–10 Gates 를 들어 올림 (각 공이 뜨는 시각 3.33 / 5.16 / 7.36 / 9.38) → 10.6–14 줄 정리
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["dijkstra_yoink"] = {
  title: "Dijkstra — YOINK! 들어 올리면 가까운 공부터 뜬다 (14초)",
  desc: "L11 p.15–22. 정점 = 공, 간선 = weight 길이의 줄. Gates 를 잡고 들어 올리면 공이 '''가까운 순서'''로 바닥에서 떨어진다 — 그 순서가 [[Dijkstra]] 가 정점을 sure 로 만드는 순서이고, 팽팽해진 줄이 최단경로 트리다. [[Dijkstra 줄과 중력 직관]]",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", ink: "#222", line: "#b9c4d8", skin: "#f1c7a4", w: "#b5541c" };
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
    function anim(attr, pts) { return '<animate attributeName="' + attr + '" ' + kf(pts) + '/>'; }
    function step(attr, pts) { return '<animate attributeName="' + attr + '" calcMode="discrete" ' + kf(pts) + '/>'; }
    function at(tr, t) {
      if (t <= tr[0][0]) return [tr[0][1], tr[0][2]];
      for (var i = 1; i < tr.length; i++) if (t <= tr[i][0]) {
        var u = (t - tr[i - 1][0]) / (tr[i][0] - tr[i - 1][0]);
        return [tr[i - 1][1] + u * (tr[i][1] - tr[i - 1][1]), tr[i - 1][2] + u * (tr[i][2] - tr[i - 1][2])];
      }
      var l = tr[tr.length - 1]; return [l[1], l[2]];
    }
    function mover(tr, inner) {
      return '<g><animateTransform attributeName="transform" type="translate" ' + kf(tr.map(function (p) { return [p[0], Math.round(p[1]) + "," + Math.round(p[2])]; })) + '/>' + inner + '</g>';
    }
    // 두 궤적을 잇는 줄 (끝점을 같은 시각들에서 샘플 → 구간별 선형이라 정확히 따라감)
    function rope(ta, tb, style) {
      var ts = [];
      ta.concat(tb).forEach(function (p) { if (ts.indexOf(p[0]) < 0) ts.push(p[0]); });
      ts.sort(function (a, b) { return a - b; });
      var A0 = at(ta, 0), B0 = at(tb, 0), a = "";
      ["x1", "y1", "x2", "y2"].forEach(function (k, i) {
        a += anim(k, ts.map(function (t) { var P = i < 2 ? at(ta, t) : at(tb, t); return [t, Math.round(P[i % 2])]; }));
      });
      return '<line x1="' + Math.round(A0[0]) + '" y1="' + Math.round(A0[1]) + '" x2="' + Math.round(B0[0]) + '" y2="' + Math.round(B0[1]) + '" ' + style + '>' + a + '</line>';
    }

    var GY = 322, TOP = 90, T0 = 1.5, T1 = 10;
    var rate = (GY - TOP) / (T1 - T0);
    var V = {   // 바닥 x, 매단 x, 매단 깊이(px), 거리 d
      Gates: { gx: 400, hx: 400, off: 0, d: 0, name: "Gates" },
      R1: { gx: 322, hx: 400, off: 50, d: 1, name: "R1" },
      E3: { gx: 478, hx: 400, off: 100, d: 2, name: "E3" },
      Park: { gx: 552, hx: 400, off: 160, d: 6, name: "Park" },
      HG: { gx: 244, hx: 500, off: 215, d: 23, name: "Halmae Gomtang" }
    };
    var ORDER = ["Gates", "R1", "E3", "Park", "HG"];
    var TR = {};
    ORDER.forEach(function (k) {
      var v = V[k];
      v.lift = k === "Gates" ? T0 : Math.round((T0 + v.off / rate) * 100) / 100;
      TR[k] = k === "Gates" ? [[0, v.gx, GY], [T0, v.gx, GY], [T1, v.hx, TOP]] : [[0, v.gx, GY], [v.lift, v.gx, GY], [T1, v.hx, TOP + v.off]];
    });

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dijkstra YOINK 직관 애니메이션">';
    var caps = [
      [0, T0, "공(정점)을 줄(간선, 길이 = weight)로 묶어 바닥에 둔다"],
      [T0, V.R1.lift, "Gates 를 잡고 들어 올린다 — YOINK!"],
      [V.R1.lift, V.E3.lift, "R1 이 가장 먼저 뜬다: d = 1 (제일 가까운 정점)"],
      [V.E3.lift, V.Park.lift, "다음은 E3: d = 1 + 1 = 2"],
      [V.Park.lift, V.HG.lift, "Park: d = 2 + 4 = 6"],
      [V.HG.lift, 10.6, "마지막 Halmae Gomtang: d = 1 + 22 = 23"],
      [10.6, 12.4, "팽팽한 줄 = 최단경로 트리 (shortest path tree)"],
      [12.4, D, "느슨한 줄 25, 20 은 최단경로에 안 쓰인다 (23 &lt; 25, 23 &lt; 26)"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 24, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 왼쪽 위: 원래 그래프 (p.15) ----
    var M = { Gates: [118, 66], E3: [170, 104], R1: [44, 146], Park: [150, 196], HG: [104, 252] };
    var ME = [["Gates", "R1", 1], ["R1", "E3", 1], ["E3", "Park", 4], ["R1", "HG", 22], ["Park", "HG", 20], ["Gates", "HG", 25]];
    s += txt(20, 46, "그래프 (p.15)", 11, C.muted, ' text-anchor="start" font-weight="700"');
    ME.forEach(function (e) {
      var a = M[e[0]], b = M[e[1]];
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C.blue + '" stroke-width="1.6"/>';
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = e[0] === "Gates" && e[1] === "HG" ? -12 : 9, dy = e[0] === "R1" && e[1] === "E3" ? -8 : 4;
      s += txt(mx + dx, my + dy, e[2], 11, C.w, ' font-weight="700"');
    });
    Object.keys(M).forEach(function (k) {
      s += '<ellipse cx="' + M[k][0] + '" cy="' + M[k][1] + '" rx="22" ry="10" fill="' + C.greenL + '" stroke="' + C.pur + '"/>' + txt(M[k][0], M[k][1] + 4, k === "HG" ? "HG" : k, 10, C.ink, ' font-weight="700"');
    });

    // ---- 바닥 ----
    s += '<line x1="196" y1="' + (GY + 16) + '" x2="596" y2="' + (GY + 16) + '" stroke="#8a7a66" stroke-width="3"/>';
    for (var gx = 206; gx < 596; gx += 16) s += '<line x1="' + gx + '" y1="' + (GY + 17) + '" x2="' + (gx - 8) + '" y2="' + (GY + 25) + '" stroke="#b9a98f" stroke-width="1.2"/>';

    // ---- 줄 ----
    var slack = 'stroke="' + C.line + '" stroke-width="2" stroke-dasharray="5 4" fill="none"';
    s += rope(TR.Gates, TR.HG, slack) + rope(TR.Park, TR.HG, slack);
    [["Gates", "R1"], ["R1", "E3"], ["E3", "Park"], ["R1", "HG"]].forEach(function (e) {
      var child = V[e[1]].lift;
      s += vis(0, child, rope(TR[e[0]], TR[e[1]], slack));
      s += vis(child, D, rope(TR[e[0]], TR[e[1]], 'stroke="' + C.blue + '" stroke-width="4" stroke-linecap="round"') );
    });
    // 최종 weight 라벨 (줄이 다 매달린 뒤)
    s += vis(T1, D, txt(388, TOP + 31, "1", 14, C.w, ' text-anchor="end" font-weight="700"') + txt(388, TOP + 81, "1", 14, C.w, ' text-anchor="end" font-weight="700"') +
      txt(388, TOP + 136, "4", 14, C.w, ' text-anchor="end" font-weight="700"') + txt(444, TOP + 146, "22", 14, C.w, ' text-anchor="end" font-weight="700"'));
    s += vis(12.4, D, txt(454, 190, "25", 13, C.muted, ' text-anchor="start" font-weight="700"') + txt(440, 294, "20", 13, C.muted, ' font-weight="700"'));
    s += vis(10.6, D, '<rect x="300" y="' + (TOP - 26) + '" width="240" height="' + 258 + '" rx="14" fill="none" stroke="' + C.green + '" stroke-width="2" stroke-dasharray="6 4"/>');

    // ---- 공 ----
    ORDER.forEach(function (k) {
      var v = V[k], hg = k === "HG", rx = hg ? 44 : 30;
      var body = '<ellipse cx="0" cy="0" rx="' + rx + '" ry="15" fill="' + C.greenL + '" stroke="' + C.pur + '" stroke-width="2">' +
        step("fill", [[0, C.greenL], [v.lift, C.green]]) + '</ellipse>';
      var lab = hg ? '<text x="0" y="-2" font-size="10" text-anchor="middle" font-weight="700" fill="' + C.ink + '">' + step("fill", [[0, C.ink], [v.lift, "#fff"]]) + 'Halmae</text>' +
        '<text x="0" y="10" font-size="10" text-anchor="middle" font-weight="700" fill="' + C.ink + '">' + step("fill", [[0, C.ink], [v.lift, "#fff"]]) + 'Gomtang</text>'
        : '<text x="0" y="4" font-size="12" text-anchor="middle" font-weight="700" fill="' + C.ink + '">' + step("fill", [[0, C.ink], [v.lift, "#fff"]]) + v.name + '</text>';
      var dl = '<g opacity="0">' + show(v.lift, D) + txt(-rx - 6, 5, "d=" + v.d, 12, C.green, ' text-anchor="end" font-weight="700"') + '</g>';
      s += mover(TR[k], body + lab + dl);
    });
    // 손 (Gates 와 같이 움직임)
    var hand = '<g transform="translate(6,-14) scale(0.6)"><path d="M -3,-24 L 26,-62" stroke="' + C.skin + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M 6,-26 L 34,-52" stroke="#e2ae86" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M 22,-58 L 70,-76" stroke="' + C.skin + '" stroke-width="18" stroke-linecap="round"/></g>';
    s += '<g opacity="0">' + show(0.8, D) + mover(TR.Gates, hand) + '</g>';
    s += vis(T0, 4.2, txt(470, 230, "YOINK!", 22, "#c00", ' font-weight="900" font-style="italic"'));

    // ---- 오른쪽: 뜨는 순서 ----
    s += '<rect x="604" y="44" width="148" height="232" rx="8" fill="#fafbfd" stroke="' + C.line + '"/>';
    s += txt(678, 64, "바닥에서 뜨는 순서", 12, C.pur, ' font-weight="700"');
    ORDER.forEach(function (k, i) {
      var v = V[k], y = 92 + i * 26;
      s += vis(v.lift, D, txt(614, y, (i + 1) + ". " + (k === "HG" ? "Halmae G." : v.name), 12, C.ink, ' text-anchor="start" font-weight="700"') +
        txt(742, y, v.d, 13, C.green, ' text-anchor="end" font-weight="700"'));
    });
    s += vis(10.6, D, txt(678, 226, "= Dijkstra 가 sure 로", 11, C.green, ' font-weight="700"') + txt(678, 242, "만드는 순서", 11, C.green, ' font-weight="700"'));
    s += txt(678, 266, "(높이: 순서만, 축척 아님)", 9.5, C.muted);

    s += txt(380, 362, "가까운 공부터 바닥을 떠난다 = 매번 not-sure 중 d 가 가장 작은 정점을 sure 로", 12.5, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
