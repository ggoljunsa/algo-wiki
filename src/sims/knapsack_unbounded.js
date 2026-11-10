// knapsack_unbounded — L13 p.49 UnboundedKnapsack (ITEMS 포함) 를 x = 1..W, i = 1..n 순서로 한 칸씩.
//   "K[x] was updated" 는 엄격히 커졌을 때로 본다(같은 값이면 ITEMS 를 바꾸지 않음).
//
// 슬라이드 예제 (p.50–57, 그림에서 읽음): item 1 거북이 w=1 v=1, item 2 전구 w=2 v=4, item 3 수박 w=3 v=6, Capacity 4.
// 기대 최종값 (src/sims/_check_L13_L14.py → _check_L13_L14.txt):
//  slide: K = [0, 1, 4, 6, 8], ITEMS[4] = {전구, 전구}
//         갱신 (x,i,K): (1,1,1) (2,1,2) (2,2,4) (3,1,5) (3,3,6) (4,1,7) (4,2,8)
//         → p.56 "K[4]=7, ITEMS[4] = ITEMS[3] + 거북이" 다음 p.57 "K[4]=8, ITEMS[4] = ITEMS[2] + 전구" 와 같음
//  p36  : weights 6,2,4,3,11 / values 20,8,14,13,35 / W=10 (p.36–37) → K = [0,0,8,13,16,21,26,29,34,39,42],
//         ITEMS[10] = {item4, item4, item2, item2} (무게 3+3+2+2 = 10, 가치 13+13+8+8 = 42, p.37 "Total value: 42")
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "UnboundedKnapsack(W, n, weights, values):",
    "  K[0] = 0",
    "  ITEMS[0] = ∅",
    "  for x = 1, …, W:",
    "    K[x] = 0",
    "    for i = 1, …, n:",
    "      if w_i ≤ x:",
    "        K[x] = max{ K[x], K[x – w_i] + v_i }",
    "        If K[x] was updated:",
    "          ITEMS[x] = ITEMS[x – w_i] ∪ { item i }",
    "  return ITEMS[W]"
  ];

  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var EX = {
    slide: { label: "슬라이드 예제 (p.50–57, W=4)", W: 4, names: ["거북이", "전구", "수박"], w: [1, 2, 3], v: [1, 4, 6] },
    p36: { label: "p.36 예제 (W=10, 답 42)", W: 10, names: ["item1", "item2", "item3", "item4", "item5"], w: [6, 2, 4, 3, 11], v: [20, 8, 14, 13, 35] }
  };

  global.SIMS["knapsack_unbounded"] = {
    title: "Unbounded knapsack — K[x] 와 ITEMS[x] (L13 p.48–57)",
    desc: "L13 p.48–57. $K[x]$ 는 용량 x 인 가방에 담을 수 있는 최대 가치다. 각 item 을 몇 개든 쓸 수 있다([[unbounded knapsack]]). " +
      "$K[x] = \\max_i \\{ K[x-w_i] + v_i \\}$ 를 x = 1 부터 W 까지 채운다. K 값이 커질 때마다 ITEMS[x] 에 어떤 item 을 넣었는지 적어 둔다.",
    options: [
      { key: "ex", label: "예제", values: Object.keys(EX).map(function (k) { return { value: k, label: EX[k].label }; }) }
    ],
    build: function (opts) {
      var ex = EX[opts.ex] || EX.slide, W = ex.W, n = ex.w.length, steps = [];
      var K = [], IT = [], x, i;
      for (x = 0; x <= W; x++) { K.push(null); IT.push(null); }
      var curX = null, refX = null, curI = null;
      var vx = "-", vi = "-", vcand = "-", vupd = "-";

      function itemsStr(a) { return a === null ? "-" : a.length ? "{" + a.map(function (k) { return ex.names[k]; }).join(", ") + "}" : "∅"; }
      function draw(msg) {
        var x, i;
        var cw = W > 5 ? 62 : 90, x0 = 70, y0 = 50, s = "";
        var Wd = Math.max(560, x0 + (W + 1) * cw + 20);
        for (x = 0; x <= W; x++) {
          var X0 = x0 + x * cw, isCur = x === curX, isRef = x === refX;
          var fill = isCur ? C.orL : isRef ? C.blueL : "#fff", st = isCur ? C.or : isRef ? C.blue : "#aaa";
          s += '<text x="' + (X0 + cw / 2) + '" y="' + (y0 - 8) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + (isCur ? C.or : C.pur) + '">' + x + '</text>';
          s += '<rect x="' + X0 + '" y="' + y0 + '" width="' + cw + '" height="34" fill="' + fill + '" stroke="' + st + '" stroke-width="' + (isCur || isRef ? 2.4 : 1) + '"/>';
          if (K[x] !== null) s += '<text x="' + (X0 + cw / 2) + '" y="' + (y0 + 23) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#222">' + K[x] + '</text>';
          var h = W > 5 ? 120 : 90;
          s += '<rect x="' + X0 + '" y="' + (y0 + 44) + '" width="' + cw + '" height="' + h + '" fill="' + fill + '" stroke="' + st + '" stroke-width="' + (isCur || isRef ? 2.4 : 1) + '"/>';
          if (IT[x] !== null) {
            if (!IT[x].length) s += '<text x="' + (X0 + cw / 2) + '" y="' + (y0 + 66) + '" text-anchor="middle" font-size="12" fill="' + C.muted + '">∅</text>';
            IT[x].forEach(function (k, r) {
              s += '<text x="' + (X0 + cw / 2) + '" y="' + (y0 + 62 + r * 15) + '" text-anchor="middle" font-size="11.5" fill="' + C.green + '">' + esc(ex.names[k]) + '</text>';
            });
          }
        }
        s += '<text x="' + (x0 - 10) + '" y="' + (y0 + 23) + '" text-anchor="end" font-size="13" font-weight="700" fill="' + C.pur + '">K</text>';
        s += '<text x="' + (x0 - 10) + '" y="' + (y0 + 90) + '" text-anchor="end" font-size="12" font-weight="700" fill="' + C.pur + '">ITEMS</text>';
        var ty = y0 + (W > 5 ? 190 : 160);
        s += '<text x="12" y="' + (ty + 16) + '" font-size="12" font-weight="700" fill="' + C.pur + '">item</text>' +
          '<text x="12" y="' + (ty + 36) + '" font-size="12" fill="' + C.blue + '">weight</text>' +
          '<text x="12" y="' + (ty + 56) + '" font-size="12" fill="' + C.green + '">value</text>';
        for (i = 0; i < n; i++) {
          var ix = 80 + i * 90, on = i === curI;
          if (on) s += '<rect x="' + (ix - 40) + '" y="' + ty + '" width="80" height="64" rx="6" fill="' + C.orL + '" stroke="' + C.or + '" stroke-width="2"/>';
          s += '<text x="' + ix + '" y="' + (ty + 16) + '" text-anchor="middle" font-size="12" font-weight="700" fill="' + C.pur + '">' + (i + 1) + ". " + esc(ex.names[i]) + '</text>' +
            '<text x="' + ix + '" y="' + (ty + 36) + '" text-anchor="middle" font-size="13" fill="' + C.blue + '">' + ex.w[i] + '</text>' +
            '<text x="' + ix + '" y="' + (ty + 56) + '" text-anchor="middle" font-size="13" fill="' + C.green + '">' + ex.v[i] + '</text>';
        }
        s += '<text x="' + (80 + n * 90) + '" y="' + (ty + 36) + '" font-size="13" font-weight="700" fill="' + C.pur + '">Capacity: ' + W + '</text>';
        var H = ty + 100;
        if (msg) s += '<text x="12" y="' + (H - 14) + '" font-size="13" font-weight="700" fill="' + C.pur + '">' + esc(msg) + '</text>';
        return '<svg viewBox="0 0 ' + Wd + ' ' + H + '" width="' + Wd + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">' + s + '</svg>';
      }
      function snap(desc, line, msg, note) {
        var st = { desc: desc, pc: { P: line },
          vars: { x: vx, i: vi, "K[x-w_i]+v_i": vcand, updated: vupd, K: K.map(function (k) { return k === null ? "-" : k; }), "ITEMS[x]": curX === null ? "-" : itemsStr(IT[curX]) },
          svg: draw(msg) };
        if (note) st.note = note;
        steps.push(st);
      }

      K[0] = 0;
      snap("K[0] = 0 이다. 용량 0 인 가방에는 아무것도 못 넣는다.", 2, "K[0] = 0");
      IT[0] = []; curX = 0;
      snap("ITEMS[0] = ∅ 로 시작한다.", 3, "ITEMS[0] = ∅");
      for (x = 1; x <= W; x++) {
        curX = x; refX = null; curI = null; vx = x; vi = "-"; vcand = "-"; vupd = "-";
        K[x] = 0; IT[x] = [];
        snap("x = " + x + ": K[" + x + "] = 0 으로 놓고 item 을 하나씩 본다.", 5, "K[" + x + "] = 0");
        for (i = 0; i < n; i++) {
          curI = i; vi = i + 1;
          if (ex.w[i] > x) {
            refX = null; vcand = "-"; vupd = "-";
            snap("item " + (i + 1) + "(" + ex.names[i] + ") 은 무게 " + ex.w[i] + " 이 x = " + x + " 보다 커서 못 넣는다.", 7, "w_" + (i + 1) + " = " + ex.w[i] + " > " + x + " → 건너뜀");
            continue;
          }
          refX = x - ex.w[i];
          var cand = K[refX] + ex.v[i];
          vcand = "K[" + refX + "] + " + ex.v[i] + " = " + cand;
          if (cand > K[x]) {
            var old = K[x];
            K[x] = cand; IT[x] = IT[refX].concat([i]); vupd = "yes (" + old + " → " + cand + ")";
            snap("item " + (i + 1) + "(" + ex.names[i] + "): K[" + refX + "] + " + ex.v[i] + " = " + cand + " 가 지금 K[" + x + "] = " + old + " 보다 크다. K[" + x + "] = " + cand +
              ", ITEMS[" + x + "] = ITEMS[" + refX + "] ∪ {" + ex.names[i] + "}.", 10, "ITEMS[" + x + "] = ITEMS[" + refX + "] + " + ex.names[i] + " → " + itemsStr(IT[x]));
          } else {
            vupd = "no";
            snap("item " + (i + 1) + "(" + ex.names[i] + "): K[" + refX + "] + " + ex.v[i] + " = " + cand + " 은 지금 K[" + x + "] = " + K[x] + " 보다 크지 않다. 그대로 둔다.", 8, "max{" + K[x] + ", " + cand + "} = " + K[x] + " (갱신 없음)");
          }
        }
      }
      curI = null; refX = null; curX = W; vi = "-"; vcand = "-"; vupd = "-";
      var wsum = IT[W].reduce(function (a, k) { return a + ex.w[k]; }, 0);
      snap("끝. 최대 가치는 '''K[" + W + "] = " + K[W] + "''' 이고 ITEMS[" + W + "] = " + itemsStr(IT[W]) + " (무게 합 " + wsum + ") 이다.", 11,
        "return ITEMS[" + W + "] = " + itemsStr(IT[W]) + ", 가치 " + K[W]);

      return {
        panels: [{ id: "P", title: "UnboundedKnapsack (p.49)", lang: "c", lines: CODE }],
        vars: [
          { name: "x", group: "반복" }, { name: "i", group: "반복" }, { name: "K[x-w_i]+v_i", group: "반복" }, { name: "updated", group: "반복" },
          { name: "K", group: "표" }, { name: "ITEMS[x]", group: "표" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
