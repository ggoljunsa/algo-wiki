// ============================================================
// toad_three_algorithms — HW2 3번: toad 세 알고리즘 (Las Vegas vs Monte Carlo)
// 시간축(초): 0 세 레인(toad 8 마리, tricky = 0·3·6) → 1.5 Alg 1: 화살 3 ✗, 6 ✗, 4 ✓ return, 기대 1/p < 2 · worst ∞
//   → 5 Alg 2: 1/100 … 100/100 전부 ✗ → toad 0 을 확인 없이 return → 틀림 → Monte Carlo
//   → 9 Alg 3: shuffle O(n) 막대 + 섞이기 → 앞에서부터 스캔, 첫 초록에서 return → Θ(n)
//   → 12.5 요점 "틀린 답을 낼 수 있나?" + 3행 표 → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["toad_three_algorithms"] = {
  title: "toad 세 알고리즘 — 틀릴 수 있으면 Monte Carlo, 아니면 Las Vegas (14초)",
  desc: "HW2 3번. trustworthy > n/2 이라 무작위 한 마리가 맞을 확률 p > 1/2. Alg 1 은 [[기하분포]]로 기대 Θ(1)·worst ∞, Alg 2 는 100 번 후 확인 안 된 toad 0 을 반환해 '''틀릴 수 있다''', Alg 3 은 셔플 O(n) 이 지배. [[Las Vegas와 Monte Carlo]] · [[HW2 복기]]",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", grey: "#eeeeee", ink: "#222" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function kf(pts) {
      var ks = [], vs = [];
      if (pts[0][0] > 0) { ks.push(0); vs.push(pts[0][1]); }
      pts.forEach(function (p) { ks.push(r4(p[0] / D)); vs.push(p[1]); });
      if (pts[pts.length - 1][0] < D) { ks.push(1); vs.push(pts[pts.length - 1][1]); }
      return 'values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function anim(attr, pts) { return '<animate attributeName="' + attr + '" ' + kf(pts) + '/>'; }
    function move(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kf(pts) + '/>'; }

    var TRUST = { 1: true, 2: true, 4: true, 5: true, 7: true };
    var LANES = [90, 172, 254];
    function tx(k) { return 140 + 38 * k; }
    // 판정 시각에 회색 → 초록/빨강으로 바뀌는 toad 원
    function toad(k, y, tReveal) {
      var t = !!TRUST[k], fl = t ? C.greenL : C.redL, st = t ? C.green : C.red;
      var s = '<circle cx="' + tx(k) + '" cy="' + y + '" r="14" fill="' + C.grey + '" stroke="' + C.muted + '" stroke-width="1.5">';
      if (tReveal !== null) s += anim("fill", [[tReveal, C.grey], [tReveal + 0.1, fl]]) + anim("stroke", [[tReveal, C.muted], [tReveal + 0.1, st]]);
      s += '</circle>';
      s += '<text x="' + tx(k) + '" y="' + (y + 5) + '" font-size="13" text-anchor="middle" font-weight="700" fill="' + C.muted + '">' + k +
        (tReveal !== null ? anim("fill", [[tReveal, C.muted], [tReveal + 0.1, st]]) : "") + '</text>';
      return s;
    }
    function mark(k, y, ok, label) {
      return txt(tx(k), y + 32, (ok ? "✓" : "✗") + (label ? " " + label : ""), 12, ok ? C.green : C.red, ' font-weight="700"');
    }
    function dart(y, color) {
      return '<path d="M -8 ' + (y - 36) + ' L 8 ' + (y - 36) + ' L 0 ' + (y - 21) + ' Z" fill="' + (color || C.or) + '"/>';
    }

    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="toad 세 알고리즘 Las Vegas와 Monte Carlo 비교 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "n 마리 중 trustworthy &gt; n/2 — trustworthy 하나를 찾아라. expert 판정 Θ(1)"],
      [1.5, 5, "Alg 1: 잡을 때까지 무작위로 뽑는다 — 확인된 toad 만 반환 (Las Vegas)"],
      [5, 9, "Alg 2: 100 번만 뽑고, 다 실패하면 toad 0 을 그냥 반환 (Monte Carlo)"],
      [9, 12.5, "Alg 3: 무작위 순서로 섞고(O(n)) 앞에서부터 차례로 묻는다 (Las Vegas)"],
      [12.5, D, "판정 기준은 하나 — 틀린 답을 낼 수 있는가?"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, C.ink, ' font-weight="700"')); });

    // ---- 레인 라벨 + 구분선 ----
    var names = [["Alg 1", "while true"], ["Alg 2", "for 100 iter."], ["Alg 3", "shuffle + scan"]];
    LANES.forEach(function (y, li) {
      s += '<rect x="6" y="' + (y - 38) + '' + '" width="748" height="76" rx="8" fill="' + (li % 2 ? "#fafafa" : "#f5f3f8") + '" stroke="#e2dde9"/>';
      s += txt(14, y - 4, names[li][0], 14, C.pur, ' text-anchor="start" font-weight="700"');
      s += txt(14, y + 13, names[li][1], 11, C.muted, ' text-anchor="start"');
    });
    s += vis(0, 1.5, txt(590, LANES[0] + 4, "tricky 인지는 expert 에게 물어야 안다", 12, C.muted) +
      txt(590, LANES[1] + 4, "회색 = 아직 확인 안 함", 12, C.muted));

    // ---- Alg 1 (1.5–5): 3 ✗, 6 ✗, 4 ✓ ----
    var y1 = LANES[0];
    var rev1 = { 3: 2.3, 6: 3.1, 4: 3.9 };
    for (var k = 0; k < 8; k++) s += toad(k, y1, rev1.hasOwnProperty(k) ? rev1[k] : null);
    s += vis(2.3, D, mark(3, y1, false)) + vis(3.1, D, mark(6, y1, false)) + vis(3.9, D, mark(4, y1, true, "return"));
    s += vis(1.7, 4.6, '<g>' + move([[1.7, tx(3) + ",-12"], [2.1, tx(3) + ",0"], [2.6, tx(3) + ",0"], [2.75, tx(6) + ",-12"], [2.95, tx(6) + ",0"], [3.4, tx(6) + ",0"], [3.55, tx(4) + ",-12"], [3.75, tx(4) + ",0"]]) + dart(y1) + '</g>');
    s += vis(2.4, 12.5, txt(440, y1 - 12, "성공 확률 p &gt; 1/2 → 기대 시도 1/p &lt; 2 → Θ(1)", 12, C.green, ' text-anchor="start" font-weight="700"'));
    s += vis(4.2, 12.5, '<line x1="440" y1="' + (y1 + 8) + '" x2="500" y2="' + (y1 + 8) + '" stroke="' + C.red + '" stroke-width="2" stroke-dasharray="2 5" opacity="0.6"/>' +
      txt(506, y1 + 13, "…? 운이 계속 나쁘면 끝없음 → worst ∞", 12, C.red, ' text-anchor="start" font-weight="700"'));

    // ---- Alg 2 (5–9): 3,6,3,6… 전부 ✗ → toad 0 을 확인 없이 return ----
    var y2 = LANES[1];
    var rev2 = { 3: 5.45, 6: 5.8, 0: 8.4 };
    for (k = 0; k < 8; k++) s += toad(k, y2, rev2.hasOwnProperty(k) ? rev2[k] : null);
    s += vis(5.45, D, mark(3, y2, false)) + vis(5.8, D, mark(6, y2, false));
    var hop = [[5.2, tx(3) + ",0"]], hx = [3, 6], ht = 5.2;
    for (var h = 1; h <= 10; h++) { ht += h <= 2 ? 0.35 : 0.18; hop.push([ht - 0.05, tx(hx[(h - 1) % 2]) + ",0"]); hop.push([ht, tx(hx[h % 2]) + ",0"]); }
    hop.push([7.35, tx(hx[0]) + ",0"]); hop.push([7.55, tx(0) + ",0"]);
    s += '<g opacity="0"><g>' + move(hop) + '<path d="M -8 ' + (y2 - 36) + ' L 8 ' + (y2 - 36) + ' L 0 ' + (y2 - 21) + ' Z" fill="' + C.or + '">' +
      anim("fill", [[7.4, C.or], [7.55, C.red]]) + '</path></g>' + show(5.2, 9.2) + '</g>';
    var cnt = [[5.2, "1/100"], [5.55, "2/100"], [5.9, "3/100"], [6.2, "10/100"], [6.5, "30/100"], [6.8, "60/100"], [7.1, "100/100"]];
    cnt.forEach(function (c, i) {
      var end = i + 1 < cnt.length ? cnt[i + 1][0] : 12.5;
      s += vis(c[0], end, txt(14, y2 + 30, "반복 " + c[1] + (i === cnt.length - 1 ? " 끝" : ""), 11, i === cnt.length - 1 ? C.red : C.or, ' text-anchor="start" font-weight="700"'));
    });
    s += vis(6.2, 7.5, txt(440, y2 + 4, "✗ ✗ ✗ … 100 번 전부 tricky (적이 주사위 고정)", 12, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(7.6, 8.4, txt(tx(0), y2 - 20, "?", 22, C.red, ' font-weight="700"'));
    s += vis(8.4, D, txt(tx(0) + 2, y2 + 32, "✗ return", 12, C.red, ' font-weight="700"'));
    s += vis(7.6, 12.5, txt(440, y2 - 14, "return toad 0 — 확인 안 함", 12, C.red, ' text-anchor="start" font-weight="700"') +
      txt(440, y2 + 4, "→ 틀릴 수 있음 → Monte Carlo", 12, C.red, ' text-anchor="start" font-weight="700"'));
    s += vis(8.4, 12.5, txt(440, y2 + 22, "P(틀림) ≤ (1−p)^100 &lt; (1/2)^100 · 시간은 항상 Θ(1)", 12, C.pur, ' text-anchor="start"'));

    // ---- Alg 3 (9–12.5): 섞기(O(n)) → 스캔 ----
    var y3 = LANES[2];
    var perm = [3, 1, 6, 2, 0, 4, 5, 7], pos = {};
    perm.forEach(function (t, p) { pos[t] = p; });
    var rev3 = { 3: 10.7, 1: 11.3 };
    for (k = 0; k < 8; k++) {
      var dx = tx(pos[k]) - tx(k);
      s += '<g>' + move([[9.3, "0,0"], [10.2, dx + ",0"]]) + toad(k, y3, rev3.hasOwnProperty(k) ? rev3[k] : null) +
        (k === 3 ? vis(10.7, D, mark(3, y3, false)) : "") + (k === 1 ? vis(11.3, D, mark(1, y3, true, "return")) : "") + '</g>';
    }
    // shuffle O(n) 막대 (레인 아래쪽, toad 줄 밑을 왼쪽→오른쪽으로 채움)
    s += vis(9.2, 10.6, '<rect x="' + (tx(0) - 14) + '" y="' + (y3 + 22) + '" width="294" height="8" rx="3" fill="#fff" stroke="' + C.pur + '"/>' +
      '<rect x="' + (tx(0) - 14) + '" y="' + (y3 + 22) + '" width="0" height="8" rx="3" fill="' + C.pur + '">' + anim("width", [[9.3, 0], [10.2, 294]]) + '</rect>' +
      txt(tx(0) + 300, y3 + 30, "shuffle O(n)", 11, C.pur, ' text-anchor="start" font-weight="700"'));
    s += vis(10.4, 12.5, '<g>' + move([[10.4, tx(0) + ",0"], [10.9, tx(0) + ",0"], [11.05, tx(1) + ",0"]]) + dart(y3) + '</g>');
    s += vis(10.1, 12.5, txt(440, y3 - 12, "shuffle O(n) 이 지배 → expected Θ(n), worst Θ(n)", 12, C.pur, ' text-anchor="start" font-weight="700"'));
    s += vis(11.4, 12.5, txt(440, y3 + 8, "스캔은 기대 &lt; 2 번이지만 셔플은 항상 n", 12, C.muted, ' text-anchor="start"') +
      txt(440, y3 + 26, "tricky 가 전부 앞이어도 n 안에 찾음 → 확률 1", 12, C.green, ' text-anchor="start"'));

    // ---- 12.5–14: 표 (오른쪽 영역) + 요점 ----
    var cols = [["Alg", 34], ["LV / MC", 92], ["expected", 62], ["worst", 46], ["P(truthful)", 84]];
    var rows = [["1", "Las Vegas", "Θ(1)", "∞", "1"], ["2", "Monte Carlo", "Θ(1)", "Θ(1)", "≥ 1−(1/2)^100"], ["3", "Las Vegas", "Θ(n)", "Θ(n)", "1"]];
    var tb = "", x0 = 436;
    tb += '<rect x="' + (x0 - 6) + '" y="54" width="' + 330 + '" height="236" rx="8" fill="#fff" stroke="' + C.pur + '" stroke-width="1.5"/>';
    var xx = x0;
    cols.forEach(function (c) { tb += txt(xx + c[1] / 2, 72, c[0], 12, C.pur, ' font-weight="700"'); xx += c[1]; });
    tb += '<line x1="' + x0 + '" y1="80" x2="' + (x0 + 318) + '" y2="80" stroke="' + C.pur + '"/>';
    rows.forEach(function (r, ri) {
      var y = LANES[ri] + 5;
      xx = x0;
      r.forEach(function (v, ci) {
        var col = ci === 1 ? (v === "Las Vegas" ? C.green : C.red) : (ci === 3 && v === "∞" ? C.red : C.ink);
        tb += txt(xx + cols[ci][1] / 2, y, v, ci === 4 && ri === 1 ? 11 : 13, col, ' font-weight="700"');
        xx += cols[ci][1];
      });
    });
    s += vis(12.5, D, tb);

    s += vis(0, 12.5, txt(380, 330, "틀린 답을 낼 수 있나? 있으면 Monte Carlo, 없으면 Las Vegas", 13, C.muted, ' font-weight="700"'));
    s += vis(12.5, D, '<rect x="130" y="306" width="500" height="36" rx="8" fill="' + C.orL + '" stroke="' + C.or + '" stroke-width="2"/>' +
      txt(380, 330, "틀린 답을 낼 수 있나? 있으면 Monte Carlo, 없으면 Las Vegas", 15, C.ink, ' font-weight="700"'));
    s += '</svg>';
    return s;
  }
};
