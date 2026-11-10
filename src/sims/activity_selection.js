// activity_selection — L14 p.10–17 greedy: 넣을 수 있는 activity 중 finish time 이 가장 빠른 것을 고르고 반복.
//   슬라이드 그림에는 시간 눈금이 없다. 막대 위치(p.17 PNG, 900px 폭)를 보고 정수로 근사했다(약 37px = 1):
//     a1 [2,6)  a2 [0,5)  a3 [13,18)  a4 [8,13)  a5 [6,12)  a6 [15,22)  a7 [19,23)
//   겹침 판정은 s_i ≥ (마지막으로 고른 activity 의 finish) 이면 넣을 수 있음.
//
// 기대 최종값 (src/sims/_check_L13_L14.py → _check_L13_L14.txt):
//  finish 순서 a2(5) a1(6) a5(12) a4(13) a3(18) a6(22) a7(23)
//  a2 선택 → a1 버림(2 < 5) → a5 선택 → a4 버림(8 < 12) → a3 선택 → a6 버림(15 < 18) → a7 선택
//  선택 = {a2, a5, a3, a7}, 4개 (p.17 주황 막대와 같음; 회색 빗금 = a1, a4, a6)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "Pick activity you can add with the smallest finish time.",
    "Repeat.",
    "// 구현: activities 를 finish time 순으로 정렬 (O(n log n))",
    "last_finish = -∞;  S = ∅",
    "for a_i in 정렬 순서:",
    "    if s_i ≥ last_finish:",
    "        S = S ∪ {a_i};  last_finish = f_i",
    "    else: a_i 는 버림 (이미 고른 것과 겹침)",
    "return S"
  ];

  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", or: "#e09a40", orL: "#f5a524", pur: "#3b2f4a", red: "#d6465f", muted: "#777", gray: "#9a9a9a" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  // 슬라이드 그림의 세로 위치(행)도 따라 그린다: 0 = 위, 2 = 아래
  var ACTS = [
    { id: "a1", s: 2, f: 6, row: 1 }, { id: "a2", s: 0, f: 5, row: 2 }, { id: "a3", s: 13, f: 18, row: 1 },
    { id: "a4", s: 8, f: 13, row: 2 }, { id: "a5", s: 6, f: 12, row: 0 }, { id: "a6", s: 15, f: 22, row: 2.6 },
    { id: "a7", s: 19, f: 23, row: 1.4 }
  ];

  global.SIMS["activity_selection"] = {
    title: "Activity selection — finish time 이 빠른 것부터 (L14 p.10–17)",
    desc: "L14 p.10–17. [[activity selection]] 의 greedy 는 지금 넣을 수 있는 activity 중 끝나는 시각이 가장 빠른 것을 고른다. " +
      "빨리 끝날수록 뒤에 남는 시간이 많다. 슬라이드 그림에는 눈금이 없어서 막대 위치를 정수 시각으로 읽었다.",
    options: [],
    build: function () {
      var order = ACTS.slice().sort(function (a, b) { return a.f - b.f; });
      var state = {}, steps = [], last = -Infinity, S = [], cur = null;
      ACTS.forEach(function (a) { state[a.id] = "wait"; });

      function draw(msg) {
        var x0 = 30, u = 30, y0 = 40, bh = 34, s = "", W = x0 + 24 * u + 30, H = 260;
        ACTS.forEach(function (a) {
          var x = x0 + a.s * u, w = (a.f - a.s) * u, y = y0 + a.row * 40, st = state[a.id], isCur = cur === a.id;
          var fill = st === "pick" ? C.orL : st === "drop" ? "#d4d4d4" : "#fff";
          var stroke = isCur ? C.blue : st === "pick" ? "#b8741a" : st === "drop" ? C.gray : "#666";
          s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + bh + '" rx="5" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (isCur ? 3 : 1.5) + '"' + (st === "drop" ? ' stroke-dasharray="4 3"' : "") + '/>';
          s += '<text x="' + (x + w / 2) + '" y="' + (y + 15) + '" text-anchor="middle" font-size="14" font-weight="700" fill="' + (st === "drop" ? "#666" : "#222") + '">' + a.id + '</text>' +
            '<text x="' + (x + w / 2) + '" y="' + (y + 29) + '" text-anchor="middle" font-size="10.5" fill="#444">[' + a.s + ', ' + a.f + ')</text>';
        });
        var ay = y0 + 3.6 * 40 + 6;
        s += '<line x1="' + x0 + '" y1="' + ay + '" x2="' + (x0 + 23.6 * u) + '" y2="' + ay + '" stroke="' + C.blue + '" stroke-width="2"/>' +
          '<path d="M' + (x0 + 23.6 * u) + ',' + (ay - 5) + ' L' + (x0 + 24 * u) + ',' + ay + ' L' + (x0 + 23.6 * u) + ',' + (ay + 5) + ' z" fill="' + C.blue + '"/>';
        for (var t = 0; t <= 23; t++) {
          s += '<line x1="' + (x0 + t * u) + '" y1="' + (ay - 3) + '" x2="' + (x0 + t * u) + '" y2="' + (ay + 3) + '" stroke="' + C.blue + '"/>';
          if (t % 2 === 0 || t === 23) s += '<text x="' + (x0 + t * u) + '" y="' + (ay + 16) + '" text-anchor="middle" font-size="10" fill="' + C.muted + '">' + t + '</text>';
        }
        if (last > -Infinity) {
          var lx = x0 + last * u;
          s += '<line x1="' + lx + '" y1="' + (y0 - 14) + '" x2="' + lx + '" y2="' + ay + '" stroke="' + C.red + '" stroke-width="2" stroke-dasharray="6 4"/>' +
            '<text x="' + (last > 16 ? lx - 4 : lx + 4) + '" y="' + (y0 - 18) + '"' + (last > 16 ? ' text-anchor="end"' : "") + ' font-size="11.5" font-weight="700" fill="' + C.red + '">last_finish = ' + last + '</text>';
        }
        if (msg) s += '<text x="12" y="' + (H - 12) + '" font-size="13" font-weight="700" fill="' + C.pur + '">' + esc(msg) + '</text>';
        return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">' + s + '</svg>';
      }
      function snap(desc, line, msg, a) {
        steps.push({ desc: desc, pc: { P: line },
          vars: { "finish 순서": order.map(function (o) { return o.id + "(" + o.f + ")"; }),
            a_i: a ? a.id : "-", s_i: a ? a.s : "-", f_i: a ? a.f : "-",
            last_finish: last === -Infinity ? "-∞" : last, S: S.slice(), "|S|": S.length },
          svg: draw(msg) });
      }

      snap("activity 7개다. 시간 눈금은 그림에서 읽은 근사값이다. 먼저 finish time 순으로 정렬한다: " +
        order.map(function (o) { return o.id; }).join(", ") + ".", 3, "finish 순: " + order.map(function (o) { return o.id; }).join(" < "));
      snap("아직 고른 것이 없다. last_finish = -∞ 로 둔다.", 4, "S = ∅");
      order.forEach(function (a) {
        cur = a.id;
        snap(a.id + " = [" + a.s + ", " + a.f + ") 를 본다. 남은 것 중 finish time 이 가장 빠르다.", 5, a.id + " 검사", a);
        if (a.s >= last) {
          state[a.id] = "pick"; S.push(a.id); last = a.f;
          snap(a.id + " 의 시작 " + a.s + " 이 last_finish 이후다. 겹치지 않으니 고른다. last_finish = " + a.f + ".", 7, a.id + " 선택 → S = {" + S.join(", ") + "}", a);
        } else {
          state[a.id] = "drop";
          snap(a.id + " 의 시작 " + a.s + " 이 last_finish = " + last + " 보다 이르다. 이미 고른 activity 와 겹쳐서 버린다.", 8, a.id + " 버림 (" + a.s + " < " + last + ")", a);
        }
      });
      cur = null;
      snap("끝. 고른 activity 는 '''{" + S.join(", ") + "}''' 4개다. p.17 그림의 주황 막대와 같다. 정렬돼 있으면 한 번 훑는 데 O(n) 이다(p.18).", 9, "S = {" + S.join(", ") + "}, |S| = " + S.length);

      return {
        panels: [{ id: "P", title: "Greedy (p.10, p.18)", lang: "txt", lines: CODE }],
        vars: [
          { name: "finish 순서", group: "입력" },
          { name: "a_i", group: "지금" }, { name: "s_i", group: "지금" }, { name: "f_i", group: "지금" },
          { name: "last_finish", group: "결과" }, { name: "S", group: "결과" }, { name: "|S|", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
