# 알고위키 제작 계약 (모든 에이전트 필독)

목표: DGIST CSE301 Introduction to Algorithms(Prof. Hoon Sung Chwa, 교재 CLRS *Introduction to Algorithms*) 중간고사 범위(L1 Algorithmic Analysis I, L2 Algorithmic Analysis II, L3 Divide and Conquer I, L4 Divide and Conquer II, L5 Linear-Time Sorting, L6 Randomized Algorithms I, L7 Randomized Algorithms II)를 **나무위키 스타일 단일 HTML 위키**로 만든다.
독자는 수강생 본인(3학년). 해설본(`../정리본/L#_해설.md`)이 "그림이 없고 변수를 까먹어서" 안 읽힌다는 피드백이 출발점 →
**① 그림/캡처/시뮬레이터/움직이는 그림 많이, ② 비유 많이, ③ 모든 변수·기호·용어(`T(n)`, `c`, `n₀`, `a, b, d`, `k`, `X_{a,b}`, `M`, `n`, `p` …)는 [[링크]]로 사전 문서에 연결.**

교수는 영어로 강의한다. 문서는 '''한국어 산문 + 영어 기술 용어 그대로'''("loop invariant", "inductive step", "master method", "pivot", "stable sort", "expected running time", "universal hash family"). 교수가 영어로 쓴 용어를 번역하지 말 것.

이 과목의 특성:
* **의사코드 + 증명 + 점화식**이 본체다. 슬라이드 코드는 Python 풍 의사코드(`def insertion_sort(A):`), 증명은 귀납법, 수행 시간은 점화식 → 닫힌 형태 → 점근 표기.
* **수식이 많다(KaTeX).** 공식·점화식·부등식은 반드시 `$…$` (예: `$T(n) = 2T(n/2) + O(n)$`, `$0 \le T(n) \le c \cdot g(n)$`, `$P(X_{a,b}=1) = \frac{2}{b-a+1}$`).
* 교수의 반복 프레임: 모든 알고리즘에 **"두 가지 질문 — ① Does it (actually) work? ② Is it fast?"** 를 던진다. 메인 문서는 이 두 질문 순서로 짠다. 사전 문서 `두 가지 질문` 이 모든 메인 문서의 첫 링크.
* 증명 레시피는 세 가지뿐이다 — **귀납법 4요소**(inductive hypothesis / base case / inductive step / conclusion), **loop invariant**(iterative 알고리즘, 반복 횟수에 귀납), **recursion invariant**(recursive 알고리즘, 입력 크기에 귀납). 점화식 풀이법은 **4가지**(recursion tree / iteration / master / substitution) — 교수 말: "앞의 둘은 이해용, **master method 와 substitution method 만 기억하면 충분**". 이 7개는 각각 사전 문서로 만들고 모든 증명·점화식 문서가 링크한다.
* 교수의 입버릇: "'''find things that don't change'''"(L1 p.26, invariant 의 출발점), "'''Pretend like we knew it all along'''"(L3 p.115, 치환법 Step 3: profit), "'''You cannot escape the dark side with deterministic hash functions'''"(L7 p.31).

## 1. 파일 배치
```
위키/
├── build.py                 # src/* → index.html (단일 파일), 참조 이미지 복사, 깨진 링크 검사
├── index.html               # 생성물 (직접 편집 금지)
├── images/                  # build.py 가 _slides/ 에서 참조된 것만 복사
├── _slides/                 # 슬라이드 PNG 원본 (git 제외) — L{덱}-{PNG번호}.png
├── _text/                   # 슬라이드 텍스트 (pdftotext -layout, git 제외)
└── src/
    ├── head.html            # <head> + CSS + 레이아웃
    ├── renderer.js          # 위키 문법 → HTML, 네비/검색/목차
    ├── sims/_engine.js      # SimEngine (공용 스텝 실행기)
    ├── sims/*.js            # 시뮬레이터 각 1파일, SIMS["이름"] = {...}
    ├── anims/_anim_engine.js # AnimEngine (움직이는 그림 공용 재생기)
    ├── anims/*.js           # 움직이는 그림 각 1파일, ANIMS["이름"] = {...} (§7)
    └── articles/*.wiki      # 문서 각 1파일
```

### 슬라이드 원본 (덱 번호 ↔ PDF)
`_slides/L{덱}-{PNG번호}.png` — **PNG 번호 = PDF 페이지 번호**, 2자리 0 패딩(`L1-03.png`, `L2-38.png`), 100 이상은 3자리(`L3-104.png`). 한 자리 페이지는 패딩 없는 복사본(`L1-3.png`)도 있어 둘 다 동작한다.
텍스트는 `_text/{PDF 이름}.txt` (페이지 구분 `\f`, n 번째 조각 = PNG n).

'''주의 — 인쇄 번호 ≠ PNG 번호.''' 해설본의 `p.N` 은 **슬라이드에 인쇄된 번호**이고, 교수가 숨긴 슬라이드가 PDF 에서 빠져 있어 뒤쪽 페이지는 PNG 번호가 더 작다. 문서 본문에는 인쇄 번호 `p.N` 을 쓰고, `[[img:]]` 에는 아래 표로 바꾼 **PNG 번호**를 쓴다. 헷갈리면 `_text` 의 해당 조각 마지막 줄(인쇄 번호)이나 PNG 오른쪽 아래 번호를 확인할 것.

| 덱 | PDF (`_text/` 이름) | PNG 수 | 인쇄 p.N → PNG 번호 | 숨김(PDF 에 없음) | 해설본 |
|---|---|---|---|---|---|
| L1 | `L1 _ Algorithmic Analysis I` | 60 | p.1–52 = 같음 · p.57–64 → PNG 53–60 (p−4) | 53–56 | `../정리본/L1_해설.md` |
| L2 | `L2 _ Algorithmic Analysis II` | 38 | p.1–34 = 같음 · p.36–39 → PNG 35–38 (p−1) | 35 | `../정리본/L2_해설.md` |
| L3 | `L3 _ Divide and Conquer I` | 117 | 전부 같음 (p.1–117) | 없음 | `../정리본/L3_해설.md` |
| L4 | `L4 _ Divide and Conquer II` | 115 | p.1–114 = 같음 · p.116 → PNG 115 | 115 | `../정리본/L4_해설.md` |
| L5 | `L5 _ Linear-Time Sorting` | 63 | p.1–4 = 같음 · p.7–65 → PNG 5–63 (p−2) | 5, 6 | `../정리본/L5_해설.md` |
| L6 | `L6 _ Randomized Algorithms I` | 76 | p.1–7 = 같음 · p.9–34 → PNG 8–33 (p−1) · p.36–46 → PNG 34–44 (p−2) · p.48–77 → PNG 45–74 (p−3) · p.79–80 → PNG 75–76 (p−4) | 8, 35, 47, 78 | `../정리본/L6_해설.md` |
| L7 | `L7 _ Randomized Algorithms II` | 78 | p.1–39 = 같음 · p.41–47 → PNG 40–46 (p−1) · p.49–64 → PNG 47–62 (p−2) · p.67–70 → PNG 63–66 (p−4) · p.72–73 → PNG 67–68 (p−5) · p.81–90 → PNG 69–78 (p−12) | 40, 48, 65, 66, 71, 74–80 | `../정리본/L7_해설.md` |

(L6 해설본 머리말의 숨김 목록 "8, 10, 22, 35, 47, 54, 78" 은 부정확하다. 위 표가 `_text` 로 확인한 값이다.)
자주 쓰는 캡처 예: L1 p.10–21 삽입 정렬 예제 = PNG 10–21 · L2 p.11–15 Big-O 그래프 = PNG 11–15 · L3 p.32 mergesort 전체 그림 = `L3-32.png` · L3 p.92–98 eternal struggle = PNG 92–98 · L4 p.84 median of medians 격자 = `L4-84.png` · L5 p.22–34 counting sort = PNG 20–32 · L5 p.53–58 radix sort = PNG 51–56 · L6 p.14 quicksort 분할 = `L6-13.png` · L6 p.80 요약표 = `L6-76.png` · L7 p.28 chaining = `L7-28.png` · L7 p.41 기대 버킷 크기 = `L7-40.png` · L7 p.70 $h_{2,1}$ 예제 = `L7-66.png`.

