# 검산: cut_from_residual — Gf 에서 s 가 닿는 집합 S, 건너는 간선, cut cost = flow 값
EX = {
 "p39": [("s","a",4,4),("s","b",8,1),("a","b",6,2),("a","t",2,2),("b","t",3,3)],
 "p14": [("s","A",4,4),("s","B",2,2),("s","C",6,5),("A","D",3,3),("A","B",2,0),("A","E",6,1),
         ("B","E",3,3),("B","C",2,0),("D","E",6,0),("D","t",4,3),("E","t",4,4),("E","F",6,0),
         ("F","B",3,1),("C","F",10,5),("F","t",4,4)],
}
for name, E in EX.items():
    V = sorted({x for e in E for x in e[:2]})
    # 보존 검사
    for v in V:
        if v in ("s", "t"): continue
        i = sum(f for a, b, c, f in E if b == v); o = sum(f for a, b, c, f in E if a == v)
        assert i == o, (name, v, i, o)
    val = sum(f for a, b, c, f in E if a == "s")
    def res(u, v):
        r = 0
        for a, b, c, f in E:
            if (a, b) == (u, v): r += c - f
            if (a, b) == (v, u): r += f
        return r
    S = {"s"}; q = ["s"]
    while q:
        u = q.pop(0)
        for v in V:
            if v not in S and res(u, v) > 0: S.add(v); q.append(v)
    fwd = [(a, b, c, f) for a, b, c, f in E if a in S and b not in S]
    bwd = [(a, b, c, f) for a, b, c, f in E if a not in S and b in S]
    cost = sum(c for a, b, c, f in fwd)
    print(name, "value", val, "S", sorted(S), "fwd", fwd, "bwd", bwd, "cost", cost)
    assert all(c == f for a, b, c, f in fwd) and all(f == 0 for a, b, c, f in bwd) and cost == val and "t" not in S
print("OK")
