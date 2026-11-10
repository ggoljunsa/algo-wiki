// huffman_build — L14 p.71–77 Huffman 트리 만들기: 가장 작은 key 두 개를 합치는 것을 1개 남을 때까지.
//   빈도 A45 B13 C12 D16 E9 F5 (합 100).
//   좌우 배치 옵션:
//    p76: p.76 완성 그림의 좌우 그대로 (14 = E|F, 25 = B|C, 30 = D|14, 55 = 25|30, 100 = A|55)
//    p77: p.77 코드 규칙 Z.left = X(작은 key), Z.right = Y 를 그대로 적용
//   두 배치는 0/1 이 바뀔 뿐 각 글자의 깊이(코드 길이)가 같아 기대 길이도 같다.
//
// 기대 최종값 (src/sims/_check_L13_L14.py → _check_L13_L14.txt):
//  합치는 순서: F5+E9 = 14, C12+B13 = 25, 14+D16 = 30, 25+30 = 55, A45+55 = 100
//  p76 코드: A=0, B=100, C=101, D=110, E=1110, F=1111 (p.76 그림과 같음)
//  p77 코드: A=0, C=100, B=101, F=1100, E=1101, D=111
//  기대 길이 = (45·1 + (13+12+16)·3 + (9+5)·4) / 100 = 1·0.45 + 3·0.41 + 4·0.14 = 2.24 (두 배치 모두)
(function (global) {
  "use strict";
  global.SIMS = global.SIMS || {};

  var CODE = [
    "Create a node like [D: 16] for each letter/frequency",
    "  The key is the frequency (16 in this case)",
    "Let CURRENT be the list of all these nodes.",
    "while len(CURRENT) > 1:",
    "  X and Y ← the nodes in CURRENT with the smallest keys.",
    "  Create a new node Z with Z.key = X.key + Y.key",
    "  Set Z.left = X, Z.right = Y",
    "  Add Z to CURRENT and remove X and Y",
    "return CURRENT[0]"
  ];
  var READ = [
    "왼쪽 간선 = 0, 오른쪽 간선 = 1",
    "뿌리에서 leaf 까지 읽은 비트 = 그 글자의 코드",
    "코드 길이 = leaf 의 깊이",
    "기대 길이 = Σ (빈도/100) × 깊이"
  ];

  var C = { blue: "#1d65b3", blueL: "#dbe8f7", green: "#2e9e4f", greenL: "#c9f0e4", leaf: "#1f9e74", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", red: "#d6465f", muted: "#777", node: "#cdf3e6" };
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var FREQ = [["A", 45], ["B", 13], ["C", 12], ["D", 16], ["E", 9], ["F", 5]];
  // p.76 그림의 좌우: Z 의 이름(합친 key) → [왼쪽 이름, 오른쪽 이름]
  var P76 = { "14": ["E", "F"], "25": ["B", "C"], "30": ["D", "14"], "55": ["25", "30"], "100": ["A", "55"] };

  global.SIMS["huffman_build"] = {
    title: "Huffman 트리 만들기 — A45 B13 C12 D16 E9 F5 (L14 p.71–77)",
    desc: "L14 p.71–77. [[Huffman coding]] 은 빈도가 가장 작은 두 node 를 합쳐 새 node 를 만드는 일을 하나가 남을 때까지 반복한다. " +
      "드문 글자가 트리 아래로 내려가 긴 코드를 받는다. 완성된 트리에서 왼쪽 0, 오른쪽 1 로 읽으면 [[prefix-free code]] 가 된다.",
    options: [
      { key: "lr", label: "좌우 배치", values: [
        { value: "p76", label: "p.76 그림 그대로 (E=1110, F=1111)" },
        { value: "p77", label: "p.77 규칙 Z.left = X (작은 쪽)" }
      ] }
    ],
    build: function (opts) {
      var lr = opts.lr === "p77" ? "p77" : "p76", steps = [];
      var nodes = {}, current = [], merges = 0;
      FREQ.forEach(function (p) { nodes[p[0]] = { name: p[0], key: p[1], leaf: true, h: 0 }; });

      // 미리 한 번 돌려 최종 트리를 얻고 leaf 의 가로 순서를 정한다 (슬라이드처럼 leaf 는 맨 아래 한 줄)
      function runMerges(store) {
        var cur = FREQ.map(function (p) { return p[0]; }), log = [];
        while (cur.length > 1) {
          cur.sort(function (a, b) { return store[a].key - store[b].key; });
          var X = cur[0], Y = cur[1], zk = store[X].key + store[Y].key, Z = String(zk);
          var L = X, R = Y;
          if (lr === "p76") { L = P76[Z][0]; R = P76[Z][1]; }
          store[Z] = { name: Z, key: zk, left: L, right: R, h: Math.max(store[X].h, store[Y].h) + 1 };
          log.push({ X: X, Y: Y, Z: Z });
          cur = cur.slice(2); cur.push(Z);
        }
        return { root: cur[0], log: log };
      }
      var pre = {};
      FREQ.forEach(function (p) { pre[p[0]] = { name: p[0], key: p[1], leaf: true, h: 0 }; });
      var fin = runMerges(pre), leafOrder = [];
      (function walk(id) { var nd = pre[id]; if (nd.leaf) { leafOrder.push(id); return; } walk(nd.left); walk(nd.right); })(fin.root);
      var posX = {}, x0 = 60, gap = 110, yLeaf = 330, lvl = 62;
      leafOrder.forEach(function (id, i) { posX[id] = x0 + i * gap; });
      function px(id) { var nd = nodes[id]; if (posX[id] === undefined) posX[id] = (px(nd.left) + px(nd.right)) / 2; return posX[id]; }
      function py(id) { return yLeaf - nodes[id].h * lvl; }

      var codes = {}, hiX = null, hiY = null, hiZ = null, hiPath = {}, done = false;
      var vX = "-", vY = "-", vZ = "-", vCode = "-", vCost = "-";

      function draw(msg) {
        var s = "", W = x0 + 5 * gap + 220, H = 420;
        Object.keys(nodes).forEach(function (id) {
          var nd = nodes[id];
          if (nd.leaf) return;
          [["left", "0"], ["right", "1"]].forEach(function (e) {
            var c = nd[e[0]], x1 = px(id), y1 = py(id), x2 = px(c), y2 = py(c), on = hiPath[id + ">" + c];
            s += '<line x1="' + x1 + '" y1="' + (y1 + 16) + '" x2="' + x2 + '" y2="' + (y2 - 16) + '" stroke="' + (on ? C.red : C.blue) + '" stroke-width="' + (on ? 3.5 : 2) + '"/>';
            s += '<text x="' + ((x1 + x2) / 2 + (e[1] === "0" ? -10 : 10)) + '" y="' + ((y1 + y2) / 2) + '" text-anchor="middle" font-size="13" font-weight="700" fill="' + (on ? C.red : C.blue) + '">' + e[1] + '</text>';
          });
        });
        Object.keys(nodes).forEach(function (id) {
          var nd = nodes[id], x = px(id), y = py(id), isHi = id === hiX || id === hiY, isZ = id === hiZ;
          var st = isHi ? C.or : isZ ? C.red : nd.leaf ? "#137a58" : C.blue;
          if (nd.leaf) {
            s += '<rect x="' + (x - 32) + '" y="' + (y - 16) + '" width="64" height="32" fill="' + (isHi ? C.orL : C.leaf) + '" stroke="' + st + '" stroke-width="' + (isHi ? 3 : 1.5) + '"/>' +
              '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="' + (isHi ? "#222" : "#fff") + '">' + esc(id + ": " + nd.key) + '</text>';
            if (codes[id]) s += '<text x="' + x + '" y="' + (y + 34) + '" text-anchor="middle" font-size="13" font-family="monospace" fill="' + C.pur + '">' + codes[id] + '</text>';
          } else {
            s += '<ellipse cx="' + x + '" cy="' + y + '" rx="26" ry="16" fill="' + (isHi ? C.orL : isZ ? "#fbe3e7" : C.node) + '" stroke="' + st + '" stroke-width="' + (isHi || isZ ? 3 : 1.5) + '"/>' +
              '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#222">' + nd.key + '</text>';
          }
        });
        var cx = x0 + 5 * gap + 60;
        s += '<text x="' + cx + '" y="40" font-size="12.5" font-weight="700" fill="' + C.pur + '">CURRENT</text>';
        current.slice().sort(function (a, b) { return nodes[a].key - nodes[b].key; }).forEach(function (id, i) {
          var on = id === hiX || id === hiY;
          s += '<text x="' + cx + '" y="' + (60 + i * 18) + '" font-size="12.5" font-weight="' + (on ? 700 : 400) + '" fill="' + (on ? C.or : "#333") + '">' +
            esc((nodes[id].leaf ? id + ": " : "node ") + nodes[id].key) + (id === hiX ? "  ← X" : id === hiY ? "  ← Y" : "") + '</text>';
        });
        if (done) s += '<text x="' + cx + '" y="200" font-size="13" font-weight="700" fill="' + C.green + '">기대 길이 ' + vCost + '</text>';
        if (msg) s += '<text x="12" y="' + (H - 12) + '" font-size="13" font-weight="700" fill="' + C.pur + '">' + esc(msg) + '</text>';
        return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="13">' + s + '</svg>';
      }
      function curStr() { return current.slice().sort(function (a, b) { return nodes[a].key - nodes[b].key; }).map(function (id) { return nodes[id].leaf ? id + ":" + nodes[id].key : String(nodes[id].key); }); }
      function snap(desc, pc, msg) {
        steps.push({ desc: desc, pc: pc,
          vars: { CURRENT: curStr(), X: vX, Y: vY, Z: vZ, "합친 횟수": merges, code: vCode, "기대 길이": vCost },
          svg: draw(msg) });
      }

      snap("글자마다 node 를 하나씩 만든다. key 는 빈도(%)다. A:45, B:13, C:12, D:16, E:9, F:5.", { P: 1, R: null }, "leaf node 6개");
      current = FREQ.map(function (p) { return p[0]; });
      snap("CURRENT 는 이 6개 node 의 목록이다.", { P: 3, R: null }, "CURRENT = 6개");

      fin.log.forEach(function (m) {
        hiX = m.X; hiY = m.Y; hiZ = null; vX = nodes[m.X].key; vY = nodes[m.Y].key; vZ = "-";
        snap("CURRENT 에서 key 가 가장 작은 두 node 는 " + vX + " 와 " + vY + " 다. 이 둘을 X, Y 로 고른다.", { P: 5, R: null }, "X = " + vX + ", Y = " + vY);
        var src = pre[m.Z];
        nodes[m.Z] = { name: m.Z, key: src.key, left: src.left, right: src.right, h: src.h };
        merges++; vZ = src.key; hiZ = m.Z;
        current = current.filter(function (id) { return id !== m.X && id !== m.Y; }); current.push(m.Z);
        var lk = nodes[src.left].key, rk = nodes[src.right].key;
        snap("새 node Z 의 key 는 " + vX + " + " + vY + " = " + vZ + " 이다. 왼쪽 " + lk + ", 오른쪽 " + rk + " 로 달고 CURRENT 에서 X, Y 를 빼고 Z 를 넣는다." +
          (lr === "p76" && src.left !== m.X ? " (p.76 그림 배치라 작은 쪽이 오른쪽에 있다.)" : ""),
          { P: 8, R: null }, "Z = " + vZ + " (" + lk + " | " + rk + "), CURRENT " + current.length + "개");
        hiX = null; hiY = null;
      });
      hiZ = null; vX = "-"; vY = "-";
      snap("CURRENT 에 node 가 하나 남았다. 이것이 뿌리 " + nodes[fin.root].key + " 다. 합친 횟수는 n - 1 = 5 번이다.", { P: 9, R: null }, "return CURRENT[0] = 100");

      // 코드 읽기
      var depthSum = 0;
      leafOrder.slice().sort().forEach(function (letter) {
        var path = [], cur = fin.root, bits = "";
        hiPath = {};
        while (!nodes[cur].leaf) {
          var target = (function has(id) { return id === letter || (!nodes[id].leaf && (has(nodes[id].left) || has(nodes[id].right))); });
          var nx = target(nodes[cur].left) ? nodes[cur].left : nodes[cur].right;
          bits += nx === nodes[cur].left ? "0" : "1";
          hiPath[cur + ">" + nx] = 1; path.push(nx); cur = nx;
        }
        codes[letter] = bits; depthSum += nodes[letter].key * bits.length; vCode = letter + " = " + bits;
        snap(letter + " 까지 뿌리에서 내려가며 읽은 비트는 " + bits + " 이다. 코드 길이 " + bits.length + " = 깊이.", { P: null, R: 2 }, letter + " = " + bits + " (길이 " + bits.length + ")");
      });
      hiPath = {}; done = true;
      vCost = (depthSum / 100).toFixed(2);
      vCode = leafOrder.slice().sort().map(function (l) { return l + "=" + codes[l]; }).join(" ");
      snap("기대 길이 = 1·0.45 + 3·(0.13 + 0.12 + 0.16) + 4·(0.09 + 0.05) = 0.45 + 1.23 + 0.56 = '''" + vCost + "''' 비트다. p.76 과 같다.", { P: null, R: 4 }, "기대 길이 = " + vCost);

      return {
        panels: [
          { id: "P", title: "Huffman (p.77)", lang: "c", lines: CODE },
          { id: "R", title: "코드 읽기 (p.76)", lang: "txt", lines: READ }
        ],
        vars: [
          { name: "CURRENT", group: "목록" }, { name: "X", group: "합치기" }, { name: "Y", group: "합치기" }, { name: "Z", group: "합치기" },
          { name: "합친 횟수", group: "합치기" }, { name: "code", group: "결과" }, { name: "기대 길이", group: "결과" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
