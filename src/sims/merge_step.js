// merge_step — L3 p.18–24 merge(L, R) 한 줄씩 (+ HW1 5번 inversion 카운트 모드)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "def merge(L, R):",
    "  result = []",
    "  l_idx, r_idx = (0, 0)",
    "  while l_idx < len(L) and r_idx < len(R):",
    "    if L[l_idx] < R[r_idx]:",
    "      result.append(L[l_idx])",
    "      l_idx += 1",
    "    else:",
    "      result.append(R[r_idx])",
    "      r_idx += 1",
    "  result.extend(L[l_idx:len(L)])",
    "  result.extend(R[r_idx:len(R)])",
    "  return result"
  ];
  var INV = [
    "# HW1 5번: merge 하면서 cross inversion 세기",
    "cross = 0",
    "(else 분기, R 쪽을 뽑을 때)  cross += len(L) - l_idx",
    "total = inv(L 쪽 내부) + inv(R 쪽 내부) + cross"
  ];

  var L0 = [1, 4, 5, 8], R0 = [2, 3, 6, 7];
  var FULL = [8, 4, 1, 5, 3, 2, 6, 7];

  function countInv(a) {
    var c = 0;
    for (var i = 0; i < a.length; i++) for (var j = i + 1; j < a.length; j++) if (a[i] > a[j]) c++;
    return c;
  }
  function list(a) { return "[" + a.join(", ") + "]"; }

  // v: {l, r, result, cmp:bool, pick:"L"|"R"|null, inv:bool, added}
  function draw(v) {
    var W = 40, G = 6, s = '<svg viewBox="0 0 760 250" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="16">';
    function row(arr, idx, y, name, x0, side) {
      s += '<text x="' + (x0 - 12) + '" y="' + (y + 26) + '" text-anchor="end" font-weight="700" fill="#3b2f4a">' + name + "</text>";
      for (var k = 0; k < arr.length; k++) {
        var x = x0 + k * (W + G), fill = "#dbe8f7", stroke = "#1d65b3", sw = 2, tc = "#222";
        if (k < idx) { fill = "#f2f2f2"; stroke = "#ccc"; tc = "#aaa"; }
        if (k === idx && v.cmp) { stroke = "#d6465f"; sw = 3; }
        if (k === idx - 1 && v.pick === side) { fill = "#fdeec2"; stroke = "#e09a40"; tc = "#222"; sw = 3; }
        if (v.inv && v.pick === "R" && side === "L" && k >= idx) { fill = "#fbe3e7"; }
        s += '<rect x="' + x + '" y="' + y + '" width="' + W + '" height="' + W + '" rx="4" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
        s += '<text x="' + (x + W / 2) + '" y="' + (y + 26) + '" text-anchor="middle" font-weight="700" fill="' + tc + '">' + arr[k] + "</text>";
      }
      var px = x0 + Math.min(idx, arr.length) * (W + G) + W / 2;
      s += '<text x="' + px + '" y="' + (y + 60) + '" text-anchor="middle" font-size="12" fill="#d6465f">▲ ' + (side === "L" ? "l_idx" : "r_idx") + "=" + idx + "</text>";
    }
    row(L0, v.l, 20, "L", 90, "L");
    row(R0, v.r, 20, "R", 460, "R");
    s += '<text x="30" y="150" font-weight="700" fill="#2e9e4f">result</text>';
    for (var k = 0; k < 8; k++) {
      var x = 110 + k * (W + G), has = k < v.result.length;
      s += '<rect x="' + x + '" y="124" width="' + W + '" height="' + W + '" rx="4" fill="' + (has ? "#dff3e4" : "#fff") + '" stroke="' + (has ? "#2e9e4f" : "#ddd") + '" stroke-width="2"/>';
      if (has) s += '<text x="' + (x + W / 2) + '" y="150" text-anchor="middle" font-weight="700">' + v.result[k] + "</text>";
    }
    if (v.inv) {
      s += '<text x="110" y="205" font-size="14" fill="#d6465f">cross = ' + v.cross + (v.added ? "   (방금 +" + v.added + ": L 에 남은 원소 전부가 뽑힌 R 원소보다 크다)" : "") + "</text>";
    }
    s += '<text x="110" y="232" font-size="12" fill="#777">빨간 테두리 = 비교 중, 주황 = 방금 result 로 간 원소, 회색 = 이미 소비됨</text>';
    s += "</svg>";
    return s;
  }

  global.SIMS["merge_step"] = {
    title: "merge 한 줄씩 — 두 포인터",
    desc: "L3 p.18–24 의 [[merge]] 코드. 정렬된 L, R 의 맨 앞(l_idx, r_idx)끼리 비교해 작은 쪽을 result 로 보낸다. 한쪽이 바닥나면 남은 쪽을 통째로 extend. " +
      "'''result 는 항상 L, R 의 가장 작은 원소들을 정렬된 채로 담는다'''([[merge의 loop invariant]]). inversion 모드는 HW1 5번 — R 쪽을 뽑는 순간 L 에 남은 개수 `len(L) − l_idx` 만큼 [[inversion]] 이 있다.",
    options: [
      { key: "mode", label: "모드", values: [
        { value: "merge", label: "merge (L3 p.24)" },
        { value: "inv", label: "merge + inversion 카운트 (HW1 5번)" }
      ] }
    ],
    build: function (opts) {
      var inv = opts.mode === "inv";
      var L = L0, R = R0;
      var steps = [];
      var st = { l: 0, r: 0, result: [], comps: 0, cross: 0, added: 0, extended: "-", total: "-" };
      var invL = countInv(FULL.slice(0, 4)), invR = countInv(FULL.slice(4));

      function push(desc, line, viz, invLine, note) {
        var vars = { L: L.slice(), R: R.slice(), l_idx: st.l, r_idx: st.r, result: st.result.slice(), comparisons: st.comps, extended: st.extended };
        if (inv) { vars.cross = st.cross; vars.total = st.total; }
        var pc = { M: line };
        if (inv) pc.INV = invLine || null;
        steps.push({
          desc: desc, pc: pc, vars: vars, note: note,
          svg: draw({ l: st.l, r: st.r, result: st.result.slice(), cmp: !!viz.cmp, pick: viz.pick || null, inv: inv, cross: st.cross, added: viz.added || 0 })
        });
      }

      push("`merge(L, R)` 호출: `L = [1, 4, 5, 8]`, `R = [2, 3, 6, 7]` — mergesort 가 [8,4,1,5] 와 [3,2,6,7] 을 각각 정렬해 돌려준 두 절반(L3 p.12). '''두 리스트는 이미 정렬돼 있다'''는 것이 전제." +
        (inv ? " inversion 모드: 원래 [8,4,1,5,3,2,6,7] 에서 왼쪽 내부 inversion " + invL + " 개, 오른쪽 내부 " + invR + " 개는 재귀가 이미 셌다. 여기서는 '''L 과 R 사이'''(cross)만 센다." : ""),
        1, {}, inv ? 1 : null);
      push("`result = []`.", 2, {}, inv ? 2 : null);
      push("`l_idx, r_idx = (0, 0)` — 두 포인터가 각 리스트의 맨 앞(= 가장 작은 원소)을 가리킨다.", 3, {}, inv ? 2 : null);

      while (true) {
        var cond = st.l < L.length && st.r < R.length;
        if (!cond) {
          push("while 조건: `l_idx = " + st.l + " < " + L.length + "` and `r_idx = " + st.r + " < " + R.length + "` → '''거짓'''. " + (st.r >= R.length ? "R" : "L") + " 이 바닥났다. 루프 종료.", 4, {});
          break;
        }
        push("while 조건 참 (`l_idx = " + st.l + "`, `r_idx = " + st.r + "`). 두 맨 앞 원소 L[" + st.l + "] = " + L[st.l] + ", R[" + st.r + "] = " + R[st.r] + " 를 비교한다.", 4, { cmp: true });
        st.comps++;
        var takeL = L[st.l] < R[st.r];
        push("`L[l_idx] < R[r_idx]` → " + L[st.l] + " < " + R[st.r] + " 은 '''" + takeL + "''' (비교 " + st.comps + " 번째). " + (takeL ? "L 쪽이 더 작다." : "R 쪽이 더 작다 → else."), takeL ? 5 : 8, { cmp: true });
        if (takeL) {
          st.result.push(L[st.l]); st.l++;
          push("`result.append(L[l_idx])`, `l_idx += 1` → result = " + list(st.result) + ".", 7, { pick: "L" });
        } else {
          st.result.push(R[st.r]); st.r++;
          push("`result.append(R[r_idx])`, `r_idx += 1` → result = " + list(st.result) + ".", 10, { pick: "R" });
          if (inv) {
            var add = L.length - st.l;
            st.cross += add;
            push("inversion: R 의 " + R[st.r - 1] + " 가 L 에 남은 " + list(L.slice(st.l)) + " 보다 먼저 나갔다 → L 에 남은 '''" + add + " 개 모두'''가 " + R[st.r - 1] + " 와 역전 쌍. `cross += len(L) − l_idx = " + L.length + " − " + st.l + " = " + add + "` → cross = " + st.cross + ".",
              10, { pick: "R", added: add }, 3);
          }
        }
      }
      var restL = L.slice(st.l), restR = R.slice(st.r);
      st.result = st.result.concat(restL); st.extended = restL.slice();
      push("`result.extend(L[l_idx:len(L)])` → 남은 " + list(restL) + " 를 통째로 붙인다(비교 없이 — 이미 정렬돼 있고 R 의 모든 원소보다 크다). result = " + list(st.result) + ".", 11, {});
      st.result = st.result.concat(restR);
      push("`result.extend(R[r_idx:len(R)])` → R 은 비어 있으니 " + list(restR) + " — 아무것도 안 붙는다.", 12, {});
      st.extended = restL.slice();
      push("`return result` = '''" + list(st.result) + "'''. 비교는 '''" + st.comps + " 회''' — 원소 8 개 merge 에 최대 n − 1 = 7 회, 즉 O(n).", 13, {}, inv ? 3 : null,
        inv ? null : "시험 포인트: 마지막 원소 8 은 비교 없이 extend 로 들어간다. 비교 횟수 ≤ len(L) + len(R) − 1.");
      if (inv) {
        st.total = invL + invR + st.cross;
        push("전체 inversion = 왼쪽 내부 " + invL + " + 오른쪽 내부 " + invR + " + cross " + st.cross + " (= 3 + 3 + 1 + 1) = '''" + st.total + "'''. 재귀가 절반을 정렬해 돌려주므로 cross 쌍을 merge 중 O(n) 에 셀 수 있고, 전체는 mergesort 와 같은 O(n log n).",
          13, {}, 4, "시험 포인트(HW1 5번): 더하는 값은 1 이 아니라 '''len(L) − l_idx''' — L 에 남은 원소 전부가 역전 쌍이다.");
      }

      var vars = [
        { name: "L", group: "입력" }, { name: "R", group: "입력" },
        { name: "l_idx", group: "포인터" }, { name: "r_idx", group: "포인터" },
        { name: "result", group: "결과" }, { name: "comparisons", label: "비교 횟수", group: "결과" },
        { name: "extended", label: "extend 로 붙인 나머지", group: "결과" }
      ];
      if (inv) { vars.push({ name: "cross", label: "cross inversion", group: "inversion" }); vars.push({ name: "total", label: "전체 inversion", group: "inversion" }); }
      var panels = [{ id: "M", title: "merge (L3 p.24)", lang: "c", lines: CODE }];
      if (inv) panels.push({ id: "INV", title: "HW1 5번 추가 줄", lang: "c", lines: INV });
      return { panels: panels, vars: vars, steps: steps };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
