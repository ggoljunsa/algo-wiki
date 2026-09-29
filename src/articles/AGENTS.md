<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-29 | Updated: 2026-09-29 -->

# articles

## Purpose
The 191 wiki documents, one `.wiki` file each, that `../../build.py` bundles into `index.html`. Each file is a small header (`key`, `title`, `category`, then `---`) followed by wiki-syntax body. The `key` is the string other articles link with `[[key]]`; the first `category` item becomes the sidebar group. The canonical key list and group names are `../CONTRACT.md` §5; the syntax table is §3; the writing rules are §4.

## Key Files
Files are grouped by sort prefix. Second character runs `0–9` then `A–Z`.

| Prefix | Group (`category` first item) | Count | Contents |
|--------|-------------------------------|-------|----------|
| `00_`–`03_` | `안내` | 4 | `main` (대문), `읽는 순서`, `시험 정보` (date/scope 미정 until announced), `자주 틀리는 함정 모음` |
| `10_`–`1I_` | `1강 Analysis I` | 19 | main `L1 Algorithmic Analysis I` + insertion sort, two questions, loop invariant, induction 4요소 … |
| `20_`–`2J_` | `2강 Analysis II` | 20 | main `L2 …` + runtime, Big-O/Ω/Θ, c와 n₀, proving/disproving O, 증가율 사다리 … |
| `30_`–`3T_` | `3강 D&C I` | 30 | main `L3 …` + mergesort, merge, recursion invariant, T(n), four solving methods, master method, substitution, Karatsuba, inversion … |
| `40_`–`4L_` | `4강 D&C II` | 22 | main `L4 …` + selection, select, pivot, partition, median of medians, 3n/10 논증 … |
| `50_`–`5M_` | `5강 Linear Sorting` | 23 | main `L5 …` + decision tree, Ω(n log n) 하한, counting/bucket/radix sort, stable sort … |
| `60_`–`6N_` | `6강 Randomized I` | 24 | main `L6 …` + Las Vegas/Monte Carlo, 두 시나리오, expected running time, bogosort, randomized quicksort proof, X_{a,b}, randomized select, majority element … |
| `70_`–`7Q_` | `7강 Hashing` | 27 | main `L7 …` + hash table, direct addressing, chaining, 결정론적 해시의 한계, uniformly random hash, universal hash family, h_{a,b} … |
| `E0_`–`E2_` | `시험` | 3 | `HW1 복기`, `계산·증명 문제 모음`, `공식·점화식 모음` |
| `Z0_`–`ZI_` | `용어` | 19 | math tools: 지표 확률변수, 기대값의 선형성, 조화급수, 등비급수, 기하분포, Stirling 근사, 비둘기집 원리, 귀류법, modular arithmetic, floor/ceil, 슬라이스 표기, 의사코드 읽는 법, CLRS, 교수 소개 … |

Main articles (`N0_L# …`) follow the professor's "두 가지 질문" order: ① Does it work? ② Is it fast?

## For AI Agents

### Working In This Directory
- **Before adding an article**, add its key to `../CONTRACT.md` §5 in the right group; `[[links]]` resolve only against keys, and `build.py` reports every broken one. Use the group name letter-for-letter as `category`'s first item.
- Filename is `{정렬번호}_{key}.wiki` with `/` → `_` and no `|`; the header `key:` keeps the original characters (`72_INSERT_DELETE_SEARCH.wiki` has `key: INSERT/DELETE/SEARCH`).
- Body: `== 제목 ==` headings, `'''bold'''`, `$…$` KaTeX for every formula, `{def}` / `{analogy}` / `{exam}` / `{warn}` / `{quiz}` boxes, `<pre class="c">` for pseudocode. Block tags `[[img:…]]`, `[[sim:name]]`, `[[anim:name|caption]]` must sit alone on a line.
- `[[img:L#-NN.png]]` takes the **PNG (PDF page) number**, not the printed slide number; convert with the §1 table (e.g. L6 p.14 → `L6-13.png`, L7 p.41 → `L7-40.png`). Prose cites the printed `p.N`.
- Slides are the authority for terms and values; when 해설 and slide disagree, use the slide value and see the errata list in §1 (L2 p.25 c=15/2, L6 p.14 pivot, L6 p.20 `a=2`, L6 p.66 `mid`, L6 p.75 `count > n/2`). Mark slide typos with `{warn}` rather than silently correcting.
- New recording → update the affected articles' `{exam}` boxes with the professor's exact "remember / important / exam" wording, then rebuild and push.
- Korean prose, English technical terms untranslated, every variable and symbol linked to its dictionary article.

### Testing Requirements
```sh
python3 build.py                       # from ../../ ; broken links 0, missing sims/anims 0, malformed header = exit 1
node src/test_render.js index.html     # no raw markup left after render
```
Then open the article in a browser (`index.html#문서키`) and check phone width per `../../AGENTS.md`.

### Common Patterns
- Dictionary article shape: `== 개요 ==` → `{def}` quoting the slide (with `L# p.N`) → `{analogy}` → code/example with `[[sim:]]` or `[[anim:]]` → `== 시험 포인트 ==` `{exam}` → related links.
- One idea per article; a symbol like `c와 n₀` or `X_{a,b}` gets its own page so every proof can link to it.

## Dependencies

### Internal
- `../renderer.js` (syntax → HTML), `../sims/` and `../anims/` (embedded by name), `../../_slides/` (captures), `../../../정리본/`, `../../../녹음본/`, `../../../문제풀이/HW1_풀이가이드.md` (source content).

<!-- MANUAL: -->
