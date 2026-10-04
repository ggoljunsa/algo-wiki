window.SIMS = window.SIMS || {};
// hb_mod13_check — HW2 5번: h_b(x) = (85x + b) mod 13, b 만 무작위인 family 는 universal 인가?
(function (global) {
  "use strict";

  var PROC = [
    "1. 85 mod 13 = 7 → h_b(x) = (7x + b) mod 13",
    "2. h_b(x) = h_b(y) ⟺ 7x + b ≡ 7y + b (mod 13)",
    "3. ⟺ 7(x − y) ≡ 0 (mod 13)   (b 소거)",
    "4. ⟺ x ≡ y (mod 13)   (gcd(7,13)=1, 7의 역원 2)",
    "5. universal 이려면 모든 x ≠ y 에서 P_b[충돌] ≤ 1/13",
    "6. 잉여류별 쌍 수: 3개짜리 4류 → 12,  2개짜리 9류 → 9,  합 21"
  ];
  var M = 13, N = 30;
  var C = { pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", or: "#e09a40", orL: "#fdeec2",
    blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", muted: "#777", ink: "#222" };

  function mod(a) { return ((a % M) + M) % M; }
  function t(x, y, s, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" fill="' + (fill || C.ink) + '" text-anchor="' +
      ((extra && extra.anchor) || "middle") + '"' + ((extra && extra.bold) ? ' font-weight="700"' : "") + ">" + s + "</text>";
  }

  // ---- 쌍 모드 svg: 13 칸 + 두 공 + b 다이얼 + 간격 화살표 ----
  function svgPair(v) {
    var X0 = 30, W = 44, BY = 110, BH = 56;
    var s = '<svg viewBox="0 0 760 250" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    s += t(10, 20, "h_b(x) = (7x + b) mod 13 — 13 개 bucket 에 x = " + v.x + ", y = " + v.y + " 를 넣는다", 12, "#555", { anchor: "start" });
    // b 다이얼
    var dx = 712, dy = 52, R = 30;
    s += '<circle cx="' + dx + '" cy="' + dy + '" r="' + R + '" fill="' + C.orL + '" stroke="' + C.or + '" stroke-width="2"/>';
    for (var k = 0; k < M; k++) {
      var ang = -Math.PI / 2 + 2 * Math.PI * k / M;
      var on = v.b !== null && k === v.b;
      s += '<circle cx="' + (dx + (R - 6) * Math.cos(ang)).toFixed(1) + '" cy="' + (dy + (R - 6) * Math.sin(ang)).toFixed(1) +
        '" r="' + (on ? 3.5 : 1.8) + '" fill="' + (on ? C.red : C.or) + '"/>';
    }
    s += t(dx, dy + 5, v.b === null ? "b=?" : "b=" + v.b, 13, C.ink, { bold: true });
    s += t(dx, dy + R + 14, "b 다이얼 (무작위)", 10, C.muted);
    // 칸
    for (var i = 0; i < M; i++) {
      var x = X0 + i * W, hit = v.hx !== null && v.hx === i && v.hy === i;
      s += '<rect x="' + x + '" y="' + BY + '" width="' + (W - 4) + '" height="' + BH + '" rx="4" fill="' + (hit ? C.redL : C.purL) +
        '" stroke="' + (hit ? C.red : C.pur) + '" stroke-width="' + (hit ? 2.5 : 1.2) + '"/>';
      s += t(x + (W - 4) / 2, BY + BH + 16, i, 11, hit ? C.red : C.pur, { bold: true });
    }
    if (v.hx !== null) {
      var same = v.hx === v.hy;
      var cxX = X0 + v.hx * W + (W - 4) / 2, cxY = X0 + v.hy * W + (W - 4) / 2;
      var colX = same ? C.red : C.blue, colY = same ? C.red : C.or;
      s += '<circle cx="' + cxX + '" cy="' + (BY + 18) + '" r="11" fill="' + colX + '"/>' + t(cxX, BY + 22, v.x, 11, "#fff", { bold: true });
      s += '<circle cx="' + cxY + '" cy="' + (BY + 42) + '" r="11" fill="' + colY + '"/>' + t(cxY, BY + 46, v.y, 11, "#fff", { bold: true });
      if (!same) {
        // 간격 화살표: x 의 칸 → y 의 칸 (오른쪽으로 7 칸, 넘치면 감아 돈다)
        var ay = BY - 14, x1 = Math.min(cxX, cxY), x2 = Math.max(cxX, cxY);
        s += '<line x1="' + x1 + '" y1="' + ay + '" x2="' + x2 + '" y2="' + ay + '" stroke="' + C.green + '" stroke-width="2"/>';
        s += '<line x1="' + x1 + '" y1="' + (ay - 5) + '" x2="' + x1 + '" y2="' + (ay + 5) + '" stroke="' + C.green + '" stroke-width="2"/>';
        s += '<line x1="' + x2 + '" y1="' + (ay - 5) + '" x2="' + x2 + '" y2="' + (ay + 5) + '" stroke="' + C.green + '" stroke-width="2"/>';
        s += t((x1 + x2) / 2, ay - 6, v.hy > v.hx ? "간격 " + (v.hy - v.hx) + " 칸" : "오른쪽 7 칸 = 12 넘어 감아 돎 (왼쪽 " + (v.hx - v.hy) + " 칸)", 11, C.green, { bold: true });
      }
    }
    var d = mod(7 * (v.y - v.x));
    s += t(10, 210, "고정 간격: h_b(y) − h_b(x) ≡ 7(y − x) = 7·" + (v.y - v.x) + " ≡ " + d + " (mod 13) — b 를 바꿔도 그대로" +
      (d === 0 ? " → 항상 같은 칸" : " → 절대 같은 칸 아님"), 12, d === 0 ? C.red : C.green, { anchor: "start", bold: true });
    s += t(10, 234, "충돌 " + v.hits + " / 본 b " + v.seen + (v.seen ? "   (기준 1/13 ≈ 0.077)" : ""), 12, C.ink, { anchor: "start" });
    s += "</svg>";
    return s;
  }

  // ---- count 모드 svg: 13 열(잉여류) ----
  function svgCount(v) {
    var X0 = 22, W = 55, Y0 = 50;
    var s = '<svg viewBox="0 0 760 270" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    s += t(10, 20, "U = {0..29} 를 x mod 13 으로 나눈 13 잉여류 — 같은 열 안의 두 수만 (모든 b 에서) 충돌", 12, "#555", { anchor: "start" });
    for (var r = 0; r < M; r++) {
      var x = X0 + r * W, done = r <= v.r, cur = r === v.r;
      var fill = cur ? C.orL : (done ? C.purL : "#f6f6f6"), stroke = cur ? C.or : (done ? C.pur : "#ccc");
      s += '<rect x="' + x + '" y="' + (Y0 - 8) + '" width="' + (W - 6) + '" height="118" rx="5" fill="' + fill + '" stroke="' + stroke +
        '" stroke-width="' + (cur ? 2.5 : 1.2) + '"/>';
      s += t(x + (W - 6) / 2, Y0 + 8, "r=" + r, 11, done ? C.pur : "#aaa", { bold: true });
      var mem = [];
      for (var u = r; u < N; u += M) mem.push(u);
      for (var k = 0; k < mem.length; k++) {
        s += t(x + (W - 6) / 2, Y0 + 34 + k * 26, mem[k], 14, done ? (mem.length === 3 ? C.red : C.ink) : "#bbb", { bold: done });
      }
      if (done) {
        var c2 = mem.length * (mem.length - 1) / 2;
        s += t(x + (W - 6) / 2, Y0 + 132, "C(" + mem.length + ",2)", 10, C.muted);
        s += t(x + (W - 6) / 2, Y0 + 150, c2, 14, C.red, { bold: true });
      }
    }
    s += t(10, 248, "누적 최대 충돌 쌍 (P = 1): " + v.total + (v.final ? "   / 나머지 435 − 21 = 414 쌍은 P = 0" : ""), 13,
      v.final ? C.red : C.ink, { anchor: "start", bold: true });
    s += "</svg>";
    return s;
  }

  global.SIMS["hb_mod13_check"] = {
    title: "HW2 5번 — h_b(x) = (85x + b) mod 13 은 universal 인가?",
    desc: "HW2 5번. b 만 무작위인 family {h_b} 를 b = 0..12 전부 돌려 쌍의 충돌 확률을 센다. 85 ≡ 7 (mod 13) 이고 b 는 양쪽에 똑같이 더해져 소거되므로 " +
      "충돌 여부는 b 와 무관 — 확률이 '''1 아니면 0'''. x ≡ y (mod 13) 인 쌍(21 쌍)은 P = 1 > 1/13 → [[universal hash family]] 아님. " +
      "[[modular arithmetic]] 으로 b 가 지워지는 과정을 보고, 무작위가 차에 곱해지는 [[h_{a,b}]] 와 비교하라. [[hash collision]] · [[비둘기집 원리]]",
    options: [
      { key: "mode", label: "모드", values: [
        { value: "same", label: "쌍 (0, 13): 같은 잉여류" },
        { value: "diff", label: "쌍 (0, 1): 다른 잉여류" },
        { value: "count", label: "최대 충돌 쌍 세기 (21 쌍)" }
      ] }
    ],
    build: function (opts) {
      var mode = opts.mode === "diff" || opts.mode === "count" ? opts.mode : "same";
      var steps = [];
      var panels = [{ id: "P", title: "손으로 푸는 순서 (HW2 5번)", lang: "txt", lines: PROC }];

      if (mode === "count") {
        var total = 0;
        var cur = { r: "-", mem: "-", size: "-", c2: "-" };
        var snapC = function (fin) {
          return { "잉여류 r": cur.r, "구성원 (x mod 13 = r)": cur.mem, "크기": cur.size, "C(크기,2)": cur.c2,
            "누적 쌍 수": total, "최대 충돌 확률": total ? "1 (b 와 무관)" : "-",
            "P = 0 인 쌍": fin ? "435 − 21 = 414" : "-" };
        };
        steps.push({ desc: "|U| = 30 이므로 쌍은 C(30,2) = 435 개. 4 번 줄에서 '''충돌 ⟺ x ≡ y (mod 13)''' 이므로 x mod 13 이 같은 수끼리 묶으면, " +
          "같은 묶음 안의 쌍만 (모든 b 에서) 충돌한다.",
          pc: { P: 4 }, vars: snapC(false), svg: svgCount({ r: -1, total: 0 }) });
        for (var r = 0; r < M; r++) {
          var mem = [];
          for (var u = r; u < N; u += M) mem.push(u);
          var c2 = mem.length * (mem.length - 1) / 2;
          total += c2;
          cur = { r: r, mem: "{" + mem.join(", ") + "}", size: mem.length, c2: c2 };
          steps.push({ desc: "r = " + r + ": {" + mem.join(", ") + "} — " + mem.length + " 개 → C(" + mem.length + ",2) = '''" + c2 + "''' 쌍, 누적 " + total + "." +
            (r === 3 ? " (30 = 2·13 + 4 라서 잉여 0~3 만 3 개씩)" : ""),
            pc: { P: 6 }, vars: snapC(false), svg: svgCount({ r: r, total: total }) });
        }
        cur = { r: "-", mem: "-", size: "-", c2: "-" };
        steps.push({ desc: "합계: 3 개짜리 4 류 × 3 = 12, 2 개짜리 9 류 × 1 = 9 → '''21 쌍'''이 최대 충돌 확률 '''1''' (> 1/13). 나머지 414 쌍은 확률 0. (b) 의 답.",
          pc: { P: 6 }, vars: snapC(true), status: { P: "done" }, svg: svgCount({ r: 99, total: total, final: true }),
          note: "평균은 21/435 ≈ 0.048 < 1/13 이지만 universal 은 '''모든''' 쌍에서 ≤ 1/13 을 요구한다 — 쌍 하나라도 1 이면 탈락." });
        return {
          panels: panels,
          vars: [
            { name: "잉여류 r", group: "현재 묶음" }, { name: "구성원 (x mod 13 = r)", group: "현재 묶음" }, { name: "크기", group: "현재 묶음" },
            { name: "C(크기,2)", group: "현재 묶음" },
            { name: "누적 쌍 수", group: "집계" }, { name: "최대 충돌 확률", group: "집계" }, { name: "P = 0 인 쌍", group: "집계" }
          ],
          steps: steps
        };
      }

      var X = 0, Y = mode === "same" ? 13 : 1;
      var hits = 0, seen = 0;
      var st = { b: "-", hx: "-", hy: "-", col: "-" };
      var snap = function (fin) {
        return { x: X, y: Y, b: st.b, "h_b(x)": st.hx, "h_b(y)": st.hy, "충돌?": st.col,
          "충돌 횟수/본 b 수": hits + "/" + seen,
          "P_b[충돌]": fin ? hits + "/13 = " + (hits === 13 ? "1" : "0") : (seen ? hits + "/" + seen : "-"),
          "≤ 1/13 ?": fin ? (hits <= 1 ? "예 (이 쌍은 통과)" : "아니오 → universal 아님") : "-" };
      };
      steps.push({ desc: "85 = 6·13 + 7 이므로 '''85 mod 13 = 7''' → h_b(x) = (7x + b) mod 13. 쌍 (x, y) = (" + X + ", " + Y + ") 에 대해 b = 0..12 를 하나씩 돌려 본다.",
        pc: { P: 1 }, vars: snap(false), svg: svgPair({ x: X, y: Y, b: null, hx: null, hy: null, hits: 0, seen: 0 }) });
      var lastSvg = "";
      for (var b = 0; b < M; b++) {
        var ax = 7 * X + b, ay = 7 * Y + b, hx = mod(ax), hy = mod(ay), col = hx === hy;
        seen++; if (col) hits++;
        st = { b: b, hx: ax + " mod 13 = " + hx, hy: ay + " mod 13 = " + hy, col: col ? "예" : "아니오" };
        lastSvg = svgPair({ x: X, y: Y, b: b, hx: hx, hy: hy, hits: hits, seen: seen });
        steps.push({ desc: "b = " + b + ": 7·" + X + " + " + b + " = " + ax + " → " + hx + ",  7·" + Y + " + " + b + " = " + ay + " → " + hy + ". " +
          (col ? "'''같은 칸 — 충돌'''" : "다른 칸") + ". 누적 " + hits + "/" + seen + ".",
          pc: { P: 2 }, vars: snap(false), svg: lastSvg });
      }
      st = { b: "-", hx: "-", hy: "-", col: "-" };
      if (mode === "same") {
        steps.push({ desc: "13 개 b 전부 충돌: P_b[h_b(0) = h_b(13)] = 13/13 = '''1''' > 1/13 → '''universal 아님''' ((a) 의 반례). " +
          "h_b(0) = b, h_b(13) = (91 + b) mod 13 = b — 7·13 = 91 ≡ 0 이라 b 가 무엇이든 같다.",
          pc: { P: 5 }, vars: snap(true), status: { P: "done" }, svg: lastSvg,
          note: "b 는 양쪽에 똑같이 더해져 소거된다: 7x + b ≡ 7y + b ⟺ 7(x − y) ≡ 0 ⟺ x ≡ y (mod 13). 무작위 b 가 충돌 여부에 아무 영향을 못 준다." });
      } else {
        steps.push({ desc: "13 개 b 전부 다른 칸: P_b[h_b(0) = h_b(1)] = 0/13 = '''0'''. 간격 h_b(1) − h_b(0) ≡ 7 이 b 와 무관하게 고정되어 있기 때문. " +
          "이 쌍은 통과하지만, (0, 13) 같은 쌍 하나 때문에 family 전체는 universal 이 아니다.",
          pc: { P: 4 }, vars: snap(true), status: { P: "done" }, svg: lastSvg,
          note: "b 가 소거되므로 확률은 1 아니면 0 뿐이다. '1/13 근처로 흩어지는' 쌍은 하나도 없다 — 무작위가 차 7(x − y) 에 곱해지지 않기 때문 (h_{a,b} 와 대비)." });
      }
      return {
        panels: panels,
        vars: [
          { name: "x", group: "쌍" }, { name: "y", group: "쌍" },
          { name: "b", group: "현재 b" }, { name: "h_b(x)", group: "현재 b" }, { name: "h_b(y)", group: "현재 b" }, { name: "충돌?", group: "현재 b" },
          { name: "충돌 횟수/본 b 수", group: "집계" }, { name: "P_b[충돌]", group: "집계" }, { name: "≤ 1/13 ?", group: "집계" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
