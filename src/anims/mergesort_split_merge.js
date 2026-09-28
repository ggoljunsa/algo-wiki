// ============================================================
// mergesort_split_merge — L3 p.25–32 mergesort [8,4,1,5,3,2,6,7]
// 행 k (0~3) = 재귀 깊이 k. 내려가며 쪼갬(Recurse!) → 1칸 = base case → 올라오며 merge (원소가 아래 행에서 위 행의 정렬된 자리로 날아감)
// 시간축(초): 0 전체 → 1.2/2.6/4.0 행 1·2·3 → 5.4 base case → 6.4 merge→행2 → 8.0 행1 → 9.7 행0 → 11.4~14 유지
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["mergesort_split_merge"] = {
  title: "Mergesort — 쪼개며 내려가고 merge 하며 올라오기",
  desc: "[[mergesort]]: [8,4,1,5,3,2,6,7] 을 길이 1 이 될 때까지 반으로 쪼갠 뒤(Recurse!), 정렬된 두 리스트를 [[merge]] 하며 올라온다. 깊이 = log₂8 = 3",
  duration: 14,
  build: function () {
    var D = 14;
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
    function mv(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kv(pts) + '/>'; }

    var A = [8, 4, 1, 5, 3, 2, 6, 7];
    var W = 34, H = 30, GAP = 4;
    var ROWY = [62, 132, 202, 272];
    var appear = [0, 1.2, 2.6, 4.0];
    var mStart = [9.7, 8.0, 6.4];                     // 행 k 로 merge 가 시작되는 시각
    var mEnd = [11.4, 9.6, 7.9];
    // 각 행의 칸 x 좌표: 맨 아래(행3)는 52 간격, 위 행의 그룹은 자식 그룹 중심의 가운데에 붙여서
    var X = [[], [], [], []];
    for (var i = 0; i < 8; i++) X[3][i] = 101 + i * 52;
    for (var k = 2; k >= 0; k--) {
      var m = 8 >> k;                                  // 그룹 크기
      for (var g = 0; g < (1 << k); g++) {
        var lo = g * m, hi = lo + m - 1;
        var cen = (X[k + 1][lo] + X[k + 1][hi] + W) / 2;
        var left = cen - (m * W + (m - 1) * GAP) / 2;
        for (i = 0; i < m; i++) X[k][lo + i] = left + i * (W + GAP);
      }
    }
    // 행 k 에서 각 그룹을 정렬한 값
    function sortedRow(k) {
      var m = 8 >> k, out = [];
      for (var g = 0; g < (1 << k); g++) out = out.concat(A.slice(g * m, g * m + m).sort(function (a, b) { return a - b; }));
      return out;
    }

    var s = '<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="mergesort 분할과 병합 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.2, "mergesort([8, 4, 1, 5, 3, 2, 6, 7])"],
      [1.2, 4.0, "Recurse! — 반으로 나눠 left = mergesort(A[0:n/2]), right = mergesort(A[n/2:n])"],
      [4.0, 5.4, "길이 1 까지 쪼개졌다 — 깊이 = log₂8 = 3"],
      [5.4, 6.4, "len(A) ≤ 1 → 그대로 return (원소 하나는 이미 정렬)"],
      [6.4, 8.0, "Merge! 정렬된 두 리스트를 앞에서부터 비교해 합친다 → [4, 8] [1, 5] [2, 3] [6, 7]"],
      [8.0, 9.7, "Merge! → [1, 4, 5, 8]  [2, 3, 6, 7]"],
      [9.7, 14, "Merge! → [1, 2, 3, 4, 5, 6, 7, 8] — 정렬 완료"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    function cell(x, y, v, fill, stroke) {
      return '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + H + '" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2"/>' +
        txt(x + W / 2, y + 21, String(v), 16, "#222", ' font-weight="700"');
    }
    // ---- 쪼개는 단계: 원래 순서의 파란 칸 ----
    for (k = 0; k < 4; k++) {
      var inner = "";
      for (i = 0; i < 8; i++) {
        inner += '<rect x="' + X[k][i] + '" y="' + ROWY[k] + '" width="' + W + '" height="' + H + '" rx="5" fill="none" stroke="#bbb" stroke-dasharray="3 3"/>';
      }
      s += vis(appear[k], D, inner);                  // 자리 표시 (점선)
      var cells = "";
      for (i = 0; i < 8; i++) cells += cell(X[k][i], ROWY[k], A[i], C.blueL, C.blue);
      if (k < 3) {
        s += '<g opacity="0">' + cells + an("opacity", [[appear[k], 0], [appear[k] + 0.3, 1], [mStart[k], 1], [mStart[k] + 0.3, 0.12]]) + '</g>';
      } else {
        // 맨 아래 행: 5.4 에 초록(base case)
        var cg = "";
        for (i = 0; i < 8; i++) {
          cg += '<rect x="' + X[3][i] + '" y="' + ROWY[3] + '" width="' + W + '" height="' + H + '" rx="5" stroke-width="2" fill="' + C.blueL + '" stroke="' + C.blue + '">' +
            an("fill", [[5.4, C.blueL], [5.5, C.greenL]]) + an("stroke", [[5.4, C.blue], [5.5, C.green]]) + '</rect>' +
            txt(X[3][i] + W / 2, ROWY[3] + 21, String(A[i]), 16, "#222", ' font-weight="700"');
        }
        s += '<g opacity="0">' + cg + an("opacity", [[appear[3], 0], [appear[3] + 0.3, 1]]) + '</g>';
      }
      // 쪼개지며 내려오는 느낌: 행이 위에서 살짝 떨어짐 → 위 opacity 로 충분, 라벨만 추가
      if (k > 0) s += vis(appear[k], 5.4, txt(540, ROWY[k] - 12, "Recurse! ↓", 12, C.pur, ' text-anchor="start" font-weight="700"'));
    }

    // ---- merge 단계: 원소가 아래 행 자리에서 위 행의 정렬된 자리로 날아감 ----
    for (k = 2; k >= 0; k--) {
      var child = sortedRow(k + 1), parent = sortedRow(k);
      var m2 = 8 >> k, dl = Math.min(0.3, (mEnd[k] - mStart[k] - 0.5) / m2);
      for (g = 0; g < (1 << k); g++) {
        for (var j = 0; j < m2; j++) {
          var pos = g * m2 + j, v = parent[pos];
          var src = child.indexOf(v, g * m2);            // 자식 행에서 v 의 자리 (값이 모두 달라 유일)
          var t0 = mStart[k] + j * dl;
          var dx = X[k + 1][src] - X[k][pos], dy = ROWY[k + 1] - ROWY[k];
          s += '<g opacity="0">' + mv([[t0, dx + "," + dy], [t0 + 0.5, "0,0"]]) + an("opacity", [[t0, 0], [t0 + 0.05, 1]]) +
            cell(X[k][pos], ROWY[k], v, C.greenL, C.green) + '</g>';
        }
      }
      s += vis(mStart[k], D, txt(540, ROWY[k] + 21, "Merge! ↑", 12, C.green, ' text-anchor="start" font-weight="700"'));
    }

    // ---- 레벨 라벨 & 깊이 ----
    var sz = ["크기 8", "크기 4", "크기 2", "크기 1"];
    for (k = 0; k < 4; k++) s += vis(appear[k], D, txt(620, ROWY[k] + 21, "깊이 " + k + " · " + sz[k], 12, C.muted, ' text-anchor="start"'));
    s += vis(4.0, D, '<path d="M720,' + (ROWY[0] + 15) + ' L728,' + (ROWY[0] + 15) + ' L728,' + (ROWY[3] + 15) + ' L720,' + (ROWY[3] + 15) + '" fill="none" stroke="' + C.or + '" stroke-width="2"/>' +
      txt(736, (ROWY[0] + ROWY[3]) / 2 + 20, "3", 16, C.or, ' text-anchor="start" font-weight="700"'));
    s += vis(4.0, D, txt(620, 330, "깊이 = log₂8 = 3 층", 13, C.or, ' text-anchor="start" font-weight="700"'));

    // ---- 요점 ----
    s += txt(380, 364, "내려가며 반씩 쪼개고(Recurse!) 올라오며 merge — log₂n 층 × 층마다 O(n) merge = O(n log n)", 12.5, C.muted);
    s += '</svg>';
    return s;
  }
};
