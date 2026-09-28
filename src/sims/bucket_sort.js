window.SIMS = window.SIMS || {};
// bucket_sort — L5 p.35–46 (PNG 33–44): get_bucket 으로 담고, num_buckets < k 면 버킷별 stable_sort
(function (global) {
  "use strict";

  var CODE = [
    "def bucket_sort(A, k, num_buckets):",
    "  # A consists of n integers ranging from 0 to k-1.",
    "  # Pointless to have more buckets than integers.",
    "  num_buckets = min(num_buckets, k)",
    "  buckets = [[] for i in range(num_buckets)]",
    "  for i in range(len(A)):",
    "    b = get_bucket(A[i], k, num_buckets)",
    "    buckets[b].append(A[i])",
    "  result = []",
    "  if num_buckets < k:",
    "    for j in range(num_buckets):",
    "      result.extend(stable_sort(buckets[j]))",
    "  else:",
    "    for j in range(num_buckets):",
    "      result.extend(buckets[j])",
    "  return result"
  ];
  var GB = [
    "def get_bucket(value, k, num_buckets):",
    "  # int division",
    "  return value / math.ceil(k / num_buckets)"
  ];

  var CASES = {
    p45: { A: [17, 13, 16, 12, 15, 1, 28, 0, 27], k: 30, nb: 10 },
    p46: { A: [380, 370, 340, 320, 410], k: 3000, nb: 10 }
  };

  function svgFor(c, st) {
    var nb = c.nb, w = Math.ceil(c.k / nb);
    var s = '<svg viewBox="0 0 760 330" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif" font-size="12">';
    s += '<text x="8" y="30" font-weight="700" font-size="13">A</text>';
    for (var i = 0; i < c.A.length; i++) {
      var x = 40 + i * 46, hot = st.i === i;
      var placed = st.i !== null ? i < st.i : st.phase !== "init";
      s += '<rect x="' + x + '" y="10" width="42" height="30" rx="3" fill="' + (hot ? "#fde2e6" : (placed ? "#eef0f4" : "#fff")) +
        '" stroke="' + (hot ? "#d6465f" : "#667") + '" stroke-width="' + (hot ? 3 : 1.2) + '"/>';
      s += '<text x="' + (x + 21) + '" y="30" text-anchor="middle" font-size="13">' + c.A[i] + "</text>";
    }
    // 버킷 상자 10 개
    for (var b = 0; b < nb; b++) {
      var bx = 8 + b * 75, hotb = st.b === b || st.j === b;
      var lo = b * w, hi = Math.min(c.k - 1, (b + 1) * w - 1);
      s += '<text x="' + (bx + 35) + '" y="70" text-anchor="middle" font-size="10" fill="#555">' + lo + "–" + hi + "</text>";
      s += '<rect x="' + bx + '" y="76" width="70" height="170" rx="4" fill="' + (hotb ? "#fff4e6" : "#f7f8fb") +
        '" stroke="' + (hotb ? "#d6465f" : "#8a93a8") + '" stroke-width="' + (hotb ? 2.5 : 1.2) + '"/>';
      s += '<text x="' + (bx + 35) + '" y="262" text-anchor="middle" font-size="10" fill="#888">bucket ' + b + "</text>";
      var items = st.buckets[b];
      for (var t = 0; t < items.length && t < 6; t++) {
        var sorted = st.sortedUpTo > b;
        s += '<rect x="' + (bx + 8) + '" y="' + (84 + t * 26) + '" width="54" height="22" rx="3" fill="' + (sorted ? "#dff3e4" : "#fff") + '" stroke="#667"/>';
        s += '<text x="' + (bx + 35) + '" y="' + (100 + t * 26) + '" text-anchor="middle" font-size="12">' + items[t] + "</text>";
      }
    }
    s += '<text x="8" y="300" font-weight="700" font-size="13">result</text>';
    for (var r = 0; r < st.result.length; r++) {
      s += '<rect x="' + (70 + r * 46) + '" y="282" width="42" height="28" rx="3" fill="#dff3e4" stroke="#667"/>';
      s += '<text x="' + (91 + r * 46) + '" y="301" text-anchor="middle" font-size="12">' + st.result[r] + "</text>";
    }
    s += "</svg>";
    return s;
  }

  function stableSort(arr) {
    return arr.map(function (v, i) { return [v, i]; })
      .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; })
      .map(function (p) { return p[0]; });
  }

  global.SIMS["bucket_sort"] = {
    title: "bucket sort — 값 범위를 버킷으로 쪼개기",
    desc: "L5 p.35–46. [[get_bucket]] 이 value / ⌈k/num_buckets⌉ 로 버킷 번호를 정하고, [[num_buckets와 k|num_buckets < k]] 이면 버킷 안에 여러 값이 섞이므로 " +
      "버킷마다 [[stable sort|stable_sort]] 를 한 번 더 한다. p.46 은 전부 한 버킷에 몰리는 [[bucket sort의 최악 케이스]].",
    options: [
      { key: "ex", label: "예제", values: [
        { value: "p45", label: "p.45: k=30, 버킷 10" },
        { value: "p46", label: "p.46 극단: k=3000, 버킷 10" }
      ] }
    ],
    build: function (opts) {
      var c = CASES[opts.ex] || CASES.p45;
      var nb = Math.min(c.nb, c.k), w = Math.ceil(c.k / nb);
      var st = { phase: "init", i: null, b: null, j: null, buckets: [], result: [], sortedUpTo: 0 };
      for (var q = 0; q < nb; q++) st.buckets.push([]);
      var steps = [];

      function bucketsStr() {
        var out = [];
        st.buckets.forEach(function (bk, idx) {
          if (bk.length) out.push((idx * w) + "-" + Math.min(c.k - 1, (idx + 1) * w - 1) + ":[" + bk.join(",") + "]");
        });
        return out.length ? out.join("  ") : "(모두 빔)";
      }
      function snap() {
        return {
          A: c.A.slice(), k: c.k, num_buckets: nb, "ceil(k/num_buckets)": w,
          i: st.i === null ? "-" : st.i, "A[i]": st.i === null ? "-" : c.A[st.i],
          b: st.b === null ? "-" : st.b, j: st.j === null ? "-" : st.j,
          buckets: bucketsStr(), result: st.result.slice()
        };
      }
      function push(desc, pcC, pcG, note) {
        var copy = {
          phase: st.phase, i: st.i, b: st.b, j: st.j, sortedUpTo: st.sortedUpTo,
          buckets: st.buckets.map(function (x) { return x.slice(); }), result: st.result.slice()
        };
        steps.push({ desc: desc, pc: { C: pcC, G: pcG }, vars: snap(), note: note, svg: svgFor(c, copy) });
      }

      push("k = " + c.k + ", num_buckets = " + c.nb + ". `num_buckets = min(" + c.nb + ", " + c.k + ") = " + nb + "`. " +
        "버킷 폭은 ⌈k/num_buckets⌉ = ⌈" + c.k + "/" + nb + "⌉ = '''" + w + "''' → 0–" + (w - 1) + ", " + w + "–" + (2 * w - 1) + ", … 이 한 버킷씩.", 4, null);
      push("`buckets = [[] for i in range(" + nb + ")]` — 빈 버킷 " + nb + " 개.", 5, null);
      st.phase = "put";
      for (var i = 0; i < c.A.length; i++) {
        st.i = i; st.b = null;
        var b = Math.floor(c.A[i] / w);
        push("i = " + i + ": `get_bucket(" + c.A[i] + ", " + c.k + ", " + nb + ")` = " + c.A[i] + " / " + w + " (정수 나눗셈) = '''" + b + "'''.", 7, 3);
        st.b = b;
        st.buckets[b].push(c.A[i]);
        push("`buckets[" + b + "].append(" + c.A[i] + ")` → 버킷 " + b + " (" + (b * w) + "–" + ((b + 1) * w - 1) + ") = [" + st.buckets[b].join(", ") + "]. 도착한 순서대로 뒤에 붙는다.", 8, null);
      }
      st.i = null; st.b = null; st.phase = "sort";
      push("분배 끝: " + bucketsStr() + ". `num_buckets(" + nb + ") < k(" + c.k + ")` 가 참 → 한 버킷에 서로 다른 값이 섞일 수 있으므로 '''버킷마다 stable_sort''' 가 필요하다.", 10, null);
      var maxB = 0;
      for (var j = 0; j < nb; j++) {
        st.j = j;
        var before = st.buckets[j].slice();
        var after = stableSort(before);
        st.buckets[j] = after;
        st.sortedUpTo = j + 1;
        st.result = st.result.concat(after);
        if (before.length > maxB) maxB = before.length;
        if (before.length === 0) continue;  // 빈 버킷은 step 생략 (결과 변화 없음)
        push("j = " + j + ": `stable_sort([" + before.join(", ") + "])` = [" + after.join(", ") + "] 를 result 뒤에 extend → result = [" + st.result.join(", ") + "].", 12, null);
      }
      st.j = null;
      var fin;
      if (opts.ex === "p46") {
        fin = "`return result` → '''[" + st.result.join(", ") + "]'''. 그런데 원소 " + c.A.length + " 개가 '''전부 300–599 한 버킷'''에 들어갔다 — " +
          "결국 stable_sort 가 원래 리스트 전체를 정렬한 셈이라 버킷을 나눈 의미가 없다. 이것이 worst-case Θ(max{n log n, n + k}) 의 n log n 항이다.";
      } else {
        fin = "`return result` → '''[" + st.result.join(", ") + "]'''. 버킷 사이는 이미 값 순서대로이므로 버킷을 차례로 이어붙이기만 하면 전체가 정렬된다. " +
          "가장 큰 버킷도 " + maxB + " 개라 stable_sort 비용이 작다.";
      }
      push(fin, 16, null, opts.ex === "p46"
        ? "[[bucket sort의 최악 케이스]]: k > num_buckets 이고 값이 한 버킷에 몰리면 Θ(n log n). 어떤 버킷에 몰릴지는 '''입력이''' 정한다."
        : "시험 포인트: num_buckets ≥ k 면 버킷당 값이 1 종류라 stable_sort 없이 이어붙이기만 → counting sort 와 같다.");

      return {
        panels: [
          { id: "C", title: "bucket_sort (L5 p.35)", lang: "c", lines: CODE },
          { id: "G", title: "get_bucket (L5 p.44)", lang: "c", lines: GB }
        ],
        vars: [
          { name: "A", group: "입력" }, { name: "k", group: "입력" }, { name: "num_buckets", group: "입력" },
          { name: "ceil(k/num_buckets)", label: "버킷 폭 ⌈k/num_buckets⌉", group: "입력" },
          { name: "i", group: "분배" }, { name: "A[i]", group: "분배" }, { name: "b", group: "분배" },
          { name: "j", group: "이어붙이기" },
          { name: "buckets", group: "상태" }, { name: "result", group: "상태" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
