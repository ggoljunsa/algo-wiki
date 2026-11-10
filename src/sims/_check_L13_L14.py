# _check_L13_L14.py — L13·L14 sim 5종(lcs_table, knapsack_unbounded, knapsack_01,
# activity_selection, huffman_build)의 기대 최종값 검산.
# 실행 (위키 루트에서): python3 src/sims/_check_L13_L14.py > src/sims/_check_L13_L14.txt
import heapq

# ---------------- LCS (L13 p.18 + 역추적 p.24–30: 같으면 대각, C[i-1,j] >= C[i,j-1] 이면 위, 아니면 왼쪽) ----------------
def lcs(X, Y):
    m, n = len(X), len(Y)
    C = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            C[i][j] = C[i-1][j-1] + 1 if X[i-1] == Y[j-1] else max(C[i][j-1], C[i-1][j])
    i, j, out, path = m, n, [], []
    while i > 0 and j > 0:
        if X[i-1] == Y[j-1]:
            out.append(X[i-1]); path.append((i, j, "대각")); i -= 1; j -= 1
        elif C[i-1][j] >= C[i][j-1]:
            path.append((i, j, "위")); i -= 1
        else:
            path.append((i, j, "왼")); j -= 1
    return C, "".join(reversed(out)), path

print("=== lcs_table ===")
for X, Y in [("ACGGA", "ACTG"), ("ABCBDAB", "BDCABA")]:
    C, s, path = lcs(X, Y)
    print(X, Y, "길이", C[-1][-1], "LCS", s)
    for row in C: print("   ", row)
    print("   역추적:", path)

# ---------------- Unbounded knapsack (L13 p.49, i 순서대로, 엄격히 커질 때만 갱신) ----------------
def unbounded(W, w, v):
    K = [0] * (W + 1); I = [[] for _ in range(W + 1)]; upd = []
    for x in range(1, W + 1):
        for i in range(len(w)):
            if w[i] <= x and K[x - w[i]] + v[i] > K[x]:
                K[x] = K[x - w[i]] + v[i]; I[x] = I[x - w[i]] + [i + 1]; upd.append((x, i + 1, K[x]))
    return K, I, upd

print("\n=== knapsack_unbounded ===")
for name, W, w, v in [("slide p.50-57", 4, [1, 2, 3], [1, 4, 6]), ("p.36", 10, [6, 2, 4, 3, 11], [20, 8, 14, 13, 35])]:
    K, I, upd = unbounded(W, w, v)
    print(name, "K =", K, "ITEMS[W] =", I[W], "갱신(x,i,K):", upd)

# ---------------- 0/1 knapsack (L13 p.72, for x: for j:) ----------------
def zero_one(W, w, v):
    n = len(w); K = [[0] * (n + 1) for _ in range(W + 1)]
    for x in range(1, W + 1):
        for j in range(1, n + 1):
            K[x][j] = K[x][j-1]
            if w[j-1] <= x: K[x][j] = max(K[x][j], K[x - w[j-1]][j-1] + v[j-1])
    x, items = W, []
    for j in range(n, 0, -1):
        if K[x][j] != K[x][j-1]: items.append(j); x -= w[j-1]
    return K, sorted(items)

print("\n=== knapsack_01 ===")
for name, W, w, v in [("slide p.73-89", 3, [1, 2, 3], [1, 4, 6]), ("p.36", 10, [6, 2, 4, 3, 11], [20, 8, 14, 13, 35])]:
    K, items = zero_one(W, w, v)
    print(name, "K[W,n] =", K[W][len(w)], "items =", items, "무게 =", sum(w[j-1] for j in items))
    for j in range(len(w) + 1): print("    j=%d" % j, [K[x][j] for x in range(W + 1)])

# ---------------- Activity selection (L14 p.10–17, 그림에서 읽은 정수 시간) ----------------
print("\n=== activity_selection ===")
acts = {1: (2, 6), 2: (0, 5), 3: (13, 18), 4: (8, 13), 5: (6, 12), 6: (15, 22), 7: (19, 23)}
sel, f = [], -1
for a, (s, e) in sorted(acts.items(), key=lambda t: t[1][1]):
    ok = s >= f
    print("  a%d [%d,%d) %s" % (a, s, e, "선택" if ok else "버림 (s < f_last=%d)" % f))
    if ok: sel.append(a); f = e
print("선택:", ["a%d" % a for a in sel])

# ---------------- Huffman (L14 p.71–77) ----------------
print("\n=== huffman_build ===")
fr = {"A": 45, "B": 13, "C": 12, "D": 16, "E": 9, "F": 5}
h = [(v, k) for k, v in fr.items()]; heapq.heapify(h)
while len(h) > 1:
    a = heapq.heappop(h); b = heapq.heappop(h)
    print("  합침 %s(%d) + %s(%d) = %d" % (a[1], a[0], b[1], b[0], a[0] + b[0]))
    heapq.heappush(h, (a[0] + b[0], a[1] + b[1]))
for name, codes in [("p.76 그림", {"A": "0", "B": "100", "C": "101", "D": "110", "E": "1110", "F": "1111"}),
                    ("p.77 규칙 Z.left = X(작은 쪽)", {"A": "0", "C": "100", "B": "101", "F": "1100", "E": "1101", "D": "111"})]:
    print(name, codes, "기대 길이 =", sum(fr[k] * len(codes[k]) for k in fr) / 100)