녹음본(`../녹음본/`): `0903_04_컴알_L3_DivideConquer1.txt`(L3 p.1–74, 9/3 목) · `0908_05_컴알.txt`(L3 p.75–117 후 L4 시작, 9/8 월) · `0910_06_컴알.txt`(L4 전체, 9/10 목) · `0917_08_컴알_L6_Randomized1.txt`(L5 복습 10분 + L6 p.1–42, 9/17 목, GoodNotes 녹음 whisper 전사) · `0922_09_컴알_L6_Randomized1_후반.txt`(L6 p.51–80 majority element, 9/22 화). 클로바노트 영어 ASR 이라 용어가 깨져 있다("medium" = median). **슬라이드가 용어·수치의 권위, 녹음본은 강조·공지의 권위.** 교수가 "remember", "important", "exam", "you should know" 라고 한 대목과 해설본 🎙 섹션의 강조는 `{exam}` 박스로.

기타 자료: HW1(`../문제풀이/HW1.pdf`, 풀이 `../문제풀이/HW1_풀이가이드.md` — 6문제 100점: 1 O/Ω/Θ 표, 2 형식 증명/반증, 3 selection sort loop invariant, 4 세 알고리즘 비교·교차점, 5 inversion 개수 O(n log n), 6 점화식 두 개), 진도표 `../../_진도.md`(HW1 마감 9/18, 9/22 팀 발표). **족보·실제 시험지는 아직 없다.** 시험 날짜·범위는 공지 전이므로 `시험 정보` 문서에 "미정 — 공지되면 갱신"으로 쓴다(추측 금지).

해설본 오류로 확인된 것(문서에서는 슬라이드 값을 쓸 것):
* L2 p.25 Claim I: 해설본은 "c=3, n₀=2 등"이라 했지만 슬라이드 풀이는 **$c = \frac{15}{2}$, $n_0 = 1$** (c=3 도 성립은 하지만 슬라이드 값을 먼저).
* L6 p.14: 해설본은 "피벗 = 리스트 첫 원소 5"라 했지만 슬라이드 배열 `[0 11 7 4 8 3 2 9 6 10 5 1]` 의 첫 원소는 0 이다. 5 는 **골라진(chosen) 피벗**이다.
* L6 p.20 슬라이드 자체 오타: "Master method a = 1, b = 2, d = 1" 은 $T(n)=2T(n/2)+\Theta(n)$ 이므로 **a = 2** 가 맞다 → `{warn}`.
* L6 p.66 슬라이드 majority 분할정복 코드의 `mid = (n-1)/2`, `A[:mid]`, `A[mid+1:]` 는 `A[mid]` 를 빠뜨린다. 의도는 반으로 나누기(`A[:n/2]`, `A[n/2:]`) → 문서·시뮬레이터는 의도대로 쓰고 `{warn}` 으로 지적.
* L6 p.75 랜덤 majority 코드의 `count > n/2+1` 은 정의(⌊n/2⌋+1 번 이상)와 한 칸 어긋난다 → `{warn}` 으로 "정의대로는 `count > n/2`".

## 2. 문서 파일 형식 (`src/articles/{정렬번호}_{key}.wiki`)
```
key: master method
title: Master Method (마스터 정리)
category: 3강 D&C I, 용어
---
(본문. 아래 문법)
```
- `key` = 다른 문서가 `[[key]]` 로 참조하는 문자열. **반드시 §5 의 정식 키 목록을 쓸 것** (새 키가 필요하면 목록 형식대로 §5 에 추가하고 파일도 만들 것).
- `category` 는 쉼표 구분. 첫 항목은 강의(`N강 ...`) 또는 `안내`/`시험`/`용어`. 첫 항목이 사이드바 그룹이 된다 — **아래 §5 의 그룹명을 글자 그대로** 쓸 것.
- 파일명 정렬번호: `00` 안내, `10` 1강(L1), `20` 2강(L2), `30` 3강(L3), `40` 4강(L4), `50` 5강(L5), `60` 6강(L6), `70` 7강(L7), `E0` 시험(HW1 복기 등), `Z0` 기타 용어(수학 도구). 정렬번호 뒤 두 번째 자리는 `0-9, A-Z` 로 이어간다(`10_`, `11_`, … `1A_`, `1B_`; 30개를 넘으면 `3Z_` 다음은 `3a_`, `3b_` … 소문자). 파일명에 `/` 는 `_` 로, `|` 는 쓰지 말 것(키는 헤더에 원래대로). 예: `72_INSERT_DELETE_SEARCH.wiki` (key `INSERT/DELETE/SEARCH`), `4G_3n_10 논증.wiki` (key `3n/10 논증`).

## 3. 위키 문법 (renderer.js 가 지원)
| 문법 | 결과 |
|---|---|
| `== 제목 ==`, `=== 소제목 ===`, `==== 소소제목 ====` | h2/h3/h4 (자동 목차) |
| `'''굵게'''`, `''기울임''`, `` `code` `` | 인라인 |
| `* 항목` / `# 번호항목` | ul / ol (한 줄 = 한 항목, 중첩 없음) |
| `[[키]]`, `[[키|표시문구]]` | 위키 링크 (없는 키는 회색 stub 표시 → 반드시 있는 키만). 표시 문구가 없으면 '''key 그대로''' 보이고 문서 제목은 툴팁(title 속성)으로 — 제목이 길어 문장이 깨지지 않게 (2026-09-25 리뷰 반영) |
| `[[img:L3-32.png|캡션|small/medium/large]]` | 슬라이드 캡처 (한 줄에 단독으로). 파일명은 §1 의 **PNG 번호** |
| `[[sim:master_method]]` | 시뮬레이터 삽입 (한 줄에 단독으로) |
| `[[anim:master_struggle|캡션]]` | 움직이는 그림 삽입 (한 줄에 단독으로, 캡션 선택). §7 |
| `{info}…{/info}` `{warn}…{/warn}` `{tip}…{/tip}` `{joke}…{/joke}` | 참고/주의/팁/여담 박스 |
| `{analogy}…{/analogy}` | 🎭 비유 박스 (문서마다 1개 이상) |
| `{def}…{/def}` | 📖 정의 박스 (정의→용어 문제 대비, 슬라이드 원문 영어 정의 + 한국어) |
| `{quiz}…{/quiz}` | ❓ 예상문제 박스 |
| `{answer}…{/answer}` | 접힌 정답 (클릭해서 펼침) — quiz 바로 뒤에 |
| `{exam}…{/exam}` | 🎯 출제 포인트 박스 (교수가 녹음본에서 강조 / HW1 에 나온 것 / 해설본 ⭐⭐⭐) |
| 박스는 여러 줄 가능 (`{info}` 로 시작해 `{/info}` 로 끝나는 줄까지) | |
| `<pre class="txt">` … `</pre>` | 코드/계산 블록 (class: c / asm / ascii / sh / txt). ascii 는 밝은 배경 (ASCII 그림용) |
| ↑ 중 `txt` / `ascii` 블록 안에서만 | `'''굵게'''` 와 `[[키]]` / `[[키\|표시]]` 가 추가로 처리된다. `c` / `asm` / `sh` / 클래스 없는 `<pre>` 는 완전히 raw |
| `{|` / `! 헤더 || 헤더` / `|-` / `| 셀 || 셀` / `|}` | 표 |
| `$…$` | KaTeX 인라인 수식 — **이 과목은 수식이 많다. 공식·점화식은 반드시 `$…$` 로** (`$T(n) = aT(n/b) + O(n^d)$`, `$\Theta(n \log n)$`). 한 줄 전체 수식은 `$$…$$` (display) 도 된다 |
| `----` | 수평선 |

주의: 코드 블록 안에서는 문법 처리 안 함(수식도 안 됨 → `<pre>` 안에서는 `T(n) <= 2T(n/2) + cn` 처럼 평문으로). 표 셀 안에서는 인라인 문법만. 표 셀 안에서 `|` 가 필요하면 `\|`. KaTeX 안에서 `|` 도 표 셀 밖에서만 쓸 것(절댓값·집합 크기 `|H|` 는 표 안에서 `\lvert H \rvert`). `[[키|표시문구]]` 의 표시문구에 `$…$` 를 넣지 말 것 — 수식은 링크 바로 뒤에 따로 쓴다(`[[Big-O]] $O(n^2)$`).
계산·증명 과정은 `<pre class="txt">` 블록에 한 줄에 한 단계씩 쓴다(손으로 푸는 순서 그대로).

