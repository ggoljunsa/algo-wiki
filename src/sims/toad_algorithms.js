window.SIMS = window.SIMS || {};
// toad_algorithms — HW2 3번: toad 세 알고리즘 (Las Vegas vs Monte Carlo)
// n = 8, trustworthy = {1,2,4,5,7} (5 > n/2), tricky = {0,3,6}. 난수는 고정 수열(결정적).
(function (global) {
  "use strict";

  var N = 8;
  var TRUST = { 1: true, 2: true, 4: true, 5: true, 7: true };
  var C = { green: "#2e9e4f", greenL: "#dff3e4", red: "#d6465f", redL: "#fbe3e7", or: "#e09a40", orL: "#fdeec2",
    pur: "#3b2f4a", purL: "#efe9f6", muted: "#777", grey: "#f0f0f0", ink: "#222" };

  var CODE = {
    "1": { title: "Algorithm 1: FindTrustworthyToad1 (HW2 3번)", lines: [
      "while True:",
      "  i = random index in {0, ..., n-1}",
      "  if expert says toad i is trustworthy:    # Θ(1)",
      "    return toad i"
    ] },
    "2": { title: "Algorithm 2: FindTrustworthyToad2 (HW2 3번)", lines: [
      "for 100 iterations:",
      "  i = random index in {0, ..., n-1}",
      "  if expert says toad i is trustworthy:",
      "    return toad i",
      "return toad 0"
    ] },
    "3": { title: "Algorithm 3: FindTrustworthyToad3 (HW2 3번)", lines: [
      "put the toads in a random order           # O(n)",
      "for i = 0, ..., n-1:",
      "  if expert says toad i is trustworthy:",
      "    return toad i"
    ] }
  };

  // 결론 표 값 (vars 와 svg 표에 같이 쓴다)
  var RESULT = {
    "1": { cls: "Las Vegas", exp: "Θ(1)", expNote: "  (E[시도] = 1/p = 8/5 < 2)", worst: "∞ (unbounded)", worstNote: "", prob: "1", probSvg: "1" },
    "2": { cls: "Monte Carlo", exp: "Θ(1)", expNote: "", worst: "Θ(1)", worstNote: "  (최대 100 회)", prob: ">= 1 - (1/2)^100", probSvg: "≥ 1 − (1/2)^100" },
    "3": { cls: "Las Vegas", exp: "Θ(n)", expNote: "  (셔플이 지배; 스캔 기대 < 2)", worst: "Θ(n)", worstNote: "", prob: "1", probSvg: "1" }
  };

  var PICKS = { typical: [3, 6, 4], bad: [0, 3, 6] };
  var PERM = { typical: [3, 1, 6, 2, 0, 4, 5, 7], bad: [0, 3, 6, 1, 2, 4, 5, 7] };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function txt(x, y, s, size, fill, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 12) + '" fill="' + (fill || C.ink) + '" text-anchor="middle"' + (extra || "") + '>' + esc(s) + '</text>';
  }

  function drawBox(x, y, k, st, w, h, sub) {
    var checked = !!st.checked[k], t = !!TRUST[k];
    var fill = checked ? (t ? C.greenL : C.redL) : C.grey;
    var stroke = checked ? (t ? C.green : C.red) : C.muted;
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"/>';
    s += txt(x + w / 2, y + 20, "toad " + k, 13, checked ? stroke : C.muted, ' font-weight="700"');
    s += txt(x + w / 2, y + 38, checked ? (t ? "✓ trustworthy" : "✗ tricky") : "?", 11, checked ? stroke : C.muted);
    if (sub) s += txt(x + w / 2, y - 6, sub, 10, C.muted);
    return s;
  }
  function hl(x, y, w, h, color) {
    return '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="10" fill="none" stroke="' + color + '" stroke-width="3.5"/>';
  }

  function svgFor(alg, st) {
    var H = alg === "3" ? 330 : 260;
    var s = '<svg viewBox="0 0 760 ' + H + '" width="760" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">';
    var W = 74, BH = 46, GAP = 16, X0 = 30;
    function bx(k) { return X0 + k * (W + GAP); }
    s += '<text x="20" y="23" font-size="13" fill="' + C.ink + '" font-weight="700">' + esc(st.label || "") + '</text>';
    s += '<rect x="560" y="6" width="190" height="24" rx="6" fill="' + C.purL + '" stroke="' + C.pur + '"/>';
    s += txt(655, 23, "비용: " + st.cost, 12, C.pur, ' font-weight="700"');

    var Y1 = 62;
    s += '<text x="20" y="' + (Y1 - 12) + '" font-size="11" fill="' + C.muted + '">' +
      esc(alg === "3" ? "원래 toad 0..7 (회색 = 아직 expert 가 확인 안 함)" : "toad 0..7 (회색 = 아직 확인 안 함 · 복원 추출이라 같은 toad 를 또 뽑을 수 있다)") + '</text>';
    for (var k = 0; k < N; k++) {
      s += drawBox(bx(k), Y1, k, st, W, BH);
      if (alg !== "3" && st.cur === k) {
        var wrong = st.ret === k && !TRUST[k];
        s += hl(bx(k), Y1, W, BH, wrong ? C.red : C.or);
        s += txt(bx(k) + W / 2, Y1 + BH + 20, st.ret === k ? (wrong ? "return (확인 안 함!)" : "return") : "i = " + k, 12, wrong ? C.red : C.or, ' font-weight="700"');
      }
    }
    var yNext = Y1 + BH + 46;
    if (alg === "3" && st.perm) {
      var Y2 = Y1 + BH + 50;
      s += '<text x="20" y="' + (Y2 - 22) + '" font-size="11" fill="' + C.or + '" font-weight="700">섞인 순서 (위치 i = 0..7) — 앞에서부터 expert 에게 묻는다</text>';
      for (var p = 0; p < N; p++) {
        s += drawBox(bx(p), Y2, st.perm[p], st, W, BH, "i=" + p);
        if (st.curPos === p) {
          s += hl(bx(p), Y2, W, BH, C.or);
          s += txt(bx(p) + W / 2, Y2 + BH + 20, st.ret >= 0 ? "return" : "▲ 지금", 12, C.or, ' font-weight="700"');
        }
      }
      yNext = Y2 + BH + 46;
    }
    if (st.banner) s += txt(380, yNext, st.banner, 13, st.bannerColor || C.ink, ' font-weight="700"');
    if (st.table) {
      var r = RESULT[alg], ty = yNext + 14, x = 30;
      var cols = [["Algorithm", 90], ["MC / LV", 130], ["Expected", 140], ["Worst-case", 150], ["P(truthful)", 190]];
      var vals = [alg, r.cls, r.exp, r.worst, r.probSvg];
      cols.forEach(function (c, ci) {
        s += '<rect x="' + x + '" y="' + ty + '" width="' + c[1] + '" height="22" fill="' + C.purL + '" stroke="' + C.pur + '"/>';
        s += txt(x + c[1] / 2, ty + 15, c[0], 12, C.pur, ' font-weight="700"');
        var col = ci === 1 ? (r.cls === "Las Vegas" ? C.green : C.red) : C.ink;
        s += '<rect x="' + x + '" y="' + (ty + 22) + '" width="' + c[1] + '" height="24" fill="#fff" stroke="' + C.pur + '"/>';
        s += txt(x + c[1] / 2, ty + 39, vals[ci], 12, col, ' font-weight="700"');
        x += c[1];
      });
    }
    s += '</svg>';
    return s;
  }

  global.SIMS["toad_algorithms"] = {
    title: "toad 세 알고리즘 — Las Vegas 인가 Monte Carlo 인가 (HW2 3번)",
    desc: "HW2 3번. n = 8 마리 중 trustworthy 5 마리(toad 1,2,4,5,7; toad 0·3·6 은 tricky). 세 알고리즘을 고정된 난수열로 돌려 보고 " +
      "'''틀린 답을 낼 수 있는가'''로 [[Las Vegas와 Monte Carlo]] 를 가른다. '불운' 옵션은 적이 주사위까지 고정한 [[randomized worst-case]].",
    options: [
      { key: "alg", label: "알고리즘", values: [
        { value: "1", label: "Algorithm 1 (while true)" },
        { value: "2", label: "Algorithm 2 (100 iterations)" },
        { value: "3", label: "Algorithm 3 (shuffle + scan)" }
      ] },
      { key: "luck", label: "난수", values: [
        { value: "typical", label: "보통 운" },
        { value: "bad", label: "불운 (적이 주사위 고정)" }
      ] }
    ],
    build: function (opts) {
      var alg = CODE[opts.alg] ? opts.alg : "1";
      var luck = opts.luck === "bad" ? "bad" : "typical";
      var code = CODE[alg];
      var steps = [];
      var v = { tries: "-", pick: "-", verdict: "-", calls: 0, ret: "-", cls: "-", exp: "-", worst: "-", prob: "-" };
      var st = { checked: {}, cur: -1, perm: null, curPos: -1, ret: -1, cost: "", label: "", banner: "", bannerColor: null, table: null };
      var shuffleCost = 0;

      function snap() {
        return {
          "n": "8", "trustworthy 수": "5  (> n/2 = 4)", "p": "5/8 = 0.625  (> 1/2)",
          "시도": String(v.tries), "뽑은 i": String(v.pick), "expert 판정": v.verdict,
          "expert 호출 수 (비용)": alg === "3" ? (v.calls + "  (+ 셔플 " + shuffleCost + ")") : String(v.calls),
          "반환값": v.ret, "분류": v.cls, "expected": v.exp, "worst-case": v.worst, "P(truthful)": v.prob
        };
      }
      function push(desc, pc, note) {
        st.cost = alg === "3" ? ("셔플 " + shuffleCost + " + expert " + v.calls) : ("expert " + v.calls + " 회");
        var copy = JSON.parse(JSON.stringify(st));
        var step = { desc: desc, pc: { P: pc }, vars: snap(), svg: svgFor(alg, copy) };
        if (note) step.note = note;
        steps.push(step);
      }
      function conclude() {
        var r = RESULT[alg];
        v.cls = r.cls; v.exp = r.exp + r.expNote; v.worst = r.worst + r.worstNote; v.prob = r.prob;
        st.table = alg;
      }

      if (alg === "1" || alg === "2") {
        var picks = PICKS[luck];
        var lim = alg === "2" ? " / 100" : "";
        st.label = alg === "1" ? "Algorithm 1 — 성공할 때까지 무작위로 뽑기" : "Algorithm 2 — 최대 100 번만 뽑기";
        push(alg === "1"
          ? "`while True` — 무작위 toad 를 뽑아 expert 에게 묻고, trustworthy 면 반환. 한 번 성공 확률 p = 5/8 > 1/2 (매 시도 독립, '''복원 추출''')."
          : "`for 100 iterations` — 같은 시도를 '''최대 100 번'''만. 100 번 다 실패하면 확인하지 않은 `toad 0` 을 반환한다.", 1);
        for (var t = 0; t < picks.length; t++) {
          var k = picks[t];
          v.tries = (t + 1) + lim; v.pick = k; v.verdict = "?"; st.cur = k;
          push("시도 " + (t + 1) + ": 난수 i = " + k + ".", 2);
          v.calls++; st.checked[k] = true;
          v.verdict = TRUST[k] ? "trustworthy" : "tricky";
          if (TRUST[k]) {
            push("expert: toad " + k + " 은 '''trustworthy''' (Θ(1)).", 3);
            v.ret = "toad " + k + "  (trustworthy, 정답)"; st.ret = k;
            push("`return toad " + k + "` — expert 가 '''확인한''' toad 만 반환하므로 정답이다. 시도 " + (t + 1) + " 번 = [[기하분포]]에서 흔한 값 (E = 1/p = 1.6).", 4);
          } else {
            push("expert: toad " + k + " 은 '''tricky''' → 다시 뽑는다. (실패 확률 1 − p = 3/8)", 3);
          }
        }
        if (luck === "typical") {
          conclude();
          st.banner = "보통 운: " + picks.length + " 번째 시도에서 성공 — 기대 시도 1/p = 8/5 < 2";
          st.bannerColor = C.green;
          push(alg === "1"
            ? "결론 — '''Las Vegas''', expected '''Θ(1)''', worst-case '''∞ (unbounded)''', P(truthful) = '''1'''. 시도 횟수는 [[기하분포]]를 따라 E[시도] = 1/p < 2, 시도당 Θ(1) → [[expected running time]] Θ(1). " +
              "확인된 toad 만 반환하므로 절대 틀리지 않는다 → [[Las Vegas와 Monte Carlo|Las Vegas]]. 하지만 '불운' 옵션처럼 tricky 만 계속 뽑을 수 있어 [[randomized worst-case]] 는 상한이 없다."
            : "결론 — '''Monte Carlo''', expected '''Θ(1)''', worst-case '''Θ(1)''', P(truthful) '''≥ 1 − (1/2)^100'''. 이번엔 일찍 성공했지만, 100 번 모두 실패하면 확인 안 된 toad 0 을 반환해 '''틀릴 수 있다''' → [[Las Vegas와 Monte Carlo|Monte Carlo]]. " +
              "반복이 최대 100 회라 [[expected running time]] 과 [[randomized worst-case]] 모두 Θ(1). 실패 확률 (1−p)^100 < (1/2)^100 ([[기하분포]]의 꼬리).", 4);
        } else if (alg === "1") {
          st.cur = -1;
          v.tries = "4, 5, 6, …"; v.pick = "0, 3, 6, 0, …"; v.verdict = "tricky (계속)";
          conclude();
          st.banner = "적이 주사위를 0, 3, 6, 0, 3, 6, … 으로 고정하면 영원히 끝나지 않는다 → worst-case ∞";
          st.bannerColor = C.red;
          push("결론 — '''Las Vegas''', expected '''Θ(1)''', worst-case '''∞ (unbounded)''', P(truthful) = '''1'''. 난수가 계속 tricky 만 고르면 `while True` 가 끝나지 않는다: P(k 번 연속 실패) = (3/8)^k > 0 이므로 어떤 상한도 없다 → [[randomized worst-case]] ∞. " +
            "그래도 반환한다면 확인된 toad 뿐이라 틀린 답은 없다 → [[Las Vegas와 Monte Carlo|Las Vegas]]. 평균적으로는 [[기하분포]] E[시도] = 1/p < 2 → [[expected running time]] Θ(1).", 1,
            "함정: worst-case 를 Θ(n) 으로 쓰면 오답 — 복원 추출이라 같은 tricky toad 를 몇 번이고 다시 뽑을 수 있다. n 번 안에 끝난다는 보장이 없다.");
        } else {
          st.cur = -1;
          v.tries = "4 ~ 100 / 100"; v.pick = "0, 3, 6, 0, … (전부 tricky)"; v.verdict = "tricky"; v.calls = 100;
          st.banner = "… 반복 4~100 도 전부 tricky — 확률 (1−p)^100 < (1/2)^100 ≈ 7.9×10⁻³¹ …";
          st.bannerColor = C.red;
          push("… 반복 4~100 도 전부 tricky (확률 (1−p)^100 < (1/2)^100 ≈ 7.9×10⁻³¹) … 적이 주사위를 고정했다는 가정. for 루프는 100 번에서 '''반드시''' 끝난다.", 3);
          st.banner = "";
          v.pick = "-"; v.verdict = "확인 안 함"; v.ret = "toad 0  (tricky, 틀린 답!)"; st.cur = 0; st.ret = 0;
          push("`return toad 0` — expert 에게 묻지도 않고 반환한다.", 5, "toad 0 은 tricky — 틀린 답. 그래도 반환하므로 Monte Carlo");
          conclude();
          st.banner = "시간은 100 회로 묶였지만, 대가로 틀릴 수 있다";
          st.bannerColor = C.red;
          push("결론 — '''Monte Carlo''', expected '''Θ(1)''', worst-case '''Θ(1)''', P(truthful) '''≥ 1 − (1/2)^100'''. 최대 100 번이므로 [[expected running time]] 과 [[randomized worst-case]] 모두 Θ(1). " +
            "100 번 모두 실패할 확률 (1−p)^100 < (1/2)^100 ([[기하분포]])일 때 확인 안 된 toad 0 을 반환 → '''틀릴 수 있다''' → [[Las Vegas와 Monte Carlo|Monte Carlo]]. toad 0 이 우연히 trustworthy 일 수도 있으므로 확률은 '''하한(≥)'''.", 5,
            "toad 0 은 tricky — 틀린 답. 그래도 반환하므로 Monte Carlo");
        }
      } else {
        var perm = PERM[luck];
        st.label = "Algorithm 3 — 섞고 앞에서부터 차례로 묻기";
        push("Algorithm 3: 먼저 toad 들을 '''무작위 순서로 섞는다''' — 이 단계만으로 O(n) (n = 8).", 1);
        shuffleCost = N; st.perm = perm;
        push("섞인 순서 = [" + perm.join(", ") + "]. 셔플 비용 n = 8 이 '''항상''' 든다.", 1);
        for (var pos = 0; pos < N; pos++) {
          var tk = perm[pos];
          v.tries = pos + 1; v.pick = "위치 " + pos + " → toad " + tk; v.verdict = "?"; st.curPos = pos;
          push("i = " + pos + ": 섞인 순서의 " + pos + " 번째 = toad " + tk + ".", 2);
          v.calls++; st.checked[tk] = true; v.verdict = TRUST[tk] ? "trustworthy" : "tricky";
          if (TRUST[tk]) {
            push("expert: toad " + tk + " 은 '''trustworthy'''.", 3);
            v.ret = "toad " + tk + "  (trustworthy, 정답)"; st.ret = tk;
            push("`return toad " + tk + "` — 확인된 toad 만 반환 → 정답. 스캔은 " + (pos + 1) + " 번만에 끝났다" +
              (luck === "bad" ? " (tricky 3 마리가 전부 앞에 와도 4 번째에 찾음 — tricky < n/2 이므로 항상 n 안에)." : "."), 4);
            break;
          } else {
            push("expert: toad " + tk + " 은 '''tricky''' → 다음 위치로.", 3);
          }
        }
        conclude();
        st.banner = luck === "bad" ? "불운해도 스캔 ≤ n — 셔플 n 이 항상 지배 → worst Θ(n)" : "스캔은 짧아도(기대 < 2) 셔플 O(n) 이 이미 지불됨 → expected Θ(n)";
        st.bannerColor = C.pur;
        push("결론 — '''Las Vegas''', expected '''Θ(n)''', worst-case '''Θ(n)''', P(truthful) = '''1'''. 스캔만 보면 앞에서부터 절반 넘게 정답이라 기대 길이 < 2 ([[기하분포]]와 비슷)지만, " +
          "셔플 O(n) 를 '''항상''' 하므로 [[expected running time]] 도 Θ(n). 최악(tricky 가 전부 앞)에도 n 번 안에 반드시 찾음 → [[randomized worst-case]] Θ(n). 확인된 toad 만 반환 → [[Las Vegas와 Monte Carlo|Las Vegas]], 확률 1.", 4,
          "함정: 스캔이 기대 O(1) 이라고 expected 를 Θ(1) 로 쓰면 오답 — O(n) 셔플이 지배한다.");
      }

      return {
        panels: [{ id: "P", title: code.title, lang: "c", lines: code.lines }],
        vars: [
          { name: "n", group: "설정" },
          { name: "trustworthy 수", group: "설정" },
          { name: "p", label: "p = P(랜덤 toad 가 trustworthy)", group: "설정" },
          { name: "시도", group: "실행" },
          { name: "뽑은 i", group: "실행" },
          { name: "expert 판정", group: "실행" },
          { name: "expert 호출 수 (비용)", group: "실행" },
          { name: "반환값", group: "실행" },
          { name: "분류", label: "분류 (Las Vegas / Monte Carlo)", group: "결론" },
          { name: "expected", group: "결론" },
          { name: "worst-case", group: "결론" },
          { name: "P(truthful)", group: "결론" }
        ],
        steps: steps
      };
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
