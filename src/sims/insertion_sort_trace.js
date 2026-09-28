// insertion_sort_trace — L1 p.10–21 삽입 정렬 [4,3,1,5,2] 한 줄씩 (+ L2 p.28–38 worst/best 입력)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "def insertion_sort(A):",
    "  for i in range(1, len(A)):",
    "    cur_value = A[i]",
    "    j = i - 1",
    "    while j >= 0 and A[j] > cur_value:",
    "      A[j+1] = A[j]",
    "      j -= 1",
    "    A[j+1] = cur_value"
  ];

  var INPUTS = {
    slide: { A: [4, 3, 1, 5, 2], name: "슬라이드 [4,3,1,5,2]" },
    worst: { A: [5, 4, 3, 2, 1], name: "역순 [5,4,3,2,1] (worst)" },
    best: { A: [1, 2, 3, 4, 5], name: "정렬됨 [1,2,3,4,5] (best)" }
  };

  // v: {A, sortedEnd, hole, cmp, cur, lifted}
  function drawArray(v) {
    var n = v.A.length, W = 40, G = 6;
    var x0 = (760 - (n * W + (n - 1) * G)) / 2, y = 110;
    var s = '<svg viewBox="0 0 760 210" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="16">';
    for (var k = 0; k < n; k++) {
      var x = x0 + k * (W + G);
      var fill = "#dbe8f7", stroke = "#1d65b3", sw = 2, dash = "", tcol = "#222";
      if (k < v.sortedEnd) { fill = "#dff3e4"; stroke = "#2e9e4f"; }
      if (v.hole === k) { fill = "#fff"; stroke = "#777"; dash = ' stroke-dasharray="4 3"'; tcol = "#aaa"; }
      if (v.cmp === k) { stroke = "#d6465f"; sw = 3; }
      s += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + W + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"' + dash + "/>";
      s += '<text x="' + (x + W / 2) + '" y="' + (y + 26) + '" text-anchor="middle" font-weight="700" fill="' + tcol + '">' + v.A[k] + "</text>";
      s += '<text x="' + (x + W / 2) + '" y="' + (y + 60) + '" text-anchor="middle" font-size="11" fill="#777">' + k + "</text>";
    }
    if (v.lifted && v.hole !== null && v.hole !== undefined) {
      var hx = x0 + v.hole * (W + G);
      s += '<rect x="' + hx + '" y="30" width="' + W + '" height="' + W + '" rx="4" fill="#fdeec2" stroke="#e09a40" stroke-width="3"/>';
      s += '<text x="' + (hx + W / 2) + '" y="56" text-anchor="middle" font-weight="700">' + v.cur + "</text>";
      s += '<text x="' + (hx + W + 6) + '" y="54" font-size="12" fill="#e09a40">cur_value</text>';
      s += '<line x1="' + (hx + W / 2) + '" y1="72" x2="' + (hx + W / 2) + '" y2="106" stroke="#e09a40" stroke-dasharray="3 3"/>';
    }
    if (v.cmp !== null && v.cmp !== undefined && v.cmp >= 0) {
      var cx = x0 + v.cmp * (W + G);
      s += '<text x="' + (cx + W / 2) + '" y="100" text-anchor="middle" font-size="11" fill="#d6465f">A[j]</text>';
    }
    s += '<rect x="20" y="186" width="14" height="14" fill="#dff3e4" stroke="#2e9e4f"/><text x="40" y="198" font-size="12" fill="#555">정렬된 앞부분</text>';
    s += '<rect x="150" y="186" width="14" height="14" fill="#fdeec2" stroke="#e09a40"/><text x="170" y="198" font-size="12" fill="#555">들어 올린 cur_value</text>';
    s += '<rect x="310" y="186" width="14" height="14" fill="#fff" stroke="#d6465f" stroke-width="2"/><text x="330" y="198" font-size="12" fill="#555">비교 중인 A[j]</text>';
    s += '<rect x="450" y="186" width="14" height="14" fill="#fff" stroke="#777" stroke-dasharray="3 2"/><text x="470" y="198" font-size="12" fill="#555">빈 자리(hole) — 값은 복사본</text>';
    s += "</svg>";
    return s;
  }

  global.SIMS["insertion_sort_trace"] = {
    title: "insertion sort 한 줄씩",
    desc: "L1 p.10–21 의 [[insertion sort]] 코드를 한 줄씩 실행한다. 초록 = 이미 정렬된 앞부분 `A[:i]`, 주황 = 들어 올린 `cur_value`, " +
      "빨강 = 비교 중인 `A[j]`. 입력을 역순으로 바꾸면 [[삽입 정렬의 worst-case]](shift = n(n−1)/2), 정렬된 입력이면 [[삽입 정렬의 best-case]](shift 0).",
    options: [
      { key: "input", label: "입력", values: [
        { value: "slide", label: INPUTS.slide.name },
        { value: "worst", label: INPUTS.worst.name },
        { value: "best", label: INPUTS.best.name }
      ] }
    ],
    build: function (opts) {
      var inp = INPUTS[opts.input] || INPUTS.slide;
      var A = inp.A.slice(), n = A.length;
      var st = { i: "-", cur: "-", j: "-", shift: 0, cmps: 0 };
      var steps = [];

      function push(desc, line, viz, note) {
        var vz = {
          A: A.slice(), sortedEnd: viz.sortedEnd, hole: viz.hole, cmp: viz.cmp,
          cur: st.cur, lifted: !!viz.lifted
        };
        steps.push({
          desc: desc, pc: { C: line },
          vars: { i: st.i, cur_value: st.cur, j: st.j, A: A.slice(), shift: st.shift, compares: st.cmps },
          note: note, svg: drawArray(vz)
        });
      }

      push("입력 `A = [" + A.join(", ") + "]`, n = " + n + ". 원소 하나짜리 `A[:1]` 은 이미 정렬돼 있다고 보고 i = 1 부터 시작한다.",
        1, { sortedEnd: 1, hole: null, cmp: null });

      for (var i = 1; i < n; i++) {
        st.i = i; st.cur = "-"; st.j = "-";
        push("바깥 루프 '''i = " + i + "'''. 앞부분 `A[:" + i + "] = [" + A.slice(0, i).join(", ") + "]` 은 정렬돼 있다. 이제 `A[" + i + "]` 를 그 안에 끼워 넣는다.",
          2, { sortedEnd: i, hole: null, cmp: null });
        st.cur = A[i];
        push("`cur_value = A[" + i + "] = " + st.cur + "` — 카드 한 장을 손에 들어 올린 것. 원래 자리 " + i + " 는 이제 비어 있는 셈(hole).",
          3, { sortedEnd: i, hole: i, cmp: null, lifted: true });
        var j = i - 1; st.j = j;
        var hole = i;
        push("`j = i - 1 = " + j + "` — cur_value 바로 왼쪽부터 비교를 시작한다.",
          4, { sortedEnd: i, hole: hole, cmp: null, lifted: true });
        while (true) {
          var cond = j >= 0 && A[j] > st.cur;
          if (j >= 0) st.cmps++;
          if (j < 0) {
            push("`j = -1` → `j >= 0` 이 거짓. 왼쪽 끝까지 왔다 — cur_value 가 지금까지 본 것 중 '''가장 작다'''.",
              5, { sortedEnd: i, hole: hole, cmp: null, lifted: true });
            break;
          }
          if (!cond) {
            push("`A[" + j + "] = " + A[j] + " > " + st.cur + "` 가 '''거짓''' → while 종료. " + A[j] + " 은 cur_value 보다 작으니 그 오른쪽이 제자리다.",
              5, { sortedEnd: i, hole: hole, cmp: j, lifted: true });
            break;
          }
          push("`A[" + j + "] = " + A[j] + " > cur_value = " + st.cur + "` 가 '''참''' → 한 칸 오른쪽으로 민다.",
            5, { sortedEnd: i, hole: hole, cmp: j, lifted: true });
          A[j + 1] = A[j]; st.shift++;
          hole = j;
          push("`A[" + (j + 1) + "] = A[" + j + "]` → " + A[j + 1] + " 이 오른쪽으로 이동(shift " + st.shift + " 번째). 빈 자리가 " + j + " 로 옮겨 왔다.",
            6, { sortedEnd: i, hole: hole, cmp: null, lifted: true });
          j -= 1; st.j = j;
          push("`j -= 1` → j = " + j + ".", 7, { sortedEnd: i, hole: hole, cmp: null, lifted: true });
        }
        A[j + 1] = st.cur;
        push("`A[" + (j + 1) + "] = cur_value = " + st.cur + "` — 빈 자리에 내려놓는다. i = " + i + " 끝: '''A = [" + A.join(", ") + "]''', 이제 `A[:" + (i + 1) + "]` 이 정렬됨.",
          8, { sortedEnd: i + 1, hole: null, cmp: null },
          i === n - 1 ? null : undefined);
      }

      var tail;
      if (opts.input === "worst") tail = "역순 입력은 매번 cur_value 가 맨 앞까지 가야 해서 shift 가 1+2+3+4 = '''10 = n(n−1)/2''' → [[삽입 정렬의 worst-case]] O(n^2).";
      else if (opts.input === "best") tail = "정렬된 입력은 while 조건이 매번 첫 비교에서 거짓 → shift '''0''', 비교 n−1 = 4 번뿐 → [[삽입 정렬의 best-case]] Ω(n).";
      else tail = "슬라이드 예제: shift 는 i=1 에서 1, i=2 에서 2, i=3 에서 0(5 는 이미 제자리), i=4 에서 3 → 총 '''6''' 번.";
      push("`range(1, " + n + ")` 가 끝났다 → 종료. 결과 '''A = [" + A.join(", ") + "]'''. " + tail,
        2, { sortedEnd: n, hole: null, cmp: null },
        "시험 포인트: 바깥 루프 i 가 끝날 때마다 `A[:i+1]` 이 정렬돼 있다 — 이것이 [[loop invariant]] 다.");

      return {
        panels: [{ id: "C", title: "insertion_sort (L1 p.10)", lang: "c", lines: CODE }],
        vars: [
          { name: "i", group: "루프" },
          { name: "cur_value", group: "루프" },
          { name: "j", group: "루프" },
          { name: "A", group: "배열" },
          { name: "shift", label: "shift 횟수", group: "비용" },
          { name: "compares", label: "비교 A[j] > cur_value", group: "비용" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
