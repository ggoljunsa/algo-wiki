// master_method — L3 p.86–91, L4 p.49–65, HW1 6-a : a, b, d → b^d → 케이스 → 결과
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var LINES = [
    "점화식을 T(n) = a·T(n/b) + O(n^d) 꼴로 맞춘다",
    "a = 부분 문제 수,  b = 크기 축소 비율,  d = 분할·병합 일의 차수",
    "전제: 모든 부분 문제의 크기가 같은가? (다르면 substitution method)",
    "b^d 를 계산한다",
    "a 와 b^d 를 비교한다",
    "a = b^d  →  T(n) = O(n^d log n)",
    "a < b^d  →  T(n) = O(n^d)",
    "a > b^d  →  T(n) = O(n^(log_b a))"
  ];

  var EX = {
    ms: { label: "mergesort 2T(n/2)+O(n)", rec: "T(n) = 2T(n/2) + O(n)", list: [[2, 2, "2", 1]], src: "L3 p.87, 91" },
    mult: { label: "p.87 곱셈 4T(n/2)+O(n)", rec: "T(n) = 4T(n/2) + O(n)", list: [[4, 2, "2", 1]], src: "L3 p.87 needlessly recursive multiplication" },
    kara: { label: "Karatsuba 3T(n/2)+O(n)", rec: "T(n) = 3T(n/2) + O(n)", list: [[3, 2, "2", 1]], src: "L3 p.87 Karatsuba" },
    sq: { label: "2T(n/2)+O(n²)", rec: "T(n) = 2T(n/2) + O(n^2)", list: [[2, 2, "2", 2]], src: "L3 p.87 another example" },
    sel_ideal: { label: "select 이상적 T(n/2)+O(n)", rec: "T(n) = T(n/2) + O(n)", list: [[1, 2, "2", 1]], src: "L4 p.49–50 ideal world" },
    sel_reason: { label: "select 합리적 T(7n/10)+O(n)", rec: "T(n) ≤ T(7n/10) + O(n)", list: [[1, 10 / 7, "10/7", 1]], src: "L4 p.65 reasonable world" },
    hw6a: { label: "HW1 6-a 7T(n/2)+O(n³)", rec: "T(n) = 7T(n/2) + O(n^3)", list: [[7, 2, "2", 3]], src: "HW1 6-a" },
    cls: { label: "수업 연습 a=1,2,4 · b=2 · d=1", rec: "T(n) = a·T(n/2) + O(n), a = 1, 2, 4", list: [[1, 2, "2", 1], [2, 2, "2", 1], [4, 2, "2", 1]], src: "수업 연습 (0908 녹음)" }
  };

  function num(x) { return Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : String(Math.round(x * 1000) / 1000); }
  function powStr(bs, d) { return d === 1 ? bs : (bs.indexOf("/") >= 0 ? "(" + bs + ")^" + d : bs + "^" + d); }
  function bdStr(b, bs, d) {
    var v = Math.pow(b, d);
    if (bs === "10/7" && d === 1) return "10/7 ≈ 1.429";
    return num(v);
  }
  function decide(a, b, d) {
    var bd = Math.pow(b, d);
    if (Math.abs(a - bd) < 1e-9) return { cmp: "=", line: 6, res: d === 1 ? "O(n log n)" : "O(n^" + d + " log n)", caseName: "a = b^d (모든 레벨 같음)" };
    if (a < bd) return { cmp: "<", line: 7, res: d === 1 ? "O(n)" : "O(n^" + d + ")", caseName: "a < b^d (루트 지배)" };
    var e = Math.log(a) / Math.log(b);
    var bs = num(b);
    var res = Math.abs(e - Math.round(e)) < 1e-9 ? "O(n^" + Math.round(e) + ")" : "O(n^(log" + bs + " " + a + ")) ≈ O(n^" + (Math.round(e * 1000) / 1000) + ")";
    return { cmp: ">", line: 8, res: res, caseName: "a > b^d (리프 지배)", e: e };
  }

  function draw(a, b, bs, d, dec) {
    var s = '<svg viewBox="0 0 760 250" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">';
    // 저울: a vs b^d
    var bd = Math.pow(b, d), mx = Math.max(a, bd, 1);
    s += '<text x="20" y="24" font-weight="700" fill="#333">가지 수 a vs 크기 축소 b^d</text>';
    s += '<rect x="20" y="36" width="' + (a / mx * 300) + '" height="22" fill="#d6465f" opacity="0.85"/>';
    s += '<text x="' + (26 + a / mx * 300) + '" y="52" fill="#d6465f" font-weight="700">a = ' + a + "</text>";
    s += '<rect x="20" y="64" width="' + (bd / mx * 300) + '" height="22" fill="#1d65b3" opacity="0.85"/>';
    s += '<text x="' + (26 + bd / mx * 300) + '" y="80" fill="#1d65b3" font-weight="700">b^d = ' + bdStr(b, bs, d) + "</text>";
    // 레벨별 일: n^d (a/b^d)^k
    var r = a / bd;
    s += '<text x="420" y="24" font-weight="700" fill="#333">레벨 k 의 총 일 ∝ (a/b^d)^k = (' + num(r) + ")^k</text>";
    var vals = [], k, m = 0;
    for (k = 0; k < 5; k++) { vals.push(Math.pow(r, k)); if (vals[k] > m) m = vals[k]; }
    for (k = 0; k < 5; k++) {
      var w = vals[k] / m * 300;
      s += '<rect x="' + (570 - w / 2) + '" y="' + (34 + k * 12) + '" width="' + Math.max(w, 2) + '" height="9" fill="#3b2f4a" opacity="0.75"/>';
    }
    s += '<text x="420" y="104" font-size="11" fill="#777">위 = 루트(k=0), 아래 = 깊은 레벨</text>';
    // 케이스 표
    var cases = [["a = b^d", "O(n^d log n)", "="], ["a < b^d", "O(n^d)", "<"], ["a > b^d", "O(n^(log_b a))", ">"]];
    cases.forEach(function (c, i) {
      var x = 20 + i * 245, on = dec && dec.cmp === c[2];
      s += '<rect x="' + x + '" y="130" width="230" height="64" rx="8" fill="' + (on ? "#dff3e4" : "#fafafa") + '" stroke="' + (on ? "#2e9e4f" : "#ccc") + '" stroke-width="' + (on ? 3 : 1.5) + '"/>';
      s += '<text x="' + (x + 115) + '" y="156" text-anchor="middle" font-weight="700" fill="' + (on ? "#2e9e4f" : "#777") + '">' + c[0] + "</text>";
      s += '<text x="' + (x + 115) + '" y="180" text-anchor="middle" fill="' + (on ? "#2e9e4f" : "#999") + '">' + c[1] + "</text>";
    });
    if (dec) s += '<text x="380" y="228" text-anchor="middle" font-size="16" font-weight="700" fill="#1d65b3">a = ' + a + ", b = " + bs + ", d = " + d + "  →  " + dec.res + "</text>";
    s += "</svg>";
    return s;
  }

  global.SIMS["master_method"] = {
    title: "master method 판정기",
    desc: "[[master method]]: T(n) = a·T(n/b) + O(n^d) 에서 [[master method 매개변수]] a, b, d 를 읽고 a 와 b^d 를 비교해 [[master method 세 케이스]] 중 하나로 답을 낸다. " +
      "왼쪽 막대는 가지 수 a 와 크기 축소 b^d 의 줄다리기, 오른쪽은 레벨별 일의 양. 예제: mergesort, [[Karatsuba 곱셈]], select, HW1 6-a (모두 [[공식·점화식 모음]] 에 정리).",
    options: [
      { key: "ex", label: "예제", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.ms;
      var steps = [];
      var st = { rec: ex.rec, a: "?", b: "?", d: "?", bd: "?", cmp: "?", kase: "?", result: "?", results: [] };
      var multi = ex.list.length > 1;
      function push(desc, line, par, dec, note) {
        var v = { rec: st.rec, a: st.a, b: st.b, d: st.d, bd: st.bd, cmp: st.cmp, kase: st.kase, result: st.result };
        if (multi) v.results = st.results.slice();
        steps.push({ desc: desc, pc: { P: line }, vars: v, note: note, svg: draw(par[0], par[1], par[2], par[3], dec) });
      }
      push("'''" + ex.rec + "''' (" + ex.src + "). 먼저 master method 의 꼴 a·T(n/b) + O(n^d) 에 맞는지 본다.", 1, ex.list[0], null);
      ex.list.forEach(function (p, idx) {
        var a = p[0], b = p[1], bs = p[2], d = p[3];
        st.a = a; st.b = bs; st.d = d; st.bd = "?"; st.cmp = "?"; st.kase = "?"; st.result = "?";
        push((multi ? "연습 " + (idx + 1) + ": " : "") + "매개변수 읽기: 부분 문제 '''a = " + a + "''' 개, 크기가 1/" + bs + " 로 줄어 '''b = " + bs + "''', 나누고 합치는 일 O(n^" + d + ") 이라 '''d = " + d + "'''.", 2, p, null);
        if (idx === 0) {
          push("전제 확인: 부분 문제 " + a + " 개의 크기가 모두 n/" + bs + " 로 '''같다''' ✓. (크기가 다르면 — 예: T(n/5) + T(7n/10) — master method 를 못 쓰고 [[substitution method]] 로 간다.)", 3, p, null);
        }
        st.bd = bdStr(b, bs, d);
        push("b^d = " + powStr(bs, d) + " = '''" + st.bd + "'''. 한 레벨 내려갈 때 '''각 부분 문제의 일'''이 1/b^d 로 준다.", 4, p, null);
        var dec = decide(a, b, d);
        st.cmp = a + " " + dec.cmp + " " + st.bd;
        push("비교: a = " + a + " " + dec.cmp + " b^d = " + st.bd + ". 한 레벨 내려가면 노드 수는 a 배, 노드당 일은 1/b^d 배 → 레벨 총 일은 a/b^d = " + num(a / Math.pow(b, d)) + " 배.", 5, p, null);
        st.kase = dec.caseName; st.result = dec.res;
        if (multi) st.results.push("a=" + a + " → " + dec.res);
        var why = dec.cmp === "=" ? "모든 레벨의 일이 같고 레벨이 log n 개" : (dec.cmp === "<" ? "레벨마다 일이 줄어드는 등비급수 → 루트의 n^d 가 지배" : "레벨마다 일이 늘어 리프 a^(log_b n) = n^(log_b a) 개가 지배");
        push("'''" + dec.caseName + "''' → '''T(n) = " + dec.res + "'''. 이유: " + why + ".", dec.line, p, dec,
          (opts.ex === "sel_reason" && idx === 0) ? "b = 10/7 처럼 정수가 아니어도 된다. 핵심은 1 < (10/7)^1 — 크기가 상수 비율로만 줄면 O(n)." :
          (opts.ex === "kara" ? "log2 3 ≈ 1.585 < 2 — 곱셈 4 번을 3 번으로 줄인 효과. 슬라이드는 ≈ n^1.6 으로 적었다." : null));
      });
      if (multi) {
        push("정리: b = 2, d = 1 을 고정하고 a 만 1 → 2 → 4 로 바꾸면 세 케이스가 차례로 나온다: " + st.results.join(", ") + ". a 가 b^d = 2 보다 작으면 루트, 같으면 균형, 크면 리프가 이긴다([[eternal struggle]]).",
          5, ex.list[2], decide(4, 2, 1), "시험 포인트: 공식 세 줄 + 전제(부분 문제 크기가 모두 같을 것)를 함께 쓸 것.");
      }
      var vars = [
        { name: "rec", label: "점화식", group: "입력" },
        { name: "a", group: "매개변수" }, { name: "b", group: "매개변수" }, { name: "d", group: "매개변수" },
        { name: "bd", label: "b^d", group: "판정" }, { name: "cmp", label: "a ? b^d", group: "판정" },
        { name: "kase", label: "케이스", group: "판정" }, { name: "result", label: "결과", group: "판정" }
      ];
      if (multi) vars.push({ name: "results", label: "지금까지 결과", group: "판정" });
      return { panels: [{ id: "P", title: "master method (L3 p.90–91)", lang: "txt", lines: LINES }], vars: vars, steps: steps };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
