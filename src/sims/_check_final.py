# _check_final.py — 기말 sim 7종(dfs_trace, bfs_layers, scc_two_pass, dijkstra_trace,
# bellman_ford_table, fib_memo, floyd_warshall_table)의 기대 최종값 검산.
# 실행 (위키 루트에서): PYTHONIOENCODING=utf8 py -3.12 src/sims/_check_final.py > src/sims/_check_final.txt
INF = float("inf")
def fmt(x): return "inf" if x == INF else str(x)

# ---------------- DFS (L9 p.66–67 코드: start=t; t+=1; 자식 리턴 후 t+=1; finish=t) ----------------
def dfs_all(adj, order):
    st, fi, status, rev, forest = {}, {}, {v: "unvisited" for v in adj}, [], []
    def dfs(u, t, tree):
        st[u] = t; t += 1; status[u] = "in_progress"; tree.append(u)
        for v in adj[u]:
            if status[v] == "unvisited":
                t = dfs(v, t, tree); t += 1
        fi[u] = t; status[u] = "done"; rev.append(u)
        return t
    t = 0
    for s in order:
        if status[s] == "unvisited":
            tree = []; t = dfs(s, t, tree) + 1; forest.append(tree)
    return st, fi, rev, forest

DFS = {
  "lab (L9 p.23-38 미로 = p.49 A-G 그래프, 무방향)": ({
     "A": ["B", "E"], "B": ["A", "C", "D", "F"], "C": ["B", "G", "D"], "D": ["B", "C", "G"],
     "E": ["A"], "F": ["B", "G"], "G": ["C", "F", "D"]}, ["A"]),
  "topo (L9 p.68-75 DAG A->C, C->D, C->B, D->B)": ({"A": ["C"], "B": [], "C": ["D", "B"], "D": ["B"]}, ["A"]),
  "pkg (L9 p.59 패키지 DAG, dpkg 에서 시작)": ({
     "dpkg": ["libbz2", "tar", "coreutils", "multiarch"], "libbz2": ["libselinux1"],
     "libselinux1": ["multiarch"], "multiarch": [], "tar": [], "coreutils": ["libbz2", "libselinux1"]}, ["dpkg"]),
}
print("=== dfs_trace ===")
for name, (adj, order) in DFS.items():
    st, fi, rev, forest = dfs_all(adj, order)
    print(name)
    print("  start/finish:", ", ".join("%s %d/%d" % (v, st[v], fi[v]) for v in sorted(adj, key=lambda v: st[v])))
    print("  finish 내림차순(topological order):", " ".join(reversed(rev)))

# ---------------- BFS (L9 p.86 layer 버전) ----------------
BFS_ADJ = {"A": ["B", "E"], "B": ["A", "C", "F"], "C": ["B", "D", "G"], "D": ["C", "E", "G"],
           "E": ["A", "D"], "F": ["B", "G"], "G": ["C", "D", "F"]}
BIP_ADJ = {"A": ["B", "E"], "B": ["A", "C", "F"], "C": ["B", "G"], "D": ["E", "G"],
           "E": ["A", "D"], "F": ["B", "G"], "G": ["C", "D", "F"]}
def bfs(adj, s, check):
    L = [[s]]; seen = {s: 0}; parent = {s: None}
    i = 0
    while L[i]:
        L.append([])
        for u in L[i]:
            for v in adj[u]:
                if v not in seen:
                    seen[v] = i + 1; parent[v] = u; L[i + 1].append(v)
                elif check and seen[v] == seen[u]:
                    return L, parent, (u, v)
        i += 1
    return L[:-1], parent, None
print("\n=== bfs_layers ===")
for name, adj, chk in [("bfs (p.81-89 그래프)", BFS_ADJ, False), ("bip_no (p.101-110, C-D 있음)", BFS_ADJ, True), ("bip_yes (p.100 트리 그래프, C-D 없음)", BIP_ADJ, True)]:
    L, parent, bad = bfs(adj, "A", chk)
    print(name, "layers:", [l for l in L if l], "parent:", parent, "conflict:", bad)

# ---------------- SCC (L10 p.13–47) ----------------
G = {"DGIST": ["Wiki", "Puppy"], "Wiki": ["DGIST", "Puppy", "YouTube"], "Puppy": ["Google"],
     "Google": ["Puppy"], "YouTube": ["DGIST", "Puppy"], "KAIST": ["DGIST", "Puppy"]}
order1 = ["DGIST", "Wiki", "Puppy", "Google", "YouTube", "KAIST"]
st, fi, rev, forest = dfs_all(G, order1)
print("\n=== scc_two_pass ===")
print("1차 DFS:", ", ".join("%s %d/%d" % (v, st[v], fi[v]) for v in order1))
GT = {v: [] for v in G}
for u in G:
    for v in G[u]: GT[v].append(u)
for v in GT: GT[v].sort(key=lambda x: -fi[x])
print("G^T:", GT)
order2 = sorted(G, key=lambda v: -fi[v])
st2, fi2, rev2, forest2 = dfs_all(GT, order2)
print("2차 순서(finish 내림차순):", order2)
print("SCC (2차 DFS forest):", forest2)
for order1b in (["Google", "YouTube", "KAIST", "DGIST", "Wiki", "Puppy"],):
    st, fi, rev, forest = dfs_all(G, order1b)
    print("옵션 google 1차:", ", ".join("%s %d/%d" % (v, st[v], fi[v]) for v in order1))
    GT = {v: [] for v in G}
    for u in G:
        for v in G[u]: GT[v].append(u)
    for v in GT: GT[v].sort(key=lambda x: -fi[x])
    o2 = sorted(G, key=lambda v: -fi[v])
    print("  2차 순서:", o2, "SCC:", dfs_all(GT, o2)[3])

