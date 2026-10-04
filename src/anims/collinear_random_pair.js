// ============================================================
// collinear_random_pair — HW2 4번 (b): 랜덤 두 점 → 직선 → O(n) 세기 → |S| = n/k 이면 반환
// 데이터: n = 8, k = 2, S* = 직선 y = 2x 위 {P0, P2, P4, P6}
// 시간축(초): 0 문제 → 1.5 시도 1 (P1,P3) ✗ → 4.5 시도 2 (P0,P3) ✗ → 7.5 시도 3 (P2,P6) ✓ → 10.5 요점 → 13
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["collinear_random_pair"] = {
  title: "최대 collinear 집합 — 랜덤 두 점 다트 (13초)",
  desc: "HW2 4번 (b). 크기 n/k 를 알 때 두 점을 무작위로 골라 직선을 만들고 O(n) 으로 센다. 두 점이 모두 S* 에 꽂힐 확률 ≈ 1/k² → 기대 시도 ≈ k² ([[기하분포]]) → expected O(k²n) = O(n). 항상 정답이고 시간만 운 → [[Las Vegas와 Monte Carlo|Las Vegas]], [[randomized worst-case]] 는 ∞. [[랜덤 majority]] 와 같은 틀. [[HW2 복기]]",
  duration: 13,
  build: function () {
    var D = 13;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222" };
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
    function move(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kf(pts) + '/>'; }

    var P = [[1, 2], [4, 1], [2, 4], [6, 3], [3, 6], [7, 9], [5, 10], [8, 5]];
    var SSTAR = [0, 2, 4, 6];
    function X(x) { return 44 + x * 44; }      // x 0..9 → 44..440
    function Y(y) { return 312 - y * 22; }     // y 0..11 → 312..70
    function onLine(i, j) {
      var dx = P[j][0] - P[i][0], dy = P[j][1] - P[i][1], out = [];
      for (var r = 0; r < P.length; r++) if ((P[r][1] - P[i][1]) * dx === dy * (P[r][0] - P[i][0])) out.push(r);
      return out;
    }
    function clip(i, j) {
      var x1 = P[i][0], y1 = P[i][1], dx = P[j][0] - x1, dy = P[j][1] - y1, ts = [];
      function add(t) { var x = x1 + t * dx, y = y1 + t * dy; if (x >= -1e-9 && x <= 9 + 1e-9 && y >= -1e-9 && y <= 11 + 1e-9) ts.push(t); }
      add(-x1 / dx); add((9 - x1) / dx);
      if (dy) { add(-y1 / dy); add((11 - y1) / dy); }
      ts.sort(function (a, b) { return a - b; });
      return [X(x1 + ts[0] * dx), Y(y1 + ts[0] * dy), X(x1 + ts[ts.length - 1] * dx), Y(y1 + ts[ts.length - 1] * dy)];
    }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="랜덤 두 점으로 최대 collinear 집합 찾기 애니메이션" font-family="sans-serif">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "n = 8 점, 최대 collinear 집합 크기 n/k = 4 를 안다 (k = 2). 랜덤 두 점으로 찾아라"],
      [1.5, 4.5, "시도 1: 랜덤 두 점 P1, P3 → 직선 → O(n) 으로 직선 위 점을 센다"],
      [4.5, 7.5, "시도 2: P0, P3 — 한 점이라도 S* 밖이면 직선이 S* 의 직선이 아니다"],
      [7.5, 10.5, "시도 3: P2, P6 — 둘 다 S* 안 → 그 직선이 바로 S* 의 직선"],
      [10.5, D, "|S| = n/k 일 때만 반환 → 항상 정답 (Las Vegas), 기대 시도 ≈ k²"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 좌표평면 ----
    var g = "";
    for (var gx = 0; gx <= 9; gx++) {
      g += '<line x1="' + X(gx) + '" y1="' + Y(0) + '" x2="' + X(gx) + '" y2="' + Y(11) + '" stroke="#eceef2"/>';
      g += txt(X(gx), Y(0) + 14, gx, 10, C.muted);
    }
    for (var gy = 0; gy <= 11; gy += 1) {
      g += '<line x1="' + X(0) + '" y1="' + Y(gy) + '" x2="' + X(9) + '" y2="' + Y(gy) + '" stroke="#eceef2"/>';
      if (gy % 2 === 0) g += txt(X(0) - 6, Y(gy) + 4, gy, 10, C.muted, ' text-anchor="end"');
    }
    g += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(9) + '" y2="' + Y(0) + '" stroke="#667" stroke-width="1.3"/>';
    g += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(0) + '" y2="' + Y(11) + '" stroke="#667" stroke-width="1.3"/>';
    s += g;

    // ---- 시도별 직선 (점보다 아래 층) ----
    var TR = [
      { a: 1, b: 3, t: 1.5, eq: "y = x − 3" },
      { a: 0, b: 3, t: 4.5, eq: "y = x/5 + 9/5" },
      { a: 2, b: 6, t: 7.5, eq: "y = 2x", lx: 4.25, ly: 7.4 }
    ];
    TR.forEach(function (tr, k) {
      var c = clip(tr.a, tr.b), last = k === 2, col = last ? C.green : C.red;
      var end = last ? D : tr.t + 3;
      var ex = c[0] > c[2] ? c[0] : c[2], ey = c[0] > c[2] ? c[1] : c[3];
      s += vis(tr.t + 0.9, end, '<line x1="' + c[0] + '" y1="' + c[1] + '" x2="' + c[2] + '" y2="' + c[3] + '" stroke="' + col + '" stroke-width="3"' + (last ? "" : ' stroke-dasharray="8 4"') + '/>' +
        (tr.lx ? txt(X(tr.lx), Y(tr.ly), tr.eq, 13, col, ' text-anchor="start" font-weight="700"')
               : txt(Math.min(ex, X(9)) - 4, ey < Y(10) ? ey + 16 : ey - 8, tr.eq, 12, col, ' text-anchor="end" font-weight="700"')));
    });

    // ---- 점 ----
    P.forEach(function (p, k) {
      var cx = X(p[0]), cy = Y(p[1]), inS = SSTAR.indexOf(k) >= 0;
      if (inS) s += '<circle cx="' + cx + '" cy="' + cy + '" r="11" fill="none" stroke="' + C.green + '" stroke-opacity="0.35" stroke-dasharray="3 2"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="' + C.blue + '" stroke="#fff" stroke-width="1.5">' +
        (inS ? anim("fill", [[9, C.blue], [9.15, C.green]]) + anim("r", [[10.5, 7], [10.9, 10], [11.3, 7], [11.7, 10], [12.1, 7]]) : "") + '</circle>';
      s += '<text x="' + (cx + 16) + '" y="' + (cy - 9) + '" font-size="11" font-weight="700" stroke="#fff" stroke-width="3" paint-order="stroke" fill="' + C.blue + '">P' + k +
        (inS ? anim("fill", [[9, C.blue], [9.15, C.green]]) : "") + '</text>';
    });

    // ---- 다트 + 세기 링 ----
    TR.forEach(function (tr, k) {
      var last = k === 2, end = last ? D : tr.t + 3, col = last ? C.green : C.red;
      [tr.a, tr.b].forEach(function (q, m) {
        var cx = X(P[q][0]), cy = Y(P[q][1]), td = tr.t + 0.2 + 0.25 * m;
        var dart = '<g>' + move([[td, "0,-60"], [td + 0.35, "0,0"]]) +
          '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="' + C.orL + '" fill-opacity="0.6" stroke="' + C.or + '" stroke-width="3"/>' +
          '<line x1="' + (cx - 14) + '" y1="' + cy + '" x2="' + (cx + 14) + '" y2="' + cy + '" stroke="' + C.or + '" stroke-width="2"/>' +
          '<line x1="' + cx + '" y1="' + (cy - 14) + '" x2="' + cx + '" y2="' + (cy + 14) + '" stroke="' + C.or + '" stroke-width="2"/></g>';
        s += vis(td, end, dart);
      });
      var S = onLine(tr.a, tr.b), rings = "";
      S.forEach(function (q) { rings += '<circle cx="' + X(P[q][0]) + '" cy="' + Y(P[q][1]) + '" r="15" fill="none" stroke="' + col + '" stroke-width="2"/>'; });
      s += vis(tr.t + 1.5, end, rings);
      var msg = "직선 위 점 수 = " + S.length + (last ? " = n/k → return ✓" : " ≠ 4 → ✗");
      s += vis(tr.t + 1.6, end, '<rect x="' + (X(4.5) - 135) + '" y="40" width="270" height="24" rx="6" fill="' + (last ? C.greenL : C.redL) + '" stroke="' + col + '"/>' +
        txt(X(4.5), 57, msg, 13.5, col, ' font-weight="700"'));
    });

    // ---- 오른쪽 패널 ----
    var PX = 466;
    s += '<rect x="' + PX + '" y="44" width="286" height="282" rx="8" fill="#f7f8fb" stroke="#d5d9e2"/>';
    s += txt(PX + 12, 64, "시도 기록  (목표 |S| = n/k = 4)", 13, C.pur, ' text-anchor="start" font-weight="700"');
    var hist = [
      [1.5 + 1.8, "시도 1 (P1, P3): 3 ≠ 4 ✗", C.red],
      [4.5 + 1.8, "시도 2 (P0, P3): 2 ≠ 4 ✗", C.red],
      [7.5 + 1.8, "시도 3 (P2, P6): 4 = n/k ✓", C.green]
    ];
    hist.forEach(function (h, k) { s += vis(h[0], D, txt(PX + 14, 86 + k * 19, h[1], 12.5, h[2], ' text-anchor="start" font-weight="700"')); });
    s += '<line x1="' + (PX + 10) + '" y1="148" x2="' + (PX + 276) + '" y2="148" stroke="#d5d9e2"/>';
    var F = [
      [1.5, "두 점 모두 S* 안에 있을 확률", "q = (n/k)(n/k−1) / (n(n−1)) ≈ 1/k²", C.pur],
      [5, "기대 시도 = 1/q ≈ k²  (기하분포)", "여기선 q = 12/56 ≈ 0.21 → 1/q ≈ 4.7", C.pur],
      [8, "시도당 O(n) 세기", "→ expected O(k²n) = O(n)", C.green],
      [10.5, "worst-case: 난수가 계속 빗나가면 ∞", "→ 항상 정답, 시간만 운 = Las Vegas", C.red]
    ];
    F.forEach(function (f, k) {
      var y = 170 + k * 40;
      s += vis(f[0], D, txt(PX + 14, y, f[1], 12.5, f[3], ' text-anchor="start" font-weight="700"') +
        txt(PX + 14, y + 17, f[2], 12, C.ink, ' text-anchor="start"'));
    });

    // ---- 맨 아래 한 줄 ----
    s += vis(0, 10.5, txt(380, 350, "S* = 크기 n/k 인 최대 collinear 집합 (점선 고리) — 알고리즘은 어디 있는지 모른다", 12.5, C.muted));
    s += vis(10.5, D, txt(380, 350, "무작위 후보 → O(n) 확인 → 통과하면 반환 — 랜덤 majority 와 같은 틀", 14, C.ink, ' font-weight="700"'));
    s += '</svg>';
    return s;
  }
};
