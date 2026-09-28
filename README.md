# 알고위키 (Algo Wiki)

DGIST **CSE301 Introduction to Algorithms** (Prof. Hoon Sung Chwa, 교재 CLRS *Introduction to Algorithms*) 중간고사 범위 — L1 Algorithmic Analysis I, L2 Algorithmic Analysis II, L3 Divide and Conquer I, L4 Divide and Conquer II, L5 Linear-Time Sorting, L6 Randomized Algorithms I, L7 Randomized Algorithms II — 를 나무위키 스타일로 정리한 단일 페이지 위키.
의사코드가 나오는 곳마다 **한 단계씩 배열·변수가 바뀌는 시뮬레이터**(C 디버거처럼 ◀ ▶)가 붙어 있고, 핵심 아이디어마다 **저절로 도는 움직이는 그림(SVG 애니메이션)**과 **실제 강의 슬라이드 캡처**가 들어 있으며, 모든 기호(`T(n)`, `c`, `n₀`, `X_{a,b}`, `h_{a,b}` …)·용어는 사전 문서로 하이퍼링크된다.

**라이브**: https://ggoljunsa.github.io/algo-wiki/

## 범위

1. L1 Algorithmic Analysis I — insertion sort, 두 가지 질문(Does it work? / Is it fast?), loop invariant, 귀납법 4요소
2. L2 Algorithmic Analysis II — worst/best-case, asymptotic analysis, **Big-O/Ω/Θ 정의(c, n₀)**, O임을/O가 아님을 증명하기, 삽입 정렬의 worst/best-case
3. L3 Divide and Conquer I — mergesort·merge, recursion invariant, 점화식 T(n), **점화식 풀이 4가지**(recursion tree / iteration / master / substitution), eternal struggle
4. L4 Divide and Conquer II — selection 문제, select·partition, 피벗 시나리오 3종, **median of medians**, 3n/10 논증, T(n/5)+T(7n/10)+O(n) 치환법
5. L5 Linear-Time Sorting — comparison-based sorting, decision tree, **Ω(n log n) 하한**, counting sort, bucket sort, stable sort, radix sort
6. L6 Randomized Algorithms I — Las Vegas vs Monte Carlo, **expected vs worst-case 두 시나리오**, bogosort, randomized quicksort 기대 비교 횟수(X_{a,b}, 2/(b−a+1), 조화급수), randomized select, majority element
7. L7 Randomized Algorithms II — direct addressing, hash table with chaining, 결정론적 해시의 한계(비둘기집), uniformly random hash, 기대 버킷 크기, **universal hash family**, h_{a,b}

## 구조

```
.
├── index.html        # 생성물 (단일 HTML — CSS/JS/문서/시뮬레이터/애니메이션 전부 인라인)
├── images/           # 참조된 강의 슬라이드 캡처
├── build.py          # src/ → index.html (슬라이드 PNG 원본은 _slides/, git 제외)
├── shot.sh           # 애니메이션 검증용 headless Chrome 스크린샷 (./shot.sh <anim> <초>)
└── src/
    ├── CONTRACT.md   # 문법·문서 키·시뮬레이터/애니메이션 API 규약 (인쇄 번호↔PNG 번호 표 포함)
    ├── head.html     # CSS + 레이아웃
    ├── renderer.js   # 위키 문법 렌더러
    ├── sims/         # _engine.js + 시뮬레이터 (순수 데이터 + build())
    ├── anims/        # _anim_engine.js + 움직이는 그림 (SVG+SMIL, [[anim:이름]])
    └── articles/     # 문서 (.wiki, 파일당 1문서)
```

## 빌드

```sh
python3 build.py        # index.html 재생성, 깨진 링크/누락 이미지 보고
node src/test_sims.js   # 시뮬레이터 자동 검사
node src/test_anims.js  # 움직이는 그림 자동 검사 (태그 균형·SMIL·타이밍)
node src/test_render.js index.html   # 전 문서 렌더 → 원시 마크업 잔존 검사
```

슬라이드 PNG 가 없으면 (새 clone) 강의자료 PDF 에서 다시 만든다: `pdftoppm -r 90 -png "../강의자료/L3 _ Divide and Conquer I.pdf" _slides/L3` (덱 번호 ↔ PDF 대응과 **인쇄 번호 ↔ PNG 번호 표**는 `src/CONTRACT.md` §1; L3·L4 는 3자리 패딩으로 나오므로 100 미만은 2자리로 이름을 바꾼다).
문서 편집은 `src/articles/*.wiki`, 문법은 `src/CONTRACT.md` 참고.
애니메이션 하나만 특정 시각에 멈춰 보려면 `index.html?anim=master_struggle&animt=4`, 문서 안 전부를 멈추려면 `index.html?animt=4#문서키`.

## 출처

강의 슬라이드 이미지는 DGIST CSE301 (Prof. Hoon Sung Chwa) 강의 자료의 캡처이며 교육 목적의 학습 정리용이다. 학습 목적 비상업적 사용. 저작권은 원저작자에게 있다.