# ---------------- Dijkstra (L11 p.24–38) ----------------
GATES_E = [("Gates", "R1", 1), ("Gates", "HG", 25), ("R1", "E3", 1), ("R1", "HG", 22), ("E3", "Park", 4), ("Park", "HG", 20)]
V5 = ["Gates", "R1", "E3", "Park", "HG"]
def mk_dir(bi, di):
    adj = {v: [] for v in V5}
    for u, v, w in bi: adj[u].append((v, w)); adj[v].append((u, w))
    for u, v, w in di: adj[u].append((v, w))
    return adj
GATES = mk_dir(GATES_E, [])
NEG_OK = mk_dir([("Gates", "R1", 1), ("R1", "E3", 1), ("E3", "Park", 4), ("Park", "HG", 10)], [("Gates", "HG", 3), ("HG", "R1", -3)])
NEG_CYC = mk_dir([("Gates", "R1", 1), ("R1", "E3", 1), ("E3", "Park", 4), ("Park", "HG", 10)], [("Gates", "HG", -3), ("HG", "R1", -2)])
def dijkstra(adj, s):
    d = {v: INF for v in adj}; d[s] = 0; sure = []; log = []
    while len(sure) < len(adj):
        u = min((v for v in adj if v not in sure), key=lambda v: (d[v], V5.index(v)))
        for v, w in adj[u]:
            if d[u] + w < d[v]: d[v] = d[u] + w   # 슬라이드 코드: sure 이웃도 갱신 (not-sure 조건 없음)
        sure.append(u); log.append((u, dict(d)))
    return d, sure, log
print("\n=== dijkstra_trace ===")
for name, adj in [("slide (Gates 그래프)", GATES), ("neg (변형: Gates->HG 3, HG->R1 -3)", NEG_OK)]:
    d, sure, log = dijkstra(adj, "Gates")
    print(name, "sure 순서:", sure)
    for u, dd in log: print("   sure", u, "-> d =", [fmt(dd[v]) for v in V5])
    print("  final d:", [fmt(d[v]) for v in V5])

# ---------------- Bellman-Ford* (L12 p.8, 18: 행 단위, i = 0..n-1 -> d^(0..n)) ----------------
def bf(adj):
    inn = {v: [] for v in V5}
    for u in V5:
        for v, w in adj[u]: inn[v].append((u, w))
    rows = [{v: (0 if v == "Gates" else INF) for v in V5}]
    for i in range(len(V5)):
        p = rows[-1]
        rows.append({v: min([p[v]] + [p[u] + w for u, w in inn[v]]) for v in V5})
    return rows
print("\n=== bellman_ford_table ===  (열 순서", V5, ")")
for name, adj in [("pos (L11 p.71-75 / L12 p.9-14)", GATES), ("neg (변형, cycle 없음)", NEG_OK), ("cyc (L11 p.81-82 / L12 p.17 그래프 그대로)", NEG_CYC)]:
    rows = bf(adj)
    print(name)
    for i, r in enumerate(rows): print("   d(%d) =" % i, [fmt(r[v]) for v in V5])
    print("   d(n-1) == d(n)?", rows[-2] == rows[-1], "->", "OK" if rows[-2] == rows[-1] else "NEGATIVE CYCLE")

# ---------------- Fibonacci (L12 p.23–37, F(0)=F(1)=1) ----------------
calls = 0
def fib(n):
    global calls; calls += 1
    return 1 if n <= 1 else fib(n - 1) + fib(n - 2)
r = fib(8); print("\n=== fib_memo ===\nnaive Fib(8) =", r, "calls =", calls)
F = [1, 1] + [None] * 7; mc = 0; fill = []
def mfib(n):
    global mc; mc += 1
    if F[n] is not None: return F[n]
    F[n] = mfib(n - 1) + mfib(n - 2); fill.append(n); return F[n]
print("memo Fib(8) =", mfib(8), "calls =", mc, "fill order", fill, "F =", F)
B = [1, 1] + [None] * 7
for i in range(2, 9): B[i] = B[i - 1] + B[i - 2]
print("bottom-up F =", B, "덧셈 7회")

# ---------------- Floyd-Warshall (L12 p.53) ----------------
def fw(names, W):
    n = len(names); D = [[0 if i == j else W.get((names[i], names[j]), INF) for j in range(n)] for i in range(n)]
    out = [D]
    for k in range(n):
        P = out[-1]
        out.append([[min(P[u][v], P[u][k] + P[k][v]) for v in range(n)] for u in range(n)])
    return out
print("\n=== floyd_warshall_table ===")
WG = {}
for u, v, w in GATES_E: WG[(u, v)] = w; WG[(v, u)] = w
W4 = {(1, 2): 3, (1, 3): 8, (2, 4): 1, (3, 2): 4, (4, 1): 2, (4, 3): -5}
W4c = dict(W4); W4c[(4, 3)] = -6
for name, names, W in [("gates (Gates 그래프, 1=Gates 2=R1 3=E3 4=Park 5=HG)", V5, WG), ("dir4 (직접 만든 4정점 유향, 4->3 = -5)", [1, 2, 3, 4], W4), ("cyc4 (dir4 에서 4->3 = -6 -> cycle 3->2->4->3 = -1)", [1, 2, 3, 4], W4c)]:
    Ds = fw(names, W)
    print(name)
    for k, D in enumerate(Ds):
        ch = 0 if k == 0 else sum(1 for u in range(len(names)) for v in range(len(names)) if D[u][v] != Ds[k - 1][u][v])
        print("   D(%d)%s:" % (k, "" if k == 0 else " (바뀐 칸 %d)" % ch), [[fmt(x) for x in row] for row in D])
    print("   대각선 음수?", [names[i] for i in range(len(names)) if Ds[-1][i][i] < 0])
