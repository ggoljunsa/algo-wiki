# L15 sim 기대값 검산: prim_trace, kruskal_union_find
# 그래프 = L15 p.4 (무방향 9정점 14간선). 동점 순서는 슬라이드 연속 장면(PNG diff)에서 읽은 것.
#   Prim (p.28–35, p.52–65): A 시작. B 다음에 C(8) 와 H(8) 가 동점 → 슬라이드는 C. (정점 이름 알파벳순과 같다)
#   Kruskal (p.75–84, p.98–105): 2 는 C–I → G–F, 4 는 A–B → C–F, 7 은 C–D → H–I, 8 은 B–C → A–H 순.
#     p.80 은 I–G 6 을 칠했다가 "!!!!!" (cycle) 로 버린다.
EDGES = [("A","B",4),("A","H",8),("B","C",8),("B","H",11),("C","D",7),("C","I",2),("C","F",4),
         ("D","E",9),("D","F",14),("E","F",10),("H","I",7),("I","G",6),("H","G",1),("G","F",2)]
V = sorted({x for e in EDGES for x in e[:2]})
adj = {v: [] for v in V}
for u, v, w in EDGES:
    adj[u].append((v, w)); adj[v].append((u, w))

print("== prim_trace (start A) ==")
INF = float("inf")
k = {v: INF for v in V}; p = {v: None for v in V}; reached = set(); k["A"] = 0
mst = []; order = []
while len(reached) < len(V):
    u = min((v for v in V if v not in reached), key=lambda v: (k[v], v))
    ups = []
    for v, w in sorted(adj[u]):
        if v not in reached and w < k[v]:
            k[v] = w; p[v] = u; ups.append(f"{v}:{w}")
    reached.add(u); order.append(u)
    if p[u]: mst.append((p[u], u, k[u]))
    print(f"activate {u} (k={k[u]})  updates {' '.join(ups) or '-'}  MST+= {p[u]}-{u}" if p[u] else f"activate {u} (k=0)  updates {' '.join(ups)}")
print("reach order:", " ".join(order))
print("MST:", ", ".join(f"{a}-{b} {w}" for a, b, w in mst), " cost", sum(w for *_, w in mst))
print("final k:", {v: k[v] for v in V}); print("final p:", p)

print("\n== kruskal_union_find ==")
ORDER = [("H","G",1),("C","I",2),("G","F",2),("A","B",4),("C","F",4),("I","G",6),("C","D",7),("H","I",7),
         ("B","C",8),("A","H",8),("D","E",9),("E","F",10),("B","H",11),("D","F",14)]
assert sorted(ORDER, key=lambda e: e[2]) == ORDER and len(ORDER) == len(EDGES)
parent = {v: v for v in V}
def find(x):
    while parent[x] != x: x = parent[x]
    return x
T = []
for u, v, w in ORDER:
    ru, rv = find(u), find(v)
    if ru != rv:
        parent[rv] = ru; T.append((u, v, w)); tag = "add"
    else:
        tag = "skip (cycle)"
    sets = {}
    for x in V: sets.setdefault(find(x), []).append(x)
    print(f"{u}-{v} {w:>2}: {tag:<13} sets: {' '.join('{'+''.join(s)+'}' for s in sorted(sets.values()))}")
print("MST:", ", ".join(f"{a}-{b} {w}" for a, b, w in T), " cost", sum(w for *_, w in T))
P8 = {frozenset(("A","B")),frozenset(("B","C")),frozenset(("C","I")),frozenset(("C","D")),frozenset(("C","F")),frozenset(("D","E")),frozenset(("H","G")),frozenset(("G","F"))}
assert {frozenset(e[:2]) for e in mst} == P8 and {frozenset(e[:2]) for e in T} == P8
print("\nboth == p.8 MST (cost 37) OK")
