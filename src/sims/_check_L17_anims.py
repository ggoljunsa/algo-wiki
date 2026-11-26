# L17 움직이는 그림(anims/*flow*, *cut*, …)에 들어가는 숫자 검산. 결과는 _check_L17_anims.txt
from itertools import combinations
from collections import deque

V = "sABCDEFt"
E14 = {("s","A"):4,("s","B"):2,("s","C"):6,("A","D"):3,("A","B"):2,("A","E"):6,("B","E"):3,("B","C"):2,
       ("F","B"):3,("D","E"):6,("D","t"):4,("E","t"):4,("E","F"):6,("C","F"):10,("F","t"):4}
f11 = {("s","A"):4,("A","D"):2,("A","B"):1,("A","E"):1,("B","E"):1,("D","t"):2,("E","t"):2}
f14 = {("s","A"):4,("s","B"):2,("s","C"):5,("A","D"):3,("A","E"):1,("B","E"):3,("F","B"):1,("C","F"):5,
       ("D","t"):3,("E","t"):4,("F","t"):4}

def check_flow(E, f):
    for e,v in f.items(): assert e in E and 0 <= v <= E[e], e
    for x in "ABCDEF":
        i = sum(v for (a,b),v in f.items() if b==x); o = sum(v for (a,b),v in f.items() if a==x)
        assert i == o, (x,i,o)
    return sum(v for (a,b),v in f.items() if a=="s")

def cut(E, S, f=None):
    cost = sum(c for (a,b),c in E.items() if a in S and b not in S)
    if f is None: return cost
    fwd = sum(v for (a,b),v in f.items() if a in S and b not in S)
    back = sum(v for (a,b),v in f.items() if b in S and a not in S)
    return cost, fwd, back

out = []
out.append("p.11 flow value %d" % check_flow(E14, f11))
out.append("p.14 flow value %d" % check_flow(E14, f14))
allc = []
mid = "ABCDEF"
for k in range(7):
    for comb in combinations(mid, k):
        S = set("s") | set(comb)
        allc.append((cut(E14,S), "".join(sorted(comb))))
allc.sort()
out.append("cuts: %d, min %d, argmin %s" % (len(allc), allc[0][0], [c for c in allc if c[0]==allc[0][0]]))
out.append("cost histogram: %s" % sorted({c for c,_ in allc}))
for S in ["s", "sC", "sBCF", "sABCDEF", "sBC", "sA", "sAD"]:
    out.append("S={%s}: cost %d | p11 fwd/back %s | p14 fwd/back %s" % (S, cut(E14,set(S)), cut(E14,set(S),f11)[1:], cut(E14,set(S),f14)[1:]))

def residual(E, f):
    R = {}
    for (a,b),c in E.items():
        fv = f.get((a,b),0)
        if c-fv>0: R[(a,b)] = R.get((a,b),0)+c-fv
        if fv>0: R[(b,a)] = R.get((b,a),0)+fv
    return R
def reach(R, s="s"):
    seen=[s]; q=deque([s])
    while q:
        u=q.popleft()
        for (a,b),c in sorted(R.items()):
            if a==u and c>0 and b not in seen: seen.append(b); q.append(b)
    return seen
R = residual(E14, f14)
out.append("p.14 Gf reach order (BFS) %s" % reach(R))
# p.39 example
E39 = {("s","a"):4,("s","b"):8,("a","b"):6,("a","t"):2,("b","t"):3}
f39 = {("s","a"):4,("s","b"):1,("a","b"):2,("a","t"):2,("b","t"):3}
out.append("p.39 value %d, Gf %s, reach %s, cut %s" % (check_flow(E39,f39), sorted(residual(E39,f39).items()), reach(residual(E39,f39)), cut(E39,set("sab"))))
f22 = {("s","a"):3,("s","b"):1,("a","b"):1,("a","t"):2,("b","t"):2}
out.append("p.22 value %d, Gf %s" % (check_flow(E39,f22), sorted(residual(E39,f22).items())))
# p.32-34
E32 = {("s","a"):4,("s","b"):3,("b","a"):6,("a","t"):2,("b","t"):3}
f32 = {("s","a"):1,("s","b"):1,("b","a"):1,("a","t"):2,("b","t"):0}
g32 = {("s","a"):2,("s","b"):1,("b","a"):0,("a","t"):2,("b","t"):1}
out.append("p.32 before %d Gf %s" % (check_flow(E32,f32), sorted(residual(E32,f32).items())))
out.append("p.34 after  %d Gf %s" % (check_flow(E32,g32), sorted(residual(E32,g32).items())))
# FF on 11-edge graph p.43
E43 = {k:v for k,v in E14.items() if k not in [("A","B"),("B","C"),("D","E"),("E","F")]}
paths = [("sAEt",4),("sCFt",4),("sBEADt",2),("sCFBEADt",1)]
f = {}
for p,x in paths:
    R = residual(E43,f)
    xs = [R.get((p[i],p[i+1]),0) for i in range(len(p)-1)]
    assert min(xs)==x, (p,xs)
    for i in range(len(p)-1):
        a,b=p[i],p[i+1]
        if (a,b) in E43: f[(a,b)]=f.get((a,b),0)+x
        else: f[(b,a)]-=x
    out.append("path %s residuals %s x=%d value %d" % (p, xs, x, check_flow(E43,{k:v for k,v in f.items() if v})))
R = residual(E43,f); out.append("final f %s" % sorted((k,v) for k,v in f.items() if v))
out.append("final reach %s, cut %d" % (reach(R), cut(E43,set(reach(R)))))
for i,(p,x) in enumerate(paths):
    pass
# matching
M = {"x1":["y1","y2"],"x2":["y1"],"x3":["y1","y4"],"x4":["y3","y4","y5"],"x5":["y2"]}
Em = {}
for x,ys in M.items():
    Em[("s",x)]=1
    for y in ys: Em[(x,y)]=1
for y in ["y1","y2","y3","y4","y5"]: Em[(y,"t")]=1
fm={}
for p in [["s","x1","y1","t"],["s","x2","y1","x1","y2","t"],["s","x3","y4","t"],["s","x4","y3","t"]]:
    R=residual(Em,fm)
    assert all(R.get((p[i],p[i+1]),0)>=1 for i in range(len(p)-1)), p
    for i in range(len(p)-1):
        a,b=p[i],p[i+1]
        if (a,b) in Em: fm[(a,b)]=fm.get((a,b),0)+1
        else: fm[(b,a)]-=1
R=residual(Em,fm)
def reach2(R):
    seen=["s"];q=deque(["s"])
    while q:
        u=q.popleft()
        for (a,b),c in R.items():
            if a==u and c>0 and b not in seen: seen.append(b);q.append(b)
    return seen
out.append("matching %s, t reachable after 4 paths: %s" % (sorted(k for k,v in fm.items() if v and k[0][0]=="x"), "t" in reach2(R)))
open(__file__.replace(".py",".txt"),"w",encoding="utf-8").write("\n".join(out)+"\n")
print("\n".join(out))
