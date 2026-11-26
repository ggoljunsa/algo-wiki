// ============================================================
// bad_path_zigzag — L17 p.55–63: 경로를 아무렇게나 고르면 가운데 1 짜리 간선을 왔다 갔다 2C 번, BFS 면 2 번
//   그래프: s→a C, s→b C, b→a 1, a→t C, b→t C. max flow 2C.
//   왼쪽(운 나쁜 선택): s→b→a→t, s→a⇢b→t 를 번갈아 → 한 번에 1 씩. 6 번 보여 주고 "…2C 번".
//   오른쪽(BFS = Edmonds-Karp): 간선 2 개짜리 s→a→t, s→b→t → C 씩 두 번에 끝.
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["bad_path_zigzag"] = {
  title: "경로를 아무렇게나 고르면 — 가운데 간선을 2C 번 왔다 갔다 (16초)",
  desc: "L17 p.55–63. 왼쪽은 운 나쁘게 가운데 1 짜리 간선을 지나는 경로만 고르는 경우다. 한 번에 1 씩밖에 못 보내서 경로를 2C 번 찾는다. " +
    "오른쪽은 BFS 로 간선 수가 가장 적은 경로를 고르는 [[Edmonds-Karp]] 다. 두 번이면 끝난다. 수행 시간이 capacity C 에 매달리느냐 아니냐의 차이다.",
  duration: 16,
  build: function () {
    var D = 16, K = FLOWKIT(D, "bpz"), C = K.C;
    var L = { s: [52, 196], a: [176, 100], b: [176, 292], t: [300, 196] };
    var R = { s: [452, 196], a: [576, 100], b: [576, 292], t: [700, 196] };
    var s = '<svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="경로 선택이 나쁠 때와 BFS 비교 애니메이션">' + K.defs();
    s += K.captions([
      [0, 1, "C 는 아주 큰 수. max flow 는 2C 다"],
      [1, 2.6, "왼쪽: s→b→a→t 를 고르면 가운데 1 때문에 1 만 보낸다"],
      [2.6, 4.2, "왼쪽: 다음엔 s→a⇢b→t. 가운데를 거꾸로 타서 또 1. b→a 가 Gf 에 다시 생긴다"],
      [4.2, 10.6, "이걸 되풀이하면 한 번에 1 씩... 오른쪽 BFS 는 벌써 끝났다"],
      [10.6, D, "왼쪽은 경로 2C 번 (C = 10⁶ 이면 200만 번). 오른쪽은 2 번. 시간이 capacity 와 무관"]
    ]);
    s += K.txt(176, 50, "아무 경로나 (운 나쁜 경우)", 13.5, C.red, ' font-weight="700"') + K.txt(576, 50, "BFS 경로 = Edmonds-Karp", 13.5, C.green, ' font-weight="700"');
    s += '<line x1="380" y1="40" x2="380" y2="330" stroke="#d5dbe6" stroke-width="1.5" stroke-dasharray="4 4"/>';
    // 왼쪽: 6 라운드
    var R0 = 1, RS = 1.6, NR = 6;
    var fl = { sa: 0, sb: 0, ba: 0, at: 0, bt: 0 };
    var seqs = { sa: [[0, "0/C"]], sb: [[0, "0/C"]], ba: [[0, "0/1"]], at: [[0, "0/C"]], bt: [[0, "0/C"]] };
    for (var k = 1; k <= NR; k++) {
      var t = R0 + RS * (k - 1), tu = t + 0.8, odd = k % 2 === 1;
      if (odd) {
        s += K.vis(t, t + RS, K.halo(L, "s", "b", "#f3c623", 14) + K.halo(L, "b", "a", "#f3c623", 14) + K.halo(L, "a", "t", "#f3c623", 14));
        fl.sb++; fl.ba++; fl.at++;
        seqs.sb.push([tu, fl.sb + "/C"]); seqs.ba.push([tu, fl.ba + "/1"]); seqs.at.push([tu, fl.at + "/C"]);
      } else {
        s += K.vis(t, t + RS, K.halo(L, "s", "a", "#f3c623", 14) + K.halo(L, "a", "b", "#f3c623", 14, 0) + K.halo(L, "b", "t", "#f3c623", 14));
        fl.sa++; fl.ba--; fl.bt++;
        seqs.sa.push([tu, fl.sa + "/C"]); seqs.ba.push([tu, fl.ba + "/1"]); seqs.bt.push([tu, fl.bt + "/C"]);
      }
    }
    var LE = [["s", "a", "sa", 0.45, -16], ["s", "b", "sb", 0.45, 16], ["b", "a", "ba", 0.5, -26], ["a", "t", "at", 0.55, -16], ["b", "t", "bt", 0.55, 16]];
    LE.forEach(function (e) {
      s += K.edge(L, e[0], e[1], { color: "blue", w: e[2] === "ba" ? 2 : 3.5 });
      var p = K.at(L, e[0], e[1], e[3], e[4]);
      s += K.pillSeq(p[0], p[1], seqs[e[2]].map(function (q) { return [q[0], q[1], e[2] === "ba" ? "#fdeec2" : "#fff", e[2] === "ba" ? C.or : "#b9c4d8"]; }), 12.5, 40);
    });
    var cnt = [[0, "경로 0 번, 값 0"]];
    for (var j = 1; j <= NR; j++) cnt.push([R0 + RS * (j - 1) + 0.8, "경로 " + j + " 번, 값 " + j]);
    cnt.push([10.6, "… 경로 2C 번, 값 2C"]);
    s += K.seq(176, 352, cnt.map(function (q, i) { return [q[0], q[1], i === cnt.length - 1 ? C.red : C.ink]; }), 15, C.ink, ' font-weight="700"');
    s += K.vis(2.6, 10.6, K.seq(176, 376, [[2.6, "b→a 가 Gf 에서 사라졌다 다시 생겼다 반복"]], 12, C.muted));
    // 오른쪽: BFS
    s += K.vis(1, 2.6, K.halo(R, "s", "a", "#f3c623", 14) + K.halo(R, "a", "t", "#f3c623", 14));
    s += K.vis(2.6, 4.2, K.halo(R, "s", "b", "#f3c623", 14) + K.halo(R, "b", "t", "#f3c623", 14));
    var RE = [["s", "a", [[0, "0/C"], [1.8, "C/C"]], 0.45, -16], ["s", "b", [[0, "0/C"], [3.4, "C/C"]], 0.45, 16], ["b", "a", [[0, "0/1"]], 0.5, -26],
      ["a", "t", [[0, "0/C"], [1.8, "C/C"]], 0.55, -16], ["b", "t", [[0, "0/C"], [3.4, "C/C"]], 0.55, 16]];
    RE.forEach(function (e) {
      s += K.edge(R, e[0], e[1], { color: "blue", w: e[0] === "b" && e[1] === "a" ? 2 : 3.5 });
      var p = K.at(R, e[0], e[1], e[3], e[4]);
      s += K.pillSeq(p[0], p[1], e[2].map(function (q) { var full = q[1] === "C/C"; return [q[0], q[1], full ? C.orL : "#fff", full ? C.or : "#b9c4d8"]; }), 12.5, 40);
    });
    s += K.seq(576, 352, [[0, "경로 0 번"], [1.8, "경로 1 번, 값 C"], [3.4, "경로 2 번, 값 2C  끝 ✓", C.green]], 15, C.ink, ' font-weight="700"');
    s += K.vis(4.2, D, K.txt(576, 376, "BFS 는 간선 3 개짜리 s→b→a→t 를 고르지 않는다", 12, C.muted));
    ["s", "a", "b", "t"].forEach(function (k) {
      var st = k === "s" ? "src" : k === "t" ? "sink" : "t";
      s += K.nodeSt(L, k, k, [[0, st]], 17) + K.nodeSt(R, k, k, [[0, st]], 17);
    });
    return s + '</svg>';
  }
};
