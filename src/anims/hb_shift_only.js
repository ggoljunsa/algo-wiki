// ============================================================
// hb_shift_only — HW2 5번: h_b(x) = (85x + b) mod 13 은 b 를 바꿔도 평행이동뿐 → universal 아님
// 시간축(초): 0 b=0 배치 (7x mod 13) → 2 b 다이얼 0→1→2→3, 모든 키가 같이 한 칸씩 (간격 7(x−y) 불변)
//   → 6 0,13,26 / 1,14,27 묶음이 빨갛게: P[충돌] = 1 > 1/13 → 9 대비: h_{a,b} 는 a 가 간격을 흩음 → 12
// ============================================================
window.ANIMS = window.ANIMS || {};
ANIMS["hb_shift_only"] = {
  title: "h_b(x) = (85x + b) mod 13 — b 는 평행이동만 한다 (12초)",
  desc: "HW2 5번. 85 ≡ 7 이므로 h_b(x) = (7x + b) mod 13. b 를 바꾸면 '''모든 키가 똑같이 한 칸씩''' 움직일 뿐이라 두 키의 간격 7(x−y) 는 그대로 → " +
    "x ≡ y (mod 13) 인 쌍은 항상 충돌(P = 1) → [[universal hash family]] 아님. 무작위가 차에 곱해지는 [[h_{a,b}]] 와 비교. [[HW2 복기]]",
  duration: 12,
  build: function () {
    var D = 12;
    var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#dff3e4", or: "#e09a40", orL: "#fdeec2",
      pur: "#3b2f4a", purL: "#efe9f6", red: "#d6465f", redL: "#fbe3e7", muted: "#777", ink: "#222" };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    function txt(x, y, s, size, fill, extra) {
      return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' +
        (/text-anchor/.test(extra || "") ? "" : ' text-anchor="middle"') + (extra || "") + '>' + s + '</text>';
    }
    function show(from, to) {
      var f = 0.12 / D, a = r4(from / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (from <= 0 && to >= D) return "";
      if (from <= 0) {
        var c0 = r4(to / D - f), d0 = r4(to / D);
        return '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + c0 + ';' + d0 + ';1" dur="' + D + 's" fill="freeze"/>';
      }
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    }
    function vis(from, to, inner) { return '<g opacity="' + (from <= 0 ? 1 : 0) + '">' + inner + show(from, to) + '</g>'; }
    function kf(pts) {
      var ks = [], vs = [];
      if (pts[0][0] > 0) { ks.push(0); vs.push(pts[0][1]); }
      pts.forEach(function (p) { ks.push(r4(p[0] / D)); vs.push(p[1]); });
      if (pts[pts.length - 1][0] < D) { ks.push(1); vs.push(pts[pts.length - 1][1]); }
      return 'values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"';
    }
    function anim(attr, pts) { return '<animate attributeName="' + attr + '" ' + kf(pts) + '/>'; }
    function move(pts) { return '<animateTransform attributeName="transform" type="translate" ' + kf(pts) + '/>'; }

    var s = '<svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="h_b(x) = (85x + b) mod 13 에서 b 가 평행이동만 하는 애니메이션">';

    // ---- 단계 자막 ----
    var caps = [
      [0, 2, "h_b(x) = (85x + b) mod 13 = (7x + b) mod 13 — b 는 무작위, 85 는 고정"],
      [2, 6, "b 를 올리면 모든 키가 똑같이 한 칸씩 — 평행이동"],
      [6, 9, "0, 13, 26 은 b 가 무엇이든 같은 칸 → P[충돌] = 1 &gt; 1/13 → universal 아님"],
      [9, D, "슬라이드의 h_{a,b}: a 도 무작위 → 간격 a(x−y) 가 흩어짐 → 충돌 ≤ 1/n"]
    ];
    caps.forEach(function (c) { s += vis(c[0], c[1], txt(380, 28, c[2], 14, C.ink, ' font-weight="700"')); });

    // ================= 본 장면 (0–9s) =================
    var SX0 = 68, SW = 48, SY = 92, SH = 104;
    function cx(slot) { return SX0 + slot * SW + SW / 2; }
    var main = "";
    for (var i = 0; i < 13; i++) {
      main += '<rect x="' + (SX0 + i * SW + 2) + '" y="' + SY + '" width="' + (SW - 4) + '" height="' + SH + '" rx="5" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="1.4"/>';
      main += txt(cx(i), SY + SH + 17, i, 12, C.pur, ' font-weight="700"');
    }
    main += txt(SX0 - 14, SY + SH + 17, "칸", 11, C.pur, ' text-anchor="end"');
    main += vis(0, 2.6, txt(SX0 - 14, 56, "b = 0 일 때 칸 = 7x mod 13", 11, C.muted, ' text-anchor="start"'));
    main += vis(2.6, 9, txt(SX0 - 14, 56, "칸 = (7x + b) mod 13", 11, C.muted, ' text-anchor="start"'));

    // b 다이얼 (오른쪽)
    var DX = 724, DY = 144, DR = 24;
    main += '<circle cx="' + DX + '" cy="' + DY + '" r="' + DR + '" fill="' + C.orL + '" stroke="' + C.or + '" stroke-width="2"/>';
    for (var k = 0; k < 13; k++) {
      var ang = -Math.PI / 2 + 2 * Math.PI * k / 13;
      main += '<circle cx="' + (DX + (DR - 5) * Math.cos(ang)).toFixed(1) + '" cy="' + (DY + (DR - 5) * Math.sin(ang)).toFixed(1) + '" r="1.6" fill="' + C.or + '"/>';
    }
    var step = 360 / 13;
    main += '<line x1="' + DX + '" y1="' + DY + '" x2="' + DX + '" y2="' + (DY - DR + 4) + '" stroke="' + C.red + '" stroke-width="2.5" stroke-linecap="round">' +
      '<animateTransform attributeName="transform" type="rotate" ' +
      kf([[2.6, "0 " + DX + " " + DY], [3.0, r4(step) + " " + DX + " " + DY], [3.6, r4(step) + " " + DX + " " + DY], [4.0, r4(2 * step) + " " + DX + " " + DY],
        [4.6, r4(2 * step) + " " + DX + " " + DY], [5.0, r4(3 * step) + " " + DX + " " + DY]]) + '/></line>';
    main += '<circle cx="' + DX + '" cy="' + DY + '" r="3" fill="' + C.red + '"/>';
    var bvals = [[0, 2.8, 0], [2.8, 3.8, 1], [3.8, 4.8, 2], [4.8, 9, 3]];
    bvals.forEach(function (bv) { main += vis(bv[0], bv[1], txt(DX, DY + DR + 18, "b = " + bv[2], 13, C.or, ' font-weight="700"')); });
    main += txt(DX, DY - DR - 8, "b 다이얼", 11, C.muted);

    // 움직이는 키 묶음 (모두 한 group → 같은 평행이동)
    var keys = [
      [0, 0, 0], [13, 0, 1], [26, 0, 2],      // [x, b=0 칸, 묶음 안 위치]
      [1, 7, 0], [14, 7, 1], [27, 7, 2],
      [2, 1, -1], [5, 9, -1]
    ];
    var moving = "";
    keys.forEach(function (kk) {
      var x = cx(kk[1]), y = kk[2] < 0 ? SY + 52 : SY + 24 + kk[2] * 28;
      var hot = kk[2] >= 0;
      moving += '<circle cx="' + x + '" cy="' + y + '" r="12" fill="' + C.blue + '">' +
        (hot ? anim("fill", [[6, C.blue], [6.25, C.red]]) : "") + '</circle>';
      moving += txt(x, y + 4, kk[0], 11, "#fff", ' font-weight="700"');
    });
    // 묶음 라벨 (칸 번호 아래)
    moving += txt(cx(0), SY + SH + 36, "≡ 0 (mod 13)", 11, C.red, ' font-weight="700"');
    moving += txt(cx(7), SY + SH + 36, "≡ 1 (mod 13)", 11, C.red, ' font-weight="700"');
    // 6–9s: 묶음 테두리 맥동
    var pulse = "";
    [0, 7].forEach(function (sl) {
      pulse += '<rect x="' + (SX0 + sl * SW) + '" y="' + (SY - 3) + '" width="' + SW + '" height="' + (SH + 6) + '" rx="7" fill="none" stroke="' + C.red + '" stroke-width="3">' +
        '<animate attributeName="stroke-opacity" values="1;0.25;1" dur="0.75s" begin="6s" repeatCount="4" fill="freeze"/></rect>';
      pulse += txt(SX0 + sl * SW + SW / 2, SY + SH + 54, "P = 1", 13, C.red, ' font-weight="700"');
    });
    moving += vis(6, 9, pulse);
    // 간격 괄호: 0 의 칸 ↔ 1 의 칸
    var BY = 80;
    var brk = '<line x1="' + cx(0) + '" y1="' + BY + '" x2="' + cx(7) + '" y2="' + BY + '" stroke="' + C.green + '" stroke-width="2"/>' +
      '<line x1="' + cx(0) + '" y1="' + (BY - 6) + '" x2="' + cx(0) + '" y2="' + (BY + 6) + '" stroke="' + C.green + '" stroke-width="2"/>' +
      '<line x1="' + cx(7) + '" y1="' + (BY - 6) + '" x2="' + cx(7) + '" y2="' + (BY + 6) + '" stroke="' + C.green + '" stroke-width="2"/>' +
      '<rect x="' + ((cx(0) + cx(7)) / 2 - 96) + '" y="' + (BY - 19) + '" width="192" height="16" fill="#fff"/>' +
      txt((cx(0) + cx(7)) / 2, BY - 6, "간격 7(x−y) = 7·1 = 7 칸 불변", 12, C.green, ' font-weight="700"');
    moving += vis(2.2, 9, brk);

    main += '<g>' + move([[2.6, "0,0"], [3.0, SW + ",0"], [3.6, SW + ",0"], [4.0, 2 * SW + ",0"], [4.6, 2 * SW + ",0"], [5.0, 3 * SW + ",0"]]) + moving + '</g>';

    // 아래 설명 줄
    main += vis(0, 2, txt(380, 278, "b = 0: 0→0, 13→91 mod 13 = 0, 26→0  /  1→7, 14→98 mod 13 = 7, 27→7  /  2→1, 5→35 mod 13 = 9", 12, C.muted));
    main += vis(2.2, 6, txt(380, 278, "h_b(x) − h_b(y) ≡ (7x + b) − (7y + b) = 7(x − y) — b 가 빠진다", 13, C.green, ' font-weight="700"'));
    main += vis(6.1, 9, txt(380, 278, "h_b(13) − h_b(0) ≡ 7·13 = 91 ≡ 0 (mod 13) → 13 개 b 모두 충돌, 13/13 = 1", 13, C.red, ' font-weight="700"'));
    s += vis(0, 9, main);

    // ================= 대비 장면 (9–12s): h_{a,b} =================
    var TX0 = 146, TW = 36, TY = 108, TH = 88;
    function tx(slot) { return TX0 + slot * TW + TW / 2; }
    var con = '<rect x="40" y="48" width="680" height="232" rx="10" fill="' + C.greenL + '" stroke="' + C.green + '" stroke-width="1.5"/>';
    con += txt(380, 72, "h_{a,b}(x) = ((ax + b) mod 31) mod 13   (p = 31 ≥ |U|, b = 0 으로 두고 a 만 바꿔 본다)", 13, C.ink, ' font-weight="700"');
    for (var j = 0; j < 13; j++) {
      con += '<rect x="' + (TX0 + j * TW + 2) + '" y="' + TY + '" width="' + (TW - 4) + '" height="' + TH + '" rx="4" fill="' + C.purL + '" stroke="' + C.pur + '" stroke-width="1.2"/>';
      con += txt(tx(j), TY + TH + 15, j, 11, C.pur, ' font-weight="700"');
    }
    con += vis(9, 10.5, txt(96, 156, "a = 1", 15, C.or, ' font-weight="700"'));
    con += vis(10.5, D, txt(96, 156, "a = 5", 15, C.or, ' font-weight="700"'));
    // 키 0, 13, 26, 1: a=1 → 칸 0,0,0,1 (겹침) / a=5 → 칸 0,3,6,5 (흩어짐)
    var tk = [[0, 0, 0, 0], [13, 0, 1, 3], [26, 0, 2, 6], [1, 1, -1, 5]];
    tk.forEach(function (q) {
      var x1 = tx(q[1]), y1 = q[2] < 0 ? TY + 44 : TY + 18 + q[2] * 26;
      var x2 = tx(q[3]), y2 = TY + 44;
      var col0 = q[2] >= 0 ? C.red : C.blue;
      con += '<g>' + move([[10.5, "0,0"], [11.0, (x2 - x1) + "," + (y2 - y1)]]) +
        '<circle cx="' + x1 + '" cy="' + y1 + '" r="10" fill="' + col0 + '">' + anim("fill", [[10.5, col0], [11.0, C.blue]]) + '</circle>' +
        txt(x1, y1 + 4, q[0], 10, "#fff", ' font-weight="700"') + '</g>';
    });
    con += vis(9, 10.5, txt(380, 236, "a = 1: 13a = 13 ≡ 0 → 0, 13, 26 이 한 칸 (이런 나쁜 a 는 일부뿐)", 13, C.red, ' font-weight="700"'));
    con += vis(10.5, D, txt(380, 236, "a = 5: 13a = 65 ≡ 3 (mod 31) → 0, 3, 6 으로 흩어짐", 13, C.green, ' font-weight="700"'));
    con += vis(10.5, D, txt(380, 260, "a 가 차 (x − y) 에 곱해지므로 a 를 무작위로 고르면 간격도 무작위 → 충돌 확률 ≤ 1/n", 12, C.ink));
    s += vis(9, D, con);

    // ---- 요점 ----
    s += txt(380, 322, "더해지는 무작위(b)는 소거된다 — 무작위는 차에 곱해지는 자리(a)에 있어야 한다", 14, C.muted, ' font-weight="700"');
    s += '</svg>';
    return s;
  }
};
