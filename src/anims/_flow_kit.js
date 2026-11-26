// ============================================================
// _flow_kit.js — L17 (max flow / min cut) 움직이는 그림들이 같이 쓰는 그리기 도구.
//   ANIMS 를 등록하지 않는다. build() 안에서 FLOWKIT(D, "접두어") 로 부른다 (순수 문자열만 만든다, DOM 없음).
//   쓰는 곳: flow_fill_conservation, st_cut_sweep, flow_across_any_cut, residual_build, augment_backward,
//            ff_full_run, cut_proof_reachable, cut_proof_two_facts, inequality_squeeze, bad_path_zigzag, matching_as_flow
//   색은 슬라이드 그대로: S 쪽 정점 = 짙은 초록, T 쪽 정점 = 연한 민트, Gf 의 forward = 파랑, backward = 연두.
//   S 쪽 영역은 연두색 배경으로 칠한다.
// ============================================================
(function (global) {
  "use strict";
  function FLOWKIT(D, pre) {
    var K = {};
    var C = K.C = {
      blue: "#1d65b3", blueL: "#dbe8f7", lime: "#7cb82f", limeL: "#e6f5cf", or: "#e0892a", orL: "#fdeec2",
      sNode: "#1d9a76", tNode: "#d4f5e8", tStroke: "#5aa58a", src: "#e0892a", sink: "#1f5fe0",
      red: "#d6465f", grey: "#9aa1ab", muted: "#777", ink: "#222", pur: "#3b2f4a", green: "#2e9e4f", greenL: "#dff3e4"
    };
    function r4(v) { return Math.round(v * 10000) / 10000; }
    K.r4 = r4;
    function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    K.esc = esc;
    K.txt = function (x, y, s, size, fill, extra) {
      extra = extra || "";
      return '<text x="' + r4(x) + '" y="' + r4(y) + '" font-size="' + (size || 13) + '" fill="' + (fill || C.ink) + '"' +
        (/text-anchor/.test(extra) ? "" : ' text-anchor="middle"') + extra + '>' + s + '</text>';
    };
    // from~to 초에만 보이기 (to ≥ D 면 끝까지)
    K.show = function (from, to) {
      var f = 0.12 / D, a = r4(Math.max(0, from) / D), b = r4(Math.min(from / D + f, (from + to) / 2 / D));
      if (from <= 0) {
        if (to >= D) return '<set attributeName="opacity" to="1" begin="0s" dur="' + D + 's" fill="freeze"/>';
        var c0 = r4(to / D - f), d0 = r4(to / D);
        return '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;' + c0 + ';' + d0 + ';1" dur="' + D + 's" fill="freeze"/>';
      }
      if (to >= D) return '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;' + a + ';' + b + ';1" dur="' + D + 's" fill="freeze"/>';
      var c = r4(Math.max(b, to / D - f)), d = r4(to / D);
      if (d <= c) d = r4(c + 0.0001);
      return '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;' + a + ';' + b + ';' + c + ';' + d + ';1" dur="' + D + 's" fill="freeze"/>';
    };
    K.vis = function (from, to, inner) {
      if (from <= 0 && to >= D) return inner;
      return '<g opacity="0">' + inner + K.show(from, to) + '</g>';
    };
    // from~to 동안 깜빡이다가 to 이후 계속 보임(stay) 또는 사라짐
    K.blink = function (from, to, stay, n) {
      n = n || 3;
      var ks = [0], vs = [0], step = (to - from) / (2 * n);
      if (from > 0.02) { ks.push(r4((from - 0.01) / D)); vs.push(0); }
      ks.push(r4(from / D)); vs.push(1);
      for (var i = 1; i <= 2 * n; i++) { ks.push(r4((from + i * step) / D)); vs.push(i % 2 ? 0.2 : 1); }
      if (stay) { ks.push(1); vs.push(1); }
      else { var e = Math.min(D, to + 0.15); if (e < D) { ks.push(r4(e / D)); vs.push(0); } ks.push(1); vs.push(0); }
      // keyTimes 단조 보정
      for (var j = 1; j < ks.length; j++) if (ks[j] <= ks[j - 1]) ks[j] = r4(ks[j - 1] + 0.0001);
      if (ks[ks.length - 1] > 1) ks[ks.length - 1] = 1;
      return '<animate attributeName="opacity" values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"/>';
    };
    K.blinkG = function (from, to, stay, inner, n) { return '<g opacity="0">' + inner + K.blink(from, to, stay, n) + '</g>'; };
    // 값이 시간에 따라 계단식으로 바뀜: pairs = [[0, v0], [t1, v1], ...]
    K.disc = function (attr, pairs) {
      var ks = [], vs = [];
      pairs.forEach(function (p) { ks.push(r4(p[0] / D)); vs.push(p[1]); });
      ks[0] = 0;
      ks.push(1); vs.push(pairs[pairs.length - 1][1]);
      for (var j = 1; j < ks.length; j++) if (ks[j] <= ks[j - 1]) ks[j] = r4(Math.min(1, ks[j - 1] + 0.0001));
      return '<animate attributeName="' + attr + '" calcMode="discrete" values="' + vs.join(";") + '" keyTimes="' + ks.join(";") + '" dur="' + D + 's" fill="freeze"/>';
    };
    // 글자가 시간에 따라 바뀜: pairs = [[t, "글"], ...] (각 글은 다음 t 까지)
    K.seq = function (x, y, pairs, size, fill, extra) {
      var s = "";
      pairs.forEach(function (p, i) {
        var to = i + 1 < pairs.length ? pairs[i + 1][0] : D;
        var f = p[2] || fill;
        if (p[1] === null || p[1] === "") return;
        s += K.vis(p[0], to, K.txt(x, y, p[1], size, f, extra));
      });
      return s;
    };
    // 자막(맨 위) / 요점(맨 아래)
    K.captions = function (caps, y, size) {
      var s = "";
      caps.forEach(function (c) { s += K.vis(c[0], c[1], K.txt(380, y || 24, c[2], size || 14, c[3] || C.ink, ' font-weight="700"')); });
      return s;
    };

    // ---- 화살표 ----
    var MK = { blue: C.blue, lime: C.lime, or: C.or, grey: C.grey, red: C.red, ink: C.ink, green: C.green, pur: C.pur };
    K.defs = function () {
      var s = "<defs>";
      Object.keys(MK).forEach(function (k) {
        s += '<marker id="' + pre + '_m_' + k + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">' +
          '<path d="M0,0 L10,5 L0,10 z" fill="' + MK[k] + '"/></marker>';
      });
      return s + "</defs>";
    };
    K.mk = function (color) { return ' marker-end="url(#' + pre + '_m_' + color + ')"'; };

    // 두 정점 사이 선분 (반지름 r 만큼 줄이고, 수직으로 off 만큼 평행 이동)
    K.seg = function (P, a, b, off, r) {
      r = r === undefined ? 17 : r;
      var x1 = P[a][0], y1 = P[a][1], x2 = P[b][0], y2 = P[b][1];
      var dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      var nx = -uy, ny = ux; off = off || 0;
      return { x1: r4(x1 + ux * r + nx * off), y1: r4(y1 + uy * r + ny * off), x2: r4(x2 - ux * (r + 2) + nx * off), y2: r4(y2 - uy * (r + 2) + ny * off),
        ux: ux, uy: uy, nx: nx, ny: ny, L: L };
    };
    K.at = function (P, a, b, t, perp, off) {
      var g = K.seg(P, a, b, off || 0);
      return [r4(g.x1 + (g.x2 - g.x1) * t + g.nx * (perp || 0)), r4(g.y1 + (g.y2 - g.y1) * t + g.ny * (perp || 0))];
    };
    // opts: color(마커 이름), w, off, dash, extra, r, noArrow
    K.edge = function (P, a, b, o) {
      o = o || {};
      var g = K.seg(P, a, b, o.off, o.r), col = MK[o.color || "blue"] || o.color;
      return '<line x1="' + g.x1 + '" y1="' + g.y1 + '" x2="' + g.x2 + '" y2="' + g.y2 + '" stroke="' + col + '" stroke-width="' + (o.w || 2.5) + '"' +
        (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + (o.noArrow ? "" : K.mk(o.color || "blue")) + ' stroke-linecap="round"' + (o.extra || "") + '/>';
    };
    // 간선 위 두꺼운 반투명 띠 (강조)
    K.halo = function (P, a, b, color, w, off) {
      var g = K.seg(P, a, b, off || 0, 14);
      return '<line x1="' + g.x1 + '" y1="' + g.y1 + '" x2="' + g.x2 + '" y2="' + g.y2 + '" stroke="' + color + '" stroke-width="' + (w || 12) + '" stroke-linecap="round" opacity="0.45"/>';
    };
    // 동그라미 정점. fillPairs 가 있으면 시간에 따라 색이 바뀜 [[t, fill, stroke, textFill], …]
    K.node = function (P, k, label, fill, stroke, tfill, pairs, r) {
      r = r || 16;
      var s = '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2">';
      if (pairs) {
        s += K.disc("fill", pairs.map(function (p) { return [p[0], p[1]]; }));
        s += K.disc("stroke", pairs.map(function (p) { return [p[0], p[2]]; }));
      }
      s += '</circle><text x="' + P[k][0] + '" y="' + (P[k][1] + 5) + '" font-size="14" text-anchor="middle" font-weight="700" fill="' + tfill + '">';
      if (pairs) s += K.disc("fill", pairs.map(function (p) { return [p[0], p[3]]; }));
      return s + esc(label) + '</text>';
    };
    // 상태 이름 → [fill, stroke, text]
    K.ST = {
      t: [C.tNode, C.tStroke, C.ink],      // T 쪽 (연한 민트)
      s: [C.sNode, "#127158", "#fff"],     // S 쪽 (짙은 초록)
      src: [C.src, "#b86a14", "#fff"],     // source (주황)
      sink: [C.sink, "#163f9a", "#fff"],   // sink (파랑)
      srcS: [C.sNode, C.or, "#fff"]        // S 로 칠해진 source
    };
    // 상태 변화: K.nodeSt(P, k, label, [[0,"t"],[3,"s"]])
    K.nodeSt = function (P, k, label, pairs, r) {
      var p0 = K.ST[pairs[0][1]];
      var pp = pairs.length > 1 ? pairs.map(function (p) { var st = K.ST[p[1]]; return [p[0], st[0], st[1], st[2]]; }) : null;
      return K.node(P, k, label, p0[0], p0[1], p0[2], pp, r);
    };
    // 작은 라벨 (흰 배경 알약)
    K.pill = function (x, y, s, fill, stroke, size, w) {
      size = size || 12;
      w = w || Math.max(18, String(s).replace(/<[^>]+>/g, "").length * size * 0.62 + 8);
      return '<rect x="' + r4(x - w / 2) + '" y="' + r4(y - size * 0.85) + '" width="' + r4(w) + '" height="' + r4(size * 1.35) + '" rx="4" fill="' + (fill || "#fff") + '" stroke="' + (stroke || "#b9c4d8") + '" stroke-width="1"/>' +
        K.txt(x, y + size * 0.3, s, size, C.ink, ' font-weight="700"');
    };
    // 시간에 따라 값이 바뀌는 알약: pairs [[t, "글", fill, stroke], …]
    K.pillSeq = function (x, y, pairs, size, w) {
      var s = "";
      pairs.forEach(function (p, i) {
        var to = i + 1 < pairs.length ? pairs[i + 1][0] : D;
        if (p[1] === null) return;
        s += K.vis(p[0], to, K.pill(x, y, p[1], p[2], p[3], size, w));
      });
      return s;
    };
    // 슬라이드식 flow 상자 (진한 파랑 네모 + 흰 글씨). fill 을 바꾸면 강조색
    K.fbox = function (x, y, v, fill) {
      var w = String(v).length > 1 ? 24 : 18;
      return '<rect x="' + r4(x - w / 2) + '" y="' + r4(y - 9) + '" width="' + w + '" height="18" rx="3" fill="' + (fill || C.blue) + '" stroke="#fff" stroke-width="1"/>' +
        K.txt(x, y + 4.5, v, 12.5, "#fff", ' font-weight="700"');
    };
    // pairs [[t, 값 또는 null, fill], …]
    K.fboxSeq = function (x, y, pairs) {
      var s = "";
      pairs.forEach(function (p, i) {
        var to = i + 1 < pairs.length ? pairs[i + 1][0] : D;
        if (p[1] === null || p[1] === undefined) return;
        s += K.vis(p[0], to, K.fbox(x, y, p[1], p[2]));
      });
      return s;
    };
    // 점이 간선을 따라 흐른다 (from~to 동안, n 개)
    K.dots = function (P, a, b, from, to, n, color, off, period) {
      var g = K.seg(P, a, b, off || 0, 18);
      var path = "M" + g.x1 + "," + g.y1 + " L" + g.x2 + "," + g.y2;
      var per = period || 1.4, s = "";
      n = Math.max(1, Math.min(5, n));
      for (var i = 0; i < n; i++) {
        var b0 = r4(from + i * per / n);
        if (b0 + per > D) continue;
        s += '<circle r="4" fill="' + (color || C.or) + '" opacity="0.9"><animateMotion path="' + path + '" begin="' + b0 + 's" dur="' + per + 's" repeatCount="indefinite"/></circle>';
      }
      return K.vis(from, to, s);
    };
    // 그래프 배치: cols/rows 격자 → 좌표
    K.grid = function (ox, oy, sx, sy, map) {
      var P = {};
      Object.keys(map).forEach(function (k) { P[k] = [r4(ox + map[k][0] * sx), r4(oy + map[k][1] * sy)]; });
      return P;
    };
    return K;
  }

  // L17 p.4 그래프 (정점 이름은 위키가 붙임: 왼쪽 열 A,B,C / 오른쪽 열 D,E,F)
  FLOWKIT.BIG = { s: [0, 1], A: [1, 0], B: [1, 1], C: [1, 2], D: [2, 0], E: [2, 1], F: [2, 2], t: [3, 1] };
  // [u, v, capacity, 라벨 위치(0~1), 라벨 수직 오프셋]
  FLOWKIT.E14 = [
    ["s", "A", 4, 0.45, -13], ["s", "B", 2, 0.5, -11], ["s", "C", 6, 0.45, 13],
    ["A", "D", 3, 0.5, -11], ["A", "B", 2, 0.5, 11], ["A", "E", 6, 0.3, 12],
    ["B", "E", 3, 0.7, 12], ["B", "C", 2, 0.5, 11], ["F", "B", 3, 0.72, -12],
    ["D", "E", 6, 0.5, 11], ["E", "F", 6, 0.5, 11], ["C", "F", 10, 0.5, 12],
    ["D", "t", 4, 0.5, -12], ["E", "t", 4, 0.5, -11], ["F", "t", 4, 0.5, 13]
  ];
  global.FLOWKIT = FLOWKIT;
})(typeof window !== "undefined" ? window : globalThis);
