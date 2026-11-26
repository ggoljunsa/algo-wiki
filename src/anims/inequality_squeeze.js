// ============================================================
// inequality_squeeze — L17 p.39–40 마지막 줄: value(f) = cost(이 cut) ≥ min cut ≥ max flow ≥ value(f) 가 접혀서 전부 등호
//   수직선 위에서: min cut 은 5 이하(모든 cut 중 최소), max flow 는 5 이상(모든 flow 중 최대),
//   Lemma 1 (max flow ≤ min cut) 때문에 둘 다 5 로 몰린다. 숫자는 p.39 예제(값 5, cut 5).
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["inequality_squeeze"] = {
  title: "부등식 사슬이 접힌다 — 5 = cost ≥ min cut ≥ max flow ≥ 5 (14초)",
  desc: "L17 p.39–40. 값이 같은 flow 와 cut 을 하나 찾으면 끝나는 이유. min cut 은 그 cut 보다 클 수 없고(≤ 5), max flow 는 그 flow 보다 작을 수 없다(≥ 5). " +
    "그런데 Lemma 1 은 max flow ≤ min cut 이라고 한다. 셋을 같이 만족하는 자리는 5 하나뿐이다. → [[max-flow min-cut theorem]]",
  duration: 14,
  build: function () {
    var D = 14, K = FLOWKIT(D, "iqs"), C = K.C;
    var X0 = 90, U = 60, Y = 230;
    function xv(v) { return X0 + v * U; }
    var s = '<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="부등식 사슬이 등호로 접히는 애니메이션">' + K.defs();
    s += K.captions([
      [0, 2.2, "p.39: Gf 로 찾은 flow 의 값 = 5, 그 Gf 로 그은 cut 의 cost = 5"],
      [2.2, 4.6, "min cut 은 모든 cut 중 가장 싼 것 → 이 cut(5) 보다 비쌀 수 없다: min cut ≤ 5"],
      [4.6, 7, "max flow 는 모든 flow 중 가장 큰 것 → 이 flow(5) 보다 작을 수 없다: max flow ≥ 5"],
      [7, 10, "Lemma 1: max flow ≤ min cut. 그런데 max flow ≥ 5 ≥ min cut 이니 둘 다 5 일 수밖에 없다"],
      [10, D, "사슬의 양 끝이 같은 값(5)이라 가운데도 전부 같다. f 는 max flow, 이 cut 은 min cut"]
    ]);
    // 사슬
    var items = [["value(f)", 110], ["cost(이 cut)", 245], ["min cut", 390], ["max flow", 520], ["value(f)", 650]];
    items.forEach(function (it) { s += K.pill(it[1], 76, it[0], "#fff", "#b9c4d8", 14); });
    var rel = [[177, "="], [318, "≥"], [455, "≥"], [585, "≥"]];
    var why = ["Gf 로 고른 cut", "min 의 정의", "Lemma 1", "max 의 정의"];
    rel.forEach(function (r, i) {
      s += K.seq(r[0], 82, [[0, r[1], i === 0 ? C.green : C.ink], [10.2, "=", C.red]], 20, C.ink, ' font-weight="700"');
      s += K.vis(i === 0 ? 0.5 : i === 1 ? 2.4 : i === 2 ? 7.2 : 4.8, D, K.txt(r[0], 104, why[i], 10.5, C.muted));
    });
    s += K.vis(10.6, D, K.txt(380, 132, "모두 5", 16, C.red, ' font-weight="700"'));
    // 수직선
    s += '<line x1="' + xv(0) + '" y1="' + Y + '" x2="' + xv(10) + '" y2="' + Y + '" stroke="#555" stroke-width="2"' + K.mk("ink") + '/>';
    for (var v = 0; v <= 9; v++) {
      s += '<line x1="' + xv(v) + '" y1="' + (Y - 5) + '" x2="' + xv(v) + '" y2="' + (Y + 5) + '" stroke="#555" stroke-width="1.5"/>' + K.txt(xv(v), Y + 22, v, 12, C.muted);
    }
    // 영역
    s += K.vis(2.4, D, '<rect x="' + xv(0) + '" y="' + (Y - 46) + '" width="' + (5 * U) + '" height="20" rx="4" fill="#efe9f6" stroke="#8a74b0"/>' +
      K.txt(xv(2.5), Y - 32, "min cut 은 여기 어딘가 (≤ 5)", 12, C.pur, ' font-weight="700"'));
    s += K.vis(4.8, D, '<rect x="' + xv(5) + '" y="' + (Y + 34) + '" width="' + (4.6 * U) + '" height="20" rx="4" fill="' + C.blueL + '" stroke="' + C.blue + '"/>' +
      K.txt(xv(7.3), Y + 48, "max flow 는 여기 어딘가 (≥ 5)", 12, C.blue, ' font-weight="700"'));
    // 고정 표시: 5
    s += '<line x1="' + xv(5) + '" y1="' + (Y - 70) + '" x2="' + xv(5) + '" y2="' + (Y + 70) + '" stroke="' + C.green + '" stroke-width="2" stroke-dasharray="4 3"/>';
    s += K.txt(xv(5), Y - 76, "value(f) = cost(이 cut) = 5", 13, C.green, ' font-weight="700"');
    // 움직이는 표시
    var mc = '<g opacity="0"><g><polygon points="' + xv(3) + ',' + (Y - 8) + ' ' + (xv(3) - 7) + ',' + (Y - 22) + ' ' + (xv(3) + 7) + ',' + (Y - 22) + '" fill="' + C.pur + '"/>' +
      K.txt(xv(3), Y - 56, "min cut ?", 12.5, C.pur, ' font-weight="700"') +
      '<animateTransform attributeName="transform" type="translate" from="0 0" to="' + (2 * U) + ' 0" begin="7.6s" dur="2s" fill="freeze"/></g>' + K.show(3.2, D) + '</g>';
    var mf = '<g opacity="0"><g><polygon points="' + xv(7.5) + ',' + (Y + 8) + ' ' + (xv(7.5) - 7) + ',' + (Y + 22) + ' ' + (xv(7.5) + 7) + ',' + (Y + 22) + '" fill="' + C.blue + '"/>' +
      K.txt(xv(7.5), Y + 74, "max flow ?", 12.5, C.blue, ' font-weight="700"') +
      '<animateTransform attributeName="transform" type="translate" from="0 0" to="' + (-2.5 * U) + ' 0" begin="7.6s" dur="2s" fill="freeze"/></g>' + K.show(5.6, D) + '</g>';
    s += mc + mf;
    s += K.vis(7.2, 9.6, K.txt(xv(5), Y + 100, "max flow ≤ min cut 이려면 →  ←", 13, C.red, ' font-weight="700"'));
    s += K.vis(9.6, D, '<circle cx="' + xv(5) + '" cy="' + Y + '" r="13" fill="none" stroke="' + C.red + '" stroke-width="3"/>' +
      K.txt(xv(5), Y + 100, "max flow = min cut = 5", 15, C.red, ' font-weight="700"'));
    s += K.txt(380, 350, "\"But this flow value ≤ max flow value, so they must be equal!\" (p.40)", 12.5, C.muted);
    return s + '</svg>';
  }
};
