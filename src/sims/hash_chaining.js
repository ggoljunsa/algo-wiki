window.SIMS = window.SIMS || {};
// hash_chaining — L7 p.26–28 (PNG 26–28), p.34, p.55–57 (PNG 53–55), p.70 (PNG 66): 버킷 배열 + 체인
(function (global) {
  "use strict";

  var CODE = [
    "INSERT(x):",
    "  b = h(x)",
    "  buckets[b] 체인 끝에 x 를 붙인다     # O(1), 정렬 안 함",
    "SEARCH(x):",
    "  b = h(x)",
    "  for y in buckets[b]:                # 체인 길이만큼 훑기",
    "    if y == x: return y",
    "  return NIL",
    "DELETE(x):",
    "  b = h(x)",
    "  buckets[b] 체인에서 x 를 찾아 제거"
  ];

  var P34_H = { 13: 3, 22: 2, 43: 1, 92: 9, 7: 9 };   // 슬라이드 p.34 그림의 (무작위로 뽑힌) h
  function msd(x) { return Number(String(x)[0]); }
  function f21(x) { return (2 * x + 1) % 5; }

  var CASES = {
    p28: {
      label: "p.28: h = 일의 자리, n=9, INSERT 13,22,43,9 · SEARCH 43",
      buckets: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      h: function (x) { return x % 10; }, hName: "h(x) = x 의 일의 자리 (least significant digit)",
      ops: [["INSERT", 13], ["INSERT", 22], ["INSERT", 43], ["INSERT", 9], ["SEARCH", 43]]
    },
    p34: {
      label: "p.34 게임: INSERT 13,22,43,92,7 · SEARCH 43 · DELETE 92 · SEARCH 7 · INSERT 92",
      buckets: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      h: function (x) { return P34_H[x]; }, hName: "무작위로 뽑힌 h (슬라이드 그림: 43→1, 22→2, 13→3, 92→n, 7→n, n=9)",
      ops: [["INSERT", 13], ["INSERT", 22], ["INSERT", 43], ["INSERT", 92], ["INSERT", 7], ["SEARCH", 43], ["DELETE", 92], ["SEARCH", 7], ["INSERT", 92]]
    },
    p57: {
      label: "p.57 적의 입력 {11,101,111,121,131,141}, H = {h0 최상위 자리, h1 일의 자리}",
      buckets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      h: function (x) { return x % 10; }, hName: "h1 = 일의 자리 (\"I picked h1\") — h0 = 최상위 자리도 같이 표시",
      ops: [["INSERT", 11], ["INSERT", 101], ["INSERT", 111], ["INSERT", 121], ["INSERT", 131], ["INSERT", 141], ["SEARCH", 141]]
    },
    p70: {
      label: "p.70: h_{2,1}(x) = ((2x+1) mod 5) mod 3, U={0..4}, n=3",
      buckets: [0, 1, 2],
      h: function (x) { return f21(x) % 3; }, hName: "h_{2,1}(x) = f_{2,1}(x) mod 3,  f_{2,1}(x) = (2x + 1) mod 5",
      ops: [["INSERT", 0], ["INSERT", 1], ["INSERT", 2], ["INSERT", 3], ["INSERT", 4]]
    }
  };

  function svgFor(v) {
    var rows = v.bucketIds.length, rh = Math.min(28, Math.floor(250 / rows));
    var s = '<svg viewBox="0 0 760 ' + (rows * rh + 60) + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    s += '<text x="10" y="16" font-size="11" fill="#555">' + v.hName.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</text>";
    for (var r = 0; r < rows; r++) {
      var b = v.bucketIds[r], y = 28 + r * rh;
      var hot = v.b === b;
      s += '<rect x="10" y="' + y + '" width="54" height="' + (rh - 4) + '" fill="' + (hot ? "#fde2e6" : "#f7f8fb") + '" stroke="' + (hot ? "#d6465f" : "#8a93a8") +
        '" stroke-width="' + (hot ? 2.5 : 1.2) + '"/>';
      s += '<text x="37" y="' + (y + rh / 2 + 2) + '" text-anchor="middle" font-size="12">' + b + "</text>";
      var chain = v.chains[b] || [];
      var x = 90;
      for (var t = 0; t < chain.length; t++) {
        s += '<line x1="' + (t === 0 ? 64 : x - 16) + '" y1="' + (y + rh / 2 - 2) + '" x2="' + (x - 2) + '" y2="' + (y + rh / 2 - 2) + '" stroke="#667" stroke-width="1.4"/>';
        s += '<path d="M' + (x - 2) + "," + (y + rh / 2 - 2) + " l-6,-4 l0,8 z" + '" fill="#667"/>';
        var scanned = hot && v.scan !== null && t < v.scan;
        var found = hot && v.found !== null && t === v.found;
        s += '<rect x="' + x + '" y="' + (y + 1) + '" width="52" height="' + (rh - 6) + '" rx="3" fill="' + (found ? "#dff3e4" : (scanned ? "#fff4e6" : "#fff")) +
          '" stroke="' + (found ? "#2f8a5b" : "#667") + '" stroke-width="' + (found ? 2.5 : 1.2) + '"/>';
        s += '<text x="' + (x + 26) + '" y="' + (y + rh / 2 + 2) + '" text-anchor="middle" font-size="12">' + chain[t] + "</text>";
        x += 72;
      }
    }
    if (v.caption) s += '<text x="750" y="' + (rows * rh + 50) + '" text-anchor="end" font-size="12" font-weight="700">' + v.caption + "</text>";
    s += "</svg>";
    return s;
  }

  global.SIMS["hash_chaining"] = {
    title: "hash table with chaining — INSERT / SEARCH / DELETE",
    desc: "L7 p.26–70. 버킷 배열의 칸마다 [[linked list]] 체인이 달린 [[hash table]]. INSERT 는 h(x) 칸 체인에 붙이기만 해서 O(1), " +
      "SEARCH/DELETE 는 그 칸 체인을 처음부터 훑으므로 O(체인 길이). 체인이 길어지는 원인은 [[hash collision]] — 결정론적 h 는 적이 무너뜨릴 수 있다(p.57).",
    options: [
      { key: "ex", label: "예제", values: Object.keys(CASES).map(function (k) { return { value: k, label: CASES[k].label }; }) }
    ],
    build: function (opts) {
      var key = CASES[opts.ex] ? opts.ex : "p28";
      var c = CASES[key];
      var chains = {};
      c.bucketIds = c.buckets;
      c.buckets.forEach(function (b) { chains[b] = []; });
      var steps = [];
      var st = { op: "-", x: "-", hx: "-", scan: "-", result: "-", f: [], h: [], h0: [] };
      var vis = { b: null, scan: null, found: null, caption: "" };

      var vars = [
        { name: "연산", group: "현재 연산" }, { name: "x", group: "현재 연산" }, { name: "h(x)", group: "현재 연산" },
        { name: "훑은 칸", group: "현재 연산" }, { name: "결과", group: "현재 연산" }
      ];
      if (key === "p57") vars.push({ name: "h0(x) 최상위 자리", group: "현재 연산" });
      if (key === "p70") {
        vars.push({ name: "f_{2,1}(x)", group: "현재 연산" });
        vars.push({ name: "f = [f(0..4)]", group: "h_{2,1} 표" });
        vars.push({ name: "h = [h(0..4)]", group: "h_{2,1} 표" });
        vars.push({ name: "충돌", group: "h_{2,1} 표" });
      }
      c.buckets.forEach(function (b) { vars.push({ name: "bucket " + b, group: "버킷 (체인)" }); });

      function collisions() {
        var out = [];
        c.buckets.forEach(function (b) { if (chains[b].length > 1) out.push("x=" + chains[b].join(",") + " (bucket " + b + ")"); });
        return out.length ? out.join(" · ") : "없음";
      }
      function snap() {
        var o = { "연산": st.op, x: st.x, "h(x)": st.hx, "훑은 칸": st.scan, "결과": st.result };
        if (key === "p57") o["h0(x) 최상위 자리"] = st.x === "-" ? "-" : msd(st.x);
        if (key === "p70") {
          o["f_{2,1}(x)"] = st.x === "-" ? "-" : f21(st.x);
          o["f = [f(0..4)]"] = st.f.slice();
          o["h = [h(0..4)]"] = st.h.slice();
          o["충돌"] = collisions();
        }
        c.buckets.forEach(function (b) { o["bucket " + b] = chains[b].length ? chains[b].join(" → ") : "(빈 칸)"; });
        return o;
      }
      function push(desc, pc, note) {
        var cc = {};
        c.buckets.forEach(function (b) { cc[b] = chains[b].slice(); });
        steps.push({ desc: desc, pc: { H: pc }, vars: snap(), note: note,
          svg: svgFor({ bucketIds: c.buckets, chains: cc, hName: c.hName, b: vis.b, scan: vis.scan, found: vis.found, caption: vis.caption }) });
      }

      push("버킷 " + c.buckets.length + " 칸짜리 빈 테이블. 해시 함수: " + c.hName + ".", 1,
        key === "p28" ? "슬라이드: \"For demonstration purposes only! This is a terrible hash function! Don't use this!\"" : undefined);

      c.ops.forEach(function (op) {
        var name = op[0], x = op[1], b = c.h(x);
        st.op = name; st.x = x; st.hx = b; st.scan = "-"; st.result = "-";
        vis = { b: b, scan: null, found: null, caption: "" };
        if (name === "INSERT") {
          var extra = "";
          if (key === "p57") extra = " (h0 = 최상위 자리 = " + msd(x) + " 도 '''같은 버킷 1''')";
          if (key === "p70") {
            st.f.push(f21(x));
            st.h.push(b);
            extra = " — f_{2,1}(" + x + ") = (2·" + x + " + 1) mod 5 = " + f21(x) + ", h = " + f21(x) + " mod 3 = " + b;
          }
          push("INSERT " + x + ": h(" + x + ") = '''" + b + "'''" + extra + ".", 2);
          chains[b].push(x);
          st.result = "bucket " + b + " = " + chains[b].join(" → ");
          push("버킷 " + b + " 체인 끝에 " + x + " 를 붙인다 — 체인을 훑지 않으므로 O(1)." +
            (chains[b].length > 1 ? " 이미 " + chains[b].slice(0, -1).join(", ") + " 가 있다 → '''[[hash collision|충돌]]''', 체인 길이 " + chains[b].length + "." : ""), 3);
        } else if (name === "SEARCH") {
          push("SEARCH " + x + ": h(" + x + ") = '''" + b + "''' → 버킷 " + b + " 체인만 본다.", 5);
          var chain = chains[b], found = -1;
          for (var t = 0; t < chain.length; t++) {
            vis.scan = t + 1; st.scan = t + 1;
            if (chain[t] === x) { found = t; vis.found = t; st.result = "찾음 (" + (t + 1) + " 칸 훑음)"; }
            push("체인 " + (t + 1) + " 번째 칸 " + chain[t] + (chain[t] === x ? " == " + x + " → '''찾았다'''. 훑은 칸 " + (t + 1) + " 개." : " ≠ " + x + " → 다음 칸."),
              chain[t] === x ? 7 : 6);
            if (found >= 0) break;
          }
          if (found < 0) { st.result = "NIL"; push("체인 끝 → `return NIL`.", 8); }
        } else {
          push("DELETE " + x + ": h(" + x + ") = '''" + b + "''' → 버킷 " + b + " 체인에서 " + x + " 를 찾는다.", 10);
          var idx = chains[b].indexOf(x);
          st.scan = idx + 1;
          chains[b].splice(idx, 1);
          st.result = "삭제 (" + (idx + 1) + " 칸 훑음)";
          push(x + " 를 체인에서 떼어낸다 → 버킷 " + b + " = " + (chains[b].length ? chains[b].join(" → ") : "(빈 칸)") + ". 찾는 비용만큼 O(체인 길이).", 11);
        }
      });

      st.op = "-"; st.x = "-"; st.hx = "-";  // 훑은 칸은 마지막 연산 값 유지
      vis = { b: null, scan: null, found: null, caption: "" };
      var fin, note;
      if (key === "p28") {
        vis.caption = "SEARCH 43 = 2 칸";
        fin = "최종: 버킷 2 [22], 버킷 3 [13 → 43], 버킷 9 [9]. SEARCH 43 은 h(43) = 3 칸 체인 '''2 칸'''만 훑었다 — 다른 버킷은 보지도 않는다.";
      } else if (key === "p34") {
        vis.caption = "적은 h 를 모른 채 입력을 정했다";
        fin = "최종: 1 [43], 2 [22], 3 [13], 9 [7 → 92]. [[해싱 게임]]: 적이 먼저 키와 연산 순서를 고르고, 그 다음 알고리즘이 h 를 '''무작위로''' 고른다 → 적은 어느 키끼리 부딪힐지 모른다.";
      } else if (key === "p57") {
        vis.caption = "6 개 전부 bucket 1 → O(n)";
        fin = "최종: 6 개 키가 '''전부 버킷 1''' — h1(일의 자리)이든 h0(최상위 자리)이든 모두 1. SEARCH 141 은 체인 6 칸을 다 훑었다 → '''O(n)'''. " +
          "H 를 아는 적은 두 함수 모두를 무너뜨리는 입력을 고를 수 있다.";
        note = "\"You cannot escape the dark side with deterministic hash functions\" (p.31) — H 가 너무 작으면 무작위로 골라도 소용없다. 그래서 [[universal hash family]] 가 필요하다.";
      } else {
        vis.caption = "h = [1,0,0,2,1]";
        fin = "최종: f = [" + st.f.join(", ") + "] (x = 0..4 — 서로 다름, mod 5 단계에선 충돌 없음), h = f mod 3 = [" + st.h.join(", ") + "]. " +
          "'''x=1,2 충돌(버킷 0), x=0,4 충돌(버킷 1)''' — 슬라이드 말대로 '''mod n 단계에서만''' 충돌이 생긴다.";
        note = "키 5 개를 버킷 3 개에 넣으면 [[비둘기집 원리]]로 충돌은 피할 수 없다. universal 은 '충돌이 없다'가 아니라 '임의의 두 키가 충돌할 확률 ≤ 1/n' 이라는 뜻.";
      }
      st.result = collisions();
      push(fin, 1, note);

      return {
        panels: [{ id: "H", title: "chaining 연산 (L7 p.26)", lang: "c", lines: CODE }],
        vars: vars,
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
