// ============================================================
// master_struggle — L3 p.92–98 The Eternal Struggle (master method 세 케이스)
// 줄다리기: 왼쪽 = Branching (문제 개수 ×a), 오른쪽 = 문제가 작아짐 (일 ÷bᵈ). 아래 막대 = 레벨 k 의 총 일 aᵏ·(n/bᵏ)ᵈ (케이스마다 최대 280px 로 정규화)
// 시간축(초): 0 소개 → 1.5 ① 4T(n/2)+n (a &gt; bᵈ, bushy) → 5.3 ② 2T(n/2)+n (a = bᵈ) → 9.1 ③ T(n/2)+n (a &lt; bᵈ, tall and skinny) → 14
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["master_struggle"] = {
  title: "The Eternal Struggle — master method 세 케이스 줄다리기",
  desc: "[[master method]] T(n) = a·T(n/b) + O(nᵈ): 가지치기(a)가 이기면 일이 바닥(리프)에 몰려 O(n^log_b a) — bushy tree, 비기면 레벨마다 같아 O(nᵈ log n), 일의 크기(bᵈ)가 이기면 꼭대기에 몰려 O(nᵈ) — tall and skinny tree",
  duration: 14,
  build: function () {
    var D = 14;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", muted: "#777" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || "#222") + '"' + (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="0">' + inner + show(from, to) + '</g>'; }
    function kv(pts) {
      var p = pts.slice();
      if (p[0][0] > 0) p.unshift([0, p[0][1]]);
      if (p[p.length - 1][0] < D) p.push([D, p[p.length - 1][1]]);
      return 'values="' + p.map(function (q) { return q[1]; }).join(";") + '" keyTimes="' + p.map(function (q) { return r4(q[0] / D); }).join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function an(attr, pts) { return '<animate attributeName="' + attr + '" ' + kv(pts) + '/>'; }
    function mv(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kv(pts) + '/>'; }

    var T0 = [1.5, 5.3, 9.1];                        // 케이스 시작 시각
    var CASES = [
      { a: 4, rec: "T(n) = 4·T(n/2) + n", abd: "a = 4, b = 2, d = 1", cmp: "a = 4  &gt;  bᵈ = 2", win: "Branching 승 — bushy tree",
        where: "Most work at the bottom of the tree!", res: "T(n) = O(n<tspan baseline-shift=\"super\" font-size=\"75%\">log₂4</tspan>) = O(n²)", flag: -90, work: ["n", "2n", "4n", "8n"] },
      { a: 2, rec: "T(n) = 2·T(n/2) + n", abd: "a = 2, b = 2, d = 1", cmp: "a = 2  =  bᵈ = 2", win: "TIE! — just right",
        where: "레벨마다 같은 양의 일", res: "T(n) = O(nᵈ log n) = O(n log n)", flag: 0, work: ["n", "n", "n", "n"] },
      { a: 1, rec: "T(n) = T(n/2) + n", abd: "a = 1, b = 2, d = 1", cmp: "a = 1  &lt;  bᵈ = 2", win: "일의 크기 승 — tall and skinny tree",
        where: "Most work at the top of the tree!", res: "T(n) = O(nᵈ) = O(n)", flag: 90, work: ["n", "n/2", "n/4", "n/8"] }
    ];

    var s = '<svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="master method eternal struggle 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 1.5, "The Eternal Struggle — T(n) = a·T(n/b) + O(nᵈ) 에서 누가 이기는가?"],
      [1.5, 5.3, "① a &gt; bᵈ: Branching causes the number of problems to explode!"],
      [5.3, 9.1, "② a = bᵈ: The branching just balances out the amount of work."],
      [9.1, 14, "③ a &lt; bᵈ: The problems lower in the tree are smaller!"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 26, c[2], 14, "#222", ' font-weight="700"')); });

    // ---- 줄다리기 ----
    s += '<line x1="190" y1="70" x2="570" y2="70" stroke="#a07b4f" stroke-width="5" stroke-linecap="round"/>';
    s += '<line x1="380" y1="56" x2="380" y2="84" stroke="#bbb" stroke-width="2" stroke-dasharray="3 3"/>';
    s += txt(180, 66, "Branching", 13, C.pur, ' text-anchor="end" font-weight="700"') + txt(180, 82, "문제 개수 ×a", 11, C.pur, ' text-anchor="end"');
    s += txt(580, 66, "문제가 작아짐", 13, C.blue, ' text-anchor="start" font-weight="700"') + txt(580, 82, "레벨당 일 ÷bᵈ", 11, C.blue, ' text-anchor="start"');
    var fl = [[0, "0,0"]];
    CASES.forEach(function (c, i) { fl.push([T0[i] + 0.3, (i ? CASES[i - 1].flag : 0) + ",0"]); fl.push([T0[i] + 1.0, c.flag + ",0"]); });
    s += '<g>' + mv(fl) + '<polygon points="380,60 372,48 388,48" fill="' + C.red + '"/><circle cx="380" cy="70" r="7" fill="' + C.red + '"/></g>';
    var winLab = ["WINNER: Branching ←", "TIE!", "→ WINNER: 일의 크기"];
    winLab.forEach(function (w, i) { s += vis(T0[i] + 1.0, i < 2 ? T0[i + 1] : D, txt(380, 104, w, 13, C.red, ' font-weight="700"')); });

    // ---- 왼쪽 설명 카드 ----
    s += '<rect x="24" y="124" width="336" height="190" rx="10" fill="#fafafa" stroke="#ccc" stroke-width="1.5"/>';
    CASES.forEach(function (c, i) {
      var to = i < 2 ? T0[i + 1] : D;
      s += vis(T0[i], to,
        txt(40, 152, (i + 1) + ". " + c.rec, 15, C.pur, ' text-anchor="start" font-weight="700"') +
        txt(40, 178, c.abd, 12.5, "#444", ' text-anchor="start"') +
        txt(40, 204, c.cmp, 14, C.red, ' text-anchor="start" font-weight="700"') +
        txt(40, 232, c.win, 13, "#222", ' text-anchor="start" font-weight="700"') +
        txt(40, 256, c.where, 12, C.or, ' text-anchor="start" font-weight="700"') +
        '<rect x="34" y="272" width="316" height="30" rx="6" fill="' + C.greenL + '" stroke="' + C.green + '"/>' +
        txt(44, 292, c.res, 13.5, C.green, ' text-anchor="start" font-weight="700"'));
    });
    s += vis(0, 1.5, txt(192, 200, "a : the number of subproblems", 12, "#444") + txt(192, 222, "b : the factor by which the input size shrinks", 11.5, "#444") + txt(192, 244, "d : nᵈ work to create & combine", 12, "#444").replace("&", "&amp;"));

    // ---- 레벨별 일 막대 (오른쪽) ----
    s += txt(580, 136, "레벨 k 의 일 = aᵏ · (n/2ᵏ)ᵈ", 12, C.muted);
    var CX = 590, MAXW = 260;
    for (var k = 0; k < 4; k++) {
      var y = 150 + k * 40;
      var wp = [[0, 120]], fp = [[0, C.purL]];
      CASES.forEach(function (c, i) {
        var w = [], mx = 0;
        for (var j = 0; j < 4; j++) { w[j] = Math.pow(c.a / 2, j); mx = Math.max(mx, w[j]); }
        var ww = r4(MAXW * w[k] / mx);
        wp.push([T0[i] + 0.3, wp[wp.length - 1][1]]); wp.push([T0[i] + 1.0, ww]);
        var hot = w[k] === mx;
        fp.push([T0[i] + 1.0, fp[fp.length - 1][1]]); fp.push([T0[i] + 1.05, hot ? C.orL : C.purL]);
      });
      var xp = wp.map(function (q) { return [q[0], r4(CX - q[1] / 2)]; });
      var sp = fp.map(function (q) { return [q[0], q[1] === C.orL ? C.or : C.pur]; });
      s += '<rect y="' + y + '" height="28" rx="5" stroke-width="2" x="' + (CX - 60) + '" width="120" fill="' + C.purL + '" stroke="' + C.pur + '">' +
        an("width", wp) + an("x", xp) + an("fill", fp) + an("stroke", sp) + '</rect>';
      s += txt(446, y + 19, "레벨 " + k, 11.5, C.muted, ' text-anchor="end"');
      CASES.forEach(function (c, i) { s += vis(T0[i] + 1.0, i < 2 ? T0[i + 1] : D, txt(CX, y + 19, c.work[k], 13, "#222", ' font-weight="700"')); });
    }
    s += txt(590, 322, "(주황 = 일이 가장 많이 몰린 레벨)", 11, C.muted);

    // ---- 요점 ----
    s += txt(380, 352, "세 케이스 = top heavy / balanced / bottom heavy — a 와 bᵈ 를 비교해 일이 트리의 어디에 몰리는지 본다", 12.5, C.muted);
    s += '</svg>';
    return s;
  }
};
