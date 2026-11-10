// knapsack_01 — L13 p.72 Zero-One-Knapsack: 2차원 표 K[x,j] 를 for x: for j: 순서(열 단위)로 채우고, 끝에서 고른 item 을 되짚는다.
//   표 모양은 슬라이드(p.73–89)와 같다: 행 = j (앞 j 개 item 까지 사용), 열 = x (용량).
//   current entry(주황)·relevant previous entry(초록) 색도 슬라이드 범례를 따랐다.
//
// 슬라이드 예제 (p.73–89, 그림에서 읽음): item 1 거북이 w=1 v=1, item 2 전구 w=2 v=4, item 3 수박 w=3 v=6, Capacity 3.
// 기대 최종값 (src/sims/_check_L13_L14.py → _check_L13_L14.txt):
//  slide: j=0 [0,0,0,0] / j=1 [0,1,1,1] / j=2 [0,1,4,5] / j=3 [0,1,4,6] → K[3,3] = 6, 고른 item = {수박} (p.89 "put one watermelon")
//  p36  : weights 6,2,4,3,11 / values 20,8,14,13,35 / W=10 → K[10,5] = 35, 고른 item = {2, 3, 4}, 무게 9
//         (p.37 "0/1 Knapsack: Total weight 9, Total value 35" 와 같음)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "Zero-One-Knapsack(W, n, w, v):",
    "  K[x,0] = 0 for all x = 0,…,W",
    "  K[0,i] = 0 for all i = 0,…,n",
    "  for x = 1,…,W:",
    "    for j = 1,…,n:",
    "      K[x,j] = K[x, j-1]                    // Case 1",
    "      if w_j ≤ x:",
    "        K[x,j] = max{ K[x,j], K[x – w_j, j-1] + v_j }   // Case 2",
    "  return K[W,n]"
  ];
  var BACK = [
    "(x, j) = (W, n) 에서 시작",
    "K[x,j] = K[x,j-1] → item j 안 씀, j - 1",
    "K[x,j] ≠ K[x,j-1] → item j 씀, x - w_j, j - 1",
    "j = 0 → 끝"
  ];

  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#c9f0e4", or: "#e09a40", orL: "#f8d9c9",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777", base: "#eaf3dc" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var EX = {
    slide: { label: "슬라이드 예제 (p.73–89, W=3)", W: 3, names: ["거북이", "전구", "수박"], w: [1, 2, 3], v: [1, 4, 6] },
    p36: { label: "p.36 예제 0/1 판 (W=10, 답 35)", W: 10, names: ["item1", "item2", "item3", "item4", "item5"], w: [6, 2, 4, 3, 11], v: [20, 8, 14, 13, 35] }
  };

  global.SIMS["knapsack_01"] = {
    title: "0/1 knapsack — 2차원 표 K[x,j] (L13 p.72–89)",
    desc: "L13 p.72–89. $K[x,j]$ 는 용량 x 에서 item 1..j 만 각각 한 번씩 쓸 때의 최대 가치다([[0/1 knapsack]]). " +
      "Case 1 은 item j 를 안 쓰는 경우($K[x,j-1]$), Case 2 는 쓰는 경우($K[x-w_j,j-1]+v_j$)다. " +
      "Case 2 가 j-1 행을 보기 때문에 item j 를 두 번 쓰지 않는다. 시간은 $O(nW)$ 이다.",
    options: [
      { key: "ex", label: "예제", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.slide, W = ex.W, n = ex.w.length, steps = [];
      var K = [], x, j;
      for (x = 0; x <= W; x++) { K.push([]); for (j = 0; j <= n; j++) K[x].push(null); }
      var cur = null, refs = [], used = {}, path = {};
      var vx = "-", vj = "-", vc1 = "-", vc2 = "-", vK = "-", vItems = "-";

      function draw(msg) {
        var x, j;
        var cw = W > 5 ? 46 : 70, rh = W > 5 ? 34 : 44, x0 = 120, y0 = 46, s = "";
        var Wd = Math.max(600, x0 + (W + 1) * cw + 20);
        for (x = 0; x <= W; x++) {
          s += '<text x="' + (x0 + x * cw + cw / 2) + '" y="' + (y0 - 10) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + (cur && cur[0] === x ? C.or : C.pur) + '">x=' + x + '</text>';
        }
        for (j = 0; j <= n; j++) {
          var y = y0 + j * rh;
          s += '<text x="' + (x0 - 8) + '" y="' + (y + rh / 2 + 5) + '" text-anchor="end" font-size="12" font-weight="700" fill="' + (cur && cur[1] === j ? C.or : C.pur) + '">j=' + j + (j > 0 ? " " + esc(ex.names[j - 1]) : "") + '</text>';
          for (x = 0; x <= W; x++) {
            var k = x + "," + j, isCur = cur && cur[0] === x && cur[1] === j, isRef = refs.indexOf(k) >= 0;
            var fill = isCur ? C.orL : isRef ? C.greenL : used[k] ? "#fff3a8" : path[k] ? C.purL : C.base;
            var st = isCur ? C.or : isRef ? C.green : used[k] ? C.or : "#2e8b6e";
            s += '<rect x="' + (x0 + x * cw) + '" y="' + y + '" width="' + cw + '" height="' + (rh - 2) + '" fill="' + fill + '" stroke="' + st + '" stroke-width="' + (isCur || isRef || used[k] ? 2.6 : 1.2) + '"/>';
            if (K[x][j] !== null) s += '<text x="' + (x0 + x * cw + cw / 2) + '" y="' + (y + rh / 2 + 5) + '" text-anchor="middle" font-size="14" font-weight="' + (isCur ? 700 : 400) + '" fill="#222">' + K[x][j] + '</text>';
          }
        }
        var ty = y0 + (n + 1) * rh + 18;
        s += '<rect x="12" y="' + ty + '" width="16" height="14" fill="' + C.orL + '" stroke="' + C.or + '"/><text x="34" y="' + (ty + 12) + '" font-size="12">current entry</text>' +
          '<rect x="140" y="' + ty + '" width="16" height="14" fill="' + C.greenL + '" stroke="' + C.green + '"/><text x="162" y="' + (ty + 12) + '" font-size="12">relevant previous entry</text>' +
          '<rect x="330" y="' + ty + '" width="16" height="14" fill="#fff3a8" stroke="' + C.or + '"/><text x="352" y="' + (ty + 12) + '" font-size="12">역추적: item j 씀</text>';
        var iy = ty + 34;
        s += '<text x="12" y="' + (iy + 14) + '" font-size="12" font-weight="700" fill="' + C.pur + '">item</text>' +
          '<text x="12" y="' + (iy + 32) + '" font-size="12" fill="' + C.blue + '">weight</text>' +
          '<text x="12" y="' + (iy + 50) + '" font-size="12" fill="' + C.green + '">value</text>';
        for (var i = 0; i < n; i++) {
          var ix = 90 + i * 84, on = cur && cur[1] === i + 1;
          if (on) s += '<rect x="' + (ix - 38) + '" y="' + iy + '" width="76" height="58" rx="6" fill="' + C.orL + '" stroke="' + C.or + '" stroke-width="2"/>';
          s += '<text x="' + ix + '" y="' + (iy + 14) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + C.pur + '">' + (i + 1) + ". " + esc(ex.names[i]) + '</text>' +
            '<text x="' + ix + '" y="' + (iy + 32) + '" text-anchor="middle" font-size="13" fill="' + C.blue + '">' + ex.w[i] + '</text>' +
            '<text x="' + ix + '" y="' + (iy + 50) + '" text-anchor="middle" font-size="13" fill="' + C.green + '">' + ex.v[i] + '</text>';
        }
        s += '<text x="' + (90 + n * 84 - 20) + '" y="' + (iy + 32) + '" font-size="13" font-weight="700" fill="' + C.pur + '">Capacity: ' + W + '</text>';
        var H = iy + 90;
        if (msg) s += '<text x="12" y="' + (H - 12) + '" font-size="13" font-weight="700" fill="' + C.pur + '">' + esc(msg) + '</text>';
        return '<svg viewBox="0 0 ' + Wd + ' ' + H + '" width="' + Wd + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">' + s + '</svg>';
      }
      function snap(desc, pc, msg) {
        steps.push({ desc: desc, pc: pc,
          vars: { x: vx, j: vj, case1: vc1, case2: vc2, "K[x,j]": vK, "고른 item": vItems },
          svg: draw(msg) });
      }

      for (x = 0; x <= W; x++) K[x][0] = 0;
      snap("j = 0 행을 0 으로 채운다. item 을 하나도 안 쓰면 가치는 0 이다.", { P: 2, B: null }, "K[x,0] = 0");
      for (j = 0; j <= n; j++) K[0][j] = 0;
      snap("x = 0 열을 0 으로 채운다. 용량 0 이면 아무것도 못 넣는다.", { P: 3, B: null }, "K[0,i] = 0");

      for (x = 1; x <= W; x++) {
        for (j = 1; j <= n; j++) {
          cur = [x, j]; vx = x; vj = j;
          var c1 = K[x][j - 1], wj = ex.w[j - 1], vv = ex.v[j - 1], nm = ex.names[j - 1];
          vc1 = "K[" + x + "," + (j - 1) + "] = " + c1;
          if (wj <= x) {
            var c2 = K[x - wj][j - 1] + vv;
            K[x][j] = Math.max(c1, c2);
            refs = [x + "," + (j - 1), (x - wj) + "," + (j - 1)];
            vc2 = "K[" + (x - wj) + "," + (j - 1) + "] + " + vv + " = " + c2; vK = K[x][j];
            snap("(x=" + x + ", j=" + j + "): Case 1 은 " + nm + " 를 안 써서 " + c1 + ". Case 2 는 " + nm + " 를 넣고 남은 용량 " + (x - wj) + " 을 j-1 행에서 찾아 " + c2 + ". 큰 쪽 " + K[x][j] + ".",
              { P: 8, B: null }, "K[" + x + "," + j + "] = max{" + c1 + ", " + c2 + "} = " + K[x][j]);
          } else {
            K[x][j] = c1; refs = [x + "," + (j - 1)];
            vc2 = "w_" + j + " = " + wj + " > " + x; vK = K[x][j];
            snap("(x=" + x + ", j=" + j + "): " + nm + " 는 무게 " + wj + " 라 용량 " + x + " 에 안 들어간다. Case 1 만 남는다. 위 칸 K[" + x + "," + (j - 1) + "] = " + c1 + " 을 그대로 쓴다.",
              { P: 6, B: null }, "K[" + x + "," + j + "] = K[" + x + "," + (j - 1) + "] = " + c1);
          }
        }
      }
      cur = null; refs = []; vc1 = "-"; vc2 = "-"; vK = K[W][n];
      snap("표를 다 채웠다. 답은 '''K[" + W + "," + n + "] = " + K[W][n] + "''' 이다. 어떤 item 을 썼는지는 표를 거꾸로 보면 나온다.", { P: 9, B: 1 }, "return K[" + W + "," + n + "] = " + K[W][n]);

      var bx = W, picked = [];
      for (j = n; j >= 1; j--) {
        cur = [bx, j]; vx = bx; vj = j; path[bx + "," + j] = 1; vK = K[bx][j];
        if (K[bx][j] !== K[bx][j - 1]) {
          used[bx + "," + j] = 1; picked.unshift(j); refs = [(bx - ex.w[j - 1]) + "," + (j - 1)];
          vItems = picked.map(function (q) { return ex.names[q - 1]; }).join(", ");
          snap("(x=" + bx + ", j=" + j + "): K = " + K[bx][j] + " 이 위 칸 K[" + bx + "," + (j - 1) + "] = " + K[bx][j - 1] + " 과 다르다. " + ex.names[j - 1] + " 를 썼다. 용량을 " + ex.w[j - 1] + " 줄여 x = " + (bx - ex.w[j - 1]) + " 로 간다.",
            { P: null, B: 3 }, ex.names[j - 1] + " 사용 → x = " + (bx - ex.w[j - 1]));
          bx -= ex.w[j - 1];
        } else {
          refs = [bx + "," + (j - 1)];
          snap("(x=" + bx + ", j=" + j + "): K 가 위 칸과 같다(" + K[bx][j] + "). " + ex.names[j - 1] + " 는 안 썼다.", { P: null, B: 2 }, ex.names[j - 1] + " 안 씀");
        }
      }
      cur = null; refs = []; vx = bx; vj = 0; vK = K[W][n];
      var wsum = picked.reduce(function (a, q) { return a + ex.w[q - 1]; }, 0);
      vItems = picked.map(function (q) { return ex.names[q - 1]; }).join(", ");
      snap("j = 0 에 도착했다. 고른 item 은 {" + vItems + "}, 무게 합 " + wsum + ", 가치 합 " + K[W][n] + " 이다.", { P: null, B: 4 },
        "고른 item {" + vItems + "} · 무게 " + wsum + " · 가치 " + K[W][n]);

      return {
        panels: [
          { id: "P", title: "Zero-One-Knapsack (p.72)", lang: "c", lines: CODE },
          { id: "B", title: "고른 item 되짚기", lang: "txt", lines: BACK }
        ],
        vars: [
          { name: "x", group: "칸" }, { name: "j", group: "칸" }, { name: "case1", group: "칸" }, { name: "case2", group: "칸" }, { name: "K[x,j]", group: "칸" },
          { name: "고른 item", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