## 4. 문서 작성 규칙
1. **한국어 산문 + 영어 기술용어 그대로.** 교수가 영어로 쓴 용어(loop invariant, inductive hypothesis, base case, recurrence relation, pivot, sub-median, decision tree, stable sort, expected running time, adversary, chaining, universal hash family …)를 번역하지 말 것. 한국어 병기는 첫 등장 시 괄호로만.
2. 나무위키 톤: 개요 → 본문(슬라이드 순서) → 관련 문서. 잡담/여담(`{joke}`) 허용, 그러나 사실은 슬라이드·CLRS 기준으로 정확히. **슬라이드 수치(예제 배열, 상수 c·n₀·C, 페이지 번호)를 그대로** 쓴다. §1 의 "해설본 오류" 목록을 반영할 것.
3. **슬라이드에 예제(배열 실행 추적, 점화식 풀이, 증명)가 있으면 단계별로 재현**하고, 단계가 여럿이면 `[[sim:]]` 을 바로 아래에 둔다. 공식은 `$…$`, 각 기호는 첫 등장 시 [[링크]] (`[[c와 n₀|c]]`, `[[master method 매개변수|a, b, d]]`, `[[T(n)]]`, `[[X_{a,b}]]`, `[[M과 n|M]]`).
4. **모든 용어/기호/알고리즘/정리는 첫 등장 시 [[링크]]**: `[[loop invariant]]`, `[[Big-O]]`, `[[mergesort]]`, `[[master method]]`, `[[pivot]]`, `[[stable sort]]`, `[[기대값의 선형성]]`, `[[universal hash family]]`.
5. 문서마다 최소 `{analogy}` 1개, 시각자료([[img:]] 또는 [[sim:]] 또는 [[anim:]] 또는 ascii 그림 또는 표) 1개 이상. **메인 문서는 실제 슬라이드 캡처 3장 이상 + 움직이는 그림 1개 이상 + (§6 에 해당 시뮬레이터가 있으면) 시뮬레이터**. 용어 문서도 관련 슬라이드에 그림·표·수식·코드가 있으면 캡처 1장을 넣는다.
6. 캡처 고르는 기준: 그림/표/코드/배열 그림/그래프가 있는 슬라이드. **`_slides/L*.png` 를 Read 로 직접 보고 고른다.** 애니메이션용으로 거의 같은 슬라이드가 연달아 있으면 **마지막(완성된) 장**을 고른다. 글자만 있는 슬라이드(섹션 표지, Outline)는 캡처 대신 본문으로.
7. 각 메인 문서 끝에 `== 시험 대비 핵심 요약 ==` 번호 목록, `== 관련 문서 ==` 링크 목록. 수식·점화식이 있는 메인 문서(L2–L7 전부)는 `== 공식 모음 ==` 표도 추가(알고리즘 | worst-case | expected/best | 점화식).
8. 용어 사전 문서는 짧아도 됨 (정의 박스 + "이름에서 개념 끌어내기" + 어디서 쓰이는지(몇 강 p.몇) + 관련 링크 2~3개). 그러나 stub 이 아니라 실제 내용.
9. 해설본(`../정리본/*.md`)의 ⭐ 표시와 "시험 대비 핵심 요약", 🎙 실제 수업 기록을 재활용할 것. ⭐⭐⭐ 항목과 🎙 강조는 `{exam}` 박스로.
10. **HW1 연결**: `../문제풀이/HW1_풀이가이드.md` 의 6문제를 해당 문서에 `{quiz}`(문제 원문 요지) + `{answer}`(풀이 요지, 풀이가이드의 ✍️ 답안 기준)로 싣는다. 배치: 1번 → `Big-Θ`·`증가율 사다리` / 2번 → `O임을 증명하기`·`O가 아님을 증명하기`·`log(n!)` / 3번 → `selection sort`·`loop invariant` / 4번 → `교차점 계산`·`asymptotic analysis` / 5번 → `inversion`·`merge` / 6번 → `master method 세 케이스`(6-a)·`substitution method`(6-b). 전체 복기는 `HW1 복기` 문서에.
11. 사전 문서끼리 서로 링크: 예 `[[Big-O]]` ↔ `[[Big-Ω]]` ↔ `[[Big-Θ]]` ↔ `[[c와 n₀]]`, `[[master method]]` ↔ `[[substitution method]]` ↔ `[[master method의 한계]]`, `[[counting sort]]` ↔ `[[bucket sort]]` ↔ `[[radix sort]]` ↔ `[[stable sort]]`, `[[지표 확률변수]]` ↔ `[[기대값의 선형성]]` ↔ `[[X_{a,b}]]` ↔ `[[기대 버킷 크기]]`.
12. **문서 하나를 완성할 때마다 즉시 Write.** 여러 개를 모아 두지 말 것.
13. **의사코드는 `<pre class="c">` 로 슬라이드 그대로** 옮긴다(들여쓰기·변수명 `cur_value`, `l_idx`, `partition_about_pivot`, `num_buckets` 그대로, 주석만 한국어로 덧붙여도 됨). 변수는 코드 아래 표(변수 | 뜻 | 예제에서의 값)로 풀어 준다 — "변수를 까먹는" 문제의 직접 처방.
14. **증명은 4단 구조를 눈에 보이게.** `=== Inductive hypothesis ===` / `=== Base case ===` / `=== Inductive step ===` / `=== Conclusion ===` 소제목, 또는 `<pre class="txt">` 안에 `'''Inductive hypothesis:'''` … 네 줄 머리. loop invariant 증명이면 CLRS 대응(Initialization / Maintenance / Termination)을 한 줄 덧붙인다.
15. **점화식 풀이는 단계별 `<pre class="txt">`** (한 줄 = 한 등호/부등호) + 바로 아래 해당 `[[sim:]]`(`recursion_tree_sum`, `master_method`, `substitution_method`). master method 를 쓸 때는 항상 "a = ?, b = ?, d = ?, $b^d$ = ? → 케이스" 네 칸을 적는다.
16. **사전 문서의 `{def}` 는 슬라이드 영어 원문 정의가 먼저**, 그 아래 한국어. (예: Big-O — "T(n) = O(g(n)) iff ∃ c, n₀ > 0 s.t. ∀ n ≥ n₀, 0 ≤ T(n) ≤ c·g(n)")
17. 손코딩 대비: 알고리즘 문서(`insertion sort`, `merge`, `select`, `counting sort`, `radix sort`, `randomized quicksort`, `분할정복 majority`, `h_{a,b}`)에는 **코드 빈칸 `{quiz}`** 를 하나씩 둔다(예: `return select(right, ____, c)` → `k - len(left) - 1`).

## 5. 정식 문서 키 목록 (링크는 이 키로만)
그룹명(= category 첫 항목)을 괄호 안에 적었다. 정렬번호 접두는 `[ ]`. **키는 백틱 안의 문자열 그대로**(키 안에 `·`, `,`, `/`, `{}` 가 들어갈 수 있으므로 구분자 ` · ` 가 아니라 백틱이 경계다).

### 안내 (`안내`) [00_–03_]
`main`(대문) · `읽는 순서` · `시험 정보` · `자주 틀리는 함정 모음`

### 시험 (`시험`) [E0_–E2_]
`HW1 복기` · `계산·증명 문제 모음` · `공식·점화식 모음`

### 1강 L1 Algorithmic Analysis I (`1강 Analysis I`) [10_–]
**메인**: `L1 Algorithmic Analysis I`
**사전**: `알고리즘` · `두 가지 질문` · `정렬 문제` · `distinct 가정` · `insertion sort` · `삽입 한 번의 성질` · `correctness` · `invariant` · `loop invariant` · `iterative algorithm` · `귀납법` · `귀납법 4요소` · `inductive hypothesis` · `base case` · `inductive step` · `귀납법의 결론` · `Initialization/Maintenance/Termination` · `selection sort`

### 2강 L2 Algorithmic Analysis II (`2강 Analysis II`) [20_–]
**메인**: `L2 Algorithmic Analysis II`
**사전**: `runtime` · `worst-case와 best-case` · `average-case` · `asymptotic analysis` · `상수와 저차항 무시` · `Big-O` · `Big-Ω` · `Big-Θ` · `upper bound와 lower bound` · `tight bound` · `c와 n₀` · `O임을 증명하기` · `O가 아님을 증명하기` · `max{c, n₀}+1 트릭` · `L2 연습 Claim` · `삽입 정렬의 worst-case` · `삽입 정렬의 best-case` · `증가율 사다리` · `교차점 계산`

