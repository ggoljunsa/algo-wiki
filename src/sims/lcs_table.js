// lcs_table — L13 p.18 LCS DP 표 채우기(행 단위) → p.24–30 역추적.
//   역추적 규칙(p.24–30 그림의 경로와 같게): X[i] = Y[j] 이면 대각선 점프(LCS 원소), 아니면 C[i-1,j] ≥ C[i,j-1] 일 때 위, 아니면 왼쪽.
//   슬라이드 p.28 경로: (5,4) 위 → (4,4) 대각 G → (3,3) 위 → (2,3) 왼 → (2,2) 대각 C → (1,1) 대각 A.
//
// 기대 최종값 (src/sims/_check_L13_L14.py → _check_L13_L14.txt):
//  slide: X=ACGGA, Y=ACTG → C[5,4] = 3, LCS = "ACG"
//         C = [0,0,0,0,0] [0,1,1,1,1] [0,1,2,2,2] [0,1,2,2,3] [0,1,2,2,3] [0,1,2,2,3]   (p.23 표와 같음)
//         역추적 (5,4)위 (4,4)대각 (3,3)위 (2,3)왼 (2,2)대각 (1,1)대각
//  clrs : X=ABCBDAB, Y=BDCABA (CLRS 15.4 예제, 슬라이드 밖) → C[7,6] = 4, LCS = "BCBA"
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "LCS(X, Y):",
    "  C[i,0] = C[0,j] = 0 for all i = 1,…,m, j=1,…n.",
    "  For i = 1,…,m and j = 1,…,n:",
    "    If X[i] = Y[j]:",
    "      C[i,j] = C[i-1,j-1] + 1",
    "    Else:",
    "      C[i,j] = max{ C[i,j-1], C[i-1,j] }"
  ];
  var BACK = [
    "(i, j) = (m, n) 에서 시작",
    "X[i] = Y[j] → 대각선 점프, X[i] 는 LCS 원소",
    "C[i-1,j] ≥ C[i,j-1] → 위로 (i - 1)",
    "아니면 → 왼쪽으로 (j - 1)",
    "i = 0 또는 j = 0 → 끝, 모은 원소를 거꾸로 읽음"
  ];

  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var EX = {
    slide: { label: "슬라이드 X=ACGGA, Y=ACTG (p.19–30)", X: "ACGGA", Y: "ACTG" },
    clrs: { label: "X=ABCBDAB, Y=BDCABA (CLRS 예제)", X: "ABCBDAB", Y: "BDCABA" }
  };

  global.SIMS["lcs_table"] = {
    title: "LCS 표 채우기와 역추적 (L13 p.18–30)",
    desc: "L13 p.18–30. $C[i,j]$ 는 X 의 앞 i 글자와 Y 의 앞 j 글자의 [[longest common subsequence]] 길이다. " +
      "표를 한 행씩 채운 뒤 $C[m,n]$ 에서 거꾸로 걸어간다. 대각선으로 점프한 칸의 글자가 LCS 원소다([[LCS 역추적]]).",
    options: [
      { key: "ex", label: "입력", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.slide, X = ex.X, Y = ex.Y, m = X.length, n = Y.length;
      var T = [], i, j, steps = [];
      for (i = 0; i <= m; i++) { T.push([]); for (j = 0; j <= n; j++) T[i].push(null); }
      var cur = null, refs = [], path = {}, diag = {}, lcsRev = [], phase = "fill";
      var vI = "-", vJ = "-", vXi = "-", vYj = "-", vC = "-", vRef = "-", vLcs = "", vLen = "-";

      function draw(msg) {
        var i, j;
        var cw = n > 5 ? 40 : 46, rh = 32, x0 = 70, y0 = 70, s = "";
        var W = Math.max(520, x0 + (n + 1) * cw + 210), H = y0 + (m + 1) * rh + 70;
        s += '<text x="' + (x0 + (n + 1) * cw / 2) + '" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="' + C.pur + '">Y</text>';
        s += '<text x="18" y="' + (y0 + (m + 1) * rh / 2) + '" font-size="13" font-weight="700" fill="' + C.pur + '">X</text>';
        for (j = 0; j <= n; j++) {
          var hy = cur && cur[1] === j && j > 0;
          s += '<text x="' + (x0 + j * cw + cw / 2) + '" y="' + (y0 - 22) + '" text-anchor="middle" font-size="10" fill="' + C.muted + '">' + j + '</text>' +
            '<text x="' + (x0 + j * cw + cw / 2) + '" y="' + (y0 - 7) + '" text-anchor="middle" font-size="14" font-weight="700" fill="' + (hy ? C.or : "#222") + '">' + (j > 0 ? Y[j - 1] : "") + '</text>';
        }
        for (i = 0; i <= m; i++) {
          var y = y0 + i * rh, hx = cur && cur[0] === i && i > 0;
          s += '<text x="' + (x0 - 26) + '" y="' + (y + 20) + '" text-anchor="middle" font-size="10" fill="' + C.muted + '">' + i + '</text>' +
            '<text x="' + (x0 - 10) + '" y="' + (y + 20) + '" text-anchor="middle" font-size="14" font-weight="700" fill="' + (hx ? C.or : "#222") + '">' + (i > 0 ? X[i - 1] : "") + '</text>';
          for (j = 0; j <= n; j++) {
            var k = i + "," + j, isCur = cur && cur[0] === i && cur[1] === j, isRef = refs.indexOf(k) >= 0;
            var fill = isCur ? C.orL : diag[k] ? C.greenL : path[k] ? C.purL : isRef ? C.blueL : (i === 0 || j === 0) ? "#f2f2f2" : "#fff";
            var stroke = isCur ? C.or : diag[k] ? C.green : isRef ? C.blue : "#aaa";
            s += '<rect x="' + (x0 + j * cw) + '" y="' + y + '" width="' + cw + '" height="' + (rh - 2) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (isCur || isRef || diag[k] ? 2.2 : 1) + '"/>';
            if (T[i][j] !== null) s += '<text x="' + (x0 + j * cw + cw / 2) + '" y="' + (y + 20) + '" text-anchor="middle" font-size="14" font-weight="' + (isCur ? 700 : 400) + '" fill="#222">' + T[i][j] + '</text>';
          }
        }
        var lx = x0 + (n + 1) * cw + 24;
        s += '<text x="' + lx + '" y="' + (y0 + 10) + '" font-size="12" fill="#333">주황 = 지금 칸</text>' +
          '<text x="' + lx + '" y="' + (y0 + 28) + '" font-size="12" fill="' + C.blue + '">파랑 = 참조하는 칸</text>' +
          '<text x="' + lx + '" y="' + (y0 + 46) + '" font-size="12" fill="' + C.pur + '">보라 = 역추적 경로</text>' +
          '<text x="' + lx + '" y="' + (y0 + 64) + '" font-size="12" fill="' + C.green + '">초록 = 대각 점프 (LCS 원소)</text>';
        if (phase !== "fill") {
          s += '<text x="' + lx + '" y="' + (y0 + 100) + '" font-size="13" font-weight="700" fill="' + C.green + '">LCS: ' + esc(vLcs || "…") + '</text>';
        }
        if (msg) s += '<text x="12" y="' + (H - 18) + '" font-size="13" font-weight="700" fill="' + C.pur + '">' + esc(msg) + '</text>';
        return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">' + s + '</svg>';
      }
      function snap(desc, pc, msg, note) {
        var st = { desc: desc, pc: pc,
          vars: { X: X, Y: Y, i: vI, j: vJ, "X[i]": vXi, "Y[j]": vYj, "C[i,j]": vC, ref: vRef, LCS: vLcs || "-", length: vLen },
          svg: draw(msg) };
        if (note) st.note = note;
        steps.push(st);
      }

      // 0행·0열
      for (i = 0; i <= m; i++) T[i][0] = 0;
      for (j = 0; j <= n; j++) T[0][j] = 0;
      snap("0행과 0열을 0 으로 채운다. 빈 문자열과의 LCS 길이는 0 이다.", { P: 2, B: null }, "C[i,0] = C[0,j] = 0");

      for (i = 1; i <= m; i++) {
        for (j = 1; j <= n; j++) {
          cur = [i, j]; vI = i; vJ = j; vXi = X[i - 1]; vYj = Y[j - 1];
          if (X[i - 1] === Y[j - 1]) {
            T[i][j] = T[i - 1][j - 1] + 1; refs = [(i - 1) + "," + (j - 1)];
            vC = T[i][j]; vRef = "C[" + (i - 1) + "," + (j - 1) + "] = " + T[i - 1][j - 1];
            snap("(" + i + "," + j + "): X[" + i + "] = Y[" + j + "] = " + X[i - 1] + " 이다. 대각선 위 칸 " + T[i - 1][j - 1] + " 에 1 을 더해 " + T[i][j] + ".",
              { P: 5, B: null }, "같은 글자 → C[i-1,j-1] + 1 = " + T[i][j]);
          } else {
            var left = T[i][j - 1], up = T[i - 1][j];
            T[i][j] = Math.max(left, up); refs = [i + "," + (j - 1), (i - 1) + "," + j];
            vC = T[i][j]; vRef = "왼 " + left + ", 위 " + up;
            snap("(" + i + "," + j + "): " + X[i - 1] + " ≠ " + Y[j - 1] + " 이다. 왼쪽 " + left + " 과 위 " + up + " 중 큰 값 " + T[i][j] + ".",
              { P: 7, B: null }, "다른 글자 → max{왼 " + left + ", 위 " + up + "} = " + T[i][j]);
          }
        }
      }
      vLen = T[m][n];
      cur = null; refs = [];
      snap("표를 다 채웠다. 오른쪽 아래 $C[" + m + "," + n + "] = " + T[m][n] + "$ 이 LCS 길이다. 이제 거꾸로 걸어가며 실제 LCS 를 찾는다.",
        { P: null, B: 1 }, "LCS 길이 = C[" + m + "," + n + "] = " + T[m][n]);

      phase = "back";
      i = m; j = n;
      while (i > 0 && j > 0) {
        cur = [i, j]; path[i + "," + j] = 1; vI = i; vJ = j; vXi = X[i - 1]; vYj = Y[j - 1]; vC = T[i][j];
        if (X[i - 1] === Y[j - 1]) {
          diag[i + "," + j] = 1; lcsRev.push(X[i - 1]); vLcs = lcsRev.slice().reverse().join("");
          refs = [(i - 1) + "," + (j - 1)]; vRef = "대각 → (" + (i - 1) + "," + (j - 1) + ")";
          snap("(" + i + "," + j + "): X[" + i + "] = Y[" + j + "] = " + X[i - 1] + ". 이 값은 대각선 칸에서 왔다. 대각 점프이므로 " + X[i - 1] + " 가 LCS 원소다.",
            { P: null, B: 2 }, "대각 점프 → " + X[i - 1] + " 추가");
          i--; j--;
        } else if (T[i - 1][j] >= T[i][j - 1]) {
          refs = [(i - 1) + "," + j]; vRef = "위 → (" + (i - 1) + "," + j + ")";
          snap("(" + i + "," + j + "): 글자가 다르다. 위 칸 값 " + T[i - 1][j] + " 이 지금 값과 같으니 이 값은 위에서 왔다. 위로 간다.",
            { P: null, B: 3 }, "위로 이동");
          i--;
        } else {
          refs = [i + "," + (j - 1)]; vRef = "왼 → (" + i + "," + (j - 1) + ")";
          snap("(" + i + "," + j + "): 글자가 다르고 위 칸(" + T[i - 1][j] + ")은 더 작다. 이 값은 왼쪽에서 왔다. 왼쪽으로 간다.",
            { P: null, B: 4 }, "왼쪽으로 이동");
          j--;
        }
      }
      cur = null; refs = []; vI = i; vJ = j; vXi = "-"; vYj = "-"; vC = "-"; vRef = "-";
      snap("i 또는 j 가 0 이 되어 멈춘다. 대각 점프에서 모은 글자를 거꾸로 읽으면 '''" + vLcs + "''' (길이 " + vLcs.length + ") 이다.",
        { P: null, B: 5 }, "LCS = " + vLcs + " (길이 " + vLcs.length + ")");

      return {
        panels: [
          { id: "P", title: "LCS DP (p.18)", lang: "c", lines: CODE },
          { id: "B", title: "역추적 (p.24–30)", lang: "txt", lines: BACK }
        ],
        vars: [
          { name: "X", group: "입력" }, { name: "Y", group: "입력" },
          { name: "i", group: "칸" }, { name: "j", group: "칸" }, { name: "X[i]", group: "칸" }, { name: "Y[j]", group: "칸" },
          { name: "C[i,j]", group: "칸" }, { name: "ref", group: "칸" },
          { name: "length", group: "결과" }, { name: "LCS", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
