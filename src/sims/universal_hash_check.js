window.SIMS = window.SIMS || {};
// universal_hash_check — L7 p.41 (PNG 40) 기대 버킷 크기, p.59–72 (PNG 57–67) h_{a,b} 전수 조사
(function (global) {
  "use strict";

  var PROC_E = [
    "1. 키 u_i 하나를 고정한다",
    "2. E[u_i 버킷의 원소 수] = sum_{j=1..n} P{h(u_i) = h(u_j)}   (지표 확률변수 + 선형성)",
    "3. j = i 항: 자기 자신이므로 확률 1",
    "4. j != i 항: h 가 uniformly random 이면 P{충돌} = 1/n",
    "5. 합 = 1 + (n-1)/n <= 2  → 버킷 크기 기대값 O(1)"
  ];
  var PROC_H = [
    "1. p = 5 (소수, p >= M = 5), n = 3 버킷",
    "2. H = { h_{a,b} : a in {1..p-1}, b in {0..p-1} },  |H| = p(p-1)",
    "3. (a, b) 하나마다 f(x) = (a*x + b) mod p,  h(x) = f(x) mod n",
    "4. x != y 인 쌍마다 h(x) == h(y) 이면 그 쌍의 충돌 횟수 +1",
    "5. 20 개를 다 돌면 P{h(x)=h(y)} = 충돌 횟수 / |H|",
    "6. 모든 쌍에서 <= 1/n 이면 H 는 universal hash family"
  ];

  function frac(num, den) { return num + "/" + den; }

  function svgE(v) {
    var s = '<svg viewBox="0 0 760 240" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    s += '<text x="10" y="18" font-size="11" fill="#555">P{h(u_i) = h(u_j)} 를 j 마다 쌓기 (빨강 = j = i, 파랑 = 1/n)</text>';
    var base = 190, H = 140, x0 = 40;
    s += '<line x1="' + x0 + '" y1="' + base + '" x2="740" y2="' + base + '" stroke="#667"/>';
    s += '<line x1="' + x0 + '" y1="' + (base - H) + '" x2="740" y2="' + (base - H) + '" stroke="#ccc" stroke-dasharray="4 3"/>';
    s += '<text x="' + (x0 - 6) + '" y="' + (base - H + 4) + '" text-anchor="end" font-size="10">1</text>';
    var bw = Math.min(56, Math.floor(680 / v.n) - 6);
    for (var j = 1; j <= v.j; j++) {
      var x = x0 + 10 + (j - 1) * (bw + 6);
      var h = (j === 1 ? 1 : 1 / v.n) * H;
      s += '<rect x="' + x + '" y="' + (base - h) + '" width="' + bw + '" height="' + h + '" fill="' + (j === 1 ? "#d6465f" : "#8aa4c8") + '"/>';
      s += '<text x="' + (x + bw / 2) + '" y="' + (base + 16) + '" text-anchor="middle" font-size="11">j=' + j + (j === 1 ? "(=i)" : "") + "</text>";
    }
    s += '<text x="740" y="230" text-anchor="end" font-size="13" font-weight="700">합 = ' + v.sum + "  (≤ 2)</text>";
    s += "</svg>";
    return s;
  }

  function svgH(v) {
    var s = '<svg viewBox="0 0 760 270" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    // 왼쪽: 현재 h_{a,b} 의 x → f → h
    s += '<text x="10" y="18" font-size="11" fill="#555">' + (v.a ? "h_{" + v.a + "," + v.b + "}: x → f(x) = (" + v.a + "x+" + v.b + ") mod 5 → h = f mod 3" : "U = {0,1,2,3,4}") + "</text>";
    for (var x = 0; x < 5; x++) {
      var y = 34 + x * 44;
      s += '<rect x="10" y="' + y + '" width="40" height="32" rx="3" fill="#fff" stroke="#667"/><text x="30" y="' + (y + 21) + '" text-anchor="middle" font-size="14">' + x + "</text>";
      if (v.a) {
        s += '<line x1="50" y1="' + (y + 16) + '" x2="96" y2="' + (y + 16) + '" stroke="#667"/>';
        s += '<rect x="98" y="' + y + '" width="40" height="32" rx="3" fill="#eef0f4" stroke="#667"/><text x="118" y="' + (y + 21) + '" text-anchor="middle" font-size="14">' + v.f[x] + "</text>";
        var by = 56 + v.h[x] * 60;
        var col = v.hotX.indexOf(x) >= 0 ? "#d6465f" : "#667";
        s += '<line x1="138" y1="' + (y + 16) + '" x2="216" y2="' + (by + 10) + '" stroke="' + col + '" stroke-width="' + (col === "#667" ? 1.2 : 2.2) + '"/>';
      }
    }
    for (var b = 0; b < 3; b++) {
      var yy = 46 + b * 60;
      s += '<rect x="218" y="' + yy + '" width="60" height="40" rx="4" fill="#f7f8fb" stroke="#8a93a8"/><text x="248" y="' + (yy + 25) + '" text-anchor="middle">bucket ' + b + "</text>";
    }
    // 오른쪽: 쌍별 충돌 횟수 행렬
    var mx = 420, my = 50, c = 52;
    s += '<text x="' + mx + '" y="24" font-size="11" fill="#555">쌍 (x, y) 충돌 횟수 / 지금까지 본 h 개수 ' + v.seen + "</text>";
    for (var k = 0; k < 5; k++) {
      s += '<text x="' + (mx + k * c + c / 2) + '" y="' + (my - 6) + '" text-anchor="middle" font-size="11" fill="#777">y=' + k + "</text>";
      s += '<text x="' + (mx - 6) + '" y="' + (my + k * c + c / 2 + 4) + '" text-anchor="end" font-size="11" fill="#777">x=' + k + "</text>";
    }
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        var cx = mx + j * c, cy = my + i * c;
        if (j <= i) { s += '<rect x="' + cx + '" y="' + cy + '" width="' + c + '" height="' + c + '" fill="#eceef2"/>'; continue; }
        var cnt = v.cnt[i][j], hot = v.hotPairs.indexOf(i + "," + j) >= 0;
        s += '<rect x="' + cx + '" y="' + cy + '" width="' + c + '" height="' + c + '" fill="' + (hot ? "#fde2e6" : (v.done ? "#dff3e4" : "#fff")) +
          '" stroke="' + (hot ? "#d6465f" : "#c5cad4") + '" stroke-width="' + (hot ? 2.5 : 1) + '"/>';
        s += '<text x="' + (cx + c / 2) + '" y="' + (cy + c / 2 + 5) + '" text-anchor="middle" font-size="15"' + (hot ? ' font-weight="700"' : "") + ">" + cnt + "</text>";
      }
    }
    s += "</svg>";
    return s;
  }

  global.SIMS["universal_hash_check"] = {
    title: "기대 버킷 크기와 universal hash family 확인",
    desc: "L7 p.41, 59–72. ① h 가 uniformly random 이면 [[기대 버킷 크기]] = 1 + (n−1)/n ≤ 2 ([[지표 확률변수]] + [[기대값의 선형성]]). " +
      "② 그 계산에 필요한 건 '임의의 두 키 충돌 확률 ≤ 1/n' 하나뿐 → 이것만 만족하는 작은 [[universal hash family]] [[h_{a,b}]] 를 p = 5, n = 3 에서 전수 조사한다.",
    options: [
      { key: "mode", label: "모드", values: [
        { value: "e3", label: "기대 버킷 크기 n = 3" },
        { value: "e10", label: "기대 버킷 크기 n = 10" },
        { value: "hab", label: "h_{a,b} 전수 조사 (p=5, n=3)" }
      ] }
    ],
    build: function (opts) {
      var mode = opts.mode === "e10" || opts.mode === "hab" ? opts.mode : "e3";
      var steps = [];

      if (mode !== "hab") {
        var n = mode === "e10" ? 10 : 3;
        var st = { j: "-", term: "-", sumNum: 0 };
        var snapE = function () {
          return {
            n: n, i: 1, j: st.j, "P{h(u_i)=h(u_j)}": st.term,
            "누적 합": st.j === "-" ? "-" : (st.sumNum === n ? "1" : "1 + " + frac(st.sumNum - n, n)) + " = " + (st.sumNum / n).toFixed(3).replace(/\.?0+$/, ""),
            "≤ 2 ?": st.j === n ? ((st.sumNum / n) <= 2 ? "예" : "아니오") : "-"
          };
        };
        var pushE = function (desc, pc, jShown, note) {
          steps.push({ desc: desc, pc: { P: pc }, vars: snapE(), note: note,
            svg: svgE({ n: n, j: jShown, sum: st.j === "-" ? "-" : (st.sumNum / n).toFixed(2) }) });
        };
        pushE("버킷 n = " + n + " 개, 키 n = " + n + " 개 (슬라이드 설정: 키 수 = 버킷 수, [[M과 n]]). 키 u_1 을 고정하고 '''u_1 과 같은 버킷에 든 키 수'''의 기대값을 구한다.", 1, 0);
        for (var j = 1; j <= n; j++) {
          st.j = j;
          if (j === 1) {
            st.term = "1"; st.sumNum += n;
            pushE("j = 1 = i: u_1 은 자기 자신과 항상 같은 버킷 → 확률 '''1'''.", 3, j);
          } else {
            st.term = "1/" + n; st.sumNum += 1;
            pushE("j = " + j + ": h(u_" + j + ") 는 h(u_1) 과 독립인 균등 난수 → 같은 칸일 확률 '''1/" + n + "'''. 누적 1 + " + (j - 1) + "/" + n + ".", 4, j);
          }
        }
        var val = 1 + (n - 1) / n;
        pushE("E = 1 + (n−1)/n = 1 + " + (n - 1) + "/" + n + " = '''" + (Math.round(val * 100) / 100) + "''' ≤ 2. n 이 아무리 커도 2 를 넘지 않는다 → 기대 버킷 크기 O(1), 따라서 INSERT/DELETE/SEARCH 기대 O(1).", 5, n,
          "p.61: \"All we needed was that this ≤ 1/n.\" — uniformly random h 는 저장에 M log n 비트가 들어 비싸다. 충돌 확률 ≤ 1/n 만 지키는 작은 family 면 충분하다.");
        return {
          panels: [{ id: "P", title: "기대 버킷 크기 (L7 p.41)", lang: "txt", lines: PROC_E }],
          vars: [
            { name: "n", group: "설정" }, { name: "i", label: "고정한 키 i", group: "설정" },
            { name: "j", group: "합" }, { name: "P{h(u_i)=h(u_j)}", group: "합" }, { name: "누적 합", group: "합" }, { name: "≤ 2 ?", group: "합" }
          ],
          steps: steps
        };
      }

      // ---- h_{a,b} 전수 조사 ----
      var P = 5, NB = 3;
      var cnt = [];
      for (var r = 0; r < 5; r++) { cnt.push([0, 0, 0, 0, 0]); }
      var seen = 0;
      var cur = { a: "-", b: "-", f: "-", h: "-", pairs: "-" };
      function table() {
        var out = [];
        for (var x = 0; x < 5; x++) for (var y = x + 1; y < 5; y++) out.push("(" + x + "," + y + "):" + cnt[x][y]);
        return out.join(" ");
      }
      function maxProb() {
        if (!seen) return "-";
        var m = 0;
        for (var x = 0; x < 5; x++) for (var y = x + 1; y < 5; y++) m = Math.max(m, cnt[x][y]);
        return m + "/" + seen + (seen === P * (P - 1) ? " = 1/5 ≤ 1/n = 1/3 → universal" : "");
      }
      function snapH() {
        return {
          p: P, n: NB, "|H| = p(p-1)": P * (P - 1), a: cur.a, b: cur.b,
          "f = [f(0..4)]": cur.f, "h = [h(0..4)]": cur.h, "이 h 의 충돌 쌍": cur.pairs,
          "본 h 개수": seen, "쌍별 충돌 횟수": table(), "최대 충돌 확률": maxProb()
        };
      }
      function pushH(desc, pc, vis, note) {
        steps.push({ desc: desc, pc: { P: pc }, vars: snapH(), note: note,
          svg: svgH({ a: vis.a, b: vis.b, f: vis.f, h: vis.h, hotX: vis.hotX || [], hotPairs: vis.hotPairs || [], cnt: cnt.map(function (q) { return q.slice(); }), seen: seen, done: vis.done }) });
      }
      pushH("p = 5 (소수, p ≥ M = 5), U = {0,1,2,3,4}, 버킷 n = 3. a ∈ {1,2,3,4}, b ∈ {0,…,4} → '''|H| = p(p−1) = 20''' 개 함수([[H의 크기]]). 전부 돌려서 쌍마다 충돌 횟수를 센다.", 2, {});
      for (var a = 1; a < P; a++) {
        for (var b = 0; b < P; b++) {
          var f = [], h = [];
          for (var x = 0; x < 5; x++) { f.push((a * x + b) % P); h.push(f[x] % NB); }
          var pairs = [], hotX = [];
          for (var x1 = 0; x1 < 5; x1++) for (var y1 = x1 + 1; y1 < 5; y1++) {
            if (h[x1] === h[y1]) { cnt[x1][y1] += 1; pairs.push(x1 + "," + y1); if (hotX.indexOf(x1) < 0) hotX.push(x1); if (hotX.indexOf(y1) < 0) hotX.push(y1); }
          }
          seen += 1;
          cur = { a: a, b: b, f: f.slice(), h: h.slice(), pairs: pairs.length ? pairs.map(function (q) { return "(" + q + ")"; }).join(" ") : "없음" };
          var extra = (a === 2 && b === 1) ? " — '''슬라이드 p.70 의 예제''': f = [1,3,0,2,4], h = [1,0,0,2,1]." : "";
          pushH("(a, b) = (" + a + ", " + b + ") [" + seen + "/20]: f = [" + f.join(",") + "], h = [" + h.join(",") + "]. 충돌 쌍 " + cur.pairs + "." + extra,
            3, { a: a, b: b, f: f, h: h, hotX: hotX, hotPairs: pairs });
        }
      }
      cur = { a: "-", b: "-", f: "-", h: "-", pairs: "-" };
      pushH("20 개 전부 확인: '''모든 쌍 (x, y) 가 정확히 4 번''' 충돌 → P{h(x) = h(y)} = 4/20 = '''1/5 ≤ 1/n = 1/3''' → H 는 [[universal hash family]]. " +
        "이유: x ≠ y 이면 (f(x), f(y)) 가 서로 다른 값 쌍 20 가지를 한 번씩 다 돌고, 그중 mod 3 이 같은 것은 (0,3),(3,0),(1,4),(4,1) 4 가지뿐.", 6,
        { done: true },
        "h 하나를 저장하는 데는 (a, b) 두 수만 있으면 된다 → log|H| = log(p(p−1)) = O(log M) 비트. uniformly random h 의 M log n 비트와 비교 (p.72).");
      return {
        panels: [{ id: "P", title: "h_{a,b} 전수 조사 (L7 p.68–72)", lang: "txt", lines: PROC_H }],
        vars: [
          { name: "p", group: "설정" }, { name: "n", group: "설정" }, { name: "|H| = p(p-1)", group: "설정" },
          { name: "a", group: "현재 h" }, { name: "b", group: "현재 h" }, { name: "f = [f(0..4)]", group: "현재 h" }, { name: "h = [h(0..4)]", group: "현재 h" },
          { name: "이 h 의 충돌 쌍", group: "현재 h" },
          { name: "본 h 개수", group: "집계" }, { name: "쌍별 충돌 횟수", group: "집계" }, { name: "최대 충돌 확률", group: "집계" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