### 3강 L3 Divide and Conquer I (`3강 D&C I`) [30_–]
**메인**: `L3 Divide and Conquer I`
**사전**: `divide and conquer` · `incremental approach와 parallel approach` · `mergesort` · `merge` · `merge의 loop invariant` · `recursive algorithm` · `recursion invariant` · `입력 크기에 대한 귀납법` · `강한 귀납법` · `증명 레시피` · `반복 vs 재귀 증명 표` · `T(n)` · `점화식` · `closed-form` · `점화식 단순화 3단계` · `2의 거듭제곱 가정` · `점화식 풀이 4가지` · `recursion tree method` · `iteration method` · `master method` · `master method 매개변수` · `master method 세 케이스` · `eternal struggle` · `bushy tree와 tall and skinny tree` · `master method의 한계` · `substitution method` · `미정 상수 C` · `Karatsuba 곱셈` · `inversion`

### 4강 L4 Divide and Conquer II (`4강 D&C II`) [40_–]
**메인**: `L4 Divide and Conquer II`
**사전**: `selection 문제` · `select` · `naive_select` · `MIN과 MAX` · `median` · `pivot` · `partition_about_pivot` · `한쪽만 재귀` · `k-len(left)-1 보정` · `select의 정확성 증명` · `select의 점화식` · `피벗 시나리오 3종` · `닭과 달걀 문제` · `median of medians` · `sub-median` · `5개씩 그룹` · `3n/10 논증` · `T(n/5) + T(7n/10) + O(n)` · `부분 문제 크기의 합` · `linear-time selection` · `두 종류의 worst-case`

### 5강 L5 Linear-Time Sorting (`5강 Linear Sorting`) [50_–]
**메인**: `L5 Linear-Time Sorting`
**사전**: `comparison-based sorting` · `genie 비유` · `deterministic algorithm` · `decision tree` · `리프와 깊이` · `Ω(n log n) 하한` · `log(n!)` · `linear-time sorting` · `counting sort` · `counts 배열` · `Θ(n+k)` · `bucket sort` · `get_bucket` · `num_buckets와 k` · `bucket sort의 최악 케이스` · `stable sort` · `radix sort` · `least-significant digit` · `make_pairs` · `Θ(d(n+k))` · `in-place` · `비교 기반 정렬을 여전히 쓰는 이유`

### 6강 L6 Randomized Algorithms I (`6강 Randomized I`) [60_–]
**메인**: `L6 Randomized Algorithms I`
**사전**: `randomized algorithm` · `Las Vegas와 Monte Carlo` · `Karger's algorithm` · `adversary` · `두 시나리오` · `expected running time` · `randomized worst-case` · `random variable` · `bogosort` · `quicksort` · `quicksort의 좋은 경우와 나쁜 경우` · `randomized quicksort` · `비교 횟수 세기` · `X_{a,b}` · `P(X_{a,b}=1)` · `quicksort 기대 비교 횟수 증명` · `in-place partition` · `QuickSort vs MergeSort` · `randomized select` · `majority element` · `equals` · `분할정복 majority` · `랜덤 majority`

### 7강 L7 Randomized Algorithms II (`7강 Hashing`) [70_–]
**메인**: `L7 Randomized Algorithms II`
**사전**: `hash table` · `자료구조 비교표` · `INSERT/DELETE/SEARCH` · `direct addressing` · `버킷` · `universe U` · `M과 n` · `hash function` · `chaining` · `linked list` · `open addressing` · `좋은 해시 함수의 조건` · `hash collision` · `결정론적 해시 함수의 한계` · `해싱 게임` · `uniformly random hash function` · `기대 버킷 크기` · `load factor` · `log(s) 비트` · `hash family` · `universal hash family` · `h_{a,b}` · `소수 p` · `H의 크기` · `해시 테이블 공간 복잡도` · `Python dict와 해시 테이블`

### 기타 용어 (`용어`) [Z0_–]
`지표 확률변수` · `기대값의 선형성` · `확률과 기댓값` · `조화급수` · `등비급수` · `기하분포` · `로그 계산법` · `합 공식` · `Stirling 근사` · `순열과 n!` · `비둘기집 원리` · `귀류법` · `modular arithmetic` · `floor와 ceil` · `이진 트리` · `슬라이스 표기` · `의사코드 읽는 법` · `CLRS` · `교수 소개`

(총 191 문서 = 안내 4 + 시험 3 + 메인 7 + 사전 177. 사전 문서가 메인의 10배 이상인 것이 정상이다.)

### 키별 메모 (헷갈리기 쉬운 것 — 쓰는 사람이 이 범위를 지킬 것)
* `두 가지 질문` = "Does it work? / Is it fast?" 프레임(L1 p.8–9, 이후 모든 강의). `두 시나리오` = L6 p.5 의 Scenario 1(적이 입력만) / Scenario 2(적이 randomness 까지) — 이름이 비슷하니 서로 링크만 하고 섞지 말 것. `두 종류의 worst-case` = L4 p.24·0910 녹음 "입력이 정하는 worst-case(삽입 정렬) vs 입력+난수가 정하는 worst-case(랜덤 피벗 select)" — `randomized worst-case` 와 링크.
* `worst-case와 best-case` 는 개념(L2 p.3), `삽입 정렬의 worst-case`/`삽입 정렬의 best-case` 는 구체 입력(역순 → $O(n^2)$, 정렬됨 → $\Omega(n)$, L2 p.28–38).
* `c와 n₀` = Big-O/Ω 정의의 두 상수. `미정 상수 C` = 치환법에서 귀납 가설 $T(k) \le Ck$ 의 C(L3 p.114 C=10, L4 p.103 C=max{7,10d}, HW1 6-b C=8). 대소문자 구분해서 설명.
* `master method 매개변수` = a(부분 문제 수), b(크기 축소 비율), d(분할·병합 일 $n^d$). `master method 세 케이스` = $a = b^d$ / $a < b^d$ / $a > b^d$ 와 결과. `eternal struggle` = 세 케이스의 직관(L3 p.92–98, "branching vs shrinking").
* `M과 n` (L7): M = |U| (universe 크기, 엄청 큼), n = 등장하는 키 수 = 버킷 수. L1–L6 의 n(입력 크기)과 다르다는 것을 문서 첫 줄에 적을 것.
* `load factor` 는 슬라이드에 없다(CLRS 11.2 의 $\alpha = n/m$). 슬라이드 설정에서는 키 n 개·버킷 n 개라 $\alpha = 1$ 이라는 연결만 짧게, `{info}` 로 "슬라이드 밖 CLRS 용어" 표시.
* `inversion` = HW1 5번(역전 쌍 수, mergesort 에 카운터). `selection sort` = HW1 3번. `교차점 계산` = HW1 4번(128n vs 2n log₂n vs 0.125n²: 교차점 n=1024, n=2⁶⁴, n≈108).
* `Karger's algorithm` 은 L6 p.4 에서 "Monte Carlo 예, 나중에" 로만 언급 — 짧게.
* `교수 소개`: Hoon Sung Chwa, DGIST. 강의 관련 사실만(영어 강의, 출석 체크, HW1 팀 발표 방식). 모르는 경력은 쓰지 말 것.

## 6. 시뮬레이터 (src/sims/*.js)
### 이름 (문서에서 `[[sim:이름]]`)
기대 최종값은 모두 `_text` / `_slides` 의 실제 슬라이드 값에서 가져왔다(열 "출처"의 p.N 은 인쇄 번호, 괄호 안은 PNG). 작성자는 build 결과가 이 값과 일치하는지 반드시 확인할 것.
"문서" 열(§7 목록도 같음)은 그 sim/anim 을 `[[sim:]]`/`[[anim:]]` 로 **반드시 싣는** 문서의 §5 키다(백틱이 키 경계 — `h_{a,b}` 처럼 쉼표가 든 키가 있다). 해당 문서 담당자가 넣는다.

| 이름 | 내용 (옵션) | 기대 최종값 | 출처 | 문서 |
|---|---|---|---|---|
| insertion_sort_trace | 삽입 정렬 한 줄씩: 패널 = 슬라이드 코드 8줄, vars = i, cur_value, j, A, shift 횟수. svg 로 배열 칸(정렬된 앞부분 음영, cur_value 는 위로 들림). 옵션 입력 = 슬라이드 [4,3,1,5,2] / 역순 [5,4,3,2,1] (worst) / 정렬됨 [1,2,3,4,5] (best) | 슬라이드: i=1→[3,4,1,5,2], i=2→[1,3,4,5,2], i=3→[1,3,4,5,2](이동 없음), i=4→[1,2,3,4,5], shift 총 6 · 역순: shift 10 = n(n−1)/2 · 정렬됨: shift 0 | L1 p.10–21 (PNG 10–21) | `insertion sort`, `L1 Algorithmic Analysis I`, `삽입 정렬의 worst-case`, `삽입 정렬의 best-case` |
| loop_invariant_check | 외부 루프 반복마다 invariant 를 검사하고 Base/Step/Conclusion 중 어느 단계인지 표시 (옵션 알고리즘 = insertion sort: "A[:i+1] is sorted" / selection sort(HW1 3번): "A[:i] sorted ∧ A[:i] ≤ A[i:]") 입력 [4,3,1,5,2] | insertion: 매 반복 invariant 참, 종료 i=n−1 에서 A[:n]=[1,2,3,4,5] · selection: i=0→[1,3,4,5,2], i=1→[1,2,4,5,3], i=2→[1,2,3,5,4], i=3→[1,2,3,4,5] | L1 p.44–52, HW1 3번 | `loop invariant`, `귀납법 4요소`, `Initialization/Maintenance/Termination`, `selection sort` |
| bigo_witness | Big-O/Θ 증명에서 c, n₀ 를 고르고 n = n₀, n₀+1, … 에서 부등식 확인; 반증은 n = max{c,n₀}+1 로 모순 (옵션 = p.17 n=O(n log n) / p.18–20 n²≠O(n), c=5·n₀=3 가정 / p.25 Claim I / p.26 Claim II) | p.17: c=1, n₀=2 성립 · 반증: n=max{5,3}+1=6 → 36 > 30 모순 · Claim I: $c=\frac{15}{2}$, $n_0=1$ ($\frac32 n^2+\frac52 n-3 < \frac{15}{2}n^2$) · Claim II: $c_1=\frac{1}{14}$, $c_2=\frac12$, $n_0=7$ | L2 p.17–20, 25–26 | `Big-O`, `Big-Θ`, `c와 n₀`, `O임을 증명하기`, `O가 아님을 증명하기`, `max{c, n₀}+1 트릭`, `L2 연습 Claim` |
| mergesort_tree | mergesort 재귀 호출 트리: 내려가며 반으로 쪼개고(Recurse!) 올라오며 merge(Merge!). svg 트리, 현재 호출 강조 (옵션 입력 = 슬라이드 [8,4,1,5,3,2,6,7] / [5,2,4,7,1,3,2,6]) | 슬라이드: 깊이 3 (log₂8), merge 7 회, 비교 총 16 회, 결과 [1,2,3,4,5,6,7,8]; 중간 [4,8],[1,5],[2,3],[6,7] → [1,4,5,8],[2,3,6,7] | L3 p.9–12, 25–32 | `mergesort`, `divide and conquer`, `L3 Divide and Conquer I`, `recursion invariant` |
| merge_step | merge 한 번을 포인터 l_idx, r_idx 로 한 줄씩 (패널 = 슬라이드 merge 코드). 옵션 모드 = merge / merge + inversion 카운트(HW1 5번: R 쪽을 뽑을 때 len(L)−l_idx 더하기) | L=[1,4,5,8], R=[2,3,6,7] → result [1,2,3,4,5,6,7,8], 비교 7 회, 남은 [8] extend · inversion 모드: cross 역전 8 (+3,+3,+1,+1); 전체 [8,4,1,5,3,2,6,7] 의 inversion 은 13 | L3 p.12, 18–24; HW1 5번 | `merge`, `merge의 loop invariant`, `inversion`, `mergesort` |
| recursion_tree_sum | 재귀 트리 레벨별 노드 비용과 레벨 합을 채워 가며 총합 (옵션 점화식 = 2T(n/2)+n / 4T(n/2)+n (bushy) / T(n/2)+n (tall and skinny); 옵션 방법 = recursion tree / iteration(2ᵏT(n/2ᵏ)+kcn 전개); n = 8, c = 1, T(1)=1) | 2T(n/2)+n: 레벨 합 8,8,8 + 리프 8 = 32 = n log₂n + n · 4T(n/2)+n: 8,16,32 + 리프 64 = 120 (리프 지배) · T(n/2)+n: 8,4,2,1 = 15 (루트 지배) · iteration: k = log₂8 = 3 에서 8T(1)+3·8 = 32 | L3 p.66–84 | `recursion tree method`, `iteration method`, `T(n)`, `eternal struggle`, `bushy tree와 tall and skinny tree` |
| master_method | a, b, d 입력 → $b^d$ 계산 → 케이스 판정 → 결과 (옵션 예제 = mergesort 2,2,1 / p.87 곱셈 4,2,1 / Karatsuba 3,2,1 / 2T(n/2)+O(n²) 2,2,2 / select 이상적 1,2,1 / select 합리적 1,10/7,1 / HW1 6-a 7,2,3 / 수업 연습 a=1·2·4, b=2, d=1) | mergesort: 2=2 → $O(n\log n)$ · 4>2 → $O(n^2)$ · 3>2 → $O(n^{\log_2 3}) \approx O(n^{1.585})$ · 2<4 → $O(n^2)$ · 1<2 → $O(n)$ · 1<10/7 → $O(n)$ · 7<8 → $O(n^3)$ · 수업 연습 a=1 → O(n), a=2 → O(n log n), a=4 → O(n²) | L3 p.86–91, L4 p.49–65, HW1 6-a | `master method`, `master method 세 케이스`, `master method 매개변수`, `Karatsuba 곱셈`, `공식·점화식 모음` |
| substitution_method | 치환법 3단계: guess → IH $T(k)\le Ck$ 대입 → 부등식에서 C 조건 추출 → C 확정 → "Pretend we knew C" (옵션 = L3 워밍업 2T(n/2)+n / L3 3n+T(n/5)+T(n/2) / L4 T(n/5)+T(7n/10)+dn / HW1 6-b T(n/2)+T(n/4)+T(n/8)+n) | 워밍업: $T(n) \le n(\log n + 1)$ · L3: $(3 + \frac{7C}{10})n \le Cn$ → C ≥ 10, base C ≥ 10 → **C = 10** · L4: base C ≥ 7 (log 100 ≈ 6.6), step $\frac{9C}{10}n + dn \le Cn$ → C ≥ 10d → **C = max{7, 10d}** · HW1 6-b: $\frac{7C}{8}n + n \le Cn$ → **C = 8** | L3 p.108–116, L4 p.101–104, HW1 6-b | `substitution method`, `미정 상수 C`, `T(n/5) + T(7n/10) + O(n)`, `부분 문제 크기의 합`, `master method의 한계` |
| select_partition | select(A,k) 재귀: pivot 선택 → partition_about_pivot → len(left) 와 k 비교 → 한쪽만 재귀(오른쪽이면 k-len(left)-1). svg 로 left│pivot│right, 버린 쪽 회색 (옵션 피벗 = 슬라이드 순서 36→1→9 / 불운(매번 최댓값) / (참고) 매번 진짜 median) A=[1,64,9,49,16,4,0,25,36,81], k=3 | 슬라이드: 36 → left 6개 > 3 → 왼쪽; 1 → left [0] 1개 < 3 → 오른쪽 [9,16,4,25], k=3−1−1=1; 9 → left [4] 1개 == 1 → **답 9**; partition 비용 10+6+4 = 20 · 불운: 81,64,49,36,25,16,9 순, 비용 10+9+8+7+6+5+4 = 49 · 정렬 확인: sorted = [0,1,4,9,16,25,36,49,64,81], index 3 = 9 | L4 p.6, 9–15, 16–24 | `select`, `pivot`, `partition_about_pivot`, `한쪽만 재귀`, `k-len(left)-1 보정`, `L4 Divide and Conquer II` |
| median_of_medians | 5개씩 그룹 → 그룹별 sub-median → sub-median 들의 median(재귀 select) → 그 값으로 partition, 3n/10 보장 개수 계산. svg 5열 격자 | A(23개) = [2,11,9,3,13, 5,16,4,6,12, 17,23,10,7,21, 8,18,15,1,20, 22,19,14] → g = ⌈23/5⌉ = 5, sub-medians [9,6,17,15,19] → **median of medians = 15** (실제 median 12) → len(left)=14, len(right)=8; 보장 개수 3(⌈g/2⌉−2)+2 = 5, 범위 3n/10−4 = 2.9 ≤ 8, 14 ≤ 7n/10+3 = 19.1 | L4 p.76–84, 85–93 | `median of medians`, `sub-median`, `5개씩 그룹`, `3n/10 논증` |
| counting_sort | counts 배열 채우기(값을 인덱스로) → result 에 counts[i] 개씩 extend. svg 로 A 와 counts 막대 | A=[0,0,3,1,1,3,1,0], k=4 → counts = [3,3,0,2] → result [0,0,0,1,1,1,3,3]; 단계 수 n + k = 8 + 4 = 12, 원소끼리 비교 0 회 | L5 p.17–34 (PNG 15–32) | `counting sort`, `counts 배열`, `Θ(n+k)`, `linear-time sorting` |
| bucket_sort | get_bucket(value) = value / ⌈k/num_buckets⌉ 로 버킷에 담고, num_buckets < k 면 버킷별 stable_sort 후 이어붙이기 (옵션 = p.45 k=30, 10 버킷 / p.46 극단 k=3000, 10 버킷) | p.45: A=[17,13,16,12,15,1,28,0,27] → 0-2:[1,0], 12-14:[13,12], 15-17:[17,16,15], 27-29:[28,27] → 결과 [0,1,12,13,15,16,17,27,28] · p.46: [380,370,340,320,410] 전부 300-599 한 버킷 → 사실상 전체를 stable_sort (worst Θ(n log n)) | L5 p.35–46 (PNG 33–44) | `bucket sort`, `get_bucket`, `num_buckets와 k`, `bucket sort의 최악 케이스`, `stable sort` |
| radix_sort | 자리 i = 0,1,2 마다 make_pairs → 그 자릿값으로 안정 bucket sort. svg 로 현재 자리 강조, 같은 자릿값 원소의 순서 유지 표시 | A=[31,5,210,14,95,477,555,125], radix_sort(A,3,10): i=0 → [210,031,014,005,095,555,125,477] · i=1 → [005,210,014,125,031,555,477,095] · i=2 → **[005,014,031,095,125,210,477,555]**; 비용 d(n+k) = 3(8+10) = 54 | L5 p.47–58 (PNG 45–56) | `radix sort`, `least-significant digit`, `make_pairs`, `stable sort`, `Θ(d(n+k))` |
| randomized_quicksort | quicksort 재귀: 피벗 선택 → partition → 양쪽 재귀, 비교 횟수 누적 + X_{a,b}=1 인 쌍 기록 (옵션 피벗 = 슬라이드(첫 호출 5, 이후 부분리스트 첫 원소) / 항상 첫 원소 / 매번 median / 정렬 입력 [0..11] + 첫 원소(worst)) A=[0,11,7,4,8,3,2,9,6,10,5,1] | 첫 분할: [0,4,3,2,1] 5 [11,7,8,9,6,10], X_{3,5}=1, X_{4,6}=0 · 비교 총: 슬라이드 33 / 첫 원소 42 / median 25 / 정렬+첫 원소 66 = n(n−1)/2 · 기대값 $\sum 2/(b-a+1)$ (n=12) ≈ 32.68 | L6 p.11–17 (PNG 10–16), 23–29, 32–41 | `randomized quicksort`, `quicksort`, `X_{a,b}`, `P(X_{a,b}=1)`, `비교 횟수 세기`, `quicksort 기대 비교 횟수 증명` |
| geometric_expectation | 성공 확률 p 인 시행을 성공할 때까지 반복할 때 기대 시행 1/p, 한 번 비용 × 기대 시행 = 기대 비용. 표로 i 번째 시행까지 갈 확률 $(1-p)^{i-1}p$ 누적 (옵션 = bogosort n=3 / n=4 / n=5 / 랜덤 majority p=1/2) | bogosort: p = 1/n! → 기대 셔플 6 / 24 / 120, 기대 비용 n·n! = 18 / 96 / 600 · majority: p ≥ 1/2 → $E[\#iter] \le \sum (1/2)^i = 2$, $E[\#checks] \le 2n$ | L6 p.6–9, 73–77 (PNG 6–8, 70–74) | `bogosort`, `랜덤 majority`, `기하분포`, `등비급수`, `expected running time` |
| majority_dc | 분할정복 majority: 반으로 재귀 → m1, m2 → m1 의 count 로 선택 (슬라이드 코드의 mid 인덱스 문제는 §1 대로 반으로 나누기로 수정). equals 호출 수 누적 (옵션 = n=8 [2,1,2,3,2,2,4,2] 전체 재귀 / 슬라이드 p.63 [0,1,2,3,4,5,2,2,2,2,2,2] 최상위 한 번만: m_left=5, m_right=2) | n=8: 왼쪽 [2,1,2,3] → 3, 오른쪽 [2,2,4,2] → 2, count(3)=1 ≤ 4 → **답 2**; equals 24 회 = n log₂n · 슬라이드: count(5)=1 ≤ 6 → m_right **2** (2 는 7 번 등장) | L6 p.55–66 (PNG 52–63) | `분할정복 majority`, `majority element`, `equals` |
| hash_chaining | 버킷 배열 + 체인(연결 리스트). INSERT 는 체인 끝에 O(1)(꼬리 포인터; 슬라이드 그림 순서 13→43), SEARCH 는 체인 길이만큼 훑기 (옵션 = p.28 h=일의 자리, n=9, INSERT 13,22,43,9, SEARCH 43 / p.34 게임 순서 INSERT 13,22,43,92,7, SEARCH 43, DELETE 92, SEARCH 7, INSERT 92 / p.57 적의 입력 {11,101,111,121,131,141} with H={h0=최상위 자리, h1=일의 자리} / p.70 $h_{2,1}$, U={0..4}, n=3) | p.28: 버킷2 [22], 버킷3 [13→43], 버킷9 [9], SEARCH 43 은 2 칸 훑음 · p.57: h0 이든 h1 이든 6개 전부 버킷 1 → search O(n) · p.70: f = [1,3,0,2,4] (x=0..4), h = f mod 3 = [1,0,0,2,1] → x=1,2 충돌, x=0,4 충돌 | L7 p.26–28, 34, 55–57 (PNG 26–28, 34, 53–55), p.70 (PNG 66) | `chaining`, `hash table`, `hash function`, `hash collision`, `h_{a,b}`, `해싱 게임` |
| universal_hash_check | ① 기대 버킷 크기 $1 + \sum_{j\ne i} P\{h(u_i)=h(u_j)\} = 1 + \frac{n-1}{n}$ 를 n 에 대해 계산 ② $h_{a,b}$ (p=5, n=3) 의 20 개 (a,b) 를 전부 나열해 각 쌍 x≠y 의 충돌 횟수 세기 (옵션 = 기대 버킷 크기 n=3 / n=10 / h_{a,b} 전수 조사) | n=3: 1 + 2/3 ≈ 1.67 ≤ 2 · n=10: 1.9 ≤ 2 · h_{a,b}: \|H\| = p(p−1) = 20, 모든 쌍 충돌 4/20 = 1/5 ≤ 1/n = 1/3 → universal | L7 p.41 (PNG 40), 59–72 (PNG 57–67) | `기대 버킷 크기`, `universal hash family`, `h_{a,b}`, `H의 크기`, `지표 확률변수`, `기대값의 선형성` |

(총 18 개. `test_sims.js` 는 모든 옵션 조합을 돌리므로 옵션 수를 3~8 개로 유지할 것.)

### 엔진 API (`src/sims/_engine.js`, 모든 sim 파일이 따를 것 — 참조 구현 `src/sims/_reference_ticket_lock.js.txt`)
```js
window.SIMS = window.SIMS || {};
SIMS["crc_division"] = {
  title: "CRC 나눗셈 — 1001000 ÷ 1011",
  desc: "한 줄 설명 (무엇을 보여주는지)",
  options: [ { key:"mode", label:"모드", values:[{value:"enc",label:"Encoder"},{value:"dec_ok",label:"Decoder (오류 없음)"}] } ],
  build(opts) {           // opts = {mode:"enc"} (기본값 = 각 option 의 첫 value)
    return {
      panels: [ { id:"P", title:"절차", lang:"txt", lines:["1. dataword 뒤에 000 붙이기","2. 최상위 비트가 1이면 1011 로 XOR","3. …"] }, ... ],
      vars:   [ { name:"dividend", group:"나눗셈" }, { name:"remainder", group:"나눗셈" }, ... ],   // 표시 순서
      steps:  [
        { desc:"설명 (인라인 위키문법 가능: '''굵게''', [[링크]])",
          pc: { P: 1 },                    // 패널별 현재 줄 (1-based, null=대기)
          vars: { dividend:"1001000", remainder:"?", ... },   // 전체 스냅샷 (엔진이 이전 step 과 diff 해서 바뀐 값 강조)
          status: { P:"running" },         // 선택. 패널 헤더에 배지
          note: "warn 텍스트 (선택, 빨간 박스)",
          svg: "<svg …>" 또는 function(step, i) → string (선택. 커스텀 그림)
        }, ...
      ]
    };
  }
};
```
(위 예시는 템플릿 과목의 것이다. 구조만 따르고, 이 과목의 이름은 §6 표의 것을 쓴다.)
엔진 동작 (`SimEngine.mount(containerEl, simName)`):
- 헤더(제목·설명) → 옵션 select 들(바꾸면 build 재실행, step 0) → 컨트롤(⏮ ◀ ▶ ⏭, ▶ 자동재생(속도), 슬라이더, "n / N") → 코드 패널 가로 나열(현재 줄 하이라이트, status 배지) → 변수표(그룹별, 바뀐 값 노란 배경 + 이전값 표시) → 설명 박스 → svg 영역.
- 이 과목은 **의사코드가 곧 패널**이다: 알고리즘 sim(insertion_sort_trace, merge_step, select_partition, counting_sort, bucket_sort, radix_sort, randomized_quicksort, majority_dc, hash_chaining)은 패널 lines 에 **슬라이드 코드를 한 줄씩 그대로** 넣고 pc 로 현재 줄을 가리킨다(lang:"c"). 증명·점화식 sim(loop_invariant_check, bigo_witness, recursion_tree_sum, master_method, substitution_method, geometric_expectation, universal_hash_check)은 패널 lines 에 "손으로 푸는 순서"(lang:"txt")를 적는다. 배열 상태는 svg 로 칸을 그리고 현재 인덱스·피벗·정렬된 구간을 색으로 강조(색은 §7 팔레트).
- 수식은 패널·vars 안에서 KaTeX 가 아니다 → `T(n) <= 2T(n/2) + cn`, `n^2`, `log2(n)` 처럼 평문. desc 에서는 인라인 위키문법만.
- 모바일에서 세로 배치. 키보드 ← → 지원. 각 sim 은 순수 데이터 + build 만 갖는다 (DOM 접근 금지). 난수를 쓰는 sim 은 **고정 피벗열/고정 시드**로 결정적으로 만든다(테스트가 매번 같은 결과를 기대).
- 자동 테스트: `src/test_sims.js` (node) 가 모든 sims 를 로드해 각 옵션 조합으로 build() 를 실행, steps.length>0 이고 pc 가 존재하는 패널 줄 범위 안인지 검사.

## 7. 움직이는 그림 (src/anims/*.js, `[[anim:이름|캡션]]`)

시뮬레이터(§6)가 "값을 한 단계씩 보는 디버거"라면, 움직이는 그림은 '''보고만 있어도 흐름이 들어오는 10초짜리 만화'''다.
문서에서는 보통 `{def}`/`{analogy}` 다음, `[[sim:]]` 앞에 둔다 — 먼저 그림으로 감을 잡고, 그다음 시뮬레이터로 값을 확인하는 순서.

### 파일 형식 (참조 구현: `src/anims/_reference_ctx_switch.js.txt` — 운체위키의 컨텍스트 스위치. 반드시 읽고 같은 구조로)
```js
window.ANIMS = window.ANIMS || {};
ANIMS["csma_cd_abort"] = {              // 이름 == 파일명(csma_cd_abort.js). 영문 소문자+밑줄
  title: "CSMA/CD — 충돌을 감지하고 중단하는 10초",
  desc: "한 줄 설명. 인라인 위키 문법([[링크]], '''굵게''') 허용",
  duration: 10,                         // 초. 엔진이 0→duration 을 반복 재생
  build: function () { return '<svg viewBox="0 0 760 330" xmlns="http://www.w3.org/2000/svg">…</svg>'; }
};
```
(위 예시 이름은 템플릿 과목의 것이다. 구조만 따르고, 이 과목의 이름은 아래 목록의 것을 쓴다.)
- `build()` 는 '''순수 문자열'''만 돌려준다. DOM 접근 금지 (`node src/test_anims.js` 가 document 없이 실행한다).
- 시간축은 '''SMIL''' (`<animate>`, `<animateTransform>`, `<animateMotion>`, `<set>`) 로만 만든다. CSS animation·JS 타이머 금지 — 엔진이 `svg.setCurrentTime(t)` 로 시간을 직접 움직이므로 SMIL 만 스크러버/배속/정지에 반응한다.
- 모든 애니메이션 요소는 `begin + dur ≤ duration`. `repeatCount="indefinite"` 를 쓰려면 `dur` 을 반드시 지정. `fill="freeze"` 로 마지막 상태를 유지.
- "t초~t'초에만 보이기"는 `opacity` 를 `values="0;0;1;1;0;0" keyTimes="0;a;a+0.02;b;b+0.02;1" dur="D s"` 로 (참조 구현의 `show()` 헬퍼). keyTimes 는 0 에서 시작해 1 로 끝나고 단조증가.
- `viewBox="0 0 760 H"` (H 는 260~380). `<svg>` 에 고정 `width`/`height` 쓰지 말 것 — CSS 가 100% 폭으로 맞춘다.
- 텍스트 안의 `<`, `>`, `&` 는 `&lt;` `&gt;` `&amp;` 로. (`a < b^d` → `a &lt; b^d`, `T(n) <= Cn` → `T(n) &lt;= Cn`)
- `<marker id>` 등 id 는 anim 이름을 접두어로 (`ms_arrow`) — 한 문서에 그림이 여럿 실린다.
- 크기 60KB 이하. 글자 크기 11~15px, 한국어 산문 + 영어 용어 (§4-1 그대로).
- 색 (이 과목용 팔레트 — 템플릿 규약의 역할만 바꿈): 배열 칸 기본 `#1d65b3`(연한 `#dbe8f7`), 정렬 완료·invariant 가 성립하는 구간·정답 `#2e9e4f`(`#dff3e4`), pivot·현재 원소(cur_value)·현재 자리 `#e09a40`(`#fdeec2`), 재귀 트리 노드·자료구조 틀·버킷 `#3b2f4a`(`#efe9f6`), 충돌·반례·worst-case·적(adversary) `#d6465f`, 보조 글씨·버려진 쪽 `#777`. 그래프 곡선: $T(n)$ `#1d65b3`, $c \cdot g(n)$ `#d6465f`, 보조선 `#777`.
- 구성 규칙: 맨 위 한 줄 '''단계 자막'''(지금 무슨 일이 일어나는지, 시간대별로 바뀜) → 가운데 그림 → 맨 아래 한 줄 '''요점'''. 자막 문장은 문서 본문의 표현과 일치시킬 것 (시험 답안에 그대로 쓸 수 있게).
- 시간 설계: 첫 1~2초는 초기 상태를 보여주고, 각 단계 1.5초 내외, 마지막 1.5초는 결과 상태 유지. 8~14초.
- 곡선(그래프)은 `<path d="M …">` 로 점을 20~40개 찍어 그린다. 계산은 build() 안에서 JS 로 해도 된다(순수 함수). 배열 값은 §6 표의 슬라이드 예제 값을 그대로 쓴다.

### 검증 (작성자가 반드시)
```sh
node src/test_anims.js                  # 계약 검사 (태그 균형, viewBox, SMIL 유무, begin+dur ≤ duration, 이스케이프)
python3 build.py                        # index.html 재생성 + 문서에서 안 쓰는 anim 경고
./shot.sh <이름> <초> [출력.png]         # headless Chrome 으로 t초에 멈춘 화면 캡처 → Read 로 열어 눈으로 확인
```
캡처는 최소 3개 시각(초반·중반·끝)에서 찍어 '''글자 겹침·잘림·화살표 방향·색 대비'''를 확인하고 고친 뒤에 끝낸다.
문서에 넣을 때는 `[[anim:이름|캡션]]` 한 줄, 캡션에는 "무엇을 보고 나서 무엇을 하라"를 쓴다.

### 목록 (이름 → 문서)
| 이름 | 내용 | 문서 |
|---|---|---|
| two_questions | 알고리즘 상자 하나에 두 질문 카드가 차례로: ① "Does it work?" → 증명 도구(loop invariant / recursion invariant / 귀납법) 가 붙음 ② "Is it fast?" → 도구(asymptotic analysis / 점화식 / expected running time) 가 붙음. 마지막에 L1~L7 알고리즘 이름이 두 칸에 채워짐 | `main`, `읽는 순서`, `두 가지 질문`, `L1 Algorithmic Analysis I` |
| insertion_card | 카드 놀이 비유: 왼손(정렬된 [4])에 카드 3,1,5,2 를 하나씩 집어 올바른 자리에 끼움. 큰 카드가 오른쪽으로 한 칸씩 밀리는 모습 (슬라이드 [4,3,1,5,2] → [1,2,3,4,5]) | `insertion sort`, `L1 Algorithmic Analysis I`, `삽입 한 번의 성질` |
| loop_invariant_flow | 3단 흐름: Initialization(A[:1] 정렬, 초록 1칸) → Maintenance(초록 구간이 1칸씩 늘며 "invariant 유지" 체크) → Termination(전체 초록 = 정렬 완료). 옆에 귀납법 4요소 라벨이 대응되어 켜짐 | `loop invariant`, `귀납법 4요소`, `Initialization/Maintenance/Termination`, `귀납법` |
| bigo_graph | 좌표평면에 $T(n)$(요동치는 곡선)과 $c \cdot g(n)$ 이 그려지고, n₀ 세로선이 오른쪽으로 이동하다 멈춤 → 그 이후 구간이 초록으로 칠해지며 "∀ n ≥ n₀, T(n) ≤ c·g(n)". 이어서 부등호가 뒤집혀 Big-Ω, 둘 다 → Big-Θ(샌드위치) | `Big-O`, `Big-Ω`, `Big-Θ`, `c와 n₀`, `L2 Algorithmic Analysis II` |
| divide_conquer_flow | Big 문제 상자가 Divide(둘로 쪼개짐 ×2 → ×4), Conquer(가장 작은 상자들이 풀림 ✓), Combine(아래서부터 합쳐져 올라옴) 3막 | `divide and conquer`, `L3 Divide and Conquer I`, `incremental approach와 parallel approach` |
| mergesort_split_merge | [8,4,1,5,3,2,6,7] 이 내려가며 1칸까지 쪼개지고(Recurse!), 올라오며 [4,8],[1,5],[2,3],[6,7] → [1,4,5,8],[2,3,6,7] → [1..8] 로 merge. 오른쪽에 깊이 = log₂8 = 3 | `mergesort`, `merge`, `recursion invariant` |
| recursion_tree_levels | T(n)=2T(n/2)+cn 재귀 트리가 한 레벨씩 자라고, 각 레벨 옆에 합 "cn" 이 채워짐 → 레벨 수 log₂n → 총합 cn log n + cn | `recursion tree method`, `iteration method`, `T(n)`, `점화식` |
| master_struggle | 줄다리기 3판: a > bᵈ (가지치기 승, 리프 쪽 막대가 굵어짐, bushy) / a = bᵈ (무승부, 레벨 막대가 모두 같음) / a < bᵈ (일의 크기 승, 루트 막대가 가장 굵음, tall and skinny). 예: 4T(n/2)+n, 2T(n/2)+n, T(n/2)+n | `master method 세 케이스`, `eternal struggle`, `bushy tree와 tall and skinny tree`, `master method` |
| pivot_partition | [1,64,9,49,16,4,0,25,36,81] 에서 피벗 36 이 주황으로 뽑히고 원소들이 좌(작음)·우(큼)로 흩어짐 → k=3 이라 오른쪽은 회색으로 버려짐 → 피벗 1 → 오른쪽으로 가며 k 가 3→1 로 바뀜 → 피벗 9, 답 | `select`, `pivot`, `partition_about_pivot`, `한쪽만 재귀`, `k-len(left)-1 보정` |
| mom_grid | 23개 원소가 5개씩 5열로 서고, 각 열이 세로 정렬되어 sub-median(가운데)에 동그라미 → 열들이 sub-median 순으로 가로 정렬 → 가운데 15 에 별 → "15 보다 확실히 작은" 왼쪽 위 영역 음영(3n/10) | `median of medians`, `3n/10 논증`, `sub-median`, `5개씩 그룹` |
| decision_tree_leaves | 원소 3개(a,b,c)의 비교 트리: 루트 "a ≤ b?" 에서 YES/NO 로 갈라져 3! = 6 개 리프(순열)가 생김 → 가장 긴 경로가 빨갛게 → "리프 ≥ n! 이면 깊이 ≥ log₂(n!) = Ω(n log n)" | `decision tree`, `Ω(n log n) 하한`, `log(n!)`, `리프와 깊이`, `comparison-based sorting` |
| counting_sort_flow | A=[0,0,3,1,1,3,1,0] 의 원소가 하나씩 counts[값] 칸으로 떨어져 막대가 3,3,0,2 로 자람 → counts 를 왼쪽부터 풀어 result [0,0,0,1,1,1,3,3] | `counting sort`, `counts 배열`, `Θ(n+k)` |
| radix_lsd | [31,5,210,14,95,477,555,125] 를 3자리로(031, 005 …) 두고 일의 자리 → 십의 자리 → 백의 자리 순으로 버킷 0–9 에 떨어졌다 모임. 현재 자리 숫자 주황 강조 | `radix sort`, `least-significant digit`, `make_pairs` |
| stable_sort | [1ᵃ, 3, 2, 1ᵇ] 에서 안정 정렬은 1ᵃ, 1ᵇ 순서 유지 / 불안정 정렬은 뒤바뀔 수 있음 → radix sort 두 번째 라운드에서 순서가 깨지면 결과가 틀리는 장면 | `stable sort`, `radix sort`, `bucket sort` |
| expected_vs_worst | 두 장면: Scenario 1 — 적(빨강)이 입력을 고르고, 내가 주사위를 굴림 → 수행 시간 분포 막대(기댓값 선) / Scenario 2 — 적이 입력 + 주사위 눈까지 고정 → 항상 최악 한 값(worst-case) | `두 시나리오`, `adversary`, `expected running time`, `randomized worst-case`, `L6 Randomized Algorithms I` |
| quicksort_random_pivot | [0,6,8,11,1,10,2,7,3,9,4,5] 에서 6 과 10 사이 값 {6,7,8,9,10} 이 강조 → 7 이 먼저 피벗으로 뽑히면 6 과 10 이 갈라져 영원히 비교 안 됨 / 6 이나 10 이 먼저면 비교됨 → P = 2/(10−6+1) = 2/5 | `randomized quicksort`, `X_{a,b}`, `P(X_{a,b}=1)`, `비교 횟수 세기` |
| harmonic_sum | 폭 1 막대 높이 1, 1/2, 1/3, … 1/n 이 차례로 서고, 그 위에 곡선 1/x 가 겹쳐 넓이 ≈ ln n → "$\sum 1/c \approx \ln n$ ⇒ 2n·ln n = O(n log n)" | `조화급수`, `quicksort 기대 비교 횟수 증명` |
| majority_random_pick | 절반 넘게 초록(majority)인 배열에서 무작위 화살이 떨어짐: 빨강(실패) → 다시, 초록(성공) → count 로 확인 → 반환. 옆에 1/2 + 1/4 + … = 2 누적 막대 | `랜덤 majority`, `majority element`, `기하분포`, `등비급수` |
| hash_pigeonhole | 거대한 universe U(M 개 점)를 n 개 버킷으로 보냄 → 어떤 버킷은 ≥ M/n 개 → 적이 그 버킷에서 n 개를 골라 입력 → 한 체인에 n 개가 매달려 search O(n) | `결정론적 해시 함수의 한계`, `비둘기집 원리`, `해싱 게임` |
| universal_hash_pick | 작은 H(쥐)에서 주사위로 a=2, b=1 을 뽑아 $h_{2,1}$ 생성 → U={0..4} 가 mod 5 원(충돌 없음, 전단사) → mod 3 버킷(여기서만 충돌) → 요점 "충돌 확률 ≤ 1/n, 저장 O(log M) 비트" | `universal hash family`, `h_{a,b}`, `hash family`, `소수 p`, `L7 Randomized Algorithms II` |

(총 20 개.)
